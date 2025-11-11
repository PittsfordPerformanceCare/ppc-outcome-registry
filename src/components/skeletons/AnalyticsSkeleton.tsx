import { StatCardSkeleton } from "./StatCardSkeleton";
import { ChartSkeleton } from "./ChartSkeleton";
import { CardSkeleton } from "./CardSkeleton";
import { TableSkeleton } from "./TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex justify-end">
        <div className="flex gap-2 p-1 rounded-lg border">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-md" />
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <ChartSkeleton key={i} height="300px" />
        ))}
      </div>

      {/* Data Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <CardSkeleton showHeader contentLines={0} className="h-96" />
        <TableSkeleton rows={6} columns={3} />
      </div>
    </div>
  );
}
