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

// Sample condition data for testing - marked as placeholder
export const conditionOutcomesData: ConditionOutcomesData[] = [
  {
    slug: "concussion",
    name: "Concussion & Post-Concussion Syndrome",
    clinicalSummary:
      "This view summarizes aggregate outcomes for patients referred to PPC with concussion or post-concussion syndrome. The population includes both acute referrals and patients with persistent symptoms beyond typical recovery windows. Outcomes reflect a multi-system evaluation approach addressing vestibular, visual, cerebellar, and autonomic dysfunction.",
    commonReferralScenarios: [
      "Persistent post-concussion symptoms beyond 2-4 weeks",
      "Return-to-play or return-to-learn clearance concerns",
      "Visual or vestibular symptoms following head injury",
      "Exercise intolerance or autonomic dysregulation post-injury",
      "Cognitive or attention deficits impacting function",
      "Complex or multi-injury cases requiring specialized evaluation",
    ],
    registrySnapshot: {
      episodesIncluded: 247, // Sample Data
      mcidAchievementRate: 78, // Sample Data
      medianVisitsToImprovement: 6, // Sample Data
      visitsIQR: { p25: 4, p75: 10 }, // Sample Data
      medianPrimaryMeasureChange: -18, // Sample Data (RPQ point reduction)
      returnToActivityRate: 84, // Sample Data
    },
    measuresIncluded: [
      "Rivermead Post-Concussion Symptoms Questionnaire (RPQ)",
      "Dizziness Handicap Inventory (DHI)",
      "Vestibular/Ocular Motor Screening (VOMS)",
      "Post-Concussion Symptom Scale (PCSS)",
      "Clinical Integration Score (CIS)",
    ],
    trajectorySeries: {
      byVisit: [
        { label: "Visits 1-3", proportionImproved: 42, n: 247 }, // Sample Data
        { label: "Visits 4-6", proportionImproved: 68, n: 198 }, // Sample Data
        { label: "Visits 7-10", proportionImproved: 81, n: 142 }, // Sample Data
        { label: "Visits 11+", proportionImproved: 89, n: 87 }, // Sample Data
      ],
      byTime: [
        { label: "Weeks 1-2", proportionImproved: 28, n: 247 }, // Sample Data
        { label: "Weeks 3-4", proportionImproved: 52, n: 221 }, // Sample Data
        { label: "Weeks 5-8", proportionImproved: 74, n: 168 }, // Sample Data
        { label: "Weeks 9+", proportionImproved: 86, n: 112 }, // Sample Data
      ],
    },
    dispositionBreakdown: [
      { label: "Discharged to return-to-activity", percentage: 72, n: 178 }, // Sample Data
      { label: "Continued extended care", percentage: 14, n: 35 }, // Sample Data
      { label: "Internal cross-referral (MSK)", percentage: 8, n: 20 }, // Sample Data
      { label: "Escalated referral (specialist/imaging)", percentage: 6, n: 14 }, // Sample Data
    ],
    interpretationGuidance: [
      {
        title: "Descriptive vs Predictive",
        content:
          "These outcomes describe observed patterns across PPC's clinical population. They are not predictive for any individual patient. Case complexity, symptom duration, and prior treatment history all influence individual trajectories.",
      },
      {
        title: "Why Distributions Matter",
        content:
          "Aggregate averages can obscure meaningful variation. The interquartile range (IQR) and trajectory distributions show the spread of outcomes, which is often more clinically relevant than a single summary statistic.",
      },
      {
        title: "Symptom Resolution vs Readiness",
        content:
          "For concussion and post-concussion cases, symptom reduction does not always align with functional readiness. Return-to-activity decisions require integration of symptom status, provocative testing, and system-specific function.",
      },
      {
        title: "Case Mix & Referral Timing",
        content:
          "Observed outcomes reflect PPC's referral population, which often includes patients with more complex or persistent presentations. Earlier referral and shorter symptom duration are generally associated with more rapid improvement.",
      },
    ],
    governanceNotes: [
      "All data are aggregate only; no patient-level information is displayed.",
      "Metrics with fewer than 10 observations are suppressed to protect privacy.",
      "No demographic breakdowns are provided.",
      "Data are updated quarterly from the PPC Outcome Registry.",
      "No external benchmarking or comparative claims are made.",
    ],
    lastUpdated: "2024-12-01", // Sample Date
    dataWindow: "Rolling 12 months",
    minCellSize: 10,
  },
  {
    slug: "neurologic-msk-pain",
    name: "Neurologic Musculoskeletal Pain",
    clinicalSummary:
      "This view summarizes aggregate outcomes for patients presenting with musculoskeletal pain with suspected or confirmed neurologic involvement. The population includes cervical, thoracic, lumbar, and extremity conditions where neurologic evaluation and intervention complement standard MSK care.",
    commonReferralScenarios: [
      "Chronic spine pain with incomplete response to standard PT",
      "Radiculopathy with persistent functional limitations",
      "Central sensitization or complex regional pain patterns",
      "Motor timing or coordination deficits associated with pain",
      "Post-surgical pain or delayed recovery",
      "Athletes with performance-limiting pain syndromes",
    ],
    registrySnapshot: {
      episodesIncluded: 189, // Sample Data
      mcidAchievementRate: 71, // Sample Data
      medianVisitsToImprovement: 8, // Sample Data
      visitsIQR: { p25: 5, p75: 12 }, // Sample Data
      medianPrimaryMeasureChange: null, // Varies by region
      returnToActivityRate: 68, // Sample Data
    },
    measuresIncluded: [
      "Neck Disability Index (NDI)",
      "Oswestry Disability Index (ODI)",
      "Lower Extremity Functional Scale (LEFS)",
      "QuickDASH",
      "Numeric Pain Rating Scale (NPRS)",
      "Clinical Integration Score (CIS)",
    ],
    trajectorySeries: {
      byVisit: [
        { label: "Visits 1-3", proportionImproved: 35, n: 189 }, // Sample Data
        { label: "Visits 4-6", proportionImproved: 58, n: 162 }, // Sample Data
        { label: "Visits 7-10", proportionImproved: 72, n: 124 }, // Sample Data
        { label: "Visits 11+", proportionImproved: 82, n: 78 }, // Sample Data
      ],
      byTime: null, // Time-based data not yet available
    },
    dispositionBreakdown: [
      { label: "Discharged to return-to-function", percentage: 64, n: 121 }, // Sample Data
      { label: "Continued extended care", percentage: 18, n: 34 }, // Sample Data
      { label: "Internal cross-referral (vestibular/neuro)", percentage: 10, n: 19 }, // Sample Data
      { label: "Escalated referral (specialist/imaging)", percentage: 8, n: 15 }, // Sample Data
    ],
    interpretationGuidance: [
      {
        title: "Descriptive vs Predictive",
        content:
          "These outcomes describe observed patterns in PPC's neurologic MSK population. Individual outcomes depend on chronicity, tissue pathology, psychosocial factors, and treatment adherence.",
      },
      {
        title: "Why Distributions Matter",
        content:
          "MSK outcomes are highly variable. Median values and IQR ranges provide a more complete picture than averages alone. Some patients improve rapidly; others require extended care.",
      },
      {
        title: "Symptom Resolution vs Readiness",
        content:
          "Pain reduction often precedes full functional recovery. Return-to-activity decisions should integrate pain status, movement quality, and task-specific tolerance testing.",
      },
      {
        title: "Case Mix & Referral Timing",
        content:
          "PPC's neurologic MSK population often includes patients with chronic or complex presentations. Earlier referral and active patient engagement are associated with improved trajectories.",
      },
    ],
    governanceNotes: [
      "All data are aggregate only; no patient-level information is displayed.",
      "Metrics with fewer than 10 observations are suppressed to protect privacy.",
      "No demographic breakdowns are provided.",
      "Data are updated quarterly from the PPC Outcome Registry.",
      "No external benchmarking or comparative claims are made.",
    ],
    lastUpdated: "2024-12-01", // Sample Date
    dataWindow: "Rolling 12 months",
    minCellSize: 10,
  },
];

// Helper to get condition by slug
export function getConditionBySlug(slug: string): ConditionOutcomesData | undefined {
  return conditionOutcomesData.find((c) => c.slug === slug);
}

// Get all available conditions
export function getAllConditions(): Pick<ConditionOutcomesData, "slug" | "name">[] {
  return conditionOutcomesData.map((c) => ({ slug: c.slug, name: c.name }));
}
