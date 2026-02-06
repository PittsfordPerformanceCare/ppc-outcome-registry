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
  botDetectedResponse,
} from "../_shared/input-validator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERVICE_TYPE = "lead_submission";

// Concussion education triggers for all neuro-relevant concerns (matches frontend EDUCATION_ELIGIBLE_CONCERNS)
const EDUCATION_ELIGIBLE_CONCERNS = ["concussion", "dizziness", "headaches"];

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
    console.log("[create-lead] Received request from IP:", clientIp, "body keys:", Object.keys(body));
    console.log("[create-lead] Name:", body.name || body.full_name);
    console.log("[create-lead] Email:", body.email);
    console.log("[create-lead] Primary concern:", body.primary_concern);
    console.log("[create-lead] Time sensitivity:", body.time_sensitivity);
    console.log("[create-lead] Route label:", body.route_label);
    console.log("[create-lead] Honeypot website:", body.website, "fax:", body.fax);
    console.log("[create-lead] Form load time:", body._form_loaded_at, "elapsed:", body._form_loaded_at ? (Date.now() - body._form_loaded_at) / 1000 : "N/A", "seconds");

    const validation = validateLeadPayload(body);
    
    // Silent rejection for bots (fake success)
    if (validation.isBot) {
      console.log("[create-lead] Bot detected - honeypot or timing check failed, silently rejecting:", clientIp);
      return botDetectedResponse(corsHeaders);
    }
    
    if (!validation.valid) {
      console.log("[create-lead] Validation failed:", JSON.stringify(validation.errors));
      await recordRateLimitUsage(SERVICE_TYPE, false);
      return validationErrorResponse(validation.errors, corsHeaders);
    }

    const { sanitized } = validation;

    // Check if this lead qualifies for concussion education (neuro-relevant dropdown matches)
    const deliverConcussionEducation = EDUCATION_ELIGIBLE_CONCERNS.includes(
      sanitized.primary_concern as string
    );

    // Build lead data from sanitized input
    const leadData: Record<string, unknown> = {
      name: sanitized.name as string,
      email: sanitized.email as string | null,
      phone: sanitized.phone as string | null,
      who_is_this_for: sanitized.who_is_this_for as string | null,
      primary_concern: sanitized.primary_concern as string | null,
      preferred_contact_method: sanitized.preferred_contact_method as string | null,
      notes: sanitized.notes as string | null,
      // New routing fields
      time_sensitivity: sanitized.time_sensitivity as string | null,
      goal_of_contact: sanitized.goal_of_contact as string | null,
      system_category: sanitized.system_category as string | null,
      route_label: sanitized.route_label as string | null,
      // Attribution fields
      utm_source: sanitized.utm_source as string | null,
      utm_medium: sanitized.utm_medium as string | null,
      utm_campaign: sanitized.utm_campaign as string | null,
      utm_content: sanitized.utm_content as string | null,
      origin_page: sanitized.origin_page as string | null,
      origin_cta: sanitized.origin_cta as string | null,
      pillar_origin: sanitized.pillar_origin as string | null,
      checkpoint_status: "lead_created",
      funnel_stage: "lead",
    };

    // Add education tracking if applicable
    if (deliverConcussionEducation) {
      leadData.education_delivered = true;
      leadData.education_asset = "acute_concussion_guide_v1";
      leadData.education_url = "/site/guides/concussion/acute-concussion-guide";
      leadData.education_delivered_at = new Date().toISOString();
      console.log("[create-lead] Education will be delivered: acute_concussion_guide_v1");
    }

    // Insert into leads table
    const { data, error } = await supabase
      .from("leads")
      .insert(leadData)
      .select("id, email, name, primary_concern")
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

    // Send confirmation email if email is provided (non-blocking)
    if (data.email) {
      try {
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-lead-confirmation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            leadId: data.id,
            email: data.email,
            name: data.name,
            primaryConcern: data.primary_concern,
            deliverConcussionEducation,
          }),
        });
        
        if (!emailResponse.ok) {
          console.error("[create-lead] Failed to send confirmation email:", await emailResponse.text());
        } else {
          console.log("[create-lead] Confirmation email triggered successfully");
        }
      } catch (emailErr) {
        console.error("[create-lead] Email trigger error (non-fatal):", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: data.id,
        education_delivered: deliverConcussionEducation,
      }),
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
