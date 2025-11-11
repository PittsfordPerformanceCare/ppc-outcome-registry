import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Episode {
  id: string;
  patient_name: string;
  clinician: string;
  region: string;
  user_id: string;
  clinic_id: string | null;
  start_date: string;
  discharge_date: string | null;
}

interface ClinicSettings {
  outcome_reminder_enabled: boolean;
  outcome_reminder_interval_days: number;
  outcome_reminder_email_subject: string;
  outcome_reminder_email_template: string;
  outcome_reminder_sms_template: string;
  clinic_phone: string;
  clinic_name: string;
}

interface ContactInfo {
  email: string | null;
  phone: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting outcome measure reminder check...');

    // Fetch clinic settings
    const { data: settings, error: settingsError } = await supabase
      .from('clinic_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.error('Error fetching clinic settings:', settingsError);
      throw settingsError;
    }

    const clinicSettings = settings as ClinicSettings;

    if (!clinicSettings.outcome_reminder_enabled) {
      console.log('Outcome reminders are disabled');
      return new Response(
        JSON.stringify({ success: true, message: 'Outcome reminders disabled', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const intervalDays = clinicSettings.outcome_reminder_interval_days || 14;

    // Find active episodes (started but not discharged)
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('*')
      .not('start_date', 'is', null)
      .is('discharge_date', null)
      .order('start_date', { ascending: false });

    if (episodesError) {
      console.error('Error fetching episodes:', episodesError);
      throw episodesError;
    }

    console.log(`Found ${episodes?.length || 0} active episodes`);

    let processedCount = 0;
    const remindersToSend = [];

    for (const episode of (episodes as Episode[]) || []) {
      // Get the most recent outcome score for this episode
      const { data: lastScore, error: scoreError } = await supabase
        .from('outcome_scores')
        .select('recorded_at')
        .eq('episode_id', episode.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (scoreError && scoreError.code !== 'PGRST116') {
        console.error(`Error fetching scores for episode ${episode.id}:`, scoreError);
        continue;
      }

      // Determine reference date: last score date or episode start date
      const referenceDate = lastScore?.recorded_at 
        ? new Date(lastScore.recorded_at)
        : new Date(episode.start_date);

      const daysSinceLastScore = Math.floor(
        (Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log(`Episode ${episode.id}: ${daysSinceLastScore} days since last score`);

      // If it's time for a reminder
      if (daysSinceLastScore >= intervalDays) {
        // Get patient contact info from intake form
        const { data: intakeForm, error: intakeError } = await supabase
          .from('intake_forms')
          .select('email, phone')
          .eq('converted_to_episode_id', episode.id)
          .maybeSingle();

        if (intakeError && intakeError.code !== 'PGRST116') {
          console.error(`Error fetching intake for episode ${episode.id}:`, intakeError);
          continue;
        }

        if (intakeForm) {
          remindersToSend.push({
            episode,
            contactInfo: intakeForm as ContactInfo,
          });
        }
      }
    }

    console.log(`Sending ${remindersToSend.length} outcome measure reminders`);

    // Send reminders
    for (const { episode, contactInfo } of remindersToSend) {
      try {
        await sendOutcomeReminder(
          supabase,
          episode,
          contactInfo,
          clinicSettings
        );
        processedCount++;
      } catch (error) {
        console.error(`Failed to send reminder for episode ${episode.id}:`, error);
      }
    }

    console.log(`Successfully processed ${processedCount} outcome measure reminders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        message: `Sent ${processedCount} outcome measure reminders`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-outcome-measure-reminders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function sendOutcomeReminder(
  supabase: any,
  episode: Episode,
  contactInfo: ContactInfo,
  settings: ClinicSettings
) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  // Determine recommended outcome tool based on region
  const outcomeToolMap: { [key: string]: string } = {
    'Cervical Spine': 'NDI (Neck Disability Index)',
    'Lumbar Spine': 'ODI (Oswestry Disability Index)',
    'Lower Extremity': 'LEFS (Lower Extremity Functional Scale)',
    'Upper Extremity': 'QuickDASH',
  };

  const outcomeTool = outcomeToolMap[episode.region] || 'outcome measure';

  const replacePlaceholders = (template: string) => {
    return template
      .replace(/{{patient_name}}/g, episode.patient_name)
      .replace(/{{clinic_name}}/g, settings.clinic_name)
      .replace(/{{clinic_phone}}/g, settings.clinic_phone)
      .replace(/{{episode_id}}/g, episode.id)
      .replace(/{{clinician_name}}/g, episode.clinician || 'Your clinician')
      .replace(/{{region}}/g, episode.region)
      .replace(/{{outcome_tool}}/g, outcomeTool);
  };

  // Send Email
  if (contactInfo.email && resendApiKey) {
    const { data: rateLimitCheck } = await supabase.rpc('check_rate_limit', {
      p_service_type: 'email',
      p_clinic_id: episode.clinic_id,
    });

    if (rateLimitCheck?.[0]?.allowed) {
      try {
        const trackingId = crypto.randomUUID();
        const trackingPixel = `<img src="${Deno.env.get('SUPABASE_URL')}/functions/v1/track-email-open?id=${trackingId}" width="1" height="1" style="display:none;" />`;

        const emailHtml = replacePlaceholders(settings.outcome_reminder_email_template) + trackingPixel;
        const emailSubject = replacePlaceholders(settings.outcome_reminder_email_subject);

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${settings.clinic_name} <onboarding@resend.dev>`,
            to: [contactInfo.email],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text();
          console.error('Resend API error:', errorData);
          throw new Error(`Email sending failed: ${errorData}`);
        }

        // Log notification
        await supabase.from('notifications_history').insert({
          episode_id: episode.id,
          user_id: episode.user_id,
          clinic_id: episode.clinic_id,
          notification_type: 'outcome_reminder',
          patient_name: episode.patient_name,
          patient_email: contactInfo.email,
          clinician_name: episode.clinician,
          status: 'sent',
          tracking_id: trackingId,
        });

        // Record rate limit usage
        await supabase.rpc('record_rate_limit_usage', {
          p_service_type: 'email',
          p_success: true,
          p_clinic_id: episode.clinic_id,
          p_user_id: episode.user_id,
          p_episode_id: episode.id,
        });

        console.log(`Email reminder sent to ${contactInfo.email} for episode ${episode.id}`);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    } else {
      console.log('Email rate limit exceeded');
    }
  }

  // Send SMS
  if (contactInfo.phone && twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
    const { data: rateLimitCheck } = await supabase.rpc('check_rate_limit', {
      p_service_type: 'sms',
      p_clinic_id: episode.clinic_id,
    });

    if (rateLimitCheck?.[0]?.allowed) {
      try {
        const smsBody = replacePlaceholders(settings.outcome_reminder_sms_template);

        const smsResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: contactInfo.phone,
              From: twilioPhoneNumber,
              Body: smsBody,
            }),
          }
        );

        if (!smsResponse.ok) {
          const errorData = await smsResponse.text();
          console.error('Twilio API error:', errorData);
          throw new Error(`SMS sending failed: ${errorData}`);
        }

        // Log notification
        await supabase.from('notifications_history').insert({
          episode_id: episode.id,
          user_id: episode.user_id,
          clinic_id: episode.clinic_id,
          notification_type: 'outcome_reminder_sms',
          patient_name: episode.patient_name,
          patient_phone: contactInfo.phone,
          clinician_name: episode.clinician,
          status: 'sent',
        });

        // Record rate limit usage
        await supabase.rpc('record_rate_limit_usage', {
          p_service_type: 'sms',
          p_success: true,
          p_clinic_id: episode.clinic_id,
          p_user_id: episode.user_id,
          p_episode_id: episode.id,
        });

        console.log(`SMS reminder sent to ${contactInfo.phone} for episode ${episode.id}`);
      } catch (error) {
        console.error('Error sending SMS:', error);
      }
    } else {
      console.log('SMS rate limit exceeded');
    }
  }
}
