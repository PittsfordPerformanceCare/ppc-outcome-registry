import { cn } from "@/lib/utils";

interface BrainLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const BrainLogo = ({ className, size = "md", animated = true }: BrainLogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-16 w-16",
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
          {/* Main gradient for brain */}
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
          </linearGradient>
          
          {/* Highlight gradient */}
          <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
          
          {/* Neural pulse gradient */}
          <linearGradient id="pulseGradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft shadow */}
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="hsl(var(--primary))" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Background circle with subtle gradient */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="url(#highlightGradient)"
          className="opacity-50"
        />

        {/* Left hemisphere */}
        <g filter="url(#softShadow)">
          <path
            d="M32 12C24 12 18 16 16 22C14 28 14 34 16 40C18 46 22 50 28 52C30 52.5 31 52.5 32 52.5"
            stroke="url(#brainGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className={cn(animated && "animate-[pulse_3s_ease-in-out_infinite]")}
          />
          
          {/* Left gyri (brain folds) */}
          <path
            d="M20 24C22 22 25 22 27 24M18 32C21 30 25 30 28 32M20 40C23 38 26 38 29 40"
            stroke="url(#brainGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        </g>

        {/* Right hemisphere */}
        <g filter="url(#softShadow)">
          <path
            d="M32 12C40 12 46 16 48 22C50 28 50 34 48 40C46 46 42 50 36 52C34 52.5 33 52.5 32 52.5"
            stroke="url(#brainGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className={cn(animated && "animate-[pulse_3s_ease-in-out_infinite_0.5s]")}
          />
          
          {/* Right gyri (brain folds) */}
          <path
            d="M44 24C42 22 39 22 37 24M46 32C43 30 39 30 36 32M44 40C41 38 38 38 35 40"
            stroke="url(#brainGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        </g>

        {/* Central fissure (corpus callosum connection) */}
        <path
          d="M32 16V48"
          stroke="url(#brainGradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 3"
          opacity="0.6"
        />

        {/* Neural connection nodes */}
        <g filter="url(#glow)">
          {/* Left nodes */}
          <circle cx="19" cy="28" r="2" fill="url(#brainGradient)" className={cn(animated && "animate-[ping_2s_ease-in-out_infinite]")} opacity="0.8" />
          <circle cx="22" cy="36" r="1.5" fill="url(#brainGradient)" className={cn(animated && "animate-[ping_2s_ease-in-out_infinite_0.3s]")} opacity="0.7" />
          <circle cx="26" cy="44" r="2" fill="url(#brainGradient)" className={cn(animated && "animate-[ping_2s_ease-in-out_infinite_0.6s]")} opacity="0.8" />
          
          {/* Right nodes */}
          <circle cx="45" cy="28" r="2" fill="url(#brainGradient)" className={cn(animated && "animate-[ping_2s_ease-in-out_infinite_0.4s]")} opacity="0.8" />
          <circle cx="42" cy="36" r="1.5" fill="url(#brainGradient)" className={cn(animated && "animate-[ping_2s_ease-in-out_infinite_0.7s]")} opacity="0.7" />
          <circle cx="38" cy="44" r="2" fill="url(#brainGradient)" className={cn(animated && "animate-[ping_2s_ease-in-out_infinite_1s]")} opacity="0.8" />
          
          {/* Center node */}
          <circle cx="32" cy="32" r="2.5" fill="url(#brainGradient)" className={cn(animated && "animate-[pulse_1.5s_ease-in-out_infinite]")} />
        </g>

        {/* Neural pathways - connecting lines */}
        <g opacity="0.5">
          <path d="M19 28L32 32" stroke="url(#pulseGradient)" strokeWidth="1" />
          <path d="M45 28L32 32" stroke="url(#pulseGradient)" strokeWidth="1" />
          <path d="M22 36L32 32" stroke="url(#pulseGradient)" strokeWidth="1" />
          <path d="M42 36L32 32" stroke="url(#pulseGradient)" strokeWidth="1" />
          <path d="M26 44L32 32" stroke="url(#pulseGradient)" strokeWidth="1" />
          <path d="M38 44L32 32" stroke="url(#pulseGradient)" strokeWidth="1" />
        </g>

        {/* Brainstem */}
        <path
          d="M32 52.5C32 52.5 30 56 30 58C30 60 31 62 32 62C33 62 34 60 34 58C34 56 32 52.5 32 52.5Z"
          fill="url(#brainGradient)"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};

export default BrainLogo;
