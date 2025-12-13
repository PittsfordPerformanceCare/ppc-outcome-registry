-- Continue fixing remaining tables (skip ones that already have policies)

-- PATIENT_REFERRALS - policy already exists, skip
DROP POLICY IF EXISTS "Referrers can view own referrals" ON public.patient_referrals;
DROP POLICY IF EXISTS "Staff can view all referrals" ON public.patient_referrals;

-- Only create if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patient_referrals' AND policyname = 'Referrers view own referrals') THEN
    EXECUTE 'CREATE POLICY "Referrers view own referrals" ON public.patient_referrals FOR SELECT USING (auth.uid() = referrer_patient_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patient_referrals' AND policyname = 'Staff view all referrals') THEN
    EXECUTE 'CREATE POLICY "Staff view all referrals" ON public.patient_referrals FOR SELECT USING (has_role(auth.uid(), ''admin'') OR has_role(auth.uid(), ''clinician''))';
  END IF;
END $$;

-- PATIENT_POINTS - Restrict to patient owner
DROP POLICY IF EXISTS "Anyone can view patient points" ON public.patient_points;
DROP POLICY IF EXISTS "Public can view patient points" ON public.patient_points;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patient_points' AND policyname = 'Patients view own points') THEN
    EXECUTE 'CREATE POLICY "Patients view own points" ON public.patient_points FOR SELECT USING (auth.uid() = patient_id)';
  END IF;
END $$;

-- PATIENT_ACHIEVEMENTS - Restrict to patient owner
DROP POLICY IF EXISTS "Anyone can view patient achievements" ON public.patient_achievements;
DROP POLICY IF EXISTS "Public can view patient achievements" ON public.patient_achievements;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patient_achievements' AND policyname = 'Patients view own achievements') THEN
    EXECUTE 'CREATE POLICY "Patients view own achievements" ON public.patient_achievements FOR SELECT USING (auth.uid() = patient_id)';
  END IF;
END $$;

-- PATIENT_REWARDS - Restrict to patient owner
DROP POLICY IF EXISTS "Anyone can view patient rewards" ON public.patient_rewards;
DROP POLICY IF EXISTS "Public can view patient rewards" ON public.patient_rewards;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patient_rewards' AND policyname = 'Patients view own rewards') THEN
    EXECUTE 'CREATE POLICY "Patients view own rewards" ON public.patient_rewards FOR SELECT USING (auth.uid() = patient_id)';
  END IF;
END $$;

-- PATIENT_EPISODE_ACCESS - Restrict to patient and staff
DROP POLICY IF EXISTS "Anyone can view episode access" ON public.patient_episode_access;
DROP POLICY IF EXISTS "Public can view episode access" ON public.patient_episode_access;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patient_episode_access' AND policyname = 'Patients view own access') THEN
    EXECUTE 'CREATE POLICY "Patients view own access" ON public.patient_episode_access FOR SELECT USING (auth.uid() = patient_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patient_episode_access' AND policyname = 'Staff view episode access') THEN
    EXECUTE 'CREATE POLICY "Staff view episode access" ON public.patient_episode_access FOR SELECT USING (has_role(auth.uid(), ''admin'') OR has_role(auth.uid(), ''clinician''))';
  END IF;
END $$;

-- OUTCOME_SCORES - Restrict to authenticated users with episode access
DROP POLICY IF EXISTS "Anyone can view outcome scores" ON public.outcome_scores;
DROP POLICY IF EXISTS "Public can view outcome scores" ON public.outcome_scores;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outcome_scores' AND policyname = 'Staff view outcome scores') THEN
    EXECUTE 'CREATE POLICY "Staff view outcome scores" ON public.outcome_scores FOR SELECT USING (has_role(auth.uid(), ''admin'') OR has_role(auth.uid(), ''clinician''))';
  END IF;
END $$;