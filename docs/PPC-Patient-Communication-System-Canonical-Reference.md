# PPC Patient Communication System — Canonical Reference

> **Document Status**: LOCKED STANDARD  
> **Last Updated**: December 2024  
> **Purpose**: Authoritative source for all prospective patient email communications  
> **Governance**: Do not modify without explicit revision approval

---

## Overview

This document defines the complete email communication system for prospective patients at Pittsford Performance Care. All email templates, triggers, timing, and copy are governed by this specification.

---

## 1. Lead Confirmation Email

| Property | Value |
|----------|-------|
| **Trigger** | Immediately when a lead submits the public inquiry form |
| **Function** | `send-lead-confirmation` |
| **Subject (Standard)** | "We've Received Your Inquiry - Pittsford Performance Care" |
| **Subject (Concussion)** | "We've Received Your Inquiry + Acute Concussion Guide" |

### Email Copy

```
Hi [Name],

Thank you for contacting Pittsford Performance Care. We've received your inquiry regarding [primary concern] and our team will review it within 1-2 business days.

What Happens Next:
• Our team will review your information
• We'll contact you via your preferred method to discuss your needs
• Most patients are seen within 1-2 weeks of initial contact
```

### Conditional Section (Concussion Symptoms Reported)

```
📘 Acute Concussion Guide: Early Recovery

Based on your reported symptoms, we recommend reviewing our acute concussion guide. This resource covers the first 24 hours and first week after a head injury, including important safety information and recovery guidance.

[Open Acute Concussion Guide button]
```

---

## 2. Onboarding Email — Neurologic Evaluation

| Property | Value |
|----------|-------|
| **Trigger** | Manually sent by admin when approving lead for neuro evaluation |
| **Function** | `send-onboarding-email` (templateType: "neuro") |
| **Subject** | "Welcome to Pittsford Performance Care — Your Neurologic Evaluation & Intake Forms" |

### Email Copy

```
Hi [Name],

We're looking forward to meeting you for your upcoming Neurologic Evaluation. Before your first visit, please complete the digital New Patient Intake Forms.

[Complete Your Intake Forms button]

What to Expect:

🧠 Detailed Symptom Conversation
A thorough discussion about your symptoms and history to understand your unique presentation.

👁️ Focused Neurologic Examination
Tailored examination including evaluation of eye movements, balance, coordination, and autonomic function as appropriate.

📋 History Review
Review of any prior injuries, concussion history, or developmental factors (for pediatric cases).

Please Plan To:
• Arrive 10 minutes early
• Wear comfortable clothing
• Bring imaging reports (X-rays, MRI, CT, etc.) and relevant medical documentation
• Bring glasses or contacts if you wear them

Our goal is to help you understand why your symptoms are happening and create a clear path forward with a neurologically grounded plan.
```

---

## 3. Onboarding Email — MSK Evaluation

| Property | Value |
|----------|-------|
| **Trigger** | Manually sent by admin when approving lead for MSK evaluation |
| **Function** | `send-onboarding-email` (templateType: "msk") |
| **Subject** | "Welcome to Pittsford Performance Care — Your Movement-Based MSK Evaluation & Intake Forms" |

### Email Copy

```
Hi [Name],

Thank you for choosing Pittsford Performance Care. We're excited to help you begin your Neurologically Guided MSK Evaluation.

[Complete Your Intake Forms button]

What to Expect:

💬 Symptom Conversation
A conversation about your symptoms, movement concerns, and history.

🏃 Movement Assessment
Testing of joint function, movement patterns, symmetry, speed, and motor control.

🧠 Neurologically Informed MSK Assessment
Determination of whether your symptoms reflect protective patterns, delayed firing, asymmetry, energy inefficiency, or residual effects from prior injuries.

Note: You do not need imaging to begin treatment, but bring any reports if available.

Please Also:
• Arrive 10 minutes early
• Wear comfortable clothing
• Be prepared for movement-based evaluation

Our goal is to help you understand what is driving your pain or performance limitation and outline a clear strategy to restore efficient, neurologically coordinated movement.
```

---

## 4. First Intake Reminder

| Property | Value |
|----------|-------|
| **Trigger** | Automated: 12+ hours after lead creation, intake not completed |
| **Function** | `send-intake-auto-reminders` |
| **Subject** | "Please complete your intake form before your visit with Pittsford Performance Care" |

