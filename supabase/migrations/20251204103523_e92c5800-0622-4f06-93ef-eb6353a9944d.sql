-- Add PCP summary tracking fields to episodes table
ALTER TABLE public.episodes 
ADD COLUMN IF NOT EXISTS pcp_summary_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pcp_summary_sent_at TIMESTAMP WITH TIME ZONE;

-- Create pcp_summary_tasks table
CREATE TABLE public.pcp_summary_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id TEXT NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  clinician_name TEXT,
  discharge_date DATE NOT NULL,
  region TEXT,
  pcp_name TEXT,
  pcp_contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_by UUID REFERENCES auth.users(id),
  notes TEXT,
  clinic_id UUID REFERENCES public.clinics(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE(episode_id)
);

-- Enable RLS
ALTER TABLE public.pcp_summary_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for pcp_summary_tasks
CREATE POLICY "Users can view their own clinic's pcp summary tasks"
ON public.pcp_summary_tasks
FOR SELECT
USING (
  auth.uid() = user_id OR
  clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can create pcp summary tasks"
ON public.pcp_summary_tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clinic's pcp summary tasks"
ON public.pcp_summary_tasks
FOR UPDATE
USING (
  auth.uid() = user_id OR
  clinic_id IN (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
);

-- Index for efficient querying
CREATE INDEX idx_pcp_summary_tasks_status ON public.pcp_summary_tasks(status);
CREATE INDEX idx_pcp_summary_tasks_episode_id ON public.pcp_summary_tasks(episode_id);

-- Trigger to update updated_at
CREATE TRIGGER update_pcp_summary_tasks_updated_at
BEFORE UPDATE ON public.pcp_summary_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create PCP summary task on discharge
CREATE OR REPLACE FUNCTION public.create_pcp_summary_task_on_discharge()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when discharge_date is set for the first time
  -- and pcp_summary_generated_at is NULL (no task created yet)
  IF NEW.discharge_date IS NOT NULL 
     AND OLD.discharge_date IS NULL 
     AND NEW.pcp_summary_generated_at IS NULL THEN
    
    -- Create the task
    INSERT INTO public.pcp_summary_tasks (
      episode_id,
      patient_name,
      clinician_name,
      discharge_date,
      region,
      user_id,
      clinic_id
    )
    VALUES (
      NEW.id,
      NEW.patient_name,
      NEW.clinician,
      NEW.discharge_date::DATE,
      NEW.region,
      NEW.user_id,
      NEW.clinic_id
    )
    ON CONFLICT (episode_id) DO NOTHING;
    
    -- Mark the episode as having had the task created
    NEW.pcp_summary_generated_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on episodes table
CREATE TRIGGER trigger_pcp_summary_task_on_discharge
BEFORE UPDATE ON public.episodes
FOR EACH ROW
EXECUTE FUNCTION public.create_pcp_summary_task_on_discharge();