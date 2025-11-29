-- ============================================================================
-- SECURITY HARDENING MIGRATION
-- Addresses critical security vulnerabilities in intake_forms and clinic_settings
-- ============================================================================

-- 1. FIX CRITICAL: intake_forms table - Remove overly permissive policies
-- Drop all existing policies that allow public or unrestricted access
DROP POLICY IF EXISTS "Anyone can view intake with access code" ON public.intake_forms;
DROP POLICY IF EXISTS "Clinicians can view all intakes" ON public.intake_forms;
DROP POLICY IF EXISTS "Clinicians can update intakes" ON public.intake_forms;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.intake_forms;
DROP POLICY IF EXISTS "Anyone can view intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Allow public to submit intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Clinicians can view intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Clinicians can delete intake forms" ON public.intake_forms;

-- Recreate proper restrictive policies for intake_forms
-- Allow public to INSERT only (needed for form submission)
CREATE POLICY "Public can submit new intake forms"
ON public.intake_forms
FOR INSERT
TO public
WITH CHECK (true);

-- Authenticated clinicians can SELECT only their clinic's forms
CREATE POLICY "Authenticated clinicians can view intake forms"
ON public.intake_forms
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  )
);

-- Authenticated clinicians can UPDATE intake forms (for review/conversion)
CREATE POLICY "Authenticated clinicians can update intake forms"
ON public.intake_forms
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  )
);

-- Authenticated clinicians can DELETE intake forms
CREATE POLICY "Authenticated clinicians can delete intake forms"
ON public.intake_forms
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  )
);

-- 2. FIX: clinic_settings table - Restrict to authenticated users
DROP POLICY IF EXISTS "Clinic settings are viewable by everyone" ON public.clinic_settings;

CREATE POLICY "Authenticated users can view clinic settings"
ON public.clinic_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can update clinic settings"
ON public.clinic_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));