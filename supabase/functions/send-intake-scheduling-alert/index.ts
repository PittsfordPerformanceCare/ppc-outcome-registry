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

interface AlertRequest {
  intakeId: string;
  patientName: string;
  patientEmail: string;
  hoursSinceSubmission: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intakeId, patientName, patientEmail, hoursSinceSubmission }: AlertRequest = await req.json();

    console.log(`Sending admin alert for intake ${intakeId} - patient ${patientName}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get clinic settings
    const { data: clinicSettings } = await supabase
      .from('clinic_settings')
      .select('*')
      .single();

    const clinicName = clinicSettings?.clinic_name || "Our Clinic";

    // Get all admin users to send alert
    const { data: adminUsers } = await supabase
      .from('user_roles')
      .select('user_id, profiles!inner(email, full_name)')
      .eq('role', 'admin');

    if (!adminUsers || adminUsers.length === 0) {
      console.log("No admin users found to send alert");
      return new Response(
        JSON.stringify({ success: false, message: "No admin users found" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const adminEmails = adminUsers
      .map((u: any) => u.profiles?.email)
      .filter((email: string | null) => email !== null);

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({ success: false, message: "No admin emails found" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare admin alert email
    const daysSince = Math.floor(hoursSinceSubmission / 24);
    const subject = `⚠️ Action Required: Patient Not Scheduled - ${patientName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 20px;">
          <h2 style="color: #991b1b; margin: 0;">Action Required: Unscheduled Patient</h2>
        </div>
        <p><strong>Patient Name:</strong> ${patientName}</p>
        <p><strong>Email:</strong> ${patientEmail}</p>
        <p><strong>Intake Completed:</strong> ${daysSince} days ago (${hoursSinceSubmission.toFixed(1)} hours)</p>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> This patient completed their intake form but has not scheduled an appointment.</p>
        </div>

        <p><strong>Recommended Actions:</strong></p>
        <ol>
          <li>Call the patient at their provided phone number</li>
          <li>Review their intake form for any concerns</li>
          <li>Offer assistance with scheduling</li>
          <li>Document the outreach attempt</li>
        </ol>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/intake-review" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Intake Form
          </a>
        </div>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          This is an automated alert from ${clinicName}'s intake scheduling system.
        </p>
      </div>
    `;

    // Send email to all admins
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${clinicName} Alerts <onboarding@resend.dev>`,
        to: adminEmails,
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error sending admin alert:", data);
      throw new Error(data.message || "Failed to send alert");
    }

    console.log(`Admin alert sent successfully to ${adminEmails.length} recipients`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: data.id,
        recipientCount: adminEmails.length 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-intake-scheduling-alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});