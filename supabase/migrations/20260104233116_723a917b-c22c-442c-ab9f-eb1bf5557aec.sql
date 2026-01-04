-- ============================================================
-- Signal 3: Closed-Loop Lead → Episode → Resolution Analytics
-- ============================================================

-- Step 1: Create canonical lead_source taxonomy type
DO $$ BEGIN
  CREATE TYPE public.lead_source_type AS ENUM (
    'pillar:concussion',
    'pillar:neck-pain',
    'pillar:back-pain',
    'pillar:sports-injury',
    'pillar:post-surgical',
    'pillar:vestibular',
    'pillar:pediatric',
    'pillar:other',
    'referral:physician',
    'referral:patient',
    'referral:school',
    'referral:coach',
    'referral:employer',
    'referral:insurance',
    'referral:other',
    'direct:google',
    'direct:website',
    'direct:call',
    'direct:walk-in',
    'direct:return-patient',
    'unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Add lead attribution fields to care_requests
ALTER TABLE public.care_requests
ADD COLUMN IF NOT EXISTS lead_source public.lead_source_type DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id),
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS referrer_url TEXT,
ADD COLUMN IF NOT EXISTS landing_page TEXT,
ADD COLUMN IF NOT EXISTS campaign_id TEXT,
ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.clinics(id);

-- Step 3: Add care_request_id to episodes for traceability
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS care_request_id UUID REFERENCES public.care_requests(id);

-- Step 4: Create episode_origins table for episodes without care_requests
CREATE TABLE IF NOT EXISTS public.episode_origins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id TEXT NOT NULL UNIQUE,
  lead_source public.lead_source_type NOT NULL DEFAULT 'unknown',
  lead_id UUID REFERENCES public.leads(id),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  site_id UUID REFERENCES public.clinics(id),
  origin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on episode_origins
ALTER TABLE public.episode_origins ENABLE ROW LEVEL SECURITY;

-- RLS policies for episode_origins
CREATE POLICY "Authenticated users can read episode_origins"
  ON public.episode_origins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert episode_origins"
  ON public.episode_origins FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update episode_origins"
  ON public.episode_origins FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Step 5: Add indexes for analytics performance
CREATE INDEX IF NOT EXISTS idx_care_requests_lead_source ON public.care_requests(lead_source);
CREATE INDEX IF NOT EXISTS idx_care_requests_site_id ON public.care_requests(site_id);
CREATE INDEX IF NOT EXISTS idx_care_requests_lead_id ON public.care_requests(lead_id);
CREATE INDEX IF NOT EXISTS idx_episodes_care_request_id ON public.episodes(care_request_id);
CREATE INDEX IF NOT EXISTS idx_episode_origins_lead_source ON public.episode_origins(lead_source);
CREATE INDEX IF NOT EXISTS idx_episode_origins_site_id ON public.episode_origins(site_id);

