import { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ConnectionStatusProps {
  /** Show reconnection button when offline */
  showReconnect?: boolean;
  /** Position of the indicator */
  position?: "top" | "bottom";
  /** Custom className */
  className?: string;
}

/**
 * Shows connection status when offline and provides reconnection option.
 * Only visible when connection is lost.
 */
export function ConnectionStatus({
  showReconnect = true,
  position = "bottom",
  className,
}: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show briefly that we're back online
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Show banner if already offline
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleReconnect = useCallback(async () => {
    setIsReconnecting(true);
    try {
      // Try to fetch a small resource to verify connection
      await fetch("/favicon.ico", { cache: "no-store" });
      setIsOnline(true);
      setTimeout(() => setShowBanner(false), 2000);
    } catch {
      // Still offline
    } finally {
      setIsReconnecting(false);
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "fixed left-0 right-0 z-50 px-4 py-2 flex items-center justify-center gap-3",
        "animate-slide-down transition-all duration-300",
        position === "top" ? "top-0" : "bottom-0",
        isOnline
          ? "bg-success text-success-foreground"
          : "bg-destructive text-destructive-foreground",
        className
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            You're offline. Some features may be unavailable.
          </span>
          {showReconnect && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleReconnect}
              disabled={isReconnecting}
              className="h-7 px-2 text-xs"
            >
              {isReconnecting ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                "Retry"
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Hook to check online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
