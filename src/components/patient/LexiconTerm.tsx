import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LexiconTermProps {
  term: string;
  definition: string;
  children: React.ReactNode;
  className?: string;
}

const LexiconTerm = ({ term, definition, children, className }: LexiconTermProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("below");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Calculate position to avoid viewport overflow
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setPosition(spaceBelow < 150 ? "above" : "below");
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <span className={cn("relative inline", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="inline border-b border-dotted border-muted-foreground/50 text-inherit font-inherit cursor-help hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-sm transition-colors"
        aria-describedby={isOpen ? `lexicon-${term.replace(/\s+/g, "-")}` : undefined}
        aria-expanded={isOpen}
      >
        {children}
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          id={`lexicon-${term.replace(/\s+/g, "-")}`}
          role="tooltip"
          className={cn(
            "absolute z-50 w-64 sm:w-72 p-3 text-sm bg-card border border-border rounded-lg shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            position === "above"
              ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
              : "top-full mt-2 left-1/2 -translate-x-1/2"
          )}
        >
          <p className="font-medium text-foreground mb-1">{term}</p>
          <p className="text-muted-foreground leading-relaxed">{definition}</p>
          
          {/* Arrow indicator */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-border rotate-45",
              position === "above"
                ? "bottom-0 translate-y-1/2 border-r border-b"
                : "top-0 -translate-y-1/2 border-l border-t"
            )}
          />
        </div>
      )}
    </span>
  );
};

export default LexiconTerm;
