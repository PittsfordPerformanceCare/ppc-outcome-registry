/**
 * Concierge Routing Logic
 * 
 * Maps primary concerns to system categories and computes routing labels
 * for deterministic lead routing to clinic scheduling blocks.
 * 
 * This is a routing/scheduling layer, NOT clinical intake.
 * Clinical details are collected in the HIPAA environment after scheduling.
 */

// ========== PRIMARY CONCERN OPTIONS (exact strings per spec) ==========
export const PRIMARY_CONCERN_OPTIONS = [
  { value: "acute", label: "Recent Injury / Acute Concern (rapid evaluation needed)" },
  { value: "concussion", label: "Concussion or Head Injury (recent or past)" },
  { value: "dizziness", label: "Dizziness, Balance, or Vertigo Concerns" },
  { value: "headaches", label: "Headaches or Migraine-Related Concerns" },
  { value: "neck", label: "Neck Pain or Whiplash-Related Concerns" },
  { value: "chronic", label: "Chronic Pain or Unresolved Injury" },
  { value: "neurologic", label: "Neurologic-Related Concerns (thinking, fatigue, coordination, vision)" },
  { value: "sports", label: "Sports Performance or Return-to-Play Clearance" },
  { value: "other", label: "Other / Not Sure" },
] as const;

export type PrimaryConcernValue = typeof PRIMARY_CONCERN_OPTIONS[number]["value"];

// ========== TIME SENSITIVITY OPTIONS ==========
export const TIME_SENSITIVITY_OPTIONS = [
  { value: "yes", label: "Yes — recent change or urgent concern" },
  { value: "no", label: "No — ongoing or non-urgent" },
  { value: "not-sure", label: "Not sure" },
] as const;

export type TimeSensitivityValue = typeof TIME_SENSITIVITY_OPTIONS[number]["value"];

// ========== GOAL OF CONTACT OPTIONS (Self/Adult) ==========
export const SELF_GOAL_OPTIONS = [
  { value: "schedule-evaluation", label: "Schedule a new patient evaluation" },
  { value: "get-guidance", label: "Get guidance on next steps" },
  { value: "follow-up-referral", label: "Follow up from a referral" },
  { value: "clearance-question", label: "Clearance or documentation question" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

// ========== GOAL OF CONTACT OPTIONS (Pediatric) ==========
export const PEDIATRIC_GOAL_OPTIONS = [
  { value: "schedule-evaluation", label: "Schedule an evaluation" },
  { value: "get-guidance", label: "Get guidance on next steps" },
  { value: "follow-up-referral", label: "Follow up from a referral" },
  { value: "school-sports-clearance", label: "School or sports-related clearance question" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

// ========== REFERRAL PURPOSE OPTIONS ==========
export const REFERRAL_PURPOSE_OPTIONS = [
  { value: "new-patient-evaluation", label: "New patient evaluation" },
  { value: "continuation-of-care", label: "Continuation of care" },
  { value: "documentation-clearance", label: "Documentation or clearance" },
  { value: "specialist-input", label: "Specialist input" },
  { value: "not-sure", label: "Not sure" },
] as const;

// ========== DOMAIN MAPPING ==========

// Neuro concerns
const NEURO_CONCERNS: PrimaryConcernValue[] = [
  "concussion",
  "dizziness",
  "headaches",
  "neurologic",
];

// MSK concerns
const MSK_CONCERNS: PrimaryConcernValue[] = [
  "neck",
  "chronic",
  "sports",
];

// Review required (cannot auto-route)
const REVIEW_CONCERNS: PrimaryConcernValue[] = [
  "acute",
  "other",
];

export type SystemCategory = "neuro" | "msk" | "review";
export type RouteLabel = "MSK NP — Monday" | "Neuro NP — Wednesday" | "Admin Review";

/**
 * Maps a primary concern to its system category
 */
export function mapSystemCategory(primaryConcern: string | null | undefined): SystemCategory {
  if (!primaryConcern) return "review";
  
  const concern = primaryConcern as PrimaryConcernValue;
  
  if (NEURO_CONCERNS.includes(concern)) return "neuro";
  if (MSK_CONCERNS.includes(concern)) return "msk";
  if (REVIEW_CONCERNS.includes(concern)) return "review";
  
  // Default to review for unknown values
  return "review";
}

/**
 * Computes the routing label based on primary concern and time sensitivity
 * 
 * Rules:
 * - If time sensitivity is NOT "no" (ongoing/non-urgent), route to Admin Review
 * - Otherwise, route based on domain (neuro → Wednesday, msk → Monday)
 */
export function computeRouteLabel(
  primaryConcern: string | null | undefined,
  timeSensitivity: string | null | undefined
): RouteLabel {
  const category = mapSystemCategory(primaryConcern);
  
  // If time-sensitive or unclear, always go to admin review
  if (timeSensitivity !== "no") {
    return "Admin Review";
  }
  
  // Non-urgent cases route based on domain
  switch (category) {
    case "neuro":
      return "Neuro NP — Wednesday";
    case "msk":
      return "MSK NP — Monday";
    case "review":
    default:
      return "Admin Review";
  }
}

/**
 * Gets the display label for a primary concern value
 */
export function getPrimaryConcernLabel(value: string | null | undefined): string {
  if (!value) return "";
  const option = PRIMARY_CONCERN_OPTIONS.find(opt => opt.value === value);
  return option?.label || value;
}

/**
 * Concerns that qualify for concussion education delivery.
 * Matches the neuro-related dropdown values from PRIMARY_CONCERN_OPTIONS.
 */
const EDUCATION_ELIGIBLE_CONCERNS: PrimaryConcernValue[] = ["concussion", "dizziness", "headaches"];

/**
 * Determines if concussion education should be delivered based on primary concern selection.
 * Triggers for all neuro-relevant concerns (concussion, dizziness, headaches).
 */
export function shouldDeliverConcussionEducation(primaryConcern: string | null | undefined): boolean {
  if (!primaryConcern) return false;
  return EDUCATION_ELIGIBLE_CONCERNS.includes(primaryConcern as PrimaryConcernValue);
}
