import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

const TIMEOUT_DURATION = 60 * 60 * 1000; // 1 hour
const WARNING_DURATION = 5 * 60 * 1000; // 5 minutes before timeout

export function useSessionTimeout() {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
  };

  const handleLogout = async () => {
    toast({
      title: "Session expired",
      description: "You have been logged out due to inactivity.",
      variant: "destructive",
    });
    await signOut();
  };

  const resetTimer = () => {
    if (!user) return;
    
    clearTimers();
    setShowWarning(false);

    // Set warning timer (55 minutes)
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      toast({
        title: "Session expiring soon",
        description: "Your session will expire in 5 minutes due to inactivity.",
        duration: 10000,
      });
    }, TIMEOUT_DURATION - WARNING_DURATION);

    // Set logout timer (1 hour)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_DURATION);
  };

  const extendSession = () => {
    resetTimer();
    toast({
      title: "Session extended",
      description: "Your session has been extended.",
    });
  };

  useEffect(() => {
    if (!user) {
      clearTimers();
      return;
    }

    // Activity events to monitor
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Start timer
    resetTimer();

    // Cleanup
    return () => {
      clearTimers();
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user]);

  return { showWarning, extendSession };
}
