# PPC Sample Export Reference

**Version:** 1.0  
**Date:** 2026-01-04

---

## Overview

This document references sample de-identified exports generated for validation and evidence purposes.

---

## Sample Export Generation

To generate a sample export:

1. Navigate to **Admin Shell → Research Exports** (`/admin-shell/research-exports`)
2. Configure export parameters:
   - **Dataset Type:** care_targets
   - **Export Purpose:** research
   - **Date Range:** Last 90 days (or available data range)
3. Click **Create Export**
4. Download the generated CSV file

---

## Sample Export Record

| Field | Value |
|-------|-------|
| **Export ID** | (Generated on first export) |
| **Dataset Type** | care_targets |
| **Export Purpose** | research |
| **Date Range Start** | 2025-10-01 |
| **Date Range End** | 2026-01-04 |
| **Row Count** | (Varies by available data) |
| **Schema Version** | 1.0.0 |
| **Hash Version** | v1 |

---

## Storage Location

Exports are:

1. **Immediately downloaded** to the user's browser
2. **Logged** in the `research_exports` manifest table
3. **Audited** in the `audit_logs` table

**Note:** Current implementation returns CSV directly as download. Future versions may store to encrypted storage with `storage_path` recorded in manifest.

---

## Validation Checklist

When generating a sample export, verify:

- [ ] CSV downloads successfully
- [ ] Headers match expected columns (see Data Dictionary)
- [ ] No PHI fields present (name, DOB, email, phone, address)
- [ ] IDs are pseudonymized (e.g., `PAT_abc123...`, `EPI_def456...`)
- [ ] Age bands are categorical, not exact ages
- [ ] Dates are quarter-bucketed (YYYY-Q format)
- [ ] Export appears in history table in Admin UI
- [ ] Audit log entry created

---

## Expected CSV Structure

### care_targets Dataset

```csv
care_target_pid,episode_pid,patient_pid,body_region,instrument_type,baseline_score,discharge_score,score_delta,mcid_threshold,mcid_met,care_target_status,age_band_at_episode_start,episode_time_bucket
CAR_a1b2c3d4e5f6g7h8,EPI_b2c3d4e5f6g7h8i9,PAT_c3d4e5f6g7h8i9j0,Cervical,NDI,45,32,13,7,true,discharged,40-49,2025-Q4
```

### outcomes Dataset

```csv
care_target_pid,instrument_type,baseline_score,discharge_score,score_delta,mcid_met
CAR_a1b2c3d4e5f6g7h8,NDI,45,32,13,true
```

### episodes Dataset

```csv
episode_pid,patient_pid,episode_start_bucket,episode_end_bucket,number_of_care_targets,episode_status
EPI_b2c3d4e5f6g7h8i9,PAT_c3d4e5f6g7h8i9j0,2025-Q3,2025-Q4,2,discharged
```

---

## Re-Generating Samples

Sample exports can be regenerated at any time through the Admin UI. Each generation:

1. Creates a new manifest record
2. Logs to audit trail
3. Uses current pseudonymization salt
4. Reflects current data state

---

## Related Documents

- [Data Dictionary](./PPC-Research-Export-Data-Dictionary.md)
- [Cohort Definitions](./PPC-Research-Export-Cohorts.md)
- [Export Accuracy Audit](./PPC-Export-Accuracy-Audit-v1.md)
- [De-Identification Pipeline](./PPC-De-Identification-Export-Pipeline.md)

---

*This reference document should be updated after each formal sample export generation.*
