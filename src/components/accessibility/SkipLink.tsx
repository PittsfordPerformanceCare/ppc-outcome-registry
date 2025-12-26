import { cn } from "@/lib/utils";

interface SkipLinkProps {
  /** Target element ID to skip to */
  targetId?: string;
  /** Custom text */
  text?: string;
  /** Custom className */
  className?: string;
}

/**
 * Skip-to-content link for keyboard navigation accessibility.
 * Appears only when focused, allowing keyboard users to skip navigation.
 */
export function SkipLink({
  targetId = "main-content",
  text = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only",
        "focus:fixed focus:top-4 focus:left-4 focus:z-[100]",
        "focus:px-4 focus:py-2 focus:rounded-md",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "focus:shadow-lg",
        "transition-all duration-200",
        className
      )}
    >
      {text}
    </a>
  );
}
