import { useState, useCallback, useEffect, useRef } from "react";

type AnnouncementPoliteness = "polite" | "assertive";

interface Announcement {
  message: string;
  politeness: AnnouncementPoliteness;
  id: number;
}

/**
 * Hook for making screen reader announcements via ARIA live regions.
 * Use this to announce dynamic content changes to assistive technologies.
 */
export function useScreenReaderAnnounce() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const idRef = useRef(0);

  const announce = useCallback(
    (message: string, politeness: AnnouncementPoliteness = "polite") => {
      const id = ++idRef.current;
      setAnnouncements((prev) => [...prev, { message, politeness, id }]);

      // Clear announcement after it's been read
      setTimeout(() => {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }, 1000);
    },
    []
  );

  const announcePolite = useCallback(
    (message: string) => announce(message, "polite"),
    [announce]
  );

  const announceAssertive = useCallback(
    (message: string) => announce(message, "assertive"),
    [announce]
  );

  return {
    announce,
    announcePolite,
    announceAssertive,
    announcements,
  };
}

interface ScreenReaderAnnouncerProps {
  announcements: Announcement[];
}

/**
 * Visually hidden live region for screen reader announcements.
 * Render this component once at the app root level.
 */
export function ScreenReaderAnnouncer({ announcements }: ScreenReaderAnnouncerProps) {
  return (
    <>
      {/* Polite announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter((a) => a.politeness === "polite")
          .map((a) => (
            <span key={a.id}>{a.message}</span>
          ))}
      </div>
      
      {/* Assertive announcements */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements
          .filter((a) => a.politeness === "assertive")
          .map((a) => (
            <span key={a.id}>{a.message}</span>
          ))}
      </div>
    </>
  );
}
