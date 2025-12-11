-- Create enum types for communication tasks (skip task_status as it exists)
DO $$ BEGIN
  CREATE TYPE public.task_type AS ENUM (
    'CALL_BACK',
    'EMAIL_REPLY',
    'IMAGING_REPORT',
    'PATIENT_MESSAGE',
    'LETTER',
    'OTHER_ACTION'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.task_source AS ENUM (
    'ADMIN',
    'CLINICIAN',
    'PATIENT_PORTAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.task_priority AS ENUM (
    'HIGH',
    'NORMAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create communication_tasks table using TEXT for status (more flexible)
CREATE TABLE public.communication_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  episode_id TEXT,
  assigned_clinician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type task_type NOT NULL,
  source task_source NOT NULL,
  description TEXT NOT NULL,
  priority task_priority NOT NULL DEFAULT 'NORMAL',
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED')),
  due_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 day'),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  letter_subtype TEXT,
  letter_file_url TEXT,
  patient_message_id UUID,
  patient_name TEXT
);

-- Create indexes for efficient querying
CREATE INDEX idx_communication_tasks_clinician_status_due 
  ON public.communication_tasks(assigned_clinician_id, status, due_at);
CREATE INDEX idx_communication_tasks_episode 
  ON public.communication_tasks(episode_id);
CREATE INDEX idx_communication_tasks_patient 
  ON public.communication_tasks(patient_id);

-- Enable RLS
ALTER TABLE public.communication_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clinicians can view their own tasks"
  ON public.communication_tasks
  FOR SELECT
  USING (
    assigned_clinician_id = auth.uid() 
    OR is_admin(auth.uid())
    OR (created_by = auth.uid())
  );

CREATE POLICY "Clinicians and admins can create tasks"
  ON public.communication_tasks
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'clinician') 
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can update tasks"
  ON public.communication_tasks
  FOR UPDATE
  USING (
    assigned_clinician_id = auth.uid() 
    OR is_admin(auth.uid())
  );

CREATE POLICY "Only admins can delete tasks"
  ON public.communication_tasks
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_communication_tasks_updated_at
  BEFORE UPDATE ON public.communication_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();