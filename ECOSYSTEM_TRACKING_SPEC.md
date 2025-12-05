# PPC Outcome Registry - Unified Ecosystem Tracking Specification

## Overview

This document defines the implementation specification for unified lead attribution and analytics across the PPC ecosystem:
- **PPC Website Hub**
- **Concussion Pillar App**
- **MSK Pillar App**
- **PPC Outcome Registry** (Single Source of Truth)

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PPC ECOSYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│   │  PPC Hub     │   │  Concussion  │   │  MSK Pillar  │                │
│   │  Website     │   │  Pillar App  │   │  App         │                │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                │
│          │                  │                  │                         │
│          └──────────────────┼──────────────────┘                         │
│                             │                                            │
│                             ▼                                            │
│              ┌──────────────────────────────┐                            │
│              │    PPC Outcome Registry      │                            │
│              │   (Single Source of Truth)   │                            │
│              │                              │                            │
│              │  • UTM Capture               │                            │
│              │  • CTA Identity Tracking     │                            │
│              │  • Intake Event Logging      │                            │
│              │  • Lead Creation Attribution │                            │
│              │  • Episode Attribution       │                            │
│              │  • Conversion Analytics      │                            │
│              └──────────────────────────────┘                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tracking Parameters

### Full Parameter Set

Every CTA across the ecosystem MUST include these parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `utm_source` | string | Yes | Traffic source (google, facebook, newsletter, etc.) |
| `utm_medium` | string | Yes | Marketing medium (cpc, organic, email, referral) |
| `utm_campaign` | string | No | Campaign name |
| `utm_content` | string | No | Content variant for A/B testing |
| `origin_page` | string | Yes | Page path where CTA was clicked |
| `origin_cta` | string | Yes | CTA identifier (button id/label) |
| `funnel_stage` | enum | Yes | Current funnel position |
| `pillar_origin` | enum | Yes | Source application |

### Funnel Stages

```typescript
type FunnelStage = 
  | "landing"           // Initial page view
  | "severity-check"    // Severity assessment started
  | "intake-started"    // Intake form started
  | "intake-completed"  // Intake form submitted
  | "schedule-eval"     // Evaluation scheduled
  | "episode-created";  // Episode opened in Registry
```

### Pillar Origins

```typescript
type PillarOrigin = 
  | "hub"               // PPC Website Hub
  | "concussion_pillar" // Concussion Pillar App
  | "msk_pillar"        // MSK Pillar App
  | "registry"          // PPC Outcome Registry
  | "direct";           // Direct access (no referrer)
```

## Implementation

### 1. Frontend Tracking Hook

```typescript
// src/hooks/useCTATracking.ts
import { useCTATracking, buildTrackedURL } from "@/hooks/useCTATracking";

// In your component:
const tracking = useCTATracking({ 
  funnelStage: "intake-started",
  ctaLabel: "start-intake-btn"
});

// Build tracked URLs for navigation:
const intakeUrl = buildTrackedURL("/neurologic-intake", {
  ...tracking,
  funnel_stage: "intake-started",
  origin_cta: "hero-cta-button"
});
```

### 2. Lead Submission Library

```typescript
// src/lib/leadTracking.ts
import { submitNeurologicLead, submitLead, trackCTAClick } from "@/lib/leadTracking";

// Submit neurologic intake lead with full tracking:
const result = await submitNeurologicLead({
  email: "patient@example.com",
  name: "John Doe",
  persona: "self",
  tracking: tracking, // from useCTATracking hook
});

// Track CTA clicks for analytics:
await trackCTAClick("schedule-eval-button", tracking, "/schedule");
```

### 3. Edge Function Support

The `submit-neurologic-lead` edge function accepts all tracking parameters:

```typescript
// Request body to edge function
{
  email: "patient@example.com",
  persona: "self",
  // ... other fields
  
  // UTM Tracking
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "concussion-awareness-2024",
  utm_content: "variant-a",
  
  // Origin Tracking
  origin_page: "/concussion-care",
  origin_cta: "hero-start-intake",
  
  // Funnel Tracking
  funnel_stage: "intake-started",
  pillar_origin: "concussion_pillar"
}
```

## Database Schema

### leads table

```sql
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  name TEXT,
  phone TEXT,
  
  -- UTM Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  
  -- Origin Tracking
  origin_page TEXT,
  origin_cta TEXT,
  
  -- Funnel Tracking
  funnel_stage TEXT,
  pillar_origin TEXT,
  checkpoint_status TEXT DEFAULT 'lead_created',
  
  -- Conversion Timestamps
  intake_completed_at TIMESTAMPTZ,
  episode_opened_at TIMESTAMPTZ,
  
  -- Severity Check Data
  severity_score INTEGER,
  system_category TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### neurologic_intake_leads table

```sql
CREATE TABLE public.neurologic_intake_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  persona TEXT DEFAULT 'self',
  
  -- Patient/Contact Info
  name TEXT,
  phone TEXT,
  -- ... other fields
  
  -- UTM Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  
  -- Origin Tracking
  origin_page TEXT,
  origin_cta TEXT,
  
  -- Funnel Tracking
  funnel_stage TEXT,
  pillar_origin TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## CTA Implementation Examples

