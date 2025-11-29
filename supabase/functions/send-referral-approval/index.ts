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

      // Generate intake link - direct to intake form (no auth required)
      const intakeLink = `${APP_URL}/patient-intake?source=referral_approval`;

      // Replace template variables with warm, detailed content
      let emailBody = settings.referral_approval_email_template || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to ${settings.clinic_name}!</h1>
            <p style="font-size: 18px; color: #64748b;">We're excited to be part of your care journey</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1e293b; margin-bottom: 15px;">Hi ${name},</h2>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 15px;">
              Great news! After reviewing your inquiry, we're confident we can help you with your specific needs. 
              Our clinical team is looking forward to working with you.
            </p>
          </div>

          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2563eb;">
            <h3 style="color: #1e40af; margin-bottom: 15px;">🎯 Your Next Steps:</h3>
            <ol style="color: #475569; line-height: 1.8; margin-left: 20px;">
              <li style="margin-bottom: 10px;">
                <strong>Complete Your Intake Form</strong><br>
                <span style="font-size: 14px;">This helps us prepare for your first visit and understand your complete medical history (takes about 10-15 minutes)</span>
              </li>
              <li style="margin-bottom: 10px;">
                <strong>Schedule Your First Appointment</strong><br>
                <span style="font-size: 14px;">Choose a time that works best for you - we offer flexible scheduling</span>
              </li>
              <li>
                <strong>Prepare for Your Visit</strong><br>
                <span style="font-size: 14px;">Bring comfortable clothing and any relevant medical records</span>
              </li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${intakeLink}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 15px 40px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Complete Your Intake Form →
            </a>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>💡 Pro Tip:</strong> Complete your intake form within the next 48 hours to ensure the fastest scheduling. 
              You can save and return to it anytime!
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #1e293b; margin-bottom: 10px;">Questions Before Your Visit?</h4>
            <p style="color: #475569; margin-bottom: 10px;">We're here to help:</p>
            <p style="color: #475569; margin: 5px 0;">
              📞 <strong>Phone:</strong> ${settings.phone || '(585) 880-7542'}
            </p>
            <p style="color: #475569; margin: 5px 0;">
              📧 <strong>Email:</strong> ${settings.email || 'dr.rob@pittsfordperformancecare.com'}
            </p>
            <p style="color: #64748b; font-size: 13px; margin-top: 15px;">
              <em>Monday-Friday, 8am-5pm EST</em>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 13px;">
              We look forward to seeing you soon!<br>
              <strong>The ${settings.clinic_name} Team</strong>
            </p>
          </div>
        </div>
      `;
      
      // Replace all template variables
      emailBody = emailBody.replace(/{{name}}/g, name);
      emailBody = emailBody.replace(/{{clinic_name}}/g, settings.clinic_name);
      emailBody = emailBody.replace(/{{intake_link}}/g, intakeLink);
      
      // Also replace any hardcoded URLs that might be pointing to wrong pages
      // This ensures the intake link always goes to /patient-intake
      emailBody = emailBody.replace(/href="[^"]*patient-welcome[^"]*"/g, `href="${intakeLink}"`);
      emailBody = emailBody.replace(/href="[^"]*patient-dashboard[^"]*"/g, `href="${intakeLink}"`);

      let subject = settings.referral_approval_email_subject || "Welcome to {{clinic_name}} - Your Next Steps Inside 🎉";
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
