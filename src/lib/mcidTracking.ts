import { IndexType } from "./ppcConfig";
import { getMCIDValue } from "./outcomeToolRecommendations";

export interface MCIDAchievement {
  tool: IndexType;
  toolName: string;
  baselineScore: number;
  dischargeScore: number;
  scoreChange: number;
  percentImprovement: number;
  mcidThreshold: number;
  achievedMCID: boolean;
  achievementLevel: "excellent" | "significant" | "moderate" | "minimal" | "none" | "declined";
  achievementPercentage: number; // Percentage of MCID achieved (e.g., 150% means 1.5x MCID)
  interpretation: string;
}

export interface MCIDSummary {
  totalAssessments: number;
  achievedMCID: number;
  achievementRate: number;
  averageImprovement: number;
  achievements: MCIDAchievement[];
  overallSuccess: boolean;
  successLevel: "excellent" | "good" | "fair" | "poor";
}

const TOOL_NAMES: Record<IndexType, string> = {
  NDI: "Neck Disability Index",
  ODI: "Oswestry Disability Index",
  LEFS: "Lower Extremity Functional Scale",
  QuickDASH: "QuickDASH",
  RPQ: "Rivermead Post-Concussion Symptoms Questionnaire"
};

/**
 * Calculate MCID achievement for a single outcome measure
 */
export function calculateMCIDAchievement(
  tool: IndexType,
  baselineScore: number,
  dischargeScore: number
): MCIDAchievement {
  const mcidThreshold = getMCIDValue(tool);
  const scoreChange = baselineScore - dischargeScore; // Positive = improvement
  const percentImprovement = baselineScore !== 0 
    ? (scoreChange / baselineScore) * 100 
    : 0;
  
  const achievedMCID = scoreChange >= mcidThreshold;
  const achievementPercentage = mcidThreshold !== 0
    ? (scoreChange / mcidThreshold) * 100
    : 0;

  // Determine achievement level
  let achievementLevel: MCIDAchievement["achievementLevel"];
  let interpretation: string;

  if (scoreChange < 0) {
    achievementLevel = "declined";
    interpretation = "Patient condition declined - score increased from baseline";
  } else if (scoreChange >= mcidThreshold * 2) {
    achievementLevel = "excellent";
    interpretation = `Outstanding improvement - achieved ${Math.round(achievementPercentage)}% of MCID threshold`;
  } else if (scoreChange >= mcidThreshold) {
    achievementLevel = "significant";
    interpretation = `Clinically significant improvement achieved - ${Math.round(achievementPercentage)}% of MCID threshold`;
  } else if (scoreChange >= mcidThreshold * 0.6) {
    achievementLevel = "moderate";
    interpretation = `Approaching clinical significance - ${Math.round(achievementPercentage)}% of MCID threshold`;
  } else if (scoreChange > 0) {
    achievementLevel = "minimal";
    interpretation = `Some improvement detected - ${Math.round(achievementPercentage)}% of MCID threshold`;
  } else {
    achievementLevel = "none";
    interpretation = "No measurable improvement detected";
  }

  return {
    tool,
    toolName: TOOL_NAMES[tool],
    baselineScore,
    dischargeScore,
    scoreChange,
    percentImprovement,
    mcidThreshold,
    achievedMCID,
    achievementLevel,
    achievementPercentage,
    interpretation
  };
}

/**
 * Calculate MCID summary across all outcome measures
 */
export function calculateMCIDSummary(
  baselineScores: Record<string, number>,
  dischargeScores: Record<string, number>
): MCIDSummary {
  const achievements: MCIDAchievement[] = [];
  
  // Calculate achievement for each tool that has both baseline and discharge scores
  Object.keys(baselineScores).forEach(tool => {
    if (dischargeScores[tool] !== undefined) {
      const achievement = calculateMCIDAchievement(
        tool as IndexType,
        baselineScores[tool],
        dischargeScores[tool]
      );
      achievements.push(achievement);
    }
  });

  const totalAssessments = achievements.length;
  const achievedMCID = achievements.filter(a => a.achievedMCID).length;
  const achievementRate = totalAssessments > 0 
    ? (achievedMCID / totalAssessments) * 100 
    : 0;
  
  const averageImprovement = totalAssessments > 0
    ? achievements.reduce((sum, a) => sum + a.percentImprovement, 0) / totalAssessments
    : 0;

  const overallSuccess = achievementRate >= 50; // At least 50% of measures achieved MCID

  // Determine overall success level
  let successLevel: MCIDSummary["successLevel"];
  if (achievementRate >= 80) {
    successLevel = "excellent";
  } else if (achievementRate >= 60) {
    successLevel = "good";
  } else if (achievementRate >= 40) {
    successLevel = "fair";
  } else {
    successLevel = "poor";
  }

  return {
    totalAssessments,
    achievedMCID,
    achievementRate,
    averageImprovement,
    achievements,
    overallSuccess,
    successLevel
  };
}

/**
 * Get color scheme for achievement level
 */
export function getAchievementColor(level: MCIDAchievement["achievementLevel"]): {
  bg: string;
  border: string;
  text: string;
  badge: string;
} {
  switch (level) {
    case "excellent":
      return {
        bg: "bg-green-50",
        border: "border-green-500",
        text: "text-green-700",
        badge: "bg-green-500"
      };
    case "significant":
      return {
        bg: "bg-blue-50",
        border: "border-blue-500",
        text: "text-blue-700",
        badge: "bg-blue-500"
      };
    case "moderate":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-500",
        text: "text-yellow-700",
        badge: "bg-yellow-500"
      };
    case "minimal":
      return {
        bg: "bg-orange-50",
        border: "border-orange-500",
        text: "text-orange-700",
        badge: "bg-orange-500"
      };
    case "declined":
      return {
        bg: "bg-red-50",
        border: "border-red-500",
        text: "text-red-700",
        badge: "bg-red-500"
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-500",
        text: "text-gray-700",
        badge: "bg-gray-500"
      };
  }
}

/**
 * Get success rate color
 */
export function getSuccessRateColor(rate: number): string {
  if (rate >= 80) return "text-green-600";
  if (rate >= 60) return "text-blue-600";
  if (rate >= 40) return "text-yellow-600";
  return "text-red-600";
}
