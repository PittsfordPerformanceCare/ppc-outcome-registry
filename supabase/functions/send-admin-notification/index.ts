import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  notificationType: "intake_converted" | "episode_discharged";
  senderName: string;
  senderId: string;
  patientName: string;
  entityId: string;
  entityType: string;
  additionalDetails?: Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: AdminNotificationRequest = await req.json();
    const { notificationType, senderName, senderId, patientName, entityId, entityType, additionalDetails } = body;

    console.log("Processing admin notification:", { notificationType, senderName, patientName, entityId });

    // Get Jennifer's profile (admin who needs to be notified)
    // We look for admins who should receive clinical activity notifications
    const { data: adminProfiles, error: adminError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", "jennifer@pittsfordperformancecare.com");

    if (adminError) {
      console.error("Error fetching admin profiles:", adminError);
      throw adminError;
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log("No admin profiles found to notify");
      return new Response(
        JSON.stringify({ success: true, message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate notification content based on type
    let title: string;
    let message: string;
    let emailSubject: string;
    let emailBody: string;

    if (notificationType === "intake_converted") {
      title = "New Episode Created";
      message = `${senderName} converted ${patientName}'s intake to an active episode.`;
      emailSubject = `📋 New Episode: ${patientName}`;
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a1628;">New Episode Created</h2>
          <p><strong>${senderName}</strong> has converted an intake form into an active episode for:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Patient:</strong> ${patientName}</p>
            ${additionalDetails?.region ? `<p style="margin: 8px 0 0 0;"><strong>Region:</strong> ${additionalDetails.region}</p>` : ""}
            ${additionalDetails?.diagnosis ? `<p style="margin: 8px 0 0 0;"><strong>Diagnosis:</strong> ${additionalDetails.diagnosis}</p>` : ""}
          </div>
          <p>Log in to the Registry to view the episode details.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">— Pittsford Performance Care Registry</p>
        </div>
      `;
    } else if (notificationType === "episode_discharged") {
      title = "Episode Discharged";
      message = `${senderName} discharged ${patientName}'s episode.`;
      emailSubject = `✅ Episode Discharged: ${patientName}`;
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a1628;">Episode Discharged</h2>
          <p><strong>${senderName}</strong> has discharged the following patient's episode:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Patient:</strong> ${patientName}</p>
            ${additionalDetails?.region ? `<p style="margin: 8px 0 0 0;"><strong>Region:</strong> ${additionalDetails.region}</p>` : ""}
            ${additionalDetails?.outcome ? `<p style="margin: 8px 0 0 0;"><strong>Outcome:</strong> ${additionalDetails.outcome}</p>` : ""}
            ${additionalDetails?.dischargeDate ? `<p style="margin: 8px 0 0 0;"><strong>Discharge Date:</strong> ${additionalDetails.dischargeDate}</p>` : ""}
          </div>
          <p>Log in to the Registry to review the discharge details or send the PCP summary.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">— Pittsford Performance Care Registry</p>
        </div>
      `;
    } else {
      throw new Error(`Unknown notification type: ${notificationType}`);
    }

    // Create in-app notification and send email for each admin
    for (const admin of adminProfiles) {
      // Skip if the sender is the same as the admin (don't notify yourself)
      if (admin.id === senderId) {
        console.log(`Skipping self-notification for ${admin.full_name}`);
        continue;
      }

      // Create in-app notification
      const { error: notifError } = await supabase
        .from("admin_notifications")
        .insert({
          recipient_id: admin.id,
          sender_id: senderId,
          notification_type: notificationType,
          title,
          message,
          entity_type: entityType,
          entity_id: entityId,
          patient_name: patientName,
        });

      if (notifError) {
        console.error(`Error creating notification for ${admin.full_name}:`, notifError);
      } else {
        console.log(`In-app notification created for ${admin.full_name}`);
      }

      // Send email notification
      if (admin.email) {
        try {
          const emailResult = await resend.emails.send({
            from: "PPC Registry <notifications@resend.dev>",
            to: [admin.email],
            subject: emailSubject,
            html: emailBody,
          });
          console.log(`Email sent to ${admin.email}:`, emailResult);
        } catch (emailError) {
          console.error(`Error sending email to ${admin.email}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, notifiedCount: adminProfiles.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-admin-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
