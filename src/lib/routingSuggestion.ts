// Routing suggestion logic for leads/prospects
// Maps primary concerns and system categories to episode types

export type EpisodeTypeRoute = "NEURO" | "MSK" | "UNKNOWN";

/**
 * New Patient Exam Type labels (without calendar days)
 * These are the admin-facing labels for scheduling clarity
 */
export type NewPatientExamType = 
  | "Musculoskeletal New Patient" 
  | "Neurologic New Patient" 
  | "Admin Review Required";

// System categories that indicate Neurology
const NEURO_CATEGORIES = [
  "concussion",
  "cognitive",
  "balance",
  "headaches",
  "dizziness",
  "neurologic",
  "neuro", // Direct match for system_category
];

// System categories that indicate MSK
const MSK_CATEGORIES = [
  "msk",
  "acute",
  "acute-injury",
  "chronic",
  "chronic-injury",
  "neck",
  "sports",
  "sports-injury",
  "growth-pain",
  "fatigue",
];

// Primary reason values from intake forms
const NEURO_REASONS = [
  "concussion",
  "dizziness",
  "headaches",
  "neurologic",
  "balance",
  "cognitive",
  "brain fog",
  "vision issues",
  "coordination",
];

const MSK_REASONS = [
  "acute",
  "acute-injury",
  "neck",
  "chronic",
  "chronic-injury",
  "sports",
  "sports-injury",
  "growth-pain",
  "msk",
  "musculoskeletal",
  "movement",
  "whiplash",
  "return-to-play",
];

/**
 * Determines the suggested episode type based on system_category or primary_concern
 */
export function getSuggestedEpisodeType(
  systemCategory?: string | null,
  primaryConcern?: string | null
): EpisodeTypeRoute {
  const category = (systemCategory || "").toLowerCase().trim();
  const concern = (primaryConcern || "").toLowerCase().trim();

  // Check system category first (most reliable)
  if (NEURO_CATEGORIES.some(nc => category.includes(nc))) {
    return "NEURO";
  }
  if (MSK_CATEGORIES.some(mc => category.includes(mc))) {
    return "MSK";
  }

  // Fall back to checking primary concern text
  if (NEURO_REASONS.some(nr => concern.includes(nr))) {
    return "NEURO";
  }
  if (MSK_REASONS.some(mr => concern.includes(mr))) {
    return "MSK";
  }

  return "UNKNOWN";
}

/**
 * Gets display label and color for the routing badge
 */
export function getRoutingBadgeConfig(route: EpisodeTypeRoute): {
  label: string;
  variant: "default" | "secondary" | "outline";
  className: string;
} {
  switch (route) {
    case "NEURO":
      return {
        label: "→ Neuro",
        variant: "secondary" as const,
        className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      };
    case "MSK":
      return {
        label: "→ MSK",
        variant: "secondary" as const,
        className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
      };
    default:
      return {
        label: "Review",
        variant: "outline" as const,
        className: "text-muted-foreground",
      };
  }
}

/**
 * Derives the New Patient Exam Type label from route_label or system_category.
 * - Uses route_label as primary source (for new leads)
 * - Falls back to system_category for historical leads
 * 
 * @param routeLabel - The route_label from the leads table (e.g., "MSK NP — Monday")
 * @param systemCategory - The system_category from the leads table (e.g., "msk", "neuro", "review")
 * @returns The admin-facing exam type label without calendar days
 */
export function getNewPatientExamType(
  routeLabel?: string | null,
  systemCategory?: string | null
): NewPatientExamType {
  // Primary source: route_label
  if (routeLabel) {
    const label = routeLabel.toLowerCase();
    if (label.includes("msk") || label.includes("musculoskeletal")) {
      return "Musculoskeletal New Patient";
    }
    if (label.includes("neuro")) {
      return "Neurologic New Patient";
    }
    if (label.includes("review") || label.includes("admin")) {
      return "Admin Review Required";
    }
  }
  
  // Fallback: system_category for historical leads
  if (systemCategory) {
    const category = systemCategory.toLowerCase().trim();
    if (category === "msk") {
      return "Musculoskeletal New Patient";
    }
    if (category === "neuro") {
      return "Neurologic New Patient";
    }
    if (category === "review") {
      return "Admin Review Required";
    }
  }
  
  // Default when no routing info available
  return "Admin Review Required";
}

/**
 * Gets the exam type badge configuration for admin UI display
 */
export function getExamTypeBadgeConfig(examType: NewPatientExamType): {
  className: string;
  ctaLabel: string;
} {
  switch (examType) {
    case "Musculoskeletal New Patient":
      return {
        className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        ctaLabel: "Proceed with Musculoskeletal New Patient scheduling",
      };
    case "Neurologic New Patient":
      return {
        className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
        ctaLabel: "Proceed with Neurologic New Patient scheduling",
      };
    case "Admin Review Required":
    default:
      return {
        className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
        ctaLabel: "Review before scheduling",
      };
  }
}
