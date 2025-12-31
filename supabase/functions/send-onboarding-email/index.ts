import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OnboardingEmailRequest {
  email: string;
  patientName: string;
  leadId: string;
  templateType: "neuro" | "msk";
}

function getNeuroTemplate(displayName: string, intakeFormUrl: string): { subject: string; html: string } {
  const subject = "Welcome to Pittsford Performance Care — Your Neurologic Evaluation & Intake Forms";
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Pittsford Performance Care</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Neurologic Evaluation</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${displayName},</p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px;">We're looking forward to meeting you for your upcoming <strong>Neurologic Evaluation</strong> at Pittsford Performance Care. Before your first visit, please complete the digital New Patient Intake Forms below. This helps our clinicians prepare for your case and ensures you get the most out of your evaluation.</p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${intakeFormUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Complete Your Intake Forms</a>
              </div>
              
              <!-- What to Expect Section -->
              <h2 style="margin: 32px 0 20px 0; font-size: 20px; font-weight: 600; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">What to Expect at Your Neurologic Evaluation</h2>
              
              <div style="margin-bottom: 20px; padding-left: 20px; border-left: 3px solid #7c3aed;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #7c3aed;">🧠 Detailed Symptom Conversation</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">A thorough discussion about your symptoms and history to understand your unique presentation.</p>
              </div>
              
              <div style="margin-bottom: 20px; padding-left: 20px; border-left: 3px solid #7c3aed;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #7c3aed;">👁️ Focused Neurologic Examination</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">Tailored examination including evaluation of eye movements, balance, coordination, and autonomic function as appropriate.</p>
              </div>
              
              <div style="margin-bottom: 20px; padding-left: 20px; border-left: 3px solid #7c3aed;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #7c3aed;">📋 History Review</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">Review of any prior injuries, concussion history, or developmental factors (for pediatric cases).</p>
              </div>
              
              <!-- Preparation Section -->
              <h2 style="margin: 32px 0 20px 0; font-size: 20px; font-weight: 600; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Please Plan To:</h2>
              
              <ul style="margin: 0; padding-left: 24px; font-size: 15px; color: #475569;">
                <li style="margin-bottom: 10px;">Arrive <strong>10 minutes early</strong></li>
                <li style="margin-bottom: 10px;">Wear <strong>comfortable clothing</strong></li>
                <li style="margin-bottom: 10px;">Bring any <strong>imaging reports</strong> (X-rays, MRI, CT, etc.) and relevant medical documentation</li>
                <li style="margin-bottom: 10px;">Bring <strong>glasses or contacts</strong> if you wear them</li>
              </ul>
              
              <p style="margin: 24px 0; font-size: 16px; background-color: #f5f3ff; border-radius: 8px; padding: 16px; border-left: 4px solid #7c3aed;">Our goal is to help you understand <strong>why your symptoms are happening</strong> and create a clear path forward with a neurologically grounded plan.</p>
              
              <!-- Contact Info -->
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #475569;">Questions before your visit? We're here to help.</p>
                <a href="tel:+15852031050" style="color: #7c3aed; font-size: 18px; font-weight: 600; text-decoration: none;">(585) 203-1050</a>
              </div>
              
              <!-- Signature -->
              <p style="margin: 24px 0 0 0; font-size: 16px;">Warmly,</p>
              <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">The Pittsford Performance Care Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Pittsford Performance Care</p>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">3800 Monroe Ave • Suite 22 • Pittsford, NY 14534</p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">(585) 203-1050</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  
  return { subject, html };
}

