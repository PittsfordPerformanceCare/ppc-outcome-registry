-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Clinicians and admins can create tasks" ON public.communication_tasks;

-- Create a new INSERT policy that directly checks user_roles
CREATE POLICY "Clinicians and admins can create tasks" 
ON public.communication_tasks 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('clinician', 'admin')
  )
);