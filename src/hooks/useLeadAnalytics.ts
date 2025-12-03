import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, differenceInSeconds } from "date-fns";

export interface LeadAnalyticsData {
  // KPI metrics
  totalLeads30d: number;
  totalLeadsPrev30d: number;
  intakeCompletionRate30d: number;
  episodeConversionRate30d: number;
  leads7d: number;
  episodes7d: number;
  
  // Chart data
  leadsBySource: { source: string; count: number }[];
  leadsByCTA: { cta: string; count: number }[];
  leadsByPage: { page: string; count: number }[];
  leadTrend: { day: string; count: number }[];
  
  // Funnel data
  funnelData: { leadsCreated: number; intakesCompleted: number; episodesOpened: number };
  
  // Time metrics
  medianLeadToIntake: number | null;
  medianIntakeToEpisode: number | null;
  
  // Tables
  topConvertingSources: { source: string; leads: number; episodes: number; rate: number }[];
  ctaEffectiveness: { cta: string; leads: number; intakeRate: number; episodeRate: number }[];
  
  // Raw leads for attribution table
  allLeads: Lead[];
}

export interface Lead {
  id: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  origin_page: string | null;
  origin_cta: string | null;
  checkpoint_status: string;
  intake_completed_at: string | null;
  episode_opened_at: string | null;
  severity_score: number | null;
  system_category: string | null;
  name: string | null;
  email: string | null;
}

export interface LeadFilters {
  dateRange: number; // days
  source?: string;
  cta?: string;
  status?: string;
}

