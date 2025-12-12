import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number | null;
  subtext?: string;
  className?: string;
}

export function MetricCard({ label, value, subtext, className }: MetricCardProps) {
  const displayValue = value === null ? "Not yet available" : value;
  const isUnavailable = value === null;

  return (
    <div
      className={cn(
        "border border-slate-200 rounded-lg p-5 bg-white",
        className
      )}
    >
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl font-semibold",
          isUnavailable ? "text-slate-400 text-base" : "text-slate-900"
        )}
      >
        {displayValue}
      </p>
      {subtext && (
        <p className="text-xs text-slate-500 mt-1">{subtext}</p>
      )}
    </div>
  );
}
