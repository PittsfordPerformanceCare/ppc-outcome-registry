/**
 * =============================================================================
 * PHASE 4B — CARE TARGET DISCHARGE PATIENT COMMUNICATION
 * =============================================================================
 * 
 * GUARDRAIL ENFORCEMENT: SOURCE OF TRUTH
 * 
 * This edge function is the AUTHORITATIVE enforcement layer for all Phase 4B
 * care target discharge message guardrails. UI checks are supportive only.
 * 
 * ENFORCED RULES:
 * - Rule 1 (EPISODE_CLOSED): Blocks if episode.current_status === 'CLOSED'
 * - Rule 2 (ALREADY_SENT): Blocks if message already sent for this care target
 * - Rule 3 (CONFIRMATION_REQUIRED): Blocks send if not confirmed by clinician
 * 
 * Any caller (UI, scripts, direct requests) is subject to these blocks.
 * UI validation exists to improve UX, but does not define eligibility.
 * 
 * See: docs/PPC-Phase-4B-Care-Target-Discharge-Patient-Communication-Governance.md
 * =============================================================================
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateMessageRequest {
  episodeId: string;
  careTargetId: string;
  action?: 'draft' | 'confirm' | 'send';
}

interface CareTargetPlainLanguage {
  id: string;
  name: string;
  status: string;
  plainLanguageStatus: string;
}

/**
 * Log lifecycle events for care target discharge messages
 */
async function logLifecycleEvent(
  supabase: any,
  episodeId: string,
  careTargetId: string,
  eventType: string,
  actor?: string
) {
  try {
    await supabase.from('lifecycle_events').insert({
      episode_id: episodeId,
      event_type: eventType,
      event_data: { care_target_id: careTargetId, actor },
      created_at: new Date().toISOString()
    });
    console.log(`[Phase 4B] Logged lifecycle event: ${eventType} for episode ${episodeId}, care target ${careTargetId}`);
  } catch (error) {
    console.error(`[Phase 4B] Failed to log lifecycle event: ${eventType}`, error);
  }
}

/**
 * Convert clinical status to patient-friendly language
 */
function statusToPlainLanguage(status: string): string {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'currently being addressed',
    'MONITOR': 'being monitored',
    'MAINTENANCE': 'in maintenance phase',
    'RESOLVED': 'has been addressed',
    'DISCHARGED': 'no longer requires active in-clinic care',
  };
  return statusMap[status] || 'in progress';
}

/**
 * Build plain language care target descriptions
 */
function buildPlainLanguageCareTargets(careTargets: any[]): CareTargetPlainLanguage[] {
  return careTargets.map(ct => ({
    id: ct.id,
    name: ct.name || ct.target_name || 'Your concern',
    status: ct.status || 'ACTIVE',
    plainLanguageStatus: statusToPlainLanguage(ct.status || 'ACTIVE')
  }));
}

/**
 * Build the care target discharge message content
 * Required structure (in order):
 * 1. Opening acknowledgment of progress
 * 2. Clear identification of the specific concern transitioning
 * 3. Explanation of what this transition means
 * 4. Explicit statement of what remains active (if anything)
 * 5. Reassurance and continuity statement
 * 6. Professional closing
 */
