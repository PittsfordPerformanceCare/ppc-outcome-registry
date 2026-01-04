# PPC Lead-to-Resolution Analytics — Governance

**Version:** 1.0  
**Last Updated:** 2026-01-04  
**Status:** Canonical

---

## Purpose

This document establishes governance guardrails for lead-to-resolution analytics in PPC Unified. These analytics connect lead source attribution to clinical outcomes while preventing liability expansion.

---

## Core Principle

> We optimize for **resolution integrity**, not raw volume.

Lead-to-resolution analytics exist to:
1. Understand which lead sources produce patients who complete care
2. Identify quality signals in intake pipelines
3. Support data-driven resource allocation

They do **not** exist to:
- Maximize lead volume at the expense of quality
- Predict clinical outcomes based on marketing data
- Recommend treatments or interventions
- Make claims about causation

---

## Analytics Hierarchy

### Primary Unit: Care Target

All outcome metrics are calculated at the Care Target level, not the episode or patient level. This preserves outcome symmetry governance.

### Secondary Unit: Episode

Episode-level metrics (conversion, discharge) are derived aggregations.

### Attribution Unit: Lead Source

Lead source attribution connects intakes to outcomes without blending clinical data.

---

## Data Flow

```
Lead (leads table)
  ↓ [lead_id reference]
Care Request (care_requests table)
  ↓ [episode_id reference]
Episode (episodes table)
  ↓ [episode_id reference]
Care Target (care_targets table)
  ↓ [outcome measurement]
Outcome Scores (outcome_scores table)
  ↓ [resolution analysis]
Analytics Views
```

---

## Analytics Views

### analytics_lead_funnel_by_source

Aggregated funnel metrics by lead source.

| Column | Description | Governance |
|--------|-------------|------------|
| site_id | Site filter | Multi-site isolation |
| lead_source | Canonical source | Enum-constrained |
| leads_count | Intake count | Volume metric |
| episodes_created_count | Conversion count | Quality metric |
| care_targets_count | Active care targets | Volume metric |
| care_targets_discharged_count | Resolved care targets | Quality metric |
| median_time_to_resolution_bucket | Resolution speed | Bucketed, not precise |
| mcid_met_rate | MCID achievement % | Care Target level only |

### analytics_resolution_by_source

Detailed resolution metrics by source and instrument.

| Column | Description | Governance |
|--------|-------------|------------|
| instrument_type | Outcome instrument | Per-instrument analysis |
| median_delta | Average score change | Observational only |
| mcid_met_rate | MCID achievement % | Care Target level only |

---

## Display Language Requirements

All UI elements displaying lead-to-resolution data must use governance-approved language:

### ✅ Approved Language

- "Observed resolution outcomes by lead source"
- "MCID achievement rate (Care Target level)"
- "Episode conversion by source"
- "Median time to resolution"
- "Resolution metrics"

### ❌ Prohibited Language

- "Best performing source"
- "Recommended source"
- "Predicted outcomes"
- "This source produces better results"
- "Optimal lead channel"
- Any superlatives or recommendations

---

## PHI Protection

### Included in Analytics

- lead_source (enum value only)
- Aggregated counts
- Bucketed time ranges
- Percentage rates

### Excluded from Analytics

- Patient names
- Dates of birth
- Contact information
- Free-text fields
- Exact dates (bucketed only)
- Landing page URLs (may encode identity)
- Referrer URLs (may encode identity)

---

## Export Rules

### Standard Research Export

Lead source **is** included in `v_research_care_targets` as it is categorical, non-identifying data.

### UTM Fields

UTM fields are **excluded** from research exports by default because:
- `utm_content` may contain patient-identifying AB test variants
- `utm_term` may contain search queries with PHI
- Landing pages may encode appointment IDs or patient references

### Override Process

If UTM data is required for a specific research project:
1. Manual review of all unique UTM values
2. PHI screening certification
3. IRB approval documentation
4. Export with explicit scope limitation

---

## Audit Requirements

### Automatic Logging

All changes to lead_source are logged to `audit_logs`:

```sql
action: 'LEAD_SOURCE_CHANGED'
table_name: 'care_requests' or 'episode_origins'
old_data: { lead_source: 'previous_value' }
new_data: { lead_source: 'new_value' }
```

### Manual Review Triggers

The following require admin review:
- `unknown` source with no notes
- `pillar:other` or `referral:other` without specification
- Bulk changes to lead_source values
- Export requests including UTM data

---

## Site Isolation

All analytics views support multi-site operation:

- **site_id filter:** Restricts data to specific site
- **All Sites:** Aggregates across sites (default)
- **No cross-site leakage:** RLS policies enforce isolation

---

## Liability Boundaries

### What This Analytics System Does

✅ Tracks which lead sources produce patients who complete care  
✅ Measures objective outcome metrics (MCID achievement)  
✅ Provides observational data for resource allocation  
✅ Supports governance-grade registry data

### What This Analytics System Does NOT Do

❌ Recommend treatment protocols  
❌ Predict clinical outcomes  
❌ Guarantee results from any source  
❌ Replace clinical judgment  
❌ Suggest marketing strategies

---

## Integration Points

### Leadership Dashboard

The Lead → Resolution module is integrated into the existing Leadership Dashboard with:
- Site filter compatibility
- Time range filtering
- Governance-approved display language

### Research Export

Lead source is available in de-identified exports for:
- Registry submissions
- Publication datasets
- Observational research

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-04 | Initial governance document |
