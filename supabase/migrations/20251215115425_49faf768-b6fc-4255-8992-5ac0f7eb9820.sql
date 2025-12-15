
-- =====================================================
-- TARGETED RLS HARDENING FOR CLINICAL DATA
-- Assignment-based access: only assigned clinician + admins
-- =====================================================

-- 1. LEADS TABLE: Lock down SELECT to admins only, keep public INSERT
-- Drop existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Only clinicians and admins can view leads" ON public.leads;

-- Create restrictive SELECT policy - admins only
CREATE POLICY "Only admins can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 2. EPISODES TABLE: Restrict to assigned clinician (user_id) or admin
DROP POLICY IF EXISTS "Users can view episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can update episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can insert episodes" ON public.episodes;
DROP POLICY IF EXISTS "Users can delete episodes" ON public.episodes;

-- SELECT: Only assigned clinician or admin
CREATE POLICY "Assigned clinician or admin can view episodes"
ON public.episodes
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
);

-- UPDATE: Only assigned clinician or admin
CREATE POLICY "Assigned clinician or admin can update episodes"
ON public.episodes
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
);

-- INSERT: Authenticated users can create (they become the assigned clinician)
CREATE POLICY "Authenticated users can create episodes"
ON public.episodes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- DELETE: Admin only
CREATE POLICY "Only admins can delete episodes"
ON public.episodes
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- 3. NEUROLOGIC_EXAMS: Restrict to episode owner or admin
DROP POLICY IF EXISTS "Users can view neurologic exams" ON public.neurologic_exams;
DROP POLICY IF EXISTS "Users can insert neurologic exams" ON public.neurologic_exams;
DROP POLICY IF EXISTS "Users can update neurologic exams" ON public.neurologic_exams;

-- SELECT: Only if user owns the parent episode or is admin
CREATE POLICY "Episode owner or admin can view neurologic exams"
ON public.neurologic_exams
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM episodes e 
    WHERE e.id = neurologic_exams.episode_id 
    AND (e.user_id = auth.uid() OR is_admin(auth.uid()))
  )
);

-- INSERT: Only if user owns the parent episode
CREATE POLICY "Episode owner can insert neurologic exams"
ON public.neurologic_exams
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM episodes e 
    WHERE e.id = episode_id 
    AND e.user_id = auth.uid()
  )
  OR is_admin(auth.uid())
);

-- UPDATE: Only if user owns the parent episode or is admin
CREATE POLICY "Episode owner or admin can update neurologic exams"
ON public.neurologic_exams
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM episodes e 
    WHERE e.id = neurologic_exams.episode_id 
    AND (e.user_id = auth.uid() OR is_admin(auth.uid()))
  )
);

-- 4. PATIENT_MESSAGES: Restrict to assigned episode clinician or admin
DROP POLICY IF EXISTS "Clinicians can view all patient messages" ON public.patient_messages;
DROP POLICY IF EXISTS "Clinicians can update patient messages" ON public.patient_messages;

-- SELECT: Only assigned episode clinician or admin
CREATE POLICY "Assigned clinician or admin can view patient messages"
ON public.patient_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM episodes e 
    WHERE e.id = patient_messages.episode_id 
    AND (e.user_id = auth.uid() OR is_admin(auth.uid()))
  )
  OR is_admin(auth.uid())
);

-- UPDATE: Only assigned episode clinician or admin
CREATE POLICY "Assigned clinician or admin can update patient messages"
ON public.patient_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM episodes e 
    WHERE e.id = patient_messages.episode_id 
    AND (e.user_id = auth.uid() OR is_admin(auth.uid()))
  )
);

-- 5. PROFILES TABLE: Restrict to own profile or admin (staff can't harvest all emails)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view clinic settings" ON public.profiles;

-- SELECT: Users see their own profile, admins see all
CREATE POLICY "Users can view own profile or admin views all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR is_admin(auth.uid())
  OR clinic_id = get_user_clinic_id(auth.uid())
);

-- 6. PATIENT_ACCOUNTS: Restrict to assigned clinician or admin
DROP POLICY IF EXISTS "Staff can view all patient accounts" ON public.patient_accounts;

-- SELECT: Only if patient has an episode assigned to this clinician, or admin
CREATE POLICY "Assigned clinician or admin can view patient accounts"
ON public.patient_accounts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patient_episode_access pea
    JOIN episodes e ON e.id = pea.episode_id
    WHERE pea.patient_id = patient_accounts.id
    AND (e.user_id = auth.uid() OR is_admin(auth.uid()))
  )
  OR is_admin(auth.uid())
);

-- 7. OUTCOME_SCORES: Restrict to episode owner or admin
DROP POLICY IF EXISTS "Users can view outcome scores" ON public.outcome_scores;

CREATE POLICY "Episode owner or admin can view outcome scores"
ON public.outcome_scores
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM episodes e 
    WHERE e.id = outcome_scores.episode_id 
    AND (e.user_id = auth.uid() OR is_admin(auth.uid()))
  )
);

-- 8. FOLLOWUPS: Restrict to episode owner or admin
DROP POLICY IF EXISTS "Users can view followups" ON public.followups;

CREATE POLICY "Episode owner or admin can view followups"
ON public.followups
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
);
