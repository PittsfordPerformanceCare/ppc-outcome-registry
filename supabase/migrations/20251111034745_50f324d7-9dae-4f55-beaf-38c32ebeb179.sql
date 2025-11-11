-- =====================================================
-- PATIENT COMPANION APP - FINAL PIECES
-- =====================================================

-- =====================================================
-- 1. HELPER FUNCTION FOR PATIENT EPISODE DATA
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_patient_episode_view(_patient_id uuid, _episode_id text)
RETURNS TABLE (
  id text,
  patient_name text,
  region text,
  date_of_service date,
  start_date date,
  discharge_date date,
  followup_date date,
  clinician text,
  diagnosis text,
  injury_date date,
  injury_mechanism text,
  pain_level text,
  treatment_goals jsonb,
  functional_limitations text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    e.id,
    e.patient_name,
    e.region,
    e.date_of_service,
    e.start_date,
    e.discharge_date,
    e.followup_date,
    e.clinician,
    e.diagnosis,
    e.injury_date,
    e.injury_mechanism,
    e.pain_level,
    e.treatment_goals,
    e.functional_limitations
  FROM episodes e
  WHERE e.id = _episode_id
    AND EXISTS (
      SELECT 1 FROM patient_episode_access pea
      WHERE pea.patient_id = _patient_id
        AND pea.episode_id = e.id
    );
$$;

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_patient_episode_access_patient_id ON patient_episode_access(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_episode_access_episode_id ON patient_episode_access(episode_id);
CREATE INDEX IF NOT EXISTS idx_patient_episode_access_invitation_code ON patient_episode_access(invitation_code) WHERE invitation_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_rewards_patient_id ON patient_rewards(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_rewards_active ON patient_rewards(is_active, valid_until) WHERE is_active = true;

-- =====================================================
-- 3. POLICY FOR PATIENT ACCESS TO OUTCOME SCORES
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'outcome_scores' 
    AND policyname = 'Patients can view outcome scores for their episodes'
  ) THEN
    CREATE POLICY "Patients can view outcome scores for their episodes"
      ON public.outcome_scores
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM patient_episode_access pea
          WHERE pea.episode_id = outcome_scores.episode_id
            AND pea.patient_id = auth.uid()
        )
      );
  END IF;
END$$;