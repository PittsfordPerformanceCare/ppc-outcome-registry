import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CareRequest {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  source: string;
  primary_complaint: string | null;
  assigned_clinician_id: string | null;
  intake_payload: {
    patient_name?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  clinician?: {
    full_name: string;
  } | null;
}

interface FunnelStats {
  submitted: number;
  approved: number;
  firstVisitScheduled: number;
  formsComplete: number;
  episodeActive: number;
}

interface SourceStats {
  website: number;
  physicianReferral: number;
  athleteProgram: number;
  schoolCommunity: number;
  internal: number;
  other: number;
}

interface SLAStats {
  averageReviewTimeHours: number | null;
  oldestOpenRequestHours: number | null;
}

interface UpcomingVisit {
  id: string;
  patient_name: string;
  scheduled_date: string;
  scheduled_time: string;
  intake_form_id: string | null;
  intake_status: 'complete' | 'pending' | 'overdue' | null;
  source?: string;
}

export interface LeadCentricDashboardData {
  careRequests: CareRequest[];
  newLast24Hours: number;
  newLast24HoursPrior: number;
  inMotion: number;
  funnel: FunnelStats;
  sources: SourceStats;
  sla: SLAStats;
  upcomingVisits: UpcomingVisit[];
}

const initialData: LeadCentricDashboardData = {
  careRequests: [],
  newLast24Hours: 0,
  newLast24HoursPrior: 0,
  inMotion: 0,
  funnel: {
    submitted: 0,
    approved: 0,
    firstVisitScheduled: 0,
    formsComplete: 0,
    episodeActive: 0,
  },
  sources: {
    website: 0,
    physicianReferral: 0,
    athleteProgram: 0,
    schoolCommunity: 0,
    internal: 0,
    other: 0,
  },
  sla: {
    averageReviewTimeHours: null,
    oldestOpenRequestHours: null,
  },
  upcomingVisits: [],
};

export function useLeadCentricDashboard() {
  const [data, setData] = useState<LeadCentricDashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const last48Hours = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const next72Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

      // Fetch all care requests with clinician info
      const { data: careRequests, error: crError } = await supabase
        .from("care_requests")
        .select(`
          *,
          clinician:profiles!care_requests_assigned_clinician_id_fkey(full_name)
        `)
        .in("status", ["SUBMITTED", "IN_REVIEW", "AWAITING_CLARIFICATION", "APPROVED", "ASSIGNED"])
        .order("created_at", { ascending: true });

      if (crError) throw crError;

      // Count new requests in last 24 hours
      const { count: newLast24Hours } = await supabase
        .from("care_requests")
        .select("*", { count: "exact", head: true })
        .gte("created_at", last24Hours);

      // Count new requests in prior 24 hours (24-48 hours ago)
      const { count: newLast24HoursPrior } = await supabase
        .from("care_requests")
        .select("*", { count: "exact", head: true })
        .gte("created_at", last48Hours)
        .lt("created_at", last24Hours);

      // Count in-motion requests
      const { count: inMotion } = await supabase
        .from("care_requests")
        .select("*", { count: "exact", head: true })
        .in("status", ["APPROVED", "AWAITING_CLARIFICATION", "ASSIGNED", "IN_REVIEW"]);

      // Funnel stats
      const { count: submitted } = await supabase
        .from("care_requests")
        .select("*", { count: "exact", head: true });

      const { count: approved } = await supabase
        .from("care_requests")
        .select("*", { count: "exact", head: true })
        .in("status", ["APPROVED", "CONVERTED"]);

      // Count episodes created from care requests (first visit scheduled)
      const { count: firstVisitScheduled } = await supabase
        .from("care_requests")
        .select("*", { count: "exact", head: true })
        .not("episode_id", "is", null);

      // Count completed intake forms
      const { count: formsComplete } = await supabase
        .from("intake_forms")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted");

      // Count active episodes
      const { count: episodeActive } = await supabase
        .from("episodes")
        .select("*", { count: "exact", head: true })
        .is("discharge_date", null);

      // Source stats (last 7 days)
      const { data: sourceData } = await supabase
        .from("care_requests")
        .select("source")
        .gte("created_at", last7Days);

      const sources = {
        website: 0,
        physicianReferral: 0,
        athleteProgram: 0,
        schoolCommunity: 0,
        internal: 0,
        other: 0,
      };

      sourceData?.forEach((cr) => {
        const src = (cr.source || "").toLowerCase();
        if (src.includes("website") || src.includes("web")) sources.website++;
        else if (src.includes("physician") || src.includes("referral") || src.includes("doctor")) sources.physicianReferral++;
        else if (src.includes("athlete") || src.includes("sport")) sources.athleteProgram++;
        else if (src.includes("school") || src.includes("community")) sources.schoolCommunity++;
        else if (src.includes("internal") || src.includes("staff")) sources.internal++;
        else sources.other++;
      });

      // SLA stats - average time to first review
      const { data: reviewedRequests } = await supabase
        .from("care_requests")
        .select("created_at, updated_at")
        .not("status", "eq", "SUBMITTED")
        .gte("created_at", last7Days);

      let averageReviewTimeHours: number | null = null;
      if (reviewedRequests && reviewedRequests.length > 0) {
        const totalHours = reviewedRequests.reduce((acc, req) => {
          const created = new Date(req.created_at).getTime();
          const updated = new Date(req.updated_at).getTime();
          return acc + (updated - created) / (1000 * 60 * 60);
        }, 0);
        averageReviewTimeHours = Math.round((totalHours / reviewedRequests.length) * 10) / 10;
      }

      // Oldest open request
      let oldestOpenRequestHours: number | null = null;
      const openRequests = careRequests?.filter(cr => cr.status === "SUBMITTED");
      if (openRequests && openRequests.length > 0) {
        const oldest = new Date(openRequests[0].created_at).getTime();
        oldestOpenRequestHours = Math.round((now.getTime() - oldest) / (1000 * 60 * 60) * 10) / 10;
      }

      // Upcoming visits (next 72 hours)
      const { data: appointments } = await supabase
        .from("intake_appointments")
        .select("*")
        .gte("scheduled_date", now.toISOString().split("T")[0])
        .lte("scheduled_date", next72Hours.split("T")[0])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      const upcomingVisits: UpcomingVisit[] = (appointments || []).map((apt) => {
        let intakeStatus: 'complete' | 'pending' | 'overdue' | null = null;
        if (apt.intake_form_id) {
          intakeStatus = 'complete';
        } else {
          const aptDate = new Date(`${apt.scheduled_date}T${apt.scheduled_time || '00:00'}`);
          if (aptDate < now) {
            intakeStatus = 'overdue';
          } else {
            intakeStatus = 'pending';
          }
        }

        return {
          id: apt.id,
          patient_name: apt.patient_name,
          scheduled_date: apt.scheduled_date,
          scheduled_time: apt.scheduled_time,
          intake_form_id: apt.intake_form_id,
          intake_status: intakeStatus,
        };
      });

      setData({
        careRequests: (careRequests || []) as CareRequest[],
        newLast24Hours: newLast24Hours || 0,
        newLast24HoursPrior: newLast24HoursPrior || 0,
        inMotion: inMotion || 0,
        funnel: {
          submitted: submitted || 0,
          approved: approved || 0,
          firstVisitScheduled: firstVisitScheduled || 0,
          formsComplete: formsComplete || 0,
          episodeActive: episodeActive || 0,
        },
        sources,
        sla: {
          averageReviewTimeHours,
          oldestOpenRequestHours,
        },
        upcomingVisits,
      });
    } catch (err) {
      console.error("Error fetching lead-centric dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
