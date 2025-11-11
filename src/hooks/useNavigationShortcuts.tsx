import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook for global navigation keyboard shortcuts
 * - Escape: Go back to previous page
 * - H: Go to home page
 */
export function useNavigationShortcuts() {
  const navigate = useNavigate();

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
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate]);
}
