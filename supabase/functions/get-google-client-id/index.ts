import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching Google Client ID');

    // Get the Google Client ID from environment (it's public and safe to expose)
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');

    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID not configured');
      throw new Error('Google Client ID not configured. Please add it in the backend secrets.');
    }

    console.log('Successfully retrieved Google Client ID');

    return new Response(
      JSON.stringify({ clientId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in get-google-client-id:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
