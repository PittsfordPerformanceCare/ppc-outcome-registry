import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

interface AdminDashboardData {
  today: {
    newLeadsToday: number;
    intakesCompletedToday: number;
    episodesStartedToday: number;
    episodesDischargedToday: number;
  };
  leads: {
    newUncontacted: number;
    needsFollowUpToday: number;
    returningPatients: number;
    referralLeads: number;
    pausedLeads: number;
    readyToRewarm: number;
    recentLeads: Array<{
      id: string;
      name: string;
      source: string;
      created_at: string;
      status: string;
      lead_status: string;
    }>;
  };
  scheduling: {
    readyToSchedule: number;
    formsPending: number;
    scheduledToday: number;
  };
  episodes: {
    pivotsPending: number;
    neuroReferralsActive: number;
    pendingDischarge: number;
  };
  communications: {
    pcpSummariesPending: number;
    messagesToAddress: number;
  };
  finance: {
    dischargesToday: number;
    dischargesThisWeek: number;
  };
}

const initialData: AdminDashboardData = {
  today: {
    newLeadsToday: 0,
    intakesCompletedToday: 0,
    episodesStartedToday: 0,
    episodesDischargedToday: 0,
  },
  leads: {
    newUncontacted: 0,
    needsFollowUpToday: 0,
    returningPatients: 0,
    referralLeads: 0,
    pausedLeads: 0,
    readyToRewarm: 0,
    recentLeads: [],
  },
  scheduling: {
    readyToSchedule: 0,
    formsPending: 0,
    scheduledToday: 0,
  },
  episodes: {
    pivotsPending: 0,
    neuroReferralsActive: 0,
    pendingDischarge: 0,
  },
  communications: {
    pcpSummariesPending: 0,
    messagesToAddress: 0,
  },
  finance: {
    dischargesToday: 0,
    dischargesThisWeek: 0,
  },
};

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const todayEnd = endOfDay(now).toISOString();
      const weekAgo = subDays(now, 7).toISOString();
      const threeDaysAgo = subDays(now, 3).toISOString();
      const todayStr = format(now, "yyyy-MM-dd");

      // Parallel queries for efficiency
      const [
        // Today's metrics
        newLeadsTodayResult,
        intakesTodayResult,
        episodesStartedTodayResult,
        episodesDischargedTodayResult,
        // Lead metrics with new status fields
        newLeadsResult,
        needsFollowUpTodayResult,
        pausedLeadsResult,
        readyToRewarmResult,
        recentLeadsResult,
        referralLeadsResult,
        // Scheduling metrics
        readyToScheduleResult,
        formsPendingResult,
        scheduledTodayResult,
        // Episode metrics
        pendingDischargeResult,
        neuroEpisodesResult,
        // Communications
        pcpSummariesResult,
        // Finance
        dischargesWeekResult,
      ] = await Promise.all([
        // New leads today
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .gte("created_at", todayStart)
          .lte("created_at", todayEnd),
        
        // Intakes completed today
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .gte("intake_completed_at", todayStart)
          .lte("intake_completed_at", todayEnd),
        
        // Episodes started today
        supabase
          .from("episodes")
          .select("*", { count: "exact", head: true })
          .gte("created_at", todayStart)
          .lte("created_at", todayEnd),
        
        // Episodes discharged today
        supabase
          .from("episodes")
          .select("*", { count: "exact", head: true })
          .gte("discharge_date", todayStr)
          .lte("discharge_date", todayStr),
        
        // New leads (lead_status = 'new')
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("lead_status", "new")
          .is("episode_opened_at", null),
        
        // Needs follow-up today (lead_status = 'attempting' AND next_follow_up_date = today)
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("lead_status", "attempting")
          .eq("next_follow_up_date", todayStr),
        
        // Paused leads (lead_status = 'paused' AND next_follow_up_date > today)
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("lead_status", "paused")
          .gt("next_follow_up_date", todayStr),
        
        // Ready to rewarm (lead_status = 'paused' AND next_follow_up_date <= today)
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("lead_status", "paused")
          .lte("next_follow_up_date", todayStr),
        
        // Recent leads
        supabase
          .from("leads")
          .select("id, name, utm_source, created_at, checkpoint_status, lead_status")
          .order("created_at", { ascending: false })
          .limit(5),
        
        // Referral leads
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .not("utm_source", "is", null)
          .ilike("utm_source", "%referral%"),
        
        // Ready to schedule (intake completed, no episode)
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .not("intake_completed_at", "is", null)
          .is("episode_opened_at", null),
        
        // Forms pending (intake forms not submitted)
        supabase
          .from("intake_forms")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        
        // Scheduled today
        supabase
          .from("intake_appointments")
          .select("*", { count: "exact", head: true })
          .eq("scheduled_date", todayStr)
          .in("status", ["scheduled", "pending"]),
        
        // Pending discharge (active episodes older than 7 days)
        supabase
          .from("episodes")
          .select("*", { count: "exact", head: true })
          .eq("current_status", "ACTIVE_CONSERVATIVE_CARE")
          .lt("created_at", weekAgo)
          .is("discharge_date", null),
        
        // Neuro episodes active
        supabase
          .from("episodes")
          .select("*", { count: "exact", head: true })
          .eq("episode_type", "neurologic")
          .is("discharge_date", null),
        
        // PCP summaries pending
        supabase
          .from("pcp_summary_tasks")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending", "open"]),
        
        // Discharges this week
        supabase
          .from("episodes")
          .select("*", { count: "exact", head: true })
          .gte("discharge_date", subDays(now, 7).toISOString().split('T')[0]),
      ]);

      // Map recent leads
      const recentLeads = (recentLeadsResult.data || []).map(lead => ({
        id: lead.id,
        name: lead.name || "Unknown",
        source: lead.utm_source || "Direct",
        created_at: lead.created_at,
        status: lead.checkpoint_status || "new",
        lead_status: lead.lead_status || "new",
      }));

      setData({
        today: {
          newLeadsToday: newLeadsTodayResult.count || 0,
          intakesCompletedToday: intakesTodayResult.count || 0,
          episodesStartedToday: episodesStartedTodayResult.count || 0,
          episodesDischargedToday: episodesDischargedTodayResult.count || 0,
        },
        leads: {
          newUncontacted: newLeadsResult.count || 0,
          needsFollowUpToday: needsFollowUpTodayResult.count || 0,
          returningPatients: 0, // Would require returning_patient flag
          referralLeads: referralLeadsResult.count || 0,
          pausedLeads: pausedLeadsResult.count || 0,
          readyToRewarm: readyToRewarmResult.count || 0,
          recentLeads,
        },
        scheduling: {
          readyToSchedule: readyToScheduleResult.count || 0,
          formsPending: formsPendingResult.count || 0,
          scheduledToday: scheduledTodayResult.count || 0,
        },
        episodes: {
          pivotsPending: 0, // Would require pivot tracking fields
          neuroReferralsActive: neuroEpisodesResult.count || 0,
          pendingDischarge: pendingDischargeResult.count || 0,
        },
        communications: {
          pcpSummariesPending: pcpSummariesResult.count || 0,
          messagesToAddress: 0, // Would require message queue
        },
        finance: {
          dischargesToday: episodesDischargedTodayResult.count || 0,
          dischargesThisWeek: dischargesWeekResult.count || 0,
        },
      });
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
