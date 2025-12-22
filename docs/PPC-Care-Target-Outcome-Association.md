# PPC Care Target Outcome Association & Registry Integrity

## Canonical Behavioral Rule Set

**Clinic:** Pittsford Performance Care  
**Scope:** Internal Logic (Clinician / Admin / Analytics)  
**Phase:** Phase 2 — Internal-Only  
**Status:** Canonical  
**Patient Impact:** None  
**Automation Impact:** None (manual triggers only unless explicitly enabled later)  
**Last Updated:** 2025-12-22

---

## 1. Primary Objective

This document teaches the PPC platform to associate outcome assessments with specific Care Targets so that each complaint maintains a clean, symmetric outcome lifecycle (baseline → discharge), even when multiple complaints exist within a single episode.

This logic preserves PPC's registry brilliance while allowing future scalability.

---

## 2. Core Governing Principle (Locked)

> **Each Care Target has its own outcome lifecycle.**

- The same outcome instrument must be administered at the beginning and at the end of active care for that Care Target
- Outcome analysis is performed at the Care Target level
- Episode-level outcomes are optional and additive, not substitutes

**This principle must never be violated by automation or UI behavior.**

---

## 3. Conceptual Objects

The platform reasons about the following concepts, even if not yet explicitly modeled:

| Concept | Definition |
|---------|------------|
| **Episode** | Patient-level care container |
| **Care Target** | Complaint-level unit of care |
| **Outcome Instrument** | Validated assessment tool (e.g., NDI, ODI, LEFS, QuickDASH, RPQ) |
| **Outcome Instance** | A completed assessment at a point in time |
| **Outcome Time Point** | Baseline \| Progress (optional) \| Discharge |

---

## 4. Association Rules (Critical)

### Rule 1: Outcome ↔ Care Target Binding

Every completed outcome assessment must be associated with:

- Exactly one Episode
- Exactly one Care Target
- Exactly one Outcome Instrument
- Exactly one Time Point

**Outcomes must never be "episode-only" by default if a Care Target exists.**

---

### Rule 2: Baseline Outcome Association (Episode Intake)

At initial episode intake:

- One or more Care Targets may be identified
- Each Care Target must be associated with one primary outcome instrument
- The patient may complete multiple outcome instruments in a single intake flow

**Internal Tagging:**

Each completed outcome is tagged as:
- Care Target–specific
- Time Point = Baseline

Patient experience must remain unchanged.

---

### Rule 3: Outcome Instrument Consistency

For any given Care Target:

- The same outcome instrument used at Baseline **must** be reused at Discharge
- Instrument substitution is not permitted unless explicitly documented

**This preserves analytic symmetry.**

---

### Rule 4: Discharge Outcome Association (Care Target Level)

When a Care Target transitions out of Active Care:

- The platform must prompt (or allow) administration of the same outcome instrument used at Baseline
- This outcome is tagged as:
  - Care Target–specific
  - Time Point = Discharge

**If other Care Targets remain Active:**

- No global episode discharge occurs
- No "final" patient messaging is triggered

---

### Rule 5: Multi-Complaint Independence

In episodes with multiple Care Targets:

Each Care Target maintains its own:
- Baseline outcome
- Discharge outcome
- Time-to-resolution

**Critical Constraints:**

- Care Targets may discharge at different times
- Outcomes from one Care Target must never be reused, averaged, or inferred for another

---

## 5. Analytics & Registry Rules

### Measurement Priority

> **Care Target outcomes are the primary analytic unit.**

Episode-level metrics may be derived but must not replace Care Target analysis.

### Platform Must Support

- Pre/post delta per Care Target
- Time-to-resolution per Care Target
- Partial success within a single Episode

**This logic enables publication-grade registry outputs.**

---

## 6. Safety & Guardrails

The platform must prevent:

| Violation | Prevention |
|-----------|------------|
| Discharge of a Care Target without a corresponding discharge outcome | Require explicit override |
| Use of mismatched baseline/discharge instruments | Enforce instrument consistency |
| Global discharge messaging when any Care Target remains Active | Block final messaging until Episode closes |
| Outcome analysis that blends multiple Care Targets unintentionally | Maintain strict association boundaries |

---

## 7. Phasing Note

This document defines **association logic only**.

**It does not require:**

- UI changes
- Database migrations
- Automated emails
- Historical data backfills

**All association actions may be:**

- Manual
- Clinician-initiated
- Admin-assisted

Future phases may automate these behaviors only if aligned with this logic.

---

## 8. Success Criteria

This logic is successful if:

- Clinicians can clearly state which outcome belongs to which complaint
- Baseline and discharge symmetry is preserved per Care Target
- Multi-complaint patients do not distort registry analytics
- Patients experience no additional friction
- Developers can extend automation safely in later phases

---

## 9. Cross-Reference

This document aligns with and extends:

- [PPC Care Targets Governance](./PPC-Care-Targets-Governance.md)
- [PPC Patient Communication System — Canonical Reference](./PPC-Patient-Communication-System-Canonical-Reference.md)

---

## 10. Governance Note

This outcome-to-Care-Target association logic is **canonical**.

All future work related to:

- Discharge automation
- Outcome dashboards
- Registry analytics
- Research publication

**must align with this document unless explicitly revised and versioned.**
