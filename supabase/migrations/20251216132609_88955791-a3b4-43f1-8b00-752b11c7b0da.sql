-- Add new columns to communication_tasks
ALTER TABLE public.communication_tasks 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'CLINICAL_EXECUTION',
ADD COLUMN IF NOT EXISTS cancelled_reason text,
ADD COLUMN IF NOT EXISTS status_changed_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS admin_acknowledged_at timestamp with time zone;

-- Add comments for documentation
COMMENT ON COLUMN public.communication_tasks.status IS 'Task status: OPEN, IN_PROGRESS, WAITING_ON_CLINICIAN, WAITING_ON_PATIENT, BLOCKED, COMPLETED, CANCELLED';
COMMENT ON COLUMN public.communication_tasks.category IS 'Task category: CLINICAL_EXECUTION, ADMIN_EXECUTION, COORDINATION';

-- Create task notes table for comment thread
CREATE TABLE IF NOT EXISTS public.communication_task_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.communication_tasks(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  note text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on task notes
ALTER TABLE public.communication_task_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for task notes (admin and clinicians can view/create)
CREATE POLICY "Users can view task notes for their tasks"
ON public.communication_task_notes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.communication_tasks ct
    WHERE ct.id = task_id
    AND (ct.assigned_clinician_id = auth.uid() OR ct.created_by = auth.uid())
  )
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Users can create task notes"
ON public.communication_task_notes FOR INSERT
WITH CHECK (author_id = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_task_notes_task_id ON public.communication_task_notes(task_id);
CREATE INDEX IF NOT EXISTS idx_communication_tasks_status ON public.communication_tasks(status);
CREATE INDEX IF NOT EXISTS idx_communication_tasks_category ON public.communication_tasks(category);