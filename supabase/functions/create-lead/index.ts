import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkRateLimit,
  recordRateLimitUsage,
  getClientIp,
  rateLimitResponse,
} from "../_shared/rate-limiter.ts";
import {
  validateLeadPayload,
  validationErrorResponse,
} from "../_shared/input-validator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERVICE_TYPE = "lead_submission";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const clientIp = getClientIp(req);

  try {
    // Check rate limit first
    const rateLimitResult = await checkRateLimit(SERVICE_TYPE, clientIp);
    if (!rateLimitResult.allowed) {
      console.log(`[create-lead] Rate limit exceeded for IP: ${clientIp}`);
      return rateLimitResponse(rateLimitResult, corsHeaders);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    const body = await req.json();
    console.log("[create-lead] Received request from IP:", clientIp);

    const validation = validateLeadPayload(body);
    if (!validation.valid) {
      console.log("[create-lead] Validation failed:", validation.errors);
      await recordRateLimitUsage(SERVICE_TYPE, false);
      return validationErrorResponse(validation.errors, corsHeaders);
    }

    const { sanitized } = validation;

    // Build lead data from sanitized input
    const leadData = {
      name: sanitized.name as string,
      email: sanitized.email as string | null,
      phone: sanitized.phone as string | null,
      who_is_this_for: sanitized.who_is_this_for as string | null,
      primary_concern: sanitized.primary_concern as string | null,
      symptom_summary: sanitized.symptom_summary as string | null,
      preferred_contact_method: sanitized.preferred_contact_method as string | null,
      notes: sanitized.notes as string | null,
      utm_source: sanitized.utm_source as string | null,
      utm_medium: sanitized.utm_medium as string | null,
      utm_campaign: sanitized.utm_campaign as string | null,
      utm_content: sanitized.utm_content as string | null,
      origin_page: sanitized.origin_page as string | null,
      origin_cta: sanitized.origin_cta as string | null,
      pillar_origin: sanitized.pillar_origin as string | null,
      system_category: sanitized.primary_concern as string | null,
      checkpoint_status: "lead_created",
      funnel_stage: "lead",
    };

    // Insert into leads table
    const { data, error } = await supabase
      .from("leads")
      .insert(leadData)
      .select("id")
      .single();

    if (error) {
      console.error("[create-lead] Database error:", error);
      await recordRateLimitUsage(SERVICE_TYPE, false);
      return new Response(
        JSON.stringify({ error: "Failed to create lead" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[create-lead] Lead created successfully:", data.id);
    await recordRateLimitUsage(SERVICE_TYPE, true);

    // Log to audit_logs (non-blocking)
    try {
      await supabase.from("audit_logs").insert({
        action: "lead_created_via_api",
        table_name: "leads",
        record_id: data.id,
        ip_address: clientIp,
        new_data: {
          ...leadData,
          source: "create-lead-api",
        },
      });
    } catch (auditErr) {
      console.error("[create-lead] Audit log error (non-fatal):", auditErr);
    }

    return new Response(
      JSON.stringify({ success: true, lead_id: data.id }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[create-lead] Unexpected error:", err);
    await recordRateLimitUsage(SERVICE_TYPE, false);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
