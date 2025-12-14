import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import { toast } from "sonner";

export interface SpecialSituation {
  id: string;
  episode_id: string;
  patient_name: string;
  clinician_id: string;
  clinician_name: string | null;
  note_content: string | null;
  situation_type: string;
  summary: string;
  detected_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  status: string;
  clinic_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpecialSituationSummary {
  totalOpen: number;
  byType: Record<string, number>;
  openOlderThan7Days: number;
}

export const SITUATION_TYPE_LABELS: Record<string, { label: string; color: string; isPauseTrigger: boolean }> = {
  // Primary pause triggers - patient pivots out but returns for discharge
  neuro_exam_pivot: { label: "Internal Neuro Exam", color: "bg-purple-500", isPauseTrigger: true },
  ortho_referral: { label: "Ortho Referral", color: "bg-blue-500", isPauseTrigger: true },
  imaging_request: { label: "Imaging Request", color: "bg-cyan-500", isPauseTrigger: true },
  // Secondary situations
  red_flag: { label: "Red Flag", color: "bg-red-500", isPauseTrigger: false },
  emergency_or_911: { label: "Emergency/911", color: "bg-red-700", isPauseTrigger: false },
  provider_transition: { label: "Provider Transition", color: "bg-orange-500", isPauseTrigger: false },
  // Legacy types for backwards compatibility
  referral_initiated: { label: "Referral Initiated", color: "bg-blue-400", isPauseTrigger: true },
  new_neurologic_symptoms: { label: "New Neuro Symptoms", color: "bg-purple-400", isPauseTrigger: false },
  change_in_plan_unexpected: { label: "Unexpected Change", color: "bg-yellow-500", isPauseTrigger: false }
};

export function useSpecialSituations(filters?: {
  status?: string;
  situationType?: string;
  clinicianId?: string;
  daysBack?: number;
}) {
  const queryClient = useQueryClient();
  const daysBack = filters?.daysBack || 30;
  const cutoffDate = subDays(new Date(), daysBack).toISOString();

  const situationsQuery = useQuery({
    queryKey: ["special-situations", filters],
    queryFn: async (): Promise<SpecialSituation[]> => {
      let query = supabase
        .from("special_situations")
        .select("*")
        .gte("detected_at", cutoffDate)
        .order("detected_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.situationType) {
        query = query.eq("situation_type", filters.situationType);
      }
      if (filters?.clinicianId) {
        query = query.eq("clinician_id", filters.clinicianId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const summaryQuery = useQuery({
    queryKey: ["special-situations-summary", daysBack],
    queryFn: async (): Promise<SpecialSituationSummary> => {
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();

      const { data: openSituations, error } = await supabase
        .from("special_situations")
        .select("situation_type, detected_at")
        .eq("status", "open");

      if (error) throw error;

      const byType: Record<string, number> = {};
      let openOlderThan7Days = 0;

      for (const situation of openSituations || []) {
        byType[situation.situation_type] = (byType[situation.situation_type] || 0) + 1;
        if (situation.detected_at < sevenDaysAgo) {
          openOlderThan7Days++;
        }
      }

      return {
        totalOpen: openSituations?.length || 0,
        byType,
        openOlderThan7Days
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  const resolveMutation = useMutation({
    mutationFn: async (situationId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("special_situations")
        .update({ 
          status: "resolved", 
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id 
        })
        .eq("id", situationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Special situation marked as resolved");
      queryClient.invalidateQueries({ queryKey: ["special-situations"] });
      queryClient.invalidateQueries({ queryKey: ["special-situations-summary"] });
    },
    onError: (error) => {
      console.error("Error resolving situation:", error);
      toast.error("Failed to resolve situation");
    }
  });

  return {
    situations: situationsQuery.data || [],
    summary: summaryQuery.data,
    isLoading: situationsQuery.isLoading || summaryQuery.isLoading,
    error: situationsQuery.error || summaryQuery.error,
    refetch: () => {
      situationsQuery.refetch();
      summaryQuery.refetch();
    },
    resolveSituation: resolveMutation.mutate,
    isResolving: resolveMutation.isPending
  };
}

export function useClinicianSpecialSituations() {
  return useQuery({
    queryKey: ["clinician-special-situations"],
    queryFn: async (): Promise<SpecialSituation[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("special_situations")
        .select("*")
        .eq("clinician_id", user.id)
        .eq("status", "open")
        .order("detected_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export async function detectSpecialSituations(params: {
  episodeId: string;
  patientName: string;
  clinicianId: string;
  clinicianName?: string;
  noteContent: string;
  clinicId?: string;
}) {
  const { error, data } = await supabase.functions.invoke("detect-special-situations", {
    body: params
  });

  if (error) throw error;
  return data;
}
