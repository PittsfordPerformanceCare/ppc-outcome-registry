# Neurology Ecosystem Features

This document outlines the neurology-specific features integrated into the PPC Outcome Registry system.

## ✅ Completed Features

### 1. Episode Type Selection
**Location**: `src/pages/NewEpisode.tsx` (lines 30, 133-145)
- Dropdown selector for episode types: MSK, Neurology, Performance
- Automatic RPQ assignment for Neurology episodes
- Region field hidden for Neurology (uses "Neurology" as region)
- Smart validation that adapts to episode type

### 2. Analytics Dashboard Filtering
**Location**: `src/pages/AnalyticsDashboard.tsx`
- **New Filter**: Episode Type dropdown (MSK/Neurology/Performance)
- **RPQ MCID Support**: Added RPQ threshold (12 points) to all MCID calculations
- **Separate Metrics**: Can now view analytics for neurology cases independently
- **Integration Points**: Lines 69, 107-115, 161, 198, 307, 346

### 3. Patient Portal Neuro Exam Display
**Location**: `src/pages/PatientEpisodeView.tsx` (lines 509-520)
- Displays neurologic examination summaries to patients
- Uses `PatientNeuroExamSummary` component
- Shows key findings in patient-friendly language
- Email and print functionality included

### 4. Neurology-Specific Email Templates
**Location**: `src/lib/neurologyEmailTemplates.ts`
- **Episode Creation**: Explains neurologic care process, RPQ tracking
- **Neuro Exam Scheduled**: Preparation instructions, appointment details
- **Discharge**: Post-concussion symptom management, pacing strategies
- **Outcome Reminder**: RPQ-specific language and importance
- **Template Helper**: Automatic selection based on episode type

### 5. Neuro Exam Scheduler
**Location**: `src/components/NeuroExamScheduler.tsx`
- Schedule baseline, follow-up, or final neurologic examinations
- Automatic email notifications to patients
- Preparation instructions included
- Integration with Episode Summary page

### 6. Neuro Exam Notification System
**Location**: `supabase/functions/send-neuro-exam-notification/`
- Edge function for sending exam notifications
- Uses neurology-specific templates
- Includes preparation guidelines
- Tracks notification delivery

### 7. Neurology Utility Functions
**Location**: `src/lib/neurologyUtils.ts`
- `isNeurologyEpisode()`: Type checking
- `getMCIDThreshold()`: Returns correct threshold including RPQ
- `hasMCIDAchieved()`: MCID calculation for any index including RPQ
- `requiresNeuroExam()`: Determines if neuro exam needed
- `getAssessmentFrequency()`: Episode-type-specific guidance

### 8. MCID Tracking for RPQ
**Threshold**: 12 points (as per ppcConfig.ts)
**Integration Points**:
- Analytics Dashboard: Full RPQ support in all calculations
- MCID Summary Cards: Includes RPQ in improvement tracking
- Episode Summary: RPQ displayed with other outcome measures
- Patient Portal: RPQ progress visible to patients

### 9. Episode Summary Integration
**Location**: `src/pages/EpisodeSummary.tsx`
- Neuro exam scheduler for active neurology episodes
- Display of baseline and final neuro exams
- Comparison view when both exams exist
- Neuro letter generator button
- Patient email integration for notifications

## Key Differentiators

### Neurology vs MSK Episodes

| Feature | MSK Episodes | Neurology Episodes |
|---------|-------------|-------------------|
| **Region Selection** | Required | Not used (auto: "Neurology") |
| **Outcome Measure** | Region-based (NDI, ODI, etc.) | RPQ only |
| **Examination** | Standard PT exam | Neurologic examination |
| **Email Templates** | Generic PT language | Concussion-specific language |
| **Assessment Frequency** | Every 2-3 visits | Weekly → bi-weekly |
| **Discharge Focus** | Pain reduction, ROM | Symptom management, pacing |

## Usage Workflow

### Creating a Neurology Episode
1. Select "Neurology" as episode type
2. RPQ automatically selected as outcome measure
3. Complete patient demographics
4. Enter baseline RPQ score
5. System stores with `episode_type = 'Neurology'`

### Tracking Neurology Progress
1. Episode Summary shows "Schedule Neurologic Examination"
2. Schedule baseline/follow-up/final exams
3. System sends neurology-specific email to patient
4. Complete neuro exam in NeuroExamForm
5. Scores and exams display side-by-side
6. Analytics filter to "Neurology" to see separate metrics

### Patient Experience
1. Receives neurology-specific welcome email
2. Gets exam preparation instructions
3. Views neuro exam results in patient portal
4. Sees RPQ scores and improvement
5. Receives appropriate discharge guidance

## Future Enhancement Opportunities

### Not Yet Implemented (Potential Next Steps)

1. **Separate Pending Episode Thresholds**
   - Different warning/critical days for neurology vs MSK
   - Symptom-based escalation alerts

2. **Neurology-Specific Dashboard Widget**
   - Quick stats on neurology caseload
   - RPQ improvement trends
   - Neuro exam completion rates

3. **Automated Exam Reminders**
   - Alert clinicians when baseline exam not completed within X days
   - Prompt for final exam before discharge

4. **Symptom Progression Tracking**
   - Individual RPQ symptom trending
   - Identify problematic symptoms
   - Guide treatment focus

5. **Return-to-Activity Protocols**
   - Stage-based return guidelines
   - Automated recommendations based on RPQ scores
   - Activity restriction tracking

6. **Referral Coordination**
   - Flag cases needing specialist referral
   - Track referral patterns
   - Outcome comparison with/without referral

## Technical Notes

### Database Schema
- `episodes.episode_type`: Stores "MSK", "Neurology", or "Performance"
- `neurologic_exams` table: Comprehensive neuro exam data
- `outcome_scores` table: Handles RPQ scores like other indices
- RLS policies: Same security model across episode types

### Code Organization
- Neurology features integrated, not isolated
- Reuses existing components where appropriate
- Type-safe episode type checking throughout
- Backwards compatible with existing MSK data

### Testing Checklist
- ✅ Create neurology episode
- ✅ RPQ auto-selection works
- ✅ Analytics filter by neurology
- ✅ MCID calculation includes RPQ
- ✅ Email templates use neurology content
- ✅ Neuro exam scheduling
- ✅ Patient portal shows exams
- ✅ Episode summary integration

## Configuration

### Email Template Variables
All templates support these variables:
- `{{clinic_name}}` - From clinic_settings
- `{{patient_name}}` - Episode patient name
- `{{clinician_name}}` - Treating clinician
- `{{clinic_phone}}` - Contact number
- `{{episode_id}}` - Episode identifier
- `{{exam_date}}` - Scheduled exam date
- `{{exam_time}}` - Scheduled exam time
- `{{discharge_date}}` - Discharge date
- `{{improvement_score}}` - RPQ improvement

### MCID Thresholds
Defined in `src/lib/ppcConfig.ts`:
```typescript
mcid: {
  NDI: 7.5,
  ODI: 6,
  QuickDASH: 10,
  LEFS: 9,
  RPQ: 12
}
```

## Support

For questions or issues:
1. Check this documentation
2. Review code comments in key files
3. Test with demo neurology episode (NEURO-DEMO-001)
4. Contact development team

---

**Last Updated**: 2025-11-28
**Version**: 1.0
