import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ThankYouRequest {
  referrerId: string;
  referredPatientName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { referrerId, referredPatientName }: ThankYouRequest = await req.json();

    console.log("Sending referral thank you to:", referrerId);

    // Get referrer details
    const { data: referrer, error: referrerError } = await supabase
      .from("patient_accounts")
      .select("full_name, email")
      .eq("id", referrerId)
      .single();

    if (referrerError || !referrer) {
      throw new Error("Referrer not found");
    }

    // Get clinic settings
    const { data: settings } = await supabase
      .from("clinic_settings")
      .select("clinic_name, phone")
      .single();

    const clinicName = settings?.clinic_name || "Our Clinic";
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
            .message-box { background: white; border-left: 4px solid #0EA5E9; padding: 20px; margin: 20px 0; border-radius: 6px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Thank You, ${referrer.full_name}! 🙏</h1>
            </div>
            <div class="content">
              <div class="message-box">
                <p style="font-size: 16px; margin-top: 0;">
                  We wanted to take a moment to thank you for recommending <strong>${clinicName}</strong> to <strong>${referredPatientName}</strong>.
                </p>
                <p style="font-size: 16px;">
                  Your support means the world to us. When valued patients like you share their positive experiences, it helps others find the care they need.
                </p>
                <p style="font-size: 16px; margin-bottom: 0;">
                  ${referredPatientName} has been approved and will be starting their recovery journey with us soon. Thank you for being part of our community and helping us grow through trust and genuine recommendations.
                </p>
              </div>

              <p style="text-align: center; color: #666; font-style: italic; margin: 30px 0;">
                "The greatest compliment we can receive is a referral from our patients."
              </p>

              <div style="background: #E0F2FE; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0; color: #0369A1; font-size: 14px;">
                  <strong>We appreciate you!</strong><br>
                  Your trust and support help us serve more people in our community.
                </p>
              </div>

              <div class="footer">
                <p>With gratitude,<br><strong>The ${clinicName} Team</strong></p>
                <p>Questions? Call us at ${clinicPhone}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${clinicName} <onboarding@resend.dev>`,
      to: [referrer.email],
      subject: `Thank You for Your Referral! 🙏`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("Thank you email sent successfully");

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
    console.error("Error in send-referral-thank-you:", error);
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
