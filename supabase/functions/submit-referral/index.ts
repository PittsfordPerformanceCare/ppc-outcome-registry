import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkRateLimit,
  recordRateLimitUsage,
  getClientIp,
  rateLimitResponse,
} from "../_shared/rate-limiter.ts";
import {
  sanitizeString,
  isValidEmail,
  isValidPhone,
  isValidName,
  isSafeText,
  checkHoneypot,
  checkSubmissionTiming,
  botDetectedResponse,
} from "../_shared/input-validator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SERVICE_TYPE = "referral_submission";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const clientIp = getClientIp(req);
  console.log("[submit-referral] Request from IP:", clientIp);

  try {
    // Check rate limit first
    const rateLimitResult = await checkRateLimit(SERVICE_TYPE, clientIp);
    if (!rateLimitResult.allowed) {
      console.log(`[submit-referral] Rate limit exceeded for IP: ${clientIp}`);
      return rateLimitResponse(rateLimitResult, corsHeaders);
    }

    const body = await req.json();

    // Bot detection
    const isBot = checkHoneypot(body) || checkSubmissionTiming(body);
    if (isBot) {
      console.log("[submit-referral] Bot detected, silently rejecting:", clientIp);
      return botDetectedResponse(corsHeaders);
    }

    // Validate and sanitize inputs
    const errors: { field: string; message: string }[] = [];

    const name = sanitizeString(body.name, 100);
    if (!name) {
      errors.push({ field: "name", message: "Name is required" });
    } else if (!isValidName(name)) {
      errors.push({ field: "name", message: "Name contains invalid characters" });
    }

    const email = sanitizeString(body.email, 255);
    if (!email) {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!isValidEmail(email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    const phone = sanitizeString(body.phone, 20);
    if (phone && !isValidPhone(phone)) {
      errors.push({ field: "phone", message: "Invalid phone format" });
    }

    const careFor = sanitizeString(body.care_for || body.careFor, 20);
    const chiefComplaint = sanitizeString(body.chief_complaint || body.chiefComplaint, 1000);
    const referralSource = sanitizeString(body.referral_source || body.referralSource, 200);
    const referralCode = sanitizeString(body.referral_code || body.referralCode, 50);

    if (!chiefComplaint) {
      errors.push({ field: "chief_complaint", message: "Chief complaint is required" });
    } else if (!isSafeText(chiefComplaint)) {
      errors.push({ field: "chief_complaint", message: "Chief complaint contains invalid characters" });
    }

    if (errors.length > 0) {
      console.log("[submit-referral] Validation failed:", errors);
      await recordRateLimitUsage(SERVICE_TYPE, false);
      return new Response(
        JSON.stringify({ error: "Validation failed", details: errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert referral inquiry
    const { data, error } = await supabase
      .from("referral_inquiries")
      .insert({
        name,
        email: email?.toLowerCase(),
        phone,
        care_for: careFor || "self",
        chief_complaint: chiefComplaint,
        referral_source: referralSource,
        referral_code: referralCode,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[submit-referral] Database error:", error);
      await recordRateLimitUsage(SERVICE_TYPE, false);
      return new Response(
        JSON.stringify({ error: "Failed to submit inquiry" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[submit-referral] Referral created successfully:", data.id);
    await recordRateLimitUsage(SERVICE_TYPE, true);

    // Audit log (non-blocking)
    try {
      await supabase.from("audit_logs").insert({
        action: "referral_submitted_via_api",
        table_name: "referral_inquiries",
        record_id: data.id,
        ip_address: clientIp,
        new_data: {
          name,
          email,
          care_for: careFor,
          source: "submit-referral-api",
        },
      });
    } catch (auditErr) {
      console.error("[submit-referral] Audit log error (non-fatal):", auditErr);
    }

    return new Response(
      JSON.stringify({ success: true, referral_id: data.id }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[submit-referral] Unexpected error:", err);
    await recordRateLimitUsage(SERVICE_TYPE, false);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
