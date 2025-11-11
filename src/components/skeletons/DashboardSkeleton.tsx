import { StatCardSkeleton } from "./StatCardSkeleton";
import { CardSkeleton } from "./CardSkeleton";
import { ChartSkeleton } from "./ChartSkeleton";
import { ListSkeleton } from "./ListSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section Skeleton */}
      <div className="rounded-lg border p-8 space-y-4">
        <div className="space-y-2">
          <div className="h-9 w-96 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-md" />
          <div className="h-6 w-full max-w-2xl bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-md" />
        </div>
        <div className="h-14 w-56 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-lg" />
      </div>

      {/* Performance Dials */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <CardSkeleton
            key={i}
            contentLines={1}
            className="h-80"
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <ChartSkeleton
            key={i}
            height="200px"
          />
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Recent Episodes List */}
      <div className="space-y-4">
        <div className="rounded-lg border p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-md" />
            <div className="h-4 w-64 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-md" />
          </div>
          <ListSkeleton items={5} showBadge />
        </div>
      </div>
    </div>
  );
}
