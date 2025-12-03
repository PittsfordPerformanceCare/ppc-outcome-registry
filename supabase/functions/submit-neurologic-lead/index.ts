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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    
    // Validate required fields
    if (!body.email || !body.persona) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email and persona" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the lead
    const { data, error } = await supabase
      .from("neurologic_intake_leads")
      .insert({
        email: body.email,
        persona: body.persona,
        name: body.name || null,
        phone: body.phone || null,
        primary_concern: body.primary_concern || null,
        symptom_profile: body.symptom_profile || null,
        duration: body.duration || null,
        parent_name: body.parent_name || null,
        child_name: body.child_name || null,
        child_age: body.child_age || null,
        symptom_location: body.symptom_location || null,
        referrer_name: body.referrer_name || null,
        role: body.role || null,
        organization: body.organization || null,
        patient_name: body.patient_name || null,
        patient_age: body.patient_age || null,
        urgency: body.urgency || "routine",
        notes: body.notes || null,
        source: body.source || "external",
        status: "new",
        // UTM tracking
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        utm_content: body.utm_content || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting lead:", error);
      return new Response(
        JSON.stringify({ error: "Failed to submit lead", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Lead submitted successfully:", data.id);

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
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
