import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

export type FunnelStage = 
  | "landing"
  | "severity-check"
  | "intake-started"
  | "intake-completed"
  | "schedule-eval"
  | "episode-created";

export type PillarOrigin = 
  | "hub"
  | "concussion_pillar"
  | "msk_pillar"
  | "registry"
  | "direct";

export interface CTATrackingParams {
  // UTM Parameters
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  // Origin tracking
  origin_page: string;
  origin_cta: string | null;
  // Funnel tracking
  funnel_stage: FunnelStage;
  pillar_origin: PillarOrigin;
}

/**
 * Enhanced CTA tracking hook that captures UTM parameters, origin info,
 * funnel stage, and pillar origin for unified ecosystem analytics.
 * 
 * Usage:
 * const tracking = useCTATracking({ funnelStage: "intake-started", ctaLabel: "start-intake-btn" });
 */
export function useCTATracking(options?: {
  funnelStage?: FunnelStage;
  ctaLabel?: string;
}): CTATrackingParams {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const trackingParams = useMemo<CTATrackingParams>(() => {
    if (typeof window === "undefined") {
      return {
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        origin_page: "/",
        origin_cta: null,
        funnel_stage: "landing",
        pillar_origin: "direct",
      };
    }

    // Parse UTM parameters
    const utm_source = searchParams.get("utm_source");
    const utm_medium = searchParams.get("utm_medium");
    const utm_campaign = searchParams.get("utm_campaign");
    const utm_content = searchParams.get("utm_content");

    // Parse origin tracking
    const origin_page = searchParams.get("origin_page") || location.pathname;
    const origin_cta = searchParams.get("origin_cta") || options?.ctaLabel || null;

    // Parse funnel stage - from URL or from options
    const urlFunnelStage = searchParams.get("funnel_stage") as FunnelStage | null;
    const funnel_stage: FunnelStage = urlFunnelStage || options?.funnelStage || "landing";

    // Parse pillar origin - derive from source or URL param
    const urlPillarOrigin = searchParams.get("pillar_origin") as PillarOrigin | null;
    let pillar_origin: PillarOrigin = urlPillarOrigin || "direct";
    
    // Auto-detect pillar origin from utm_source or source param
    if (!urlPillarOrigin) {
      const source = searchParams.get("source") || utm_source || "";
      if (source.includes("hub") || source.includes("ppc-website")) {
        pillar_origin = "hub";
      } else if (source.includes("concussion") || source.includes("neuro")) {
        pillar_origin = "concussion_pillar";
      } else if (source.includes("msk") || source.includes("musculoskeletal")) {
        pillar_origin = "msk_pillar";
      } else if (source.includes("registry") || source.includes("outcome")) {
        pillar_origin = "registry";
      }
    }

    return {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      origin_page,
      origin_cta,
      funnel_stage,
      pillar_origin,
    };
  }, [searchParams, location.pathname, options?.funnelStage, options?.ctaLabel]);

  return trackingParams;
}

/**
 * Build a URL with tracking parameters for CTA links
 */
export function buildTrackedURL(
  baseUrl: string,
  tracking: Partial<CTATrackingParams> & { ctaLabel?: string }
): string {
  const url = new URL(baseUrl, window.location.origin);
  
  if (tracking.utm_source) url.searchParams.set("utm_source", tracking.utm_source);
  if (tracking.utm_medium) url.searchParams.set("utm_medium", tracking.utm_medium);
  if (tracking.utm_campaign) url.searchParams.set("utm_campaign", tracking.utm_campaign);
  if (tracking.utm_content) url.searchParams.set("utm_content", tracking.utm_content);
  if (tracking.origin_page) url.searchParams.set("origin_page", tracking.origin_page);
  if (tracking.origin_cta || tracking.ctaLabel) {
    url.searchParams.set("origin_cta", tracking.origin_cta || tracking.ctaLabel || "");
  }
  if (tracking.funnel_stage) url.searchParams.set("funnel_stage", tracking.funnel_stage);
  if (tracking.pillar_origin) url.searchParams.set("pillar_origin", tracking.pillar_origin);
  
  return url.toString();
}

/**
 * Merge current tracking params with new values for downstream navigation
 */
export function extendTracking(
  current: CTATrackingParams,
  updates: Partial<CTATrackingParams>
): CTATrackingParams {
  return {
    ...current,
    ...updates,
  };
}
