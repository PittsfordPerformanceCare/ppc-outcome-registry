-- Fix SECURITY DEFINER views by recreating with SECURITY INVOKER

-- Drop and recreate View 1
DROP VIEW IF EXISTS public.analytics_care_target_outcomes;
CREATE VIEW public.analytics_care_target_outcomes 
WITH (security_invoker = true) AS
SELECT 
  ct.id AS care_target_id,
  ct.episode_id,
  ct.name AS care_target_name,
  ct.domain,
  ct.body_region,
  ct.status AS care_target_status,
  ct.created_at AS care_target_start_date,
  ct.discharged_at AS care_target_discharge_date,
  EXTRACT(DAY FROM (ct.discharged_at - ct.created_at))::INTEGER AS duration_to_resolution_days,
  ct.discharge_reason,
  ct.outcome_instrument,
  baseline.score AS baseline_score,
  baseline.recorded_at AS baseline_recorded_at,
  discharge.score AS discharge_score,
  discharge.recorded_at AS discharge_recorded_at,
  CASE 
    WHEN baseline.score IS NOT NULL AND discharge.score IS NOT NULL 
    THEN baseline.score - discharge.score
    ELSE NULL
  END AS outcome_delta,
  CASE 
    WHEN baseline.score IS NOT NULL AND discharge.score IS NOT NULL THEN
      CASE 
        WHEN baseline.score > discharge.score THEN 'improved'
        WHEN baseline.score < discharge.score THEN 'worsened'
        ELSE 'unchanged'
      END
    ELSE 'incomplete'
  END AS outcome_direction,
  CASE 
    WHEN baseline.score IS NOT NULL AND discharge.score IS NOT NULL THEN 'complete'
    WHEN eotl.override_at IS NOT NULL THEN 'override'
    ELSE 'incomplete'
  END AS outcome_integrity_status,
  eotl.override_reason AS integrity_override_reason,
  e.patient_name,
  e.clinic_id,
  e.user_id AS clinician_id,
  e.episode_type,
  e.current_status AS episode_status
FROM care_targets ct
LEFT JOIN episodes e ON e.id = ct.episode_id
LEFT JOIN LATERAL (
  SELECT os.score, os.recorded_at
  FROM outcome_scores os
  WHERE os.episode_id = ct.episode_id AND os.score_type = 'baseline'
  ORDER BY os.recorded_at ASC LIMIT 1
) baseline ON true
LEFT JOIN LATERAL (
  SELECT os.score, os.recorded_at
  FROM outcome_scores os
  WHERE os.episode_id = ct.episode_id AND os.score_type = 'discharge'
  ORDER BY os.recorded_at DESC LIMIT 1
) discharge ON true
LEFT JOIN episode_outcome_tool_locks eotl ON eotl.episode_id = ct.episode_id
WHERE ct.status = 'DISCHARGED';

-- Drop and recreate View 2
DROP VIEW IF EXISTS public.analytics_episode_summary;
CREATE VIEW public.analytics_episode_summary 
WITH (security_invoker = true) AS
SELECT 
  e.id AS episode_id,
  e.patient_name,
  e.clinic_id,
  e.user_id AS clinician_id,
  e.clinician AS clinician_name,
  e.episode_type,
  e.current_status AS episode_status,
  e.start_date AS episode_start_date,
  e.discharge_date AS episode_close_date,
  EXTRACT(DAY FROM (COALESCE(e.discharge_date, CURRENT_DATE)::timestamp - e.start_date::timestamp))::INTEGER AS episode_duration_days,
  COALESCE(ct_counts.total_care_targets, 0) AS number_of_care_targets,
  COALESCE(ct_counts.discharged_count, 0) AS number_discharged,
  COALESCE(ct_counts.monitor_count, 0) AS number_monitor_only,
  COALESCE(ct_counts.active_count, 0) AS number_active,
  COALESCE(ct_counts.maintenance_count, 0) AS number_maintenance,
  COALESCE(ct_counts.total_care_targets, 0) AS number_active_at_peak,
  CASE 
    WHEN ct_counts.discharged_count > 1 
      AND ct_counts.first_discharge_date != ct_counts.last_discharge_date 
    THEN true ELSE false 
  END AS staggered_resolution,
  CASE 
    WHEN ct_counts.discharged_count > 1 
    THEN EXTRACT(DAY FROM (ct_counts.last_discharge_date - ct_counts.first_discharge_date))::INTEGER
    ELSE 0
  END AS resolution_span_days,
  e.created_at,
  e.updated_at
