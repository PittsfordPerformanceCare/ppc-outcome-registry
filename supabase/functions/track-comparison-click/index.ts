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
    const targetUrl = url.searchParams.get('url');
    const label = url.searchParams.get('label');

    if (!trackingId || !targetUrl) {
      return new Response('Missing parameters', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get delivery ID from tracking ID
    const { data: delivery, error: fetchError } = await supabase
      .from('comparison_report_deliveries')
      .select('id, click_count, first_clicked_at')
      .eq('tracking_id', trackingId)
      .single();

    if (fetchError) {
      console.error('Error fetching delivery:', fetchError);
      return Response.redirect(decodeURIComponent(targetUrl), 302);
    }

    // Record click
    const { error: clickError } = await supabase
      .from('comparison_report_clicks')
      .insert({
        delivery_id: delivery.id,
        link_url: decodeURIComponent(targetUrl),
        link_label: label ? decodeURIComponent(label) : null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
      });

    if (clickError) {
      console.error('Error recording click:', clickError);
    }

    // Update click count
    const updateData: any = {
      click_count: (delivery.click_count || 0) + 1,
    };

    if (!delivery.first_clicked_at) {
      updateData.first_clicked_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('comparison_report_deliveries')
      .update(updateData)
      .eq('id', delivery.id);

    if (updateError) {
      console.error('Error updating delivery:', updateError);
    }

    // Redirect to target URL
    return Response.redirect(decodeURIComponent(targetUrl), 302);
  } catch (error) {
    console.error('Error in track-comparison-click:', error);
    // Still redirect on error
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    if (targetUrl) {
      return Response.redirect(decodeURIComponent(targetUrl), 302);
    }
    return new Response('Error', { status: 500 });
  }
});
