import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonTableProps {
  /** Number of rows to display */
  rows?: number;
  /** Number of columns */
  columns?: number;
  /** Show header row */
  showHeader?: boolean;
  /** Custom className */
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-lg border overflow-hidden">
        {showHeader && (
          <div className="bg-muted/50 border-b px-4 py-3">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-4 flex-1"
                  style={{ maxWidth: i === 0 ? "150px" : "100px" }}
                />
              ))}
            </div>
          </div>
        )}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-4 py-3">
              <div className="flex gap-4 items-center">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className={cn(
                      "h-4 flex-1",
                      colIndex === 0 && "max-w-[150px]"
                    )}
                    style={{
                      width: `${70 + Math.random() * 30}%`,
                      maxWidth: colIndex === 0 ? "150px" : "100px",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
