import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const appUrl = Deno.env.get("APP_URL") || "https://muse-meadow-app.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadConfirmationRequest {
  leadId: string;
  email: string;
  name: string;
  primaryConcern: string | null;
  deliverConcussionEducation: boolean;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, email, name, primaryConcern, deliverConcussionEducation }: LeadConfirmationRequest = await req.json();
    
    console.log("[send-lead-confirmation] Processing for lead:", leadId, "email:", email, "deliverEducation:", deliverConcussionEducation);

    if (!email) {
      console.log("[send-lead-confirmation] No email provided, skipping");
      return new Response(
        JSON.stringify({ message: "No email provided" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!resendApiKey) {
      console.error("[send-lead-confirmation] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get clinic settings for branding
    const { data: settings } = await supabase
      .from("clinic_settings")
      .select("clinic_name, phone, email, address")
      .limit(1)
      .single();

    const clinicName = settings?.clinic_name || "Pittsford Performance Care";
    const clinicPhone = settings?.phone || "(585) 203-1050";
    const clinicEmail = settings?.email || "info@pittsfordperformancecare.com";

    // Build the concussion guide section if applicable
    const concussionGuideSection = deliverConcussionEducation ? `
      <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <h2 style="color: #1e40af; margin-top: 0; font-size: 18px;">📘 Acute Concussion Guide: Early Recovery</h2>
        <p style="color: #1e3a8a; margin-bottom: 16px;">
          Based on your reported symptoms, we recommend reviewing our acute concussion guide. 
          This resource covers the first 24 hours and first week after a head injury, including important safety information and recovery guidance.
        </p>
        <a href="${appUrl}/site/guides/concussion/acute-concussion-guide" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Open Acute Concussion Guide
        </a>
        <p style="color: #64748b; font-size: 12px; margin-top: 12px; margin-bottom: 0;">
          First 24 hours + first week considerations for suspected concussion
        </p>
      </div>
    ` : '';

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin-bottom: 8px;">We've Received Your Inquiry</h1>
          <p style="color: #6b7280; font-size: 16px;">${clinicName}</p>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #374151;">Hi ${name || "there"},</p>
          <p style="color: #4b5563; margin-top: 16px;">
            Thank you for contacting ${clinicName}. We've received your inquiry${primaryConcern ? ` regarding <strong>${primaryConcern}</strong>` : ""} 
            and our team will review it within 1-2 business days.
          </p>
        </div>

        ${concussionGuideSection}

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">What Happens Next</h3>
          <ul style="color: #4b5563; padding-left: 20px; margin-bottom: 0; list-style-type: disc;">
            <li style="margin-bottom: 8px;">Our team will review your information</li>
            <li style="margin-bottom: 8px;">We'll contact you via your preferred method to discuss your needs</li>
            <li style="margin-bottom: 0;">Most patients are seen within 1-2 weeks of initial contact</li>
          </ul>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
          <p style="color: #6b7280; margin-bottom: 8px;">Questions? Contact us:</p>
          <p style="margin: 4px 0;">
            <a href="tel:${clinicPhone.replace(/[^0-9]/g, "")}" style="color: #2563eb; text-decoration: none;">${clinicPhone}</a>
          </p>
          <p style="margin: 4px 0;">
            <a href="mailto:${clinicEmail}" style="color: #2563eb; text-decoration: none;">${clinicEmail}</a>
          </p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            ${clinicName}<br>
            Pittsford, NY
          </p>
        </div>
      </div>
    `;

    // Send via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${clinicName} <onboarding@resend.dev>`,
        to: [email],
        subject: deliverConcussionEducation 
          ? "We've Received Your Inquiry + Acute Concussion Guide" 
          : "We've Received Your Inquiry - Pittsford Performance Care",
        html: emailHtml,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("[send-lead-confirmation] Resend error:", responseData);
      return new Response(
        JSON.stringify({ error: responseData.message || "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[send-lead-confirmation] Email sent successfully:", responseData.id);

    // Log the notification
    try {
      await supabase.from("audit_logs").insert({
        action: "lead_confirmation_email_sent",
        table_name: "leads",
        record_id: leadId,
        new_data: {
          email,
          deliverConcussionEducation,
          resend_id: responseData.id,
        },
      });
    } catch (logErr) {
      console.error("[send-lead-confirmation] Audit log error (non-fatal):", logErr);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: responseData.id,
        education_included: deliverConcussionEducation,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[send-lead-confirmation] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});