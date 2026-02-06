

# Rebuild Acute Concussion Guide as a Dual-Purpose Educational Asset

## Overview

The Acute Concussion Guide already exists as a well-structured 541-line page at `/site/guides/concussion/acute-concussion-guide`. The goal is to ensure it works seamlessly as:

1. **A public site asset** -- accessible to anyone browsing the site (already works)
2. **An automatic value-add for concussion-specific lead submissions** -- delivered via the Thank You page and confirmation email when a concussion-related concern is selected

## Current State Assessment

**What already works:**
- The guide page itself is fully built with proper SEO, structured data, and clinical content
- The Thank You page (`PatientThankYou.tsx`) conditionally shows a guide CTA when `primary_concern === "concussion"`
- The `create-lead` edge function tracks education delivery with `education_delivered`, `education_asset`, `education_url`, and `education_delivered_at` fields
- The `send-lead-confirmation` edge function includes a concussion guide section in the email when `deliverConcussionEducation` is true
- The `leads` database table has all required education tracking columns

**What needs fixing:**

### 1. Stale URL in the confirmation email
The `send-lead-confirmation` edge function hard-codes a stale URL:
```
const guideBaseUrl = "https://ppc-unified-platform.lovable.app";
```
This should point to the production published URL (`https://muse-meadow-app.lovable.app`) and eventually the custom domain (`https://www.pittsfordperformancecare.com`). It should use the `APP_URL` environment variable consistently.

### 2. Education trigger is too narrow
Currently, education delivery triggers **only** when `primary_concern === "concussion"`. Per the dropdown options in `conciergeRouting.ts`, the full set of concussion-adjacent concerns that should qualify includes:
- `"concussion"` -- Concussion or Head Injury (recent or past)
- `"dizziness"` -- Dizziness, Balance, or Vertigo Concerns
- `"headaches"` -- Headaches or Migraine-Related Concerns

These three are all classified as `neuro` system category and clinically benefit from the acute concussion guide content (red flags, energy management, visual/vestibular protection).

This expansion needs to happen in three places:
- `shouldDeliverConcussionEducation()` in `src/lib/conciergeRouting.ts` (frontend Thank You page)
- `CONCUSSION_EDUCATION_CONCERN` check in `supabase/functions/create-lead/index.ts` (backend lead creation)
- The `deliverConcussionEducation` flag passed to `send-lead-confirmation`

### 3. Deprecated keyword-matching files should be removed
Two files exist solely for deprecated keyword-based matching:
- `src/utils/concussionEducationMatcher.ts`
- `supabase/functions/_shared/concussion-education-matcher.ts`

Neither is imported anywhere in the active codebase. They should be removed to prevent confusion, since education delivery is now governed by exact dropdown selection.

## Implementation Plan

### Step 1: Update education delivery trigger (frontend)
**File:** `src/lib/conciergeRouting.ts`

Update `shouldDeliverConcussionEducation()` to accept the three neuro-relevant concerns:
```typescript
const EDUCATION_ELIGIBLE_CONCERNS = ["concussion", "dizziness", "headaches"];

export function shouldDeliverConcussionEducation(
  primaryConcern: string | null | undefined
): boolean {
  if (!primaryConcern) return false;
  return EDUCATION_ELIGIBLE_CONCERNS.includes(primaryConcern);
}
```

### Step 2: Update education delivery trigger (backend)
**File:** `supabase/functions/create-lead/index.ts`

Replace the single-value check with the same three-value set:
```typescript
const EDUCATION_ELIGIBLE_CONCERNS = ["concussion", "dizziness", "headaches"];

// Later in the handler:
const deliverConcussionEducation = EDUCATION_ELIGIBLE_CONCERNS.includes(
  sanitized.primary_concern as string
);
```

### Step 3: Fix the guide URL in confirmation email
**File:** `supabase/functions/send-lead-confirmation/index.ts`

Replace the hard-coded stale URL with the `APP_URL` environment variable:
```typescript
const appUrl = Deno.env.get("APP_URL") || "https://muse-meadow-app.lovable.app";
// Remove the separate guideBaseUrl variable entirely
// Use appUrl for the guide link:
// href="${appUrl}/site/guides/concussion/acute-concussion-guide"
```

### Step 4: Remove deprecated keyword matcher files
Delete the two unused files:
- `src/utils/concussionEducationMatcher.ts`
- `supabase/functions/_shared/concussion-education-matcher.ts`

These are no longer imported anywhere and contain the old keyword-based logic that was replaced by dropdown-selection-based triggering.

### Step 5: Verify end-to-end flow
After implementation, the complete flow will be:

```text
Patient selects "Concussion or Head Injury",
"Dizziness, Balance, or Vertigo", or
"Headaches or Migraine-Related Concerns"
         |
         v
  Lead is created via create-lead edge function
  -> education_delivered = true
  -> education_asset = "acute_concussion_guide_v1"
  -> education_url = "/site/guides/concussion/acute-concussion-guide"
  -> education_delivered_at = timestamp
         |
         v
  Thank You page shows guide CTA card
  (blue box with "Open Guide" button)
         |
         v
  Confirmation email includes guide section
  with direct link to the guide page
         |
         v
  Guide is publicly accessible at
  /site/guides/concussion/acute-concussion-guide
```

## What Does NOT Change
- The guide page content itself (AcuteConcussionGuide.tsx) -- no modifications needed
- The database schema -- all tracking columns already exist
- The Thank You page layout -- only the trigger condition changes
- The email template content -- only the URL source changes
- No new secrets, services, or backend resources are required

## Technical Notes
- The `EDUCATION_ELIGIBLE_CONCERNS` array should be defined as a constant in both frontend and backend to keep the two in sync conceptually, matching the dropdown `value` strings exactly from `PRIMARY_CONCERN_OPTIONS`
- The `APP_URL` environment variable should be verified/set to the correct published URL before the email flow is tested in production
