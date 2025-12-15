-- Fix remaining 4 publicly exposed tables

-- 1. PROFILES TABLE - Restrict to authenticated users only
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in same clinic" ON public.profiles;

CREATE POLICY "Authenticated users can view own profile" ON public.profiles 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    id = auth.uid() OR
    is_admin(auth.uid()) OR
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  )
);

-- 2. PATIENT_ACCOUNTS TABLE - Restrict to assigned clinicians or admin
DROP POLICY IF EXISTS "Patients can view own account" ON public.patient_accounts;
DROP POLICY IF EXISTS "Anyone can view patient accounts" ON public.patient_accounts;
DROP POLICY IF EXISTS "Public can view patient accounts" ON public.patient_accounts;
DROP POLICY IF EXISTS "Clinicians can view patient accounts" ON public.patient_accounts;
DROP POLICY IF EXISTS "Assigned clinicians can view patient accounts" ON public.patient_accounts;

CREATE POLICY "Patient can view own account" ON public.patient_accounts 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND id = auth.uid()
);

CREATE POLICY "Clinicians can view assigned patient accounts" ON public.patient_accounts 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    is_admin(auth.uid()) OR
    has_role(auth.uid(), 'clinician') AND EXISTS (
      SELECT 1 FROM patient_episode_access pea
      JOIN episodes e ON e.id = pea.episode_id
      WHERE pea.patient_id = patient_accounts.id
      AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
    )
  )
);

-- 3. EPISODES TABLE - Ensure no public access policies remain
DROP POLICY IF EXISTS "Public can view episodes" ON public.episodes;
DROP POLICY IF EXISTS "Anyone can view episodes" ON public.episodes;
DROP POLICY IF EXISTS "Episodes are viewable by everyone" ON public.episodes;

-- 4. NEUROLOGIC_EXAMS TABLE - Ensure no public access policies remain  
DROP POLICY IF EXISTS "Public can view neurologic exams" ON public.neurologic_exams;
DROP POLICY IF EXISTS "Anyone can view neurologic exams" ON public.neurologic_exams;
DROP POLICY IF EXISTS "Neurologic exams are viewable by everyone" ON public.neurologic_exams;