-- Function to automatically award points when outcome scores are added
CREATE OR REPLACE FUNCTION public.auto_award_outcome_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_id uuid;
  v_points integer;
  v_reason text;
  v_is_first_outcome boolean;
  v_baseline_score numeric;
  v_improvement numeric;
  v_mcid_threshold numeric;
  v_achieved_mcid boolean := false;
BEGIN
  -- Get the patient_id from episode access
  SELECT patient_id INTO v_patient_id
  FROM patient_episode_access
  WHERE episode_id = NEW.episode_id
  AND is_active = true
  LIMIT 1;

  -- If no patient found, exit
  IF v_patient_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if this is the patient's first outcome measure
  SELECT COUNT(*) = 0 INTO v_is_first_outcome
  FROM outcome_scores os
  JOIN patient_episode_access pea ON pea.episode_id = os.episode_id
  WHERE pea.patient_id = v_patient_id
  AND os.id != NEW.id;

  -- Determine base points based on score type
  CASE NEW.score_type
    WHEN 'baseline' THEN
      v_points := 15;
      v_reason := 'Completed baseline ' || NEW.index_type || ' assessment';
    WHEN 'followup' THEN
      v_points := 20;
      v_reason := 'Completed follow-up ' || NEW.index_type || ' assessment';
    WHEN 'discharge' THEN
      v_points := 25;
      v_reason := 'Completed discharge ' || NEW.index_type || ' assessment';
    ELSE
      v_points := 15;
      v_reason := 'Completed ' || NEW.index_type || ' assessment';
  END CASE;

  -- Bonus for first outcome measure
  IF v_is_first_outcome THEN
    v_points := v_points + 10;
    v_reason := v_reason || ' (First assessment bonus!)';
  END IF;

  -- Check for MCID achievement on follow-up/discharge
  IF NEW.score_type IN ('followup', 'discharge') THEN
    -- Get baseline score for this episode and index type
    SELECT score INTO v_baseline_score
    FROM outcome_scores
    WHERE episode_id = NEW.episode_id
    AND index_type = NEW.index_type
    AND score_type = 'baseline'
    ORDER BY recorded_at ASC
    LIMIT 1;

    IF v_baseline_score IS NOT NULL THEN
      -- Calculate improvement (for these measures, lower is better)
      v_improvement := v_baseline_score - NEW.score;

      -- Get MCID threshold for this index type
      v_mcid_threshold := CASE NEW.index_type
        WHEN 'NDI' THEN 7.5
        WHEN 'ODI' THEN 6.0
        WHEN 'QuickDASH' THEN 10.0
        WHEN 'LEFS' THEN 9.0
        ELSE 0
      END;

      -- Check if MCID achieved
      IF v_improvement >= v_mcid_threshold THEN
        v_achieved_mcid := true;
        v_points := v_points + 50;
        v_reason := v_reason || ' (MCID achieved! +50 bonus)';
      END IF;
    END IF;
  END IF;

  -- Award the points
  PERFORM award_patient_points(
    v_patient_id,
    v_points,
    v_reason,
    NEW.episode_id,
    NEW.id
  );

  -- Check and award any new achievements
  PERFORM check_and_award_achievements(v_patient_id);

  RETURN NEW;
END;
$$;

-- Create trigger on outcome_scores table
DROP TRIGGER IF EXISTS trigger_auto_award_outcome_points ON public.outcome_scores;

CREATE TRIGGER trigger_auto_award_outcome_points
  AFTER INSERT ON public.outcome_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_award_outcome_points();

-- Function to award bonus points for on-time follow-ups
CREATE OR REPLACE FUNCTION public.award_on_time_bonus()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record record;
  v_patient_id uuid;
  v_days_since_baseline integer;
  v_is_on_time boolean;
BEGIN
  -- Find recent follow-up/discharge scores (within last hour)
  FOR v_record IN
    SELECT 
      os.id,
      os.episode_id,
      os.score_type,
      os.index_type,
      os.recorded_at,
      (
        SELECT MIN(recorded_at)
        FROM outcome_scores
        WHERE episode_id = os.episode_id
        AND index_type = os.index_type
        AND score_type = 'baseline'
      ) as baseline_date
    FROM outcome_scores os
    WHERE os.recorded_at >= NOW() - INTERVAL '1 hour'
    AND os.score_type IN ('followup', 'discharge')
  LOOP
    -- Get patient_id
    SELECT patient_id INTO v_patient_id
    FROM patient_episode_access
    WHERE episode_id = v_record.episode_id
    AND is_active = true
    LIMIT 1;

    IF v_patient_id IS NULL THEN
      CONTINUE;
    END IF;

    -- Check if already awarded on-time bonus for this score
    IF EXISTS (
      SELECT 1 FROM patient_points
      WHERE patient_id = v_patient_id
      AND outcome_score_id = v_record.id
      AND reason LIKE '%On-time completion bonus%'
    ) THEN
      CONTINUE;
    END IF;

    -- Calculate days since baseline
    IF v_record.baseline_date IS NOT NULL THEN
      v_days_since_baseline := EXTRACT(DAY FROM (v_record.recorded_at - v_record.baseline_date));
      
      -- Determine if on-time based on score type
      v_is_on_time := CASE v_record.score_type
        WHEN 'followup' THEN v_days_since_baseline BETWEEN 28 AND 35  -- 4 weeks ± 3 days
        WHEN 'discharge' THEN v_days_since_baseline BETWEEN 84 AND 98  -- 12 weeks ± 1 week
        ELSE false
      END;

      -- Award bonus if on-time
      IF v_is_on_time THEN
        PERFORM award_patient_points(
          v_patient_id,
          30,
          'On-time completion bonus for ' || v_record.index_type || ' ' || v_record.score_type,
          v_record.episode_id,
          v_record.id
        );

        -- Check for new achievements
        PERFORM check_and_award_achievements(v_patient_id);
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Create a function to manually trigger point awards for existing scores (one-time use)
CREATE OR REPLACE FUNCTION public.backfill_outcome_points()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score record;
BEGIN
  FOR v_score IN
    SELECT 
      os.*,
      pea.patient_id
    FROM outcome_scores os
    JOIN patient_episode_access pea ON pea.episode_id = os.episode_id
    WHERE pea.is_active = true
    ORDER BY os.recorded_at ASC
  LOOP
    -- Simulate the trigger for existing scores
    PERFORM auto_award_outcome_points();
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.auto_award_outcome_points() IS 'Automatically awards points when patients complete outcome measures. Bonus points for first assessment and MCID achievement.';
COMMENT ON FUNCTION public.award_on_time_bonus() IS 'Awards bonus points for completing follow-up/discharge assessments within the expected timeframe.';
COMMENT ON TRIGGER trigger_auto_award_outcome_points ON public.outcome_scores IS 'Triggers automatic point awards when new outcome scores are recorded.';