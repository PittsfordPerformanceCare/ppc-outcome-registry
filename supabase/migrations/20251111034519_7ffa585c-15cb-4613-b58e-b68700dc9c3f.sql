-- =====================================================
-- PATIENT COMPANION APP - FINAL PIECES
-- =====================================================

-- =====================================================
-- 1. PATIENT REWARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.patient_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patient_accounts(id) ON DELETE CASCADE,
  reward_type text NOT NULL DEFAULT 'dicks_discount',
  reward_name text NOT NULL,
  reward_description text,
  code text NOT NULL,
  qr_code_data text,
  is_active boolean NOT NULL DEFAULT true,
  valid_from timestamp with time zone NOT NULL DEFAULT now(),
  valid_until timestamp with time zone,
  viewed_at timestamp with time zone,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_rewards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Patients can view own active rewards" ON public.patient_rewards;
DROP POLICY IF EXISTS "Patients can update own rewards (for tracking views)" ON public.patient_rewards;
DROP POLICY IF EXISTS "Clinicians can view rewards for their patients" ON public.patient_rewards;
DROP POLICY IF EXISTS "Admins can manage all rewards" ON public.patient_rewards;

-- Create RLS policies
CREATE POLICY "Patients can view own active rewards"
  ON public.patient_rewards
  FOR SELECT
  USING (
    auth.uid() = patient_id 
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > now())
  );

CREATE POLICY "Patients can update own rewards (for tracking views)"
  ON public.patient_rewards
  FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Clinicians can view rewards for their patients"
  ON public.patient_rewards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_episode_access pea
      JOIN episodes e ON e.id = pea.episode_id
      WHERE pea.patient_id = patient_rewards.patient_id
        AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
    )
    OR is_admin(auth.uid())
  );

CREATE POLICY "Admins can manage all rewards"
  ON public.patient_rewards
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_patient_rewards_updated_at ON public.patient_rewards;
CREATE TRIGGER update_patient_rewards_updated_at
  BEFORE UPDATE ON public.patient_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 2. ADD CROSS-TABLE POLICY FOR PATIENT ACCOUNTS
-- =====================================================
DROP POLICY IF EXISTS "Clinicians can view patient accounts for their episodes" ON public.patient_accounts;
CREATE POLICY "Clinicians can view patient accounts for their episodes"
  ON public.patient_accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_episode_access pea
      JOIN episodes e ON e.id = pea.episode_id
      WHERE pea.patient_id = patient_accounts.id
        AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
    )
    OR is_admin(auth.uid())
  );

-- =====================================================
-- 3. HELPER FUNCTIONS
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
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_patient_episode_access_patient_id ON patient_episode_access(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_episode_access_episode_id ON patient_episode_access(episode_id);
CREATE INDEX IF NOT EXISTS idx_patient_episode_access_invitation_code ON patient_episode_access(invitation_code) WHERE invitation_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_rewards_patient_id ON patient_rewards(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_rewards_active ON patient_rewards(is_active, valid_until) WHERE is_active = true;

-- =====================================================
-- 5. GRANT PATIENT ACCESS TO OUTCOME SCORES
-- =====================================================
DROP POLICY IF EXISTS "Patients can view outcome scores for their episodes" ON public.outcome_scores;
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