-- Step 6: Create analytics view - Lead Funnel by Source
CREATE OR REPLACE VIEW public.analytics_lead_funnel_by_source
WITH (security_invoker = true)
AS
WITH lead_counts AS (
  SELECT 
    COALESCE(cr.site_id, e.clinic_id) AS site_id,
    COALESCE(cr.lead_source::TEXT, eo.lead_source::TEXT, 'unknown') AS lead_source,
    COUNT(DISTINCT cr.id) AS leads_count,
    COUNT(DISTINCT CASE WHEN cr.episode_id IS NOT NULL THEN cr.id END) AS episodes_created_count,
    COUNT(DISTINCT CASE WHEN e.discharge_date IS NOT NULL THEN e.id END) AS episodes_discharged_count
  FROM public.care_requests cr
  LEFT JOIN public.episodes e ON e.id = cr.episode_id
  LEFT JOIN public.episode_origins eo ON eo.episode_id = e.id
  GROUP BY COALESCE(cr.site_id, e.clinic_id), COALESCE(cr.lead_source::TEXT, eo.lead_source::TEXT, 'unknown')
),
care_target_metrics AS (
  SELECT
    e.clinic_id AS site_id,
    COALESCE(cr.lead_source::TEXT, eo.lead_source::TEXT, 'unknown') AS lead_source,
    COUNT(DISTINCT ct.id) AS care_targets_count,
    COUNT(DISTINCT CASE WHEN ct.status = 'discharged' THEN ct.id END) AS care_targets_discharged_count,
    ROUND(AVG(
      CASE WHEN ct.status = 'discharged' AND ct.discharged_at IS NOT NULL 
           THEN EXTRACT(DAY FROM (ct.discharged_at - ct.created_at))
      END
    ), 0) AS median_days_to_resolution
  FROM public.care_targets ct
  JOIN public.episodes e ON e.id = ct.episode_id
  LEFT JOIN public.care_requests cr ON cr.episode_id = e.id
  LEFT JOIN public.episode_origins eo ON eo.episode_id = e.id
  GROUP BY e.clinic_id, COALESCE(cr.lead_source::TEXT, eo.lead_source::TEXT, 'unknown')
),
mcid_metrics AS (
  SELECT
    e.clinic_id AS site_id,
    COALESCE(cr.lead_source::TEXT, eo.lead_source::TEXT, 'unknown') AS lead_source,
    COUNT(DISTINCT ct.id) FILTER (WHERE ct.status = 'discharged') AS discharged_with_outcomes,
    ROUND(
      100.0 * COUNT(DISTINCT ct.id) FILTER (
        WHERE ct.status = 'discharged'
        AND EXISTS (
          SELECT 1 FROM public.outcome_scores os_b
          WHERE os_b.episode_id = ct.episode_id 
            AND os_b.index_type = ct.outcome_instrument
            AND os_b.score_type = 'baseline'
        )
        AND EXISTS (
          SELECT 1 FROM public.outcome_scores os_d
          WHERE os_d.episode_id = ct.episode_id 
            AND os_d.index_type = ct.outcome_instrument
            AND os_d.score_type = 'discharge'
        )
        AND (
          SELECT os_b.score - os_d.score >= 
            CASE ct.outcome_instrument
              WHEN 'NDI' THEN 7.5
              WHEN 'ODI' THEN 6.0
              WHEN 'QuickDASH' THEN 10.0
              WHEN 'LEFS' THEN -9.0
              ELSE 5.0
            END
          FROM public.outcome_scores os_b, public.outcome_scores os_d
          WHERE os_b.episode_id = ct.episode_id 
            AND os_b.index_type = ct.outcome_instrument
            AND os_b.score_type = 'baseline'
            AND os_d.episode_id = ct.episode_id 
            AND os_d.index_type = ct.outcome_instrument
            AND os_d.score_type = 'discharge'
          ORDER BY os_b.recorded_at ASC, os_d.recorded_at DESC
          LIMIT 1
        )
      ) / NULLIF(COUNT(DISTINCT ct.id) FILTER (WHERE ct.status = 'discharged'), 0),
      1
    ) AS mcid_met_rate
  FROM public.care_targets ct
  JOIN public.episodes e ON e.id = ct.episode_id
  LEFT JOIN public.care_requests cr ON cr.episode_id = e.id
  LEFT JOIN public.episode_origins eo ON eo.episode_id = e.id
  WHERE ct.outcome_instrument IS NOT NULL
  GROUP BY e.clinic_id, COALESCE(cr.lead_source::TEXT, eo.lead_source::TEXT, 'unknown')
)
SELECT 
  lc.site_id,
  lc.lead_source,
  lc.leads_count,
  lc.episodes_created_count,
  lc.episodes_discharged_count,
  COALESCE(ctm.care_targets_count, 0) AS care_targets_count,
  COALESCE(ctm.care_targets_discharged_count, 0) AS care_targets_discharged_count,
  CASE 
    WHEN ctm.median_days_to_resolution IS NULL THEN 'No Data'
    WHEN ctm.median_days_to_resolution <= 30 THEN '0-30 days'
    WHEN ctm.median_days_to_resolution <= 60 THEN '31-60 days'
    WHEN ctm.median_days_to_resolution <= 90 THEN '61-90 days'
    ELSE '90+ days'
  END AS median_time_to_resolution_bucket,
  COALESCE(mm.mcid_met_rate, 0) AS mcid_met_rate
FROM lead_counts lc
LEFT JOIN care_target_metrics ctm ON lc.site_id = ctm.site_id AND lc.lead_source = ctm.lead_source
LEFT JOIN mcid_metrics mm ON lc.site_id = mm.site_id AND lc.lead_source = mm.lead_source;

