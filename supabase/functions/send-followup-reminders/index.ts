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

    // In a production environment, you would:
    // 1. Send emails using a service like Resend, SendGrid, or AWS SES
    // 2. Create in-app notifications
    // 3. Send SMS reminders if phone numbers are available
    
    // For now, we'll log the reminders and could integrate with notification system
    console.log(`Processed ${reminders.length} follow-up reminders`);

    // You could also create audit log entries or notifications here
    for (const reminder of reminders) {
      console.log(`Follow-up reminder: ${reminder.patientName} scheduled for ${reminder.scheduledDate}`);
      
      // Example: Create an audit log entry
      const currentFollowup = (followups as FollowupRecord[]).find(f => f.id === reminder.followupId);
      if (currentFollowup) {
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
