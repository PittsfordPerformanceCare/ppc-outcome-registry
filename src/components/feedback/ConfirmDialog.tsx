import { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useHaptics } from "@/hooks/useHaptics";
import { Loader2, AlertTriangle, Trash2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmVariant = "default" | "destructive" | "success";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  /** Called when confirmed */
  onConfirm: () => void | Promise<void>;
  /** Called when cancelled */
  onCancel?: () => void;
}

const variantConfig = {
  default: {
    icon: AlertTriangle,
    iconClass: "text-warning",
    buttonClass: "",
  },
  destructive: {
    icon: Trash2,
    iconClass: "text-destructive",
    buttonClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  success: {
    icon: CheckCircle,
    iconClass: "text-success",
    buttonClass: "bg-success text-success-foreground hover:bg-success/90",
  },
};

/**
 * Hook for showing confirmation dialogs with haptic feedback.
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const { warning, success } = useHaptics();

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    warning(); // Haptic feedback when dialog opens
  }, [warning]);

  const handleConfirm = useCallback(async () => {
    if (!options) return;

    setIsLoading(true);
    try {
      await options.onConfirm();
      success(); // Haptic feedback on success
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      setOptions(null);
    }
  }, [options, success]);

  const handleCancel = useCallback(() => {
    options?.onCancel?.();
    setIsOpen(false);
    setOptions(null);
  }, [options]);

  const ConfirmDialogComponent = useCallback(() => {
    if (!options) return null;

    const variant = options.variant || "default";
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  variant === "destructive" && "bg-destructive/10",
                  variant === "success" && "bg-success/10",
                  variant === "default" && "bg-warning/10"
                )}
              >
                <Icon className={cn("h-5 w-5", config.iconClass)} />
              </div>
              <div className="space-y-2">
                <AlertDialogTitle>{options.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {options.description}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
              {options.cancelText || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className={config.buttonClass}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                options.confirmText || "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }, [isOpen, options, isLoading, handleConfirm, handleCancel]);

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
    isOpen,
    isLoading,
  };
}
