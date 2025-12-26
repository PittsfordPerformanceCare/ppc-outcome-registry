import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonListProps {
  /** Number of items */
  items?: number;
  /** Show avatar/icon for each item */
  showAvatar?: boolean;
  /** Show secondary line */
  showSecondary?: boolean;
  /** Show trailing action/badge */
  showTrailing?: boolean;
  /** Custom className */
  className?: string;
}

export function SkeletonList({
  items = 5,
  showAvatar = true,
  showSecondary = true,
  showTrailing = false,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card"
        >
          {showAvatar && (
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            {showSecondary && <Skeleton className="h-3 w-1/2" />}
          </div>
          {showTrailing && (
            <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
