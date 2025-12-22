# Phase 4A Patient Discharge Letter Governance

**Status:** Canonical / Locked  
**Scope:** Patient-Facing Episode Discharge Letter Automation  
**Last Updated:** 2025-01-22  
**Artifact Type:** Patient Communication (Episode-Level)

---

## Purpose

This document establishes the canonical governance for the patient-facing episode discharge letter implemented in Phase 4A. It ensures the letter serves as a calm, clear transition artifact that maintains trust and continuity without triggering prematurely or contradicting Care Target logic.

---

## Core Principles

### 1. Episode-Level Only

The patient-facing discharge letter:

- **MUST** be generated and sent only when `episode.status === 'CLOSED'`
- **MUST NOT** be generated or sent:
  - At Care Target discharge
  - During partial completion
  - During Monitor / Maintenance states

### 2. Clinician Confirmation Required

Before sending:

- A draft **MUST** be generated
- A clinician **MUST** explicitly review and confirm the letter
- No automatic sending is permitted
- UI confirmation is required and must be logged

### 3. One Letter Per Episode (Idempotency)

- Only one patient-facing episode discharge letter may be sent per episode
- If a letter has already been sent:
  - Sending **MUST** be blocked
  - Regeneration may occur only via explicit clinician action
  - Duplicate delivery is not permitted

### 4. Alignment With PCP Summary

The patient letter **MUST**:

- Reflect the same episode scope and Care Targets as the PCP discharge summary
- Use plain language
- Avoid outcome scores, metrics, or technical detail
- Never introduce new findings or conclusions

---

## Content & Tone Requirements

### Tone (Mandatory)

- Warm, calm, professional
- Reassuring but not celebratory
- Confident without finality
- Plain language, no jargon

### Words to Avoid

- "Discharged"
- "Treatment completed"
- "No further care needed"

### Preferred Language

- "Transition out of active care"
- "Stable and managing well"
- "We're here if you need us"

### Required Structure (Must Match Exactly)

The letter **MUST** include these sections, in this order:

1. Opening acknowledgment
2. What we focused on together (Care Targets in plain language)
3. How things progressed
4. Where you are now
5. What to expect going forward
6. When to reach back out
7. Closing reassurance and signature

No sections may be omitted.

---

## Template Variables

The implementation **MUST** support:

| Variable | Description |
|----------|-------------|
| `{{patient_name}}` | Patient's full name |
| `{{clinic_phone}}` | Clinic contact phone |
| `{{clinic_email}}` | Clinic contact email |
| `{{care_targets[]}}` | Plain-language care target names |

No internal identifiers or technical terms should be exposed.

---

## Guardrail Enforcement: Source of Truth

> **The edge function is the source of truth for all Phase 4A patient letter blocks.**

### Enforcement Matrix

| Rule | Code | Enforcement Layer | UI Role |
|------|------|-------------------|---------|
| Rule 1 | `EPISODE_NOT_CLOSED` | Server (hard block) | Display error message |
| Rule 2 | `ALREADY_SENT` | Server (hard block) | Disable send button |
| Rule 3 | `CONFIRMATION_REQUIRED` | Server (hard block) | Show confirm step |

### Server-Side Authority

The `generate-patient-discharge-letter` edge function:

1. **Must** validate all guardrails before processing
2. **Must** return structured error codes for each block type
3. **Must** log lifecycle events for blocked and successful actions
4. **Must not** assume UI checks were respected
5. **Must not** leak PHI during blocked states

### UI Responsibilities

The UI (hooks, dialogs, components):

1. **Should** pre-validate to avoid unnecessary server calls
2. **Should** display user-friendly explanations for blocks
3. **Should** guide users through confirm → send workflow
4. **Must not** be treated as the enforcement layer
5. **Must not** bypass server validation under any circumstance

---

## Lifecycle Event Logging

The following events **MUST** be logged:

| Event Type | Trigger |
|------------|---------|
| `PATIENT_EPISODE_DISCHARGE_LETTER_DRAFTED` | Draft successfully created |
| `PATIENT_EPISODE_DISCHARGE_LETTER_CONFIRMED` | Clinician confirmed letter |
| `PATIENT_EPISODE_DISCHARGE_LETTER_SENT` | Letter delivered to patient |
| `PATIENT_EPISODE_DISCHARGE_LETTER_BLOCKED_NOT_CLOSED` | Rule 1 block |
| `PATIENT_EPISODE_DISCHARGE_LETTER_BLOCKED_ALREADY_SENT` | Rule 2 block |

Logs **MUST** be:

- Append-only
- Associated with `episode_id`
- Timestamped
- Include actor where applicable

---

## Failure Modes

The system **MUST** block sending if:

- Episode is not CLOSED
- Clinician confirmation has not occurred
- Letter has already been sent

Blocked states **MUST**:

- Surface clear UI feedback
- Never fail silently
- Log the block event

---

## Explicit Non-Goals

This implementation **MUST NOT**:

- Add new automation triggers
- Modify Care Target logic
- Change scheduling behavior
- Send letters automatically
- Replace PCP discharge summaries

This is a patient-facing mirror, not a replacement.

---

## Future Change Requirements

Any modification to Phase 4A patient letter guardrails **MUST**:

1. Preserve server-side enforcement as authoritative
2. Maintain idempotency guarantees (Rule 2)
3. Preserve clinician confirmation requirement (Rule 3)
4. Log all blocked actions to `lifecycle_events`
5. Be documented and versioned
6. Not silently weaken or bypass existing blocks

If a change appears to simplify or remove server-side enforcement, it must be:

- Explicitly justified
- Reviewed for safety implications
- Documented in this file with rationale

---

## Related Documentation

- [Phase 3 Guardrail Enforcement — Source of Truth](./PPC-Phase-3-Guardrail-Enforcement-Source-of-Truth.md)
- [PPC Care Target Governance](./PPC-Care-Targets-Governance.md)
- [PPC Patient Communication System — Canonical Reference](./PPC-Patient-Communication-System-Canonical-Reference.md)

---

## Summary

**This patient-facing episode discharge letter is a first-class, governed artifact.**

Server-side is authoritative for all guardrails. UI checks are supportive only.

Clinician confirmation is mandatory. Automatic sending is prohibited.

Patients receive exactly one calm, clear discharge letter per episode.
