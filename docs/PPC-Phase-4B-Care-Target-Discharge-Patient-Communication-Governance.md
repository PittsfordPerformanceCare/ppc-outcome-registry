# Phase 4B Care Target Discharge Patient Communication Governance

**Status:** Canonical / Locked  
**Scope:** Patient-Facing Care Target Discharge Communication  
**Last Updated:** 2025-01-22  
**Artifact Type:** Patient Communication (Care-Target Level)

---

## Purpose

This document establishes the canonical governance for the patient-facing care target discharge communication implemented in Phase 4B. It ensures the communication provides calm, specific acknowledgment of progress on a single care target while explicitly clarifying what remains active.

---

## Core Principles

### 1. Care Target Scope Only

This communication:

- **MUST** be tied to a single Care Target
- **MUST NOT** reference episode-level closure
- **MUST NOT** imply that overall care is complete

This is a partial transition, not an endpoint.

### 2. Clinician Confirmation Required

Before sending:

- A draft **MUST** be generated
- A clinician **MUST** explicitly review and confirm
- No automatic sending is permitted
- UI confirmation is required and must be logged

### 3. Episode Must Remain Active (Guardrail)

The system **MUST** block sending if:

- The episode is already CLOSED

This prevents overlapping or contradictory messaging with the episode discharge letter.

### 4. Explicit "What Remains Active" Clause (Critical)

Every Care Target discharge message **MUST** include:

- A clear statement of what is still active, **OR**
- A clear statement that no other active concerns remain **without implying episode closure**

This clause is **mandatory** to prevent patient misinterpretation.

### 5. One Message per Care Target per Episode (Idempotency)

- Each Care Target may generate only one discharge communication per episode
- Duplicate sends **MUST** be blocked server-side
- Regeneration allowed only via explicit clinician action

---

## Content & Tone Requirements

### Tone (Mandatory)

- Calm
- Specific
- Reassuring
- Non-terminal
- Plain language

### Words to Avoid

- "You are discharged"
- "Treatment complete"
- "No further care needed"

### Preferred Language

- "This concern no longer requires active in-clinic care"
- "We'll continue focusing on…"
- "This reflects progress, not an ending"

### Required Structure (Must Match Exactly)

The Care Target discharge message **MUST** include, in order:

1. Opening acknowledgment of progress
2. Clear identification of the specific concern transitioning
3. Explanation of what this transition means
4. Explicit statement of what remains active (if anything)
5. Reassurance and continuity statement
6. Professional closing

No sections may be omitted.

---

## Template Variables

The implementation **MUST** support:

| Variable | Description |
|----------|-------------|
| `{{patient_name}}` | Patient's full name |
| `{{care_target_name}}` | Plain-language care target name |
| `{{remaining_active_targets[]}}` | Plain-language names of remaining active targets |
| `{{clinic_phone}}` | Clinic contact phone |
| `{{clinic_email}}` | Clinic contact email |

No internal identifiers or technical terms should be exposed.

---

## Guardrail Enforcement: Source of Truth

> **The edge function is the source of truth for all Phase 4B care target discharge message blocks.**

### Enforcement Matrix

| Rule | Code | Enforcement Layer | UI Role |
|------|------|-------------------|---------|
| Rule 1 | `EPISODE_CLOSED` | Server (hard block) | Display error message |
| Rule 2 | `ALREADY_SENT` | Server (hard block) | Disable send button |
| Rule 3 | `CONFIRMATION_REQUIRED` | Server (hard block) | Show confirm step |

### Server-Side Authority

The `generate-care-target-discharge-message` edge function:

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
| `CARE_TARGET_DISCHARGE_MESSAGE_DRAFTED` | Draft successfully created |
| `CARE_TARGET_DISCHARGE_MESSAGE_CONFIRMED` | Clinician confirmed message |
| `CARE_TARGET_DISCHARGE_MESSAGE_SENT` | Message delivered to patient |
| `CARE_TARGET_DISCHARGE_MESSAGE_BLOCKED_EPISODE_CLOSED` | Rule 1 block |
| `CARE_TARGET_DISCHARGE_MESSAGE_BLOCKED_ALREADY_SENT` | Rule 2 block |

Logs **MUST** be:

- Append-only
- Associated with `episode_id` and `care_target_id`
- Timestamped
- Include actor where applicable

---

## Failure Modes

The system **MUST** block sending if:

- Episode status is CLOSED
- Clinician confirmation has not occurred
- Message already sent for this care target
- Care Target identifier is missing or ambiguous

Blocked states **MUST**:

- Surface clear UI feedback
- Never fail silently
- Log the block event

---

## Explicit Non-Goals

This implementation **MUST NOT**:

- Trigger PCP communication
- Trigger episode-level discharge logic
- Include outcome scores
- Replace patient episode discharge letter
- Auto-send messages
- Modify scheduling or billing logic

This is a supporting communication, not a terminal event.

---

## Future Change Requirements

Any modification to Phase 4B care target discharge message guardrails **MUST**:

1. Preserve server-side enforcement as authoritative
2. Maintain idempotency guarantees (Rule 5)
3. Preserve clinician confirmation requirement (Rule 2)
4. Maintain "what remains active" clause requirement (Rule 4)
5. Log all blocked actions to `lifecycle_events`
6. Be documented and versioned
7. Not silently weaken or bypass existing blocks

If a change appears to simplify or remove server-side enforcement, it must be:

- Explicitly justified
- Reviewed for safety implications
- Documented in this file with rationale

---

## Related Documentation

- [Phase 3 Guardrail Enforcement — Source of Truth](./PPC-Phase-3-Guardrail-Enforcement-Source-of-Truth.md)
- [Phase 4A Patient Discharge Letter Governance](./PPC-Phase-4A-Patient-Discharge-Letter-Governance.md)
- [PPC Care Target Governance](./PPC-Care-Targets-Governance.md)
- [PPC Patient Communication System — Canonical Reference](./PPC-Patient-Communication-System-Canonical-Reference.md)

---

## Summary

**This care target discharge patient communication is a first-class, governed artifact.**

Server-side is authoritative for all guardrails. UI checks are supportive only.

Clinician confirmation is mandatory. Automatic sending is prohibited.

Every message must explicitly state what remains active (or clarify if nothing does).

Patients receive exactly one calm, specific transition message per care target per episode.
