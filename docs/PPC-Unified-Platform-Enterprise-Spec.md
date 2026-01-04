# PPC Unified Platform — Enterprise Specification Sheet

**Version:** 1.0  
**Classification:** Internal / Business Development  
**Last Updated:** 2026-01-04  
**Status:** Canonical

---

## Executive Summary

The PPC Unified Platform is a purpose-built clinical outcome registry and practice management system designed for musculoskeletal (MSK) and neurological rehabilitation practices. It delivers publication-grade outcome tracking, multi-complaint care management, and HIPAA-compliant patient communication—all within a modern, cloud-native architecture.

---

## 1. Platform Overview

### 1.1 Core Value Proposition

| Capability | Description |
|------------|-------------|
| **Outcome Registry** | Publication-grade outcome tracking with validated instruments (NDI, ODI, QuickDASH, LEFS, RPQ) |
| **Multi-Complaint Care Model** | Care Target architecture enabling independent tracking of multiple complaints per episode |
| **Professional Communication** | Automated PCP summaries, discharge letters, and patient messaging |
| **Leadership Analytics** | Real-time dashboards for volume, resolution, outcomes, and data integrity |
| **Patient Engagement** | Portal access, gamification, and referral tracking |

### 1.2 Target Audience

- **Primary:** Chiropractic and physical therapy practices with outcome-focused care models
- **Secondary:** Multi-site rehabilitation networks, research institutions, payor partners

---

## 2. Technical Architecture

### 2.1 Infrastructure Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | Single-page application with real-time updates |
| **Styling** | Tailwind CSS + shadcn/ui | Design system with semantic tokens |
| **State Management** | TanStack Query v5 | Server state synchronization with optimistic updates |
| **Backend** | Supabase (PostgreSQL 15) | Managed database with Row Level Security |
| **Edge Functions** | Deno Runtime | Serverless compute for business logic |
| **Authentication** | Supabase Auth | JWT-based session management |
| **File Storage** | Supabase Storage | Encrypted blob storage for documents |
| **Hosting** | Lovable Cloud | Global CDN with automatic deployments |

### 2.2 Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC SCHEMA                            │
├─────────────────────────────────────────────────────────────────┤
│  CORE ENTITIES                                                  │
│  ├── episodes (patient care episodes)                           │
│  ├── care_targets (multi-complaint tracking)                    │
│  ├── outcome_scores (validated instrument scores)               │
│  └── care_requests (intake pipeline)                            │
│                                                                 │
│  USER MANAGEMENT                                                │
│  ├── profiles (user profiles linked to auth.users)              │
│  ├── user_roles (RBAC: admin, clinician, owner)                 │
│  ├── patient_accounts (patient portal access)                   │
│  └── patient_episode_access (patient-episode linking)           │
│                                                                 │
│  COMMUNICATION                                                  │
│  ├── communication_tasks (task queue)                           │
│  ├── patient_messages (secure messaging)                        │
│  └── pcp_summary_tasks (discharge summaries)                    │
│                                                                 │
│  ANALYTICS                                                      │
│  ├── audit_logs (compliance tracking)                           │
│  ├── lifecycle_events (state machine logging)                   │
│  └── export_templates (report configurations)                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Security Architecture

| Control | Implementation |
|---------|----------------|
| **Authentication** | Email/password with session management |
| **Authorization** | Role-Based Access Control (RBAC) via `user_roles` table |
| **Data Protection** | Row Level Security (RLS) on all tables |
| **Encryption** | TLS 1.3 in transit, AES-256 at rest |
| **Session Management** | JWT tokens with configurable expiry |
| **Audit Logging** | Comprehensive action logging to `audit_logs` |

---

## 3. Feature Specifications

### 3.1 Episode & Care Target Management

#### Episode Lifecycle States
```
INTAKE → ACTIVE → DISCHARGED → CLOSED
                ↓
           REFERRED_OUT
```

#### Care Target States
```
ACTIVE_CARE → MONITOR_MAINTENANCE → DISCHARGED
```

#### Key Capabilities
- Multi-complaint episodes with independent Care Target tracking
- Outcome instrument binding per Care Target (baseline → discharge symmetry)
- Staggered discharge support for complex cases
- Continuation episode linking for sequential care

