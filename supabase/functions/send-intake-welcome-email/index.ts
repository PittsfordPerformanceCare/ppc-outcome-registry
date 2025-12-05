import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntakeWelcomeEmailRequest {
  email: string;
  firstName: string;
}

Deno.serve(async (req) => {
  console.log("send-intake-welcome-email function called");
  
  // Handle CORS preflight requests
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
    const { email, firstName }: IntakeWelcomeEmailRequest = await req.json();
    
    console.log(`Sending intake welcome email to: ${email}, firstName: ${firstName}`);

    if (!email) {
      console.error("No email provided");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const displayName = firstName || "there";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You — We're Getting Everything Ready for Your First Visit</title>
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
              
              <p style="margin: 0 0 20px 0; font-size: 16px;">Thank you for taking the time to begin your New Patient Intake. We know that reaching out for care is an important decision, and we're honored you chose us.</p>
              
              <p style="margin: 0 0 28px 0; font-size: 16px;">Our clinical team is already reviewing the information you submitted. This helps us prepare for your first visit so your evaluation feels focused, personal, and productive.</p>
              
              <!-- What Happens Next -->
              <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1e293b;">What Happens Next</h2>
              
              <!-- Step 1 -->
              <div style="margin-bottom: 24px; padding-left: 20px; border-left: 3px solid #3b82f6;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d4ed8;">1. Clinician Review</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">A doctor or clinician will look over your responses to identify the best evaluation pathway for your needs.</p>
              </div>
              
              <!-- Step 2 -->
              <div style="margin-bottom: 24px; padding-left: 20px; border-left: 3px solid #3b82f6;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d4ed8;">2. Personal Follow-Up From Our Team</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">Our administrative team will contact you shortly to answer questions, review insurance coverage, and help you schedule the best available appointment time.</p>
              </div>
              
              <!-- Step 3 -->
              <div style="margin-bottom: 28px; padding-left: 20px; border-left: 3px solid #3b82f6;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d4ed8;">3. Your First Visit</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">During your first appointment, we'll take extra time to understand your goals, perform a detailed neurologic and musculoskeletal evaluation, and outline a personalized plan of care.</p>
                <p style="margin: 10px 0 0 0; font-size: 15px; color: #475569;">You'll also have time on-site to finalize any details or additional paperwork if needed.</p>
              </div>
              
              <!-- Call to Action -->
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #475569;">If you prefer to speak with someone now:</p>
                <a href="tel:+15852031050" style="color: #1d4ed8; font-size: 18px; font-weight: 600; text-decoration: none;">(585) 203-1050</a>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">We're here to help.</p>
              </div>
              
              <!-- Signature -->
              <p style="margin: 0; font-size: 16px;">Warmly,</p>
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
      subject: "Thank You — We're Getting Everything Ready for Your First Visit",
      html: emailHtml,
    });

    console.log("Intake welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-intake-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
