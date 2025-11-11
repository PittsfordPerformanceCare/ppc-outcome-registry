import { useRef, useCallback, useState, useEffect } from "react";

interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  enabled?: boolean;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  enabled = true,
}: UseSwipeGestureOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      currentX.current = startX.current;
      currentY.current = startY.current;
      setIsDragging(true);
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !isDragging) return;
      
      currentX.current = e.touches[0].clientX;
      currentY.current = e.touches[0].clientY;
      
      const deltaX = currentX.current - startX.current;
      const deltaY = currentY.current - startY.current;
      
      setDragOffset({ x: deltaX, y: deltaY });
    },
    [enabled, isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !isDragging) return;

    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if it's a horizontal or vertical swipe
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    // Reset
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, [enabled, isDragging, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    elementRef,
    isDragging,
    dragOffset,
  };
}
