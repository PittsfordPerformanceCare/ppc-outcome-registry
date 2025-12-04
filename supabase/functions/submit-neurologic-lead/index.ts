import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== Neurologic Lead Submission Request ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));
    
    // Flexible field mapping - support various field name formats
    const email = body.email || body.Email || body.EMAIL || body.patient_email || body.patientEmail;
    const persona = body.persona || body.Persona || "self"; // Default to "self" if not provided
    const name = body.name || body.Name || body.full_name || body.fullName || body.patient_name || body.patientName;
    const phone = body.phone || body.Phone || body.patient_phone || body.patientPhone;
    const primaryConcern = body.primary_concern || body.primaryConcern || body.concern || body.Concern || body.symptoms || body.Symptoms || body.chief_complaint || body.chiefComplaint;
    const symptomProfile = body.symptom_profile || body.symptomProfile || body.symptoms || body.symptom_list || body.symptomList;
    const duration = body.duration || body.Duration || body.symptom_duration || body.symptomDuration;
    const source = body.source || body.Source || body.referral_source || body.referralSource || "pillar-app";
    
    // UTM tracking fields
    const utmSource = body.utm_source || body.utmSource || null;
    const utmMedium = body.utm_medium || body.utmMedium || null;
    const utmCampaign = body.utm_campaign || body.utmCampaign || null;
    const utmContent = body.utm_content || body.utmContent || null;

    // Validate required fields
    if (!email) {
      console.error("Missing email field. Body keys:", Object.keys(body));
      return new Response(
        JSON.stringify({ 
          error: "Missing required field: email",
          receivedFields: Object.keys(body),
          hint: "Please include an 'email' field in your request"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Parsed data:", { email, persona, name, source });

    // Insert the lead
    const { data, error } = await supabase
      .from("neurologic_intake_leads")
      .insert({
        email: email,
        persona: persona,
        name: name || null,
        phone: phone || null,
        primary_concern: primaryConcern || null,
        symptom_profile: symptomProfile || null,
        duration: duration || null,
        parent_name: body.parent_name || body.parentName || null,
        child_name: body.child_name || body.childName || null,
        child_age: body.child_age || body.childAge || null,
        symptom_location: body.symptom_location || body.symptomLocation || null,
        referrer_name: body.referrer_name || body.referrerName || null,
        role: body.role || body.Role || null,
        organization: body.organization || body.Organization || null,
        patient_name: body.patient_name || body.patientName || null,
        patient_age: body.patient_age || body.patientAge || null,
        urgency: body.urgency || body.Urgency || "routine",
        notes: body.notes || body.Notes || body.additional_info || body.additionalInfo || null,
        source: source,
        status: "new",
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting lead:", error);
      
      // Log failed lead submission to audit_logs
      await supabase.from("audit_logs").insert({
        action: "lead_submission_failed",
        table_name: "neurologic_intake_leads",
        record_id: `lead_fail_${Date.now()}`,
        new_data: {
          email: email,
          persona: persona,
          error_message: error.message,
          error_code: error.code,
          source: source,
          timestamp: new Date().toISOString(),
        },
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to submit lead", 
          details: error.message,
          code: error.code 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Lead submitted successfully:", data.id);
    
    // Log successful lead submission
    await supabase.from("audit_logs").insert({
      action: "lead_submission_success",
      table_name: "neurologic_intake_leads",
      record_id: data.id,
      new_data: {
        lead_id: data.id,
        email: email,
        persona: persona,
        source: source,
        timestamp: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Lead submitted successfully",
        leadId: data.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error processing request:", err);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});