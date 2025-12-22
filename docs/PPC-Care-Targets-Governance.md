# PPC Care Targets & Multi-Complaint Governance

**Clinic:** Pittsford Performance Care  
**Status:** Locked / Canonical  
**Document Type:** Cross-Cutting Governance Layer  
**Last Updated:** 2025-12-22  

---

## 1. Purpose & Scope

This document defines how Pittsford Performance Care models, manages, measures, and communicates care when patients present with multiple concurrent complaints.

### The Problem

Patients often present with multiple distinct concerns:

- A shoulder injury and recurring headaches
- Post-concussion symptoms and cervical dysfunction
- Chronic low back pain and a new ankle sprain

Each complaint may progress and resolve on a different timeline. Treating "discharge" as a single patient-level event creates:

- Confusion for patients who receive "end of care" messaging while still actively being treated
- Poor data integrity when partial resolutions are misclassified
- Suboptimal patient experience when communication doesn't reflect clinical reality

### The Solution

**Care Targets** allow PPC to respect clinical reality without fragmenting care.

This governance layer sits above individual platform surfaces and defines how reality is modeled across:

- Patient-facing experience
- Admin workflows
- Clinician workflows
- Discharge logic
- Analytics and outcomes registry integrity
- Automation and communication safety

---

## 2. Core Definitions (Locked Vocabulary)

### Episode

The patient-level container representing the relationship and time-bounded course of care.

An Episode:

- Begins when a patient enters active care
- Contains one or more Care Targets
- Remains open as long as any Care Target is in Active Care
- Closes when all Care Targets have transitioned out of Active Care

### Care Target

A distinct complaint, symptom cluster, or functional limitation addressed within an Episode.

Care Targets must be:

- **Plain-language** — Understandable without clinical jargon
- **Clinically meaningful** — Representing a real focus of treatment
- **Recognizable to the patient** — Aligned with how the patient describes their concern

Examples:

- "Right shoulder pain"
- "Post-concussion headaches"
- "Low back stiffness with radiating leg symptoms"
- "Balance and coordination after head injury"

### Primary Care Target

The complaint currently driving visit focus, communication tone, and prioritization.

In Phase 1, Primary Care Target is conceptual only — used to guide communication and clinical attention without requiring platform enforcement.

---

## 3. Care Target Status Model

Each Care Target exists in one of three canonical states:

### Active Care

PPC is actively working on this complaint.

- Regular visits are occurring or scheduled
- Treatment interventions are being applied
- Progress is being monitored

### Monitor / Maintenance

The complaint is stable with a clear plan; no active in-clinic treatment is occurring.

- Goals have been partially or fully met
- Patient is self-managing with guidance
- PPC remains available if status changes

### Discharged

Goals have been met or a stable plateau has been reached with an appropriate plan.

- Active treatment for this specific complaint has concluded
- Outcome data has been captured
- Communication reflects closure for this concern

**Important Clarifications:**

- Status definitions are conceptual in Phase 1
- Status changes represent clinical judgment, not administrative closure
- A Care Target may move between states based on clinical reality

---

## 4. Discharge Governance

This section defines the most critical governance rules for multi-complaint care.

### Foundational Principles

1. **Discharge occurs at the Care Target level, not the patient level.**

2. **Patients are never globally "discharged" if any Care Target remains in Active Care.**

3. **An Episode remains Active until all Care Targets are no longer in Active Care.**

4. **"Final" or "goodbye" communication is only appropriate when the Episode closes.**

### Multi-Complaint Discharge Rule

> Discharge is communicated at the Care Target level.
>
> Patients may transition out of active care for one concern while continuing care for others.
>
> All discharge communication must clearly state:
>
> - Which concern is transitioning
> - Which concerns (if any) remain active
> - What to expect next

### Governance Implications

**Correct:**  
"Your shoulder has reached its treatment goals and we're transitioning that concern to self-management. We'll continue focusing on your headaches during upcoming visits."

**Incorrect:**  
"You've been discharged from care." (when other Care Targets remain active)

**Incorrect:**  
Sending a discharge summary email while the patient has an active Care Target in treatment.

---

## 5. Patient Experience Implications

The Care Targets model exists to protect patient trust and clarity.

### What Patients Experience

- **Clarity, not complexity** — Patients understand which concerns are being addressed
- **Professional, scoped transitions** — Completion of one concern doesn't feel like abandonment
- **Continuous relationship** — The care relationship persists even as individual complaints resolve
- **Accurate messaging** — Communication reflects their actual care status

