import { ReactNode } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const { containerRef, pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh,
    threshold,
  });

  const showIndicator = pullDistance > 0 || isRefreshing;
  const isReady = pullDistance >= threshold;

  return (
    <div ref={containerRef} className={cn("relative overflow-auto", className)}>
      {/* Pull Indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-50 flex items-center justify-center",
          "transition-all duration-200 ease-out",
          showIndicator ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{
          transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`,
        }}
      >
        <div className="bg-background/95 backdrop-blur-sm rounded-full shadow-lg p-3 border border-border">
          {isRefreshing ? (
            <RefreshCw 
              className="h-6 w-6 text-primary animate-spin" 
              strokeWidth={2.5}
            />
          ) : (
            <div className="relative">
              {/* Progress Circle */}
              <svg className="h-6 w-6 transform -rotate-90">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className={cn(
                    "transition-all duration-200",
                    isReady ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeDasharray={`${progress * 0.628} 62.8`}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Arrow Icon */}
              <ChevronDown 
                className={cn(
                  "h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                  "transition-all duration-300",
                  isReady ? "text-primary rotate-180" : "text-muted-foreground"
                )}
                strokeWidth={3}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullDistance * 0.3}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
