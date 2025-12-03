import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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
    const { intakeId, patientName, patientEmail } = await req.json();

    console.log("Processing intake approval:", { intakeId, patientName, patientEmail });

    if (patientEmail) {
      await resend.emails.send({
        from: "Pittsford Performance Care <notifications@resend.dev>",
        to: [patientEmail],
        subject: "Great News - Your Intake Has Been Approved!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0a1628;">Welcome to Our Care, ${patientName || ""}!</h1>
            <p>Great news! Your neurologic intake has been reviewed and approved by our clinical team.</p>
            
            <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h2 style="color: #166534; margin-top: 0;">Next Steps</h2>
              <p style="color: #166534;">We'll be reaching out shortly to schedule your first appointment.</p>
            </div>
            
            <p>What to expect at your first visit:</p>
            <ul style="color: #4b5563;">
              <li>Comprehensive neurologic evaluation</li>
              <li>Review of your symptom history</li>
              <li>Development of your personalized treatment plan</li>
            </ul>
            
            <p>If you have any questions before your appointment, please don't hesitate to contact us.</p>
            
            <p style="margin-top: 30px;">We look forward to helping you on your path to recovery!</p>
            <p>— Pittsford Performance Care Team</p>
          </div>
        `,
      });
      console.log("Approval email sent to:", patientEmail);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-intake-approval:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});