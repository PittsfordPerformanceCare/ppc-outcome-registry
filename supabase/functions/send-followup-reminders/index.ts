import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FollowupRecord {
  id: string;
  episode_id: string;
  scheduled_date: string;
  user_id: string;
  clinic_id: string | null;
  status: string | null;
}

interface EpisodeRecord {
  patient_name: string;
}

interface ProfileRecord {
  email: string;
  full_name: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting follow-up reminder check...');

    // Get all pending follow-ups scheduled for today or overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: followups, error: followupsError } = await supabase
      .from('followups')
      .select('*')
      .eq('completed', false)
      .lte('scheduled_date', tomorrow.toISOString().split('T')[0])
      .gte('scheduled_date', today.toISOString().split('T')[0]);

    if (followupsError) {
      console.error('Error fetching follow-ups:', followupsError);
      throw followupsError;
    }

    console.log(`Found ${followups?.length || 0} follow-ups due today`);

    const reminders: any[] = [];

    // Process each follow-up
    for (const followup of (followups as FollowupRecord[]) || []) {
      // Get episode details
      const { data: episode, error: episodeError } = await supabase
        .from('episodes')
        .select('patient_name')
        .eq('id', followup.episode_id)
        .single();

      if (episodeError) {
        console.error(`Error fetching episode ${followup.episode_id}:`, episodeError);
        continue;
      }

      // Get clinician email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', followup.user_id)
        .single();

      if (profileError) {
        console.error(`Error fetching profile for user ${followup.user_id}:`, profileError);
        continue;
      }

      const episodeRecord = episode as EpisodeRecord;
      const profileRecord = profile as ProfileRecord;

      reminders.push({
        followupId: followup.id,
        episodeId: followup.episode_id,
        patientName: episodeRecord.patient_name,
        scheduledDate: followup.scheduled_date,
        clinicianEmail: profileRecord.email,
        clinicianName: profileRecord.full_name,
        status: followup.status || 'pending',
      });

      console.log(`Reminder prepared for: ${episodeRecord.patient_name} - ${profileRecord.email}`);
    }

    // Process reminders and send notifications
    console.log(`Processing ${reminders.length} follow-up reminders`);

    for (const reminder of reminders) {
      console.log(`Follow-up reminder: ${reminder.patientName} scheduled for ${reminder.scheduledDate}`);
      
      const currentFollowup = (followups as FollowupRecord[]).find(f => f.id === reminder.followupId);
      if (!currentFollowup) continue;

      // Get clinic settings for notification templates
      const { data: clinicSettings } = await supabase
        .from('clinic_settings')
        .select('*')
        .single();

      // Get patient contact info
      const { data: intakeForm } = await supabase
        .from('intake_forms')
        .select('email, phone')
        .eq('converted_to_episode_id', reminder.episodeId)
        .maybeSingle();

      // Send email notification with rate limiting
      if (intakeForm?.email) {
        const { data: emailRateLimit } = await supabase.rpc('check_rate_limit', {
          p_service_type: 'email',
          p_clinic_id: currentFollowup.clinic_id
        });

        if (emailRateLimit?.allowed) {
          try {
            console.log(`Sending follow-up reminder email to ${intakeForm.email}`);
            // Email sending would be implemented here with Resend or similar service
            
            // Record successful rate limit usage
            await supabase.rpc('record_rate_limit_usage', {
              p_service_type: 'email',
              p_success: true,
              p_clinic_id: currentFollowup.clinic_id,
              p_user_id: currentFollowup.user_id,
              p_episode_id: reminder.episodeId
            });
          } catch (error) {
            console.error('Error sending email:', error);
            await supabase.rpc('record_rate_limit_usage', {
              p_service_type: 'email',
              p_success: false,
              p_clinic_id: currentFollowup.clinic_id,
              p_user_id: currentFollowup.user_id,
              p_episode_id: reminder.episodeId
            });
          }
        } else {
          console.log(`Email rate limit exceeded for clinic ${currentFollowup.clinic_id}`);
        }
      }

      // Send SMS notification with rate limiting
      if (intakeForm?.phone) {
        const { data: smsRateLimit } = await supabase.rpc('check_rate_limit', {
          p_service_type: 'sms',
          p_clinic_id: currentFollowup.clinic_id
        });

        if (smsRateLimit?.allowed) {
          try {
            console.log(`Sending follow-up reminder SMS to ${intakeForm.phone}`);
            // SMS sending would be implemented here with Twilio or similar service
            
            // Record successful rate limit usage
            await supabase.rpc('record_rate_limit_usage', {
              p_service_type: 'sms',
              p_success: true,
              p_clinic_id: currentFollowup.clinic_id,
              p_user_id: currentFollowup.user_id,
              p_episode_id: reminder.episodeId
            });
          } catch (error) {
            console.error('Error sending SMS:', error);
            await supabase.rpc('record_rate_limit_usage', {
              p_service_type: 'sms',
              p_success: false,
              p_clinic_id: currentFollowup.clinic_id,
              p_user_id: currentFollowup.user_id,
              p_episode_id: reminder.episodeId
            });
          }
        } else {
          console.log(`SMS rate limit exceeded for clinic ${currentFollowup.clinic_id}`);
        }
      }

      // Create audit log entry
      await supabase.from('audit_logs').insert({
        table_name: 'followups',
        action: 'reminder_sent',
        record_id: reminder.followupId,
        user_id: currentFollowup.user_id,
        new_data: {
          reminder_type: 'automated_followup',
          scheduled_date: reminder.scheduledDate,
          patient_name: reminder.patientName,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersProcessed: reminders.length,
        reminders: reminders,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-followup-reminders:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
