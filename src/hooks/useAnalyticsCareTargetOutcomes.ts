import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CareTargetOutcome {
  care_target_id: string;
  episode_id: string;
  care_target_name: string;
  domain: string | null;
  body_region: string | null;
  care_target_status: string;
  care_target_start_date: string;
  care_target_discharge_date: string | null;
  duration_to_resolution_days: number | null;
  discharge_reason: string | null;
  outcome_instrument: string | null;
  baseline_score: number | null;
  baseline_recorded_at: string | null;
  discharge_score: number | null;
  discharge_recorded_at: string | null;
  outcome_delta: number | null;
  outcome_direction: 'improved' | 'worsened' | 'unchanged' | 'incomplete';
  outcome_integrity_status: 'complete' | 'override' | 'incomplete';
  integrity_override_reason: string | null;
  patient_name: string;
  clinic_id: string | null;
  clinician_id: string;
  episode_type: string | null;
  episode_status: string | null;
}

interface UseAnalyticsCareTargetOutcomesOptions {
  clinicId?: string;
  clinicianId?: string;
  domain?: string;
  outcomeDirection?: string;
  integrityStatus?: string;
}

export function useAnalyticsCareTargetOutcomes(options: UseAnalyticsCareTargetOutcomesOptions = {}) {
  return useQuery({
    queryKey: ['analytics-care-target-outcomes', options],
    queryFn: async (): Promise<CareTargetOutcome[]> => {
      // Query the view using raw SQL since it's not in types yet
      let query = supabase
        .from('analytics_care_target_outcomes' as any)
        .select('*');

      if (options.clinicId) {
        query = query.eq('clinic_id', options.clinicId);
      }
      if (options.clinicianId) {
        query = query.eq('clinician_id', options.clinicianId);
      }
      if (options.domain) {
        query = query.eq('domain', options.domain);
      }
      if (options.outcomeDirection) {
        query = query.eq('outcome_direction', options.outcomeDirection);
      }
      if (options.integrityStatus) {
        query = query.eq('outcome_integrity_status', options.integrityStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[Phase 5] Error fetching care target outcomes:', error);
        throw error;
      }

      return (data || []) as unknown as CareTargetOutcome[];
    }
  });
}
