// Ortho Referral Utility Functions

export interface ProcedureReturnWindow {
  startWeeks: number;
  endWeeks: number;
  description: string;
}

// Return window mapping based on procedure class
export const PROCEDURE_RETURN_WINDOWS: Record<string, ProcedureReturnWindow> = {
  "Knee - Arthroscopy": {
    startWeeks: 6,
    endWeeks: 10,
    description: "Knee arthroscopy typically returns 6-10 weeks post-op"
  },
  "Knee - ACL Reconstruction": {
    startWeeks: 16,
    endWeeks: 24,
    description: "ACL reconstruction typically returns 16-24 weeks post-op"
  },
  "Knee - Total Knee Replacement": {
    startWeeks: 12,
    endWeeks: 16,
    description: "Total knee replacement typically returns 12-16 weeks post-op"
  },
  "Shoulder - Arthroscopy": {
    startWeeks: 6,
    endWeeks: 10,
    description: "Shoulder arthroscopy typically returns 6-10 weeks post-op"
  },
  "Shoulder - RTC Repair": {
    startWeeks: 12,
    endWeeks: 16,
    description: "Rotator cuff repair typically returns 12-16 weeks post-op"
  },
  "Shoulder - Total Shoulder Replacement": {
    startWeeks: 12,
    endWeeks: 20,
    description: "Total shoulder replacement typically returns 12-20 weeks post-op"
  },
  "Hip - Arthroscopy": {
    startWeeks: 8,
    endWeeks: 12,
    description: "Hip arthroscopy typically returns 8-12 weeks post-op"
  },
  "Hip - Total Hip Replacement": {
    startWeeks: 12,
    endWeeks: 16,
    description: "Total hip replacement typically returns 12-16 weeks post-op"
  },
  "Spine - Decompression": {
    startWeeks: 8,
    endWeeks: 12,
    description: "Spinal decompression typically returns 8-12 weeks post-op"
  },
  "Spine - Fusion": {
    startWeeks: 12,
    endWeeks: 24,
    description: "Spinal fusion typically returns 12-24 weeks post-op"
  },
  "Ankle - Arthroscopy": {
    startWeeks: 6,
    endWeeks: 10,
    description: "Ankle arthroscopy typically returns 6-10 weeks post-op"
  },
  "Ankle - Total Ankle Replacement": {
    startWeeks: 12,
    endWeeks: 16,
    description: "Total ankle replacement typically returns 12-16 weeks post-op"
  },
  "Elbow - Arthroscopy": {
    startWeeks: 6,
    endWeeks: 10,
    description: "Elbow arthroscopy typically returns 6-10 weeks post-op"
  },
  "Wrist - Arthroscopy": {
    startWeeks: 6,
    endWeeks: 10,
    description: "Wrist arthroscopy typically returns 6-10 weeks post-op"
  }
};

// Calculate return window dates based on procedure class
export const calculateReturnWindow = (
  procedureClass: string,
  surgeryDate?: Date
): { startDate: Date; endDate: Date } | null => {
  const window = PROCEDURE_RETURN_WINDOWS[procedureClass];
  if (!window) return null;

  const baseDate = surgeryDate || new Date();
  
  const startDate = new Date(baseDate);
  startDate.setDate(startDate.getDate() + window.startWeeks * 7);
  
  const endDate = new Date(baseDate);
  endDate.setDate(endDate.getDate() + window.endWeeks * 7);
  
  return { startDate, endDate };
};

// Referral reason options
export const REFERRAL_REASONS_PRIMARY = [
  "Conservative care failed",
  "Imaging shows surgical pathology",
  "Patient request for surgical opinion",
  "Specialist evaluation needed",
  "Fracture management",
  "Severe pain unresponsive to PT",
  "Progressive weakness/neurological symptoms",
  "Joint instability",
  "Other"
];

export const REFERRAL_REASONS_SECONDARY = [
  "Patient preference for surgery",
  "Functional limitations interfering with work/life",
  "Previous surgery complications",
  "Chronic condition requiring specialist care",
  "Insurance requirement",
  "Second opinion requested",
  "Advanced imaging recommended",
  "Co-morbidities requiring specialist",
  "Failed injection therapy"
];

// Communication channel options
export const COMMUNICATION_CHANNELS = [
  "Direct Secure Message",
  "PDF via Fax",
  "PDF via Email",
  "Portal Upload",
  "Phone Call",
  "Patient Hand-Delivery",
  "Other"
];

// Body regions
export const BODY_REGIONS = [
  "Cervical",
  "Thoracic",
  "Lumbar",
  "Shoulder",
  "Elbow",
  "Wrist/Hand",
  "Hip",
  "Knee",
  "Ankle/Foot",
  "Brain/Head"
];

// Episode status labels for display
export const EPISODE_STATUS_LABELS: Record<string, string> = {
  "ACTIVE_CONSERVATIVE_CARE": "Active Conservative Care",
  "REFERRED_TO_ORTHO": "Referred to Ortho",
  "ORTHO_CONSULT_COMPLETED": "Ortho Consult Completed",
  "SURGERY_COMPLETED": "Surgery Completed",
  "ORTHO_REHAB_IN_PROGRESS": "Ortho Rehab In Progress",
  "ORTHO_REHAB_COMPLETED": "Ortho Rehab Completed",
  "PENDING_RETURN_TO_PPC": "Pending Return to PPC",
  "FINAL_PPC_ASSESSMENT_COMPLETED": "Final Assessment Completed",
  "EPISODE_CLOSED": "Episode Closed"
};

// Get status badge color
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    "ACTIVE_CONSERVATIVE_CARE": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "REFERRED_TO_ORTHO": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "ORTHO_CONSULT_COMPLETED": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "SURGERY_COMPLETED": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "ORTHO_REHAB_IN_PROGRESS": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "ORTHO_REHAB_COMPLETED": "bg-green-500/10 text-green-500 border-green-500/20",
    "PENDING_RETURN_TO_PPC": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "FINAL_PPC_ASSESSMENT_COMPLETED": "bg-green-500/10 text-green-500 border-green-500/20",
    "EPISODE_CLOSED": "bg-gray-500/10 text-gray-500 border-gray-500/20"
  };
  return colorMap[status] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};