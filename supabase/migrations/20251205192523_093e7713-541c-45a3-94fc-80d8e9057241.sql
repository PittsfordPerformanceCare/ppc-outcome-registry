-- Ensure RLS is enabled and policies are strict for intake_progress
ALTER TABLE public.intake_progress ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies and recreate with strict access
DROP POLICY IF EXISTS "Only authenticated clinicians can view intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "Authenticated users can insert intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "Authenticated users can update intake progress" ON public.intake_progress;

-- Only authenticated clinicians can SELECT
CREATE POLICY "Clinicians can view intake progress"
ON public.intake_progress
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()));

-- Only service role can INSERT (edge functions)
CREATE POLICY "Service role can insert intake progress"
ON public.intake_progress
FOR INSERT
TO service_role
WITH CHECK (true);

-- Only service role can UPDATE
CREATE POLICY "Service role can update intake progress"
ON public.intake_progress
FOR UPDATE
TO service_role
USING (true);

-- Ensure RLS is enabled for intake_forms
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;

-- Drop and recreate intake_forms policies
DROP POLICY IF EXISTS "Anyone can submit intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Public can submit new intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Authenticated clinicians can view intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Authenticated clinicians can update intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Admins can delete intake forms" ON public.intake_forms;

-- Public can submit intake forms (required for patient intake flow)
CREATE POLICY "Public can submit intake forms"
ON public.intake_forms
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated clinicians can view
CREATE POLICY "Clinicians can view intake forms"
ON public.intake_forms
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()));

-- Only authenticated clinicians can update
CREATE POLICY "Clinicians can update intake forms"
ON public.intake_forms
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()));

-- Only admins can delete
CREATE POLICY "Admins can delete intake forms"
ON public.intake_forms
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));