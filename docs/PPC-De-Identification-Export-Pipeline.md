# PPC De-Identification Export Pipeline

## Overview

The PPC Unified Platform includes a governance-grade de-identification export pipeline for generating research-ready datasets without exposing Protected Health Information (PHI).

**Core Principle:** Production data remains fully identifiable for care delivery. De-identified datasets are generated only through a controlled export pipeline with full audit trails.

---

## Architecture

### Three-Layer Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION LAYER                              │
│    (Unchanged - Full PHI for clinical care)                     │
│    episodes, care_targets, outcome_scores, patient_accounts     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Read-Only Views)
┌─────────────────────────────────────────────────────────────────┐
│                 RESEARCH VIEW LAYER                              │
│    v_research_care_targets                                       │
│    v_research_outcomes                                           │
│    v_research_episodes                                           │
│                                                                  │
│    ✓ No names, DOB, email, phone, address                       │
│    ✓ No free-text fields                                        │
│    ✓ Age bands instead of exact ages                            │
│    ✓ Time buckets (YYYY-Q) instead of exact dates               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Edge Function)
┌─────────────────────────────────────────────────────────────────┐
│                  EXPORT JOB LAYER                                │
│    create-research-export edge function                          │
│                                                                  │
│    ✓ Admin/Owner role verification                              │
│    ✓ Pseudonymized IDs (SHA-256 hash)                           │
│    ✓ CSV file generation                                        │
│    ✓ Export manifest logging                                    │
│    ✓ Audit trail creation                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Research Views

### v_research_care_targets

De-identified care target outcomes for registry and publication use.

| Field | Type | Description |
|-------|------|-------------|
| care_target_uuid | UUID | Original care target ID |
| episode_uuid | TEXT | Episode reference |
| patient_uuid | UUID | Patient reference |
| body_region | TEXT | Anatomical region |
| instrument_type | TEXT | Outcome measure used |
| baseline_score | NUMERIC | Initial score |
| discharge_score | NUMERIC | Final score |
| score_delta | NUMERIC | Calculated change |
| mcid_threshold | NUMERIC | MCID for instrument |
| mcid_met | BOOLEAN | Whether MCID was achieved |
| care_target_status | TEXT | Current status |
| age_band_at_episode_start | TEXT | De-identified age range |
| episode_time_bucket | TEXT | YYYY-Q format |

### v_research_outcomes

Minimal outcome scores for statistical analysis.

| Field | Type | Description |
|-------|------|-------------|
| care_target_uuid | UUID | Care target reference |
| instrument_type | TEXT | Outcome measure |
| baseline_score | NUMERIC | Initial score |
| discharge_score | NUMERIC | Final score |
| score_delta | NUMERIC | Improvement amount |
| mcid_met | BOOLEAN | MCID achievement |

### v_research_episodes

Episode-level aggregates without identifiers.

| Field | Type | Description |
|-------|------|-------------|
| episode_uuid | TEXT | Episode reference |
| patient_uuid | UUID | Patient reference |
| episode_start_bucket | TEXT | Start quarter (YYYY-Q) |
| episode_end_bucket | TEXT | End quarter (YYYY-Q) |
| number_of_care_targets | INTEGER | Care target count |
| episode_status | TEXT | Current status |

---

## Pseudonymization

All IDs are transformed using a server-side hash function:

```
pseudonymizeId(inputId, prefix) → prefix_[16-char-hex-hash]
```

**Properties:**
- **Stable**: Same input always produces same output
- **Non-reversible**: Cannot derive original ID from hash
- **Server-side salt**: Uses environment secret, not exposed to client
- **Longitudinally usable**: Researchers can track entities across exports

**Generated PIDs:**
- `patient_pid` → `PAT_a1b2c3d4e5f6g7h8`
- `episode_pid` → `EPI_b2c3d4e5f6g7h8i9`
- `care_target_pid` → `CAR_c3d4e5f6g7h8i9j0`

---

## Export Manifest

Every export creates a manifest record:

```sql
CREATE TABLE public.research_exports (
  id UUID PRIMARY KEY,
  created_by UUID NOT NULL,
  export_purpose TEXT NOT NULL,  -- 'registry', 'publication', 'research'
  dataset_type TEXT NOT NULL,    -- 'care_targets', 'outcomes', 'episodes'
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  row_count INTEGER NOT NULL,
  hash_version TEXT NOT NULL,    -- 'v1'
  schema_version TEXT NOT NULL,  -- '1.0.0'
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

---

## Admin UI

Access: `/admin-shell/research-exports`

**Features:**
1. Create new de-identified exports
2. Select dataset type (care_targets, outcomes, episodes)
3. Select export purpose (registry, publication, research)
4. Specify date range
5. Download CSV immediately
6. View export history (read-only)

**Access Control:**
- Requires `admin` or `owner` role
- Verified server-side before data access
- All exports logged to audit trail

---

## Security Guardrails

### What's Excluded
- ❌ Patient names
- ❌ Dates of birth
- ❌ Email addresses
- ❌ Phone numbers
- ❌ Physical addresses
- ❌ Free-text clinical notes
- ❌ Emergency contacts
- ❌ Insurance information

### What's Included
- ✅ Pseudonymized IDs
- ✅ Age bands (pediatric, 18-29, 30-39, etc.)
- ✅ Time buckets (YYYY-Q)
- ✅ Body regions
- ✅ Outcome instrument types
- ✅ Numeric scores
- ✅ MCID calculations
- ✅ Status enumerations

---

## Usage Examples

### Registry Submission

```javascript
const response = await supabase.functions.invoke('create-research-export', {
  body: {
    export_purpose: 'registry',
    dataset_type: 'care_targets',
    date_range_start: '2024-01-01',
    date_range_end: '2024-12-31'
  }
});
```

### Publication Dataset

```javascript
const response = await supabase.functions.invoke('create-research-export', {
  body: {
    export_purpose: 'publication',
    dataset_type: 'outcomes',
    date_range_start: '2023-01-01',
    date_range_end: '2025-01-01'
  }
});
```

---

## Compliance Notes

1. **HIPAA Safe Harbor**: Age bands and date bucketing align with Safe Harbor de-identification method
2. **Audit Trail**: Every export is logged with user, purpose, and row count
3. **Role Enforcement**: Server-side verification prevents unauthorized access
4. **No Backdoors**: No "quick export" paths bypass logging
5. **Immutable Views**: Research views cannot be modified at runtime

---

## Future Considerations (Out of Scope)

- Salt rotation across export batches
- IRB workflow integration
- Cohort builder interface
- NLP redaction for free-text
- k-anonymity verification
- Differential privacy implementation
