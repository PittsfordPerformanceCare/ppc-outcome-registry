import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const {
      episodeId,
      patientName,
      patientEmail,
      clinicianName,
      examDate,
      examTime,
      examType
    } = await req.json();

    console.log("Sending neuro exam notification:", { episodeId, patientEmail, examType });

    // Get clinic settings
    const { data: settings } = await supabase
      .from("clinic_settings")
      .select("*")
      .single();

    const clinicName = settings?.clinic_name || "PPC Outcome Registry";
    const clinicPhone = settings?.phone || "";

    // Format exam type for display
    const examTypeLabel = examType === "baseline" ? "Initial" 
      : examType === "final" ? "Final" 
      : "Follow-up";

    // Email template
    const subject = `Neurologic Examination Scheduled - ${patientName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Neurologic Examination Scheduled</h1>
        <p>Dear ${patientName},</p>
        <p>Your neurologic examination has been scheduled as part of your ongoing care with ${clinicName}.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1f2937; margin-top: 0;">Appointment Details</h2>
          <p><strong>Date:</strong> ${examDate}</p>
          <p><strong>Time:</strong> ${examTime}</p>
          <p><strong>Type:</strong> ${examTypeLabel} Neurologic Examination</p>
          ${clinicianName ? `<p><strong>Clinician:</strong> ${clinicianName}</p>` : ''}
        </div>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">Preparation for Your Exam</h3>
          <p style="color: #92400e;">Please:</p>
          <ul style="color: #92400e;">
            <li>Get adequate rest the night before</li>
            <li>Avoid strenuous activity on exam day</li>
            <li>Bring a list of current medications</li>
            <li>Note any recent changes in symptoms</li>
            <li>Wear comfortable clothing</li>
          </ul>
        </div>
        <p>This comprehensive examination will help us assess your neurologic function and track your progress.</p>
        ${clinicPhone ? `<p>If you need to reschedule, please call us at ${clinicPhone}.</p>` : ''}
        <p style="margin-top: 30px;">See you soon!<br/>${clinicName} Team</p>
      </div>
    `;

    // Send email via Resend
    if (RESEND_API_KEY) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${clinicName} <noreply@updates.lovable.app>`,
          to: [patientEmail],
          subject,
          html: htmlContent,
        }),
      });

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        console.error("Resend API error:", errorText);
        throw new Error(`Failed to send email: ${errorText}`);
      }

      const resendData = await resendResponse.json();
      console.log("Email sent successfully:", resendData.id);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-neuro-exam-notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
