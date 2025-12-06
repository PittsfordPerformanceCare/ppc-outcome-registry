import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateLeadRequest {
  full_name: string;
  email?: string;
  phone?: string;
  who_is_this_for?: string;
  primary_concern?: string;
  symptom_summary?: string;
  preferred_contact_method?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  origin_page?: string;
  origin_cta?: string;
  pillar_origin?: string;
  notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: CreateLeadRequest = await req.json();
    
    console.log('[create-lead] Received request:', JSON.stringify(body, null, 2));

    // Validation: full_name is required
    if (!body.full_name || body.full_name.trim() === '') {
      console.log('[create-lead] Validation failed: full_name is required');
      return new Response(
        JSON.stringify({ error: 'full_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation: at least one of email or phone is required
    if ((!body.email || body.email.trim() === '') && (!body.phone || body.phone.trim() === '')) {
      console.log('[create-lead] Validation failed: email or phone required');
      return new Response(
        JSON.stringify({ error: 'At least one of email or phone is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build lead data - mapping to existing leads table columns
    // Note: who_is_this_for, primary_concern, symptom_summary, preferred_contact_method, notes
    // are not in the current schema - storing primary_concern in system_category for now
    const leadData = {
      name: body.full_name.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_content: body.utm_content || null,
      origin_page: body.origin_page || null,
      origin_cta: body.origin_cta || null,
      pillar_origin: body.pillar_origin || null,
      // Map primary_concern to system_category if provided
      system_category: body.primary_concern || null,
      checkpoint_status: 'lead_created',
      funnel_stage: 'lead',
    };

    console.log('[create-lead] Inserting lead:', JSON.stringify(leadData, null, 2));

    // Insert into leads table
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select('id')
      .single();

    if (error) {
      console.error('[create-lead] Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[create-lead] Lead created successfully:', data.id);

    // Log to audit_logs
    try {
      await supabase.from('audit_logs').insert({
        action: 'lead_created_via_api',
        table_name: 'leads',
        record_id: data.id,
        new_data: {
          ...leadData,
          source: 'create-lead-api',
          // Store additional fields that aren't in leads table for reference
          _extra: {
            who_is_this_for: body.who_is_this_for,
            symptom_summary: body.symptom_summary,
            preferred_contact_method: body.preferred_contact_method,
            notes: body.notes,
          }
        }
      });
    } catch (auditError) {
      console.error('[create-lead] Audit log error (non-fatal):', auditError);
    }

    return new Response(
      JSON.stringify({ success: true, lead_id: data.id }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[create-lead] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
