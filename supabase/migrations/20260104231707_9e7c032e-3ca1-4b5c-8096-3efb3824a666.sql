-- ============================================================
-- PPC Shadow Site - Logical Site Isolation for Replicability Proof
-- ============================================================

-- Step 1: Create PPC-Shadow site record in clinics table
INSERT INTO public.clinics (id, name, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'PPC-Shadow',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Also ensure primary PPC site exists
INSERT INTO public.clinics (id, name, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'PPC-Primary',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Step 2: Update research views to include clinic_id for site filtering
-- ============================================================

DROP VIEW IF EXISTS public.v_research_care_targets;
DROP VIEW IF EXISTS public.v_research_outcomes;
DROP VIEW IF EXISTS public.v_research_episodes;

-- Research View: v_research_care_targets with site_id
CREATE VIEW public.v_research_care_targets 
WITH (security_invoker = true)
AS
SELECT
  ct.id AS care_target_uuid,
  ct.episode_id AS episode_uuid,
  pea.patient_id AS patient_uuid,
  e.clinic_id AS site_id,
  ct.body_region,
  ct.outcome_instrument AS instrument_type,
  (
    SELECT os.score 
    FROM public.outcome_scores os 
    WHERE os.episode_id = ct.episode_id 
      AND os.index_type = ct.outcome_instrument
      AND os.score_type = 'baseline'
    ORDER BY os.recorded_at ASC
    LIMIT 1
  ) AS baseline_score,
  (
    SELECT os.score 
    FROM public.outcome_scores os 
    WHERE os.episode_id = ct.episode_id 
      AND os.index_type = ct.outcome_instrument
      AND os.score_type = 'discharge'
    ORDER BY os.recorded_at DESC
    LIMIT 1
  ) AS discharge_score,
  (
    SELECT os_baseline.score - os_discharge.score
    FROM (
      SELECT score FROM public.outcome_scores 
      WHERE episode_id = ct.episode_id 
        AND index_type = ct.outcome_instrument
        AND score_type = 'baseline'
      ORDER BY recorded_at ASC LIMIT 1
    ) os_baseline,
    (
      SELECT score FROM public.outcome_scores 
      WHERE episode_id = ct.episode_id 
        AND index_type = ct.outcome_instrument
        AND score_type = 'discharge'
      ORDER BY recorded_at DESC LIMIT 1
    ) os_discharge
  ) AS score_delta,
  CASE ct.outcome_instrument
    WHEN 'NDI' THEN 7.5
    WHEN 'ODI' THEN 6.0
    WHEN 'QuickDASH' THEN 10.0
    WHEN 'LEFS' THEN 9.0
    WHEN 'PROMIS-10' THEN 5.0
    ELSE NULL
  END AS mcid_threshold,
  CASE 
    WHEN ct.outcome_instrument IN ('NDI', 'ODI', 'QuickDASH') THEN
      COALESCE((
        SELECT os_baseline.score - os_discharge.score >= 
          CASE ct.outcome_instrument
            WHEN 'NDI' THEN 7.5
            WHEN 'ODI' THEN 6.0
            WHEN 'QuickDASH' THEN 10.0
            ELSE 0
          END
        FROM (
          SELECT score FROM public.outcome_scores 
          WHERE episode_id = ct.episode_id 
            AND index_type = ct.outcome_instrument
            AND score_type = 'baseline'
          ORDER BY recorded_at ASC LIMIT 1
        ) os_baseline,
        (
          SELECT score FROM public.outcome_scores 
          WHERE episode_id = ct.episode_id 
            AND index_type = ct.outcome_instrument
            AND score_type = 'discharge'
          ORDER BY recorded_at DESC LIMIT 1
        ) os_discharge
      ), false)
    WHEN ct.outcome_instrument = 'LEFS' THEN
      COALESCE((
        SELECT os_discharge.score - os_baseline.score >= 9.0
        FROM (
          SELECT score FROM public.outcome_scores 
          WHERE episode_id = ct.episode_id 
            AND index_type = ct.outcome_instrument
            AND score_type = 'baseline'
          ORDER BY recorded_at ASC LIMIT 1
        ) os_baseline,
        (
          SELECT score FROM public.outcome_scores 
          WHERE episode_id = ct.episode_id 
            AND index_type = ct.outcome_instrument
            AND score_type = 'discharge'
          ORDER BY recorded_at DESC LIMIT 1
        ) os_discharge
      ), false)
    ELSE false
  END AS mcid_met,
  ct.status AS care_target_status,
  CASE 
    WHEN e.date_of_birth IS NULL THEN 'unknown'
    WHEN EXTRACT(YEAR FROM AGE(e.start_date, e.date_of_birth)) < 18 THEN 'pediatric'
    WHEN EXTRACT(YEAR FROM AGE(e.start_date, e.date_of_birth)) BETWEEN 18 AND 29 THEN '18-29'
    WHEN EXTRACT(YEAR FROM AGE(e.start_date, e.date_of_birth)) BETWEEN 30 AND 39 THEN '30-39'
    WHEN EXTRACT(YEAR FROM AGE(e.start_date, e.date_of_birth)) BETWEEN 40 AND 49 THEN '40-49'
    WHEN EXTRACT(YEAR FROM AGE(e.start_date, e.date_of_birth)) BETWEEN 50 AND 59 THEN '50-59'
    WHEN EXTRACT(YEAR FROM AGE(e.start_date, e.date_of_birth)) BETWEEN 60 AND 69 THEN '60-69'
    WHEN EXTRACT(YEAR FROM AGE(e.start_date, e.date_of_birth)) >= 70 THEN '70+'
    ELSE 'unknown'
  END AS age_band_at_episode_start,
  CONCAT(
    EXTRACT(YEAR FROM COALESCE(e.start_date, e.date_of_service))::TEXT,
    '-Q',
    EXTRACT(QUARTER FROM COALESCE(e.start_date, e.date_of_service))::TEXT
  ) AS episode_time_bucket
FROM public.care_targets ct
JOIN public.episodes e ON e.id = ct.episode_id
LEFT JOIN public.patient_episode_access pea ON pea.episode_id = ct.episode_id AND pea.is_active = true;

-- Research View: v_research_outcomes with site_id
CREATE VIEW public.v_research_outcomes
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (ct.id, ct.outcome_instrument)
  ct.id AS care_target_uuid,
  e.clinic_id AS site_id,
  ct.outcome_instrument AS instrument_type,
  (
    SELECT os.score 
    FROM public.outcome_scores os 
    WHERE os.episode_id = ct.episode_id 
      AND os.index_type = ct.outcome_instrument
      AND os.score_type = 'baseline'
    ORDER BY os.recorded_at ASC
    LIMIT 1
  ) AS baseline_score,
  (
    SELECT os.score 
    FROM public.outcome_scores os 
    WHERE os.episode_id = ct.episode_id 
      AND os.index_type = ct.outcome_instrument
      AND os.score_type = 'discharge'
    ORDER BY os.recorded_at DESC
    LIMIT 1
  ) AS discharge_score,
  (
    SELECT os_baseline.score - os_discharge.score
    FROM (
      SELECT score FROM public.outcome_scores 
      WHERE episode_id = ct.episode_id 
        AND index_type = ct.outcome_instrument
        AND score_type = 'baseline'
      ORDER BY recorded_at ASC LIMIT 1
    ) os_baseline,
    (
      SELECT score FROM public.outcome_scores 
      WHERE episode_id = ct.episode_id 
        AND index_type = ct.outcome_instrument
        AND score_type = 'discharge'
      ORDER BY recorded_at DESC LIMIT 1
    ) os_discharge
  ) AS score_delta,
  CASE 
    WHEN ct.outcome_instrument IN ('NDI', 'ODI', 'QuickDASH') THEN
      COALESCE((
        SELECT os_baseline.score - os_discharge.score >= 
          CASE ct.outcome_instrument
            WHEN 'NDI' THEN 7.5
            WHEN 'ODI' THEN 6.0
            WHEN 'QuickDASH' THEN 10.0
            ELSE 0
          END
        FROM (
          SELECT score FROM public.outcome_scores 
          WHERE episode_id = ct.episode_id 
            AND index_type = ct.outcome_instrument
            AND score_type = 'baseline'
          ORDER BY recorded_at ASC LIMIT 1
        ) os_baseline,
        (
          SELECT score FROM public.outcome_scores 
          WHERE episode_id = ct.episode_id 
            AND index_type = ct.outcome_instrument
            AND score_type = 'discharge'
          ORDER BY recorded_at DESC LIMIT 1
        ) os_discharge
      ), false)
    WHEN ct.outcome_instrument = 'LEFS' THEN
      COALESCE((
        SELECT os_discharge.score - os_baseline.score >= 9.0
        FROM (
          SELECT score FROM public.outcome_scores 
          WHERE episode_id = ct.episode_id 
            AND index_type = ct.outcome_instrument
            AND score_type = 'baseline'
          ORDER BY recorded_at ASC LIMIT 1
        ) os_baseline,
        (
          SELECT score FROM public.outcome_scores 
          WHERE episode_id = ct.episode_id 
            AND index_type = ct.outcome_instrument
            AND score_type = 'discharge'
          ORDER BY recorded_at DESC LIMIT 1
        ) os_discharge
      ), false)
    ELSE false
  END AS mcid_met
FROM public.care_targets ct
JOIN public.episodes e ON e.id = ct.episode_id
WHERE ct.outcome_instrument IS NOT NULL;

-- Research View: v_research_episodes with site_id
CREATE VIEW public.v_research_episodes
WITH (security_invoker = true)
AS
SELECT
  e.id AS episode_uuid,
  pea.patient_id AS patient_uuid,
  e.clinic_id AS site_id,
  CONCAT(
    EXTRACT(YEAR FROM COALESCE(e.start_date, e.date_of_service))::TEXT,
    '-Q',
    EXTRACT(QUARTER FROM COALESCE(e.start_date, e.date_of_service))::TEXT
  ) AS episode_start_bucket,
  CASE 
    WHEN e.discharge_date IS NOT NULL THEN
      CONCAT(
        EXTRACT(YEAR FROM e.discharge_date)::TEXT,
        '-Q',
        EXTRACT(QUARTER FROM e.discharge_date)::TEXT
      )
    ELSE NULL
  END AS episode_end_bucket,
  (SELECT COUNT(*) FROM public.care_targets ct WHERE ct.episode_id = e.id) AS number_of_care_targets,
  e.current_status::TEXT AS episode_status
FROM public.episodes e
LEFT JOIN public.patient_episode_access pea ON pea.episode_id = e.id AND pea.is_active = true;

-- Re-grant permissions
GRANT SELECT ON public.v_research_care_targets TO authenticated;
GRANT SELECT ON public.v_research_outcomes TO authenticated;
GRANT SELECT ON public.v_research_episodes TO authenticated;

-- ============================================================
-- Step 3: Create analytics_site_summary view for leadership dashboard
-- ============================================================
CREATE OR REPLACE VIEW public.analytics_site_summary
WITH (security_invoker = true)
AS
SELECT
  c.id AS site_id,
  c.name AS site_name,
  COUNT(DISTINCT e.id) AS total_episodes,
  COUNT(DISTINCT ct.id) AS total_care_targets,
  COUNT(DISTINCT CASE WHEN e.discharge_date IS NOT NULL THEN e.id END) AS discharged_episodes,
  COUNT(DISTINCT CASE WHEN ct.status = 'discharged' THEN ct.id END) AS discharged_care_targets
FROM public.clinics c
LEFT JOIN public.episodes e ON e.clinic_id = c.id
LEFT JOIN public.care_targets ct ON ct.episode_id = e.id
GROUP BY c.id, c.name;

GRANT SELECT ON public.analytics_site_summary TO authenticated;