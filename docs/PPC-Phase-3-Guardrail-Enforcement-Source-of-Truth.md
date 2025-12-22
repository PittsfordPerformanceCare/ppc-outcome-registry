# Phase 3 Guardrail Enforcement: Source of Truth

**Status:** Canonical / Locked  
**Scope:** Episode-Level PCP Discharge Summary Automation  
**Last Updated:** 2025-01-22  

---

## Purpose

This document establishes the authoritative enforcement model for Phase 3 Episode Discharge automation guardrails. It ensures future developers understand where enforcement belongs and prevents regression to UI-only validation.

---

## Core Principle

> **The edge function is the source of truth for all Phase 3 hard blocks.**

UI validation exists to improve user experience and explain blocks to clinicians, but **does not define eligibility**. The server must enforce all guardrails independently of client-side behavior.

---

## Guardrail Enforcement Matrix

| Rule | Code | Enforcement Layer | UI Role |
|------|------|-------------------|---------|
| Rule 1 | `EPISODE_NOT_CLOSED` | Server (hard block) | Display error message |
| Rule 2 | `ALREADY_SENT` | Server (hard block) | Disable send button |
| Rule 6 | `PCP_MISSING` | Server (send block) | Show alert, guide user |

---

## Server-Side Authority

The `generate-pcp-discharge-summary` edge function:

1. **Must** validate all guardrails before processing
2. **Must** return structured error codes for each block type
3. **Must** log lifecycle events for blocked and successful actions
4. **Must not** assume UI checks were respected
5. **Must not** leak PHI during blocked states

---

## UI Responsibilities

The UI (hooks, dialogs, components):

1. **Should** pre-validate to avoid unnecessary server calls
2. **Should** display user-friendly explanations for blocks
3. **Should** guide users to resolve blocking conditions
4. **Must not** be treated as the enforcement layer
5. **Must not** bypass server validation under any circumstance

---

## Future Change Requirements

Any modification to Phase 3 guardrails **must**:

1. Preserve server-side enforcement as authoritative
2. Maintain idempotency guarantees (Rule 2)
3. Log all blocked actions to `lifecycle_events`
4. Be documented and versioned
5. Not silently weaken or bypass existing blocks

If a change appears to simplify or remove server-side enforcement, it must be:
- Explicitly justified
- Reviewed for safety implications
- Documented in this file with rationale

---

## Related Documentation

- [PPC Care Target Governance](./PPC-Care-Targets-Governance.md)
- [PPC Care Target ↔ Outcome Association](./PPC-Care-Target-Outcome-Association.md)
- [PPC Patient Communication System — Canonical Reference](./PPC-Patient-Communication-System-Canonical-Reference.md)

---

## Lifecycle Events (Reference)

The following events are logged by the edge function:

| Event Type | Trigger |
|------------|---------|
| `PCP_DISCHARGE_DRAFT_GENERATED` | Draft successfully created |
| `PCP_DISCHARGE_CONFIRM_BLOCKED_EPISODE_NOT_CLOSED` | Rule 1 block |
| `PCP_DISCHARGE_CONFIRM_BLOCKED_ALREADY_SENT` | Rule 2 block |
| `PCP_DISCHARGE_CONFIRM_BLOCKED_PCP_MISSING` | Rule 6 block |
| `PCP_DISCHARGE_CONFIRMED` | Clinician confirmed summary |
| `PCP_DISCHARGE_SENT` | Summary delivered to PCP |

---

## Summary

**Server-side is authoritative for discharge guardrails. UI checks are supportive only.**

This principle is non-negotiable for Phase 3 Episode Discharge automation.
