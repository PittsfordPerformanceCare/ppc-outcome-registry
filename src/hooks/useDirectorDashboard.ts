import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

export type DateRange = 7 | 30;

interface EpisodeTypeCount {
  episode_type: string;
  count: number;
}

interface ClinicianWorkload {
  clinician: string;
  episodes_created: number;
  episodes_closed: number;
}

interface UTMStats {
  value: string;
  count: number;
}

interface IntegrityIssueCount {
  issue_type: string;
  count: number;
}

interface SpecialSituationCount {
  situation_type: string;
  count: number;
}

interface DirectorDashboardData {
  // Episode Volume & Types
  totalEpisodes: number;
  episodesByType: EpisodeTypeCount[];
  
  // Episode Closure & PCP Compliance
  episodesClosed: number;
  episodesWithDischargeNote: number;
  pcpSummariesCreated: number;
  pcpSummariesCompleted: number;
  
  // Conversion Funnel
  leadsCreated: number;
  intakesCompleted: number;
  episodesFromLeads: number;
  
  // Clinician Workload
  clinicianWorkload: ClinicianWorkload[];
  
  // UTM Attribution
  topSources: UTMStats[];
  topCampaigns: UTMStats[];
  topCTAs: UTMStats[];
  leadsWithCompleteUTM: number;
  totalLeadsForUTM: number;
  
  // Integrity Issues
  integrityIssues: IntegrityIssueCount[];
  totalActiveIssues: number;

  // Special Situations
  specialSituations: SpecialSituationCount[];
  totalOpenSituations: number;
}

