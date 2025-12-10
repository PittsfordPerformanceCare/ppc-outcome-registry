import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingEmailRequest {
  email: string;
  patientName: string;
  leadId: string;
}

Deno.serve(async (req) => {
  console.log("send-onboarding-email function called");
  
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
    const { email, patientName, leadId }: OnboardingEmailRequest = await req.json();
    
    console.log(`Sending onboarding email to: ${email}, name: ${patientName}, leadId: ${leadId}`);

    if (!email) {
      console.error("No email provided");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const displayName = patientName || "there";
    const appUrl = Deno.env.get("APP_URL") || "https://pittsfordperformancecare.com";
    const intakeFormUrl = `${appUrl}/intake/start`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Pittsford Performance Care — Your New Patient Forms & First Visit Guide</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Pittsford Performance Care</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Neurology • MSK • Performance</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${displayName},</p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px;">We're excited to welcome you to Pittsford Performance Care! To help us prepare for your first visit, please complete your New Patient Intake Forms using the button below.</p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${intakeFormUrl}" style="display: inline-block; background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Complete Your Intake Forms</a>
              </div>
              
              <!-- What to Expect Section -->
              <h2 style="margin: 32px 0 20px 0; font-size: 20px; font-weight: 600; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">What to Expect at Your First Visit</h2>
              
              <div style="margin-bottom: 20px; padding-left: 20px; border-left: 3px solid #3b82f6;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d4ed8;">📍 Please Arrive 10 Minutes Early</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">This gives you time to check in and get comfortable before your evaluation begins.</p>
              </div>
              
              <div style="margin-bottom: 20px; padding-left: 20px; border-left: 3px solid #3b82f6;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d4ed8;">📋 Bring Any Relevant Documents</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">Please bring any imaging (MRIs, X-rays), previous medical records, or referral paperwork that may be helpful.</p>
              </div>
              
              <div style="margin-bottom: 20px; padding-left: 20px; border-left: 3px solid #3b82f6;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d4ed8;">🧠 Your Neurologic Evaluation</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">Your evaluation will include a comprehensive neurologic and musculoskeletal assessment. We'll take extra time to understand your symptoms, review your history, and create a personalized plan of care.</p>
              </div>
              
              <div style="margin-bottom: 28px; padding-left: 20px; border-left: 3px solid #3b82f6;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d4ed8;">💬 Questions? We're Here to Help</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">Our team is ready to answer any questions before your appointment.</p>
              </div>
              
              <!-- Contact Info -->
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #475569;">Need to reach us?</p>
                <a href="tel:+15852031050" style="color: #1d4ed8; font-size: 18px; font-weight: 600; text-decoration: none;">(585) 203-1050</a>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">We're here to help.</p>
              </div>
              
              <!-- Signature -->
              <p style="margin: 0; font-size: 16px;">We look forward to seeing you soon!</p>
              <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">The Pittsford Performance Care Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Pittsford Performance Care</p>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">3800 Monroe Ave • Suite 22 • Pittsford, NY 14534</p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Neurology • MSK • Performance</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Pittsford Performance Care <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Pittsford Performance Care — Your New Patient Forms & First Visit Guide",
      html: emailHtml,
    });

    console.log("Onboarding email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-onboarding-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
