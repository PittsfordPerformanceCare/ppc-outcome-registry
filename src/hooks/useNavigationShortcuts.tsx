import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UseNavigationShortcutsOptions {
  onShowHelp?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
}

/**
 * Custom hook for global navigation keyboard shortcuts
 * - Escape: Go back to previous page
 * - H: Go to home page
 * - ?: Show keyboard shortcuts help
 * - P: Print (if handler provided)
 * - E: Export (if handler provided)
 */
export function useNavigationShortcuts(options?: UseNavigationShortcutsOptions) {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable element
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "escape":
          navigate(-1);
          break;
        case "h":
          navigate("/");
          break;
        case "?":
          if (options?.onShowHelp) {
            options.onShowHelp();
          } else {
            setShowHelp(true);
          }
          break;
        case "p":
          if (options?.onPrint) {
            event.preventDefault();
            options.onPrint();
          }
          break;
        case "e":
          if (options?.onExport) {
            event.preventDefault();
            options.onExport();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, options]);

  return { showHelp, setShowHelp };
}