### What Patients Never Experience

- Premature "end of care" messaging
- Confusion about whether they're still being treated
- Feeling forgotten when one concern resolves but others remain
- Administrative closure that contradicts clinical reality

### Visibility Principle

Care Targets are rarely exposed explicitly to patients. Their benefit is experiential — patients feel understood and appropriately supported without needing to learn PPC's internal model.

---

## 6. Admin & Clinician Workflow Implications

### Admin Perspective

- **The Episode remains the unit of administrative work** — scheduling, communication, billing
- **Care Targets do not multiply cases, schedules, or messaging threads** — they organize attention within a single Episode
- **Discharge actions are scoped** — admins understand when communication should reference specific concerns vs. the entire Episode

### Clinician Perspective

- **Care Targets mirror how clinicians already think** — clinicians naturally track multiple concerns per patient
- **The model reduces cognitive load** — progress and discharge become explicit per complaint rather than conflated
- **Parallel progression is supported** — one concern may plateau while another improves, and the model reflects this
- **Clinical judgment drives status** — the model serves clinical reality, not administrative convenience

### Shared Benefit

Both admins and clinicians can:

- Clearly identify what's being actively treated
- Understand when partial transitions are appropriate
- Trust that communication will match clinical status

---

## 7. Outcomes, Analytics, and Registry Alignment

### Measurement Principle

> Outcomes belong to Care Targets first, Episodes second.

### What This Enables

**Clean Time-to-Resolution Metrics**  
Each Care Target has its own timeline. Resolution time is measured from when that specific concern entered Active Care to when it was Discharged.

**Accurate Discharge Rates**  
Discharge rates reflect actual clinical closure per concern, not administrative convenience.

**Partial Success Without Misclassification**  
A patient may fully resolve one Care Target while another remains in treatment. Both truths are captured without distortion.

**Stronger Longitudinal Registry Data**  
The outcomes registry can track patterns by complaint type, resolution timeline, and multi-complaint complexity — enabling richer research and quality improvement.

### Integrity Principle

Data integrity depends on the model. If discharge is recorded inaccurately (e.g., at the patient level when Care Targets remain active), all downstream analytics are compromised.

---

## 8. Automation & Communication Safety

The Care Targets model is essential for safe automation.

### What Care Targets Prevent

- **Incorrect automation triggers** — Discharge workflows don't fire prematurely
- **Wrong emotional messaging** — Patients don't receive "goodbye" emails while still in active treatment
- **Communication/clinical mismatch** — Automated messages reflect actual care status

### Safety Alignment

All automation must respect:

- The Episode vs. Care Target distinction
- The Multi-Complaint Discharge Rule
- The principle that "final" communication requires Episode closure

### Cross-Reference

This governance aligns with:

- **Patient Communication Canonical Reference** — Tone and messaging rules
- **Patient Journey Map** — Milestone and progression logic

Any automation that touches discharge, status transitions, or patient communication must be validated against this governance layer.

---

## 9. Governance & Phasing Note

### Current State (Phase 1)

This governance section defines the **conceptual model** that governs all care decisions, communication, and data integrity.

Phase 1 does not require platform changes. The model is:

- Understood and followed by clinicians and admins
- Reflected in communication practices
- Embedded in manual workflows

### Future Phases

Future phases may introduce:

- Internal tagging or explicit Care Target tracking
- UI surfaces for Care Target management
- Automated status transitions
- Analytics dashboards segmented by Care Target

All future implementations must align with this governance.

### Change Control

> Any deviation from this governance must be intentional, documented, and versioned.

This document is the source of truth. Platform features serve the model — the model does not bend to platform convenience.

---

## 10. Success Criteria

This governance is successful if:

| Stakeholder | Success Indicator |
|-------------|-------------------|
| **Clinician** | Can understand the model immediately and see how it mirrors clinical reality |
| **Admin** | Can see how the model prevents confusion and protects patient communication |
| **Developer** | Can build toward the model safely, knowing the rules are stable |
| **Researcher** | Can trust the data model for outcomes analysis and registry integrity |
| **Patient** | Never feels prematurely "finished" or confused about their care status |

---

## 11. Governance Note

This Care Targets Governance Section is a **first-class canonical artifact**.

It must be referenced by all future:

- Platform decisions
- Communication template changes
- Analytics implementations
- Automation logic
- Discharge workflow design

No patient-facing communication, admin workflow, or data model should contradict this governance.

---

*Document Status: Locked / Canonical*  
*Next Review: As needed upon Phase 2 planning*
