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
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          {/* Bold primary gradient */}
          <linearGradient id="boldBrainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.75" />
          </linearGradient>
          
          {/* Accent gradient for neural pathways */}
          <linearGradient id="neuralAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>

          {/* Core glow */}
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Subtle background glow */}
        <circle cx="40" cy="38" r="28" fill="url(#coreGlow)" />

        {/* LEFT HEMISPHERE - Bold, clean strokes */}
        <g>
          {/* Main left hemisphere shape */}
          <path
            d="M40 14
               C32 14 26 17 22 22
               C18 27 16 33 16 40
               C16 47 18 53 22 58
               C26 63 32 66 40 66"
            stroke="url(#boldBrainGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Left frontal lobe fold */}
          <path
            d="M24 26 C28 23 34 23 38 26"
            stroke="url(#boldBrainGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Left parietal fold */}
          <path
            d="M20 40 C26 36 34 36 40 40"
            stroke="url(#boldBrainGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Left temporal fold */}
          <path
            d="M24 54 C28 50 34 50 38 54"
            stroke="url(#boldBrainGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* RIGHT HEMISPHERE - Mirror of left */}
        <g>
          {/* Main right hemisphere shape */}
          <path
            d="M40 14
               C48 14 54 17 58 22
               C62 27 64 33 64 40
               C64 47 62 53 58 58
               C54 63 48 66 40 66"
            stroke="url(#boldBrainGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Right frontal lobe fold */}
          <path
            d="M56 26 C52 23 46 23 42 26"
            stroke="url(#boldBrainGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Right parietal fold */}
          <path
            d="M60 40 C54 36 46 36 40 40"
            stroke="url(#boldBrainGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Right temporal fold */}
          <path
            d="M56 54 C52 50 46 50 42 54"
            stroke="url(#boldBrainGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* NEURAL NETWORK - Central connectivity */}
        <g className={cn(animated && "opacity-80")}>
          {/* Central vertical axis */}
          <line
            x1="40" y1="18" x2="40" y2="62"
            stroke="url(#neuralAccent)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
          
          {/* Cross connections */}
          <path
            d="M26 33 L40 40 L54 33"
            stroke="url(#neuralAccent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M26 47 L40 40 L54 47"
            stroke="url(#neuralAccent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* NEURAL NODES - Key activation points */}
        <g>
          {/* Central processing node - largest */}
          <circle
            cx="40"
            cy="40"
            r="4"
            fill="url(#boldBrainGradient)"
            className={cn(animated && "animate-pulse")}
          />
          
          {/* Left hemisphere nodes */}
          <circle cx="26" cy="33" r="2.5" fill="url(#boldBrainGradient)" opacity="0.9" />
          <circle cx="26" cy="47" r="2.5" fill="url(#boldBrainGradient)" opacity="0.9" />
          
          {/* Right hemisphere nodes */}
          <circle cx="54" cy="33" r="2.5" fill="url(#boldBrainGradient)" opacity="0.9" />
          <circle cx="54" cy="47" r="2.5" fill="url(#boldBrainGradient)" opacity="0.9" />
        </g>

        {/* BRAINSTEM - Clean, bold connection */}
        <path
          d="M36 66 
             C36 70 38 74 40 74 
             C42 74 44 70 44 66"
          stroke="url(#boldBrainGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Brainstem detail */}
        <circle cx="40" cy="70" r="1.5" fill="url(#boldBrainGradient)" opacity="0.7" />
      </svg>
    </div>
  );
};

export default BrainLogo;
