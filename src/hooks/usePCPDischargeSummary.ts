import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface CareTargetSummary {
  name: string;
  status: "resolved" | "improved" | "stable" | "referred";
  outcomeMeasure?: string;
  baselineScore?: number;
  dischargeScore?: number;
  notes?: string;
}

interface DraftSummary {
  patientName: string;
  dateOfBirth?: string;
  episodeId: string;
  referringPhysician?: string;
  reasonForReferral: string;
  careTargets: CareTargetSummary[];
  startDate: string;
  dischargeDate: string;
  totalVisits?: number;
  clinicalCourseSummary: string;
  dischargeStatus: "goals_met" | "functional_plateau" | "patient_discharge" | "referred_out";
  dischargeOutcome?: string;
  recommendations: string[];
  followUpGuidance?: string;
  clinicianName?: string;
  clinicianCredentials?: string;
  clinicianNPI?: string;
}

interface GenerateSummaryResult {
  success: boolean;
  draftSummary?: DraftSummary;
  outcomeIntegrityPassed: boolean;
  outcomeIntegrityIssues: string[];
  careTargets: CareTargetSummary[];
  message: string;
  // Guardrail states
  pcpMissing?: boolean;
  alreadySent?: boolean;
  sendBlocked?: boolean;
  sendBlockedReasons?: string[];
  existingTaskId?: string;
  // Error states
  error?: string;
  code?: "EPISODE_NOT_CLOSED" | "EPISODE_NOT_FOUND" | "PCP_MISSING";
  currentStatus?: string;
}

export function usePCPDischargeSummary() {
  const [loading, setLoading] = useState(false);
  const [draftSummary, setDraftSummary] = useState<DraftSummary | null>(null);
  const [outcomeIntegrityPassed, setOutcomeIntegrityPassed] = useState(false);
  const [outcomeIntegrityIssues, setOutcomeIntegrityIssues] = useState<string[]>([]);
  // New guardrail states
  const [pcpMissing, setPcpMissing] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  const [sendBlocked, setSendBlocked] = useState(false);
  const [sendBlockedReasons, setSendBlockedReasons] = useState<string[]>([]);
  const [existingTaskId, setExistingTaskId] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateDraft = useCallback(async (episodeId: string): Promise<GenerateSummaryResult | null> => {
    setLoading(true);
    // Reset all states
    setErrorCode(null);
    setErrorMessage(null);
    setPcpMissing(false);
    setAlreadySent(false);
    setSendBlocked(false);
    setSendBlockedReasons([]);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-pcp-discharge-summary", {
        body: { episodeId },
      });

      if (error) {
        console.error("Error generating discharge summary:", error);
        toast.error("Failed to generate discharge summary");
        return null;
      }

      // Handle error responses from the edge function
      if (data?.code) {
        setErrorCode(data.code);
        setErrorMessage(data.error);
        
        if (data.code === "EPISODE_NOT_CLOSED") {
          toast.error(`Episode must be closed first (current status: ${data.currentStatus || "unknown"})`);
        } else if (data.code === "EPISODE_NOT_FOUND") {
          toast.error("Episode not found");
        }
        return data as GenerateSummaryResult;
      }

      const result = data as GenerateSummaryResult;
      
      setDraftSummary(result.draftSummary || null);
      setOutcomeIntegrityPassed(result.outcomeIntegrityPassed);
      setOutcomeIntegrityIssues(result.outcomeIntegrityIssues);
      
      // Set guardrail states
      setPcpMissing(result.pcpMissing ?? false);
      setAlreadySent(result.alreadySent ?? false);
      setSendBlocked(result.sendBlocked ?? false);
      setSendBlockedReasons(result.sendBlockedReasons ?? []);
      setExistingTaskId(result.existingTaskId ?? null);

      return result;
    } catch (error) {
      console.error("Error generating discharge summary:", error);
      toast.error("Failed to generate discharge summary");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmAndSend = useCallback(async (
    episodeId: string,
    taskId: string,
    overrideData?: Partial<DraftSummary>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return false;
      }

      // Update the PCP summary task with confirmation
      const updatePayload: Record<string, unknown> = {
        clinician_confirmed_at: new Date().toISOString(),
        clinician_confirmed_by: user.id,
        status: "CONFIRMED",
      };
      
      if (overrideData && draftSummary) {
        updatePayload.draft_summary = { ...draftSummary, ...overrideData } as unknown as Json;
      }

      const { error: updateError } = await supabase
        .from("pcp_summary_tasks")
        .update(updatePayload)
        .eq("id", taskId);

      if (updateError) {
        console.error("Error confirming discharge summary:", updateError);
        toast.error("Failed to confirm discharge summary");
        return false;
      }

      // Log the confirmation event
      await supabase.from("lifecycle_events").insert([{
        entity_type: "PCP_SUMMARY",
        entity_id: episodeId,
        event_type: "CLINICIAN_CONFIRMED",
        actor_type: "clinician",
        actor_id: user.id,
        metadata: {
          confirmedBy: user.id,
          timestamp: new Date().toISOString(),
        } as Json,
      }]);

      toast.success("Discharge summary confirmed and ready for delivery");
      return true;
    } catch (error) {
      console.error("Error confirming discharge summary:", error);
      toast.error("Failed to confirm discharge summary");
      return false;
    } finally {
      setLoading(false);
    }
  }, [draftSummary]);

  const overrideOutcomeIntegrity = useCallback(async (
    episodeId: string,
    taskId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return false;
      }

      const { error } = await supabase
        .from("pcp_summary_tasks")
        .update({
          outcome_integrity_passed: true,
          notes: `Outcome integrity override: ${reason}`,
        })
        .eq("id", taskId);

      if (error) {
        console.error("Error overriding outcome integrity:", error);
        toast.error("Failed to override outcome integrity check");
        return false;
      }

      // Log the override
      await supabase.from("lifecycle_events").insert([{
        entity_type: "PCP_SUMMARY",
        entity_id: episodeId,
        event_type: "OUTCOME_INTEGRITY_OVERRIDE",
        actor_type: "clinician",
        actor_id: user.id,
        metadata: {
          overrideBy: user.id,
          reason,
          timestamp: new Date().toISOString(),
        } as Json,
      }]);

      setOutcomeIntegrityPassed(true);
      toast.success("Outcome integrity check overridden");
      return true;
    } catch (error) {
      console.error("Error overriding outcome integrity:", error);
      toast.error("Failed to override outcome integrity check");
      return false;
    }
  }, []);

  return {
    loading,
    draftSummary,
    outcomeIntegrityPassed,
    outcomeIntegrityIssues,
    // New guardrail states
    pcpMissing,
    alreadySent,
    sendBlocked,
    sendBlockedReasons,
    existingTaskId,
    errorCode,
    errorMessage,
    // Actions
    generateDraft,
    confirmAndSend,
    overrideOutcomeIntegrity,
    setDraftSummary,
  };
}