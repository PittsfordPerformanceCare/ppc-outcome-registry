-- ============================================================
-- PPC Research Export Pipeline - De-Identification Layer
-- ============================================================

-- Create research_exports manifest table
CREATE TABLE public.research_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  export_purpose TEXT NOT NULL CHECK (export_purpose IN ('registry', 'publication', 'research')),
  dataset_type TEXT NOT NULL CHECK (dataset_type IN ('care_targets', 'outcomes', 'episodes')),
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  hash_version TEXT NOT NULL DEFAULT 'v1',
  schema_version TEXT NOT NULL DEFAULT '1.0.0',
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.research_exports ENABLE ROW LEVEL SECURITY;

-- Only admins/owners can view exports
CREATE POLICY "Admins can view research exports"
  ON public.research_exports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );

-- Only admins/owners can create exports
CREATE POLICY "Admins can create research exports"
  ON public.research_exports
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );

-- ============================================================
-- Research View: v_research_care_targets
-- De-identified care target outcomes for registry/publication
-- ============================================================
CREATE OR REPLACE VIEW public.v_research_care_targets AS
SELECT
  ct.id AS care_target_uuid,
  ct.episode_id AS episode_uuid,
  pea.patient_id AS patient_uuid,
  ct.body_region,
  ct.outcome_instrument AS instrument_type,
  
  -- Get baseline score
  (
    SELECT os.score 
    FROM public.outcome_scores os 
    WHERE os.episode_id = ct.episode_id 
      AND os.index_type = ct.outcome_instrument
      AND os.score_type = 'baseline'
    ORDER BY os.recorded_at ASC
    LIMIT 1
  ) AS baseline_score,
  
  -- Get discharge score
  (
    SELECT os.score 
    FROM public.outcome_scores os 
    WHERE os.episode_id = ct.episode_id 
      AND os.index_type = ct.outcome_instrument
      AND os.score_type = 'discharge'
    ORDER BY os.recorded_at DESC
    LIMIT 1
  ) AS discharge_score,
  
  -- Calculate delta
  (
    SELECT os_discharge.score - os_baseline.score
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
  
  -- MCID thresholds (immutable per instrument)
  CASE ct.outcome_instrument
    WHEN 'NDI' THEN 7.5
    WHEN 'ODI' THEN 6.0
    WHEN 'QuickDASH' THEN 10.0
    WHEN 'LEFS' THEN 9.0
    WHEN 'PROMIS-10' THEN 5.0
    ELSE NULL
  END AS mcid_threshold,
  
  -- MCID met calculation (improvement = lower score for disability indexes)
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
  
  -- Age band at episode start (de-identified)
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
  
  -- Time bucket (YYYY-Q format)
  CONCAT(
    EXTRACT(YEAR FROM COALESCE(e.start_date, e.date_of_service))::TEXT,
    '-Q',
    EXTRACT(QUARTER FROM COALESCE(e.start_date, e.date_of_service))::TEXT
  ) AS episode_time_bucket

FROM public.care_targets ct
JOIN public.episodes e ON e.id = ct.episode_id
LEFT JOIN public.patient_episode_access pea ON pea.episode_id = ct.episode_id AND pea.is_active = true;

-- ============================================================
-- Research View: v_research_outcomes
-- Minimal outcome scores for statistical analysis
-- ============================================================
CREATE OR REPLACE VIEW public.v_research_outcomes AS
SELECT DISTINCT ON (ct.id, ct.outcome_instrument)
  ct.id AS care_target_uuid,
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
WHERE ct.outcome_instrument IS NOT NULL;

-- ============================================================
-- Research View: v_research_episodes
-- Episode-level aggregates without identifiers
-- ============================================================
CREATE OR REPLACE VIEW public.v_research_episodes AS
SELECT
  e.id AS episode_uuid,
  pea.patient_id AS patient_uuid,
  
  -- Time buckets instead of exact dates
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

-- Grant SELECT on views to authenticated users (RLS on underlying tables still applies)
GRANT SELECT ON public.v_research_care_targets TO authenticated;
GRANT SELECT ON public.v_research_outcomes TO authenticated;
GRANT SELECT ON public.v_research_episodes TO authenticated;