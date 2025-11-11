import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
  showHeader = true,
}: TableSkeletonProps) {
  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      {/* Header */}
      {showHeader && (
        <div className="bg-muted/50 border-b">
          <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-24" />
            ))}
          </div>
        </div>
      )}
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 p-4 animate-fade-in"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              animationDelay: `${rowIndex * 50}ms`
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-4"
                style={{ width: `${Math.random() * 30 + 60}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
