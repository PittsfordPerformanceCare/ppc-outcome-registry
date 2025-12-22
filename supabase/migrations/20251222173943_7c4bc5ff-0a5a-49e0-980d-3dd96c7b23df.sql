-- Create table for patient discharge letter tasks (Phase 4A)
CREATE TABLE public.patient_discharge_letter_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id UUID NOT NULL,
  draft_generated_at TIMESTAMP WITH TIME ZONE,
  draft_letter JSONB,
  care_targets_plain_language JSONB,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES public.profiles(id),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(episode_id)
);

-- Enable RLS
ALTER TABLE public.patient_discharge_letter_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for clinicians to manage patient discharge letters
CREATE POLICY "Authenticated users can view patient discharge letter tasks"
ON public.patient_discharge_letter_tasks
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert patient discharge letter tasks"
ON public.patient_discharge_letter_tasks
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update patient discharge letter tasks"
ON public.patient_discharge_letter_tasks
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patient_discharge_letter_tasks_updated_at
BEFORE UPDATE ON public.patient_discharge_letter_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for fast lookups by episode
CREATE INDEX idx_patient_discharge_letter_tasks_episode_id 
ON public.patient_discharge_letter_tasks(episode_id);

-- Add comment for documentation
COMMENT ON TABLE public.patient_discharge_letter_tasks IS 'Phase 4A: Patient-facing episode discharge letter tasks with clinician confirmation workflow';