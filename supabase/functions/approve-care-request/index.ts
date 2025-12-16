import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ApproveRequest {
  careRequestId: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    let actorId: string | null = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      actorId = user?.id || null;
    }

    const { careRequestId }: ApproveRequest = await req.json();

    if (!careRequestId) {
      return new Response(
        JSON.stringify({ error: "careRequestId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[approve-care-request] Processing request:", careRequestId);

    // Fetch the care request
    const { data: careRequest, error: fetchError } = await supabase
      .from("care_requests")
      .select("*")
      .eq("id", careRequestId)
      .single();

    if (fetchError || !careRequest) {
      console.error("[approve-care-request] Care request not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Care request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate status
    if (careRequest.status === "APPROVED_FOR_CARE") {
      return new Response(
        JSON.stringify({ error: "Care request already approved" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (careRequest.status === "ARCHIVED") {
      return new Response(
        JSON.stringify({ error: "Cannot approve archived care request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate clinician assigned
    if (!careRequest.assigned_clinician_id) {
      return new Response(
        JSON.stringify({ error: "Clinician must be assigned before approval" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = careRequest.intake_payload as Record<string, unknown>;
    const patientName = (payload?.patient_name || payload?.legalName || "Unknown Patient") as string;
    const patientEmail = (payload?.email as string)?.toLowerCase();
    const patientPhone = payload?.phone as string;

    // Start transaction - create patient account if needed
    let patientId: string | null = null;

    // Check for existing patient by email
    if (patientEmail) {
      const { data: existingPatient } = await supabase
        .from("patient_accounts")
        .select("id")
        .eq("email", patientEmail)
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
        console.log("[approve-care-request] Found existing patient:", patientId);
      }
    }

    // Create patient if not found
    if (!patientId) {
      const { data: newPatient, error: patientError } = await supabase
        .from("patient_accounts")
        .insert({
          full_name: patientName,
          email: patientEmail,
          phone: patientPhone,
          date_of_birth: payload?.date_of_birth as string || null,
        })
        .select("id")
        .single();

      if (patientError) {
        console.error("[approve-care-request] Failed to create patient:", patientError);
        return new Response(
          JSON.stringify({ error: "Failed to create patient record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      patientId = newPatient.id;
      console.log("[approve-care-request] Created new patient:", patientId);

      // Log patient creation
      await supabase.from("lifecycle_events").insert({
        entity_type: "PATIENT",
        entity_id: patientId,
        event_type: "PATIENT_CREATED",
        actor_type: actorId ? "admin" : "system",
        actor_id: actorId,
        metadata: { care_request_id: careRequestId, source: "care_request_approval" }
      });
    }

    // Generate episode ID
    const episodeId = `EP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Determine body region from complaints
    let bodyRegion = "Neurological";
    const complaints = payload?.complaints as Array<{ bodyRegion?: string }>;
    if (complaints && complaints.length > 0 && complaints[0]?.bodyRegion) {
      bodyRegion = complaints[0].bodyRegion;
    }

    // Get clinician info
    const { data: clinicianProfile } = await supabase
      .from("profiles")
      .select("clinician_name, clinic_id")
      .eq("id", careRequest.assigned_clinician_id)
      .single();

    // Create episode
    const { error: episodeError } = await supabase
      .from("episodes")
      .insert({
        id: episodeId,
        patient_name: patientName,
        date_of_service: new Date().toISOString().split("T")[0],
        region: bodyRegion,
        body_region: bodyRegion,
        user_id: careRequest.assigned_clinician_id,
        clinic_id: clinicianProfile?.clinic_id,
        clinician: clinicianProfile?.clinician_name,
        current_status: "active",
        diagnosis: payload?.chief_complaint as string || null,
        injury_date: payload?.injury_date as string || null,
        injury_mechanism: payload?.injury_mechanism as string || null,
        medical_history: payload?.medical_history as string || null,
        medications: payload?.current_medications as string || null,
        date_of_birth: payload?.date_of_birth as string || null,
        episode_type: "Neurological",
      });

    if (episodeError) {
      console.error("[approve-care-request] Failed to create episode:", episodeError);
      return new Response(
        JSON.stringify({ error: "Failed to create episode" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[approve-care-request] Created episode:", episodeId);

    // Log episode creation
    await supabase.from("lifecycle_events").insert({
      entity_type: "EPISODE",
      entity_id: episodeId,
      event_type: "EPISODE_CREATED",
      actor_type: actorId ? "admin" : "system",
      actor_id: actorId,
      metadata: { care_request_id: careRequestId, patient_id: patientId }
    });

    // Create episode intake snapshot (immutable clinical context)
    const { error: snapshotError } = await supabase
      .from("episode_intake_snapshots")
      .insert({
        episode_id: episodeId,
        care_request_id: careRequestId,
        intake_payload: payload,
        created_by: actorId,
      });

    if (snapshotError) {
      console.error("[approve-care-request] Failed to create snapshot:", snapshotError);
      // Non-fatal, continue
    }

    // Grant patient access to episode
    await supabase.from("patient_episode_access").insert({
      patient_id: patientId,
      episode_id: episodeId,
      granted_at: new Date().toISOString(),
      is_active: true,
    });

    // Update care request
    const { error: updateError } = await supabase
      .from("care_requests")
      .update({
        status: "APPROVED_FOR_CARE",
        patient_id: patientId,
        episode_id: episodeId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", careRequestId);

    if (updateError) {
      console.error("[approve-care-request] Failed to update care request:", updateError);
      // Non-fatal, episode was created
    }

    // Log approval
    await supabase.from("lifecycle_events").insert({
      entity_type: "CARE_REQUEST",
      entity_id: careRequestId,
      event_type: "CARE_REQUEST_APPROVED",
      actor_type: actorId ? "admin" : "system",
      actor_id: actorId,
      metadata: { episode_id: episodeId, patient_id: patientId }
    });

    // Notify assigned clinician (non-blocking)
    try {
      await supabase.functions.invoke("send-clinician-notification", {
        body: {
          clinicianId: careRequest.assigned_clinician_id,
          messageType: "new_episode_assigned",
          subject: `New Episode Assigned: ${patientName}`,
          patientName,
          episodeId,
          bodyRegion,
        }
      });
    } catch (notifyError) {
      console.log("[approve-care-request] Clinician notification skipped:", notifyError);
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      action: "care_request_approved",
      table_name: "care_requests",
      record_id: careRequestId,
      user_id: actorId,
      new_data: {
        episode_id: episodeId,
        patient_id: patientId,
        clinician_id: careRequest.assigned_clinician_id,
      },
    });

    console.log("[approve-care-request] Approval complete:", { episodeId, patientId });

    return new Response(
      JSON.stringify({ 
        success: true, 
        episodeId, 
        patientId,
        message: "Care request approved successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[approve-care-request] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
