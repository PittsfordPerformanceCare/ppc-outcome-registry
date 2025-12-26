import { cn } from "@/lib/utils";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  /** Whether to show content when focused (for skip links) */
  focusable?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Visually hides content while keeping it accessible to screen readers.
 * Use for labels, descriptions, or content that should only be read by assistive tech.
 */
export function VisuallyHidden({
  children,
  focusable = false,
  className,
}: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        "sr-only",
        focusable && "focus:not-sr-only focus:absolute focus:z-50",
        className
      )}
    >
      {children}
    </span>
  );
}

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
}

/**
 * Utility component wrapper for keyboard focus management.
 * Adds proper tabIndex and role attributes for interactive containers.
 */
export function FocusableRegion({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={-1}
      className={cn("outline-none focus:outline-none", className)}
    >
      {children}
    </div>
  );
}
