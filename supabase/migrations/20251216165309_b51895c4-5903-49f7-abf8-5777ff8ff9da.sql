-- Fix SECURITY DEFINER view by setting security_invoker = true
-- This ensures RLS policies of the querying user are enforced
ALTER VIEW public.stalled_communication_tasks SET (security_invoker = true);