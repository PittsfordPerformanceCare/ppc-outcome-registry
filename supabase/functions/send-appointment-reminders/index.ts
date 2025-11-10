import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Appointment reminder check started');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get clinic settings
    const { data: clinicSettings } = await supabase
      .from('clinic_settings')
      .select('*')
      .single();

    if (!clinicSettings?.reminder_enabled) {
      console.log('Appointment reminders are disabled');
      return new Response(
        JSON.stringify({ message: 'Reminders disabled', processed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const hoursBeforeReminder = clinicSettings.reminder_hours_before || 24;
    const now = new Date();
    const reminderWindowStart = new Date(now.getTime() + hoursBeforeReminder * 60 * 60 * 1000);
    const reminderWindowEnd = new Date(now.getTime() + (hoursBeforeReminder + 1) * 60 * 60 * 1000);

    console.log(`Checking for appointments between ${reminderWindowStart.toISOString()} and ${reminderWindowEnd.toISOString()}`);

    let remindersProcessed = 0;

    // Check episodes with follow-up appointments
    const { data: episodes } = await supabase
      .from('episodes')
      .select('id, patient_name, followup_date, followup_time, clinician, user_id, clinic_id')
      .not('followup_date', 'is', null)
      .is('reminder_sent_at', null)
      .gte('followup_date', reminderWindowStart.toISOString().split('T')[0])
      .lte('followup_date', reminderWindowEnd.toISOString().split('T')[0]);

    if (episodes && episodes.length > 0) {
      console.log(`Found ${episodes.length} episodes with upcoming appointments`);
      
      for (const episode of episodes) {
        try {
          // Get patient contact info from related intake form if available
          const { data: intakeForm } = await supabase
            .from('intake_forms')
            .select('email, phone')
            .eq('converted_to_episode_id', episode.id)
            .maybeSingle();

          if (!intakeForm?.email && !intakeForm?.phone) {
            console.log(`No contact info for episode ${episode.id}, skipping`);
            continue;
          }

          // Send reminder notification
          await sendReminderNotification(
            supabase,
            episode.id,
            episode.patient_name,
            intakeForm.email,
            intakeForm.phone,
            episode.clinician,
            episode.followup_date,
            episode.followup_time || 'TBD',
            episode.user_id,
            episode.clinic_id,
            clinicSettings
          );

          // Mark reminder as sent
          await supabase
            .from('episodes')
            .update({ reminder_sent_at: now.toISOString() })
            .eq('id', episode.id);

          remindersProcessed++;
        } catch (error) {
          console.error(`Failed to process episode ${episode.id}:`, error);
        }
      }
    }

    // Check followups table
    const { data: followups } = await supabase
      .from('followups')
      .select('id, episode_id, scheduled_date, scheduled_time, user_id, clinic_id')
      .not('scheduled_date', 'is', null)
      .is('reminder_sent_at', null)
      .gte('scheduled_date', reminderWindowStart.toISOString().split('T')[0])
      .lte('scheduled_date', reminderWindowEnd.toISOString().split('T')[0]);

    if (followups && followups.length > 0) {
      console.log(`Found ${followups.length} follow-ups with upcoming appointments`);
      
      for (const followup of followups) {
        try {
          // Get episode and patient info
          const { data: episode } = await supabase
            .from('episodes')
            .select('patient_name, clinician')
            .eq('id', followup.episode_id)
            .single();

          if (!episode) continue;

          // Get patient contact info
          const { data: intakeForm } = await supabase
            .from('intake_forms')
            .select('email, phone')
            .eq('converted_to_episode_id', followup.episode_id)
            .maybeSingle();

          if (!intakeForm?.email && !intakeForm?.phone) {
            console.log(`No contact info for followup ${followup.id}, skipping`);
            continue;
          }

          // Send reminder notification
          await sendReminderNotification(
            supabase,
            followup.episode_id,
            episode.patient_name,
            intakeForm.email,
            intakeForm.phone,
            episode.clinician,
            followup.scheduled_date,
            followup.scheduled_time || 'TBD',
            followup.user_id,
            followup.clinic_id,
            clinicSettings
          );

          // Mark reminder as sent
          await supabase
            .from('followups')
            .update({ reminder_sent_at: now.toISOString() })
            .eq('id', followup.id);

          remindersProcessed++;
        } catch (error) {
          console.error(`Failed to process followup ${followup.id}:`, error);
        }
      }
    }

    console.log(`Processed ${remindersProcessed} appointment reminders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: remindersProcessed,
        message: `Sent ${remindersProcessed} appointment reminders`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Error in send-appointment-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

async function sendReminderNotification(
  supabase: any,
  episodeId: string,
  patientName: string,
  patientEmail: string | null,
  patientPhone: string | null,
  clinicianName: string,
  appointmentDate: string,
  appointmentTime: string,
  userId: string,
  clinicId: string | null,
  clinicSettings: any
) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  const clinicName = clinicSettings?.clinic_name || 'Our Clinic';
  const clinicPhone = clinicSettings?.phone || '';

  // Format date nicely
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Replace placeholders
  const replacePlaceholders = (template: string) => {
    return template
      .replace(/\{\{patient_name\}\}/g, patientName)
      .replace(/\{\{clinician_name\}\}/g, clinicianName)
      .replace(/\{\{episode_id\}\}/g, episodeId)
      .replace(/\{\{appointment_date\}\}/g, formattedDate)
      .replace(/\{\{appointment_time\}\}/g, appointmentTime)
      .replace(/\{\{clinic_name\}\}/g, clinicName)
      .replace(/\{\{clinic_phone\}\}/g, clinicPhone);
  };

  // Send Email
  if (patientEmail && resendApiKey) {
    // Check rate limit for email
    const { data: emailRateLimit } = await supabase.rpc('check_rate_limit', {
      p_service_type: 'email',
      p_clinic_id: clinicId
    });

    if (!emailRateLimit?.allowed) {
      console.log(`Email rate limit exceeded for clinic ${clinicId}. Limit: ${emailRateLimit?.max_allowed}, Current: ${emailRateLimit?.current_count}`);
      
      // Record failed attempt due to rate limit
      await supabase.rpc('record_rate_limit_usage', {
        p_service_type: 'email',
        p_success: false,
        p_clinic_id: clinicId,
        p_user_id: userId,
        p_episode_id: episodeId
      });
    } else {
      try {
        // Generate tracking ID for email open tracking
        const trackingId = crypto.randomUUID();
        
        const emailSubject = clinicSettings?.reminder_email_subject
          ? replacePlaceholders(clinicSettings.reminder_email_subject)
          : `Appointment Reminder: ${patientName}`;

        let emailHtml = clinicSettings?.reminder_email_template
          ? replacePlaceholders(clinicSettings.reminder_email_template)
          : replacePlaceholders(`
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Appointment Reminder</h1>
                <p>Dear {{patient_name}},</p>
                <p>This is a friendly reminder about your upcoming physical therapy appointment.</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #1f2937; margin-top: 0;">Appointment Details</h2>
                  <p><strong>Date:</strong> {{appointment_date}}</p>
                  <p><strong>Time:</strong> {{appointment_time}}</p>
                  <p><strong>Clinician:</strong> {{clinician_name}}</p>
                </div>
                <p>If you need to reschedule or have any questions, please call us at {{clinic_phone}}.</p>
                <p style="margin-top: 30px;">See you soon!<br/>{{clinic_name}} Team</p>
              </div>
            `);
        
        // Add tracking pixel to email HTML
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        emailHtml += `<img src="${supabaseUrl}/functions/v1/track-email-open?id=${trackingId}" width="1" height="1" alt="" style="display:block;border:0;" />`;

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${clinicName} <onboarding@resend.dev>`,
            to: [patientEmail],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        const emailSuccess = emailResponse.ok;

        if (emailSuccess) {
          const responseData = await emailResponse.json();
          console.log(`Reminder email sent to ${patientEmail}`);
          
          // Log to notification history
          await supabase.from('notifications_history').insert({
            episode_id: episodeId,
            patient_name: patientName,
            patient_email: patientEmail,
            clinician_name: clinicianName,
            notification_type: 'email',
            status: 'sent',
            delivery_details: { message_id: responseData.id, type: 'appointment_reminder' },
            tracking_id: trackingId,
            user_id: userId,
            clinic_id: clinicId
          });
        } else {
          console.error('Failed to send reminder email:', await emailResponse.text());
        }

        // Record rate limit usage
        await supabase.rpc('record_rate_limit_usage', {
          p_service_type: 'email',
          p_success: emailSuccess,
          p_clinic_id: clinicId,
          p_user_id: userId,
          p_episode_id: episodeId
        });
      } catch (error) {
        console.error('Error sending reminder email:', error);
        
        // Record failed rate limit usage
        await supabase.rpc('record_rate_limit_usage', {
          p_service_type: 'email',
          p_success: false,
          p_clinic_id: clinicId,
          p_user_id: userId,
          p_episode_id: episodeId
        });
      }
    }
  }

  // Send SMS
  if (patientPhone && twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
    // Check rate limit for SMS
    const { data: smsRateLimit } = await supabase.rpc('check_rate_limit', {
      p_service_type: 'sms',
      p_clinic_id: clinicId
    });

    if (!smsRateLimit?.allowed) {
      console.log(`SMS rate limit exceeded for clinic ${clinicId}. Limit: ${smsRateLimit?.max_allowed}, Current: ${smsRateLimit?.current_count}`);
      
      // Record failed attempt due to rate limit
      await supabase.rpc('record_rate_limit_usage', {
        p_service_type: 'sms',
        p_success: false,
        p_clinic_id: clinicId,
        p_user_id: userId,
        p_episode_id: episodeId
      });
    } else {
      try {
        const smsMessage = clinicSettings?.reminder_sms_template
          ? replacePlaceholders(clinicSettings.reminder_sms_template)
          : replacePlaceholders(`{{clinic_name}}: Reminder - You have a PT appointment on {{appointment_date}} at {{appointment_time}} with {{clinician_name}}. Call {{clinic_phone}} to reschedule.`);

        const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
        const smsResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: patientPhone,
              From: twilioPhoneNumber,
              Body: smsMessage,
            }).toString(),
          }
        );

        const smsSuccess = smsResponse.ok;

        if (smsSuccess) {
          const responseData = await smsResponse.json();
          console.log(`Reminder SMS sent to ${patientPhone}`);
          
          // Log to notification history
          await supabase.from('notifications_history').insert({
            episode_id: episodeId,
            patient_name: patientName,
            patient_phone: patientPhone,
            clinician_name: clinicianName,
            notification_type: 'sms',
            status: 'sent',
            delivery_details: { sid: responseData.sid, type: 'appointment_reminder' },
            user_id: userId,
            clinic_id: clinicId
          });
        } else {
          console.error('Failed to send reminder SMS:', await smsResponse.text());
        }

        // Record rate limit usage
        await supabase.rpc('record_rate_limit_usage', {
          p_service_type: 'sms',
          p_success: smsSuccess,
          p_clinic_id: clinicId,
          p_user_id: userId,
          p_episode_id: episodeId
        });
      } catch (error) {
        console.error('Error sending reminder SMS:', error);
        
        // Record failed rate limit usage
        await supabase.rpc('record_rate_limit_usage', {
          p_service_type: 'sms',
          p_success: false,
          p_clinic_id: clinicId,
          p_user_id: userId,
          p_episode_id: episodeId
        });
      }
    }
  }
}

serve(handler);
