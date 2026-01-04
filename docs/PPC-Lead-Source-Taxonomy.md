# PPC Lead Source Taxonomy

**Version:** 1.0  
**Last Updated:** 2026-01-04  
**Status:** Canonical

---

## Overview

This document defines the canonical lead source taxonomy for PPC Unified. All intake attribution must use values from this controlled vocabulary to ensure consistent analytics and governance.

---

## Taxonomy Structure

Lead sources follow a `category:value` format with three primary categories:

### 1. Pillar Sources (`pillar:*`)

Content pillar or specialty origin points from authority-building content.

| Value | Description |
|-------|-------------|
| `pillar:concussion` | Concussion/TBI content pillar |
| `pillar:neck-pain` | Neck pain/cervical content pillar |
| `pillar:back-pain` | Back pain/lumbar content pillar |
| `pillar:sports-injury` | Sports injury content pillar |
| `pillar:post-surgical` | Post-surgical rehab content pillar |
| `pillar:vestibular` | Vestibular/balance content pillar |
| `pillar:pediatric` | Pediatric specialty content pillar |
| `pillar:other` | Other content pillar (requires notes) |

### 2. Referral Sources (`referral:*`)

External referral relationships.

| Value | Description |
|-------|-------------|
| `referral:physician` | Physician/MD referral |
| `referral:patient` | Patient referral (word of mouth) |
| `referral:school` | School athletic trainer/nurse referral |
| `referral:coach` | Coach/sports program referral |
| `referral:employer` | Employer/occupational referral |
| `referral:insurance` | Insurance/payor referral |
| `referral:other` | Other referral (requires notes) |

### 3. Direct Sources (`direct:*`)

Direct patient acquisition channels.

| Value | Description |
|-------|-------------|
| `direct:google` | Google search/organic discovery |
| `direct:website` | Direct website visit (no referrer) |
| `direct:call` | Phone call (no prior digital touch) |
| `direct:walk-in` | Walk-in patient (no prior contact) |
| `direct:return-patient` | Returning patient (prior episode) |

### 4. Unknown

| Value | Description |
|-------|-------------|
| `unknown` | Source not determined or not captured |

**Important:** `unknown` must be explicitly selected. Silent defaults are not permitted.

---

## UTM Field Mapping

When leads arrive with UTM parameters, map them as follows:

| UTM Parameter | Storage Field | Notes |
|---------------|---------------|-------|
| `utm_source` | `care_requests.utm_source` | e.g., "google", "facebook" |
| `utm_medium` | `care_requests.utm_medium` | e.g., "cpc", "organic", "email" |
| `utm_campaign` | `care_requests.utm_campaign` | Campaign identifier |
| `utm_content` | `care_requests.utm_content` | Ad/content variant |
| `utm_term` | `care_requests.utm_term` | Keyword (if applicable) |

### Deriving lead_source from UTM

| UTM Values | Derived lead_source |
|------------|---------------------|
| `utm_source=google` + `utm_medium=organic` | `direct:google` |
| `utm_source` contains pillar name | `pillar:[name]` |
| `utm_medium=referral` | `referral:other` (requires manual review) |
| No UTM, direct traffic | `direct:website` |

---

## Additional Attribution Fields

| Field | Type | Description |
|-------|------|-------------|
| `referrer_url` | TEXT | HTTP referrer (if available) |
| `landing_page` | TEXT | First page visited |
| `campaign_id` | TEXT | Internal campaign identifier |
| `lead_id` | UUID | Link to originating lead record |

---

## Data Storage

Lead attribution is stored in two locations:

### 1. Care Requests (Primary)

For intakes processed through the standard care request workflow:

```sql
care_requests.lead_source     -- Canonical enum value
care_requests.lead_id         -- FK to leads table
care_requests.utm_*           -- UTM fields
care_requests.site_id         -- Site/clinic
```

### 2. Episode Origins (Fallback)

For episodes created without a care request (walk-ins, legacy):

```sql
episode_origins.episode_id    -- Episode reference
episode_origins.lead_source   -- Canonical enum value
episode_origins.origin_notes  -- Explanation for source
```

---

## Audit Requirements

All changes to `lead_source` values are automatically logged:

- **Table:** `audit_logs`
- **Action:** `LEAD_SOURCE_CHANGED`
- **Data:** Old and new values

---

## Governance Rules

1. **No Silent Defaults:** Every intake must have an explicit lead_source
2. **No Free Text:** Only enum values are permitted
3. **Manual Review Required:** `pillar:other`, `referral:other`, and `unknown` require notes
4. **PHI Prohibition:** Landing pages and referrer URLs must not encode patient identity
5. **Immutable After Episode:** Once an episode is created, lead_source cannot be changed

---

## Analytics Views

Lead attribution flows into these analytics views:

| View | Description |
|------|-------------|
| `analytics_lead_funnel_by_source` | Funnel metrics aggregated by lead_source |
| `analytics_resolution_by_source` | Detailed resolution metrics by source and instrument |

---

## Export Compatibility

Lead source is included in de-identified research exports:

- **Field:** `lead_source`
- **Included in:** `v_research_care_targets`
- **PHI Status:** Not PHI (categorical only)

UTM fields and URLs are **excluded** from research exports by default due to potential identity encoding.

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-04 | Initial taxonomy definition |
