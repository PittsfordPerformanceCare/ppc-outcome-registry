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

    const { intakeId, leadId, patientName, patientEmail } = await req.json();

    console.log("Processing intake completion:", { intakeId, leadId, patientName, patientEmail });

    // Send patient confirmation email
    if (patientEmail) {
      const patientEmailResult = await resend.emails.send({
        from: "Pittsford Performance Care <notifications@resend.dev>",
        to: [patientEmail],
        subject: "Thank You - We're Reviewing Your Intake",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0a1628;">Thank You, ${patientName || ""}!</h1>
            <p>We've received your neurologic intake form and our clinical team is now reviewing your information.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; margin-top: 0;">What happens next?</h2>
              <ul style="color: #4b5563;">
                <li>Our clinical team will review your intake within 24-48 hours</li>
                <li>You'll receive an email once your case has been reviewed</li>
                <li>We'll contact you to schedule your first appointment</li>
              </ul>
            </div>
            <p>If you have any urgent concerns, please call us directly.</p>
            <p style="margin-top: 30px;">— Pittsford Performance Care Team</p>
          </div>
        `,
      });
      console.log("Patient email sent:", patientEmailResult);
    }

    // Get intake details with lead info for clinician notification
    const { data: intake } = await supabase
      .from("intakes")
      .select("*, lead:leads(severity_score, system_category)")
      .eq("id", intakeId)
      .single();

    // Get clinician notification emails
    const { data: clinicians } = await supabase
      .from("clinician_notification_preferences")
      .select("notification_email, user_id, profiles:user_id(email)")
      .eq("email_enabled", true);

    // Send clinician notifications
    if (clinicians && clinicians.length > 0) {
      for (const clinician of clinicians) {
        const email = clinician.notification_email || (clinician.profiles as any)?.email;
        if (email) {
          const severityLabel = intake?.lead?.severity_score 
            ? intake.lead.severity_score <= 16 ? "Mild"
              : intake.lead.severity_score <= 32 ? "Moderate"
              : intake.lead.severity_score <= 48 ? "Significant"
              : "Severe"
            : "Unknown";

          await resend.emails.send({
            from: "PPC Notifications <notifications@resend.dev>",
            to: [email],
            subject: `New Intake Ready for Review: ${patientName || "New Patient"}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #0a1628;">New Intake Submitted</h1>
                <p>A new neurologic intake has been submitted and is ready for your review.</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Patient:</strong> ${patientName || "Not provided"}</p>
                  <p><strong>Email:</strong> ${patientEmail || "Not provided"}</p>
                  <p><strong>Severity Score:</strong> ${intake?.lead?.severity_score || "N/A"} (${severityLabel})</p>
                  <p><strong>Primary System:</strong> ${intake?.lead?.system_category || "N/A"}</p>
                </div>
                <p>Log in to the Registry to review and approve this intake.</p>
              </div>
            `,
          });
          console.log("Clinician notification sent to:", email);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-intake-completion:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});