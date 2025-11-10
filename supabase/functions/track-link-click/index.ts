import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const url = new URL(req.url);
    const notificationId = url.searchParams.get('nid');
    const targetUrl = url.searchParams.get('url');
    const label = url.searchParams.get('label');

    if (!notificationId || !targetUrl) {
      console.log('Missing notification ID or target URL');
      return new Response('Invalid tracking link', { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Tracking link click for notification:', notificationId);

    // Get user agent and IP
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

    // Decode the target URL
    const decodedUrl = decodeURIComponent(targetUrl);

    // Record the click
    const { error: insertError } = await supabase
      .from('notification_link_clicks')
      .insert({
        notification_id: notificationId,
        link_url: decodedUrl,
        link_label: label || null,
        user_agent: userAgent,
        ip_address: ipAddress,
      });

    if (insertError) {
      console.error('Error recording click:', insertError);
    }

    // Update notification history with click count
    const { data: notification } = await supabase
      .from('notifications_history')
      .select('click_count, first_clicked_at')
      .eq('id', notificationId)
      .single();

    if (notification) {
      const updates: any = {
        click_count: (notification.click_count || 0) + 1,
      };

      if (!notification.first_clicked_at) {
        updates.first_clicked_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('notifications_history')
        .update(updates)
        .eq('id', notificationId);

      if (updateError) {
        console.error('Error updating notification:', updateError);
      } else {
        console.log('Successfully tracked link click');
      }
    }

    // Redirect to the target URL
    return new Response(null, {
      status: 302,
      headers: {
        'Location': decodedUrl,
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in track-link-click function:', error);
    // Redirect to a fallback URL on error
    return new Response('Error tracking click', {
      status: 500,
      headers: corsHeaders,
    });
  }
};

serve(handler);
