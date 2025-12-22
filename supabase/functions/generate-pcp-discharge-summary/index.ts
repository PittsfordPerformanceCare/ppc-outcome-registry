/**
 * =============================================================================
 * PCP DISCHARGE SUMMARY GENERATOR — Phase 3 Episode-Level Automation
 * =============================================================================
 * 
 * GUARDRAIL ENFORCEMENT: SOURCE OF TRUTH
 * 
 * This edge function is the AUTHORITATIVE enforcement layer for Phase 3
 * discharge guardrails. UI-side validation is supportive only and must
 * never be relied upon for safety.
 * 
 * Hard Blocks (Server-Side Enforced):
 * - Rule 1: EPISODE_NOT_CLOSED — Episode must be in CLOSED status
 * - Rule 2: ALREADY_SENT — Prevents duplicate sends (idempotency)
 * - Rule 6: PCP_MISSING — Blocks send (not draft) if no PCP/referring provider
 * 
 * Any caller (UI, scripts, direct API requests) is subject to these blocks.
 * Future changes must preserve server-side enforcement regardless of UI behavior.
 * 
 * See: docs/PPC-Phase-3-Guardrail-Enforcement-Source-of-Truth.md
 * =============================================================================
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateSummaryRequest {
  episodeId: string;
  confirmAndSend?: boolean;
}

interface CareTargetSummary {
  name: string;
  status: "resolved" | "improved" | "stable" | "referred";
  outcomeMeasure?: string;
  baselineScore?: number;
  dischargeScore?: number;
  notes?: string;
}

// Helper to log lifecycle events
async function logLifecycleEvent(
  supabase: any,
  episodeId: string,
  eventType: string,
  metadata: Record<string, any> = {},
  actorId?: string
) {
  try {
    await supabase.from("lifecycle_events").insert({
      entity_type: "episode",
      entity_id: episodeId,
      event_type: eventType,
      actor_type: actorId ? "user" : "system",
      actor_id: actorId || null,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });
    console.log(`Lifecycle event logged: ${eventType} for episode ${episodeId}`);
  } catch (err) {
    console.error(`Failed to log lifecycle event ${eventType}:`, err);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { episodeId, confirmAndSend }: GenerateSummaryRequest = await req.json();

    if (!episodeId) {
      return new Response(
        JSON.stringify({ error: "Episode ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating PCP discharge summary for episode: ${episodeId}, confirmAndSend: ${confirmAndSend}`);

    // Fetch episode data
    const { data: episode, error: episodeError } = await supabase
      .from("episodes")
      .select("*")
      .eq("id", episodeId)
      .single();

    if (episodeError || !episode) {
      console.error("Episode not found:", episodeError);
      return new Response(
        JSON.stringify({ error: "Episode not found", code: "EPISODE_NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RULE 1: EPISODE STATUS HARD BLOCK (Server-Side Authoritative)
    // Episode MUST be CLOSED before generating any PCP summary
    // This is a hard block - no override allowed, no drafts generated
    // ═══════════════════════════════════════════════════════════════════════
    if (episode.current_status !== "CLOSED") {
      console.log(`BLOCKED: Episode ${episodeId} is not closed (status: ${episode.current_status})`);
      
      // Log the blocked attempt
      await logLifecycleEvent(supabase, episodeId, "PCP_DISCHARGE_CONFIRM_BLOCKED_EPISODE_NOT_CLOSED", {
        attempted_action: confirmAndSend ? "confirm_and_send" : "generate_draft",
        current_status: episode.current_status,
        reason: "Episode must be CLOSED before generating PCP discharge summary",
      });

      return new Response(
        JSON.stringify({
          error: "Episode must be closed before generating a PCP discharge summary",
          code: "EPISODE_NOT_CLOSED",
          currentStatus: episode.current_status,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RULE 2: IDEMPOTENCY HARD BLOCK (Server-Side Authoritative)
    // If a summary has already been sent, block ALL subsequent attempts
    // UI disabled state is NOT sufficient - server must be authoritative
    // ═══════════════════════════════════════════════════════════════════════
    const { data: existingTask } = await supabase
      .from("pcp_summary_tasks")
      .select("*")
      .eq("episode_id", episodeId)
      .single();

    const alreadySent = existingTask?.sent_at != null;
    
    if (alreadySent) {
      console.log(`BLOCKED: PCP summary for episode ${episodeId} was already sent at ${existingTask.sent_at}`);
      
      // Log the blocked duplicate attempt
      await logLifecycleEvent(supabase, episodeId, "PCP_DISCHARGE_CONFIRM_BLOCKED_ALREADY_SENT", {
        attempted_action: confirmAndSend ? "confirm_and_send" : "generate_draft",
        original_sent_at: existingTask.sent_at,
        existing_task_id: existingTask.id,
        reason: "PCP summary was already sent - duplicate sending is blocked",
      });

      return new Response(
        JSON.stringify({
          error: "PCP summary has already been sent for this episode",
          code: "ALREADY_SENT",
          sentAt: existingTask.sent_at,
          existingTaskId: existingTask.id,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RULE 6: PCP REQUIRED (Send Block - Draft Allowed)
    // If PCP/referring provider is missing:
    //   - Allow draft generation
    //   - Block any send/confirm action
    // Server must enforce this even if UI allows the action
    // ═══════════════════════════════════════════════════════════════════════
    const pcpMissing = !episode.referring_physician;
    
    if (pcpMissing && confirmAndSend) {
      console.log(`BLOCKED: Cannot send PCP summary for episode ${episodeId} - no referring physician`);
      
      // Log the blocked send attempt
      await logLifecycleEvent(supabase, episodeId, "PCP_DISCHARGE_CONFIRM_BLOCKED_PCP_MISSING", {
        attempted_action: "confirm_and_send",
        reason: "No PCP/referring physician on file - delivery blocked",
      });

      return new Response(
        JSON.stringify({
          error: "Cannot send PCP summary without a referring physician on file",
          code: "PCP_MISSING",
          message: "Add PCP to episode to proceed with delivery.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DRAFT GENERATION (Passed all hard blocks)
    // ═══════════════════════════════════════════════════════════════════════

    // Fetch outcome scores for this episode
    const { data: outcomeScores } = await supabase
      .from("outcome_scores")
      .select("*")
      .eq("episode_id", episodeId)
      .order("recorded_at", { ascending: true });

    // Build care targets from episode data
    const careTargets: CareTargetSummary[] = [];
    const outcomeIntegrityIssues: string[] = [];

    // Group outcome scores by index_type
    const scoresByType: Record<string, { baseline?: number; discharge?: number }> = {};
    
    if (outcomeScores) {
      for (const score of outcomeScores) {
        if (!scoresByType[score.index_type]) {
          scoresByType[score.index_type] = {};
        }
        if (score.score_type === "baseline") {
          scoresByType[score.index_type].baseline = score.score;
        } else if (score.score_type === "discharge") {
          scoresByType[score.index_type].discharge = score.score;
        }
      }
    }

    // Check for primary care target (main region/complaint)
    const primaryCareTarget: CareTargetSummary = {
      name: episode.region || "Primary Complaint",
      status: determineStatus(episode),
      notes: episode.diagnosis || undefined,
    };

    // Find matching outcome measure for the region
    const regionOutcome = findRegionOutcome(episode.region, scoresByType);
    if (regionOutcome) {
      primaryCareTarget.outcomeMeasure = regionOutcome.measure;
      primaryCareTarget.baselineScore = regionOutcome.baseline;
      primaryCareTarget.dischargeScore = regionOutcome.discharge;
    }

    // Check outcome integrity for primary care target
    if (!regionOutcome?.baseline) {
      outcomeIntegrityIssues.push(`Missing baseline outcome for ${episode.region}`);
    }
    if (!regionOutcome?.discharge) {
      outcomeIntegrityIssues.push(`Missing discharge outcome for ${episode.region}`);
    }

    careTargets.push(primaryCareTarget);

    // Add any additional functional limitations as care targets
    if (episode.functional_limitations && Array.isArray(episode.functional_limitations)) {
      for (const limitation of episode.functional_limitations) {
        if (limitation && limitation !== episode.region) {
          careTargets.push({
            name: limitation,
            status: "improved",
            notes: "Addressed during episode of care",
          });
        }
      }
    }

    // Determine discharge status
    let dischargeStatus: string;
    if (episode.referred_out) {
      dischargeStatus = "referred_out";
    } else if (episode.discharge_outcome === "goals_met") {
      dischargeStatus = "goals_met";
    } else if (episode.discharge_outcome === "patient_discharge") {
      dischargeStatus = "patient_discharge";
    } else {
      dischargeStatus = "functional_plateau";
    }

    // Build clinical course summary
    const clinicalCourseSummary = buildClinicalCourseSummary(episode);

    // Build recommendations
    const recommendations = buildRecommendations(episode);

    // Build the draft summary object
    const draftSummary = {
      patientName: episode.patient_name,
      dateOfBirth: episode.date_of_birth,
      episodeId: episode.id,
      referringPhysician: episode.referring_physician,
      reasonForReferral: episode.diagnosis || episode.region,
      careTargets,
      startDate: episode.start_date || episode.date_of_service,
      dischargeDate: episode.discharge_date || new Date().toISOString().split("T")[0],
      totalVisits: episode.visits ? parseInt(episode.visits) : undefined,
      clinicalCourseSummary,
      dischargeStatus,
      dischargeOutcome: episode.discharge_outcome,
      recommendations,
      followUpGuidance: episode.followup_date 
        ? `Follow-up scheduled for ${episode.followup_date}` 
        : "Patient will return as needed.",
      clinicianName: episode.clinician,
      clinicianCredentials: episode.clinician_credentials,
      clinicianNPI: episode.npi,
    };

    const outcomeIntegrityPassed = outcomeIntegrityIssues.length === 0;

    const taskUpdate = {
      draft_generated_at: new Date().toISOString(),
      draft_summary: draftSummary,
      outcome_integrity_passed: outcomeIntegrityPassed,
      outcome_integrity_issues: outcomeIntegrityIssues,
      care_targets_summary: careTargets,
      reason_for_referral: episode.diagnosis || episode.region,
      clinical_course_summary: clinicalCourseSummary,
      recommendations,
      followup_guidance: draftSummary.followUpGuidance,
      discharge_status: dischargeStatus,
    };

    if (existingTask) {
      // Update existing task
      const { error: updateError } = await supabase
        .from("pcp_summary_tasks")
        .update(taskUpdate)
        .eq("id", existingTask.id);

      if (updateError) {
        console.error("Failed to update PCP summary task:", updateError);
      }
    }

    // Log the draft generation lifecycle event
    await logLifecycleEvent(supabase, episodeId, "PCP_DISCHARGE_DRAFT_GENERATED", {
      outcome_integrity_passed: outcomeIntegrityPassed,
      outcome_integrity_issues: outcomeIntegrityIssues,
      care_targets_count: careTargets.length,
      pcp_missing: pcpMissing,
      existing_task_id: existingTask?.id || null,
    });

    console.log(`PCP discharge summary draft generated for ${episodeId}`, {
      outcomeIntegrityPassed,
      issueCount: outcomeIntegrityIssues.length,
    });

    // Determine if sending is blocked (for UI information)
    const sendBlocked = pcpMissing;
    const sendBlockedReasons: string[] = [];
    if (pcpMissing) {
      sendBlockedReasons.push("No PCP/referring physician on file. Add PCP to episode to proceed.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        draftSummary,
        outcomeIntegrityPassed,
        outcomeIntegrityIssues,
        careTargets,
        // Guardrail states for UI
        pcpMissing,
        sendBlocked,
        sendBlockedReasons,
        existingTaskId: existingTask?.id,
        message: outcomeIntegrityPassed 
          ? "Draft summary generated. Ready for clinician confirmation."
          : "Draft summary generated with outcome integrity issues. Clinician review required.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error generating PCP discharge summary:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function determineStatus(episode: any): "resolved" | "improved" | "stable" | "referred" {
  if (episode.referred_out) return "referred";
  if (episode.discharge_outcome === "goals_met") return "resolved";
  if (episode.pain_delta && episode.pain_delta < 0) return "improved";
  if (episode.cis_delta && episode.cis_delta !== 0) return "improved";
  return "stable";
}

function findRegionOutcome(
  region: string,
  scoresByType: Record<string, { baseline?: number; discharge?: number }>
): { measure: string; baseline?: number; discharge?: number } | null {
  // Map regions to their primary outcome measures
  const regionMeasures: Record<string, string[]> = {
    "Lower Back": ["ODI", "LEFS"],
    "Lumbar": ["ODI", "LEFS"],
    "Neck": ["NDI", "QuickDASH"],
    "Cervical": ["NDI", "QuickDASH"],
    "Shoulder": ["QuickDASH", "SPADI"],
    "Upper Extremity": ["QuickDASH", "SPADI"],
    "Lower Extremity": ["LEFS"],
    "Knee": ["LEFS", "KOOS"],
    "Hip": ["LEFS", "HOOS"],
    "Ankle": ["LEFS", "FAAM"],
    "Foot": ["LEFS", "FAAM"],
  };

  const measures = regionMeasures[region] || [];
  
  for (const measure of measures) {
    if (scoresByType[measure]) {
      return {
        measure,
        baseline: scoresByType[measure].baseline,
        discharge: scoresByType[measure].discharge,
      };
    }
  }

  // Return first available measure if no region-specific match
  const firstMeasure = Object.keys(scoresByType)[0];
  if (firstMeasure) {
    return {
      measure: firstMeasure,
      baseline: scoresByType[firstMeasure].baseline,
      discharge: scoresByType[firstMeasure].discharge,
    };
  }

  return null;
}

function buildClinicalCourseSummary(episode: any): string {
  const parts: string[] = [];

  parts.push(`Patient presented with ${episode.diagnosis || episode.region} complaints.`);

  if (episode.injury_mechanism) {
    parts.push(`Mechanism of injury: ${episode.injury_mechanism}.`);
  }

  if (episode.visits) {
    parts.push(`Treatment consisted of ${episode.visits} visits over the episode of care.`);
  }

  if (episode.compliance_rating) {
    parts.push(`Patient compliance was rated as ${episode.compliance_rating.toLowerCase()}.`);
  }

  if (episode.clinical_impression) {
    parts.push(episode.clinical_impression);
  }

  if (episode.pain_pre && episode.pain_post) {
    const painChange = episode.pain_pre - episode.pain_post;
    if (painChange > 0) {
      parts.push(`Pain levels improved from ${episode.pain_pre}/10 at baseline to ${episode.pain_post}/10 at discharge.`);
    }
  }

  return parts.join(" ");
}

function buildRecommendations(episode: any): string[] {
  const recommendations: string[] = [];

  // Add PCP action items if present
  if (episode.pcp_action_items && Array.isArray(episode.pcp_action_items)) {
    recommendations.push(...episode.pcp_action_items);
  }

  // Add return to function items
  if (episode.return_to_function_items && Array.isArray(episode.return_to_function_items)) {
    for (const item of episode.return_to_function_items) {
      recommendations.push(`Continue ${item}`);
    }
  }

  // Add medication change notes if flagged
  if (episode.med_changes_flag && episode.med_changes_notes) {
    recommendations.push(`Medication consideration: ${episode.med_changes_notes}`);
  }

  // Add default recommendations if none exist
  if (recommendations.length === 0) {
    recommendations.push("Continue home exercise program as instructed");
    recommendations.push("Return to clinic if symptoms recur or worsen");
    recommendations.push("Maintain functional gains through regular physical activity");
  }

  return recommendations;
}