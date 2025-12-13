import { cn } from "@/lib/utils";

interface BrainLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

export const BrainLogo = ({ className, size = "md", animated = true }: BrainLogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
          </linearGradient>
          
          <linearGradient id="accentGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Abstract brain - two interlocking hemispheres */}
        
        {/* Left hemisphere - organic curve */}
        <path
          d="M32 8
             C20 8 12 16 12 28
             C12 36 14 42 18 46
             C22 50 26 52 32 54"
          stroke="url(#primaryGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          className={cn(animated && "origin-center")}
        />
        
        {/* Right hemisphere - organic curve */}
        <path
          d="M32 8
             C44 8 52 16 52 28
             C52 36 50 42 46 46
             C42 50 38 52 32 54"
          stroke="url(#primaryGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left inner fold */}
        <path
          d="M18 24 C22 20 28 20 32 24"
          stroke="url(#primaryGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Right inner fold */}
        <path
          d="M46 24 C42 20 36 20 32 24"
          stroke="url(#primaryGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Central connection - the "spark" */}
        <circle
          cx="32"
          cy="32"
          r="5"
          fill="url(#primaryGrad)"
          className={cn(animated && "animate-pulse")}
        />
        
        {/* Neural rays emanating from center */}
        <g stroke="url(#accentGrad)" strokeWidth="2" strokeLinecap="round">
          <line x1="32" y1="27" x2="32" y2="18" />
          <line x1="27" y1="32" x2="18" y2="32" />
          <line x1="37" y1="32" x2="46" y2="32" />
          <line x1="32" y1="37" x2="32" y2="46" />
        </g>

        {/* Brainstem - minimal */}
        <path
          d="M32 54 L32 60"
          stroke="url(#primaryGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default BrainLogo;
