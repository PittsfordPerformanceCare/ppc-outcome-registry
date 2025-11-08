import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  subtitle?: string;
  color?: "primary" | "success" | "warning" | "info";
}

export function CircularProgress({
  value,
  max = 100,
  size = 160,
  strokeWidth = 12,
  className,
  label,
  subtitle,
  color = "primary",
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: "text-primary",
    success: "text-green-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  const strokeColors = {
    primary: "stroke-primary",
    success: "stroke-green-500",
    warning: "stroke-yellow-500",
    info: "stroke-blue-500",
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(strokeColors[color], "transition-all duration-1000 ease-out")}
            style={{
              filter: "drop-shadow(0 0 8px currentColor)",
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn("text-4xl font-bold", colorClasses[color])}>
            {Math.round(percentage)}
            <span className="text-2xl">%</span>
          </div>
          {label && (
            <div className="text-xs font-medium text-muted-foreground mt-1">
              {label}
            </div>
          )}
        </div>
      </div>
      {subtitle && (
        <div className="text-sm font-medium text-center text-muted-foreground">
          {subtitle}
        </div>
      )}
    </div>
  );
}
