# PPC Export Accuracy Audit

**Version:** v1  
**Date:** 2026-01-04

---

## Overview

This document defines the audit process for validating de-identified research exports. It includes both automated checks (implemented in `scripts/audit-research-export.ts`) and manual spot-check requirements.

---

## Part 1: Automated Checks

### 1.1 Header Validation

**Check:** Verify exported CSV headers match the allowlisted columns for the dataset type.

| Dataset | Allowed Headers |
|---------|-----------------|
| care_targets | care_target_pid, episode_pid, patient_pid, body_region, instrument_type, baseline_score, discharge_score, score_delta, mcid_threshold, mcid_met, care_target_status, age_band_at_episode_start, episode_time_bucket |
| outcomes | care_target_pid, instrument_type, baseline_score, discharge_score, score_delta, mcid_met |
| episodes | episode_pid, patient_pid, episode_start_bucket, episode_end_bucket, number_of_care_targets, episode_status |

**Pass Criteria:** All headers in export match allowed list; no unexpected headers.

---

### 1.2 PHI Pattern Scan

**Check:** Scan exported file contents for patterns that may indicate PHI leakage.

| Pattern Type | Regex | Example Match |
|--------------|-------|---------------|
| Email | `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/` | john@example.com |
| Phone (US) | `/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/` | 555-123-4567 |
| SSN | `/\b\d{3}-\d{2}-\d{4}\b/` | 123-45-6789 |
| Street Address | `/\b\d+\s+[A-Za-z]+\s+(St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Ln|Lane)\b/i` | 123 Main St |
| Date of Birth | `/\b(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}\b/` | 01/15/1985 |

**Pass Criteria:** Zero matches for all PHI patterns.

---

### 1.3 Forbidden Column Check

**Check:** Confirm no forbidden columns are present in the export.

**Forbidden Columns:**
- name, patient_name
- dob, date_of_birth
- email, patient_email
- phone, patient_phone
- address, patient_address
- ssn, social_security
- emergency_contact
- insurance

**Pass Criteria:** No forbidden columns in header row.

---

### 1.4 Row Count Verification

**Check:** Confirm exported row count matches the source query count.

**Process:**
1. Parse export manifest for `row_count`
2. Query research view with same filters
3. Compare counts

**Pass Criteria:** Export row count = Query row count (tolerance: 0)

---

### 1.5 Pseudonym ID Stability

**Check:** Verify that the same source UUID produces the same pseudonymized ID throughout the file.

**Process:**
1. Extract all `*_pid` columns
2. Group by original reference (if available) or by unique values
3. Verify no UUID appears with multiple different PIDs

**Pass Criteria:** Each unique pseudonym ID maps to exactly one conceptual entity.

---

## Part 2: Automated Check Script

The automated checks are implemented in:

```
scripts/audit-research-export.ts
```

### Usage

```bash
# Run audit on a downloaded export file
npx ts-node scripts/audit-research-export.ts path/to/export.csv care_targets
```

### Output

```
PPC Export Accuracy Audit
=========================
File: path/to/export.csv
Dataset Type: care_targets

[1/5] Header Validation........... ✅ PASS
[2/5] PHI Pattern Scan............ ✅ PASS
[3/5] Forbidden Column Check...... ✅ PASS
[4/5] Row Count................... 42 rows
[5/5] Pseudonym ID Stability...... ✅ PASS

Overall Result: ✅ ALL CHECKS PASSED
```

---

## Part 3: Human Spot-Check Requirements

Automated checks cannot catch all issues. A human reviewer must complete the following:

### 3.1 Spot-Check Form

| Field | Value |
|-------|-------|
| **Reviewer Name** | |
| **Review Date** | |
| **Export ID** | |
| **Dataset Type** | |
| **Sample Size Reviewed** | 10 rows (minimum) |

### 3.2 Row-Level Inspection Checklist

For each of 10 randomly selected rows, verify:

| # | Row | No Names | No DOB | No Email | No Phone | No Address | IDs Pseudonymized | Ages Banded | Dates Bucketed |
|---|-----|----------|--------|----------|----------|------------|-------------------|-------------|----------------|
| 1 | | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 3 | | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 4 | | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 5 | | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6 | | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 7 | | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 8 | | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 9 | | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 10 | | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

### 3.3 Attestation

```
I, [Reviewer Name], have completed a manual spot-check of [Export ID].

I reviewed [10] randomly selected rows and verified that:
- No direct identifiers (names, DOB, contact info) were present
- All IDs were properly pseudonymized
- Age values were banded (not exact)
- Dates were quarter-bucketed

☐ PASS - Export meets de-identification requirements
☐ FAIL - Issues found (documented below)

Issues (if any):
__________________________________________________
__________________________________________________

Signature: _______________________
Date: ___________________________
```

---

## Part 4: Audit Schedule

| Trigger | Audit Required |
|---------|----------------|
| First export after schema change | Full automated + human review |
| Weekly batch exports | Automated only |
| Registry submission | Full automated + human review |
| Publication dataset | Full automated + human review |
| Quarterly review | Full automated + human review |

---

## Part 5: Issue Resolution

If an audit fails:

1. **STOP** - Do not distribute the export
2. **DOCUMENT** - Record the specific failure
3. **INVESTIGATE** - Determine root cause
4. **FIX** - Update views/function as needed
5. **RE-EXPORT** - Generate new export
6. **RE-AUDIT** - Run full audit again

---

## Related Documents

- [Data Dictionary](./PPC-Research-Export-Data-Dictionary.md)
- [De-Identification Pipeline](./PPC-De-Identification-Export-Pipeline.md)
- [Sample Export Reference](./PPC-Sample-Export-Reference.md)

---

*This audit template must be completed for all registry submissions and publication datasets.*
