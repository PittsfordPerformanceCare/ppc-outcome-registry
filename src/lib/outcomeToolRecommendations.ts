import { IndexType } from "./ppcConfig";

export interface OutcomeToolRecommendation {
  tool: IndexType;
  toolName: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  description: string;
  targetArea: string;
}

/**
 * Smart outcome measure recommendations based on anatomical region and diagnosis
 */
export function getOutcomeToolRecommendations(
  region: string,
  diagnosis?: string
): OutcomeToolRecommendation[] {
  const recommendations: OutcomeToolRecommendation[] = [];

  // Brain/Head → RPQ (Rivermead Post-Concussion Symptoms)
  if (region === "Brain/Head") {
    recommendations.push({
      tool: "RPQ",
      toolName: "Rivermead Post-Concussion Symptoms Questionnaire",
      confidence: "high",
      reason: "Standard outcome measure for concussion and head injury assessment",
      description: "16-item questionnaire measuring post-concussion symptoms across cognitive, physical, and emotional domains",
      targetArea: "Brain/Head"
    });
  }

  // Cervical Spine → NDI (Neck Disability Index)
  if (region === "Cervical") {
    recommendations.push({
      tool: "NDI",
      toolName: "Neck Disability Index",
      confidence: "high",
      reason: "Standard outcome measure for cervical spine conditions",
      description: "10-item questionnaire measuring neck pain and disability in daily activities",
      targetArea: "Neck/Cervical Spine"
    });
  }

  // Lumbar Spine → ODI (Oswestry Disability Index)
  if (region === "Lumbar") {
    recommendations.push({
      tool: "ODI",
      toolName: "Oswestry Disability Index",
      confidence: "high",
      reason: "Gold standard for measuring low back pain disability",
      description: "10-item questionnaire assessing how back pain affects daily life",
      targetArea: "Lower Back/Lumbar Spine"
    });
  }

  // Thoracic Spine → ODI (primary) or NDI (if upper thoracic)
  if (region === "Thoracic") {
    // Check if diagnosis mentions upper/mid back
    const isUpperThoracic = diagnosis?.toLowerCase().includes("upper") || 
                            diagnosis?.toLowerCase().includes("cervicothoracic");
    
    if (isUpperThoracic) {
      recommendations.push({
        tool: "NDI",
        toolName: "Neck Disability Index",
        confidence: "medium",
        reason: "Upper thoracic issues often affect neck function",
        description: "Can capture disability from upper thoracic/cervicothoracic junction pain",
        targetArea: "Upper Thoracic Spine"
      });
    }
    
    recommendations.push({
      tool: "ODI",
      toolName: "Oswestry Disability Index",
      confidence: isUpperThoracic ? "medium" : "high",
      reason: "Applicable for thoracic spine-related functional limitations",
      description: "Assesses impact of thoracic pain on daily activities",
      targetArea: "Thoracic Spine"
    });
  }

  // Lower Extremity → LEFS (Lower Extremity Functional Scale)
  if (["Hip", "Knee", "Ankle/Foot"].includes(region)) {
    recommendations.push({
      tool: "LEFS",
      toolName: "Lower Extremity Functional Scale",
      confidence: "high",
      reason: `Designed specifically for ${region.toLowerCase()} and lower extremity conditions`,
      description: "20-item questionnaire measuring lower limb function across various activities",
      targetArea: `Lower Extremity (${region})`
    });
  }

  // Upper Extremity → QuickDASH (Disabilities of the Arm, Shoulder and Hand)
  if (["Shoulder", "Elbow", "Wrist/Hand"].includes(region)) {
    recommendations.push({
      tool: "QuickDASH",
      toolName: "QuickDASH",
      confidence: "high",
      reason: `Standard outcome measure for ${region.toLowerCase()} and upper extremity conditions`,
      description: "11-item questionnaire assessing arm, shoulder, and hand function",
      targetArea: `Upper Extremity (${region})`
    });
  }

  // Sort by confidence level
  const confidenceOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence]);

  return recommendations;
}

/**
 * Get primary (most recommended) outcome tool
 */
export function getPrimaryOutcomeTool(region: string, diagnosis?: string): IndexType | null {
  const recommendations = getOutcomeToolRecommendations(region, diagnosis);
  return recommendations.length > 0 ? recommendations[0].tool : null;
}

/**
 * Get MCID (Minimal Clinically Important Difference) values for each tool
 */
export function getMCIDValue(tool: IndexType): number {
  const mcidValues: Record<IndexType, number> = {
    NDI: 5,     // 5 points or 10% change
    ODI: 10,    // 10 points or 10-point reduction
    LEFS: 9,    // 9-point improvement
    QuickDASH: 8, // 8-point change
    RPQ: 12     // 12-point improvement (to be validated)
  };
  
  return mcidValues[tool] || 0;
}

/**
 * Get interpretation guidance for score improvements
 */
export function getScoreInterpretation(tool: IndexType, delta: number): string {
  const mcid = getMCIDValue(tool);
  
  if (delta >= mcid * 2) {
    return "Excellent improvement - well above MCID";
  } else if (delta >= mcid) {
    return "Clinically significant improvement achieved";
  } else if (delta >= mcid * 0.5) {
    return "Moderate improvement - approaching MCID";
  } else if (delta > 0) {
    return "Minimal improvement detected";
  } else if (delta === 0) {
    return "No change in functional status";
  } else {
    return "Decline in functional status";
  }
}
