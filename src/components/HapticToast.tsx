import { useEffect } from "react";
import { useHaptics } from "@/hooks/useHaptics";

interface HapticToastProps {
  type?: "success" | "warning" | "error" | "info";
}

/**
 * Component that triggers haptic feedback when rendered.
 * Use this in conjunction with toast notifications to provide tactile feedback.
 * 
 * Example:
 * ```tsx
 * toast({
 *   title: "Success!",
 *   description: <><HapticToast type="success" />Your changes have been saved.</>,
 * });
 * ```
 */
export function HapticToast({ type = "info" }: HapticToastProps) {
  const { success, warning, error, light } = useHaptics();

  useEffect(() => {
    switch (type) {
      case "success":
        success();
        break;
      case "warning":
        warning();
        break;
      case "error":
        error();
        break;
      case "info":
      default:
        light();
        break;
    }
  }, [type, success, warning, error, light]);

  return null;
}

/**
 * Utility function to add haptic feedback to toast notifications
 */
export function useHapticToast() {
  const { toast } = require("@/hooks/use-toast");
  const haptics = useHaptics();

  return {
    success: (props: any) => {
      haptics.success();
      return toast({ ...props, variant: "default" });
    },
    error: (props: any) => {
      haptics.error();
      return toast({ ...props, variant: "destructive" });
    },
    warning: (props: any) => {
      haptics.warning();
      return toast({ ...props });
    },
    info: (props: any) => {
      haptics.light();
      return toast({ ...props });
    },
    default: toast,
  };
}
