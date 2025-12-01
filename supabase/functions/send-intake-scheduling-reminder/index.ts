import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const appUrl = Deno.env.get("APP_URL") || "https://your-app-url.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  intakeId: string;
  patientName: string;
  patientEmail: string;
  reminderNumber: 1 | 2;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intakeId, patientName, patientEmail, reminderNumber }: ReminderRequest = await req.json();

    console.log(`Sending reminder ${reminderNumber} to ${patientEmail} for intake ${intakeId}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get clinic settings for branding
    const { data: clinicSettings } = await supabase
      .from('clinic_settings')
      .select('*')
      .single();

    const clinicName = clinicSettings?.clinic_name || "Our Clinic";
    const clinicPhone = clinicSettings?.phone || "";
    const clinicEmail = clinicSettings?.email || "";

    // Prepare email content based on reminder number
    let subject: string;
    let htmlContent: string;

    if (reminderNumber === 1) {
      // First reminder - friendly and encouraging
      subject = `${patientName}, You're Ready to Schedule Your Appointment`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You're Ready to Schedule!</h2>
          <p>Hi ${patientName},</p>
          <p>Thank you for completing your intake form with ${clinicName}. We're excited to help you on your journey to better health!</p>
          <p><strong>Your next step:</strong> Schedule your first appointment to get started.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Schedule My Appointment
            </a>
          </div>
          <p>If you have any questions or need assistance scheduling, please don't hesitate to contact us:</p>
          <ul style="list-style: none; padding: 0;">
            ${clinicPhone ? `<li>📞 ${clinicPhone}</li>` : ''}
            ${clinicEmail ? `<li>📧 ${clinicEmail}</li>` : ''}
          </ul>
          <p>We look forward to seeing you soon!</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Best regards,<br>
            The ${clinicName} Team
          </p>
        </div>
      `;
    } else {
      // Second reminder - more personal and urgent
      subject = `${patientName}, We've Held Space for You`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">We've Reserved a Spot for You</h2>
          <p>Hi ${patientName},</p>
          <p>We noticed you haven't scheduled your appointment yet, and we wanted to reach out personally.</p>
          <p><strong>Good news:</strong> We've held space in our schedule specifically for you. Click below to reserve your preferred time slot before it fills up.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reserve My Spot Now
            </a>
          </div>
          <p>Taking this step is important, and we're here to support you every step of the way.</p>
          <p><strong>Need help scheduling?</strong> Give us a call or reply to this email - we're happy to assist!</p>
          <ul style="list-style: none; padding: 0;">
            ${clinicPhone ? `<li>📞 ${clinicPhone}</li>` : ''}
            ${clinicEmail ? `<li>📧 ${clinicEmail}</li>` : ''}
          </ul>
          <p>We're looking forward to meeting you and starting your care journey together.</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Warmly,<br>
            The ${clinicName} Team
          </p>
        </div>
      `;
    }

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${clinicName} <onboarding@resend.dev>`,
        to: [patientEmail],
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error sending reminder email:", data);
      throw new Error(data.message || "Failed to send reminder");
    }

    console.log(`Reminder ${reminderNumber} sent successfully to ${patientEmail}`);

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-intake-scheduling-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});