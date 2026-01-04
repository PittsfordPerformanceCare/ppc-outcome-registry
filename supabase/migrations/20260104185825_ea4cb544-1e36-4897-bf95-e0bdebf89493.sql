-- Add INSERT policy for audit_logs so authenticated users can create audit entries
CREATE POLICY "Authenticated users can create audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);