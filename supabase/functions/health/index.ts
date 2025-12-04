import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Health check should be publicly accessible
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({
          status: "error",
          db: "config_error",
          message: "Missing environment configuration",
          timestamp,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Perform DB health check - simple query against profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      console.error("[Health Check] DB error:", error);
      return new Response(
        JSON.stringify({
          status: "error",
          db: "unreachable",
          error: error.message,
          timestamp,
          response_time_ms: responseTime,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Success response
    return new Response(
      JSON.stringify({
        status: "ok",
        db: "ok",
        timestamp,
        response_time_ms: responseTime,
        app: "ppc-outcome-registry",
        version: "1.0.0",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const responseTime = Date.now() - startTime;
    console.error("[Health Check] Unexpected error:", err);

    return new Response(
      JSON.stringify({
        status: "error",
        db: "unknown",
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp,
        response_time_ms: responseTime,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
