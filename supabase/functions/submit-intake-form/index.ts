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

const SERVICE_TYPE = "intake_form";

// Generate a random 8-character access code
function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
  console.log("[submit-intake-form] Request from IP:", clientIp);

  try {
    // Check rate limit first
    const rateLimitResult = await checkRateLimit(SERVICE_TYPE, clientIp);
    if (!rateLimitResult.allowed) {
      console.log(`[submit-intake-form] Rate limit exceeded for IP: ${clientIp}`);
      return rateLimitResponse(rateLimitResult, corsHeaders);
    }

    const body = await req.json();

    // Bot detection
    const isBot = checkHoneypot(body) || checkSubmissionTiming(body);
    if (isBot) {
      console.log("[submit-intake-form] Bot detected, silently rejecting:", clientIp);
      return botDetectedResponse(corsHeaders);
    }

    // Validate required fields
    const errors: { field: string; message: string }[] = [];

    const patientName = sanitizeString(body.patient_name, 100);
    if (!patientName) {
      errors.push({ field: "patient_name", message: "Patient name is required" });
    }

    const dateOfBirth = sanitizeString(body.date_of_birth, 20);
    if (!dateOfBirth) {
      errors.push({ field: "date_of_birth", message: "Date of birth is required" });
    }

    const chiefComplaint = sanitizeString(body.chief_complaint, 1000);
    if (!chiefComplaint) {
      errors.push({ field: "chief_complaint", message: "Chief complaint is required" });
    }

    // Validate optional fields
    const email = sanitizeString(body.email, 255);
    if (email && !isValidEmail(email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    const phone = sanitizeString(body.phone, 20);
    if (phone && !isValidPhone(phone)) {
      errors.push({ field: "phone", message: "Invalid phone format" });
    }

    // Check for unsafe content in text fields
    const textFieldsToCheck = [
      "symptoms", "medical_history", "allergies", "current_medications",
      "surgery_history", "hospitalization_history", "injury_mechanism"
    ];
    
    for (const field of textFieldsToCheck) {
      const value = body[field];
      if (value && typeof value === "string" && !isSafeText(value)) {
        errors.push({ field, message: `${field} contains invalid characters` });
      }
    }

    if (errors.length > 0) {
      console.log("[submit-intake-form] Validation failed:", errors);
      await recordRateLimitUsage(SERVICE_TYPE, false);
      return new Response(
        JSON.stringify({ error: "Validation failed", details: errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const accessCode = generateAccessCode();

    // Build intake form data (sanitize all string fields)
    const intakeData: Record<string, unknown> = {
      access_code: accessCode,
      patient_name: patientName,
      date_of_birth: dateOfBirth,
      chief_complaint: chiefComplaint,
      status: "pending",
    };

    // Optional string fields
    const optionalStringFields = [
      "phone", "email", "address", "guardian_phone",
      "insurance_provider", "insurance_id", "bill_responsible_party",
      "emergency_contact_name", "emergency_contact_phone", "emergency_contact_relationship",
      "referral_source", "primary_care_physician", "pcp_phone", "pcp_fax", "pcp_address",
      "referring_physician", "specialist_seen", "hospitalization_history", "surgery_history",
      "current_medications", "allergies", "medical_history", "injury_date", "injury_mechanism",
      "symptoms", "consent_signature", "consent_signed_name", "consent_date",
      "hipaa_signed_name", "hipaa_date", "referral_code"
    ];

    for (const field of optionalStringFields) {
      const value = sanitizeString(body[field], field.includes("history") || field.includes("medications") ? 2000 : 500);
      if (value) {
        intakeData[field] = field === "email" ? value.toLowerCase() : value;
      }
    }

    // Numeric fields
    if (typeof body.pain_level === "number") {
      intakeData.pain_level = Math.min(Math.max(body.pain_level, 0), 10);
    }

    // Boolean fields
    if (typeof body.hipaa_acknowledged === "boolean") {
      intakeData.hipaa_acknowledged = body.hipaa_acknowledged;
    }
    if (typeof body.consent_clinic_updates === "boolean") {
      intakeData.consent_clinic_updates = body.consent_clinic_updates;
    }
    if (typeof body.opt_out_newsletter === "boolean") {
      intakeData.opt_out_newsletter = body.opt_out_newsletter;
    }

    // JSON fields (complaints, review_of_systems)
    if (body.complaints && Array.isArray(body.complaints)) {
      intakeData.complaints = body.complaints;
    }
    if (body.review_of_systems && typeof body.review_of_systems === "object") {
      intakeData.review_of_systems = body.review_of_systems;
    }

    // Insert intake form
    const { data, error } = await supabase
      .from("intake_forms")
      .insert(intakeData)
      .select("id")
      .single();

    if (error) {
      console.error("[submit-intake-form] Database error:", error);
      await recordRateLimitUsage(SERVICE_TYPE, false);
      return new Response(
        JSON.stringify({ error: "Failed to submit intake form" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[submit-intake-form] Intake created successfully:", data.id);
    await recordRateLimitUsage(SERVICE_TYPE, true);

    // Check if a matching care request already exists (by name or email)
    const normalizedName = (patientName || "").toLowerCase().trim();
    const normalizedEmail = (email || "").toLowerCase().trim();
    
    let existingCareRequest = null;
    
    // Search for existing care requests by checking intake_payload
    const { data: existingRequests } = await supabase
      .from("care_requests")
      .select("id, intake_payload, status")
      .not("status", "in", '("ARCHIVED","DECLINED","CONVERTED")')
      .is("episode_id", null);
    
    if (existingRequests && existingRequests.length > 0) {
      existingCareRequest = existingRequests.find((cr) => {
        const payload = cr.intake_payload as Record<string, unknown> || {};
        const crName = ((payload.name as string) || (payload.patient_name as string) || "").toLowerCase().trim();
        const crEmail = ((payload.email as string) || "").toLowerCase().trim();
        
        // Match by name OR email
        return (crName && crName === normalizedName) || 
               (normalizedEmail && crEmail && crEmail === normalizedEmail);
      });
    }
    
    if (existingCareRequest) {
      console.log("[submit-intake-form] Found matching care request:", existingCareRequest.id);
      
      // Log lifecycle event for form submission
      await supabase.from("lifecycle_events").insert({
        entity_type: "CARE_REQUEST",
        entity_id: existingCareRequest.id,
        event_type: "LEGAL_FORMS_RECEIVED",
        actor_type: "patient",
        metadata: { intake_form_id: data.id, source: "patient_submission" }
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          intake_id: data.id,
          access_code: accessCode,
          care_request_id: existingCareRequest.id,
          matched: true,
          mode: "matched_existing"
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // No matching care request found - auto-create one
    // This enables Front Desk QR workflow where patients submit forms before any care request exists
    console.log("[submit-intake-form] No matching care request found, auto-creating one");
    
    // Get default admin for owner assignment
    const { data: adminUser } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .single();

    // Create care request with full payload snapshot
    // Source is FRONT_DESK_QR to indicate this came from patient-initiated form submission
    const { data: careRequest, error: crError } = await supabase
      .from("care_requests")
      .insert({
        status: "SUBMITTED",
        admin_owner_id: adminUser?.user_id || null,
        source: "FRONT_DESK_QR",
        intake_payload: {
          ...intakeData,
          name: patientName,
          patient_name: patientName,
        },
        primary_complaint: chiefComplaint,
      })
      .select("id")
      .single();

    if (crError) {
      console.error("[submit-intake-form] Care request creation error:", crError);
      // Return success for intake, but note the care request failure
      return new Response(
        JSON.stringify({ 
          success: true, 
          intake_id: data.id,
          access_code: accessCode,
          care_request_id: null,
          mode: "intake_only",
          warning: "Care request could not be created"
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log lifecycle event
    await supabase.from("lifecycle_events").insert({
      entity_type: "CARE_REQUEST",
      entity_id: careRequest.id,
      event_type: "CARE_REQUEST_CREATED_FROM_INTAKE",
      actor_type: "system",
      metadata: { 
        intake_form_id: data.id, 
        source: "front_desk_qr",
        auto_created: true 
      }
    });

    console.log("[submit-intake-form] Care request auto-created:", careRequest.id);

    // Handle referral code update if present (legacy support)
    const referralCode = sanitizeString(body.referral_code, 50);
    if (referralCode && email) {
      try {
        await supabase
          .from("patient_referrals")
          .update({
            referred_patient_email: email.toLowerCase(),
            referred_patient_name: patientName,
            intake_form_id: data.id,
            status: "completed",
            intake_submitted_at: new Date().toISOString(),
          })
          .eq("referral_code", referralCode);
      } catch (refErr) {
        console.error("[submit-intake-form] Referral update error (non-fatal):", refErr);
      }
    }

    // Audit log (non-blocking)
    try {
      await supabase.from("audit_logs").insert({
        action: "intake_form_submitted_via_api",
        table_name: "intake_forms",
        record_id: data.id,
        ip_address: clientIp,
        new_data: {
          patient_name: patientName,
          email: email?.toLowerCase(),
          source: "submit-intake-form-api",
          care_request_id: careRequest.id,
        },
      });
    } catch (auditErr) {
      console.error("[submit-intake-form] Audit log error (non-fatal):", auditErr);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        intake_id: data.id,
        access_code: accessCode,
        care_request_id: careRequest.id,
        auto_created: true,
        mode: "auto_created"
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[submit-intake-form] Unexpected error:", err);
    await recordRateLimitUsage(SERVICE_TYPE, false);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
