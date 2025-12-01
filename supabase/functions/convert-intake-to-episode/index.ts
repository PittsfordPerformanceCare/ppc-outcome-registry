import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConvertIntakeRequest {
  intakeFormId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intakeFormId }: ConvertIntakeRequest = await req.json();
    
    console.log("Converting intake to episode:", intakeFormId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the intake form
    const { data: intakeForm, error: intakeError } = await supabase
      .from("intake_forms")
      .select("*")
      .eq("id", intakeFormId)
      .single();

    if (intakeError || !intakeForm) {
      console.error("Intake form not found:", intakeError);
      throw new Error("Intake form not found");
    }

    // Check if already converted
    if (intakeForm.converted_to_episode_id) {
      console.log("Intake already converted to episode:", intakeForm.converted_to_episode_id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Already converted",
          episodeId: intakeForm.converted_to_episode_id 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find the pending episode linked to this intake via referral inquiry
    const { data: pendingEpisodes } = await supabase
      .from("pending_episodes")
      .select("*, referral_inquiries!inner(access_code)")
      .eq("status", "intake_pending")
      .limit(100);

    let pendingEpisode = null;
    if (pendingEpisodes) {
      // Match by patient name and intake form access code
      for (const pe of pendingEpisodes) {
        if (pe.patient_name === intakeForm.patient_name || 
            (pe.referral_inquiries && pe.referral_inquiries.access_code === intakeForm.access_code)) {
          pendingEpisode = pe;
          break;
        }
      }
    }

    // Determine the clinician (from pending episode or default to first admin)
    let userId = pendingEpisode?.user_id;
    let clinicId = pendingEpisode?.clinic_id;

    if (!userId) {
      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id, profiles!inner(clinic_id)")
        .eq("role", "admin")
        .limit(1);
      
      if (admins && admins.length > 0) {
        userId = admins[0].user_id;
        const adminProfile = admins[0].profiles as any;
        clinicId = adminProfile?.clinic_id || null;
      }
    }

    if (!userId) {
      throw new Error("No clinician available to assign episode");
    }

    // Get clinician name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, clinician_name")
      .eq("id", userId)
      .single();

    const clinicianName = profile?.clinician_name || profile?.full_name || "Your Clinician";

    // Parse complaints JSON to extract primary region
    let primaryRegion = pendingEpisode?.body_region || intakeForm.chief_complaint?.split(' ')[0] || 'General';
    if (intakeForm.complaints && Array.isArray(intakeForm.complaints)) {
      const complaints = intakeForm.complaints as any[];
      if (complaints.length > 0 && complaints[0].region) {
        primaryRegion = complaints[0].region;
      }
    }

    // Create the full episode
    const episodeId = `EP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: episode, error: episodeError } = await supabase
      .from("episodes")
      .insert({
        id: episodeId,
        user_id: userId,
        clinic_id: clinicId,
        patient_name: intakeForm.patient_name,
        date_of_birth: intakeForm.date_of_birth,
        date_of_service: new Date().toISOString().split('T')[0],
        region: primaryRegion,
        diagnosis: intakeForm.chief_complaint,
        injury_date: intakeForm.injury_date,
        injury_mechanism: intakeForm.injury_mechanism,
        pain_level: intakeForm.pain_level?.toString() || null,
        medical_history: intakeForm.medical_history,
        medications: intakeForm.current_medications,
        emergency_contact: intakeForm.emergency_contact_name,
        emergency_phone: intakeForm.emergency_contact_phone,
        insurance: intakeForm.insurance_provider,
        referring_physician: intakeForm.referring_physician,
        source_intake_form_id: intakeFormId,
        current_status: 'ACTIVE_CONSERVATIVE_CARE',
      })
      .select()
      .single();

    if (episodeError) {
      console.error("Error creating episode:", episodeError);
      throw episodeError;
    }

    console.log("Episode created:", episode.id);

    // Update intake form with converted episode ID
    await supabase
      .from("intake_forms")
      .update({ 
        converted_to_episode_id: episode.id,
        status: 'converted'
      })
      .eq("id", intakeFormId);

    // Update pending episode if it exists
    if (pendingEpisode) {
      await supabase
        .from("pending_episodes")
        .update({
          status: 'converted',
          converted_to_episode_id: episode.id,
          converted_at: new Date().toISOString(),
        })
        .eq("id", pendingEpisode.id);
    }

    // Get clinic settings for email templates
    const { data: clinicSettings } = await supabase
      .from("clinic_settings")
      .select("*")
      .limit(1)
      .single();

    const settings = clinicSettings || {
      clinic_name: "PPC Outcome Registry",
      phone: "",
      address: "",
      intake_complete_welcome_subject: "Welcome to {{clinic_name}} – Here's What Happens Next",
      intake_complete_welcome_template: "",
      send_scheduling_email: false,
    };

    // Send welcome email to patient
    if (intakeForm.email) {
      const welcomeSubject = settings.intake_complete_welcome_subject
        .replace(/\{\{clinic_name\}\}/g, settings.clinic_name);

      const welcomeBody = (settings.intake_complete_welcome_template || "")
        .replace(/\{\{clinic_name\}\}/g, settings.clinic_name)
        .replace(/\{\{patient_name\}\}/g, intakeForm.patient_name)
        .replace(/\{\{clinician_name\}\}/g, clinicianName)
        .replace(/\{\{episode_type\}\}/g, pendingEpisode?.episode_type || 'MSK')
        .replace(/\{\{body_region\}\}/g, primaryRegion)
        .replace(/\{\{clinic_phone\}\}/g, settings.phone || '')
        .replace(/\{\{clinic_address\}\}/g, settings.address || '');

      await supabase.functions.invoke("send-intake-notification", {
        body: {
          patientName: intakeForm.patient_name,
          patientEmail: intakeForm.email,
          clinicianName: clinicianName,
          episodeId: episode.id,
          customSubject: welcomeSubject,
          customBody: welcomeBody,
        },
      });

      console.log("Welcome email sent to patient");

      // Send scheduling email if enabled
      if (settings.send_scheduling_email && settings.intake_complete_scheduling_template) {
        const scheduleSubject = (settings.intake_complete_scheduling_subject || "")
          .replace(/\{\{clinic_name\}\}/g, settings.clinic_name);

        const scheduleBody = settings.intake_complete_scheduling_template
          .replace(/\{\{clinic_name\}\}/g, settings.clinic_name)
          .replace(/\{\{patient_name\}\}/g, intakeForm.patient_name)
          .replace(/\{\{clinic_phone\}\}/g, settings.phone || '');

        await supabase.functions.invoke("send-intake-notification", {
          body: {
            patientName: intakeForm.patient_name,
            patientEmail: intakeForm.email,
            clinicianName: clinicianName,
            episodeId: episode.id,
            customSubject: scheduleSubject,
            customBody: scheduleBody,
          },
        });

        console.log("Scheduling email sent to patient");
      }
    }

    // Notify clinician
    await supabase.functions.invoke("send-clinician-notification", {
      body: {
        clinicianId: userId,
        clinicianName: clinicianName,
        messageType: "new_episode_created",
        subject: "New Episode Created – Review Before Visit",
        patientName: intakeForm.patient_name,
        episodeId: episode.id,
        message: `A new ${pendingEpisode?.episode_type || 'MSK'} episode has been created for ${intakeForm.patient_name}. Please review the patient file before their first visit.`,
      },
    });

    console.log("Clinician notification sent");

    // Notify support staff (all admins)
    const { data: supportStaff } = await supabase
      .from("user_roles")
      .select("user_id, profiles!inner(email, full_name)")
      .eq("role", "admin");

    if (supportStaff && supportStaff.length > 0) {
      for (const staff of supportStaff) {
        const staffProfile = staff.profiles as any;
        if (staffProfile?.email) {
          await supabase.functions.invoke("send-clinician-notification", {
            body: {
              clinicianEmail: staffProfile.email,
              clinicianName: staffProfile.full_name || "Support Staff",
              messageType: "patient_ready_for_scheduling",
              subject: "New Patient Ready for Scheduling",
              patientName: intakeForm.patient_name,
              episodeId: episode.id,
              message: `${intakeForm.patient_name} has completed their intake and is ready to be scheduled for their first appointment. Episode Type: ${pendingEpisode?.episode_type || 'MSK'}, Region: ${primaryRegion}.`,
            },
          });
        }
      }
      console.log(`Support staff notifications sent to ${supportStaff.length} staff members`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        episodeId: episode.id,
        message: "Episode created and notifications sent"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in convert-intake-to-episode:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
