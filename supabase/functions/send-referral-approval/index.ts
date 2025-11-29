import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";

serve(async (req) => {
  try {
    const { inquiryId, name, email } = await req.json();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get clinic settings for email template
    const { data: settings } = await supabase
      .from("clinic_settings")
      .select("*")
      .limit(1)
      .single();

    if (!settings) {
      throw new Error("Clinic settings not found");
    }

    // Generate intake link
    const intakeLink = `${APP_URL}/patient-intake`;

    // Replace template variables
    let emailBody = settings.referral_approval_email_template || "";
    emailBody = emailBody.replace(/{{name}}/g, name);
    emailBody = emailBody.replace(/{{clinic_name}}/g, settings.clinic_name);
    emailBody = emailBody.replace(/{{intake_link}}/g, intakeLink);

    let subject = settings.referral_approval_email_subject || "Welcome to {{clinic_name}} - Next Steps";
    subject = subject.replace(/{{name}}/g, name);
    subject = subject.replace(/{{clinic_name}}/g, settings.clinic_name);

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${settings.clinic_name} <onboarding@resend.dev>`,
        to: [email],
        subject: subject,
        html: emailBody,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Resend error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Approval email sent" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-referral-approval:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
