// Utility functions for neurology-specific features

/**
 * Checks if an episode is a neurology episode
 */
export function isNeurologyEpisode(episodeType: string | null | undefined): boolean {
  return episodeType === 'Neurology';
}

/**
 * Gets the appropriate outcome measure for an episode type
 */
export function getOutcomeMeasureForEpisode(episodeType: string | null | undefined): string {
  if (isNeurologyEpisode(episodeType)) {
    return 'RPQ';
  }
  return 'Region-based'; // MSK uses region-based selection
}

/**
 * Gets display text for episode type
 */
export function getEpisodeTypeDisplay(episodeType: string | null | undefined): string {
  if (isNeurologyEpisode(episodeType)) {
    return 'Neurology';
  }
  if (episodeType === 'Performance') {
    return 'Performance';
  }
  return 'MSK'; // Default
}

/**
 * Gets the MCID threshold for a given outcome measure
 */
export function getMCIDThreshold(indexType: string): number {
  const thresholds: Record<string, number> = {
    'NDI': 7.5,
    'ODI': 6,
    'QuickDASH': 10,
    'LEFS': 9,
    'RPQ': 12
  };
  return thresholds[indexType] || 0;
}

/**
 * Calculates if MCID was achieved
 */
export function hasMCIDAchieved(
  baselineScore: number,
  finalScore: number,
  indexType: string
): boolean {
  const improvement = baselineScore - finalScore;
  const threshold = getMCIDThreshold(indexType);
  return improvement >= threshold;
}

/**
 * Gets color coding for threshold status in pending episodes
 */
export function getPendingEpisodeColor(
  daysPending: number,
  episodeType: string | null | undefined
): 'normal' | 'warning' | 'critical' {
  // Neurology episodes may need different thresholds than MSK
  // For now, using same thresholds but this can be customized
  const warningThreshold = 30;
  const criticalThreshold = 60;
  
  if (daysPending >= criticalThreshold) return 'critical';
  if (daysPending >= warningThreshold) return 'warning';
  return 'normal';
}

/**
 * Gets recommended assessment frequency for episode type
 */
export function getAssessmentFrequency(episodeType: string | null | undefined): string {
  if (isNeurologyEpisode(episodeType)) {
    return 'Weekly initially, then bi-weekly as symptoms improve';
  }
  return 'Every 2-3 visits';
}

/**
 * Checks if episode requires neuro exam
 */
export function requiresNeuroExam(episodeType: string | null | undefined): boolean {
  return isNeurologyEpisode(episodeType);
}