function buildCareTargetDischargeContent(
  episode: any,
  targetCareTarget: CareTargetPlainLanguage,
  remainingActiveTargets: CareTargetPlainLanguage[],
  clinicSettings: any
): string {
  const patientName = episode.patient_name || 'Valued Patient';
  const clinicPhone = clinicSettings?.phone || '';
  const clinicEmail = clinicSettings?.email || '';
  const clinicName = clinicSettings?.clinic_name || 'Our Clinic';

  // Section 1: Opening acknowledgment of progress
  const openingSection = `Dear ${patientName},

We wanted to take a moment to acknowledge the meaningful progress you've made with your care.`;

  // Section 2: Clear identification of the specific concern transitioning
  const identificationSection = `Regarding your ${targetCareTarget.name.toLowerCase()}: this concern no longer requires active in-clinic care. This reflects real progress in your recovery and your commitment to the work we've done together.`;

  // Section 3: Explanation of what this transition means
  const transitionSection = `What does this mean? This is a professional transition — not an ending. Your body has responded well, and you've built the foundation to continue managing this on your own. We're confident in where you are.`;

  // Section 4: Explicit statement of what remains active (critical - mandatory clause)
  let remainingActiveSection: string;
  if (remainingActiveTargets.length > 0) {
    const activeNames = remainingActiveTargets.map(t => t.name.toLowerCase()).join(', ');
    remainingActiveSection = `We'll continue focusing on: ${activeNames}. Your care with us continues, and we remain fully engaged with these concerns.`;
  } else {
    remainingActiveSection = `At this time, there are no other active concerns requiring in-clinic care. However, this does not mean your episode of care is closed. Your care team remains available, and if anything changes, we're here.`;
  }

  // Section 5: Reassurance and continuity statement
  const reassuranceSection = `This reflects progress, not an ending. If you ever notice changes or have questions about this concern, please don't hesitate to reach out. We're always here to support you.`;

  // Section 6: Professional closing
  const closingSection = `You can reach us at ${clinicPhone || clinicEmail || 'the clinic'} anytime.

With confidence in your progress,
The ${clinicName} Team`;

  return [
    openingSection,
    identificationSection,
    transitionSection,
    remainingActiveSection,
    reassuranceSection,
    closingSection
  ].join('\n\n');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { episodeId, careTargetId, action = 'draft' } = await req.json() as GenerateMessageRequest;

    console.log(`[Phase 4B] Processing ${action} request for episode ${episodeId}, care target ${careTargetId}`);

    if (!episodeId || !careTargetId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          errorCode: 'MISSING_IDENTIFIERS',
          errorMessage: 'Episode ID and Care Target ID are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch episode data
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single();

    if (episodeError || !episode) {
      console.error('[Phase 4B] Episode not found:', episodeError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          errorCode: 'EPISODE_NOT_FOUND',
          errorMessage: 'Episode not found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // GUARDRAIL: Rule 1 — Episode Must Be ACTIVE (NOT CLOSED)
    // =========================================================================
    if (episode.current_status === 'CLOSED') {
      console.log(`[Phase 4B] BLOCKED: Episode ${episodeId} is CLOSED`);
      await logLifecycleEvent(supabase, episodeId, careTargetId, 'CARE_TARGET_DISCHARGE_MESSAGE_BLOCKED_EPISODE_CLOSED');
      return new Response(
        JSON.stringify({
          success: false,
          errorCode: 'EPISODE_CLOSED',
          errorMessage: 'Cannot send care target discharge message after episode closure. Use the episode discharge letter instead.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all care targets for the episode
    const { data: allCareTargets, error: careTargetsError } = await supabase
      .from('care_targets')
      .select('*')
      .eq('episode_id', episodeId);

    if (careTargetsError) {
      console.error('[Phase 4B] Error fetching care targets:', careTargetsError);
    }

    const careTargets = allCareTargets || [];

    // Find the specific care target being discharged
    const targetCareTarget = careTargets.find(ct => ct.id === careTargetId);
    if (!targetCareTarget) {
      return new Response(
        JSON.stringify({
          success: false,
          errorCode: 'CARE_TARGET_NOT_FOUND',
          errorMessage: 'Care target not found for this episode'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Identify remaining active care targets
    const remainingActiveTargets = careTargets.filter(ct => 
      ct.id !== careTargetId && 
      (ct.status === 'ACTIVE' || ct.status === 'MONITOR' || ct.status === 'MAINTENANCE')
    );

    // Check for existing message task for this care target
    const { data: existingTask, error: existingTaskError } = await supabase
      .from('care_target_discharge_message_tasks')
      .select('*')
      .eq('episode_id', episodeId)
      .eq('care_target_id', careTargetId)
      .maybeSingle();

    if (existingTaskError) {
      console.error('[Phase 4B] Error checking existing task:', existingTaskError);
    }

    // =========================================================================
    // GUARDRAIL: Rule 2 — One Message Per Care Target Per Episode (Idempotency)
    // =========================================================================
    if (existingTask?.sent_at && action === 'send') {
      console.log(`[Phase 4B] BLOCKED: Message already sent for care target ${careTargetId}`);
      await logLifecycleEvent(supabase, episodeId, careTargetId, 'CARE_TARGET_DISCHARGE_MESSAGE_BLOCKED_ALREADY_SENT');
      return new Response(
        JSON.stringify({
          success: false,
          errorCode: 'ALREADY_SENT',
          errorMessage: 'A discharge message has already been sent for this care target.',
          sentAt: existingTask.sent_at
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // GUARDRAIL: Rule 3 — Clinician Confirmation Required Before Send
    // =========================================================================
    if (action === 'send' && !existingTask?.confirmed_at) {
      console.log(`[Phase 4B] BLOCKED: Clinician confirmation required for care target ${careTargetId}`);
      return new Response(
        JSON.stringify({
          success: false,
          errorCode: 'CONFIRMATION_REQUIRED',
          errorMessage: 'Clinician confirmation is required before sending.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch clinic settings
    const { data: clinicSettings } = await supabase
      .from('clinic_settings')
      .select('*')
      .limit(1)
      .single();

    // Build plain language care target data
    const plainLanguageTargets = buildPlainLanguageCareTargets(careTargets);
    const plainLanguageTarget = plainLanguageTargets.find(t => t.id === careTargetId)!;
    const plainLanguageRemaining = plainLanguageTargets.filter(t => 
      t.id !== careTargetId && 
      (t.status === 'ACTIVE' || t.status === 'MONITOR' || t.status === 'MAINTENANCE')
    );

    // Handle different actions
    if (action === 'draft') {
      // Generate or update draft
      const messageContent = buildCareTargetDischargeContent(
        episode,
        plainLanguageTarget,
        plainLanguageRemaining,
        clinicSettings
      );

      if (existingTask) {
        // Update existing draft
        const { data: updatedTask, error: updateError } = await supabase
          .from('care_target_discharge_message_tasks')
          .update({
            draft_message: messageContent,
            care_target_name_plain: plainLanguageTarget.name,
            remaining_active_targets_plain: plainLanguageRemaining.map(t => t.name),
            draft_generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTask.id)
          .select()
          .single();

        if (updateError) {
          console.error('[Phase 4B] Error updating draft:', updateError);
          throw updateError;
        }

        await logLifecycleEvent(supabase, episodeId, careTargetId, 'CARE_TARGET_DISCHARGE_MESSAGE_DRAFTED');

        return new Response(
          JSON.stringify({
            success: true,
            action: 'draft_updated',
            task: updatedTask,
            careTarget: plainLanguageTarget,
            remainingActiveTargets: plainLanguageRemaining,
            alreadySent: !!existingTask.sent_at,
            confirmed: !!existingTask.confirmed_at
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Create new draft
        const { data: newTask, error: insertError } = await supabase
          .from('care_target_discharge_message_tasks')
          .insert({
            episode_id: episodeId,
            care_target_id: careTargetId,
            draft_message: messageContent,
            care_target_name_plain: plainLanguageTarget.name,
            remaining_active_targets_plain: plainLanguageRemaining.map(t => t.name),
            draft_generated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('[Phase 4B] Error creating draft:', insertError);
          throw insertError;
        }

        await logLifecycleEvent(supabase, episodeId, careTargetId, 'CARE_TARGET_DISCHARGE_MESSAGE_DRAFTED');

        return new Response(
          JSON.stringify({
            success: true,
            action: 'draft_created',
            task: newTask,
            careTarget: plainLanguageTarget,
            remainingActiveTargets: plainLanguageRemaining,
            alreadySent: false,
            confirmed: false
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'confirm') {
      if (!existingTask) {
        return new Response(
          JSON.stringify({
            success: false,
            errorCode: 'NO_DRAFT',
            errorMessage: 'No draft exists to confirm. Generate a draft first.'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the authorization header to identify the confirming user
      const authHeader = req.headers.get('Authorization');
      let confirmingUserId = null;
      
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        confirmingUserId = user?.id;
      }

      const { data: confirmedTask, error: confirmError } = await supabase
        .from('care_target_discharge_message_tasks')
        .update({
          confirmed_at: new Date().toISOString(),
          confirmed_by: confirmingUserId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTask.id)
        .select()
        .single();

      if (confirmError) {
        console.error('[Phase 4B] Error confirming message:', confirmError);
        throw confirmError;
      }

      await logLifecycleEvent(supabase, episodeId, careTargetId, 'CARE_TARGET_DISCHARGE_MESSAGE_CONFIRMED', confirmingUserId || undefined);

      return new Response(
        JSON.stringify({
          success: true,
          action: 'confirmed',
          task: confirmedTask,
          careTarget: plainLanguageTarget,
          remainingActiveTargets: plainLanguageRemaining
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'send') {
      // All guardrails already passed at this point
      
      const { data: sentTask, error: sendError } = await supabase
        .from('care_target_discharge_message_tasks')
        .update({
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTask.id)
        .select()
        .single();

      if (sendError) {
        console.error('[Phase 4B] Error marking message as sent:', sendError);
        throw sendError;
      }

      await logLifecycleEvent(supabase, episodeId, careTargetId, 'CARE_TARGET_DISCHARGE_MESSAGE_SENT');

      // TODO: Integrate actual email sending here
      console.log(`[Phase 4B] Care target discharge message marked as sent for episode ${episodeId}, care target ${careTargetId}`);

      return new Response(
        JSON.stringify({
          success: true,
          action: 'sent',
          task: sentTask,
          careTarget: plainLanguageTarget,
          remainingActiveTargets: plainLanguageRemaining
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        errorCode: 'INVALID_ACTION',
        errorMessage: 'Invalid action. Use draft, confirm, or send.'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[Phase 4B] Error in generate-care-target-discharge-message:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        errorCode: 'INTERNAL_ERROR',
        errorMessage: errorMsg 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
