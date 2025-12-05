import { supabase } from "@/integrations/supabase/client";
import type { CTATrackingParams, FunnelStage, PillarOrigin } from "@/hooks/useCTATracking";

/**
 * Unified Lead Tracking Library
 * 
 * This library provides a single source of truth for:
 * - UTM capture
 * - CTA identity tracking
 * - Intake event logging
 * - Lead creation event logging
 * - Episode creation attribution
 * - Conversion analytics
 */

export interface LeadSubmissionData {
  // Required fields
  email: string;
  
  // Optional patient/contact info
  name?: string;
  phone?: string;
  persona?: "self" | "parent" | "professional";
  
  // Medical info
  primary_concern?: string;
  symptom_profile?: string;
  duration?: string;
  severity_score?: number;
  system_category?: string;
  
  // Parent-specific
  parent_name?: string;
  child_name?: string;
  child_age?: string;
  symptom_location?: string;
  
  // Professional-specific
  referrer_name?: string;
  role?: string;
  organization?: string;
  patient_name?: string;
  patient_age?: string;
  urgency?: string;
  notes?: string;
  
  // Tracking params (from useCTATracking hook)
  tracking?: CTATrackingParams;
}

export interface LeadSubmissionResult {
  success: boolean;
  leadId?: string;
  error?: string;
}

/**
 * Submit a neurologic intake lead with full tracking attribution
 */
export async function submitNeurologicLead(
  data: LeadSubmissionData
): Promise<LeadSubmissionResult> {
  const tracking = data.tracking;
  
  try {
    const { data: result, error } = await supabase
      .from("neurologic_intake_leads")
      .insert({
        email: data.email,
        name: data.name || null,
        phone: data.phone || null,
        persona: data.persona || "self",
        primary_concern: data.primary_concern || null,
        symptom_profile: data.symptom_profile || null,
        duration: data.duration || null,
        parent_name: data.parent_name || null,
        child_name: data.child_name || null,
        child_age: data.child_age || null,
        symptom_location: data.symptom_location || null,
        referrer_name: data.referrer_name || null,
        role: data.role || null,
        organization: data.organization || null,
        patient_name: data.patient_name || null,
        patient_age: data.patient_age || null,
        urgency: data.urgency || "routine",
        notes: data.notes || null,
        source: tracking?.pillar_origin || "direct",
        status: "new",
        // UTM tracking
        utm_source: tracking?.utm_source || null,
        utm_medium: tracking?.utm_medium || null,
        utm_campaign: tracking?.utm_campaign || null,
        utm_content: tracking?.utm_content || null,
        // Origin tracking
        origin_page: tracking?.origin_page || null,
        origin_cta: tracking?.origin_cta || null,
        // Funnel tracking
        funnel_stage: tracking?.funnel_stage || "landing",
        pillar_origin: tracking?.pillar_origin || "direct",
      })
      .select()
      .single();

    if (error) {
      console.error("[LeadTracking] Failed to submit lead:", error);
      await logLeadEvent("lead_submission_failed", {
        email: data.email,
        error_message: error.message,
        tracking,
      });
      return { success: false, error: error.message };
    }

    console.log("[LeadTracking] Lead submitted:", result.id);
    await logLeadEvent("lead_submission_success", {
      lead_id: result.id,
      email: data.email,
      tracking,
    });

    return { success: true, leadId: result.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[LeadTracking] Exception:", message);
    return { success: false, error: message };
  }
}

/**
 * Submit a lead to the main leads table (for severity check, etc.)
 */
export async function submitLead(data: {
  email?: string;
  name?: string;
  phone?: string;
  severity_score?: number;
  system_category?: string;
  tracking?: CTATrackingParams;
}): Promise<LeadSubmissionResult> {
  const tracking = data.tracking;
  
  try {
    const { data: result, error } = await supabase
      .from("leads")
      .insert({
        email: data.email || null,
        name: data.name || null,
        phone: data.phone || null,
        severity_score: data.severity_score || null,
        system_category: data.system_category || null,
        checkpoint_status: "lead_created",
        // UTM tracking
        utm_source: tracking?.utm_source || null,
        utm_medium: tracking?.utm_medium || null,
        utm_campaign: tracking?.utm_campaign || null,
        utm_content: tracking?.utm_content || null,
        // Origin tracking
        origin_page: tracking?.origin_page || null,
        origin_cta: tracking?.origin_cta || null,
        // Funnel tracking
        funnel_stage: tracking?.funnel_stage || "landing",
        pillar_origin: tracking?.pillar_origin || "direct",
      })
      .select()
      .single();

    if (error) {
      console.error("[LeadTracking] Failed to submit lead:", error);
      return { success: false, error: error.message };
    }

    console.log("[LeadTracking] Lead created:", result.id);
    return { success: true, leadId: result.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Update lead funnel stage (progression tracking)
 */
export async function updateLeadFunnelStage(
  leadId: string,
  funnelStage: FunnelStage,
  additionalData?: Record<string, unknown>
): Promise<boolean> {
  try {
    const updateData: Record<string, unknown> = {
      funnel_stage: funnelStage,
    };

    // Set timestamp fields based on funnel stage
    if (funnelStage === "intake-completed") {
      updateData.intake_completed_at = new Date().toISOString();
    } else if (funnelStage === "episode-created") {
      updateData.episode_opened_at = new Date().toISOString();
    }

    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    const { error } = await supabase
      .from("leads")
      .update(updateData)
      .eq("id", leadId);

    if (error) {
      console.error("[LeadTracking] Failed to update funnel stage:", error);
      return false;
    }

    console.log("[LeadTracking] Funnel stage updated:", funnelStage);
    return true;
  } catch (err) {
    console.error("[LeadTracking] Exception updating funnel stage:", err);
    return false;
  }
}

/**
 * Log a lead-related event to audit_logs
 */
async function logLeadEvent(
  action: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from("audit_logs").insert({
      action,
      table_name: "lead_events",
      record_id: `event_${Date.now()}`,
      new_data: {
        ...data,
        timestamp: new Date().toISOString(),
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "server",
      },
    });
  } catch (err) {
    // Non-blocking - don't fail the main operation
    console.error("[LeadTracking] Failed to log event:", err);
  }
}

/**
 * Track CTA click event (for analytics)
 */
export async function trackCTAClick(
  ctaLabel: string,
  tracking: CTATrackingParams,
  destinationUrl?: string
): Promise<void> {
  try {
    await supabase.from("audit_logs").insert({
      action: "cta_click",
      table_name: "cta_events",
      record_id: `cta_${Date.now()}`,
      new_data: {
        cta_label: ctaLabel,
        destination_url: destinationUrl,
        ...tracking,
        timestamp: new Date().toISOString(),
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "server",
      },
    });
  } catch (err) {
    console.error("[LeadTracking] Failed to track CTA click:", err);
  }
}
