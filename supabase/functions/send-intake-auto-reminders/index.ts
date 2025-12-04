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
    const appUrl = Deno.env.get("APP_URL") || "https://ppc-outcome-registry.lovable.app";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    let firstRemindersSent = 0;
    let secondRemindersSent = 0;
    let errors = 0;

    // First Reminder: 12+ hours old, no reminders sent yet
    const { data: firstReminderLeads, error: firstError } = await supabase
      .from("leads")
      .select("id, name, email, phone")
      .is("intake_completed_at", null)
      .lte("created_at", twelveHoursAgo)
      .is("intake_first_reminder_sent_at", null);

    if (firstError) {
      console.error("Error fetching first reminder leads:", firstError);
    } else {
      console.log(`Found ${firstReminderLeads?.length || 0} leads for first reminder`);

      for (const lead of firstReminderLeads || []) {
        if (!lead.email) {
          console.log(`Skipping lead ${lead.id} - no email`);
          continue;
        }

        try {
          const intakeLink = `${appUrl}/severity-check?lead=${lead.id}`;

          await resend.emails.send({
            from: "Pittsford Performance Care <notifications@resend.dev>",
            to: [lead.email],
            subject: "Please complete your intake form before your visit with Pittsford Performance Care",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Hi ${lead.name || "there"},</p>
                
                <p>This is a friendly reminder to complete your digital intake form for your upcoming visit with Pittsford Performance Care.</p>
                
                <p>Your intake helps us prepare for your neurologic evaluation and ensure your first visit is focused, efficient, and tailored to you.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${intakeLink}" style="display: inline-block; background-color: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Complete Your Intake
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">If you've already completed your intake, you can ignore this message.</p>
                
                <p style="margin-top: 30px;">— Pittsford Performance Care</p>
              </div>
            `,
          });

          // Update lead with first reminder timestamp
          await supabase
            .from("leads")
            .update({ intake_first_reminder_sent_at: new Date().toISOString() })
            .eq("id", lead.id);

          console.log(`First reminder sent to ${lead.email} for lead ${lead.id}`);
          firstRemindersSent++;
        } catch (emailError) {
          console.error(`Failed to send first reminder for lead ${lead.id}:`, emailError);
          errors++;
        }
      }
    }

    // Second Reminder: 24+ hours old, first reminder sent, no second reminder
    const { data: secondReminderLeads, error: secondError } = await supabase
      .from("leads")
      .select("id, name, email, phone")
      .is("intake_completed_at", null)
      .lte("created_at", twentyFourHoursAgo)
      .not("intake_first_reminder_sent_at", "is", null)
      .is("intake_second_reminder_sent_at", null);

    if (secondError) {
      console.error("Error fetching second reminder leads:", secondError);
    } else {
      console.log(`Found ${secondReminderLeads?.length || 0} leads for second reminder`);

      for (const lead of secondReminderLeads || []) {
        if (!lead.email) {
          console.log(`Skipping lead ${lead.id} - no email`);
          continue;
        }

        try {
          const intakeLink = `${appUrl}/severity-check?lead=${lead.id}`;

          await resend.emails.send({
            from: "Pittsford Performance Care <notifications@resend.dev>",
            to: [lead.email],
            subject: "Final reminder: intake form for your upcoming PPC visit",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Hi ${lead.name || "there"},</p>
                
                <p>This is a final reminder to complete your intake form before your visit with Pittsford Performance Care. Completing this now will help us start your care on time and avoid delays.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${intakeLink}" style="display: inline-block; background-color: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Complete Your Intake
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">If you've already completed your intake, you can ignore this message.</p>
                
                <p style="margin-top: 30px;">— Pittsford Performance Care</p>
              </div>
            `,
          });

          // Update lead with second reminder timestamp
          await supabase
            .from("leads")
            .update({ intake_second_reminder_sent_at: new Date().toISOString() })
            .eq("id", lead.id);

          console.log(`Second reminder sent to ${lead.email} for lead ${lead.id}`);
          secondRemindersSent++;
        } catch (emailError) {
          console.error(`Failed to send second reminder for lead ${lead.id}:`, emailError);
          errors++;
        }
      }
    }

    console.log(`Auto-reminders complete: ${firstRemindersSent} first, ${secondRemindersSent} second, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        firstRemindersSent,
        secondRemindersSent,
        errors,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-intake-auto-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
