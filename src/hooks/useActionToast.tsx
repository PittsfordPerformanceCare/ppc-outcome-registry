import { useCallback } from "react";
import { useToast as useShadcnToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ActionToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Duration in ms, 0 for persistent */
  duration?: number;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    className: "border-success/20 bg-success/5",
  },
  error: {
    icon: AlertCircle,
    className: "border-destructive/20 bg-destructive/5",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning/20 bg-warning/5",
  },
  info: {
    icon: Info,
    className: "border-info/20 bg-info/5",
  },
};

/**
 * Enhanced toast hook with action support and consistent styling.
 */
export function useActionToast() {
  const { toast, dismiss } = useShadcnToast();

  const showToast = useCallback(
    (options: ActionToastOptions) => {
      const {
        title,
        description,
        variant = "info",
        action,
        duration = 5000,
      } = options;

      const config = variantConfig[variant];
      const Icon = config.icon;

      return toast({
        title,
        description,
        duration: duration === 0 ? Infinity : duration,
        className: config.className,
        action: action ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              action.onClick();
              dismiss();
            }}
            className="h-7 px-2 text-xs"
          >
            {action.label}
          </Button>
        ) : undefined,
      });
    },
    [toast, dismiss]
  );

  const success = useCallback(
    (title: string, description?: string, action?: ActionToastOptions["action"]) =>
      showToast({ title, description, variant: "success", action }),
    [showToast]
  );

  const error = useCallback(
    (title: string, description?: string, action?: ActionToastOptions["action"]) =>
      showToast({ title, description, variant: "error", action, duration: 8000 }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, description?: string, action?: ActionToastOptions["action"]) =>
      showToast({ title, description, variant: "warning", action }),
    [showToast]
  );

  const info = useCallback(
    (title: string, description?: string, action?: ActionToastOptions["action"]) =>
      showToast({ title, description, variant: "info", action }),
    [showToast]
  );

  const undoable = useCallback(
    (
      title: string,
      description: string,
      onUndo: () => void,
      duration = 8000
    ) =>
      showToast({
        title,
        description,
        variant: "info",
        duration,
        action: {
          label: "Undo",
          onClick: onUndo,
        },
      }),
    [showToast]
  );

  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
    undoable,
    dismiss,
  };
}
