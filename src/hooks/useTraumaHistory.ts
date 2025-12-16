import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TraumaHistoryItem {
  body_part: string;
  frequency: "Single event" | "Multiple events";
  severity: "Mild" | "Moderate" | "Severe";
}

interface TraumaHistoryData {
  hasTraumaHistory: "No" | "Yes" | "Not sure" | null;
  traumaHistoryItems: TraumaHistoryItem[] | null;
}

interface UseTraumaHistoryResult {
  data: TraumaHistoryData;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches trauma history data for an episode from episode_intake_snapshots
 */
export function useTraumaHistory(episodeId: string | null | undefined): UseTraumaHistoryResult {
  const [data, setData] = useState<TraumaHistoryData>({
    hasTraumaHistory: null,
    traumaHistoryItems: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTraumaHistory() {
      if (!episodeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First try episode_intake_snapshots
        const { data: snapshotData, error: snapshotError } = await supabase
          .from("episode_intake_snapshots")
          .select("intake_payload")
          .eq("episode_id", episodeId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (snapshotError) {
          console.error("Error fetching intake snapshot:", snapshotError);
        }

        if (snapshotData?.intake_payload) {
          const payload = snapshotData.intake_payload as Record<string, unknown>;
          if (payload.has_trauma_history || payload.trauma_history_items) {
            setData({
              hasTraumaHistory: (payload.has_trauma_history as TraumaHistoryData["hasTraumaHistory"]) || null,
              traumaHistoryItems: (payload.trauma_history_items as TraumaHistoryItem[]) || null,
            });
            setLoading(false);
            return;
          }
        }

        // Fallback: Try intake_forms via converted_to_episode_id
        const { data: intakeFormData, error: intakeFormError } = await supabase
          .from("intake_forms")
          .select("*")
          .eq("converted_to_episode_id", episodeId)
          .maybeSingle();

        if (intakeFormError) {
          console.error("Error fetching intake form:", intakeFormError);
        }

        // intake_forms doesn't have trauma history currently, but check anyway
        // for future compatibility
        if (intakeFormData) {
          const formData = intakeFormData as Record<string, unknown>;
          if (formData.has_trauma_history || formData.trauma_history_items) {
            setData({
              hasTraumaHistory: (formData.has_trauma_history as TraumaHistoryData["hasTraumaHistory"]) || null,
              traumaHistoryItems: (formData.trauma_history_items as TraumaHistoryItem[]) || null,
            });
          }
        }

        // Also check intakes table via lead linkage (for neurologic intake flow)
        // This requires finding the lead that created the episode
        // For now, we'll check if there's a direct link

      } catch (err) {
        console.error("Error in useTraumaHistory:", err);
        setError("Failed to load trauma history");
      } finally {
        setLoading(false);
      }
    }

    fetchTraumaHistory();
  }, [episodeId]);

  return { data, loading, error };
}