### 3.2 Validated Outcome Instruments

| Instrument | MCID | Body Region | Score Range |
|------------|------|-------------|-------------|
| **NDI** (Neck Disability Index) | 7.5 | Cervical | 0-100 |
| **ODI** (Oswestry Disability Index) | 6.0 | Lumbar/Thoracic | 0-100 |
| **QuickDASH** | 10.0 | Upper Extremity | 0-100 |
| **LEFS** (Lower Extremity Functional Scale) | 9.0 | Lower Extremity | 0-80 |
| **RPQ** (Rivermead Post-Concussion Symptoms) | 12.0 | Neurological | 0-64 |

### 3.3 Communication System

#### Automated Email Triggers
| Event | Email Type | Recipient |
|-------|------------|-----------|
| Lead Confirmation | Welcome + Next Steps | Patient |
| Intake Submitted | Scheduling Link | Patient |
| Episode Created | Welcome to Care | Patient |
| Care Target Discharged | Partial Resolution | Patient |
| Episode Discharged | PCP Summary | Referring Provider |
| Episode Discharged | Discharge Letter | Patient |

#### Writing Rules (Locked)
1. Lead with reassurance before instruction
2. Use "we" as accompaniment, not authority
3. One emotional job per email (relief, confidence, momentum, completion)
4. Short paragraphs (1-2 sentences), lists over dense text
5. Always close the loop with clear next steps

### 3.4 Leadership Analytics Dashboard

| Module | Metrics |
|--------|---------|
| **Volume** | Episodes opened/closed, Care Targets created/discharged |
| **Time** | Median days to resolution, percentile distribution |
| **Outcomes** | MCID achievement rate, median delta by instrument |
| **Complexity** | Multi-target episode rate, staggered resolution rate |
| **Integrity** | Complete records percentage, override tracking |

### 3.5 Patient Portal

| Feature | Description |
|---------|-------------|
| **Secure Login** | Email/password with magic link option |
| **Episode Access** | View active and historical episodes |
| **Outcome Entry** | Complete assessments via validated forms |
| **Messaging** | Secure communication with care team |
| **Rewards** | Points, achievements, and referral tracking |

---

## 4. Integration Capabilities

### 4.1 Edge Functions (Serverless)

| Function | Purpose |
|----------|---------|
| `send-intake-welcome` | Automated welcome emails |
| `send-clinician-notification` | Internal team alerts |
| `generate-pcp-discharge-summary` | AI-assisted PCP letters |
| `generate-neuro-pcp-summary` | Neurological discharge summaries |
| `send-comparison-report` | Scheduled analytics reports |
| `calendar-sync` | Google Calendar integration |

### 4.2 External Service Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| **Resend** | Transactional email delivery | Active |
| **Google Calendar** | Appointment sync | Active |
| **Lovable AI** | Content generation | Active |

### 4.3 API Architecture

- RESTful endpoints via Supabase PostgREST
- Real-time subscriptions via WebSocket
- Edge function webhooks for external integrations
- Rate limiting with exponential backoff

---

## 5. Compliance & Governance

### 5.1 Regulatory Alignment

| Standard | Coverage |
|----------|----------|
| **HIPAA** | PHI encryption, access controls, audit logging |
| **GDPR** | Data subject rights, consent management |
| **SOC 2** | Infrastructure controls via Supabase |

### 5.2 Data Governance Documents

| Document | Scope |
|----------|-------|
| `PPC-Care-Targets-Governance.md` | Multi-complaint care model |
| `PPC-Care-Target-Outcome-Association.md` | Outcome binding rules |
| `PPC-Patient-Communication-System-Canonical-Reference.md` | Email standards |
| `PPC-Phase-3-Guardrail-Enforcement-Source-of-Truth.md` | Discharge automation |

### 5.3 Audit Capabilities

- Complete action logging with user attribution
- Lifecycle event tracking for state transitions
- Episode integrity monitoring with automated alerts
- Export history for compliance reporting

---

## 6. Deployment & Operations

### 6.1 Deployment Model

