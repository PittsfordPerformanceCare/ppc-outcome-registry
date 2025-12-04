import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CleanupItem {
  id: string;
  name: string;
  details: string;
  link: string;
}

export interface CleanupSection {
  title: string;
  count: number;
  items: CleanupItem[];
}

export interface WeeklyCleanupData {
  totalItems: number;
  sections: CleanupSection[];
  generatedAt: string;
}

export function useWeeklyCleanup() {
  return useQuery({
    queryKey: ["weekly-cleanup"],
    queryFn: async (): Promise<WeeklyCleanupData> => {
      const sections: CleanupSection[] = [];
      const now = new Date();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // A. Incomplete Intakes
      const { data: incompleteLeads } = await supabase
        .from("leads")
        .select("id, name, email, created_at, intake_completed_at")
        .lt("created_at", fortyEightHoursAgo.toISOString())
        .is("intake_completed_at", null)
        .order("created_at", { ascending: true });

      if (incompleteLeads && incompleteLeads.length > 0) {
        sections.push({
          title: "Incomplete Intakes",
          count: incompleteLeads.length,
          items: incompleteLeads.map((lead) => ({
            id: lead.id,
            name: lead.name || lead.email || "Unknown",
            details: `Created ${new Date(lead.created_at).toLocaleDateString()}`,
            link: `/admin/leads`,
          })),
        });
      }

      // B. Unassigned Leads
      const { data: unassignedLeads } = await supabase
        .from("leads")
        .select("id, name, email, created_at, episode_opened_at")
        .is("episode_opened_at", null)
        .order("created_at", { ascending: true })
        .limit(50);

      if (unassignedLeads && unassignedLeads.length > 0) {
        sections.push({
          title: "Unassigned Leads (No Episode Created)",
          count: unassignedLeads.length,
          items: unassignedLeads.slice(0, 15).map((lead) => ({
            id: lead.id,
            name: lead.name || lead.email || "Unknown",
            details: `Created ${new Date(lead.created_at).toLocaleDateString()}`,
            link: `/admin/leads`,
          })),
        });
      }

      // C. PCP Summaries Pending
      const { data: pendingPCP } = await supabase
        .from("pcp_summary_tasks")
        .select("id, episode_id, patient_name, status, created_at")
        .in("status", ["pending", "open"])
        .order("created_at", { ascending: true });

      if (pendingPCP && pendingPCP.length > 0) {
        sections.push({
          title: "PCP Summaries Pending",
          count: pendingPCP.length,
          items: pendingPCP.map((task) => ({
            id: task.id,
            name: task.patient_name || "Unknown Patient",
            details: `Episode: ${task.episode_id} - Status: ${task.status}`,
            link: `/pcp-summary`,
          })),
        });
      }

      // D. Episodes Ready to Close - check for any active-like status
      const { data: staleEpisodes } = await supabase
        .from("episodes")
        .select("id, patient_name, region, current_status, updated_at")
        .eq("current_status", "ACTIVE_CONSERVATIVE_CARE")
        .lt("updated_at", sevenDaysAgo.toISOString())
        .order("updated_at", { ascending: true })
        .limit(50);

      if (staleEpisodes && staleEpisodes.length > 0) {
        sections.push({
          title: "Episodes Ready to Close",
          count: staleEpisodes.length,
          items: staleEpisodes.slice(0, 15).map((ep) => ({
            id: ep.id,
            name: ep.patient_name,
            details: `${ep.region} - Last updated ${new Date(ep.updated_at).toLocaleDateString()}`,
            link: `/episode-summary?id=${ep.id}`,
          })),
        });
      }

      // E. Episode Type Mismatches
      const { data: neuroEpisodes } = await supabase
        .from("episodes")
        .select("id, patient_name, episode_type, region")
        .eq("episode_type", "Neurologic")
        .order("created_at", { ascending: false })
        .limit(50);

      const mismatchedItems: CleanupItem[] = [];
      if (neuroEpisodes) {
        for (const ep of neuroEpisodes.slice(0, 15)) {
          const { data: exams } = await supabase
            .from("neurologic_exams")
            .select("id")
            .eq("episode_id", ep.id)
            .limit(1);

          if (!exams || exams.length === 0) {
            mismatchedItems.push({
              id: ep.id,
              name: ep.patient_name,
              details: `Neuro episode without exam data - ${ep.region}`,
              link: `/neuro-exam?episodeId=${ep.id}`,
            });
          }
          if (mismatchedItems.length >= 10) break;
        }
      }

      if (mismatchedItems.length > 0) {
        sections.push({
          title: "Episode Type Mismatches",
          count: mismatchedItems.length,
          items: mismatchedItems,
        });
      }

      // F. Special Situations - open and older than 7 days
      const { data: specialSituations } = await supabase
        .from("special_situations")
        .select("id, episode_id, patient_name, situation_type, summary, detected_at")
        .eq("status", "open")
        .order("detected_at", { ascending: true });

      if (specialSituations && specialSituations.length > 0) {
        const typeLabels: Record<string, string> = {
          referral_initiated: "Referral",
          new_neurologic_symptoms: "Neuro Symptoms",
          red_flag: "Red Flag",
          emergency_or_911: "Emergency",
          provider_transition: "Provider Transition",
          change_in_plan_unexpected: "Plan Change"
        };
        
        const olderThan7Days = specialSituations.filter(s => 
          new Date(s.detected_at) < sevenDaysAgo
        );

        sections.push({
          title: "Special Situations",
          count: specialSituations.length,
          items: specialSituations.slice(0, 15).map((situation) => ({
            id: situation.id,
            name: situation.patient_name,
            details: `${typeLabels[situation.situation_type] || situation.situation_type}${new Date(situation.detected_at) < sevenDaysAgo ? ' (>7 days old)' : ''} - ${situation.summary.substring(0, 80)}`,
            link: `/admin/special-situations`,
          })),
        });

        // Also note if there are stale situations
        if (olderThan7Days.length > 0) {
          const existingSection = sections.find(s => s.title === "Special Situations");
          if (existingSection) {
            existingSection.title = `Special Situations (${olderThan7Days.length} open > 7 days)`;
          }
        }
      }

      // G. Episode Lifecycle Issues
      const { data: integrityIssues, error: integrityError } = await supabase
        .from("episode_integrity_issues")
        .select("id, episode_id, patient_name, issue_type, issue_details")
        .eq("is_active", true)
        .order("detected_at", { ascending: false })
        .limit(20);

      if (!integrityError && integrityIssues && integrityIssues.length > 0) {
        sections.push({
          title: "Episode Lifecycle Issues",
          count: integrityIssues.length,
          items: integrityIssues.slice(0, 15).map((issue) => ({
            id: issue.id,
            name: issue.patient_name,
            details: `${issue.issue_type.replace(/_/g, " ")} - ${issue.issue_details}`,
            link: `/admin/episode-integrity`,
          })),
        });
      }

      const totalItems = sections.reduce((sum, s) => sum + s.count, 0);

      return {
        totalItems,
        sections,
        generatedAt: new Date().toISOString(),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
