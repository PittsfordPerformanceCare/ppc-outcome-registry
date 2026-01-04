# PPC Registry — Scope & Limitations Statement

**Version:** 1.0  
**Date:** 2026-01-04

---

## 1. What the Registry Includes

The PPC Registry captures structured, de-identified outcomes data from musculoskeletal and neurological care episodes:

### 1.1 Clinical Domains

| Domain | Description |
|--------|-------------|
| Musculoskeletal (MSK) | Spine, extremity, and joint conditions |
| Neurological | Vestibular, concussion, and functional neurology |
| Multi-complaint | Episodes addressing multiple body regions |

### 1.2 Data Elements

| Category | Elements |
|----------|----------|
| **Care Targets** | Body region, outcome instrument, status |
| **Outcome Scores** | Baseline, discharge, delta |
| **MCID Analysis** | Threshold, achievement status |
| **Demographics** | Age band (de-identified) |
| **Temporality** | Quarter-bucketed episode dates |
| **Episode Metadata** | Number of care targets, status |

### 1.3 Validated Outcome Instruments

| Instrument | Region | MCID Threshold |
|------------|--------|----------------|
| NDI (Neck Disability Index) | Cervical | 7 points |
| ODI (Oswestry Disability Index) | Lumbar | 10 points |
| LEFS (Lower Extremity Functional Scale) | Lower extremity | 9 points |
| DASH (Disabilities of Arm, Shoulder, Hand) | Upper extremity | 10 points |
| QuickDASH | Upper extremity | 8 points |
| Additional instruments | Various | Configurable |

---

## 2. What the Registry Does NOT Do

### 2.1 No Diagnosis

The registry does **not**:
- Assign or confirm diagnoses
- Classify conditions using ICD codes
- Provide diagnostic decision support

**Rationale:** Data reflects clinician-reported care targets, not diagnostic classifications.

### 2.2 No Treatment Prediction

The registry does **not**:
- Predict treatment outcomes for individual patients
- Recommend specific interventions
- Suggest treatment protocols

**Rationale:** Observational data cannot establish causal relationships.

### 2.3 No Treatment Recommendations

The registry does **not**:
- Prescribe treatments
- Guide clinical decision-making
- Replace clinical judgment

**Rationale:** Registry data supports population-level analysis, not individual patient care.

### 2.4 No Causal Claims

The registry does **not**:
- Establish cause-and-effect relationships
- Attribute outcomes to specific interventions
- Control for confounding variables

**Rationale:** Practice-based registry data is observational by nature.

---

## 3. Intended Uses

### 3.1 Supported Use Cases

| Use Case | Description | Status |
|----------|-------------|--------|
| **Quality Improvement** | Track MCID rates, outcome distributions | ✅ Supported |
| **Benchmarking** | Compare against historical or peer data | ✅ Supported |
| **Registry Submission** | Report to specialty registries (AAOS, FOTO) | ✅ Supported |
| **Academic Publication** | Observational outcomes research | ✅ Supported |
| **Descriptive Statistics** | Population-level summaries | ✅ Supported |

### 3.2 Unsupported Use Cases

| Use Case | Reason |
|----------|--------|
| Clinical decision support | No causal modeling |
| Treatment recommendations | Observational only |
| Insurance determinations | Not designed for coverage decisions |
| Legal/forensic analysis | Not validated for legal use |

---

## 4. Limitations

### 4.1 Practice-Based Sample

- Data reflects a convenience sample from participating practices
- Not a population-representative sample
- Selection bias may affect generalizability

### 4.2 Observational Nature

- No randomization or control groups
- Cannot establish causation
- Confounding variables not controlled

### 4.3 Data Quality Dependencies

- Accuracy depends on clinician data entry
- Missing data may exist for some fields
- Outcome capture rates vary by practice

### 4.4 Temporal Constraints

- Date bucketing (YYYY-Q) limits precise temporal analysis
- Seasonality effects may be obscured
- Long-term follow-up not captured

### 4.5 De-Identification Trade-offs

- Age banding reduces granularity
- Geographic information excluded
- Some subgroup analyses not possible

---

## 5. Appropriate Interpretation

When using registry data, researchers should:

1. **Acknowledge limitations** in publications
2. **Avoid causal language** (use "associated with" not "caused by")
3. **Report sample characteristics** and potential biases
4. **Consider missing data** impact on conclusions
5. **Frame findings as hypothesis-generating** for future research

---

## 6. Data Governance

| Control | Implementation |
|---------|----------------|
| Access | Admin/Owner role required |
| Audit | All exports logged |
| De-identification | HIPAA Safe Harbor compliant |
| Versioning | Schema and hash versions tracked |

---

## 7. Future Enhancements (Not Currently Included)

The following are **not in scope** for the current registry version:

- k-anonymity verification
- Differential privacy
- Free-text NLP de-identification
- Cohort builder UI
- IRB workflow automation
- Geographic region analysis

---

## 8. Summary

The PPC Registry is a **de-identified, observational outcomes repository** supporting quality improvement, benchmarking, and publication. It explicitly does **not** provide diagnostic, prognostic, or treatment recommendations.

Users must interpret data within these constraints and acknowledge limitations in any derived work.

---

*This scope statement should accompany all registry data use agreements and publication submissions.*
