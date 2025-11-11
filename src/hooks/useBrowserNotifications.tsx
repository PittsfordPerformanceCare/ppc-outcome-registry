import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    setIsSupported("Notification" in window);
    
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error("Browser notifications are not supported in your browser");
      return false;
    }

    if (permission === "granted") {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast.success("Browser notifications enabled");
        return true;
      } else if (result === "denied") {
        toast.error("Notification permission denied. Please enable it in your browser settings.");
        return false;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Failed to request notification permission");
      return false;
    }
  }, [isSupported, permission]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported) {
        console.warn("Browser notifications not supported");
        return;
      }

      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return;
      }

      // Don't send notification if tab is active and visible
      if (document.visibilityState === "visible" && document.hasFocus()) {
        console.log("Tab is active, skipping browser notification");
        return;
      }

      try {
        const notification = new Notification(title, {
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          requireInteraction: true, // Keep notification visible until user interacts
          ...options,
        });

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // If there's a custom click handler in options data
          if (options?.data?.onClick) {
            options.data.onClick();
          }
        };

        // Auto-close after 10 seconds if user hasn't interacted
        setTimeout(() => {
          notification.close();
        }, 10000);

        return notification;
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    },
    [isSupported, permission]
  );

  return {
    permission,
    isSupported,
    isEnabled: permission === "granted",
    requestPermission,
    sendNotification,
  };
}
