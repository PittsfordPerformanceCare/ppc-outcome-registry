import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 1x1 transparent pixel in base64
const TRACKING_PIXEL = Uint8Array.from(atob(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
), c => c.charCodeAt(0));

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get('id');

    if (!trackingId) {
      console.log('No tracking ID provided');
      return new Response(TRACKING_PIXEL, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...corsHeaders,
        },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Tracking email open for ID:', trackingId);

    // Update notification history with open event
    const { data, error } = await supabase
      .from('notifications_history')
      .select('opened_at, open_count')
      .eq('tracking_id', trackingId)
      .single();

    if (error) {
      console.error('Error fetching notification:', error);
    } else if (data) {
      // Increment open count and set opened_at if first open
      const updates: any = {
        open_count: (data.open_count || 0) + 1,
      };

      if (!data.opened_at) {
        updates.opened_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('notifications_history')
        .update(updates)
        .eq('tracking_id', trackingId);

      if (updateError) {
        console.error('Error updating notification:', updateError);
      } else {
        console.log('Successfully tracked email open');
      }
    }

    // Always return the tracking pixel
    return new Response(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in track-email-open function:', error);
    // Still return the pixel even on error
    return new Response(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
