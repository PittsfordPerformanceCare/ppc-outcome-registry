

# Concierge Lead Intake Refactoring Plan

## Overview

This plan updates the public-facing Concierge Lead Intake forms to be strictly non-PHI while implementing deterministic routing to clinic scheduling blocks (MSK on Monday, Neuro on Wednesday). The forms will capture only intent and routing signals, with clinical details collected later in the secure HIPAA environment.

## Current State Analysis

### Existing Forms
| Form | File | Current PHI-Risk Fields |
|------|------|------------------------|
| Adult/Self | `PatientIntakeAdult.tsx` | symptomDuration, symptomDescription, previousTreatment, hasReferral, priorConcussionCare |
| Pediatric | `PatientIntakePediatric.tsx` | symptomDuration, symptomDescription, schoolSymptoms, athleticSymptoms, previousEvaluation, headInjuryEvaluation |
| Referral | `PatientIntakeReferral.tsx` | referralReason (free-text textarea) |

### Issues to Address
1. Free-text symptom fields capture PHI
2. No time_sensitivity or goal_of_contact fields
3. Routing is computed client-side only, not stored
4. Education delivery uses keyword matching on free-text instead of dropdown selection

## Technical Changes

### Phase 1: Database Schema Update

Add three new columns to the `leads` table:

```sql
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS time_sensitivity text,
ADD COLUMN IF NOT EXISTS goal_of_contact text,
ADD COLUMN IF NOT EXISTS route_label text;
```

### Phase 2: Shared Routing Helper

Create `src/lib/conciergeRouting.ts` with:

```text
+-----------------------------------------------------------+
|  conciergeRouting.ts                                       |
+-----------------------------------------------------------+
| Constants:                                                 |
|   - PRIMARY_CONCERN_OPTIONS (exact strings per spec)       |
|   - TIME_SENSITIVITY_OPTIONS                               |
|   - GOAL_OF_CONTACT_OPTIONS (self/pediatric/referral)      |
|   - NEURO_CONCERNS / MSK_CONCERNS / REVIEW_CONCERNS lists  |
|                                                            |
| Functions:                                                 |
|   - mapSystemCategory(primaryConcern) -> 'neuro'|'msk'|'review'
|   - computeRouteLabel(primaryConcern, timeSensitivity) ->  |
|       'MSK NP - Monday' | 'Neuro NP - Wednesday' | 'Admin Review'
|   - shouldDeliverConcussionEducation(primaryConcern) ->    |
|       boolean (checks for exact concussion concern value)  |
+-----------------------------------------------------------+
```

**Routing Matrix Logic:**
- Neuro concerns: Concussion, Dizziness/Balance/Vertigo, Headaches/Migraine, Neurologic-Related
- MSK concerns: Neck Pain/Whiplash, Chronic Pain, Sports Performance
- Review required: Recent Injury/Acute, Other/Not Sure

**Time Sensitivity Modifier:**
- If time_sensitivity is NOT "No - ongoing or non-urgent", route_label becomes "Admin Review"

### Phase 3: Form Component Updates

#### 3A. PatientIntakeAdult.tsx (rename to PatientIntakeSelf.tsx)

**Remove these fields completely:**
- symptomDuration
- symptomDescription
- priorConcussionCare
- previousTreatment
- hasReferral
- otherReason (conditionally shown for "other" selection)

**Update Primary Concern dropdown to exact spec values:**
```
- Recent Injury / Acute Concern (rapid evaluation needed)
- Concussion or Head Injury (recent or past)
- Dizziness, Balance, or Vertigo Concerns
- Headaches or Migraine-Related Concerns
- Neck Pain or Whiplash-Related Concerns
- Chronic Pain or Unresolved Injury
- Neurologic-Related Concerns (thinking, fatigue, coordination, vision)
- Sports Performance or Return-to-Play Clearance
- Other / Not Sure
```

**Add new fields:**
- Time Sensitivity (required select)
- Goal of Contact (required select)

**Add microcopy before submit button:**
"Clinical details and medical history will be collected securely after next steps are confirmed."

**Update payload construction:**
- Remove: symptom_summary, notes with clinical content
- Add: time_sensitivity, goal_of_contact, system_category (computed), route_label (computed)
- Keep notes ONLY for operational context (e.g., "Preferred contact: email")

#### 3B. PatientIntakePediatric.tsx

**Remove these fields completely:**
- symptomDuration
- symptomDescription
- schoolSymptoms
- athleticSymptoms
- previousEvaluation
- headInjuryEvaluation

**Keep operational fields:**
- childAge (optional)
- childGrade (optional)

**Add same Primary Concern, Time Sensitivity, Goal of Contact (pediatric options)**

**Update notes field to contain ONLY:**
`Child age: ${childAge}. Grade: ${childGrade}.` (no symptom narratives)

#### 3C. PatientIntakeReferral.tsx

**Remove:**
- referralReason (free-text textarea)

**Add:**
- Referral Category (required select - uses same Primary Concern options)
- Referral Purpose (required select - referral-specific options)
- Time Sensitivity (recommended - default to "No" if omitted)

