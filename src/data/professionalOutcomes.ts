// Professional Outcomes Portal - Condition Data
// For verified professionals only - aggregate, descriptive outcomes

export interface RegistrySnapshot {
  episodesIncluded: number;
  mcidAchievementRate: number | null; // percentage, null if insufficient data
  medianVisitsToImprovement: number | null;
  visitsIQR: { p25: number; p75: number } | null;
  medianPrimaryMeasureChange: number | null;
  returnToActivityRate: number | null; // percentage
}

export interface TrajectoryPoint {
  label: string; // e.g., "Visits 1-3" or "Weeks 1-2"
  proportionImproved: number; // 0-100
  n: number;
}

export interface DispositionItem {
  label: string;
  percentage: number;
  n: number;
}

export interface InterpretationSection {
  title: string;
  content: string;
}

export interface ConditionOutcomesData {
  slug: string;
  name: string;
  clinicalSummary: string;
  commonReferralScenarios: string[];
  registrySnapshot: RegistrySnapshot;
  measuresIncluded: string[];
  trajectorySeries: {
    byVisit: TrajectoryPoint[];
    byTime: TrajectoryPoint[] | null;
  };
  dispositionBreakdown: DispositionItem[];
  interpretationGuidance: InterpretationSection[];
  governanceNotes: string[];
  lastUpdated: string;
  dataWindow: string;
  minCellSize: number;
}

// Condition data will be populated from the Outcome Registry as real data is collected
// Empty array - no sample data; displays "insufficient data" messaging until registry is populated
export const conditionOutcomesData: ConditionOutcomesData[] = [];

// Helper to get condition by slug
export function getConditionBySlug(slug: string): ConditionOutcomesData | undefined {
  return conditionOutcomesData.find((c) => c.slug === slug);
}

// Get all available conditions
export function getAllConditions(): Pick<ConditionOutcomesData, "slug" | "name">[] {
  return conditionOutcomesData.map((c) => ({ slug: c.slug, name: c.name }));
}
