import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get('id');

    if (!trackingId) {
      return new Response('Missing tracking ID', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current delivery record
    const { data: delivery, error: fetchError } = await supabase
      .from('comparison_report_deliveries')
      .select('open_count, opened_at')
      .eq('tracking_id', trackingId)
      .single();

    if (fetchError) {
      console.error('Error fetching delivery:', fetchError);
      return transparentPixel();
    }

    // Update open tracking
    const updateData: any = {
      open_count: (delivery?.open_count || 0) + 1,
    };

    // Set opened_at only on first open
    if (!delivery?.opened_at) {
      updateData.opened_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('comparison_report_deliveries')
      .update(updateData)
      .eq('tracking_id', trackingId);

    if (updateError) {
      console.error('Error updating delivery:', updateError);
    }

    return transparentPixel();
  } catch (error) {
    console.error('Error in track-comparison-open:', error);
    return transparentPixel();
  }
});

function transparentPixel(): Response {
  // 1x1 transparent GIF
  const gif = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), c => c.charCodeAt(0));
  
  return new Response(gif, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      ...corsHeaders,
    },
  });
}