export function useDirectorDashboard(dateRange: DateRange = 7) {
  const startDate = format(subDays(new Date(), dateRange), "yyyy-MM-dd");
  const endDate = format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["director-dashboard", dateRange],
    queryFn: async (): Promise<DirectorDashboardData> => {
      // Fetch episodes data
      const { data: episodes, error: episodesError } = await supabase
        .from("episodes")
        .select("id, episode_type, current_status, clinician, discharge_date, created_at")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (episodesError) throw episodesError;

      // Count episodes by type
      const episodesByType: Record<string, number> = {};
      episodes?.forEach((ep) => {
        const type = ep.episode_type || "Unknown";
        episodesByType[type] = (episodesByType[type] || 0) + 1;
      });

      // Count closed episodes (those with discharge_date in range)
      const { data: closedEpisodes, error: closedError } = await supabase
        .from("episodes")
        .select("id, discharge_date")
        .not("discharge_date", "is", null)
        .gte("discharge_date", startDate)
        .lte("discharge_date", endDate);

      if (closedError) throw closedError;

      const episodesClosed = closedEpisodes?.length || 0;
      const episodesWithDischargeNote = closedEpisodes?.filter(
        (ep) => ep.discharge_date
      ).length || 0;

      // PCP Summary tasks
      const { data: pcpTasks, error: pcpError } = await supabase
        .from("pcp_summary_tasks")
        .select("id, status, created_at")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (pcpError) throw pcpError;

      const pcpSummariesCreated = pcpTasks?.length || 0;
      const pcpSummariesCompleted = pcpTasks?.filter(
        (t) => t.status === "completed" || t.status === "sent"
      ).length || 0;

      // Leads data
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("id, utm_source, utm_campaign, origin_cta, checkpoint_status, intake_completed_at, episode_opened_at, created_at")
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (leadsError) throw leadsError;

      const leadsCreated = leads?.length || 0;
      const intakesCompleted = leads?.filter(
        (l) => l.intake_completed_at !== null
      ).length || 0;
      const episodesFromLeads = leads?.filter(
        (l) => l.episode_opened_at !== null
      ).length || 0;

      // UTM Attribution
      const sourceCount: Record<string, number> = {};
      const campaignCount: Record<string, number> = {};
      const ctaCount: Record<string, number> = {};
      let leadsWithCompleteUTM = 0;

      leads?.forEach((lead) => {
        if (lead.utm_source) {
          sourceCount[lead.utm_source] = (sourceCount[lead.utm_source] || 0) + 1;
        }
        if (lead.utm_campaign) {
          campaignCount[lead.utm_campaign] = (campaignCount[lead.utm_campaign] || 0) + 1;
        }
        if (lead.origin_cta) {
          ctaCount[lead.origin_cta] = (ctaCount[lead.origin_cta] || 0) + 1;
        }
        if (lead.utm_source && lead.utm_campaign) {
          leadsWithCompleteUTM++;
        }
      });

      const topSources = Object.entries(sourceCount)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topCampaigns = Object.entries(campaignCount)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topCTAs = Object.entries(ctaCount)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Clinician Workload
      const clinicianCreated: Record<string, number> = {};
      const clinicianClosed: Record<string, number> = {};

      episodes?.forEach((ep) => {
        const clinician = ep.clinician || "Unassigned";
        clinicianCreated[clinician] = (clinicianCreated[clinician] || 0) + 1;
      });

      closedEpisodes?.forEach((ep) => {
        // We need to fetch clinician for closed episodes separately
      });

      // Fetch closed episodes with clinician info
      const { data: closedWithClinician } = await supabase
        .from("episodes")
        .select("clinician")
        .not("discharge_date", "is", null)
        .gte("discharge_date", startDate)
        .lte("discharge_date", endDate);

      closedWithClinician?.forEach((ep) => {
        const clinician = ep.clinician || "Unassigned";
        clinicianClosed[clinician] = (clinicianClosed[clinician] || 0) + 1;
      });

      const allClinicians = new Set([
        ...Object.keys(clinicianCreated),
        ...Object.keys(clinicianClosed),
      ]);

      const clinicianWorkload: ClinicianWorkload[] = Array.from(allClinicians)
        .map((clinician) => ({
          clinician,
          episodes_created: clinicianCreated[clinician] || 0,
          episodes_closed: clinicianClosed[clinician] || 0,
        }))
        .sort((a, b) => b.episodes_created - a.episodes_created);

      // Episode Integrity Issues
      const { data: integrityData, error: integrityError } = await supabase
        .from("episode_integrity_issues")
        .select("issue_type, is_active, detected_at")
        .eq("is_active", true)
        .gte("detected_at", startDate)
        .lte("detected_at", endDate);

      if (integrityError) throw integrityError;

      const issueCount: Record<string, number> = {};
      integrityData?.forEach((issue) => {
        issueCount[issue.issue_type] = (issueCount[issue.issue_type] || 0) + 1;
      });

      const integrityIssues = Object.entries(issueCount)
        .map(([issue_type, count]) => ({ issue_type, count }))
        .sort((a, b) => b.count - a.count);

      // Special Situations
      const { data: specialSituationsData, error: specialError } = await supabase
        .from("special_situations")
        .select("situation_type, status, detected_at")
        .eq("status", "open")
        .gte("detected_at", startDate)
        .lte("detected_at", endDate);

      if (specialError) throw specialError;

      const situationCount: Record<string, number> = {};
      specialSituationsData?.forEach((situation) => {
        situationCount[situation.situation_type] = (situationCount[situation.situation_type] || 0) + 1;
      });

      const specialSituations = Object.entries(situationCount)
        .map(([situation_type, count]) => ({ situation_type, count }))
        .sort((a, b) => b.count - a.count);

      return {
        totalEpisodes: episodes?.length || 0,
        episodesByType: Object.entries(episodesByType)
          .map(([episode_type, count]) => ({ episode_type, count }))
          .sort((a, b) => b.count - a.count),
        episodesClosed,
        episodesWithDischargeNote,
        pcpSummariesCreated,
        pcpSummariesCompleted,
        leadsCreated,
        intakesCompleted,
        episodesFromLeads,
        clinicianWorkload,
        topSources,
        topCampaigns,
        topCTAs,
        leadsWithCompleteUTM,
        totalLeadsForUTM: leadsCreated,
        integrityIssues,
        totalActiveIssues: integrityData?.length || 0,
        specialSituations,
        totalOpenSituations: specialSituationsData?.length || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
