-- Fix security definer view by recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.stalled_communication_tasks;

-- Recreate as regular view (uses invoker's permissions)
CREATE VIEW public.stalled_communication_tasks AS
SELECT 
  ct.*,
  p.full_name as clinician_name,
  EXTRACT(DAY FROM (now() - ct.status_changed_at)) as days_in_status
FROM public.communication_tasks ct
LEFT JOIN public.profiles p ON ct.assigned_clinician_id = p.id
WHERE ct.status IN ('WAITING_ON_CLINICIAN', 'BLOCKED')
  AND ct.status_changed_at < (now() - (ct.stall_threshold_days || ' days')::interval)
  AND ct.completed_at IS NULL;