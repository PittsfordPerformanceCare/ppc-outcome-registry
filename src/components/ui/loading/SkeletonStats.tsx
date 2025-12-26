import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonStatsProps {
  /** Number of stat cards */
  count?: number;
  /** Layout direction */
  layout?: "horizontal" | "grid";
  /** Custom className */
  className?: string;
}

export function SkeletonStats({
  count = 4,
  layout = "grid",
  className,
}: SkeletonStatsProps) {
  return (
    <div
      className={cn(
        layout === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          : "flex gap-4 overflow-x-auto pb-2",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className={cn(layout === "horizontal" && "min-w-[200px] flex-shrink-0")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
