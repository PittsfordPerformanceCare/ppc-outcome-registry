import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  items?: number;
  className?: string;
  showAvatar?: boolean;
  showBadge?: boolean;
}

export function ListSkeleton({
  items = 5,
  className,
  showAvatar = false,
  showBadge = false,
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border p-4 animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {showAvatar && <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />}
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-1/3" />
              {showBadge && <Skeleton className="h-6 w-20 rounded-full" />}
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
