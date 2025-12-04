import * as Sentry from "@sentry/react";
import { onLCP, onINP, onCLS, onFCP, onTTFB } from "web-vitals";

const APP_NAME = "ppc-outcome-registry";
const ENVIRONMENT = import.meta.env.MODE || "development";

// Critical routes to monitor
const CRITICAL_ROUTES = [
  "/start-neurologic-intake",
  "/neurologic-intake",
  "/admin",
  "/dashboard",
  "/intake-review",
  "/concussion-neurologic-recovery-guide",
];

export function initMonitoring(dsn?: string) {
  // Initialize Sentry if DSN is provided
  if (dsn) {
    Sentry.init({
      dsn,
      environment: ENVIRONMENT,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // Add app context
        event.tags = {
          ...event.tags,
          app: APP_NAME,
          env: ENVIRONMENT,
        };
        return event;
      },
    });
  }

  // Initialize Web Vitals tracking
  initWebVitals();
}

function initWebVitals() {
  const sendToAnalytics = (metric: { name: string; value: number; id: string }) => {
    const route = window.location.pathname;
    const isCriticalRoute = CRITICAL_ROUTES.some(r => route.startsWith(r));

    const vitalsData = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      route,
      app: APP_NAME,
      env: ENVIRONMENT,
      isCriticalRoute,
      timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (ENVIRONMENT === "development") {
      console.log("[Web Vitals]", vitalsData);
    }

    // Send to Sentry as custom event
    if (Sentry.getClient()) {
      Sentry.addBreadcrumb({
        category: "web-vitals",
        message: `${metric.name}: ${metric.value}`,
        level: "info",
        data: vitalsData,
      });

      // Report poor performance as warnings
      const thresholds: Record<string, number> = {
        LCP: 2500,
        INP: 200,
        CLS: 0.1,
        FCP: 1800,
        TTFB: 800,
      };

      if (thresholds[metric.name] && metric.value > thresholds[metric.name]) {
        Sentry.captureMessage(`Poor ${metric.name}: ${metric.value}ms on ${route}`, {
          level: "warning",
          tags: { metric: metric.name, route },
          extra: vitalsData,
        });
      }
    }

    // Store vitals in localStorage for debugging
    try {
      const stored = JSON.parse(localStorage.getItem("web_vitals") || "[]");
      stored.push(vitalsData);
      // Keep only last 50 entries
      if (stored.length > 50) stored.shift();
      localStorage.setItem("web_vitals", JSON.stringify(stored));
    } catch {
      // Ignore storage errors
    }
  };

  // Core Web Vitals
  onLCP(sendToAnalytics);
  onINP(sendToAnalytics);
  onCLS(sendToAnalytics);
  
  // Additional metrics
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// Error tracking utilities
export function captureError(error: Error, context?: Record<string, unknown>) {
  const route = window.location.pathname;
  
  console.error("[Error Captured]", error, { route, ...context });

  if (Sentry.getClient()) {
    Sentry.captureException(error, {
      tags: { route, app: APP_NAME },
      extra: context,
    });
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: Record<string, unknown>) {
  const route = window.location.pathname;
  
  if (ENVIRONMENT === "development") {
    console.log(`[${level.toUpperCase()}]`, message, { route, ...context });
  }

  if (Sentry.getClient()) {
    Sentry.captureMessage(message, {
      level,
      tags: { route, app: APP_NAME },
      extra: context,
    });
  }
}

// Set user context for tracking
export function setUserContext(userId?: string, email?: string, role?: string) {
  if (Sentry.getClient()) {
    if (userId) {
      Sentry.setUser({ id: userId, email, role });
    } else {
      Sentry.setUser(null);
    }
  }
}

// Add breadcrumb for user actions
export function trackUserAction(action: string, data?: Record<string, unknown>) {
  if (Sentry.getClient()) {
    Sentry.addBreadcrumb({
      category: "user-action",
      message: action,
      level: "info",
      data,
    });
  }
}
