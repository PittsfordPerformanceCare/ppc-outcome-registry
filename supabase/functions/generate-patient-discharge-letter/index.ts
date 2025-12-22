/**
 * =============================================================================
 * PATIENT DISCHARGE LETTER GENERATOR — Phase 4A Episode-Level Automation
 * =============================================================================
 * 
 * GUARDRAIL ENFORCEMENT: SOURCE OF TRUTH
 * 
 * This edge function is the AUTHORITATIVE enforcement layer for Phase 4A
 * patient-facing discharge letter guardrails. UI-side validation is supportive
 * only and must never be relied upon for safety.
 * 
 * Hard Blocks (Server-Side Enforced):
 * - Rule 1: EPISODE_NOT_CLOSED — Episode must be in CLOSED status
 * - Rule 2: ALREADY_SENT — Prevents duplicate sends (idempotency)
 * - Rule 3: CLINICIAN_CONFIRMATION_REQUIRED — Must confirm before sending
 * 
 * Content Requirements:
 * - Warm, calm, professional tone
 * - Plain language, no jargon
 * - Mirrors PCP summary scope without technical details
 * 
 * Any caller (UI, scripts, direct API requests) is subject to these blocks.
 * Future changes must preserve server-side enforcement regardless of UI behavior.
 * 
 * See: docs/PPC-Phase-4A-Patient-Discharge-Letter-Governance.md
 * =============================================================================
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateLetterRequest {
  episodeId: string;
  action?: "draft" | "confirm" | "send";
}

interface CareTargetPlainLanguage {
  name: string;
  plainLanguageSummary: string;
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

// Convert clinical status to patient-friendly language
function statusToPlainLanguage(status: string): string {
  switch (status) {
    case "resolved":
      return "fully addressed";
    case "improved":
      return "improved significantly";
    case "stable":
      return "stabilized and managed well";
    case "referred":
      return "transitioned to specialist care";
    default:
      return "progressed as expected";
  }
}

// Build patient-friendly care target description
function buildPlainLanguageCareTargets(careTargets: any[]): CareTargetPlainLanguage[] {
  return careTargets.map((target) => ({
    name: target.name || target.region || "Your primary concern",
    plainLanguageSummary: `${target.name || target.region || "This concern"} has ${statusToPlainLanguage(target.status || "improved")}.`,
  }));
}

// Build the patient letter content
function buildPatientLetterContent(
  episode: any,
  careTargets: CareTargetPlainLanguage[],
  clinicSettings: any
): {
  opening: string;
  whatWeFocusedOn: string;
  howThingsProgressed: string;
  whereYouAreNow: string;
  whatToExpect: string;
  whenToReachOut: string;
  closing: string;
} {
  const patientFirstName = episode.patient_name?.split(" ")[0] || "there";
  const clinicName = clinicSettings?.clinic_name || "our clinic";
  const clinicPhone = clinicSettings?.phone || "";
  const clinicEmail = clinicSettings?.email || "";

  // Section 1: Opening acknowledgment
  const opening = `Dear ${patientFirstName},

Thank you for trusting us with your care. As we transition you out of active treatment, we wanted to take a moment to summarize the progress we made together and provide guidance for the road ahead.`;

  // Section 2: What we focused on together
  const careTargetList = careTargets
    .map((ct) => `• ${ct.name}`)
    .join("\n");
  const whatWeFocusedOn = `During your time with us, we focused on addressing:

${careTargetList}

Our goal was to help you return to the activities that matter most to you while managing your symptoms effectively.`;

  // Section 3: How things progressed
  const visitCount = episode.visits ? parseInt(episode.visits) : null;
  const visitText = visitCount ? `Over the course of ${visitCount} visits, you` : "Throughout your care, you";
  
  const progressSummaries = careTargets
    .map((ct) => ct.plainLanguageSummary)
    .join(" ");

  const howThingsProgressed = `${visitText} made meaningful progress. ${progressSummaries}

${episode.compliance_rating === "Excellent" || episode.compliance_rating === "Good" 
  ? "Your commitment to the care plan played a key role in your improvement." 
  : "We appreciate your participation throughout this process."}`;

  // Section 4: Where you are now
  let statusDescription = "You are now in a stable place and managing well.";
  if (episode.discharge_outcome === "goals_met") {
    statusDescription = "You've reached your treatment goals and are ready to continue independently.";
  } else if (episode.referred_out) {
    statusDescription = "We've transitioned your care to a specialist who can best support your ongoing needs.";
  }

  const whereYouAreNow = `${statusDescription} This transition represents your readiness to move forward with confidence.`;

  // Section 5: What to expect going forward
  const whatToExpect = `Moving forward, it's normal to have occasional flare-ups or days when symptoms feel more noticeable. This doesn't mean something is wrong — it's simply part of the natural recovery process. The strategies and exercises we worked on together will continue to serve you well.

If you experience any new symptoms or a significant change from your current baseline, don't hesitate to reach out.`;

  // Section 6: When to reach back out
  const contactInfo = [
    clinicPhone && `Phone: ${clinicPhone}`,
    clinicEmail && `Email: ${clinicEmail}`,
  ].filter(Boolean).join("\n");

  const whenToReachOut = `You're welcome to contact us anytime if:
• You notice new or worsening symptoms
• You'd like a check-in appointment
• You have questions about your home program

${contactInfo ? `\n${contactInfo}` : ""}`;

  // Section 7: Closing reassurance
  const clinicianName = episode.clinician || "Your care team";
  const credentials = episode.clinician_credentials || "";

  const closing = `It has been a privilege to work with you. We're here if you ever need us again.

With warm regards,

${clinicianName}${credentials ? `, ${credentials}` : ""}
${clinicName}`;

  return {
    opening,
    whatWeFocusedOn,
    howThingsProgressed,
    whereYouAreNow,
    whatToExpect,
    whenToReachOut,
    closing,
  };
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

    const { episodeId, action = "draft" }: GenerateLetterRequest = await req.json();

    if (!episodeId) {
      return new Response(
        JSON.stringify({ error: "Episode ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing patient discharge letter for episode: ${episodeId}, action: ${action}`);

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
    // Episode MUST be CLOSED before generating any patient letter
    // This is a hard block - no override allowed, no drafts generated
    // ═══════════════════════════════════════════════════════════════════════
    if (episode.current_status !== "CLOSED") {
      console.log(`BLOCKED: Episode ${episodeId} is not closed (status: ${episode.current_status})`);
      
      await logLifecycleEvent(supabase, episodeId, "PATIENT_EPISODE_DISCHARGE_LETTER_BLOCKED_NOT_CLOSED", {
        attempted_action: action,
        current_status: episode.current_status,
        reason: "Episode must be CLOSED before generating patient discharge letter",
      });

      return new Response(
        JSON.stringify({
          error: "Episode must be closed before generating a patient discharge letter",
          code: "EPISODE_NOT_CLOSED",
          currentStatus: episode.current_status,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RULE 2: IDEMPOTENCY HARD BLOCK (Server-Side Authoritative)
    // If a letter has already been sent, block ALL subsequent send attempts
    // Regeneration of drafts allowed via explicit clinician action
    // ═══════════════════════════════════════════════════════════════════════
    const { data: existingTask } = await supabase
      .from("patient_discharge_letter_tasks")
      .select("*")
      .eq("episode_id", episodeId)
      .single();

    const alreadySent = existingTask?.sent_at != null;
    
    if (alreadySent && action === "send") {
      console.log(`BLOCKED: Patient letter for episode ${episodeId} was already sent at ${existingTask.sent_at}`);
      
      await logLifecycleEvent(supabase, episodeId, "PATIENT_EPISODE_DISCHARGE_LETTER_BLOCKED_ALREADY_SENT", {
        attempted_action: action,
        original_sent_at: existingTask.sent_at,
        existing_task_id: existingTask.id,
        reason: "Patient discharge letter was already sent - duplicate sending is blocked",
      });

      return new Response(
        JSON.stringify({
          error: "Patient discharge letter has already been sent for this episode",
          code: "ALREADY_SENT",
          sentAt: existingTask.sent_at,
          existingTaskId: existingTask.id,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RULE 3: CLINICIAN CONFIRMATION REQUIRED (Server-Side Authoritative)
    // Cannot send without prior confirmation
    // ═══════════════════════════════════════════════════════════════════════
    if (action === "send" && (!existingTask || !existingTask.confirmed_at)) {
      console.log(`BLOCKED: Cannot send patient letter for episode ${episodeId} - not confirmed`);
      
      return new Response(
        JSON.stringify({
          error: "Patient discharge letter must be confirmed by clinician before sending",
          code: "CONFIRMATION_REQUIRED",
          message: "Please review and confirm the letter before sending.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FETCH SUPPORTING DATA
    // ═══════════════════════════════════════════════════════════════════════
    
    // Fetch clinic settings for contact info
    const { data: clinicSettings } = await supabase
      .from("clinic_settings")
      .select("*")
      .single();

    // Fetch PCP summary task to align care targets
    const { data: pcpTask } = await supabase
      .from("pcp_summary_tasks")
      .select("care_targets_summary")
      .eq("episode_id", episodeId)
      .single();

    // Build care targets from PCP summary or episode data
    let careTargets: CareTargetPlainLanguage[] = [];
    
    if (pcpTask?.care_targets_summary && Array.isArray(pcpTask.care_targets_summary)) {
      careTargets = buildPlainLanguageCareTargets(pcpTask.care_targets_summary);
    } else {
      // Fallback: build from episode data
      careTargets = [{
        name: episode.region || "Your primary concern",
        plainLanguageSummary: `Your ${episode.region || "condition"} has ${statusToPlainLanguage(episode.discharge_outcome === "goals_met" ? "resolved" : "improved")}.`,
      }];

      // Add functional limitations if present
      if (episode.functional_limitations && Array.isArray(episode.functional_limitations)) {
        for (const limitation of episode.functional_limitations) {
          if (limitation && limitation !== episode.region) {
            careTargets.push({
              name: limitation,
              plainLanguageSummary: `${limitation} has been addressed during your care.`,
            });
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DRAFT GENERATION
    // ═══════════════════════════════════════════════════════════════════════
    
    const letterContent = buildPatientLetterContent(episode, careTargets, clinicSettings);

    const draftLetter = {
      patientName: episode.patient_name,
      careTargets,
      letterContent,
      episodeId: episode.id,
      startDate: episode.start_date || episode.date_of_service,
      dischargeDate: episode.discharge_date || new Date().toISOString().split("T")[0],
      totalVisits: episode.visits ? parseInt(episode.visits) : undefined,
      clinicianName: episode.clinician,
      clinicianCredentials: episode.clinician_credentials,
      clinicName: clinicSettings?.clinic_name,
      clinicPhone: clinicSettings?.phone,
      clinicEmail: clinicSettings?.email,
    };

    // ═══════════════════════════════════════════════════════════════════════
    // ACTION: DRAFT - Generate/update draft
    // ═══════════════════════════════════════════════════════════════════════
    if (action === "draft") {
      const taskData = {
        episode_id: episodeId,
        draft_generated_at: new Date().toISOString(),
        draft_letter: draftLetter,
        care_targets_plain_language: careTargets,
      };

      if (existingTask) {
        await supabase
          .from("patient_discharge_letter_tasks")
          .update(taskData)
          .eq("id", existingTask.id);
      } else {
        await supabase
          .from("patient_discharge_letter_tasks")
          .insert(taskData);
      }

      await logLifecycleEvent(supabase, episodeId, "PATIENT_EPISODE_DISCHARGE_LETTER_DRAFTED", {
        care_targets_count: careTargets.length,
        existing_task_id: existingTask?.id || null,
      });

      console.log(`Patient discharge letter draft generated for ${episodeId}`);

      return new Response(
        JSON.stringify({
          success: true,
          draftLetter,
          careTargets,
          alreadySent: false,
          existingTaskId: existingTask?.id,
          message: "Draft letter generated. Ready for clinician confirmation.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ACTION: CONFIRM - Clinician confirms the letter
    // ═══════════════════════════════════════════════════════════════════════
    if (action === "confirm") {
      if (!existingTask) {
        return new Response(
          JSON.stringify({
            error: "No draft exists to confirm",
            code: "NO_DRAFT",
            message: "Please generate a draft first.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get the user ID from the authorization header
      const authHeader = req.headers.get("authorization");
      let confirmedBy: string | null = null;
      
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        confirmedBy = user?.id || null;
      }

      await supabase
        .from("patient_discharge_letter_tasks")
        .update({
          confirmed_at: new Date().toISOString(),
          confirmed_by: confirmedBy,
        })
        .eq("id", existingTask.id);

      await logLifecycleEvent(supabase, episodeId, "PATIENT_EPISODE_DISCHARGE_LETTER_CONFIRMED", {
        task_id: existingTask.id,
        confirmed_by: confirmedBy,
      }, confirmedBy || undefined);

      console.log(`Patient discharge letter confirmed for ${episodeId}`);

      return new Response(
        JSON.stringify({
          success: true,
          confirmed: true,
          taskId: existingTask.id,
          message: "Letter confirmed. Ready to send.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ACTION: SEND - Send the confirmed letter
    // ═══════════════════════════════════════════════════════════════════════
    if (action === "send") {
      // Double-check all conditions (defense in depth)
      if (!existingTask?.confirmed_at) {
        return new Response(
          JSON.stringify({
            error: "Letter must be confirmed before sending",
            code: "CONFIRMATION_REQUIRED",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // For now, mark as sent (actual email integration would go here)
      // TODO: Integrate with email sending service
      
      await supabase
        .from("patient_discharge_letter_tasks")
        .update({
          sent_at: new Date().toISOString(),
        })
        .eq("id", existingTask.id);

      await logLifecycleEvent(supabase, episodeId, "PATIENT_EPISODE_DISCHARGE_LETTER_SENT", {
        task_id: existingTask.id,
        patient_name: episode.patient_name,
      });

      console.log(`Patient discharge letter sent for ${episodeId}`);

      return new Response(
        JSON.stringify({
          success: true,
          sent: true,
          taskId: existingTask.id,
          sentAt: new Date().toISOString(),
          message: "Patient discharge letter has been sent.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unknown action
    return new Response(
      JSON.stringify({ error: "Invalid action", code: "INVALID_ACTION" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error processing patient discharge letter:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
