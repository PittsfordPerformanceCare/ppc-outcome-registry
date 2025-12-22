import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CareTargetPlainLanguage {
  name: string;
  plainLanguageSummary: string;
}

export interface LetterContent {
  opening: string;
  whatWeFocusedOn: string;
  howThingsProgressed: string;
  whereYouAreNow: string;
  whatToExpect: string;
  whenToReachOut: string;
  closing: string;
}

export interface DraftLetter {
  patientName: string;
  careTargets: CareTargetPlainLanguage[];
  letterContent: LetterContent;
  episodeId: string;
  startDate?: string;
  dischargeDate?: string;
  totalVisits?: number;
  clinicianName?: string;
  clinicianCredentials?: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicEmail?: string;
}

export interface GenerateLetterResult {
  success: boolean;
  draftLetter?: DraftLetter;
  careTargets?: CareTargetPlainLanguage[];
  alreadySent?: boolean;
  existingTaskId?: string;
  confirmed?: boolean;
  sent?: boolean;
  sentAt?: string;
  message?: string;
  error?: string;
  code?: string;
}

export function usePatientDischargeLetter() {
  const [loading, setLoading] = useState(false);
  const [draftLetter, setDraftLetter] = useState<DraftLetter | null>(null);
  const [careTargets, setCareTargets] = useState<CareTargetPlainLanguage[]>([]);
  const [alreadySent, setAlreadySent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [existingTaskId, setExistingTaskId] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setDraftLetter(null);
    setCareTargets([]);
    setAlreadySent(false);
    setConfirmed(false);
    setExistingTaskId(null);
    setErrorCode(null);
    setErrorMessage(null);
  }, []);

  const generateDraft = useCallback(async (episodeId: string): Promise<GenerateLetterResult | null> => {
    setLoading(true);
    resetState();

    try {
      const { data, error } = await supabase.functions.invoke("generate-patient-discharge-letter", {
        body: { episodeId, action: "draft" },
      });

      if (error) {
        console.error("Error generating patient discharge letter:", error);
        toast.error("Failed to generate patient discharge letter");
        setErrorMessage(error.message);
        return null;
      }

      if (data.code) {
        // Handle structured error codes
        setErrorCode(data.code);
        setErrorMessage(data.error || data.message);
        
        if (data.code === "EPISODE_NOT_CLOSED") {
          toast.error("Episode must be closed before generating a patient letter");
        } else if (data.code === "ALREADY_SENT") {
          setAlreadySent(true);
          toast.info("Patient discharge letter has already been sent");
        }
        
        return data;
      }

      setDraftLetter(data.draftLetter);
      setCareTargets(data.careTargets || []);
      setAlreadySent(data.alreadySent || false);
      setExistingTaskId(data.existingTaskId || null);

      // Check if already confirmed by fetching task
      if (data.existingTaskId) {
        const { data: taskData } = await supabase
          .from("patient_discharge_letter_tasks")
          .select("confirmed_at, sent_at")
          .eq("id", data.existingTaskId)
          .single();
        
        if (taskData) {
          setConfirmed(!!taskData.confirmed_at);
          setAlreadySent(!!taskData.sent_at);
        }
      }

      return data;
    } catch (err) {
      console.error("Error generating patient discharge letter:", err);
      toast.error("Failed to generate patient discharge letter");
      return null;
    } finally {
      setLoading(false);
    }
  }, [resetState]);

  const confirmLetter = useCallback(async (episodeId: string): Promise<boolean> => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-patient-discharge-letter", {
        body: { episodeId, action: "confirm" },
      });

      if (error) {
        console.error("Error confirming patient discharge letter:", error);
        toast.error("Failed to confirm letter");
        return false;
      }

      if (data.code) {
        setErrorCode(data.code);
        setErrorMessage(data.error || data.message);
        toast.error(data.error || "Failed to confirm letter");
        return false;
      }

      setConfirmed(true);
      setExistingTaskId(data.taskId || existingTaskId);
      toast.success("Letter confirmed and ready to send");
      return true;
    } catch (err) {
      console.error("Error confirming patient discharge letter:", err);
      toast.error("Failed to confirm letter");
      return false;
    } finally {
      setLoading(false);
    }
  }, [existingTaskId]);

  const sendLetter = useCallback(async (episodeId: string): Promise<boolean> => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-patient-discharge-letter", {
        body: { episodeId, action: "send" },
      });

      if (error) {
        console.error("Error sending patient discharge letter:", error);
        toast.error("Failed to send letter");
        return false;
      }

      if (data.code) {
        setErrorCode(data.code);
        setErrorMessage(data.error || data.message);
        
        if (data.code === "ALREADY_SENT") {
          setAlreadySent(true);
          toast.info("Letter has already been sent");
        } else if (data.code === "CONFIRMATION_REQUIRED") {
          toast.error("Please confirm the letter before sending");
        } else {
          toast.error(data.error || "Failed to send letter");
        }
        return false;
      }

      setAlreadySent(true);
      toast.success("Patient discharge letter sent successfully");
      return true;
    } catch (err) {
      console.error("Error sending patient discharge letter:", err);
      toast.error("Failed to send letter");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    draftLetter,
    careTargets,
    alreadySent,
    confirmed,
    existingTaskId,
    errorCode,
    errorMessage,
    generateDraft,
    confirmLetter,
    sendLetter,
    setDraftLetter,
    resetState,
  };
}
