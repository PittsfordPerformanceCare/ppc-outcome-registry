import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadFunnelBySource {
  site_id: string | null;
  lead_source: string;
  leads_count: number;
  episodes_created_count: number;
  episodes_discharged_count: number;
  care_targets_count: number;
  care_targets_discharged_count: number;
  median_time_to_resolution_bucket: string;
  mcid_met_rate: number;
}

export interface ResolutionBySource {
  site_id: string | null;
  lead_source: string;
  instrument_type: string;
  care_targets_discharged_count: number;
  median_time_to_resolution: number | null;
  median_delta: number | null;
  mcid_met_rate: number;
}

export interface LeadResolutionFilters {
  siteId?: string;
  timeWindow?: '30d' | '90d' | '365d' | 'all';
}

/**
 * Format lead source for display
 */
export function formatLeadSource(source: string): string {
  if (!source) return 'Unknown';
  
  const [category, value] = source.split(':');
  if (!value) return source;
  
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const valueLabel = value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return `${categoryLabel}: ${valueLabel}`;
}

/**
 * Get category color for lead source
 */
export function getLeadSourceColor(source: string): string {
  if (source.startsWith('pillar:')) return 'hsl(var(--primary))';
  if (source.startsWith('referral:')) return 'hsl(142, 76%, 36%)'; // Green
  if (source.startsWith('direct:')) return 'hsl(217, 91%, 60%)'; // Blue
  return 'hsl(var(--muted-foreground))';
}

/**
 * Hook to fetch lead funnel analytics by source
 */
export function useLeadFunnelBySource(filters: LeadResolutionFilters = {}) {
  return useQuery({
    queryKey: ['analytics-lead-funnel', filters],
    queryFn: async () => {
      let query = supabase
        .from('analytics_lead_funnel_by_source' as any)
        .select('*');
      
      if (filters.siteId) {
        query = query.eq('site_id', filters.siteId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as unknown as LeadFunnelBySource[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch detailed resolution analytics by source
 */
export function useResolutionBySource(filters: LeadResolutionFilters = {}) {
  return useQuery({
    queryKey: ['analytics-resolution-by-source', filters],
    queryFn: async () => {
      let query = supabase
        .from('analytics_resolution_by_source' as any)
        .select('*');
      
      if (filters.siteId) {
        query = query.eq('site_id', filters.siteId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as unknown as ResolutionBySource[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Aggregate funnel data across all sites
 */
export function aggregateFunnelData(data: LeadFunnelBySource[]): LeadFunnelBySource[] {
  const aggregated = new Map<string, LeadFunnelBySource>();
  
  for (const row of data) {
    const existing = aggregated.get(row.lead_source);
    if (existing) {
      existing.leads_count += row.leads_count;
      existing.episodes_created_count += row.episodes_created_count;
      existing.episodes_discharged_count += row.episodes_discharged_count;
      existing.care_targets_count += row.care_targets_count;
      existing.care_targets_discharged_count += row.care_targets_discharged_count;
      // MCID rate needs weighted average - simplified here
    } else {
      aggregated.set(row.lead_source, { ...row, site_id: null });
    }
  }
  
  return Array.from(aggregated.values()).sort((a, b) => b.leads_count - a.leads_count);
}

/**
 * Calculate conversion rates from funnel data
 */
export function calculateConversionRates(data: LeadFunnelBySource[]) {
  const totals = {
    leads: 0,
    episodes: 0,
    dischargedEpisodes: 0,
    careTargets: 0,
    dischargedCareTargets: 0,
  };
  
  for (const row of data) {
    totals.leads += row.leads_count;
    totals.episodes += row.episodes_created_count;
    totals.dischargedEpisodes += row.episodes_discharged_count;
    totals.careTargets += row.care_targets_count;
    totals.dischargedCareTargets += row.care_targets_discharged_count;
  }
  
  return {
    leadToEpisodeRate: totals.leads > 0 ? (totals.episodes / totals.leads * 100).toFixed(1) : '0',
    episodeToDischargeRate: totals.episodes > 0 ? (totals.dischargedEpisodes / totals.episodes * 100).toFixed(1) : '0',
    careTargetResolutionRate: totals.careTargets > 0 ? (totals.dischargedCareTargets / totals.careTargets * 100).toFixed(1) : '0',
    totals,
  };
}
