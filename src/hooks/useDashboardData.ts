import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAllEpisodes } from "@/lib/dbOperations";
import { calculateMCIDSummary } from "@/lib/mcidTracking";
import { EpisodeMeta } from "@/lib/ppcStore";
import { useToast } from "@/hooks/use-toast";

export interface Episode {
  id: string;
  user_id: string;
  patient_name: string;
  date_of_birth?: string;
  region: string;
  diagnosis?: string;
  date_of_service: string;
  discharge_date?: string;
  clinician?: string;
  created_at: string;
  episode_type?: string;
}

export interface FilterState {
  searchQuery: string;
  filterRegion: string;
  filterClinician: string;
  filterDateFrom: string;
  filterDateTo: string;
}

export interface InboxCounts {
  unreadMessages: number;
  pendingCallbacks: number;
  pendingReferralInquiries: number;
  pendingNeurologicLeads: number;
}

export function useDashboardData() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesWithScores, setEpisodesWithScores] = useState<EpisodeMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inboxCounts, setInboxCounts] = useState<InboxCounts>({
    unreadMessages: 0,
    pendingCallbacks: 0,
    pendingReferralInquiries: 0,
    pendingNeurologicLeads: 0,
  });
  const { toast } = useToast();

  const loadInboxCounts = useCallback(async () => {
    try {
      const [messagesRes, callbacksRes, referralsRes, neuroLeadsRes] = await Promise.all([
        supabase
          .from("patient_messages")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
          .neq("message_type", "callback_request"),
        supabase
          .from("patient_messages")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
          .eq("message_type", "callback_request"),
        supabase
          .from("referral_inquiries")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("neurologic_intake_leads")
          .select("*", { count: "exact", head: true })
          .eq("status", "new"),
      ]);

      setInboxCounts({
        unreadMessages: messagesRes.count || 0,
        pendingCallbacks: callbacksRes.count || 0,
        pendingReferralInquiries: referralsRes.count || 0,
        pendingNeurologicLeads: neuroLeadsRes.count || 0,
      });
    } catch (error) {
      console.error("Error loading inbox counts:", error);
    }
  }, []);

  const checkAdminStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from("user_roles")
      .select()
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  }, []);

  const loadEpisodes = useCallback(async () => {
    try {
      const [episodesData, scoresData] = await Promise.all([
        getAllEpisodes(),
        supabase
          .from("outcome_scores")
          .select("*")
          .order("recorded_at", { ascending: true }),
      ]);

      setEpisodes(episodesData);

      if (scoresData.error) throw scoresData.error;
      const scores = scoresData.data;

      // Transform to EpisodeMeta format
      const episodesWithScoresData: EpisodeMeta[] = episodesData
        .filter(ep => ep.discharge_date)
        .map(ep => {
          const episodeScores = scores?.filter(s => s.episode_id === ep.id) || [];
          
          const baselineScores: Record<string, number> = {};
          const dischargeScores: Record<string, number> = {};
          
          episodeScores.forEach(score => {
            if (score.score_type === "baseline") {
              baselineScores[score.index_type] = score.score;
            } else if (score.score_type === "discharge") {
              dischargeScores[score.index_type] = score.score;
            }
          });
          
          return {
            episodeId: ep.id,
            patientName: ep.patient_name,
            region: ep.region,
            dateOfService: ep.date_of_service,
            indices: Object.keys(baselineScores),
            baselineScores: Object.keys(baselineScores).length > 0 ? baselineScores : undefined,
            dischargeScores: Object.keys(dischargeScores).length > 0 ? dischargeScores : undefined,
            dischargeDate: ep.discharge_date || undefined,
          };
        });
      
      setEpisodesWithScores(episodesWithScoresData);
    } catch (error: any) {
      toast({
        title: "Error loading episodes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    Promise.all([loadEpisodes(), checkAdminStatus(), loadInboxCounts()]);
  }, [loadEpisodes, checkAdminStatus, loadInboxCounts]);

  // Derived data
  const uniqueClinicians = useMemo(() => {
    const clinicians = new Set(episodes.map(ep => ep.clinician).filter(Boolean));
    return Array.from(clinicians).sort() as string[];
  }, [episodes]);

  const uniqueDiagnoses = useMemo(() => {
    const diagnoses = new Set(episodes.map(ep => ep.diagnosis).filter(Boolean));
    return Array.from(diagnoses).sort() as string[];
  }, [episodes]);

  const uniqueRegions = useMemo(() => {
    const regions = new Set(episodes.map(ep => ep.region).filter(Boolean));
    return Array.from(regions).sort() as string[];
  }, [episodes]);

  // Calculate statistics
  const calculateOutcomeImprovement = useCallback(() => {
    const completedEpisodes = episodesWithScores.filter(ep => 
      ep.dischargeScores && ep.baselineScores && ep.dischargeDate
    );
    
    if (completedEpisodes.length === 0) return 0;
    
    const totalImprovement = completedEpisodes.reduce((sum, ep) => {
      const baselineValues = Object.values(ep.baselineScores || {});
      const dischargeValues = Object.values(ep.dischargeScores || {});
      
      if (baselineValues.length === 0 || dischargeValues.length === 0) return sum;
      
      const baseline = baselineValues.reduce((s, v) => s + v, 0) / baselineValues.length;
      const discharge = dischargeValues.reduce((s, v) => s + v, 0) / dischargeValues.length;
      const improvement = baseline > 0 ? ((baseline - discharge) / baseline) * 100 : 0;
      
      if (isNaN(improvement) || !isFinite(improvement)) return sum;
      
      return sum + Math.max(0, Math.min(100, improvement));
    }, 0);
    
    return Math.round(totalImprovement / completedEpisodes.length);
  }, [episodesWithScores]);

  const calculateAvgDaysToDischarge = useCallback(() => {
    const dischargedEpisodes = episodes.filter(ep => ep.discharge_date && ep.date_of_service);
    
    if (dischargedEpisodes.length === 0) return 0;

    const totalDays = dischargedEpisodes.reduce((sum, ep) => {
      const start = new Date(ep.date_of_service).getTime();
      const end = new Date(ep.discharge_date!).getTime();
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / dischargedEpisodes.length);
  }, [episodes]);

  const mcidStatistics = useMemo(() => {
    const completedEpisodes = episodesWithScores.filter(e => 
      e.dischargeScores && Object.keys(e.dischargeScores).length > 0
    );
    
    let totalAchieved = 0;
    let totalImprovementSum = 0;
    let measurementCount = 0;

    completedEpisodes.forEach(episode => {
      if (episode.baselineScores && episode.dischargeScores) {
        const summary = calculateMCIDSummary(
          episode.baselineScores,
          episode.dischargeScores
        );
        if (summary.achievedMCID > 0) {
          totalAchieved++;
        }
        totalImprovementSum += summary.averageImprovement;
        measurementCount++;
      }
    });

    return {
      totalCompletedEpisodes: completedEpisodes.length,
      episodesAchievingMCID: totalAchieved,
      achievementRate: completedEpisodes.length > 0
        ? (totalAchieved / completedEpisodes.length) * 100
        : 0,
      averageImprovement: measurementCount > 0
        ? totalImprovementSum / measurementCount
        : 0
    };
  }, [episodesWithScores]);

  return {
    episodes,
    episodesWithScores,
    loading,
    isAdmin,
    inboxCounts,
    uniqueClinicians,
    uniqueDiagnoses,
    uniqueRegions,
    avgOutcomeImprovement: calculateOutcomeImprovement(),
    avgDaysToDischarge: calculateAvgDaysToDischarge(),
    mcidStatistics,
    loadEpisodes,
    toast,
  };
}