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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const appUrl = Deno.env.get("APP_URL") || "https://lovable.dev";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find incomplete intakes older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: incompleteIntakes, error } = await supabase
      .from("intakes")
      .select("id, lead_id, patient_name, patient_email, progress, timestamp_started")
      .eq("status", "started")
      .lt("progress", 100)
      .lt("timestamp_started", twentyFourHoursAgo);

    if (error) {
      throw error;
    }

    console.log(`Found ${incompleteIntakes?.length || 0} incomplete intakes to remind`);

    let sentCount = 0;
    let errorCount = 0;

    for (const intake of incompleteIntakes || []) {
      if (!intake.patient_email) {
        console.log(`Skipping intake ${intake.id} - no email`);
        continue;
      }

      try {
        const resumeLink = `${appUrl}/neurologic-intake?intake=${intake.id}&lead=${intake.lead_id || ""}`;

        await resend.emails.send({
          from: "Pittsford Performance Care <notifications@resend.dev>",
          to: [intake.patient_email],
          subject: "Complete Your Neurologic Intake - We're Here to Help",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #0a1628;">Need Help Completing Your Intake?</h1>
              <p>Hi ${intake.patient_name || "there"},</p>
              <p>We noticed you started your neurologic intake form but haven't finished it yet. Your progress has been saved at ${intake.progress}%.</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin-bottom: 15px;">Ready to continue?</p>
                <a href="${resumeLink}" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Resume Your Intake
                </a>
              </div>
              
              <p>If you have questions or need assistance, simply reply to this email with "HELP" and we'll reach out to you directly.</p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If you no longer wish to proceed with your intake, you can simply ignore this email.
              </p>
              
              <p style="margin-top: 30px;">— Pittsford Performance Care Team</p>
            </div>
          `,
        });

        console.log(`Reminder sent to ${intake.patient_email} for intake ${intake.id}`);
        sentCount++;

        // Mark that we sent a reminder (optional - could add a reminder_sent_at column)
      } catch (emailError) {
        console.error(`Failed to send reminder for intake ${intake.id}:`, emailError);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: incompleteIntakes?.length || 0,
        sent: sentCount,
        errors: errorCount 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-intake-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});