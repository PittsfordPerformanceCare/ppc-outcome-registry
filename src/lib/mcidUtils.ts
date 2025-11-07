// MCID Calculation Utilities
import { PPC_CONFIG, IndexType } from "./ppcConfig";

export interface MCIDResult {
  change: number;
  percentage: number;
  isClinicallySignificant: boolean;
  status: "improving" | "stable" | "declining";
  mcidThreshold: number;
}

export function calculateMCID(
  indexType: IndexType,
  baselineScore: number,
  followupScore: number
): MCIDResult {
  const mcidThreshold = PPC_CONFIG.mcid[indexType];
  const change = baselineScore - followupScore; // Improvement = reduction in disability score
  const percentage = baselineScore > 0 ? (change / baselineScore) * 100 : 0;
  
  const isClinicallySignificant = Math.abs(change) >= mcidThreshold;
  
  let status: "improving" | "stable" | "declining";
  if (change >= mcidThreshold) {
    status = "improving";
  } else if (change <= -mcidThreshold) {
    status = "declining";
  } else {
    status = "stable";
  }

  return {
    change,
    percentage,
    isClinicallySignificant,
    status,
    mcidThreshold,
  };
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function formatChange(change: number): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}`;
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

export function getStatusBadgeClass(status: "improving" | "stable" | "declining"): string {
  switch (status) {
    case "improving":
      return "badge-improving";
    case "declining":
      return "badge-declining";
    default:
      return "badge-stable";
  }
}

export function getStatusLabel(status: "improving" | "stable" | "declining"): string {
  return PPC_CONFIG.statusLabels[status];
}
