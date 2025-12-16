-- Drop the existing view first to recreate with correct columns
DROP VIEW IF EXISTS public.stalled_communication_tasks;

-- Recreate view for stalled communication tasks (passive surfacing)
CREATE VIEW public.stalled_communication_tasks AS
SELECT 
  ct.*,
  p.full_name as clinician_name,
  EXTRACT(DAY FROM (now() - ct.status_changed_at)) as days_in_status
FROM public.communication_tasks ct
LEFT JOIN public.profiles p ON p.id = ct.assigned_clinician_id
WHERE ct.status IN ('WAITING_ON_CLINICIAN', 'BLOCKED')
  AND ct.completed_at IS NULL
  AND ct.stall_detected_at IS NOT NULL
ORDER BY ct.stall_detected_at ASC;

-- Grant access to authenticated users
GRANT SELECT ON public.stalled_communication_tasks TO authenticated;

-- Add index for efficient stall queries if not exists
CREATE INDEX IF NOT EXISTS idx_communication_tasks_stall 
ON public.communication_tasks (status, completed_at, stall_detected_at, status_changed_at)
WHERE status IN ('WAITING_ON_CLINICIAN', 'BLOCKED') AND completed_at IS NULL;