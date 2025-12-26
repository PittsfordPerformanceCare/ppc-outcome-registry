import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading: boolean;
  /** Loading text to display */
  text?: string;
  /** Make background completely opaque */
  opaque?: boolean;
  /** Custom className */
  className?: string;
  /** Children to overlay */
  children: React.ReactNode;
}

export function LoadingOverlay({
  isLoading,
  text,
  opaque = false,
  className,
  children,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center rounded-inherit",
            opaque
              ? "bg-background"
              : "bg-background/60 backdrop-blur-[2px]"
          )}
        >
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
}
