import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

type FunnelEventType = 
  | "lead_submission_failed"
  | "lead_submission_success"
  | "intake_completion_failed"
  | "intake_completion_success"
  | "intake_start_failed"
  | "intake_validation_failed";

interface FunnelAuditData {
  event_type: FunnelEventType;
  route: string;
  error_message?: string;
  error_code?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log funnel events (lead submissions, intake completions) to audit_logs
 * Uses existing audit_logs table with event_type in the action field
 */
export async function logFunnelEvent(data: FunnelAuditData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get clinic_id from profile if user is logged in
    let clinicId: string | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .maybeSingle();
      clinicId = profile?.clinic_id || null;
    }

    // Prepare audit log entry with proper typing
    const newData: Json = {
      route: data.route,
      error_message: data.error_message || null,
      error_code: data.error_code || null,
      metadata: (data.metadata || {}) as Json,
      timestamp: new Date().toISOString(),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "server",
    };

    const auditEntry = {
      action: data.event_type as string,
      table_name: "funnel_events",
      record_id: `funnel_${Date.now()}`,
      user_id: user?.id || null,
      clinic_id: clinicId,
      old_data: null as Json,
      new_data: newData,
    };

    const { error } = await supabase
      .from("audit_logs")
      .insert([auditEntry]);

    if (error) {
      console.error("[FunnelAudit] Failed to log event:", error);
    } else {
      console.log("[FunnelAudit] Event logged:", data.event_type);
    }
  } catch (err) {
    // Don't throw - audit logging should never break the main flow
    console.error("[FunnelAudit] Error logging event:", err);
  }
}

/**
 * Log a failed lead submission attempt
 */
export async function logLeadSubmissionFailed(
  route: string,
  errorMessage: string,
  metadata?: Record<string, unknown>
) {
  await logFunnelEvent({
    event_type: "lead_submission_failed",
    route,
    error_message: errorMessage,
    metadata,
  });
}

/**
 * Log a successful lead submission
 */
export async function logLeadSubmissionSuccess(
  route: string,
  leadId: string,
  metadata?: Record<string, unknown>
) {
  await logFunnelEvent({
    event_type: "lead_submission_success",
    route,
    metadata: { lead_id: leadId, ...metadata },
  });
}

/**
 * Log a failed intake completion attempt
 */
export async function logIntakeCompletionFailed(
  route: string,
  errorMessage: string,
  metadata?: Record<string, unknown>
) {
  await logFunnelEvent({
    event_type: "intake_completion_failed",
    route,
    error_message: errorMessage,
    metadata,
  });
}

/**
 * Log a successful intake completion
 */
export async function logIntakeCompletionSuccess(
  route: string,
  intakeId: string,
  metadata?: Record<string, unknown>
) {
  await logFunnelEvent({
    event_type: "intake_completion_success",
    route,
    metadata: { intake_id: intakeId, ...metadata },
  });
}

/**
 * Log intake start failures
 */
export async function logIntakeStartFailed(
  route: string,
  errorMessage: string,
  metadata?: Record<string, unknown>
) {
  await logFunnelEvent({
    event_type: "intake_start_failed",
    route,
    error_message: errorMessage,
    metadata,
  });
}

/**
 * Log intake validation failures
 */
export async function logIntakeValidationFailed(
  route: string,
  errorMessage: string,
  validationErrors?: Record<string, string[]>
) {
  await logFunnelEvent({
    event_type: "intake_validation_failed",
    route,
    error_message: errorMessage,
    metadata: { validation_errors: validationErrors },
  });
}