### Hub Website CTA

```typescript
// On PPC Hub website
<Button
  onClick={() => {
    trackCTAClick("hub-hero-intake", tracking);
    window.location.href = buildTrackedURL(
      "https://registry.ppcpt.com/start-neurologic-intake",
      {
        utm_source: "ppc-hub",
        utm_medium: "internal",
        utm_campaign: "hub-referral",
        origin_page: "/",
        origin_cta: "hub-hero-intake",
        funnel_stage: "landing",
        pillar_origin: "hub"
      }
    );
  }}
>
  Start Your Intake
</Button>
```

### Concussion Pillar CTA

```typescript
// On Concussion Pillar App
<Button
  onClick={() => {
    trackCTAClick("concussion-severity-check", tracking);
    navigate(buildTrackedURL("/severity-check", {
      ...tracking,
      origin_cta: "concussion-severity-check",
      funnel_stage: "severity-check",
      pillar_origin: "concussion_pillar"
    }));
  }}
>
  Check Symptom Severity
</Button>
```

### MSK Pillar CTA

```typescript
// On MSK Pillar App
<Button
  onClick={() => {
    trackCTAClick("msk-schedule-eval", tracking);
    window.location.href = buildTrackedURL(
      "https://registry.ppcpt.com/schedule",
      {
        ...tracking,
        origin_cta: "msk-schedule-eval",
        funnel_stage: "schedule-eval",
        pillar_origin: "msk_pillar"
      }
    );
  }}
>
  Schedule Evaluation
</Button>
```

## Analytics Queries

### Lead Attribution by Pillar

```sql
SELECT 
  pillar_origin,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN intake_completed_at IS NOT NULL THEN 1 END) as intakes_completed,
  COUNT(CASE WHEN episode_opened_at IS NOT NULL THEN 1 END) as episodes_created,
  ROUND(
    COUNT(CASE WHEN episode_opened_at IS NOT NULL THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 2
  ) as conversion_rate
FROM leads
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY pillar_origin
ORDER BY total_leads DESC;
```

### Funnel Stage Analysis

```sql
SELECT 
  funnel_stage,
  COUNT(*) as count,
  COUNT(DISTINCT pillar_origin) as unique_pillars
FROM leads
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY funnel_stage
ORDER BY 
  CASE funnel_stage
    WHEN 'landing' THEN 1
    WHEN 'severity-check' THEN 2
    WHEN 'intake-started' THEN 3
    WHEN 'intake-completed' THEN 4
    WHEN 'schedule-eval' THEN 5
    WHEN 'episode-created' THEN 6
  END;
```

### UTM Campaign Performance

```sql
SELECT 
  utm_source,
  utm_campaign,
  pillar_origin,
  COUNT(*) as leads,
  COUNT(CASE WHEN episode_opened_at IS NOT NULL THEN 1 END) as conversions,
  ROUND(
    COUNT(CASE WHEN episode_opened_at IS NOT NULL THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 2
  ) as conversion_rate
FROM leads
WHERE utm_source IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_source, utm_campaign, pillar_origin
ORDER BY leads DESC;
```

### CTA Effectiveness

```sql
SELECT 
  origin_cta,
  origin_page,
  pillar_origin,
  COUNT(*) as clicks,
  COUNT(CASE WHEN intake_completed_at IS NOT NULL THEN 1 END) as completions
FROM leads
WHERE origin_cta IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY origin_cta, origin_page, pillar_origin
ORDER BY clicks DESC;
```

## Audit Trail

All lead events are logged to `audit_logs` for compliance and debugging:

```sql
-- View recent lead events
SELECT 
  action,
  record_id,
  new_data->>'email' as email,
  new_data->>'pillar_origin' as pillar_origin,
  new_data->>'funnel_stage' as funnel_stage,
  created_at
FROM audit_logs
WHERE table_name IN ('neurologic_intake_leads', 'lead_events', 'cta_events')
ORDER BY created_at DESC
LIMIT 100;
```

## Testing Checklist

- [ ] UTM parameters are captured on all landing pages
- [ ] CTA clicks are tracked with proper attribution
- [ ] Lead submissions include all tracking parameters
- [ ] Funnel stage progression is recorded correctly
- [ ] Pillar origin is detected/set correctly
- [ ] Audit logs capture all events
- [ ] Analytics queries return expected data
- [ ] Cross-pillar referrals maintain attribution

## Files Modified/Created

### Created
- `src/hooks/useCTATracking.ts` - Enhanced tracking hook
- `src/lib/leadTracking.ts` - Lead submission library
- `ECOSYSTEM_TRACKING_SPEC.md` - This specification

### Modified
- `supabase/functions/submit-neurologic-lead/index.ts` - Added tracking fields
- `src/pages/StartNeurologicIntake.tsx` - Uses new tracking system
- `src/pages/SeverityCheck.tsx` - Uses new tracking system
- Database: Added `funnel_stage` and `pillar_origin` columns to `leads` and `neurologic_intake_leads` tables
