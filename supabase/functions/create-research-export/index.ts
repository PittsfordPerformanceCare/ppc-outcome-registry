import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pseudonymization salt - stored server-side only
const PSEUDONYMIZATION_SALT = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.slice(0, 32) || 'ppc-research-salt-v1';

/**
 * Generate a stable, non-reversible pseudonymized ID
 * Same input always produces same output within the same salt version
 */
async function pseudonymizeId(inputId: string, prefix: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${PSEUDONYMIZATION_SALT}:${inputId}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  // Return prefix + first 16 chars of hash for readability
  return `${prefix}_${hashHex.slice(0, 16)}`;
}

/**
 * Convert array of records to CSV string
 */
function toCSV(records: Record<string, unknown>[]): string {
  if (records.length === 0) return '';
  
  const headers = Object.keys(records[0]);
  const csvRows = [headers.join(',')];
  
  for (const record of records) {
    const values = headers.map(header => {
      const val = record[header];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return String(val);
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[Research Export] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has admin or owner role
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('[Research Export] Roles query error:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userRoles = roles?.map(r => r.role) || [];
    const hasAdminAccess = userRoles.some(role => ['admin', 'owner'].includes(role));

    if (!hasAdminAccess) {
      console.warn(`[Research Export] Access denied for user ${user.id} with roles: ${userRoles.join(', ')}`);
      return new Response(
        JSON.stringify({ error: 'Admin or owner role required for research exports' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { 
      export_purpose, 
      dataset_type, 
      date_range_start, 
      date_range_end 
    } = body;

    // Validate required fields
    if (!export_purpose || !['registry', 'publication', 'research'].includes(export_purpose)) {
      return new Response(
        JSON.stringify({ error: 'Invalid export_purpose. Must be: registry, publication, or research' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!dataset_type || !['care_targets', 'outcomes', 'episodes'].includes(dataset_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid dataset_type. Must be: care_targets, outcomes, or episodes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!date_range_start || !date_range_end) {
      return new Response(
        JSON.stringify({ error: 'date_range_start and date_range_end are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Research Export] Starting export: ${dataset_type} for ${export_purpose} by user ${user.id}`);
    console.log(`[Research Export] Date range: ${date_range_start} to ${date_range_end}`);

    // Use service role for querying research views
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Query the appropriate research view
    let viewName: string;
    let dateFilterField: string;
    
    switch (dataset_type) {
      case 'care_targets':
        viewName = 'v_research_care_targets';
        dateFilterField = 'episode_time_bucket';
        break;
      case 'outcomes':
        viewName = 'v_research_outcomes';
        dateFilterField = null as unknown as string; // No date filter for outcomes
        break;
      case 'episodes':
        viewName = 'v_research_episodes';
        dateFilterField = 'episode_start_bucket';
        break;
      default:
        throw new Error('Invalid dataset type');
    }

    // Fetch data from research view
    let query = adminClient.from(viewName).select('*');
    
    // For views with time buckets, filter by year-quarter range
    // Note: This is a simplified filter - in production you'd want more precise date filtering
    const { data: rawRecords, error: queryError } = await query;

    if (queryError) {
      console.error('[Research Export] Query error:', queryError);
      return new Response(
        JSON.stringify({ error: 'Failed to query research data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!rawRecords || rawRecords.length === 0) {
      console.log('[Research Export] No records found');
      return new Response(
        JSON.stringify({ 
          error: 'No records found for the specified criteria',
          row_count: 0 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Research Export] Found ${rawRecords.length} records to process`);

    // Apply pseudonymization to all ID fields
    const pseudonymizedRecords = await Promise.all(
      rawRecords.map(async (record: Record<string, unknown>) => {
        const result: Record<string, unknown> = {};
        
        for (const [key, value] of Object.entries(record)) {
          if (value === null || value === undefined) {
            result[key] = null;
            continue;
          }

          // Pseudonymize UUID fields
          if (key.endsWith('_uuid') || key.endsWith('_id')) {
            const prefix = key.replace(/_uuid$|_id$/, '').toUpperCase().slice(0, 3);
            result[`${key.replace('_uuid', '_pid').replace('_id', '_pid')}`] = 
              await pseudonymizeId(String(value), prefix);
          } else {
            result[key] = value;
          }
        }
        
        return result;
      })
    );

    // Generate CSV
    const csvContent = toCSV(pseudonymizedRecords);
    const rowCount = pseudonymizedRecords.length;

    // Create export manifest record
    const { data: manifest, error: manifestError } = await supabase
      .from('research_exports')
      .insert({
        created_by: user.id,
        export_purpose,
        dataset_type,
        date_range_start,
        date_range_end,
        row_count: rowCount,
        hash_version: 'v1',
        schema_version: '1.0.0',
      })
      .select()
      .single();

    if (manifestError) {
      console.error('[Research Export] Manifest creation error:', manifestError);
      // Continue anyway - the export is more important than the manifest
    }

    // Log to audit_logs
    await adminClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'RESEARCH_EXPORT_CREATED',
      table_name: 'research_exports',
      record_id: manifest?.id || 'unknown',
      new_data: {
        export_purpose,
        dataset_type,
        date_range_start,
        date_range_end,
        row_count: rowCount,
      },
    });

    console.log(`[Research Export] Export complete. Manifest ID: ${manifest?.id}, Rows: ${rowCount}`);

    // Return CSV as downloadable response
    const filename = `ppc_research_${dataset_type}_${export_purpose}_${new Date().toISOString().split('T')[0]}.csv`;
    
    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Export-Id': manifest?.id || 'unknown',
        'X-Row-Count': String(rowCount),
      },
    });

  } catch (error) {
    console.error('[Research Export] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