function calculateMedian(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function useLeadAnalytics(filters: LeadFilters = { dateRange: 30 }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const cutoffDate = subDays(new Date(), 90).toISOString();
        
        let query = supabase
          .from("leads")
          .select("*")
          .gte("created_at", cutoffDate)
          .order("created_at", { ascending: false });

        if (filters.source) {
          query = query.eq("utm_source", filters.source);
        }
        if (filters.cta) {
          query = query.eq("origin_cta", filters.cta);
        }
        if (filters.status) {
          query = query.eq("checkpoint_status", filters.status);
        }

        const { data, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        setLeads(data || []);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [filters.source, filters.cta, filters.status]);

  const analytics = useMemo((): LeadAnalyticsData => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);
    const sevenDaysAgo = subDays(now, 7);
    const ninetyDaysAgo = subDays(now, 90);

    // Filter leads by date range
    const leads30d = leads.filter(l => new Date(l.created_at) >= thirtyDaysAgo);
    const leadsPrev30d = leads.filter(l => {
      const date = new Date(l.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });
    const leads7d = leads.filter(l => new Date(l.created_at) >= sevenDaysAgo);
    const leads90d = leads.filter(l => new Date(l.created_at) >= ninetyDaysAgo);

    // KPI: Total leads
    const totalLeads30d = leads30d.length;
    const totalLeadsPrev30d = leadsPrev30d.length;

    // KPI: Intake completion rate (intake_completed or episode_opened / total)
    const intakesOrBetter30d = leads30d.filter(l => 
      l.checkpoint_status === "intake_completed" || l.checkpoint_status === "episode_opened"
    ).length;
    const intakeCompletionRate30d = totalLeads30d > 0 ? intakesOrBetter30d / totalLeads30d : 0;

    // KPI: Episode conversion rate (episode_opened / intakes_completed)
    const intakes30d = leads30d.filter(l => l.intake_completed_at !== null);
    const episodes30d = leads30d.filter(l => l.checkpoint_status === "episode_opened");
    const episodeConversionRate30d = intakes30d.length > 0 ? episodes30d.length / intakes30d.length : 0;

    // KPI: Weekly counts
    const episodes7d = leads7d.filter(l => 
      l.episode_opened_at && new Date(l.episode_opened_at) >= sevenDaysAgo
    ).length;

    // Chart: Leads by source
    const sourceMap = new Map<string, number>();
    leads30d.forEach(l => {
      const source = l.utm_source || "direct";
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });
    const leadsBySource = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Chart: Leads by CTA
    const ctaMap = new Map<string, number>();
    leads30d.forEach(l => {
      const cta = l.origin_cta || "unknown";
      ctaMap.set(cta, (ctaMap.get(cta) || 0) + 1);
    });
    const leadsByCTA = Array.from(ctaMap.entries())
      .map(([cta, count]) => ({ cta, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Chart: Leads by page
    const pageMap = new Map<string, number>();
    leads30d.forEach(l => {
      const page = l.origin_page || "unknown";
      pageMap.set(page, (pageMap.get(page) || 0) + 1);
    });
    const leadsByPage = Array.from(pageMap.entries())
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Chart: 30-day trend
    const trendMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const day = format(subDays(now, i), "yyyy-MM-dd");
      trendMap.set(day, 0);
    }
    leads30d.forEach(l => {
      const day = format(new Date(l.created_at), "yyyy-MM-dd");
      if (trendMap.has(day)) {
        trendMap.set(day, (trendMap.get(day) || 0) + 1);
      }
    });
    const leadTrend = Array.from(trendMap.entries())
      .map(([day, count]) => ({ day, count }));

    // Funnel data
    const funnelData = {
      leadsCreated: totalLeads30d,
      intakesCompleted: leads30d.filter(l => l.intake_completed_at !== null).length,
      episodesOpened: leads30d.filter(l => l.episode_opened_at !== null).length,
    };

    // Median times
    const leadToIntakeTimes = leads
      .filter(l => l.intake_completed_at)
      .map(l => differenceInSeconds(new Date(l.intake_completed_at!), new Date(l.created_at)));
    const medianLeadToIntake = calculateMedian(leadToIntakeTimes);

    const intakeToEpisodeTimes = leads
      .filter(l => l.intake_completed_at && l.episode_opened_at)
      .map(l => differenceInSeconds(new Date(l.episode_opened_at!), new Date(l.intake_completed_at!)));
    const medianIntakeToEpisode = calculateMedian(intakeToEpisodeTimes);

    // Table: Top converting sources (90 days)
    const sourceConversionMap = new Map<string, { leads: number; episodes: number }>();
    leads90d.forEach(l => {
      const source = l.utm_source || "direct";
      const current = sourceConversionMap.get(source) || { leads: 0, episodes: 0 };
      current.leads++;
      if (l.checkpoint_status === "episode_opened") current.episodes++;
      sourceConversionMap.set(source, current);
    });
    const topConvertingSources = Array.from(sourceConversionMap.entries())
      .map(([source, data]) => ({
        source,
        leads: data.leads,
        episodes: data.episodes,
        rate: data.leads > 0 ? data.episodes / data.leads : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 10);

    // Table: CTA effectiveness (90 days)
    const ctaConversionMap = new Map<string, { leads: number; intakes: number; episodes: number }>();
    leads90d.forEach(l => {
      const cta = l.origin_cta || "unknown";
      const current = ctaConversionMap.get(cta) || { leads: 0, intakes: 0, episodes: 0 };
      current.leads++;
      if (l.intake_completed_at) current.intakes++;
      if (l.checkpoint_status === "episode_opened") current.episodes++;
      ctaConversionMap.set(cta, current);
    });
    const ctaEffectiveness = Array.from(ctaConversionMap.entries())
      .map(([cta, data]) => ({
        cta,
        leads: data.leads,
        intakeRate: data.leads > 0 ? data.intakes / data.leads : 0,
        episodeRate: data.leads > 0 ? data.episodes / data.leads : 0,
      }))
      .sort((a, b) => b.episodeRate - a.episodeRate);

    return {
      totalLeads30d,
      totalLeadsPrev30d,
      intakeCompletionRate30d,
      episodeConversionRate30d,
      leads7d: leads7d.length,
      episodes7d,
      leadsBySource,
      leadsByCTA,
      leadsByPage,
      leadTrend,
      funnelData,
      medianLeadToIntake,
      medianIntakeToEpisode,
      topConvertingSources,
      ctaEffectiveness,
      allLeads: leads,
    };
  }, [leads]);

  return { loading, error, analytics, refetch: () => setLeads([...leads]) };
}