### Email Copy

```
Hi [Name],

This is a friendly reminder to complete your digital intake form for your upcoming visit with Pittsford Performance Care.

Your intake helps us prepare for your neurologic evaluation and ensure your first visit is focused, efficient, and tailored to you.

[Complete Your Intake button]

If you've already completed your intake, you can ignore this message.
```

---

## 5. Second/Final Intake Reminder

| Property | Value |
|----------|-------|
| **Trigger** | Automated: 24+ hours after lead creation, first reminder sent, intake still not completed |
| **Function** | `send-intake-auto-reminders` |
| **Subject** | "Final reminder: intake form for your upcoming PPC visit" |

### Email Copy

```
Hi [Name],

This is a final reminder to complete your intake form before your visit with Pittsford Performance Care. Completing this now will help us start your care on time and avoid delays.

[Complete Your Intake button]

If you've already completed your intake, you can ignore this message.
```

---

## 6. Intake Welcome Email

| Property | Value |
|----------|-------|
| **Trigger** | Automatically when intake form status changes to "submitted" (database trigger: `notify_intake_submitted`) |
| **Function** | `send-intake-welcome` |
| **Subject/Content** | Uses templates from `clinic_settings`: `intake_complete_welcome_subject` / `intake_complete_welcome_template` |

### Template Variables Available

| Variable | Description |
|----------|-------------|
| `{{patient_name}}` | Patient's full name |
| `{{clinic_name}}` | Clinic name |
| `{{clinic_phone}}` | Clinic phone number |
| `{{clinic_address}}` | Clinic address |
| `{{clinic_email}}` | Clinic email |
| `{{episode_type}}` | Type of episode |
| `{{body_region}}` | Body region of concern |
| `{{injury_date}}` | Date of injury |

---

## 7. Scheduling Email (Optional)

| Property | Value |
|----------|-------|
| **Trigger** | Sent with intake welcome if `send_scheduling_email` is enabled in clinic settings |
| **Function** | `send-intake-welcome` |
| **Subject/Content** | Uses templates: `intake_complete_scheduling_subject` / `intake_complete_scheduling_template` |

---

## 8. Referral Decline Email

| Property | Value |
|----------|-------|
| **Trigger** | Manually sent when admin declines/archives a lead |
| **Function** | `send-referral-decline` |
| **Subject/Content** | Uses templates from `clinic_settings`: `referral_decline_email_subject` / `referral_decline_email_template` |

### Template Variables

| Variable | Description |
|----------|-------------|
| `{{name}}` | Patient's name |
| `{{clinic_name}}` | Clinic name |
| `{{decline_reason}}` | Reason for declining referral |

---

## Communication Timeline

```
Lead Submits Inquiry
    ↓
[Immediate] Lead Confirmation Email
    ↓
[Admin Action] Approve → Onboarding Email (Neuro or MSK)
    OR
[Admin Action] Decline → Referral Decline Email
    ↓
[+12 hours, auto] First Intake Reminder (if not completed)
    ↓
[+24 hours, auto] Final Intake Reminder (if still not completed)
    ↓
[Patient Submits Intake]
    ↓
[Immediate] Intake Welcome Email (+Scheduling Email if enabled)
```

---

## Implementation Notes

### Edge Functions

| Function | Purpose |
|----------|---------|
| `send-lead-confirmation` | Initial inquiry acknowledgment + optional concussion guide |
| `send-onboarding-email` | Neuro/MSK evaluation welcome + intake link |
| `send-intake-auto-reminders` | Automated 12hr/24hr intake reminders |
| `send-intake-welcome` | Post-intake submission confirmation |
| `send-referral-decline` | Referral decline notification |

### Concussion Education Matching

The `isConcussionEducationCandidate` function determines whether to include the Acute Concussion Guide link based on the patient's reported symptoms. Keywords and patterns are defined in:
- `supabase/functions/_shared/concussion-education-matcher.ts`
- `src/utils/concussionEducationMatcher.ts`

---

## Revision History

| Date | Change | Approved By |
|------|--------|-------------|
| December 2024 | Initial canonical reference established | — |

---

*This document is the authoritative source for all prospective patient email communications. Any deviations from this specification require explicit approval and documentation in the revision history.*
