// Routing suggestion logic for leads/prospects
// Maps primary concerns and system categories to episode types

export type EpisodeTypeRoute = "NEURO" | "MSK" | "UNKNOWN";

// System categories that indicate Neurology
const NEURO_CATEGORIES = [
  "concussion",
  "cognitive",
  "balance",
  "headaches",
  "dizziness",
  "neurologic",
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
