import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface IntakeCheckResult {
  intakeId: string;
  patientName: string;
  patientEmail: string;
  hoursSinceSubmission: number;
  reminderType: 'reminder_1' | 'reminder_2' | 'admin_alert';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting intake scheduling check...");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    
    // Find all submitted intakes that don't have appointments scheduled
    const { data: intakes, error: intakesError } = await supabase
      .from('intake_forms')
      .select('id, patient_name, email, submitted_at, converted_to_episode_id')
      .eq('status', 'submitted')
      .not('submitted_at', 'is', null);

    if (intakesError) {
      console.error("Error fetching intakes:", intakesError);
      throw intakesError;
    }

    console.log(`Found ${intakes?.length || 0} submitted intakes`);

    const results: IntakeCheckResult[] = [];
    const reminders1Sent: string[] = [];
    const reminders2Sent: string[] = [];
    const adminAlertsSent: string[] = [];

    for (const intake of intakes || []) {
      // Skip if no email
      if (!intake.email) {
        console.log(`Skipping intake ${intake.id} - no email`);
        continue;
      }

      // Check if appointment is scheduled
      let hasAppointment = false;
      
      if (intake.converted_to_episode_id) {
        // Check if episode has a date of service
        const { data: episode } = await supabase
          .from('episodes')
          .select('date_of_service, start_date')
          .eq('id', intake.converted_to_episode_id)
          .single();
        
        if (episode && (episode.date_of_service || episode.start_date)) {
          hasAppointment = true;
        }
      }

      // If appointment is scheduled, skip
      if (hasAppointment) {
        console.log(`Intake ${intake.id} has appointment scheduled`);
        continue;
      }

      // Calculate hours since submission
      const submittedAt = new Date(intake.submitted_at);
      const hoursSinceSubmission = (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60);

      console.log(`Intake ${intake.id}: ${hoursSinceSubmission.toFixed(1)} hours since submission`);

      // Determine which reminder to send
      let reminderType: 'reminder_1' | 'reminder_2' | 'admin_alert' | null = null;
      
      if (hoursSinceSubmission >= 72) {
        reminderType = 'admin_alert';
      } else if (hoursSinceSubmission >= 48) {
        reminderType = 'reminder_2';
      } else if (hoursSinceSubmission >= 24) {
        reminderType = 'reminder_1';
      }

      if (!reminderType) {
        console.log(`Intake ${intake.id} not yet due for reminder`);
        continue;
      }

      // Check if this reminder was already sent
      const { data: existingReminder } = await supabase
        .from('intake_scheduling_reminders')
        .select('id')
        .eq('intake_form_id', intake.id)
        .eq('reminder_type', reminderType)
        .single();

      if (existingReminder) {
        console.log(`Reminder ${reminderType} already sent for intake ${intake.id}`);
        continue;
      }

      // Check if we've already sent a higher level reminder
      if (reminderType === 'reminder_1') {
        const { data: higherReminders } = await supabase
          .from('intake_scheduling_reminders')
          .select('id')
          .eq('intake_form_id', intake.id)
          .in('reminder_type', ['reminder_2', 'admin_alert']);
        
        if (higherReminders && higherReminders.length > 0) {
          console.log(`Higher level reminder already sent for intake ${intake.id}`);
          continue;
        }
      } else if (reminderType === 'reminder_2') {
        const { data: adminAlert } = await supabase
          .from('intake_scheduling_reminders')
          .select('id')
          .eq('intake_form_id', intake.id)
          .eq('reminder_type', 'admin_alert');
        
        if (adminAlert && adminAlert.length > 0) {
          console.log(`Admin alert already sent for intake ${intake.id}`);
          continue;
        }
      }

      // Send the appropriate reminder
      try {
        if (reminderType === 'admin_alert') {
          // Send admin alert
          const { error: alertError } = await supabase.functions.invoke('send-intake-scheduling-alert', {
            body: {
              intakeId: intake.id,
              patientName: intake.patient_name,
              patientEmail: intake.email,
              hoursSinceSubmission: hoursSinceSubmission
            }
          });

          if (alertError) throw alertError;
          adminAlertsSent.push(intake.id);
        } else {
          // Send patient reminder
          const { error: reminderError } = await supabase.functions.invoke('send-intake-scheduling-reminder', {
            body: {
              intakeId: intake.id,
              patientName: intake.patient_name,
              patientEmail: intake.email,
              reminderNumber: reminderType === 'reminder_1' ? 1 : 2
            }
          });

          if (reminderError) throw reminderError;
          
          if (reminderType === 'reminder_1') {
            reminders1Sent.push(intake.id);
          } else {
            reminders2Sent.push(intake.id);
          }
        }

        // Record the reminder in the database
        const { error: recordError } = await supabase
          .from('intake_scheduling_reminders')
          .insert({
            intake_form_id: intake.id,
            reminder_type: reminderType,
            status: 'sent'
          });

        if (recordError) {
          console.error(`Error recording reminder for intake ${intake.id}:`, recordError);
        }

        results.push({
          intakeId: intake.id,
          patientName: intake.patient_name,
          patientEmail: intake.email,
          hoursSinceSubmission: hoursSinceSubmission,
          reminderType: reminderType
        });

        console.log(`Sent ${reminderType} for intake ${intake.id}`);
      } catch (error: any) {
        console.error(`Error sending reminder for intake ${intake.id}:`, error);
        
        // Record the failed attempt
        await supabase
          .from('intake_scheduling_reminders')
          .insert({
            intake_form_id: intake.id,
            reminder_type: reminderType,
            status: 'failed',
            error_message: error?.message || 'Unknown error'
          });
      }
    }

    const summary = {
      totalChecked: intakes?.length || 0,
      reminders1Sent: reminders1Sent.length,
      reminders2Sent: reminders2Sent.length,
      adminAlertsSent: adminAlertsSent.length,
      details: results
    };

    console.log("Check completed:", summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in check-intake-scheduling:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});