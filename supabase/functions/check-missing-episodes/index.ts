import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking appointments between ${todayStr} and ${tomorrowStr}`);

    // Find scheduled appointments in the next 24 hours that haven't had an alert sent
    const { data: upcomingAppointments, error: appointmentsError } = await supabase
      .from("intake_appointments")
      .select("id, patient_name, patient_email, scheduled_date, scheduled_time, calendar_connection_id")
      .in("status", ["scheduled", "pending"])
      .gte("scheduled_date", todayStr)
      .lte("scheduled_date", tomorrowStr)
      .is("episode_missing_alert_sent_at", null);

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${upcomingAppointments?.length || 0} upcoming appointments to check`);

    let alertsCreated = 0;
    let notificationsSent = 0;

    for (const appointment of upcomingAppointments || []) {
      // Check if patient has an active episode
      // Match by patient_name since that's the common field
      const { data: activeEpisodes, error: episodesError } = await supabase
        .from("episodes")
        .select("id, patient_name, current_status")
        .eq("patient_name", appointment.patient_name)
        .in("current_status", ["active", "open", "in_progress"]);

      if (episodesError) {
        console.error(`Error checking episodes for ${appointment.patient_name}:`, episodesError);
        continue;
      }

      // If no active episode found, create alert
      if (!activeEpisodes || activeEpisodes.length === 0) {
        console.log(`No active episode for patient ${appointment.patient_name}, creating alert`);

        // Get clinician info if available
        let clinicianName = "Unassigned";
        if (appointment.calendar_connection_id) {
          const { data: connection } = await supabase
            .from("google_calendar_connections")
            .select("user_id")
            .eq("id", appointment.calendar_connection_id)
            .maybeSingle();

          if (connection?.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, clinician_name, email")
              .eq("id", connection.user_id)
              .maybeSingle();

            if (profile) {
              clinicianName = profile.clinician_name || profile.full_name || "Unassigned";
            }
          }
        }

        // Check if alert already exists for this appointment
        const { data: existingAlert } = await supabase
          .from("missing_episode_alerts")
          .select("id")
          .eq("appointment_id", appointment.id)
          .maybeSingle();

        if (existingAlert) {
          console.log(`Alert already exists for appointment ${appointment.id}`);
          continue;
        }

        // Create the alert
        const { error: alertError } = await supabase
          .from("missing_episode_alerts")
          .insert({
            appointment_id: appointment.id,
            patient_name: appointment.patient_name,
            scheduled_date: appointment.scheduled_date,
            scheduled_time: appointment.scheduled_time,
            clinician_name: clinicianName,
            alert_type: "missing_episode_for_appointment",
            status: "pending",
          });

        if (alertError) {
          console.error(`Error creating alert for appointment ${appointment.id}:`, alertError);
          continue;
        }

        // Update appointment to mark alert as sent
        await supabase
          .from("intake_appointments")
          .update({ episode_missing_alert_sent_at: new Date().toISOString() })
          .eq("id", appointment.id);

        alertsCreated++;

        // Send email notification to admin/clinicians if Resend is configured
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);

          // Get admin emails from clinician notification preferences
          const { data: adminPrefs } = await supabase
            .from("clinician_notification_preferences")
            .select("notification_email, user_id")
            .eq("email_enabled", true);

          const adminEmails: string[] = [];
          for (const pref of adminPrefs || []) {
            if (pref.notification_email) {
              adminEmails.push(pref.notification_email);
            } else {
              // Get email from profile
              const { data: profile } = await supabase
                .from("profiles")
                .select("email")
                .eq("id", pref.user_id)
                .maybeSingle();
              if (profile?.email) {
                adminEmails.push(profile.email);
              }
            }
          }

          if (adminEmails.length > 0) {
            try {
              await resend.emails.send({
                from: "PPC Outcome Registry <notifications@resend.dev>",
                to: adminEmails,
                subject: `⚠️ Episode Missing: ${appointment.patient_name} has appointment ${appointment.scheduled_date}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
                      <h2 style="color: #92400e; margin: 0 0 10px 0;">⚠️ Episode Missing for Upcoming Appointment</h2>
                      <p style="color: #78350f; margin: 0;">This patient has a scheduled visit but no active Episode in the PPC Outcome Registry.</p>
                    </div>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                      <h3 style="margin-top: 0;">Appointment Details</h3>
                      <p><strong>Patient:</strong> ${appointment.patient_name}</p>
                      <p><strong>Date:</strong> ${appointment.scheduled_date}</p>
                      <p><strong>Time:</strong> ${appointment.scheduled_time}</p>
                      <p><strong>Clinician:</strong> ${clinicianName}</p>
                    </div>
                    
                    <div style="background-color: #e0e7ff; padding: 15px; border-radius: 8px;">
                      <h4 style="color: #3730a3; margin-top: 0;">Action Required</h4>
                      <p style="color: #4338ca;">Please create an Episode for this patient before their visit to ensure proper care documentation.</p>
                    </div>
                    
                    <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">— PPC Outcome Registry</p>
                  </div>
                `,
              });
              notificationsSent++;
              console.log(`Email notification sent for ${appointment.patient_name}`);
            } catch (emailError) {
              console.error("Failed to send email notification:", emailError);
            }
          }
        }
      } else {
        console.log(`Patient ${appointment.patient_name} has ${activeEpisodes.length} active episode(s)`);
      }
    }

    console.log(`Check complete: ${alertsCreated} alerts created, ${notificationsSent} notifications sent`);

    return new Response(
      JSON.stringify({
        success: true,
        appointmentsChecked: upcomingAppointments?.length || 0,
        alertsCreated,
        notificationsSent,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in check-missing-episodes:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
