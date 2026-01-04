# PPC Registry Dataset Description

**Document Type:** IRB-Ready Dataset Description  
**Version:** 1.0  
**Date:** 2026-01-04

---

## 1. Purpose

The PPC (Patient Progress Care) Unified Platform generates de-identified observational datasets for:

- **Registry submission** (e.g., AAOS, FOTO, specialty registries)
- **Academic publication** supporting outcomes research
- **Internal quality improvement** and benchmarking
- **Observational research** on musculoskeletal and neurological care outcomes

These datasets support population-level analysis of care target outcomes, MCID achievement rates, and episode characteristics without exposing Protected Health Information (PHI).

---

## 2. Unit of Analysis

### Primary: Care Target

A Care Target represents a discrete clinical objective within an episode (e.g., "reduce neck pain," "improve lumbar function"). Each Care Target is associated with:

- A validated outcome instrument (NDI, ODI, LEFS, DASH, etc.)
- Baseline and discharge scores
- MCID achievement status
- Anatomical body region

### Secondary: Episode

An Episode represents a patient's complete course of care, potentially containing multiple Care Targets addressing different complaints.

---

## 3. Data Types Included

| Category | Fields | Description |
|----------|--------|-------------|
| **Outcomes** | baseline_score, discharge_score, score_delta | Numeric outcome measure scores |
| **MCID Analysis** | mcid_threshold, mcid_met | Clinically meaningful improvement |
| **Temporality** | episode_time_bucket, episode_start_bucket, episode_end_bucket | Quarter-bucketed time periods |
| **Demographics** | age_band_at_episode_start | De-identified age ranges |
| **Clinical** | body_region, instrument_type | Anatomical and measurement classification |
| **Status** | care_target_status, episode_status | Current state of care |
| **Identifiers** | patient_pid, episode_pid, care_target_pid | Stable pseudonymized IDs |

---

## 4. De-Identification Methods

All exports comply with HIPAA Safe Harbor de-identification principles:

### 4.1 Direct Identifier Removal

The following are **never included** in research exports:

- Patient names
- Dates of birth (exact)
- Email addresses
- Phone numbers
- Physical addresses
- Free-text clinical notes
- Emergency contact information
- Insurance information

### 4.2 Stable Salted SHA-256 Pseudonymization

All entity identifiers are transformed using a server-side cryptographic hash:

```
pseudonymizeId(originalId) → PREFIX_[16-char-hex-hash]
```

**Properties:**
- **Stable:** Same input produces same output within export batch
- **Non-reversible:** Cannot derive original ID from hash
- **Server-side salt:** Secret never exposed to client or export
- **Longitudinally usable:** Researchers can track entities across records

**Generated Pseudonym IDs:**
| Original | Pseudonymized | Example |
|----------|---------------|---------|
| patient_uuid | patient_pid | `PAT_a1b2c3d4e5f6g7h8` |
| episode_uuid | episode_pid | `EPI_b2c3d4e5f6g7h8i9` |
| care_target_uuid | care_target_pid | `CAR_c3d4e5f6g7h8i9j0` |

### 4.3 Age Banding

Exact dates of birth are replaced with age bands:

| Age Range | Label |
|-----------|-------|
| < 18 years | Pediatric (<18) |
| 18-29 years | 18-29 |
| 30-39 years | 30-39 |
| 40-49 years | 40-49 |
| 50-59 years | 50-59 |
| 60-69 years | 60-69 |
| ≥ 70 years | 70+ |

### 4.4 Date Bucketing (YYYY-Q)

All dates are converted to year-quarter format:

- `2025-03-15` → `2025-Q1`
- `2025-11-20` → `2025-Q4`

This prevents re-identification while preserving temporal analysis capability.

### 4.5 Provider Anonymization

If provider information is included in future versions, it will be pseudonymized using the same SHA-256 method, producing stable `provider_pid` values.

---

## 5. Explicit Exclusions

| Data Type | Status | Reason |
|-----------|--------|--------|
| Patient names | ❌ Excluded | Direct identifier |
| Dates of birth | ❌ Excluded | Direct identifier (age-banded) |
| Street addresses | ❌ Excluded | Direct identifier |
| Email addresses | ❌ Excluded | Direct identifier |
| Phone numbers | ❌ Excluded | Direct identifier |
| Free-text notes | ❌ Excluded | May contain embedded PHI |
| Insurance info | ❌ Excluded | Potential re-identification |
| IP addresses | ❌ Excluded | Not collected in exports |

---

## 6. Governance Controls

### 6.1 Access Control

- Exports require `admin` or `owner` role
- Role verified server-side before data access
- No "quick export" paths bypass verification

### 6.2 Audit Logging

Every export creates:

1. **Export manifest** in `research_exports` table:
   - Export ID
   - Creator user ID
   - Purpose (registry/publication/research)
   - Dataset type
   - Date range
   - Row count
   - Schema version

2. **Audit log** entry in `audit_logs` table:
   - Timestamp
   - User ID
   - Action: `RESEARCH_EXPORT_CREATED`
   - Metadata

### 6.3 Export Manifest

| Field | Description |
|-------|-------------|
| id | Unique export identifier |
| created_by | User who generated export |
| export_purpose | registry, publication, research |
| dataset_type | care_targets, outcomes, episodes |
| date_range_start | Filter start date |
| date_range_end | Filter end date |
| row_count | Number of records exported |
| hash_version | Pseudonymization version (v1) |
| schema_version | Data schema version (1.0.0) |

---

## 7. Intended Uses

| Use Case | Supported |
|----------|-----------|
| Registry submission | ✅ Yes |
| Academic publication | ✅ Yes |
| Quality benchmarking | ✅ Yes |
| Observational research | ✅ Yes |
| Treatment recommendations | ❌ No |
| Diagnostic claims | ❌ No |
| Causal inference | ❌ No (observational only) |

---

## 8. Contact

For questions about dataset specifications, access, or governance:

- **Technical:** Platform administrator via Admin Shell
- **Compliance:** Organization's HIPAA Privacy Officer

---

*This document is intended to accompany IRB submissions and registry applications.*
