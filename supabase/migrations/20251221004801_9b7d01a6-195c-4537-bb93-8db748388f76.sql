
-- ================================================
-- SECURITY FIX: Critical Patient Data Protection
-- ================================================

-- 1. FIX EPISODES TABLE
-- Remove overly permissive policy that allows all clinicians to view all episodes
DROP POLICY IF EXISTS "Users can view their own episodes" ON public.episodes;

-- The existing "Assigned clinician or admin can view episodes" policy is correct
-- It already restricts to user_id = auth.uid() OR is_admin()

-- 2. FIX PATIENT_ACCOUNTS TABLE
-- Remove the email enumeration vulnerability
DROP POLICY IF EXISTS "Patients view own account by email" ON public.patient_accounts;

-- Remove duplicate/overly permissive policies
DROP POLICY IF EXISTS "Patients can view own account" ON public.patient_accounts;

-- Keep only the strict policies:
-- - "Patient can view own account" (id = auth.uid())
-- - "Assigned clinician or admin can view patient accounts" (via episode access)
-- - "Clinicians view patient accounts for assigned episodes" (via episode access)

-- 3. TIGHTEN INTAKE_FORMS - ensure no public SELECT
-- The current policies look correct, but let's verify by dropping any that target 'public' role for SELECT
-- and ensure only authenticated clinicians/admins can view

-- First drop any conflicting policies
DROP POLICY IF EXISTS "Clinicians and admins can view intake forms" ON public.intake_forms;

-- Recreate a clean SELECT policy with explicit role check
CREATE POLICY "Clinicians and admins can view intake forms"
  ON public.intake_forms
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'clinician'::app_role) 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'owner'::app_role)
  );
