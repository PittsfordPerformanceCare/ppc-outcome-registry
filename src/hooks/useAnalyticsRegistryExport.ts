import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RegistryExportRecord {
  care_target_id: string;
  episode_id: string;
  care_target_name: string;
  domain: string | null;
  body_region: string | null;
  care_target_start_date: string;
  care_target_discharge_date: string | null;
  duration_days: number | null;
  discharge_reason: string | null;
  final_status: string;
  outcome_instrument: string | null;
  baseline_score: number | null;
  discharge_score: number | null;
  raw_delta: number | null;
  outcome_classification: 'improved' | 'worsened' | 'unchanged' | 'incomplete';
  mcid_achieved: boolean | null;
  data_quality_status: 'complete' | 'override' | 'incomplete';
  override_reason: string | null;
  episode_type: string | null;
  clinic_id: string | null;
  episode_year: number | null;
  episode_quarter: number | null;
}

interface UseAnalyticsRegistryExportOptions {
  clinicId?: string;
  year?: number;
  quarter?: number;
  outcomeInstrument?: string;
  mcidAchievedOnly?: boolean;
  completeDataOnly?: boolean;
}

export function useAnalyticsRegistryExport(options: UseAnalyticsRegistryExportOptions = {}) {
  return useQuery({
    queryKey: ['analytics-registry-export', options],
    queryFn: async (): Promise<RegistryExportRecord[]> => {
      let query = supabase
        .from('analytics_registry_export' as any)
        .select('*');

      if (options.clinicId) {
        query = query.eq('clinic_id', options.clinicId);
      }
      if (options.year) {
        query = query.eq('episode_year', options.year);
      }
      if (options.quarter) {
        query = query.eq('episode_quarter', options.quarter);
      }
      if (options.outcomeInstrument) {
        query = query.eq('outcome_instrument', options.outcomeInstrument);
      }
      if (options.mcidAchievedOnly) {
        query = query.eq('mcid_achieved', true);
      }
      if (options.completeDataOnly) {
        query = query.eq('data_quality_status', 'complete');
      }

      const { data, error } = await query;

      if (error) {
        console.error('[Phase 5] Error fetching registry export:', error);
        throw error;
      }

      return (data || []) as unknown as RegistryExportRecord[];
    }
  });
}

/**
 * Export registry data to CSV format
 */
export function exportRegistryToCSV(records: RegistryExportRecord[]): string {
  if (records.length === 0) return '';

  const headers = [
    'care_target_id',
    'episode_id',
    'care_target_name',
    'domain',
    'body_region',
    'care_target_start_date',
    'care_target_discharge_date',
    'duration_days',
    'discharge_reason',
    'outcome_instrument',
    'baseline_score',
    'discharge_score',
    'raw_delta',
    'outcome_classification',
    'mcid_achieved',
    'data_quality_status',
    'episode_type',
    'episode_year',
    'episode_quarter'
  ];

  const rows = records.map(record => [
    record.care_target_id,
    record.episode_id,
    record.care_target_name,
    record.domain || '',
    record.body_region || '',
    record.care_target_start_date,
    record.care_target_discharge_date || '',
    record.duration_days?.toString() || '',
    record.discharge_reason || '',
    record.outcome_instrument || '',
    record.baseline_score?.toString() || '',
    record.discharge_score?.toString() || '',
    record.raw_delta?.toString() || '',
    record.outcome_classification,
    record.mcid_achieved?.toString() || '',
    record.data_quality_status,
    record.episode_type || '',
    record.episode_year?.toString() || '',
    record.episode_quarter?.toString() || ''
  ].map(val => `"${val}"`).join(','));

  return [headers.join(','), ...rows].join('\n');
}
