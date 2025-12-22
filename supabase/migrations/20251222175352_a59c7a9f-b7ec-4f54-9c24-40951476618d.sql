-- Create table for care target discharge message tasks (Phase 4B)
CREATE TABLE public.care_target_discharge_message_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id TEXT NOT NULL,
  care_target_id UUID NOT NULL,
  draft_message TEXT,
  care_target_name_plain TEXT,
  remaining_active_targets_plain TEXT[],
  draft_generated_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one message per care target per episode
  CONSTRAINT unique_care_target_message_per_episode UNIQUE (episode_id, care_target_id)
);

-- Enable Row Level Security
ALTER TABLE public.care_target_discharge_message_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clinicians using has_role function
CREATE POLICY "Clinicians can view care target discharge message tasks"
ON public.care_target_discharge_message_tasks
FOR SELECT
USING (
  has_role(auth.uid(), 'clinician') OR 
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Clinicians can insert care target discharge message tasks"
ON public.care_target_discharge_message_tasks
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'clinician') OR 
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Clinicians can update care target discharge message tasks"
ON public.care_target_discharge_message_tasks
FOR UPDATE
USING (
  has_role(auth.uid(), 'clinician') OR 
  has_role(auth.uid(), 'admin')
);

-- Create trigger for updated_at
CREATE TRIGGER update_care_target_discharge_message_tasks_updated_at
BEFORE UPDATE ON public.care_target_discharge_message_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_care_target_discharge_message_tasks_episode_id 
ON public.care_target_discharge_message_tasks(episode_id);

CREATE INDEX idx_care_target_discharge_message_tasks_care_target_id 
ON public.care_target_discharge_message_tasks(care_target_id);