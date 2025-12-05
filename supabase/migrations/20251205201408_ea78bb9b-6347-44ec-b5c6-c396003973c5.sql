-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Staff can view intake forms" ON public.intake_forms;

-- Create a more restrictive policy that only allows clinicians and admins to view intake forms
-- Patients should NOT be able to see intake forms
CREATE POLICY "Clinicians and admins can view intake forms" 
ON public.intake_forms 
FOR SELECT 
USING (
  -- User must be authenticated AND have either clinician or admin role
  auth.uid() IS NOT NULL 
  AND (
    public.has_role(auth.uid(), 'clinician') 
    OR public.has_role(auth.uid(), 'admin')
  )
);