import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RateLimitResult {
  allowed: boolean;
  limitType: string | null;
  currentCount: number;
  maxAllowed: number;
  resetAt: string | null;
}

/**
 * Check and record rate limit for a service
 * @param serviceType - The type of service (e.g., 'lead_submission', 'intake_form', 'referral')
 * @param clientIp - Client IP address for tracking
 * @returns RateLimitResult indicating if request is allowed
 */
export async function checkRateLimit(
  serviceType: string,
  clientIp: string | null
): Promise<RateLimitResult> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check rate limit using the database function
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_service_type: serviceType,
    });

    if (error) {
      console.error("[rate-limiter] Error checking rate limit:", error);
      // Fail open - allow request if rate limit check fails
      return {
        allowed: true,
        limitType: null,
        currentCount: 0,
        maxAllowed: 0,
        resetAt: null,
      };
    }

    const result = data?.[0];
    if (!result) {
      // No rate limit configured - allow
      return {
        allowed: true,
        limitType: null,
        currentCount: 0,
        maxAllowed: 0,
        resetAt: null,
      };
    }

    return {
      allowed: result.allowed,
      limitType: result.limit_type,
      currentCount: Number(result.current_count),
      maxAllowed: result.max_allowed,
      resetAt: result.reset_at,
    };
  } catch (err) {
    console.error("[rate-limiter] Unexpected error:", err);
    // Fail open
    return {
      allowed: true,
      limitType: null,
      currentCount: 0,
      maxAllowed: 0,
      resetAt: null,
    };
  }
}

/**
 * Record a rate limit usage event
 */
export async function recordRateLimitUsage(
  serviceType: string,
  success: boolean,
  episodeId?: string
): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    await supabase.rpc("record_rate_limit_usage", {
      p_service_type: serviceType,
      p_success: success,
      p_episode_id: episodeId || null,
    });
  } catch (err) {
    console.error("[rate-limiter] Error recording usage:", err);
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(req: Request): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    null
  );
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      limitType: result.limitType,
      retryAfter: result.resetAt,
      message: `Too many requests. Please try again ${result.resetAt ? `after ${result.resetAt}` : "later"}.`,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": result.resetAt || "60",
      },
    }
  );
}
