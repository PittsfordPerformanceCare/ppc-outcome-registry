import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InstrumentCode, getInstrument } from "@/lib/outcomeInstruments";

export interface OutcomeScoreSubmission {
  episodeId: string;
  instrumentCode: InstrumentCode;
  scoreType: "baseline" | "followup" | "discharge";
  score: number;
  responses: Map<number, number | null>;
}

export interface OutcomeScoreRecord {
  id: string;
  episode_id: string;
  index_type: string;
  score_type: string;
  score: number;
  recorded_at: string;
  responses?: Array<{
    question_number: number;
    question_text: string;
    response_value: number | null;
    response_text: string | null;
    is_skipped: boolean;
  }>;
}

export function useOutcomeScores() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submitScore = async (submission: OutcomeScoreSubmission): Promise<string | null> => {
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("You must be logged in to submit scores");
        return null;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", userData.user.id)
        .single();

      // Insert the main score record
      const { data: scoreData, error: scoreError } = await supabase
        .from("outcome_scores")
        .insert({
          episode_id: submission.episodeId,
          user_id: userData.user.id,
          clinic_id: profile?.clinic_id || null,
          index_type: submission.instrumentCode,
          score_type: submission.scoreType,
          score: submission.score,
        })
        .select()
        .single();

      if (scoreError) {
        console.error("Error inserting score:", scoreError);
        toast.error("Failed to save score");
        return null;
      }

      // Get instrument definition for question text
      const instrument = getInstrument(submission.instrumentCode);
      if (!instrument) {
        console.error("Unknown instrument:", submission.instrumentCode);
        return scoreData.id;
      }

      // Insert individual responses
      const responseRecords = Array.from(submission.responses.entries()).map(
        ([questionNumber, responseValue]) => {
          const question = instrument.questions.find(
            (q) => q.number === questionNumber
          );
          const option = question?.options.find(
            (o) => o.value === responseValue
          );

          return {
            outcome_score_id: scoreData.id,
            episode_id: submission.episodeId,
            user_id: userData.user.id,
            clinic_id: profile?.clinic_id || null,
            instrument_code: submission.instrumentCode,
            question_number: questionNumber,
            question_text: question?.text || `Question ${questionNumber}`,
            response_value: responseValue,
            response_text: option?.text || null,
            is_skipped: responseValue === null,
          };
        }
      );

      if (responseRecords.length > 0) {
        const { error: responsesError } = await supabase
          .from("outcome_measure_responses")
          .insert(responseRecords);

        if (responsesError) {
          console.error("Error inserting responses:", responsesError);
          // Don't fail the whole submission, just log the error
        }
      }

      toast.success(`${submission.instrumentCode} score saved successfully`);
      return scoreData.id;
    } catch (error) {
      console.error("Error submitting score:", error);
      toast.error("Failed to save score");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoresForEpisode = async (
    episodeId: string
  ): Promise<OutcomeScoreRecord[]> => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("outcome_scores")
        .select("*")
        .eq("episode_id", episodeId)
        .order("recorded_at", { ascending: true });

      if (error) {
        console.error("Error fetching scores:", error);
        return [];
      }

      // Fetch responses for each score
      const scoresWithResponses = await Promise.all(
        (data || []).map(async (score) => {
          const { data: responses } = await supabase
            .from("outcome_measure_responses")
            .select("question_number, question_text, response_value, response_text, is_skipped")
            .eq("outcome_score_id", score.id)
            .order("question_number", { ascending: true });

          return {
            ...score,
            responses: responses || [],
          };
        })
      );

      return scoresWithResponses;
    } catch (error) {
      console.error("Error fetching scores:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestScoreByType = async (
    episodeId: string,
    instrumentCode: InstrumentCode,
    scoreType: "baseline" | "followup" | "discharge"
  ): Promise<OutcomeScoreRecord | null> => {
    try {
      const { data, error } = await supabase
        .from("outcome_scores")
        .select("*")
        .eq("episode_id", episodeId)
        .eq("index_type", instrumentCode)
        .eq("score_type", scoreType)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== "PGRST116") {
          // Not a "no rows" error
          console.error("Error fetching score:", error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching score:", error);
      return null;
    }
  };

  return {
    submitScore,
    getScoresForEpisode,
    getLatestScoreByType,
    isSubmitting,
    isLoading,
  };
}
