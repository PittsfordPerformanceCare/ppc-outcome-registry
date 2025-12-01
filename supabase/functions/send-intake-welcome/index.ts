import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntakeWelcomeRequest {
  intakeFormId: string;
  patientName: string;
  patientEmail: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intakeFormId, patientName, patientEmail }: IntakeWelcomeRequest = await req.json();
    
    console.log("Processing intake welcome for:", { intakeFormId, patientName, patientEmail });

    if (!patientEmail) {
      console.log("No email provided, skipping notification");
      return new Response(
        JSON.stringify({ message: "No email provided" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get clinic settings
    const { data: settings, error: settingsError } = await supabase
      .from("clinic_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsError) {
      console.error("Error fetching clinic settings:", settingsError);
      throw new Error("Failed to fetch clinic settings");
    }

    // Get intake form details
    const { data: intakeForm, error: intakeError } = await supabase
      .from("intake_forms")
      .select("chief_complaint, injury_date")
      .eq("id", intakeFormId)
      .single();

    if (intakeError) {
      console.error("Error fetching intake form:", intakeError);
    }

    // Prepare template variables
    const templateVars = {
      patient_name: patientName,
      clinic_name: settings.clinic_name || "PPC Outcome Registry",
      clinic_phone: settings.phone || "",
      clinic_address: settings.address || "",
      clinic_email: settings.email || "",
      episode_type: "New Patient Intake",
      body_region: intakeForm?.chief_complaint || "General",
      injury_date: intakeForm?.injury_date || ""
    };

    // Function to replace template variables
    const replaceVariables = (template: string, vars: Record<string, string>) => {
      let result = template;
      Object.entries(vars).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        result = result.replace(regex, value || "");
      });
      return result;
    };

    const emails = [];

    // Send welcome email
    if (settings.intake_complete_welcome_template && settings.intake_complete_welcome_subject) {
      const welcomeSubject = replaceVariables(settings.intake_complete_welcome_subject, templateVars);
      const welcomeHtml = replaceVariables(settings.intake_complete_welcome_template, templateVars);

      emails.push({
        from: `${settings.clinic_name} <onboarding@resend.dev>`,
        to: [patientEmail],
        subject: welcomeSubject,
        html: welcomeHtml,
      });

      console.log("Prepared welcome email");
    }

    // Send scheduling email if enabled
    if (settings.send_scheduling_email && settings.intake_complete_scheduling_template && settings.intake_complete_scheduling_subject) {
      const schedulingSubject = replaceVariables(settings.intake_complete_scheduling_subject, templateVars);
      const schedulingHtml = replaceVariables(settings.intake_complete_scheduling_template, templateVars);

      emails.push({
        from: `${settings.clinic_name} <onboarding@resend.dev>`,
        to: [patientEmail],
        subject: schedulingSubject,
        html: schedulingHtml,
      });

      console.log("Prepared scheduling email");
    }

    // Send all emails
    const results = [];
    for (const email of emails) {
      try {
        const { data, error } = await resend.emails.send(email);
        if (error) {
          console.error("Error sending email:", error);
          results.push({ success: false, error: error.message });
        } else {
          console.log("Email sent successfully:", data);
          results.push({ success: true, data });
        }
      } catch (emailError: any) {
        console.error("Exception sending email:", emailError);
        results.push({ success: false, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Intake welcome emails processed", 
        emailsSent: emails.length,
        results 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-intake-welcome function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});