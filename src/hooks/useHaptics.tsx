import { useCallback } from "react";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

export type HapticFeedback = "light" | "medium" | "heavy" | "success" | "warning" | "error";

export function useHaptics() {
  const triggerHaptic = useCallback(async (type: HapticFeedback = "light") => {
    try {
      // Check if haptics are available (mobile devices)
      const isCapacitorAvailable = (window as any).Capacitor?.isNativePlatform?.();
      
      if (!isCapacitorAvailable) {
        // Fallback to Vibration API for web/PWA
        if (navigator.vibrate) {
          const patterns: Record<HapticFeedback, number | number[]> = {
            light: 10,
            medium: 20,
            heavy: 30,
            success: [10, 50, 10],
            warning: [20, 100, 20],
            error: [30, 100, 30, 100, 30],
          };
          navigator.vibrate(patterns[type]);
        }
        return;
      }

      // Use Capacitor Haptics for native platforms
      switch (type) {
        case "light":
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case "medium":
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case "heavy":
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case "success":
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case "warning":
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case "error":
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
    } catch (error) {
      // Silently fail if haptics are not supported
      console.debug("Haptics not available:", error);
    }
  }, []);

  // Convenience methods
  const light = useCallback(() => triggerHaptic("light"), [triggerHaptic]);
  const medium = useCallback(() => triggerHaptic("medium"), [triggerHaptic]);
  const heavy = useCallback(() => triggerHaptic("heavy"), [triggerHaptic]);
  const success = useCallback(() => triggerHaptic("success"), [triggerHaptic]);
  const warning = useCallback(() => triggerHaptic("warning"), [triggerHaptic]);
  const error = useCallback(() => triggerHaptic("error"), [triggerHaptic]);

  // Specific use case methods
  const tap = useCallback(() => triggerHaptic("light"), [triggerHaptic]);
  const buttonPress = useCallback(() => triggerHaptic("medium"), [triggerHaptic]);
  const toggle = useCallback(() => triggerHaptic("light"), [triggerHaptic]);
  const notification = useCallback((type: "success" | "warning" | "error" = "success") => {
    triggerHaptic(type);
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    tap,
    buttonPress,
    toggle,
    notification,
  };
}
