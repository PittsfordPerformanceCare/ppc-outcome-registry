import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  className?: string;
  height?: string;
}

export function ChartSkeleton({ className, height = "300px" }: ChartSkeletonProps) {
  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-8" />
            ))}
          </div>
          
          {/* Chart bars/lines */}
          <div className="ml-12 h-full flex items-end justify-around gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-full animate-fade-in"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
          </div>
          
          {/* X-axis labels */}
          <div className="ml-12 mt-2 flex justify-around">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-10" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