function getMskTemplate(displayName: string, intakeFormUrl: string): { subject: string; html: string } {
  const subject = "Welcome to Pittsford Performance Care — Your Movement-Based MSK Evaluation & Intake Forms";
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">MSK Evaluation</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${displayName},</p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px;">Thank you for choosing Pittsford Performance Care. We're excited to help you begin your <strong>Neurologically Guided MSK Evaluation</strong>. Before your visit, please complete the digital New Patient Intake Forms so our team can review your case and tailor your evaluation to your goals.</p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${intakeFormUrl}" style="display: inline-block; background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Complete Your Intake Forms</a>
              </div>
              
              <!-- What to Expect Section -->
              <h2 style="margin: 32px 0 20px 0; font-size: 20px; font-weight: 600; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">What to Expect at Your MSK Evaluation</h2>
              
              <div style="margin-bottom: 20px; padding-left: 20px; border-left: 3px solid #1d4ed8;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d4ed8;">💬 Symptom Conversation</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">A conversation about your symptoms, movement concerns, and history.</p>
              </div>
              
              <div style="margin-bottom: 20px; padding-left: 20px; border-left: 3px solid #1d4ed8;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d4ed8;">🏃 Movement Assessment</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">Testing of joint function, movement patterns, symmetry, speed, and motor control.</p>
              </div>
              
              <div style="margin-bottom: 20px; padding-left: 20px; border-left: 3px solid #1d4ed8;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1d4ed8;">🧠 Neurologically Informed MSK Assessment</h3>
                <p style="margin: 0; font-size: 15px; color: #475569;">Determination of whether your symptoms reflect protective patterns, delayed firing, asymmetry, energy inefficiency, or residual effects from prior injuries.</p>
              </div>
              
              <!-- Imaging Note -->
              <div style="margin: 24px 0; padding: 16px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #1d4ed8;">
                <p style="margin: 0; font-size: 15px; color: #475569;"><strong>You do not need imaging to begin treatment</strong>, but if you have any imaging reports (X-rays, MRI, CT, etc.) or prior evaluations, please bring them.</p>
              </div>
              
              <!-- Preparation Section -->
              <h2 style="margin: 32px 0 20px 0; font-size: 20px; font-weight: 600; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Please Also:</h2>
              
              <ul style="margin: 0; padding-left: 24px; font-size: 15px; color: #475569;">
                <li style="margin-bottom: 10px;">Arrive <strong>10 minutes early</strong></li>
                <li style="margin-bottom: 10px;">Wear <strong>comfortable clothing</strong></li>
                <li style="margin-bottom: 10px;">Be prepared for <strong>movement-based evaluation</strong></li>
              </ul>
              
              <p style="margin: 24px 0; font-size: 16px; background-color: #eff6ff; border-radius: 8px; padding: 16px; border-left: 4px solid #1d4ed8;">Our goal is to help you understand <strong>what is driving your pain or performance limitation</strong> and outline a clear strategy to restore efficient, neurologically coordinated movement.</p>
              
              <!-- Contact Info -->
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #475569;">Questions before your visit? We're here to help.</p>
                <a href="tel:+15852031050" style="color: #1d4ed8; font-size: 18px; font-weight: 600; text-decoration: none;">(585) 203-1050</a>
              </div>
              
              <!-- Signature -->
              <p style="margin: 24px 0 0 0; font-size: 16px;">Warm regards,</p>
              <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">The Pittsford Performance Care Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b; font-weight: 500;">Pittsford Performance Care</p>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">3800 Monroe Ave • Suite 22 • Pittsford, NY 14534</p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">(585) 203-1050</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  
  return { subject, html };
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
    const { email, patientName, leadId, templateType }: OnboardingEmailRequest = await req.json();
    
    console.log(`Sending onboarding email to: ${email}, name: ${patientName}, leadId: ${leadId}, type: ${templateType}`);

    if (!email) {
      console.error("No email provided");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!templateType || !["neuro", "msk"].includes(templateType)) {
      console.error("Invalid or missing template type");
      return new Response(
        JSON.stringify({ error: "Template type (neuro or msk) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const displayName = patientName || "there";
    const appUrl = Deno.env.get("APP_URL") || "https://pittsfordperformancecare.com";
    const intakeFormUrl = `${appUrl}/patient-intake`;

    // Select the appropriate template
    const { subject, html } = templateType === "neuro" 
      ? getNeuroTemplate(displayName, intakeFormUrl)
      : getMskTemplate(displayName, intakeFormUrl);

    console.log("Attempting to send email to:", email);
    
    // Use verified domain from environment or fallback to resend.dev for testing
    const fromDomain = Deno.env.get("RESEND_FROM_DOMAIN") || "resend.dev";
    const fromEmail = `Pittsford Performance Care <noreply@${fromDomain}>`;
    
    console.log("Sending from:", fromEmail);
    
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject,
      html,
    });

    console.log("Resend API response:", JSON.stringify(emailResponse));

    // Check if Resend returned an error in the response
    if (emailResponse.error) {
      console.error("Resend returned an error:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: emailResponse.error.message || "Email send failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify we got an ID back (indicates successful send)
    if (!emailResponse.data?.id) {
      console.error("Resend did not return an email ID - send may have failed");
      return new Response(
        JSON.stringify({ error: "Email send failed - no confirmation received" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Onboarding email sent successfully, ID:", emailResponse.data.id);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data.id }), {
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
