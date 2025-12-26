import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Custom className */
  className?: string;
}

const dotSizes = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-3 w-3",
};

const gapSizes = {
  sm: "gap-1",
  md: "gap-1.5",
  lg: "gap-2",
};

export function LoadingDots({ size = "md", className }: LoadingDotsProps) {
  return (
    <div className={cn("flex items-center", gapSizes[size], className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "rounded-full bg-primary animate-bounce",
            dotSizes[size]
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );
}
