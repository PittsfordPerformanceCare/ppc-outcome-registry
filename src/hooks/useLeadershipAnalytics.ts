import { useMemo } from 'react';
import { useAnalyticsEpisodeSummary, EpisodeSummary } from './useAnalyticsEpisodeSummary';
import { useAnalyticsCareTargetOutcomes, CareTargetOutcome } from './useAnalyticsCareTargetOutcomes';

export interface LeadershipFilters {
  timeWindow: '30d' | '90d' | '12mo' | 'all';
  domain?: string;
  bodyRegion?: string;
  clinicianId?: string;
  includeOverrides: boolean;
}

export interface VolumeMetrics {
  episodesOpened: number;
  episodesClosed: number;
  careTargetsCreated: number;
  careTargetsDischarged: number;
}

export interface ResolutionMetrics {
  totalDischarged: number;
  dischargeRateByDomain: Record<string, { discharged: number; total: number; rate: number }>;
  dischargeReasonDistribution: Record<string, number>;
}

export interface TimeMetrics {
  medianDaysToResolution: number | null;
  percentile25: number | null;
  percentile75: number | null;
  byDomain: Record<string, { median: number | null; count: number }>;
}

export interface OutcomeMetrics {
  totalWithOutcomes: number;
  improvedCount: number;
  improvedPercentage: number;
  medianDeltaByInstrument: Record<string, { median: number; count: number }>;
  mcidAchievedCount: number;
  mcidPercentage: number;
}

export interface ComplexityMetrics {
  multiCareTargetEpisodeCount: number;
  multiCareTargetPercentage: number;
  averageCareTargetsPerEpisode: number;
  staggeredResolutionCount: number;
  staggeredResolutionPercentage: number;
}

export interface IntegrityMetrics {
  totalCareTargets: number;
  completeSymmetryCount: number;
  completeSymmetryPercentage: number;
  overrideCount: number;
  overridePercentage: number;
  missingnessByInstrument: Record<string, number>;
}

export interface LeadershipAnalytics {
  volume: VolumeMetrics;
  resolution: ResolutionMetrics;
  time: TimeMetrics;
  outcomes: OutcomeMetrics;
  complexity: ComplexityMetrics;
  integrity: IntegrityMetrics;
  isLoading: boolean;
  error: Error | null;
}

