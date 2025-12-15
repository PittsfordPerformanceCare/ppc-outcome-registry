-- Fix remaining tables - skip already created policies

-- 5. PATIENT_MESSAGES TABLE - Drop any remaining permissive policies
DROP POLICY IF EXISTS "Clinicians can view messages for assigned episodes" ON public.patient_messages;

CREATE POLICY "Clinicians can view assigned episode messages" ON public.patient_messages 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.episodes e 
      WHERE e.id = patient_messages.episode_id 
      AND e.user_id = auth.uid()
    )
  )
);

-- 6. EPISODES TABLE - Drop and recreate
DROP POLICY IF EXISTS "Assigned clinician or admin can view episodes" ON public.episodes;

CREATE POLICY "Assigned clinician or admin can select episodes" ON public.episodes 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    is_admin(auth.uid()) OR
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  )
);

-- 7. OUTCOME_SCORES TABLE - Drop and recreate
DROP POLICY IF EXISTS "Episode owner or admin can view outcome scores" ON public.outcome_scores;

CREATE POLICY "Episode owner or admin can select outcome scores" ON public.outcome_scores 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.episodes e 
      WHERE e.id = outcome_scores.episode_id 
      AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
    )
  )
);

-- 8. NEUROLOGIC_EXAMS TABLE - Drop and recreate
DROP POLICY IF EXISTS "Episode owner or admin can view neurologic exams" ON public.neurologic_exams;

CREATE POLICY "Episode owner or admin can select neurologic exams" ON public.neurologic_exams 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.episodes e 
      WHERE e.id = neurologic_exams.episode_id 
      AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
    )
  )
);

-- 9. PATIENT_FEEDBACK TABLE - Drop and recreate
DROP POLICY IF EXISTS "Patient or assigned clinician can view feedback" ON public.patient_feedback;

CREATE POLICY "Patient or assigned clinician can select feedback" ON public.patient_feedback 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    patient_id = auth.uid() OR
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.episodes e 
      WHERE e.id = patient_feedback.episode_id 
      AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
    )
  )
);

-- 10. GOOGLE_CALENDAR_CONNECTIONS TABLE - Drop and recreate
DROP POLICY IF EXISTS "Owner can view own calendar connections" ON public.google_calendar_connections;
DROP POLICY IF EXISTS "Admins can view clinic calendar connections" ON public.google_calendar_connections;

CREATE POLICY "Owner can select own calendar connections" ON public.google_calendar_connections 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);

CREATE POLICY "Admin can select clinic calendar connections" ON public.google_calendar_connections 
FOR SELECT USING (
  is_admin(auth.uid()) AND (
    clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid())
  )
);