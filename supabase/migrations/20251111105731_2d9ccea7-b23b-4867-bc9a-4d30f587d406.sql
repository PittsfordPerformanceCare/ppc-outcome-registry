-- Create achievement definitions table
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  badge_icon text NOT NULL,
  badge_color text NOT NULL,
  points_required integer,
  achievement_type text NOT NULL CHECK (achievement_type IN ('badge', 'milestone', 'achievement')),
  criteria jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create patient points tracking table
CREATE TABLE IF NOT EXISTS public.patient_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL,
  reason text NOT NULL,
  episode_id text,
  outcome_score_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create patient achievements table  
CREATE TABLE IF NOT EXISTS public.patient_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievement_definitions(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  episode_id text,
  metadata jsonb,
  UNIQUE(patient_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view achievement definitions" ON public.achievement_definitions;
DROP POLICY IF EXISTS "Patients can view own points" ON public.patient_points;
DROP POLICY IF EXISTS "Clinicians can view points for their episodes" ON public.patient_points;
DROP POLICY IF EXISTS "System can insert points" ON public.patient_points;
DROP POLICY IF EXISTS "Patients can view own achievements" ON public.patient_achievements;
DROP POLICY IF EXISTS "Clinicians can view achievements for their patients" ON public.patient_achievements;
DROP POLICY IF EXISTS "System can insert achievements" ON public.patient_achievements;

-- RLS Policies
CREATE POLICY "Anyone can view achievement definitions"
  ON public.achievement_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Patients can view own points"
  ON public.patient_points FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Clinicians can view points for their episodes"
  ON public.patient_points FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM episodes e
      WHERE e.id = patient_points.episode_id
        AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
    )
    OR is_admin(auth.uid())
  );

CREATE POLICY "System can insert points"
  ON public.patient_points FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Patients can view own achievements"
  ON public.patient_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Clinicians can view achievements for their patients"
  ON public.patient_achievements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patient_episode_access pea
      JOIN episodes e ON e.id = pea.episode_id
      WHERE pea.patient_id = patient_achievements.patient_id
        AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
    )
    OR is_admin(auth.uid())
  );

