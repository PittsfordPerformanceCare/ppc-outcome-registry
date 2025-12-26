import { useRef, useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwipeableTabsProps {
  tabs: {
    value: string;
    label: string;
    icon?: ReactNode;
    content: ReactNode;
  }[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function SwipeableTabs({
  tabs,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
}: SwipeableTabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || tabs[0]?.value);
  const activeValue = controlledValue ?? internalValue;
  
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const activeIndex = tabs.findIndex((t) => t.value === activeValue);

  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  // Check scroll state
  const checkScrollState = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollState();
    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollState);
      window.addEventListener("resize", checkScrollState);
      return () => {
        container.removeEventListener("scroll", checkScrollState);
        window.removeEventListener("resize", checkScrollState);
      };
    }
  }, []);

  // Scroll active tab into view
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeTab = tabsContainerRef.current.querySelector(`[data-value="${activeValue}"]`);
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeValue]);

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsContainerRef.current) {
      const scrollAmount = 150;
      tabsContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeIndex < tabs.length - 1) {
      handleValueChange(tabs[activeIndex + 1].value);
    }
    if (isRightSwipe && activeIndex > 0) {
      handleValueChange(tabs[activeIndex - 1].value);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tab List */}
      <div className="relative">
        {/* Scroll buttons for mobile */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md md:hidden"
            onClick={() => scrollTabs("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div
          ref={tabsContainerRef}
          className={cn(
            "flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth",
            "bg-muted rounded-lg p-1",
            canScrollLeft && "pl-8",
            canScrollRight && "pr-8"
          )}
        >
          {tabs.map((tab) => {
            const isActive = tab.value === activeValue;
            
            return (
              <button
                key={tab.value}
                data-value={tab.value}
                onClick={() => handleValueChange(tab.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap",
                  "transition-all duration-200 flex-shrink-0",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {tab.icon && (
                  <span className={cn("flex-shrink-0", isActive ? "text-primary" : "")}>
                    {tab.icon}
                  </span>
                )}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.icon ? "" : tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md md:hidden"
            onClick={() => scrollTabs("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Swipe indicator dots for mobile */}
      <div className="flex justify-center gap-1.5 md:hidden">
        {tabs.map((tab, index) => (
          <button
            key={tab.value}
            onClick={() => handleValueChange(tab.value)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === activeIndex ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
            )}
            aria-label={`Go to ${tab.label}`}
          />
        ))}
      </div>

      {/* Tab Content with swipe support */}
      <div
        ref={contentRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative overflow-hidden"
      >
        {tabs.map((tab) => (
          <div
            key={tab.value}
            className={cn(
              "transition-all duration-300",
              tab.value === activeValue
                ? "opacity-100 translate-x-0"
                : "hidden opacity-0"
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
