import { useState, useEffect } from "react";

/**
 * Hook to detect if the app is running in PWA standalone mode
 * (installed to home screen)
 */
export function usePWAStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA (standalone mode)
    const checkStandalone = () => {
      // iOS Safari
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      // Android Chrome / Other browsers
      const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Also check for fullscreen mode (some PWAs use this)
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      
      // Check for minimal-ui mode
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;

      setIsStandalone(isIOSStandalone || isDisplayStandalone || isFullscreen || isMinimalUI);
      setIsChecked(true);
    };

    checkStandalone();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkStandalone();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return { isStandalone, isChecked };
}
