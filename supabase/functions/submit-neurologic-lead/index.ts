import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkRateLimit,
  recordRateLimitUsage,
  getClientIp,
  rateLimitResponse,
} from "../_shared/rate-limiter.ts";
import {
  validateNeurologicIntakePayload,
  validationErrorResponse,
} from "../_shared/input-validator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SERVICE_TYPE = "neurologic_intake";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = getClientIp(req);
  console.log("=== Neurologic Lead Submission Request ===");
  console.log("Method:", req.method);
  console.log("Client IP:", clientIp);

  try {
    // Check rate limit first
    const rateLimitResult = await checkRateLimit(SERVICE_TYPE, clientIp);
    if (!rateLimitResult.allowed) {
      console.log(`[submit-neurologic-lead] Rate limit exceeded for IP: ${clientIp}`);
      return rateLimitResponse(rateLimitResult, corsHeaders);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();

    // Validate input
    const validation = validateNeurologicIntakePayload(body);
    if (!validation.valid) {
      console.error("[submit-neurologic-lead] Validation failed:", validation.errors);
      await recordRateLimitUsage(SERVICE_TYPE, false);
      return validationErrorResponse(validation.errors, corsHeaders);
    }

    const { sanitized } = validation;

    // Determine pillar origin
    const source = (sanitized.source as string) || "pillar-app";
    const pillarOrigin =
      (sanitized.pillar_origin as string) ||
      (source?.includes("hub")
        ? "hub"
        : source?.includes("concussion")
        ? "concussion_pillar"
        : source?.includes("msk")
        ? "msk_pillar"
        : source?.includes("registry")
        ? "registry"
        : "direct");

    // Insert the lead with full tracking attribution
    const { data, error } = await supabase
      .from("neurologic_intake_leads")
      .insert({
        email: sanitized.email as string,
        persona: (sanitized.persona as string) || "self",
        name: sanitized.name as string | null,
        phone: sanitized.phone as string | null,
        primary_concern: sanitized.primary_concern as string | null,
        symptom_profile: sanitized.symptom_profile as string | null,
        duration: sanitized.duration as string | null,
        parent_name: sanitized.parent_name as string | null,
        child_name: sanitized.child_name as string | null,
        child_age: sanitized.child_age as string | null,
        symptom_location: sanitized.symptom_location as string | null,
        referrer_name: sanitized.referrer_name as string | null,
        role: sanitized.role as string | null,
        organization: sanitized.organization as string | null,
        patient_name: sanitized.patient_name as string | null,
        patient_age: sanitized.patient_age as string | null,
        urgency: (sanitized.urgency as string) || "routine",
        notes: sanitized.notes as string | null,
        source: source,
        status: "new",
        utm_source: sanitized.utm_source as string | null,
        utm_medium: sanitized.utm_medium as string | null,
        utm_campaign: sanitized.utm_campaign as string | null,
        utm_content: sanitized.utm_content as string | null,
        origin_page: sanitized.origin_page as string | null,
        origin_cta: sanitized.origin_cta as string | null,
        funnel_stage: (sanitized.funnel_stage as string) || "landing",
        pillar_origin: pillarOrigin,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting lead:", error);
      await recordRateLimitUsage(SERVICE_TYPE, false);

      // Log failed submission
      await supabase.from("audit_logs").insert({
        action: "lead_submission_failed",
        table_name: "neurologic_intake_leads",
        record_id: `lead_fail_${Date.now()}`,
        ip_address: clientIp,
        new_data: {
          email: sanitized.email,
          error_message: error.message,
          error_code: error.code,
          source: source,
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(
        JSON.stringify({
          error: "Failed to submit lead",
          code: error.code,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Lead submitted successfully:", data.id);
    await recordRateLimitUsage(SERVICE_TYPE, true);

    // Log successful submission (non-blocking)
    try {
      await supabase.from("audit_logs").insert({
        action: "lead_submission_success",
        table_name: "neurologic_intake_leads",
        record_id: data.id,
        ip_address: clientIp,
        new_data: {
          lead_id: data.id,
          email: sanitized.email,
          persona: sanitized.persona,
          source: source,
          pillar_origin: pillarOrigin,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (auditErr) {
      console.error("Audit log error (non-fatal):", auditErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Lead submitted successfully",
        leadId: data.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error processing request:", err);
    await recordRateLimitUsage(SERVICE_TYPE, false);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
