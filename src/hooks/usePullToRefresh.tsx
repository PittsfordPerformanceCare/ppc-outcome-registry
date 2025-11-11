import { useEffect, useRef, useState, useCallback } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
  refreshingDuration?: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  refreshingDuration = 1000,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only allow pull-to-refresh when scrolled to top
    if (window.scrollY === 0 && containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setCanPull(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canPull || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;

    // Only pull down, not up
    if (distance > 0) {
      // Prevent default scroll behavior when pulling
      if (distance > 10) {
        e.preventDefault();
      }
      
      // Apply resistance effect - diminishing returns as you pull further
      const resistance = Math.min(distance * 0.5, maxPullDistance);
      setPullDistance(resistance);
    }
  }, [canPull, isRefreshing, maxPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!canPull) return;

    setCanPull(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold); // Lock at threshold during refresh

      try {
        await onRefresh();
        // Ensure minimum duration for visual feedback
        await new Promise(resolve => setTimeout(resolve, refreshingDuration));
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Snap back if not past threshold
      setPullDistance(0);
    }
  }, [canPull, pullDistance, threshold, isRefreshing, onRefresh, refreshingDuration]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    progress,
  };
}
