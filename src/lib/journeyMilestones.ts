export type MilestoneType = 
  | "intake_submitted"
  | "intake_reviewed"
  | "episode_created"
  | "baseline_assessment"
  | "follow_up_scheduled"
  | "follow_up_completed"
  | "progress_assessment"
  | "discharge_planned"
  | "discharge_completed";

export interface JourneyMilestone {
  type: MilestoneType;
  label: string;
  description: string;
  icon: string;
  status: "completed" | "in_progress" | "pending" | "overdue";
  date?: string;
  daysFromStart?: number;
  completionPercentage?: number;
}

export interface PatientJourney {
  episodeId: string;
  patientName: string;
  startDate: string;
  currentStage: MilestoneType;
  milestones: JourneyMilestone[];
  overallProgress: number;
  daysInCare: number;
  nextMilestone?: JourneyMilestone;
  isComplete: boolean;
}

/**
 * Calculate patient journey from episode data
 */
export function calculatePatientJourney(
  episode: any,
  intakeForm?: any,
  followups?: any[],
  outcomeScores?: any[]
): PatientJourney {
  const startDate = intakeForm?.submitted_at || episode.start_date || episode.date_of_service;
  const daysInCare = Math.floor(
    (new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const milestones: JourneyMilestone[] = [];
  let completedCount = 0;

  // 1. Intake Submitted
  if (intakeForm) {
    milestones.push({
      type: "intake_submitted",
      label: "Intake Form Submitted",
      description: "Patient completed initial intake paperwork",
      icon: "FileText",
      status: "completed",
      date: intakeForm.submitted_at,
      daysFromStart: 0,
    });
    completedCount++;
  }

  // 2. Intake Reviewed
  if (intakeForm?.reviewed_at) {
    milestones.push({
      type: "intake_reviewed",
      label: "Intake Reviewed",
      description: "Clinician reviewed and processed intake form",
      icon: "CheckCircle",
      status: "completed",
      date: intakeForm.reviewed_at,
      daysFromStart: Math.floor(
        (new Date(intakeForm.reviewed_at).getTime() - new Date(startDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      ),
    });
    completedCount++;
  } else if (intakeForm) {
    milestones.push({
      type: "intake_reviewed",
      label: "Intake Review Pending",
      description: "Awaiting clinician review",
      icon: "Clock",
      status: daysInCare > 1 ? "overdue" : "pending",
    });
  }

  // 3. Episode Created
  if (episode) {
    milestones.push({
      type: "episode_created",
      label: "Episode Initiated",
      description: "Treatment episode started",
      icon: "PlayCircle",
      status: "completed",
      date: episode.start_date || episode.date_of_service,
      daysFromStart: intakeForm 
        ? Math.floor(
            (new Date(episode.start_date || episode.date_of_service).getTime() - 
             new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0,
    });
    completedCount++;
  }

  // 4. Baseline Assessment
  const baselineScores = outcomeScores?.filter(s => s.score_type === "baseline") || [];
  if (baselineScores.length > 0) {
    milestones.push({
      type: "baseline_assessment",
      label: "Baseline Assessment Completed",
      description: `${baselineScores.length} outcome measure(s) recorded`,
      icon: "ClipboardCheck",
      status: "completed",
      date: baselineScores[0].recorded_at,
      daysFromStart: Math.floor(
        (new Date(baselineScores[0].recorded_at).getTime() - new Date(startDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      ),
    });
    completedCount++;
  } else if (episode) {
    milestones.push({
      type: "baseline_assessment",
      label: "Baseline Assessment",
      description: "Initial outcome measures needed",
      icon: "ClipboardList",
      status: daysInCare > 2 ? "overdue" : "in_progress",
    });
  }

  // 5. Follow-ups
  const completedFollowups = followups?.filter(f => f.completed) || [];
  const pendingFollowups = followups?.filter(f => !f.completed) || [];
  
  if (completedFollowups.length > 0) {
    completedFollowups.forEach((followup, idx) => {
      milestones.push({
        type: "follow_up_completed",
        label: `Follow-up ${idx + 1} Completed`,
        description: followup.status || "Progress check completed",
        icon: "Activity",
        status: "completed",
        date: followup.completed_date,
        daysFromStart: Math.floor(
          (new Date(followup.completed_date).getTime() - new Date(startDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        ),
      });
      completedCount++;
    });
  }

  if (pendingFollowups.length > 0) {
    const nextFollowup = pendingFollowups[0];
    const isOverdue = new Date(nextFollowup.scheduled_date) < new Date();
    milestones.push({
      type: "follow_up_scheduled",
      label: `Follow-up ${completedFollowups.length + 1} Scheduled`,
      description: `Scheduled for ${new Date(nextFollowup.scheduled_date).toLocaleDateString()}`,
      icon: "Calendar",
      status: isOverdue ? "overdue" : "pending",
      date: nextFollowup.scheduled_date,
    });
  }

  // 6. Progress Assessment
  const progressScores = outcomeScores?.filter(s => s.score_type === "progress") || [];
  if (progressScores.length > 0) {
    milestones.push({
      type: "progress_assessment",
      label: "Progress Assessment Completed",
      description: "Mid-treatment outcome measures recorded",
      icon: "TrendingUp",
      status: "completed",
      date: progressScores[0].recorded_at,
      daysFromStart: Math.floor(
        (new Date(progressScores[0].recorded_at).getTime() - new Date(startDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      ),
    });
    completedCount++;
  }

  // 7. Discharge
  if (episode?.discharge_date) {
    const dischargeScores = outcomeScores?.filter(s => s.score_type === "discharge") || [];
    
    if (dischargeScores.length > 0) {
      milestones.push({
        type: "discharge_completed",
        label: "Discharge Completed",
        description: "Treatment episode successfully concluded",
        icon: "CheckCircle2",
        status: "completed",
        date: episode.discharge_date,
        daysFromStart: Math.floor(
          (new Date(episode.discharge_date).getTime() - new Date(startDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        ),
      });
      completedCount++;
    } else {
      milestones.push({
        type: "discharge_planned",
        label: "Discharge Planned",
        description: "Final outcome measures needed",
        icon: "Flag",
        status: "in_progress",
        date: episode.discharge_date,
      });
    }
  } else if (episode && daysInCare > 45) {
    milestones.push({
      type: "discharge_planned",
      label: "Discharge Planning",
      description: "Consider discharge planning",
      icon: "Flag",
      status: "pending",
    });
  }

  // Calculate overall progress
  const totalMilestones = milestones.length;
  const overallProgress = totalMilestones > 0 
    ? Math.round((completedCount / totalMilestones) * 100)
    : 0;

  // Find next milestone
  const nextMilestone = milestones.find(m => 
    m.status === "pending" || m.status === "in_progress" || m.status === "overdue"
  );

  // Determine current stage
  const completedMilestones = milestones.filter(m => m.status === "completed");
  const currentStage = completedMilestones.length > 0
    ? completedMilestones[completedMilestones.length - 1].type
    : "intake_submitted";

  const isComplete = episode?.discharge_date && 
    outcomeScores?.some(s => s.score_type === "discharge");

  return {
    episodeId: episode?.id || "",
    patientName: episode?.patient_name || "",
    startDate,
    currentStage,
    milestones,
    overallProgress,
    daysInCare,
    nextMilestone,
    isComplete: !!isComplete,
  };
}