**Add helper text under Patient Name field:**
"Do not include clinical details."

**Update payload:**
- primary_concern = Referral Category selection
- goal_of_contact = Referral Purpose selection
- notes = `Referring Provider: ${providerName}. Practice: ${practiceName}.` (operational only)

### Phase 4: Edge Function Updates

#### 4A. Update `supabase/functions/_shared/input-validator.ts`

Add new fields to validation:
```typescript
const textFields = [
  // existing fields...
  "time_sensitivity",
  "goal_of_contact",
  "system_category",
  "route_label",
];
```

#### 4B. Update `supabase/functions/create-lead/index.ts`

**Update leadData construction:**
```typescript
const leadData: Record<string, unknown> = {
  name: sanitized.name,
  email: sanitized.email,
  phone: sanitized.phone,
  who_is_this_for: sanitized.who_is_this_for,
  primary_concern: sanitized.primary_concern,
  preferred_contact_method: sanitized.preferred_contact_method,
  notes: sanitized.notes, // Now contains ONLY operational context
  // Remove: symptom_summary (no longer sent)
  
  // New routing fields
  time_sensitivity: sanitized.time_sensitivity,
  goal_of_contact: sanitized.goal_of_contact,
  system_category: sanitized.system_category,
  route_label: sanitized.route_label,
  
  // Existing tracking fields preserved
  utm_source, utm_medium, utm_campaign, utm_content,
  origin_page, origin_cta, pillar_origin,
  checkpoint_status: "lead_created",
  funnel_stage: "lead",
};
```

**Update education delivery logic:**
```typescript
// Replace keyword-based detection with exact primary_concern match
const deliverConcussionEducation = 
  sanitized.primary_concern === "Concussion or Head Injury (recent or past)";
```

#### 4C. Update `supabase/functions/_shared/concussion-education-matcher.ts`

Add new function for dropdown-based detection:
```typescript
export function isConcussionEducationCandidateBySelection(
  primaryConcern: string | null | undefined
): boolean {
  return primaryConcern === "Concussion or Head Injury (recent or past)";
}
```

Keep existing function for backward compatibility with legacy data.

### Phase 5: Frontend Updates

#### 5A. Update PatientThankYou.tsx

Update education guide display to use dropdown-based check:
```typescript
const showConcussionGuide = 
  primaryReason === "Concussion or Head Injury (recent or past)";
```

Add microcopy to confirmation page:
"Clinical details and medical history will be collected securely after next steps are confirmed."

#### 5B. Update ProspectJourneyTracker.tsx

Update to display route_label from leads table:
- Show "MSK NP - Monday" in green badge
- Show "Neuro NP - Wednesday" in blue badge  
- Show "Admin Review" in amber badge

Use stored route_label if present, fall back to computed value for legacy leads.

### Phase 6: Cleanup

#### Files to update:
1. `src/pages/patient-shell/PatientIntakeAdult.tsx` → Rename to `PatientIntakeSelf.tsx`
2. `src/pages/patient-shell/PatientIntakePediatric.tsx`
3. `src/pages/patient-shell/PatientIntakeReferral.tsx`
4. `src/pages/patient-shell/PatientThankYou.tsx`
5. `src/lib/routingSuggestion.ts` (update to use new constants)
6. `src/App.tsx` (update route if file renamed)
7. `supabase/functions/create-lead/index.ts`
8. `supabase/functions/_shared/input-validator.ts`
9. `supabase/functions/_shared/concussion-education-matcher.ts`

#### New files to create:
1. `src/lib/conciergeRouting.ts` (shared constants and routing logic)

## Security Considerations

**Preserved protections:**
- Honeypot fields (website, fax) remain in forms
- Submission timing checks (minimum 3 seconds)
- Rate limiting via existing infrastructure
- Input sanitization in edge function
- Silent bot rejection (fake success response)

**PHI risk elimination:**
- No free-text symptom fields in any form
- notes field contains ONLY operational metadata
- symptom_summary completely removed from payload

## Implementation Order

1. Database migration (add 3 columns)
2. Create `src/lib/conciergeRouting.ts`
3. Update edge functions (input-validator, create-lead, education-matcher)
4. Update PatientIntakeSelf.tsx (formerly Adult)
5. Update PatientIntakePediatric.tsx
6. Update PatientIntakeReferral.tsx
7. Update PatientThankYou.tsx
8. Update ProspectJourneyTracker.tsx for route_label display
9. Test all three form pathways
10. Verify admin dashboard shows routing correctly

## Acceptance Criteria Checklist

- [ ] All three forms contain ONLY the safe fields specified
- [ ] No free-text symptom capture exists anywhere
- [ ] Leads include system_category and route_label computed deterministically
- [ ] Attribution fields (UTM, origin) remain intact
- [ ] Bot protections (honeypot, timing, rate limiting) remain intact
- [ ] Education delivery triggered ONLY by primary_concern dropdown selection
- [ ] Admin lead queue displays route_label clearly
- [ ] Microcopy appears near submit button and on thank-you page

