import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "./auditLog";

export interface Episode {
  id: string;
  user_id: string;
  patient_name: string;
  date_of_birth?: string;
  region: string;
  diagnosis?: string;
  date_of_service: string;
  injury_date?: string;
  injury_mechanism?: string;
  pain_level?: string;
  referring_physician?: string;
  insurance?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medications?: string;
  medical_history?: string;
  prior_treatments?: any;
  prior_treatments_other?: string;
  functional_limitations?: string[];
  functional_limitation?: string;
  treatment_goals?: any;
  goals_other?: string;
  start_date?: string;
  visits?: string;
  resolution_days?: string;
  compliance_rating?: string;
  compliance_notes?: string;
  referred_out?: boolean;
  referral_reason?: string;
  discharge_date?: string;
  followup_date?: string;
  cis_pre?: number;
  cis_post?: number;
  cis_delta?: number;
  pain_pre?: number;
  pain_post?: number;
  pain_delta?: number;
}

export async function createEpisode(episode: Partial<Episode>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const episodeData = {
    ...episode,
    user_id: user.id,
  } as any;

  const { data, error } = await supabase
    .from("episodes")
    .insert(episodeData)
    .select()
    .single();

  if (error) throw error;

  await logAudit("CREATE", "episodes", data.id, null, data);
  return data;
}

export async function updateEpisode(episodeId: string, updates: Partial<Episode>) {
  const { data: oldData } = await supabase
    .from("episodes")
    .select()
    .eq("id", episodeId)
    .single();

  const { data, error } = await supabase
    .from("episodes")
    .update(updates)
    .eq("id", episodeId)
    .select()
    .single();

  if (error) throw error;

  await logAudit("UPDATE", "episodes", episodeId, oldData, data);
  return data;
}

export async function getEpisode(episodeId: string) {
  const { data, error } = await supabase
    .from("episodes")
    .select()
    .eq("id", episodeId)
    .single();

  if (error) throw error;

  await logAudit("READ", "episodes", episodeId, null, null);
  return data;
}

export async function getAllEpisodes() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("episodes")
    .select()
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteEpisode(episodeId: string) {
  const { data: oldData } = await supabase
    .from("episodes")
    .select()
    .eq("id", episodeId)
    .single();

  const { error } = await supabase
    .from("episodes")
    .delete()
    .eq("id", episodeId);

  if (error) throw error;

  await logAudit("DELETE", "episodes", episodeId, oldData, null);
}

// Outcome Scores
export async function saveOutcomeScore(
  episodeId: string,
  indexType: string,
  scoreType: "baseline" | "discharge" | "followup",
  score: number
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("outcome_scores")
    .insert({
      episode_id: episodeId,
      user_id: user.id,
      index_type: indexType,
      score_type: scoreType,
      score,
    })
    .select()
    .single();

  if (error) throw error;

  await logAudit("CREATE", "outcome_scores", data.id, null, data);
  return data;
}

export async function getOutcomeScores(episodeId: string) {
  const { data, error } = await supabase
    .from("outcome_scores")
    .select()
    .eq("episode_id", episodeId)
    .order("recorded_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Followups
export async function createFollowup(episodeId: string, scheduledDate: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("followups")
    .insert({
      episode_id: episodeId,
      user_id: user.id,
      scheduled_date: scheduledDate,
    })
    .select()
    .single();

  if (error) throw error;

  await logAudit("CREATE", "followups", data.id, null, data);
  return data;
}

export async function updateFollowup(
  followupId: string,
  updates: { completed_date?: string; status?: string; completed?: boolean }
) {
  const { data: oldData } = await supabase
    .from("followups")
    .select()
    .eq("id", followupId)
    .single();

  const { data, error } = await supabase
    .from("followups")
    .update(updates)
    .eq("id", followupId)
    .select()
    .single();

  if (error) throw error;

  await logAudit("UPDATE", "followups", followupId, oldData, data);
  return data;
}

export async function getFollowup(episodeId: string) {
  const { data, error } = await supabase
    .from("followups")
    .select()
    .eq("episode_id", episodeId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
