import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EpisodeSummary {
  episode_id: string;
  patient_name: string;
  clinic_id: string | null;
  clinician_id: string;
  clinician_name: string | null;
  episode_type: string | null;
  episode_status: string | null;
  episode_start_date: string | null;
  episode_close_date: string | null;
  episode_duration_days: number | null;
  number_of_care_targets: number;
  number_discharged: number;
  number_monitor_only: number;
  number_active: number;
  number_maintenance: number;
  number_active_at_peak: number;
  staggered_resolution: boolean;
  resolution_span_days: number;
  created_at: string;
  updated_at: string;
}

interface UseAnalyticsEpisodeSummaryOptions {
  clinicId?: string;
  clinicianId?: string;
  episodeStatus?: string;
  hasMultipleCareTargets?: boolean;
  staggeredResolutionOnly?: boolean;
}

export function useAnalyticsEpisodeSummary(options: UseAnalyticsEpisodeSummaryOptions = {}) {
  return useQuery({
    queryKey: ['analytics-episode-summary', options],
    queryFn: async (): Promise<EpisodeSummary[]> => {
      let query = supabase
        .from('analytics_episode_summary' as any)
        .select('*');

      if (options.clinicId) {
        query = query.eq('clinic_id', options.clinicId);
      }
      if (options.clinicianId) {
        query = query.eq('clinician_id', options.clinicianId);
      }
      if (options.episodeStatus) {
        query = query.eq('episode_status', options.episodeStatus);
      }
      if (options.hasMultipleCareTargets) {
        query = query.gt('number_of_care_targets', 1);
      }
      if (options.staggeredResolutionOnly) {
        query = query.eq('staggered_resolution', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[Phase 5] Error fetching episode summary:', error);
        throw error;
      }

      return (data || []) as unknown as EpisodeSummary[];
    }
  });
}
