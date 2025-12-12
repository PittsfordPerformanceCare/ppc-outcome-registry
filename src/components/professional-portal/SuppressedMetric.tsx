import { cn } from "@/lib/utils";

interface SuppressedMetricProps {
  label: string;
  minCellSize: number;
  className?: string;
}

export function SuppressedMetric({ label, minCellSize, className }: SuppressedMetricProps) {
  return (
    <div
      className={cn(
        "border border-slate-200 border-dashed rounded-lg p-5 bg-slate-50/50",
        className
      )}
    >
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-sm text-slate-400 italic">
        Insufficient sample size to display (N &lt; {minCellSize})
      </p>
    </div>
  );
}
