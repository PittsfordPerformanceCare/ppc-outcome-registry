
-- =====================================================
-- SECURITY FIX: Harden RLS policies on sensitive tables
-- =====================================================

-- 1. FIX PROFILES TABLE: Remove policies that allow public role access
-- Keep only authenticated user access with proper role checks

-- Drop existing overly permissive policies on profiles
DROP POLICY IF EXISTS "Admins can view clinic profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or same clinic profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate with proper authenticated role restriction
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view clinic profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) 
  AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
);

CREATE POLICY "Same clinic users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  clinic_id IS NOT NULL 
  AND clinic_id = get_user_clinic_id(auth.uid())
);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. FIX INTAKE_FORMS TABLE: Ensure all SELECT policies require authentication
-- Drop duplicate/conflicting policies first

DROP POLICY IF EXISTS "Clinicians and admins can view intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Only clinicians and admins can view intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Clinicians and admins can update intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Only clinicians and admins can update intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Only clinicians and admins can delete intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Admins can delete intake forms" ON public.intake_forms;

-- Recreate with explicit authentication checks (TO authenticated)
CREATE POLICY "Clinicians and admins can view intake forms"
ON public.intake_forms
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'clinician'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Clinicians and admins can update intake forms"
ON public.intake_forms
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'clinician'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete intake forms"
ON public.intake_forms
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- 3. FIX PATIENT_ACCOUNTS TABLE: Consolidate and secure policies

DROP POLICY IF EXISTS "Patient can view own account" ON public.patient_accounts;
DROP POLICY IF EXISTS "Clinicians view patient accounts for assigned episodes" ON public.patient_accounts;
DROP POLICY IF EXISTS "Assigned clinician or admin can view patient accounts" ON public.patient_accounts;
DROP POLICY IF EXISTS "Patients can update own account" ON public.patient_accounts;
DROP POLICY IF EXISTS "System can insert patient accounts" ON public.patient_accounts;

-- Recreate with proper TO authenticated restriction
CREATE POLICY "Patient can view own account"
ON public.patient_accounts
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Clinicians view patient accounts for assigned episodes"
ON public.patient_accounts
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) 
  OR EXISTS (
    SELECT 1
    FROM patient_episode_access pea
    JOIN episodes e ON e.id = pea.episode_id
    WHERE pea.patient_id = patient_accounts.id 
    AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update own account"
ON public.patient_accounts
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow system/service role to insert patient accounts (for registration flows)
CREATE POLICY "Authenticated users can insert own patient account"
ON public.patient_accounts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