function getDateCutoff(timeWindow: LeadershipFilters['timeWindow']): Date | null {
  const now = new Date();
  switch (timeWindow) {
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '12mo':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
}

function calculateMedian(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculatePercentile(values: number[], percentile: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export function useLeadershipAnalytics(filters: LeadershipFilters): LeadershipAnalytics {
  const episodeSummaryQuery = useAnalyticsEpisodeSummary({
    clinicianId: filters.clinicianId,
  });

  const careTargetQuery = useAnalyticsCareTargetOutcomes({
    clinicianId: filters.clinicianId,
    domain: filters.domain,
    integrityStatus: filters.includeOverrides ? undefined : 'complete',
  });

  const analytics = useMemo(() => {
    const cutoffDate = getDateCutoff(filters.timeWindow);
    
    // Filter episodes by time window
    const filteredEpisodes = (episodeSummaryQuery.data || []).filter((ep: EpisodeSummary) => {
      if (!cutoffDate) return true;
      const startDate = ep.episode_start_date ? new Date(ep.episode_start_date) : null;
      return startDate && startDate >= cutoffDate;
    });

    // Filter care targets by time window and body region
    const filteredCareTargets = (careTargetQuery.data || []).filter((ct: CareTargetOutcome) => {
      if (!cutoffDate) {
        if (filters.bodyRegion && ct.body_region !== filters.bodyRegion) return false;
        return true;
      }
      const startDate = ct.care_target_start_date ? new Date(ct.care_target_start_date) : null;
      if (filters.bodyRegion && ct.body_region !== filters.bodyRegion) return false;
      return startDate && startDate >= cutoffDate;
    });

    // Volume metrics
    const episodesOpened = filteredEpisodes.length;
    const episodesClosed = filteredEpisodes.filter((ep: EpisodeSummary) => ep.episode_status === 'CLOSED').length;
    const careTargetsCreated = filteredCareTargets.length;
    const careTargetsDischarged = filteredCareTargets.filter((ct: CareTargetOutcome) => ct.care_target_status === 'DISCHARGED').length;

    // Resolution metrics
    const dischargedTargets = filteredCareTargets.filter((ct: CareTargetOutcome) => ct.care_target_status === 'DISCHARGED');
    const domainGroups: Record<string, { discharged: number; total: number }> = {};
    filteredCareTargets.forEach((ct: CareTargetOutcome) => {
      const domain = ct.domain || 'Unknown';
      if (!domainGroups[domain]) {
        domainGroups[domain] = { discharged: 0, total: 0 };
      }
      domainGroups[domain].total++;
      if (ct.care_target_status === 'DISCHARGED') {
        domainGroups[domain].discharged++;
      }
    });
    const dischargeRateByDomain: Record<string, { discharged: number; total: number; rate: number }> = {};
    Object.entries(domainGroups).forEach(([domain, counts]) => {
      dischargeRateByDomain[domain] = {
        ...counts,
        rate: counts.total > 0 ? (counts.discharged / counts.total) * 100 : 0,
      };
    });

    const dischargeReasonDistribution: Record<string, number> = {};
    dischargedTargets.forEach((ct: CareTargetOutcome) => {
      const reason = ct.discharge_reason || 'Not specified';
      dischargeReasonDistribution[reason] = (dischargeReasonDistribution[reason] || 0) + 1;
    });

    // Time metrics
    const durationValues = dischargedTargets
      .filter((ct: CareTargetOutcome) => ct.duration_to_resolution_days != null)
      .map((ct: CareTargetOutcome) => ct.duration_to_resolution_days as number);

    const domainDurations: Record<string, number[]> = {};
    dischargedTargets.forEach((ct: CareTargetOutcome) => {
      if (ct.duration_to_resolution_days != null) {
        const domain = ct.domain || 'Unknown';
        if (!domainDurations[domain]) domainDurations[domain] = [];
        domainDurations[domain].push(ct.duration_to_resolution_days);
      }
    });
    const byDomain: Record<string, { median: number | null; count: number }> = {};
    Object.entries(domainDurations).forEach(([domain, durations]) => {
      byDomain[domain] = {
        median: calculateMedian(durations),
        count: durations.length,
      };
    });

    // Outcome metrics
    const targetsWithOutcomes = dischargedTargets.filter(
      (ct: CareTargetOutcome) => ct.outcome_direction !== 'incomplete'
    );
    const improvedTargets = targetsWithOutcomes.filter((ct: CareTargetOutcome) => ct.outcome_direction === 'improved');
    
    const instrumentDeltas: Record<string, number[]> = {};
    dischargedTargets.forEach((ct: CareTargetOutcome) => {
      if (ct.outcome_instrument && ct.outcome_delta != null) {
        if (!instrumentDeltas[ct.outcome_instrument]) instrumentDeltas[ct.outcome_instrument] = [];
        instrumentDeltas[ct.outcome_instrument].push(ct.outcome_delta);
      }
    });
    const medianDeltaByInstrument: Record<string, { median: number; count: number }> = {};
    Object.entries(instrumentDeltas).forEach(([instrument, deltas]) => {
      medianDeltaByInstrument[instrument] = {
        median: calculateMedian(deltas) || 0,
        count: deltas.length,
      };
    });

    // Note: MCID would require threshold data - for now, using improved as proxy
    const mcidAchievedCount = improvedTargets.length;

    // Complexity metrics
    const multiCareTargetEpisodes = filteredEpisodes.filter((ep: EpisodeSummary) => ep.number_of_care_targets > 1);
    const totalCareTargets = filteredEpisodes.reduce((sum: number, ep: EpisodeSummary) => sum + ep.number_of_care_targets, 0);
    const staggeredEpisodes = filteredEpisodes.filter((ep: EpisodeSummary) => ep.staggered_resolution);

    // Integrity metrics
    const completeIntegrity = filteredCareTargets.filter(
      (ct: CareTargetOutcome) => ct.outcome_integrity_status === 'complete'
    );
    const overrideIntegrity = filteredCareTargets.filter(
      (ct: CareTargetOutcome) => ct.outcome_integrity_status === 'override'
    );

    const instrumentMissing: Record<string, number> = {};
    filteredCareTargets.forEach((ct: CareTargetOutcome) => {
      if (ct.outcome_integrity_status === 'incomplete' && ct.outcome_instrument) {
        instrumentMissing[ct.outcome_instrument] = (instrumentMissing[ct.outcome_instrument] || 0) + 1;
      }
    });

    return {
      volume: {
        episodesOpened,
        episodesClosed,
        careTargetsCreated,
        careTargetsDischarged,
      },
      resolution: {
        totalDischarged: careTargetsDischarged,
        dischargeRateByDomain,
        dischargeReasonDistribution,
      },
      time: {
        medianDaysToResolution: calculateMedian(durationValues),
        percentile25: calculatePercentile(durationValues, 25),
        percentile75: calculatePercentile(durationValues, 75),
        byDomain,
      },
      outcomes: {
        totalWithOutcomes: targetsWithOutcomes.length,
        improvedCount: improvedTargets.length,
        improvedPercentage: targetsWithOutcomes.length > 0 
          ? (improvedTargets.length / targetsWithOutcomes.length) * 100 
          : 0,
        medianDeltaByInstrument,
        mcidAchievedCount,
        mcidPercentage: targetsWithOutcomes.length > 0 
          ? (mcidAchievedCount / targetsWithOutcomes.length) * 100 
          : 0,
      },
      complexity: {
        multiCareTargetEpisodeCount: multiCareTargetEpisodes.length,
        multiCareTargetPercentage: filteredEpisodes.length > 0 
          ? (multiCareTargetEpisodes.length / filteredEpisodes.length) * 100 
          : 0,
        averageCareTargetsPerEpisode: filteredEpisodes.length > 0 
          ? totalCareTargets / filteredEpisodes.length 
          : 0,
        staggeredResolutionCount: staggeredEpisodes.length,
        staggeredResolutionPercentage: filteredEpisodes.length > 0 
          ? (staggeredEpisodes.length / filteredEpisodes.length) * 100 
          : 0,
      },
      integrity: {
        totalCareTargets: filteredCareTargets.length,
        completeSymmetryCount: completeIntegrity.length,
        completeSymmetryPercentage: filteredCareTargets.length > 0 
          ? (completeIntegrity.length / filteredCareTargets.length) * 100 
          : 0,
        overrideCount: overrideIntegrity.length,
        overridePercentage: filteredCareTargets.length > 0 
          ? (overrideIntegrity.length / filteredCareTargets.length) * 100 
          : 0,
        missingnessByInstrument: instrumentMissing,
      },
    };
  }, [episodeSummaryQuery.data, careTargetQuery.data, filters]);

  return {
    ...analytics,
    isLoading: episodeSummaryQuery.isLoading || careTargetQuery.isLoading,
    error: episodeSummaryQuery.error || careTargetQuery.error,
  };
}
