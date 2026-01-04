# PPC Research Export — Supported Cohort Definitions (v1)

**Schema Version:** v1  
**Last Updated:** 2026-01-04

---

## Overview

This document describes the cohort selection logic supported by the PPC de-identification export pipeline. Cohorts are defined by the combination of dataset type, date range, and export purpose.

---

## Supported Filters

### 1. Date Range (Required)

All exports require a start and end date. The system filters records based on time bucket fields:

| Dataset Type | Filter Field | Format |
|--------------|--------------|--------|
| `care_targets` | `episode_time_bucket` | YYYY-Q |
| `outcomes` | N/A (no date filter) | — |
| `episodes` | `episode_start_bucket` | YYYY-Q |

**Note:** Date filtering operates on quarter-bucketed time periods, not exact dates, to preserve de-identification.

### 2. Dataset Type (Required)

| Value | Description |
|-------|-------------|
| `care_targets` | Individual care target outcomes with MCID calculations |
| `outcomes` | Minimal outcome scores for statistical analysis |
| `episodes` | Episode-level aggregates and care target counts |

### 3. Export Purpose (Required)

| Value | Description |
|-------|-------------|
| `registry` | Registry submission (e.g., AAOS, FOTO) |
| `publication` | Academic publication datasets |
| `research` | General observational research |

---

## Future Enhancements (Not Yet Implemented)

The following cohort filters are planned for future releases:

- **Status-based filtering**: Filter by `care_target_status` or `episode_status`
- **Instrument-based filtering**: Filter by specific outcome instruments
- **Body region filtering**: Filter by anatomical region
- **Provider-based filtering**: Filter by treating clinician (pseudonymized)
- **MCID achievement filtering**: Filter to only MCID-met or not-met records

---

## Named Cohort Examples

### Example 1: "Last 90 Days — Discharged Care Targets"

**Current Implementation:**
```json
{
  "export_purpose": "registry",
  "dataset_type": "care_targets",
  "date_range_start": "2025-10-01",
  "date_range_end": "2026-01-04"
}
```

**Notes:** 
- Currently returns ALL care targets in date range
- Status filtering (`care_target_status = 'discharged'`) requires post-export filtering or future enhancement
- Returns: care target outcomes with baseline, discharge, delta, MCID status

---

### Example 2: "Last 12 Months — All Episodes"

**Current Implementation:**
```json
{
  "export_purpose": "research",
  "dataset_type": "episodes",
  "date_range_start": "2025-01-01",
  "date_range_end": "2026-01-04"
}
```

**Returns:**
- Episode-level aggregates
- Number of care targets per episode
- Episode status
- Time buckets (start/end quarters)

---

### Example 3: "Quarter-to-Date — Outcomes"

**Current Implementation:**
```json
{
  "export_purpose": "publication",
  "dataset_type": "outcomes",
  "date_range_start": "2025-10-01",
  "date_range_end": "2026-01-04"
}
```

**Notes:**
- Outcomes view currently returns all outcomes (no date filter applied)
- Minimal dataset: care_target reference, instrument, scores, MCID
- Ideal for statistical analysis of outcome distributions

---

## Cohort Selection via Admin UI

The Admin UI at `/admin-shell/research-exports` provides:

1. **Dataset Type** dropdown: care_targets, outcomes, episodes
2. **Export Purpose** dropdown: registry, publication, research
3. **Date Range** pickers: Start and end dates

All filters are applied server-side before data is returned.

---

## Technical Notes

- All cohort selection happens in the `create-research-export` edge function
- Views are read-only (SECURITY INVOKER)
- No cohort selection modifies production data
- Each export is logged to `research_exports` manifest table

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-01-04 | Initial cohort documentation |
