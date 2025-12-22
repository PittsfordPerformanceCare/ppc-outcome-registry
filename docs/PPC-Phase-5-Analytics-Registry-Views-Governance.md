# Phase 5 Analytics & Registry Views Governance

**Status:** Canonical / Locked  
**Scope:** Internal Analytics / Registry Views  
**Last Updated:** 2025-01-22  
**Artifact Type:** Internal Analytics  
**Visibility:** Internal Only

---

## Purpose

This document establishes the canonical governance for Phase 5 Care Target-Centric Analytics and Registry Views. These views exploit PPC's Care Target outcome symmetry (baseline → discharge) for research-grade analysis, publication readiness, and payor conversations.

---

## Core Principles

### 1. Care Target is the Primary Analytic Unit

- Outcomes are analyzed **per Care Target first**
- Episode-level analytics are **derived, not substituted**
- Only **discharged** Care Targets contribute to outcome analytics
- Baseline + discharge outcome required (or documented override)
- Active or Monitor-only targets are **excluded** from delta analysis

### 2. Episode Analytics Reflect Aggregation, Not Averaging

- Multi-target episodes must **not** collapse signal into a single score
- Staggered resolution is tracked separately
- Partial success is visible without misclassification

### 3. No Patient-Facing Exposure

- Phase 5 is **internal only**
- No dashboards visible to patients
- Registry exports may be de-identified for external use

---

## Implemented Analytics Views

### View 1: Care Target Outcomes Table (`analytics_care_target_outcomes`)

**Purpose:** Research-grade outcome analysis per complaint.

**Key Columns:**
| Column | Description |
|--------|-------------|
| `care_target_id` | Unique identifier for the care target |
| `episode_id` | Parent episode identifier |
| `care_target_name` | Plain language name |
| `domain` | MSK or Neuro |
| `body_region` | Anatomical region if applicable |
| `outcome_instrument` | NDI, ODI, QuickDASH, LEFS, etc. |
| `baseline_score` | Initial assessment score |
| `discharge_score` | Final assessment score |
| `outcome_delta` | Numeric change (baseline - discharge) |
| `outcome_direction` | improved / worsened / unchanged / incomplete |
| `duration_to_resolution_days` | Days from start to discharge |
| `outcome_integrity_status` | complete / override / incomplete |

**Rules:**
- Include only Care Targets with status = 'DISCHARGED'
- Never average outcomes across Care Targets
- Directionality preserved (positive delta = improvement for disability indices)

---

### View 2: Episode Summary View (`analytics_episode_summary`)

**Purpose:** Clinician- and leadership-friendly snapshot of each episode.

**Key Columns:**
| Column | Description |
|--------|-------------|
| `episode_id` | Episode identifier |
| `episode_start_date` | Episode start |
| `episode_close_date` | Episode close (if closed) |
| `number_of_care_targets` | Total care targets in episode |
| `number_discharged` | Care targets successfully discharged |
| `number_active` | Currently active care targets |
| `staggered_resolution` | Boolean - targets resolved at different times |
| `resolution_span_days` | Days between first and last care target discharge |

**Rules:**
- Episode outcome is **descriptive, not scored**
- Does not replace Care Target outcome analysis

---

### View 3: Registry Export View (`analytics_registry_export`)

**Purpose:** Research-ready export for studies, IRB, payors.

**Characteristics:**
- One row per discharged Care Target
- De-identified where required (no patient names in export CSV)
- Stable column naming
- MCID achievement calculated per instrument
- Data quality flags included

**Export Filters:**
- Year and Quarter
- Outcome Instrument
- MCID Achieved Only
- Complete Data Only

---

## Data Integrity Rules

### Analytics Must Reference:
- Care Target discharge events (`discharged_at`)
- Outcome association records (`outcome_scores`)
- Override status (`episode_outcome_tool_locks`)

### Analytics Must Ignore:
- Draft discharge states
- Unconfirmed discharges
- Active or Monitor-only targets for delta calculations

### Override Handling:
- Overrides are clearly marked in `outcome_integrity_status`
- Override reason is queryable
- Overridden records may be included or excluded via filter

---

## Interpretation Guardrails

Any consumer of Phase 5 analytics must be able to answer:

1. "Which complaint improved?"
2. "Over what time period?"
3. "How often do complaints resolve independently?"

**If a view obscures those answers, it violates this phase.**

---

## Explicit Non-Goals

Phase 5 **MUST NOT**:

- Create patient dashboards
- Auto-publish reports
- Trigger communication
- Replace clinician judgment
- Modify discharge logic
- Backfill or "fix" historical data

**This phase is observational, not corrective.**

---

## Security & Access

### Database Views

All views use `security_invoker = true`:
- RLS from underlying tables is enforced
- Clinicians see only data they have access to
- Admins see clinic-wide data

### React Components

- Protected by authentication
- Visible only in admin sections
- No patient-facing routes

---

## Future Change Requirements

Any modification to Phase 5 analytics **MUST**:

1. Preserve Care Target as the primary analytic unit
2. Never collapse Care Targets into episode-level scores
3. Maintain MCID calculation accuracy
4. Preserve data quality flags
5. Document changes in this governance file

If a change attempts to simplify analytics by averaging or collapsing Care Targets, it must be **rejected**.

---

## Related Documentation

- [PPC Care Targets & Multi-Complaint Governance](./PPC-Care-Targets-Governance.md)
- [Phase 3 Guardrail Enforcement — Source of Truth](./PPC-Phase-3-Guardrail-Enforcement-Source-of-Truth.md)
- [Phase 4A Patient Discharge Letter Governance](./PPC-Phase-4A-Patient-Discharge-Letter-Governance.md)
- [Phase 4B Care Target Discharge Patient Communication Governance](./PPC-Phase-4B-Care-Target-Discharge-Patient-Communication-Governance.md)

---

## Summary

**Phase 5 Analytics are a reflection layer, not a control layer.**

Care Target is the primary analytic unit. Episode analytics are derived aggregations.

Partial success in multi-complaint episodes is visible without misclassification.

All analytics are internal only. No patient-facing exposure permitted.
