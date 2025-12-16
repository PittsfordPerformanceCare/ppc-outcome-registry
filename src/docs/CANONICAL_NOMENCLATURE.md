# Canonical Intake Nomenclature & Care Request Trigger Rules

> **Status**: ENFORCED  
> **Last Updated**: 2024-12-16  
> **Scope**: System-wide (UI, Code, Database)

## Canonical Definitions

### Care Request
- **Definition**: A prospective request for care
- **Characteristics**: Operational only. Not legal. Not a patient. Not clinical.
- **Created by**: Completed intake form submission from care-related CTA
- **Stored in**: `care_requests` table

### New Patient Forms
- **Definition**: Legal and compliance-bound forms
- **Trigger**: Sent only AFTER a first visit with New Patient Exam is scheduled
- **Characteristics**: Immutable after submission
- **Stored in**: `intake_forms` table (post-episode creation)

### Episode Intake Snapshot
- **Definition**: Clinical intake data attached to an Episode
- **Characteristics**: Read-only. Used for care delivery only. Not legal consent.
- **Stored in**: `episode_intake_snapshots` table

## Trigger Rules (Non-Negotiable)

### Care Request Creation
A Care Request is created **ONLY** when:
1. A user submits an intake form
2. The form was initiated by a care-related CTA
3. The submission is complete (not partial/abandoned)
4. `care_request_mode_enabled` is `true` in clinic_settings

### What Does NOT Create a Care Request
- CTA click alone (no form submission)
- Partial or abandoned forms
- Marketing actions:
  - Newsletter signup
  - Content download
  - Blog subscription
  - Contact-only forms
- Anonymous self-tests (unless escalated to full intake)

## Care-Related CTAs (DO Create Care Requests)

Examples:
- "Request an Evaluation"
- "Get Help for a Concussion"
- "Physician Referral"
- "Athlete Performance Assessment"
- "Contact Us for Care"
- "Schedule an Appointment"
- "Start Your Care Journey"

**Route**: All care-related CTAs → Intake Form → Care Request (on submit)

## Non-Care CTAs (DO NOT Create Care Requests)

Examples:
- Newsletter signup
- Blog subscription
- Resource download
- Anonymous self-tests
- Contact form (general inquiries)

**Route**: These create `leads` records, NOT Care Requests

## Data Model Separation

| Action | Table | Creates Care Request |
|--------|-------|---------------------|
| Care intake form submission | `intake_forms` + `care_requests` | ✅ Yes |
| Severity check | `leads` | ❌ No |
| Self-test (concussion) | `leads` | ❌ No |
| Self-test (MSK) | `leads` | ❌ No |
| Neurologic lead capture | `neurologic_intake_leads` | ❌ No |
| Newsletter signup | External/Marketing | ❌ No |

## Language & Terminology Rules

### Use These Terms ✅
- "Needs Review" (not "Pending")
- "In Progress" (not "Processing")
- "Ready for Conversion"
- "At Risk"
- "Awaiting Clarification"

### Avoid These Terms ❌
- "Pending"
- "Waiting"
- "On Hold"
- "Stuck"

## Developer Enforcement Checklist

- [ ] Care Requests ONLY created by `submit-intake-form` edge function
- [ ] No other system event creates Care Requests
- [ ] Care Requests never auto-create Patients, Episodes, or New Patient Forms
- [ ] Conversion from Care Request → Episode requires explicit admin approval
- [ ] All UI uses movement-oriented terminology
- [ ] Marketing actions route to `leads` table, not `care_requests`

## Current Implementation Status

### Compliant ✅
- `submit-intake-form` edge function: Only creates Care Request on full intake submission
- `leadTracking.ts`: Creates leads (not Care Requests) for severity checks and self-tests
- Admin Dashboard: Uses correct terminology

### Code References
- Care Request creation: `supabase/functions/submit-intake-form/index.ts`
- Lead creation: `src/lib/leadTracking.ts`
- Care Request queue: `src/components/care-requests/CareRequestsQueue.tsx`
- Dashboard: `src/components/lead-dashboard/`
- PCP Summary Queue: `src/pages/PCPQueue.tsx`

## PCP Summary Delivery Workflow

### Canonical Trigger
- **Trigger on**: `EPISODE_DISCHARGED` (discharge_date set)
- **System generates**: PCP Summary task in `pcp_summary_tasks` table
- **Lifecycle event**: `PCP_SUMMARY_GENERATED`

### Admin Notification Rules
- Notify admins only (not clinicians)
- Displayed as dedicated tile on Admin Dashboard (only when count > 0)
- Routes to `/pcp-queue` for delivery management

### Lifecycle Events
| Event | Trigger |
|-------|---------|
| `PCP_SUMMARY_GENERATED` | Episode discharged |
| `PCP_SUMMARY_SENT` | Admin confirms delivery |
| `PCP_SUMMARY_SKIPPED` | Admin skips delivery |

### Delivery Methods
- Fax
- Secure Email
- Manual Export/Print
- Phone/Verbal

## Acceptance Criteria

1. ✅ Every Care Request traceable to specific care CTA + completed intake
2. ✅ No Care Requests from marketing-only actions
3. ✅ Terminology consistent across UI
4. ✅ Conversion requires explicit admin action
5. ✅ PCP Summaries only generated after discharge
6. ✅ PCP delivery is admin responsibility, not clinician