CREATE POLICY "System can insert achievements"
  ON public.patient_achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patient_points_patient_id ON public.patient_points(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_points_created_at ON public.patient_points(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_achievements_patient_id ON public.patient_achievements(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_achievements_earned_at ON public.patient_achievements(earned_at DESC);

-- Functions
CREATE OR REPLACE FUNCTION public.get_patient_total_points(p_patient_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(points), 0)::integer
  FROM patient_points
  WHERE patient_id = p_patient_id;
$$;

CREATE OR REPLACE FUNCTION public.award_patient_points(
  p_patient_id uuid,
  p_points integer,
  p_reason text,
  p_episode_id text DEFAULT NULL,
  p_outcome_score_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_point_id uuid;
BEGIN
  INSERT INTO patient_points (patient_id, points, reason, episode_id, outcome_score_id)
  VALUES (p_patient_id, p_points, p_reason, p_episode_id, p_outcome_score_id)
  RETURNING id INTO v_point_id;
  
  RETURN v_point_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_patient_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_points integer;
  v_outcome_count integer;
  v_mcid_count integer;
  v_achievement record;
BEGIN
  v_total_points := get_patient_total_points(p_patient_id);
  
  SELECT COUNT(DISTINCT os.id)
  INTO v_outcome_count
  FROM outcome_scores os
  JOIN patient_episode_access pea ON pea.episode_id = os.episode_id
  WHERE pea.patient_id = p_patient_id;
  
  SELECT COUNT(*)
  INTO v_mcid_count
  FROM (
    SELECT 
      os.episode_id,
      os.index_type,
      MIN(CASE WHEN os.score_type = 'baseline' THEN os.score END) as baseline,
      MAX(CASE WHEN os.score_type IN ('discharge', 'followup') THEN os.score END) as final_score
    FROM outcome_scores os
    JOIN patient_episode_access pea ON pea.episode_id = os.episode_id
    WHERE pea.patient_id = p_patient_id
    GROUP BY os.episode_id, os.index_type
    HAVING 
      MIN(CASE WHEN os.score_type = 'baseline' THEN os.score END) IS NOT NULL
      AND MAX(CASE WHEN os.score_type IN ('discharge', 'followup') THEN os.score END) IS NOT NULL
      AND (MIN(CASE WHEN os.score_type = 'baseline' THEN os.score END) - 
           MAX(CASE WHEN os.score_type IN ('discharge', 'followup') THEN os.score END)) >= 
          CASE os.index_type
            WHEN 'NDI' THEN 7.5
            WHEN 'ODI' THEN 6
            WHEN 'QuickDASH' THEN 10
            WHEN 'LEFS' THEN 9
            ELSE 0
          END
  ) mcid_achievements;
  
  FOR v_achievement IN 
    SELECT * FROM achievement_definitions 
    WHERE achievement_type = 'milestone' 
      AND points_required IS NOT NULL 
      AND points_required <= v_total_points
      AND NOT EXISTS (
        SELECT 1 FROM patient_achievements 
        WHERE patient_id = p_patient_id 
          AND achievement_id = achievement_definitions.id
      )
  LOOP
    INSERT INTO patient_achievements (patient_id, achievement_id)
    VALUES (p_patient_id, v_achievement.id)
    ON CONFLICT (patient_id, achievement_id) DO NOTHING;
  END LOOP;
  
  IF v_outcome_count >= 1 AND NOT EXISTS (
    SELECT 1 FROM patient_achievements pa
    JOIN achievement_definitions ad ON ad.id = pa.achievement_id
    WHERE pa.patient_id = p_patient_id 
      AND ad.name = 'First Assessment Complete'
  ) THEN
    INSERT INTO patient_achievements (patient_id, achievement_id)
    SELECT p_patient_id, id FROM achievement_definitions 
    WHERE name = 'First Assessment Complete'
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF v_mcid_count >= 1 AND NOT EXISTS (
    SELECT 1 FROM patient_achievements pa
    JOIN achievement_definitions ad ON ad.id = pa.achievement_id
    WHERE pa.patient_id = p_patient_id 
      AND ad.name = 'MCID Champion'
  ) THEN
    INSERT INTO patient_achievements (patient_id, achievement_id)
    SELECT p_patient_id, id FROM achievement_definitions 
    WHERE name = 'MCID Champion'
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Insert default achievements
INSERT INTO public.achievement_definitions (name, description, badge_icon, badge_color, points_required, achievement_type, criteria)
VALUES
  ('Welcome Aboard', 'Created your patient account', 'Heart', 'text-pink-500', 10, 'achievement', '{"type": "account_created"}'::jsonb),
  ('First Assessment Complete', 'Completed your first outcome measure', 'ClipboardCheck', 'text-blue-500', 25, 'achievement', '{"type": "first_outcome"}'::jsonb),
  ('Consistent Tracker', 'Completed outcome measures on time 3 times', 'Calendar', 'text-green-500', 50, 'achievement', '{"type": "on_time_count", "required": 3}'::jsonb),
  ('MCID Champion', 'Achieved Minimal Clinically Important Difference', 'Trophy', 'text-yellow-500', 100, 'achievement', '{"type": "mcid_achieved"}'::jsonb),
  ('Progress Warrior', 'Consistently engaged for 4 weeks', 'Shield', 'text-purple-500', 75, 'achievement', '{"type": "engagement_weeks", "required": 4}'::jsonb),
  ('Bronze Level', 'Earned 100 points', 'Medal', 'text-orange-600', 100, 'milestone', '{"type": "points_milestone"}'::jsonb),
  ('Silver Level', 'Earned 250 points', 'Medal', 'text-gray-400', 250, 'milestone', '{"type": "points_milestone"}'::jsonb),
  ('Gold Level', 'Earned 500 points', 'Medal', 'text-yellow-400', 500, 'milestone', '{"type": "points_milestone"}'::jsonb),
  ('Platinum Level', 'Earned 1000 points', 'Star', 'text-cyan-400', 1000, 'milestone', '{"type": "points_milestone"}'::jsonb)
ON CONFLICT (name) DO NOTHING;