
-- =====================================================
-- SECURITY FIX: Restrict access to sensitive data
-- =====================================================

-- 1. FIX PROFILES TABLE: Restrict to only own profile, admins, or same clinic (require auth)
DROP POLICY IF EXISTS "Users can view own profile or admin views all" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile or same clinic profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    id = auth.uid() OR
    is_admin(auth.uid()) OR
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  )
);

-- 2. FIX NEUROLOGIC_EXAMS: Restrict to assigned clinician only (not whole clinic)
DROP POLICY IF EXISTS "Episode owner or admin can select neurologic exams" ON public.neurologic_exams;

CREATE POLICY "Assigned clinician or admin can view neurologic exams"
ON public.neurologic_exams
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    is_admin(auth.uid()) OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM episodes e
      WHERE e.id = neurologic_exams.episode_id
      AND e.user_id = auth.uid()
    )
  )
);

-- 3. FIX PATIENT_ACCOUNTS: Remove redundant policies and ensure auth required
DROP POLICY IF EXISTS "Clinicians can view assigned patient accounts" ON public.patient_accounts;
DROP POLICY IF EXISTS "Clinicians can view patient accounts for their episodes" ON public.patient_accounts;

-- Keep simplified, secure policy for clinicians
CREATE POLICY "Clinicians view patient accounts for assigned episodes"
ON public.patient_accounts
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    id = auth.uid() OR
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM patient_episode_access pea
      JOIN episodes e ON e.id = pea.episode_id
      WHERE pea.patient_id = patient_accounts.id
      AND e.user_id = auth.uid()
    )
  )
);

-- 4. FIX EPISODES: Restrict to assigned clinician (not whole clinic for SELECT)
DROP POLICY IF EXISTS "Assigned clinician or admin can select episodes" ON public.episodes;

CREATE POLICY "Assigned clinician or admin can view episodes"
ON public.episodes
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR
    is_admin(auth.uid())
  )
);
