# PPC Shadow Site — Replicability Proof

**Version:** 1.0  
**Last Updated:** 2026-01-04  
**Status:** Active

---

## Overview

The PPC Shadow Site is a controlled proof artifact demonstrating site-agnostic platform replicability. It uses:
- **Same code** as the primary site
- **Same governance rules** (no exceptions)
- **Same analytics logic** (no structural differences)
- **Same export pipeline** (de-identification, pseudonymization)
- **Isolated data** (no cross-site joins by default)

This is **not** customer onboarding or scaling infrastructure. It is a valuation-grade demonstration that the PPC platform can operate identically across multiple logical sites without custom logic or site-specific overrides.

---

## Site Records

| Site ID | Site Name | Purpose |
|---------|-----------|---------|
| `a0000000-0000-0000-0000-000000000001` | PPC-Primary | Production site |
| `a0000000-0000-0000-0000-000000000002` | PPC-Shadow | Replicability proof site |

---

## Data Isolation

### Episode-Level Isolation

All episodes are associated with a site via the `clinic_id` column:

```sql
episodes.clinic_id → clinics.id
```

### Care Target Resolution

Care Targets inherit site association through their parent episode:

```sql
care_targets.episode_id → episodes.id → episodes.clinic_id
```

### Outcome Score Resolution

Outcome scores resolve to site via episode:

```sql
outcome_scores.episode_id → episodes.id → episodes.clinic_id
```

### Research Views

All research views now include `site_id` for filtering:

- `v_research_care_targets.site_id`
- `v_research_outcomes.site_id`  
- `v_research_episodes.site_id`

---

## Governance Enforcement

The following governance rules apply **identically** to PPC-Shadow with **no exceptions**:

| Rule | Description | Enforcement |
|------|-------------|-------------|
| Outcome Symmetry | Baseline and discharge must use same instrument | View-level + UI blocking |
| Care Target Discharge Block | Cannot discharge without complete outcomes | Database trigger |
| MCID Thresholds | Immutable per instrument | Hardcoded in views |
| Integrity Checks | Stale/incomplete episode detection | Scheduled edge function |
| Audit Logging | All exports logged | research_exports table |

### No Site-Specific Exceptions

There is **zero conditional logic** based on site name or ID in:
- Governance enforcement
- Outcome calculation
- MCID thresholds
- Export pseudonymization
- Analytics aggregation

---

## Analytics Verification

### Leadership Dashboard

The Leadership Dashboard displays data from all sites by default. Site filtering is available via the existing `clinic_id` filtering mechanism.

Metrics that render identically:
- Volume (total care targets, discharge rate)
- Resolution (time to resolution, staggered resolution patterns)
- Outcomes (MCID rate, score delta distribution)
- Complexity (multi-complaint episodes)
- Integrity (missing baseline/discharge rates)

### Site Summary View

A new analytics view provides site-level aggregates:

```sql
SELECT * FROM analytics_site_summary;
```

Returns:
- `site_id`
- `site_name`
- `total_episodes`
- `total_care_targets`
- `discharged_episodes`
- `discharged_care_targets`

---

## De-Identified Export

### Site-Filtered Exports

The `create-research-export` edge function accepts an optional `site_id` parameter:

```json
{
  "export_purpose": "registry",
  "dataset_type": "care_targets",
  "date_range_start": "2025-01-01",
  "date_range_end": "2026-01-04",
  "site_id": "a0000000-0000-0000-0000-000000000002"
}
```

If `site_id` is omitted, all sites are exported.

### Export Manifest

The `research_exports` table records which site (if any) was filtered:

| Column | Type | Description |
|--------|------|-------------|
| `site_id` | UUID | Site filter applied (NULL = all sites) |

### Audit Trail

All exports are logged with:
- Export purpose
- Dataset type
- Date range
- Site filter (if applied)
- Row count
- User ID

---

## Creating Shadow Site Data

### Seed Episodes

To create episodes for the shadow site:

1. Use the standard episode creation workflow
2. Ensure the user's `clinic_id` is set to `a0000000-0000-0000-0000-000000000002`

Or manually set clinic_id during insert:

```sql
INSERT INTO episodes (
  id, 
  patient_name, 
  region, 
  date_of_service,
  clinic_id,
  user_id
) VALUES (
  'SHADOW-EP-001',
  'Test Patient Alpha',
  'Cervical',
  '2026-01-04',
  'a0000000-0000-0000-0000-000000000002',
  'user-uuid-here'
);
```

### Requirements for Valid Shadow Site Data

- At least 2 episodes with multiple Care Targets
- Baseline outcomes completed per Care Target
- Discharge outcomes completed with matching instruments
- Episodes closed via standard workflow (no overrides)

---

## Verification Checklist

| Checkpoint | Status | Notes |
|------------|--------|-------|
| Shadow site record exists | ✅ | `a0000000-0000-0000-0000-000000000002` |
| Research views include site_id | ✅ | All 3 views updated |
| Export edge function supports site filter | ✅ | Optional site_id param |
| Analytics view supports site summary | ✅ | analytics_site_summary |
| No site-specific conditional logic | ✅ | Zero custom branches |
| Governance rules identical | ✅ | No exceptions |

---

## Non-Negotiable Guardrails

1. **No production data modified** — Shadow site uses its own data only
2. **No governance drift** — Same rules apply to all sites
3. **No UI changes** — Clinician UI unchanged
4. **No shortcuts or overrides** — Standard workflows required
5. **No custom logic** — Zero site-specific code paths

---

## Future Considerations

### Multi-Site Reporting

Future enhancements may include:
- Cross-site comparison dashboards
- Site-level benchmarking
- Aggregate industry comparisons

### Site Onboarding

If used for actual customer onboarding, additional infrastructure may include:
- Site-specific branding
- User-site association management
- Site-scoped RLS policies

These are **out of scope** for the current replicability proof.

---

## Conclusion

The PPC Shadow Site demonstrates that the platform can operate identically across multiple logical sites with:
- Complete data isolation
- Identical governance enforcement
- Consistent analytics output
- Auditable de-identified exports

This establishes the foundation for platform valuation claims regarding site-agnostic scalability.
