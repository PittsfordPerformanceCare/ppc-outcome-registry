# PPC Research Export — Data Dictionary

**Schema Version:** v1  
**Last Updated:** 2026-01-04

---

## Overview

This data dictionary defines all fields available in PPC de-identified research exports. Each dataset type has a corresponding research view that excludes PHI and applies appropriate transformations.

---

## v_research_care_targets

De-identified care target outcomes for registry and publication use.

| Column Name | Data Type | Description | Source View | Transformations | Notes / Allowed Values |
|-------------|-----------|-------------|-------------|-----------------|------------------------|
| care_target_uuid | UUID | Unique care target identifier | care_targets.id | Pseudonymized to `care_target_pid` on export | Becomes `CAR_[16-char-hash]` |
| episode_uuid | TEXT | Parent episode identifier | care_targets.episode_id | Pseudonymized to `episode_pid` on export | Becomes `EPI_[16-char-hash]` |
| patient_uuid | UUID | Patient identifier | episodes.user_id (via join) | Pseudonymized to `patient_pid` on export | Becomes `PAT_[16-char-hash]` |
| site_id | UUID | Site/clinic identifier | episodes.clinic_id | Pseudonymized to `site_pid` on export | Becomes `SIT_[16-char-hash]` |
| body_region | TEXT | Anatomical region of care target | care_targets.body_region | None | e.g., "Lumbar Spine", "Cervical", "Knee" |
| instrument_type | TEXT | Outcome measurement instrument | care_targets.outcome_instrument | None | e.g., "NDI", "ODI", "LEFS", "DASH" |
| baseline_score | NUMERIC | Initial outcome score | outcome_scores (baseline) | Aggregated from earliest score | Numeric, instrument-specific scale |
| discharge_score | NUMERIC | Final outcome score | outcome_scores (discharge) | Aggregated from latest score | Numeric, instrument-specific scale |
| score_delta | NUMERIC | Change from baseline to discharge | Calculated | `baseline_score - discharge_score` | Positive = improvement |
| mcid_threshold | NUMERIC | MCID threshold for instrument | Hardcoded per instrument | Fixed lookup | NDI=7, ODI=10, LEFS=9, etc. |
| mcid_met | BOOLEAN | Whether MCID was achieved | Calculated | `score_delta >= mcid_threshold` | true/false |
| care_target_status | TEXT | Current status of care target | care_targets.status | None | "active", "discharged", "on_hold" |
| age_band_at_episode_start | TEXT | De-identified age range | episodes.date_of_birth | Bucketed from DOB | "Pediatric (<18)", "18-29", "30-39", "40-49", "50-59", "60-69", "70+" |
| episode_time_bucket | TEXT | Episode start quarter | episodes.start_date | Quarter bucketed | "YYYY-Q1", "YYYY-Q2", etc. |

---

## v_research_outcomes

Minimal outcome scores for statistical analysis.

| Column Name | Data Type | Description | Source View | Transformations | Notes / Allowed Values |
|-------------|-----------|-------------|-------------|-----------------|------------------------|
| care_target_uuid | UUID | Care target identifier | care_targets.id | Pseudonymized to `care_target_pid` on export | Becomes `CAR_[16-char-hash]` |
| site_id | UUID | Site/clinic identifier | episodes.clinic_id | Pseudonymized to `site_pid` on export | Becomes `SIT_[16-char-hash]` |
| instrument_type | TEXT | Outcome measurement instrument | care_targets.outcome_instrument | None | e.g., "NDI", "ODI", "LEFS", "DASH" |
| baseline_score | NUMERIC | Initial outcome score | outcome_scores (baseline) | Aggregated from earliest score | Numeric, instrument-specific scale |
| discharge_score | NUMERIC | Final outcome score | outcome_scores (discharge) | Aggregated from latest score | Numeric, instrument-specific scale |
| score_delta | NUMERIC | Change from baseline to discharge | Calculated | `baseline_score - discharge_score` | Positive = improvement |
| mcid_met | BOOLEAN | Whether MCID was achieved | Calculated | `score_delta >= mcid_threshold` | true/false |

---

## v_research_episodes

Episode-level aggregates without identifiers.

| Column Name | Data Type | Description | Source View | Transformations | Notes / Allowed Values |
|-------------|-----------|-------------|-------------|-----------------|------------------------|
| episode_uuid | TEXT | Unique episode identifier | episodes.id | Pseudonymized to `episode_pid` on export | Becomes `EPI_[16-char-hash]` |
| patient_uuid | UUID | Patient identifier | episodes.user_id | Pseudonymized to `patient_pid` on export | Becomes `PAT_[16-char-hash]` |
| site_id | UUID | Site/clinic identifier | episodes.clinic_id | Pseudonymized to `site_pid` on export | Becomes `SIT_[16-char-hash]` |
| episode_start_bucket | TEXT | Episode start quarter | episodes.start_date | Quarter bucketed | "YYYY-Q1", "YYYY-Q2", etc. |
| episode_end_bucket | TEXT | Episode end quarter | episodes.discharge_date | Quarter bucketed | "YYYY-Q1", "YYYY-Q2", etc., or NULL |
| number_of_care_targets | INTEGER | Count of care targets | care_targets (aggregated) | COUNT per episode | Integer >= 0 |
| episode_status | TEXT | Current episode status | episodes.current_status | Cast to TEXT | "intake", "active", "discharged", etc. |

---

## Transformation Reference

### Pseudonymization (Export-Time)

Applied by the `create-research-export` edge function:

```
pseudonymizeId(inputId, prefix) → prefix_[16-char-SHA256-hex]
```

| Original Field | Exported Field | Prefix |
|----------------|----------------|--------|
| `care_target_uuid` | `care_target_pid` | CAR |
| `episode_uuid` | `episode_pid` | EPI |
| `patient_uuid` | `patient_pid` | PAT |

**Properties:**
- Stable: Same input always produces same output
- Non-reversible: Cannot derive original ID from hash
- Uses server-side salt (not exposed)

### Age Banding (View-Level)

Applied in `v_research_care_targets` view:

| Age Range | Band Label |
|-----------|------------|
| < 18 | "Pediatric (<18)" |
| 18-29 | "18-29" |
| 30-39 | "30-39" |
| 40-49 | "40-49" |
| 50-59 | "50-59" |
| 60-69 | "60-69" |
| >= 70 | "70+" |
| Unknown | "Unknown" |

### Time Bucketing (View-Level)

Applied in views to convert dates to quarters:

```sql
TO_CHAR(date_field, 'YYYY') || '-Q' || TO_CHAR(date_field, 'Q')
```

Example: `2025-03-15` → `"2025-Q1"`

### MCID Calculation (View-Level)

```sql
CASE instrument_type
  WHEN 'NDI' THEN 7
  WHEN 'ODI' THEN 10
  WHEN 'LEFS' THEN 9
  WHEN 'DASH' THEN 10
  WHEN 'QuickDASH' THEN 8
  ELSE 5  -- Default
END
```

---

## Excluded Fields (PHI)

The following fields are explicitly excluded from all research views:

| Field Type | Examples | Reason |
|------------|----------|--------|
| Names | patient_name, emergency_contact | Direct identifier |
| Dates of Birth | date_of_birth | Direct identifier (age-banded instead) |
| Contact Info | email, phone, address | Direct identifier |
| Free Text | clinical_impression, notes | May contain PHI |
| Emergency Contacts | emergency_contact, emergency_phone | Direct identifier |
| Insurance | insurance, insurance_id | Potential re-identification |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-01-04 | Initial data dictionary |
