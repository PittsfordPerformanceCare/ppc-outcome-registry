import { useEffect, useRef, useCallback } from "react";

interface UseFocusManagementOptions {
  /** Auto-focus the element on mount */
  autoFocus?: boolean;
  /** Return focus to previous element on unmount */
  restoreFocus?: boolean;
}

/**
 * Hook for managing focus in modals, dialogs, and dynamic content.
 * Handles auto-focus and focus restoration patterns.
 */
export function useFocusManagement<T extends HTMLElement = HTMLElement>(
  options: UseFocusManagementOptions = {}
) {
  const { autoFocus = false, restoreFocus = false } = options;
  const elementRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store previous focus on mount
  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Auto-focus if enabled
    if (autoFocus && elementRef.current) {
      elementRef.current.focus();
    }

    // Restore focus on unmount
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [autoFocus, restoreFocus]);

  const focusElement = useCallback(() => {
    elementRef.current?.focus();
  }, []);

  return {
    ref: elementRef,
    focusElement,
  };
}

/**
 * Hook for keyboard navigation within a group of elements.
 * Supports arrow key navigation, home/end, and wrapping.
 */
export function useArrowKeyNavigation<T extends HTMLElement = HTMLElement>(
  itemSelector: string,
  options: {
    wrap?: boolean;
    orientation?: "horizontal" | "vertical" | "both";
  } = {}
) {
  const { wrap = true, orientation = "both" } = options;
  const containerRef = useRef<T>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const items = Array.from(
        container.querySelectorAll<HTMLElement>(itemSelector)
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);

      if (items.length === 0) return;

      const currentIndex = items.findIndex(
        (item) => item === document.activeElement
      );

      let nextIndex: number | null = null;

      const isVertical = orientation === "vertical" || orientation === "both";
      const isHorizontal = orientation === "horizontal" || orientation === "both";

      switch (event.key) {
        case "ArrowDown":
          if (isVertical) {
            event.preventDefault();
            nextIndex = wrap
              ? (currentIndex + 1) % items.length
              : Math.min(currentIndex + 1, items.length - 1);
          }
          break;
        case "ArrowUp":
          if (isVertical) {
            event.preventDefault();
            nextIndex = wrap
              ? (currentIndex - 1 + items.length) % items.length
              : Math.max(currentIndex - 1, 0);
          }
          break;
        case "ArrowRight":
          if (isHorizontal) {
            event.preventDefault();
            nextIndex = wrap
              ? (currentIndex + 1) % items.length
              : Math.min(currentIndex + 1, items.length - 1);
          }
          break;
        case "ArrowLeft":
          if (isHorizontal) {
            event.preventDefault();
            nextIndex = wrap
              ? (currentIndex - 1 + items.length) % items.length
              : Math.max(currentIndex - 1, 0);
          }
          break;
        case "Home":
          event.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          event.preventDefault();
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== null && items[nextIndex]) {
        items[nextIndex].focus();
      }
    },
    [itemSelector, wrap, orientation]
  );

  return {
    containerRef,
    handleKeyDown,
  };
}
