import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  /** Show header with title and optional actions */
  showHeader?: boolean;
  /** Number of content lines */
  lines?: number;
  /** Show avatar/icon placeholder */
  showAvatar?: boolean;
  /** Show action buttons at bottom */
  showActions?: boolean;
  /** Custom className */
  className?: string;
}

export function SkeletonCard({
  showHeader = true,
  lines = 3,
  showAvatar = false,
  showActions = false,
  className,
}: SkeletonCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {showAvatar && (
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            )}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(!showHeader && "pt-6")}>
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4"
              style={{ width: `${85 - i * 15}%` }}
            />
          ))}
        </div>
        {showActions && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
