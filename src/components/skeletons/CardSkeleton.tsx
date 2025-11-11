import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  className?: string;
  showHeader?: boolean;
  showDescription?: boolean;
  contentLines?: number;
}

export function CardSkeleton({
  className,
  showHeader = true,
  showDescription = true,
  contentLines = 3,
}: CardSkeletonProps) {
  return (
    <Card className={cn("animate-fade-in", className)}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-2/3" />
          {showDescription && <Skeleton className="h-4 w-full" />}
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${Math.random() * 30 + 70}%` }}
          />
        ))}
      </CardContent>
    </Card>
  );
}
