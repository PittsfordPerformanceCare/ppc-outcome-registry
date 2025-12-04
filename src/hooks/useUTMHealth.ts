import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

export interface UTMHealthIssue {
  id: string;
  lead_id: string;
  issue_type: string;
  issue_details: string;
  detected_at: string;
  is_active: boolean;
  lead?: {
    id: string;
    name: string | null;
    utm_source: string | null;
    utm_campaign: string | null;
    origin_page: string | null;
    origin_cta: string | null;
    created_at: string;
  };
}

export interface UTMHealthSummary {
  totalLeads: number;
  leadsWithCompleteUtms: number;
  leadsWithIssues: number;
  completionRate: number;
  issuesByType: Record<string, number>;
  topSources: { name: string; count: number }[];
  topCampaigns: { name: string; count: number }[];
}

export function useUTMHealth(daysBack: number = 30) {
  const cutoffDate = subDays(new Date(), daysBack).toISOString();

  // Fetch UTM health issues
  const issuesQuery = useQuery({
    queryKey: ["utm-health-issues", daysBack],
    queryFn: async (): Promise<UTMHealthIssue[]> => {
      const { data: issues, error } = await supabase
        .from("utm_health_issues")
        .select("*")
        .gte("detected_at", cutoffDate)
        .order("detected_at", { ascending: false });

      if (error) throw error;

      // Fetch lead details for each issue
      const leadIds = [...new Set(issues?.map(i => i.lead_id) || [])];
      
      if (leadIds.length === 0) {
        return (issues || []).map(issue => ({
          ...issue,
          lead: undefined
        }));
      }

      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("id, name, utm_source, utm_campaign, origin_page, origin_cta, created_at")
        .in("id", leadIds);

      if (leadsError) throw leadsError;

      const leadsMap = new Map(leads?.map(l => [l.id, l]) || []);

      return (issues || []).map(issue => ({
        ...issue,
        lead: leadsMap.get(issue.lead_id)
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch summary metrics
  const summaryQuery = useQuery({
    queryKey: ["utm-health-summary", daysBack],
    queryFn: async (): Promise<UTMHealthSummary> => {
      // Get all leads in the date range
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("id, utm_source, utm_campaign, origin_cta, origin_page")
        .gte("created_at", cutoffDate);

      if (leadsError) throw leadsError;

      // Get active issues
      const { data: issues, error: issuesError } = await supabase
        .from("utm_health_issues")
        .select("lead_id, issue_type")
        .eq("is_active", true)
        .gte("detected_at", cutoffDate);

      if (issuesError) throw issuesError;

      const totalLeads = leads?.length || 0;
      const leadsWithIssuesSet = new Set(issues?.map(i => i.lead_id) || []);
      const leadsWithIssues = leadsWithIssuesSet.size;
      const leadsWithCompleteUtms = totalLeads - leadsWithIssues;

      // Count issues by type
      const issuesByType: Record<string, number> = {};
      for (const issue of issues || []) {
        issuesByType[issue.issue_type] = (issuesByType[issue.issue_type] || 0) + 1;
      }

      // Calculate top sources and campaigns
      const sourceCounts: Record<string, number> = {};
      const campaignCounts: Record<string, number> = {};

      for (const lead of leads || []) {
        if (lead.utm_source) {
          sourceCounts[lead.utm_source] = (sourceCounts[lead.utm_source] || 0) + 1;
        }
        if (lead.utm_campaign) {
          campaignCounts[lead.utm_campaign] = (campaignCounts[lead.utm_campaign] || 0) + 1;
        }
      }

      const topSources = Object.entries(sourceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      const topCampaigns = Object.entries(campaignCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      return {
        totalLeads,
        leadsWithCompleteUtms,
        leadsWithIssues,
        completionRate: totalLeads > 0 ? Math.round((leadsWithCompleteUtms / totalLeads) * 100) : 100,
        issuesByType,
        topSources,
        topCampaigns
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    issues: issuesQuery.data || [],
    summary: summaryQuery.data,
    isLoading: issuesQuery.isLoading || summaryQuery.isLoading,
    error: issuesQuery.error || summaryQuery.error,
    refetch: () => {
      issuesQuery.refetch();
      summaryQuery.refetch();
    }
  };
}
