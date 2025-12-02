import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Array<{ email: string }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { syncType = 'manual', triggeredBy } = await req.json();

    console.log(`Starting calendar sync (${syncType})`);

    // Get active calendar connection
    const { data: connection, error: connError } = await supabase
      .from('google_calendar_connections')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (connError || !connection) {
      console.error('No active calendar connection found:', connError);
      return new Response(
        JSON.stringify({ error: 'No active calendar connection' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create sync history record
    const { data: syncRecord, error: syncError } = await supabase
      .from('calendar_sync_history')
      .insert({
        connection_id: connection.id,
        sync_type: syncType,
        triggered_by: triggeredBy,
      })
      .select()
      .single();

    if (syncError) {
      console.error('Error creating sync record:', syncError);
      throw syncError;
    }

    try {
      // Check if token needs refresh
      const tokenExpiry = new Date(connection.token_expiry);
      let accessToken = connection.access_token;

      if (tokenExpiry <= new Date()) {
        console.log('Token expired, refreshing...');
        
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
            client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
            refresh_token: connection.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to refresh token');
        }

        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;

        // Update stored token
        await supabase
          .from('google_calendar_connections')
          .update({
            access_token: tokenData.access_token,
            token_expiry: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          })
          .eq('id', connection.id);
      }

      // Get submitted intakes without appointments
      const { data: intakes, error: intakesError } = await supabase
        .from('intake_forms')
        .select('id, patient_name, email, submitted_at')
        .eq('status', 'submitted')
        .is('converted_to_episode_id', null)
        .not('submitted_at', 'is', null);

      if (intakesError) {
        console.error('Error fetching intakes:', intakesError);
        throw intakesError;
      }

      let appointmentsChecked = 0;
      let appointmentsFound = 0;

      // For each intake, check if there's a matching appointment
      for (const intake of intakes || []) {
        appointmentsChecked++;

        // Check if already has an appointment record
        const { data: existingAppt } = await supabase
          .from('intake_appointments')
          .select('id')
          .eq('intake_form_id', intake.id)
          .single();

        if (existingAppt) {
          continue; // Already tracked
        }

        // Search Google Calendar for events with patient email or name
        const searchParams = new URLSearchParams({
          timeMin: new Date(intake.submitted_at).toISOString(),
          timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ahead
          q: intake.patient_name,
          singleEvents: 'true',
          orderBy: 'startTime',
        });

        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${connection.calendar_id}/events?${searchParams}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!calendarResponse.ok) {
          console.error(`Calendar API error for intake ${intake.id}`);
          continue;
        }

        const calendarData = await calendarResponse.json();
        const events: CalendarEvent[] = calendarData.items || [];

        // Check if any event matches this patient
        for (const event of events) {
          const matchesName = event.summary?.toLowerCase().includes(intake.patient_name.toLowerCase());
          const matchesEmail = intake.email && event.attendees?.some(a => a.email === intake.email);

          if (matchesName || matchesEmail) {
            const startDateTime = event.start.dateTime || event.start.date;
            if (!startDateTime) continue;

            const eventDate = new Date(startDateTime);
            
            // Create appointment record
            await supabase.from('intake_appointments').insert({
              intake_form_id: intake.id,
              google_event_id: event.id,
              scheduled_date: eventDate.toISOString().split('T')[0],
              scheduled_time: eventDate.toTimeString().split(' ')[0],
              calendar_connection_id: connection.id,
              patient_name: intake.patient_name,
              patient_email: intake.email,
              status: 'scheduled',
              synced_at: new Date().toISOString(),
            });

            appointmentsFound++;
            console.log(`Found appointment for ${intake.patient_name}`);
            break; // Found a match, move to next intake
          }
        }
      }

      // Update sync record as completed
      await supabase
        .from('calendar_sync_history')
        .update({
          appointments_checked: appointmentsChecked,
          appointments_found: appointmentsFound,
          completed_at: new Date().toISOString(),
          status: 'completed',
        })
        .eq('id', syncRecord.id);

      console.log(`Sync completed: ${appointmentsFound}/${appointmentsChecked} appointments found`);

      return new Response(
        JSON.stringify({
          success: true,
          appointmentsChecked,
          appointmentsFound,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      // Update sync record as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await supabase
        .from('calendar_sync_history')
        .update({
          completed_at: new Date().toISOString(),
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', syncRecord.id);

      throw error;
    }
  } catch (error) {
    console.error('Error syncing calendar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});