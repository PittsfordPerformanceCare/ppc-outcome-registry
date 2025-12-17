-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Clinicians and admins can create tasks" ON public.communication_tasks;

-- Create a new INSERT policy with TO authenticated clause
CREATE POLICY "Clinicians and admins can create tasks" 
ON public.communication_tasks 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('clinician'::app_role, 'admin'::app_role)
  )
);