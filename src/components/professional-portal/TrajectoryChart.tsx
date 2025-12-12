import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TrajectoryPoint } from "@/data/professionalOutcomes";

interface TrajectoryChartProps {
  byVisit: TrajectoryPoint[];
  byTime: TrajectoryPoint[] | null;
  minCellSize: number;
}

export function TrajectoryChart({ byVisit, byTime, minCellSize }: TrajectoryChartProps) {
  const [view, setView] = useState<"visit" | "time">("visit");
  
  const hasTimeData = byTime && byTime.length > 0;
  const data = view === "time" && hasTimeData ? byTime : byVisit;
  
  // Check if any data point has insufficient N
  const maxProportion = Math.max(...data.map(d => d.proportionImproved));

  return (
    <div className="border border-slate-200 rounded-lg p-6 bg-white">
      {/* Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setView("visit")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            view === "visit"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          By visit count
        </button>
        <button
          onClick={() => setView("time")}
          disabled={!hasTimeData}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            view === "time"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            !hasTimeData && "opacity-50 cursor-not-allowed"
          )}
        >
          By time window (weeks)
        </button>
        {!hasTimeData && (
          <span className="text-xs text-slate-400 ml-2">
            Time data not available
          </span>
        )}
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        {data.map((point, idx) => {
          const isSuppressed = point.n < minCellSize;
          
          return (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-24 flex-shrink-0">
                <p className="text-sm text-slate-600">{point.label}</p>
              </div>
              <div className="flex-1 relative">
                <div className="h-8 bg-slate-100 rounded overflow-hidden">
                  {isSuppressed ? (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-xs text-slate-400 italic">
                        N &lt; {minCellSize}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="h-full bg-slate-400 rounded transition-all duration-300"
                      style={{ width: `${(point.proportionImproved / 100) * 100}%` }}
                    />
                  )}
                </div>
              </div>
              <div className="w-16 flex-shrink-0 text-right">
                {isSuppressed ? (
                  <span className="text-sm text-slate-400">—</span>
                ) : (
                  <span className="text-sm font-medium text-slate-700">
                    {point.proportionImproved}%
                  </span>
                )}
              </div>
              <div className="w-16 flex-shrink-0 text-right">
                <span className="text-xs text-slate-400">n={point.n}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Caption */}
      <p className="text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
        Trajectories reflect observed trends across episodes; individual variation is expected.
      </p>
    </div>
  );
}
