import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  intakeFormId: string;
  patientEmail: string;
  patientName: string;
  clinicianName: string;
  nextSteps?: string;
  clinicName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { intakeFormId, patientEmail, patientName, clinicianName, nextSteps, clinicName }: NotificationRequest = 
      await req.json();

    console.log("Sending post-review notification for intake:", intakeFormId);

    // Get clinic settings
    const { data: settings } = await supabase
      .from("clinic_settings")
      .select("clinic_name, phone")
      .single();

    const finalClinicName = clinicName || settings?.clinic_name || "Our Clinic";
    const clinicPhone = settings?.phone || "(555) 123-4567";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .highlight-box { background: linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 100%); border-left: 4px solid #0EA5E9; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .next-steps { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #0EA5E9; }
            .button { display: inline-block; background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            .emoji { font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🎉</div>
              <h1 style="margin: 10px 0;">Great News, ${patientName}!</h1>
            </div>
            <div class="content">
              <div class="highlight-box">
                <h2 style="margin-top: 0; color: #0EA5E9;">You're a Perfect Fit!</h2>
                <p style="font-size: 16px; margin: 0;">
                  <strong>${clinicianName}</strong> has reviewed your intake form and you're an excellent candidate for our physical therapy program at <strong>${finalClinicName}</strong>.
                </p>
              </div>

              <div class="next-steps">
                <h3 style="color: #1f2937; margin-top: 0;">📋 What Happens Next?</h3>
                ${nextSteps || `
                  <ul style="color: #4b5563; line-height: 1.8;">
                    <li>We'll contact you within 24 hours to schedule your first appointment</li>
                    <li>Bring your insurance card and ID to your first visit</li>
                    <li>Wear comfortable clothing you can move in</li>
                    <li>Be ready to discuss your treatment goals with your therapist</li>
                  </ul>
                `}
              </div>

              <p style="font-size: 16px;">
                We're excited to partner with you on your recovery journey. Our team is committed to helping you achieve your health and wellness goals.
              </p>

              <p style="text-align: center; margin: 30px 0;">
                <a href="tel:${clinicPhone}" class="button">📞 Call Us: ${clinicPhone}</a>
              </p>

              <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #92400E;">
                  <strong>💡 Pro Tip:</strong> Have questions before your appointment? Don't hesitate to call us at <strong>${clinicPhone}</strong>. We're here to help!
                </p>
              </div>

              <div class="footer">
                <p>This email was sent by ${finalClinicName}</p>
                <p>If you have any questions, please contact us at ${clinicPhone}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${finalClinicName} <onboarding@resend.dev>`,
      to: [patientEmail],
      subject: `Welcome to ${finalClinicName} - You're Approved! 🎉`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("Post-review notification sent successfully");

    return new Response(
      JSON.stringify({
        success: true,
        emailSent: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-post-review-notification:", error);
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