| Aspect | Specification |
|--------|---------------|
| **Hosting** | Lovable Cloud (global CDN) |
| **Database** | Supabase managed PostgreSQL |
| **Edge Functions** | Deno runtime with automatic scaling |
| **Updates** | Continuous deployment with zero downtime |

### 6.2 Performance Characteristics

| Metric | Target |
|--------|--------|
| **Page Load** | < 2s (LCP) |
| **API Response** | < 200ms (p95) |
| **Database Queries** | < 50ms (indexed) |
| **Uptime** | 99.9% SLA |

### 6.3 Backup & Recovery

| Aspect | Specification |
|--------|---------------|
| **Database Backups** | Daily automated snapshots |
| **Point-in-Time Recovery** | 7-day retention |
| **Disaster Recovery** | Multi-region failover capability |

---

## 7. Roadmap Alignment

### Current Phase: Phase 6 (Analytics & External Communication)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Core episode management |
| Phase 2 | ✅ Complete | Care Target model implementation |
| Phase 3 | ✅ Complete | PCP discharge automation |
| Phase 4 | ✅ Complete | Patient discharge communications |
| Phase 5 | ✅ Complete | Care Target-centric analytics views |
| Phase 6A | ✅ Complete | Leadership analytics dashboard |
| Phase 6B | ✅ Complete | External snapshot (controlled disclosure) |
| Phase 6C | 🔄 Active | Valuation narrative framework |

### Future Considerations

- EMR/EHR integration layer
- Payor data exchange
- Multi-clinic federation
- Research export protocols

---

## 8. Competitive Differentiation

| Capability | PPC Platform | Traditional EMR |
|------------|--------------|-----------------|
| **Care Target Model** | ✅ Native multi-complaint | ❌ Single diagnosis focus |
| **Outcome Symmetry** | ✅ Enforced baseline-discharge pairing | ❌ Ad-hoc collection |
| **Publication-Grade Registry** | ✅ Built-in analytics | ❌ Manual extraction |
| **Patient Portal** | ✅ Integrated gamification | ⚠️ Basic access |
| **AI-Assisted Communication** | ✅ Native generation | ❌ Not available |

---

## 9. Success Metrics

### Registry Integrity
- 100% RLS enforcement on PHI tables
- Complete baseline-discharge pairing per Care Target
- No outcome blending across complaints

### Clinical Outcomes
- MCID achievement tracking by instrument
- Time-to-resolution by domain
- Staggered resolution success rates

### Operational Efficiency
- Automated PCP summary generation
- Reduced admin burden via task automation
- Real-time integrity monitoring

---

## 10. Contact & Support

| Resource | Access |
|----------|--------|
| **Technical Documentation** | `/docs/` directory |
| **Governance Artifacts** | Canonical registry in `/docs/` |
| **Security Policy** | `SECURITY.md` |

---

## Appendix A: Role Permissions Matrix

| Capability | Owner | Admin | Clinician | Patient |
|------------|-------|-------|-----------|---------|
| View all episodes | ✅ | ✅ | ✅ (own) | ❌ |
| Create episodes | ✅ | ✅ | ✅ | ❌ |
| Modify episodes | ✅ | ✅ | ✅ (own) | ❌ |
| View analytics | ✅ | ✅ | ⚠️ Limited | ❌ |
| Manage users | ✅ | ✅ | ❌ | ❌ |
| Configure settings | ✅ | ✅ | ❌ | ❌ |
| Patient portal access | ❌ | ❌ | ❌ | ✅ |

---

## Appendix B: Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Patient   │────▶│  Intake     │────▶│    Care     │
│   Portal    │     │  Pipeline   │     │  Request    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Analytics  │◀────│   Episode   │◀────│   Admin     │
│  Dashboard  │     │   + Care    │     │  Approval   │
└─────────────┘     │   Targets   │     └─────────────┘
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │   Outcome   │  │    PCP      │  │  Patient    │
   │   Scores    │  │  Summary    │  │  Discharge  │
   └─────────────┘  └─────────────┘  └─────────────┘
```

---

**Document Control:**  
This specification is maintained as a living document and updated with each major platform release. All modifications require review against canonical governance artifacts.
