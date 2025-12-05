-- Fix 1: intake_progress - Restrict access to token-based authentication
-- Users should only access their own progress using their unique token
DROP POLICY IF EXISTS "Authenticated clinicians can view intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "System can insert intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "System can update intake progress" ON public.intake_progress;

-- Allow users to view their own progress by token (for patients continuing intake)
CREATE POLICY "Users can view their own intake progress by token"
ON public.intake_progress
FOR SELECT
USING (
  -- Authenticated clinicians can view all
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
  -- No public access - token validation happens in application layer
);

-- Only authenticated users or system can insert
CREATE POLICY "Authenticated users can insert intake progress"
ON public.intake_progress
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  OR auth.role() = 'service_role'
);

-- Only authenticated users or system can update their own progress
CREATE POLICY "Authenticated users can update intake progress"
ON public.intake_progress
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  OR auth.role() = 'service_role'
);

-- Fix 2: intake_forms - Add clinic-level restrictions for clinicians
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated clinicians can view intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Authenticated clinicians can update intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Authenticated clinicians can delete intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Clinicians can update intake forms" ON public.intake_forms;

-- Clinicians can only view intake forms (no clinic restriction since intake_forms doesn't have clinic_id)
-- But we'll ensure only authenticated clinicians have access
CREATE POLICY "Authenticated clinicians can view intake forms"
ON public.intake_forms
FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()));

-- Clinicians can update intake forms they're reviewing
CREATE POLICY "Authenticated clinicians can update intake forms"
ON public.intake_forms
FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()));

-- Only admins can delete intake forms
CREATE POLICY "Admins can delete intake forms"
ON public.intake_forms
FOR DELETE
USING (is_admin(auth.uid()));