-- Step 7: Create analytics view - Resolution by Source (detailed)
CREATE OR REPLACE VIEW public.analytics_resolution_by_source
WITH (security_invoker = true)
AS
SELECT
  e.clinic_id AS site_id,
  COALESCE(cr.lead_source::TEXT, eo.lead_source::TEXT, 'unknown') AS lead_source,
  ct.outcome_instrument AS instrument_type,
  COUNT(DISTINCT ct.id) FILTER (WHERE ct.status = 'discharged') AS care_targets_discharged_count,
  ROUND(AVG(
    CASE WHEN ct.status = 'discharged' AND ct.discharged_at IS NOT NULL 
         THEN EXTRACT(DAY FROM (ct.discharged_at - ct.created_at))
    END
  ), 1) AS median_time_to_resolution,
  ROUND(AVG(
    CASE WHEN ct.status = 'discharged' THEN (
      SELECT os_b.score - os_d.score
      FROM public.outcome_scores os_b, public.outcome_scores os_d
      WHERE os_b.episode_id = ct.episode_id 
        AND os_b.index_type = ct.outcome_instrument
        AND os_b.score_type = 'baseline'
        AND os_d.episode_id = ct.episode_id 
        AND os_d.index_type = ct.outcome_instrument
        AND os_d.score_type = 'discharge'
      ORDER BY os_b.recorded_at ASC, os_d.recorded_at DESC
      LIMIT 1
    ) END
  ), 2) AS median_delta,
  ROUND(
    100.0 * COUNT(DISTINCT ct.id) FILTER (
      WHERE ct.status = 'discharged'
      AND EXISTS (
        SELECT 1 FROM public.outcome_scores os_b
        WHERE os_b.episode_id = ct.episode_id 
          AND os_b.index_type = ct.outcome_instrument
          AND os_b.score_type = 'baseline'
      )
      AND EXISTS (
        SELECT 1 FROM public.outcome_scores os_d
        WHERE os_d.episode_id = ct.episode_id 
          AND os_d.index_type = ct.outcome_instrument
          AND os_d.score_type = 'discharge'
      )
    ) / NULLIF(COUNT(DISTINCT ct.id) FILTER (WHERE ct.status = 'discharged'), 0),
    1
  ) AS mcid_met_rate
FROM public.care_targets ct
JOIN public.episodes e ON e.id = ct.episode_id
LEFT JOIN public.care_requests cr ON cr.episode_id = e.id
LEFT JOIN public.episode_origins eo ON eo.episode_id = e.id
WHERE ct.outcome_instrument IS NOT NULL
GROUP BY e.clinic_id, COALESCE(cr.lead_source::TEXT, eo.lead_source::TEXT, 'unknown'), ct.outcome_instrument;

-- Grant permissions
GRANT SELECT ON public.analytics_lead_funnel_by_source TO authenticated;
GRANT SELECT ON public.analytics_resolution_by_source TO authenticated;

-- Step 8: Add lead_source to research views for export compatibility
-- Drop and recreate v_research_care_targets to include lead_source
DROP VIEW IF EXISTS public.v_research_care_targets CASCADE;

CREATE VIEW public.v_research_care_targets 
WITH (security_invoker = true)
AS
SELECT
  ct.id AS care_target_uuid,
  ct.episode_id AS episode_uuid,
  pea.patient_id AS patient_uuid,
  e.clinic_id AS site_id,
  COALESCE(cr.lead_source::TEXT, eo.lead_source::TEXT) AS lead_source,
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
LEFT JOIN public.patient_episode_access pea ON pea.episode_id = ct.episode_id AND pea.is_active = true
LEFT JOIN public.care_requests cr ON cr.episode_id = e.id
LEFT JOIN public.episode_origins eo ON eo.episode_id = e.id;

GRANT SELECT ON public.v_research_care_targets TO authenticated;

-- Add audit logging trigger for lead_source changes
CREATE OR REPLACE FUNCTION public.audit_lead_source_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.lead_source IS DISTINCT FROM NEW.lead_source THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data
    ) VALUES (
      auth.uid(),
      'LEAD_SOURCE_CHANGED',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      jsonb_build_object('lead_source', OLD.lead_source),
      jsonb_build_object('lead_source', NEW.lead_source)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Attach audit trigger to care_requests
DROP TRIGGER IF EXISTS audit_care_request_lead_source ON public.care_requests;
CREATE TRIGGER audit_care_request_lead_source
  AFTER UPDATE ON public.care_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_lead_source_change();

-- Attach audit trigger to episode_origins
DROP TRIGGER IF EXISTS audit_episode_origin_lead_source ON public.episode_origins;
CREATE TRIGGER audit_episode_origin_lead_source
  AFTER UPDATE ON public.episode_origins
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_lead_source_change();