FROM episodes e
LEFT JOIN LATERAL (
  SELECT 
    COUNT(*) AS total_care_targets,
    COUNT(*) FILTER (WHERE ct.status = 'DISCHARGED') AS discharged_count,
    COUNT(*) FILTER (WHERE ct.status = 'MONITOR') AS monitor_count,
    COUNT(*) FILTER (WHERE ct.status = 'ACTIVE') AS active_count,
    COUNT(*) FILTER (WHERE ct.status = 'MAINTENANCE') AS maintenance_count,
    MIN(ct.discharged_at) AS first_discharge_date,
    MAX(ct.discharged_at) AS last_discharge_date
  FROM care_targets ct
  WHERE ct.episode_id = e.id
) ct_counts ON true;

-- Drop and recreate View 3
DROP VIEW IF EXISTS public.analytics_registry_export;
CREATE VIEW public.analytics_registry_export 
WITH (security_invoker = true) AS
SELECT 
  ct.id AS care_target_id,
  ct.episode_id,
  ct.name AS care_target_name,
  ct.domain,
  ct.body_region,
  ct.created_at::date AS care_target_start_date,
  ct.discharged_at::date AS care_target_discharge_date,
  EXTRACT(DAY FROM (ct.discharged_at - ct.created_at))::INTEGER AS duration_days,
  ct.discharge_reason,
  ct.status AS final_status,
  ct.outcome_instrument,
  baseline.score AS baseline_score,
  discharge.score AS discharge_score,
  CASE 
    WHEN baseline.score IS NOT NULL AND discharge.score IS NOT NULL 
    THEN baseline.score - discharge.score
    ELSE NULL
  END AS raw_delta,
  CASE 
    WHEN baseline.score IS NOT NULL AND discharge.score IS NOT NULL THEN
      CASE 
        WHEN baseline.score > discharge.score THEN 'improved'
        WHEN baseline.score < discharge.score THEN 'worsened'
        ELSE 'unchanged'
      END
    ELSE 'incomplete'
  END AS outcome_classification,
  CASE 
    WHEN baseline.score IS NOT NULL AND discharge.score IS NOT NULL THEN
      CASE ct.outcome_instrument
        WHEN 'NDI' THEN (baseline.score - discharge.score) >= 7.5
        WHEN 'ODI' THEN (baseline.score - discharge.score) >= 6.0
        WHEN 'QuickDASH' THEN (baseline.score - discharge.score) >= 10.0
        WHEN 'LEFS' THEN (discharge.score - baseline.score) >= 9.0
        ELSE NULL
      END
    ELSE NULL
  END AS mcid_achieved,
  CASE 
    WHEN baseline.score IS NOT NULL AND discharge.score IS NOT NULL THEN 'complete'
    WHEN eotl.override_at IS NOT NULL THEN 'override'
    ELSE 'incomplete'
  END AS data_quality_status,
  eotl.override_reason,
  e.episode_type,
  e.clinic_id,
  EXTRACT(YEAR FROM e.start_date) AS episode_year,
  EXTRACT(QUARTER FROM e.start_date) AS episode_quarter
FROM care_targets ct
LEFT JOIN episodes e ON e.id = ct.episode_id
LEFT JOIN LATERAL (
  SELECT os.score FROM outcome_scores os
  WHERE os.episode_id = ct.episode_id AND os.score_type = 'baseline'
  ORDER BY os.recorded_at ASC LIMIT 1
) baseline ON true
LEFT JOIN LATERAL (
  SELECT os.score FROM outcome_scores os
  WHERE os.episode_id = ct.episode_id AND os.score_type = 'discharge'
  ORDER BY os.recorded_at DESC LIMIT 1
) discharge ON true
LEFT JOIN episode_outcome_tool_locks eotl ON eotl.episode_id = ct.episode_id
WHERE ct.status = 'DISCHARGED';