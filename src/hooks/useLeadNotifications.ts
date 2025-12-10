import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LeadNotification {
  id: string;
  name: string;
  created_at: string;
  read: boolean;
}

interface UseLeadNotificationsReturn {
  notifications: LeadNotification[];
  unreadCount: number;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

const SOUND_PREFERENCE_KEY = "ppc-lead-notification-sound";
const NOTIFICATIONS_KEY = "ppc-lead-notifications";

export function useLeadNotifications(): UseLeadNotificationsReturn {
  const [notifications, setNotifications] = useState<LeadNotification[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    try {
      const stored = localStorage.getItem(SOUND_PREFERENCE_KEY);
      return stored !== "false"; // Default to true
    } catch {
      return true;
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    // Create a simple ding sound using Web Audio API
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAHj9LNl3sBCIT1zZWEeQAAgO/Nj4N+AwCA78uJgXsHAYDvy4d9fQYAgO/Lg3l+BgKA78t/dX8GAwCA78t5cn4HAgCA78tzcn0IAgGA78ttcnwJAgKA78tncXsKAgOA78thcHoLAgSA78tcb3kMAgWB78tXbngNAgaB78tSbXcOAgaB78tNbHYPAgeB78tJa3UQAgeB78tFanQRAgiB78tBaXMSAgiB78s9aHITAgmB78s5Z3EUAgmB78s1ZnAVAgqB78sxZW8WAgqB78stZG4XAguB78spY20YAguB78slYmwZAgvB78siYWsaAgyB78seYGocAgyB78sbX2kdAg2B78sYXmgeAg2B78sVXWcfAg6B78sSXGYgAg6B78sPW2UhAg+B78sMWmQiAg+B78sJWWMjAhCB78sGWGIkAhCB78sDV2ElAhGB78sAVmAmAhGB78v+VF8nAhKB78v7U14oAhKB78v4Ul0pAhOB78v1UV0qAhOB78vyUFwrAhSB78vwT1ssAhSB78vtTlotAhSB78vqTVkuAhWB78vnTFgvAhWB78vkS1cwAhaB78vhSlYxAhaB78veSVUyAheB78vbSFQzAheB78vYR1M0AheB78vWRlI1AhiB78vTRVE2AhiB78vQRFA3AhmB78vNQ084AhmB78vKQk45AhmB78vIQU06AhqB78vFQEw7AhqB78vCP0s8AhuB78u/Pko9AhuB78u8PUk+AhyB78u5PEg/"
    );
    audioRef.current.volume = 0.5;
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 20)));
    } catch (e) {
      console.error("Failed to save notifications:", e);
    }
  }, [notifications]);

  const playDing = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [soundEnabled]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled));
    } catch (e) {
      console.error("Failed to save sound preference:", e);
    }
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Subscribe to real-time lead inserts
  useEffect(() => {
    const channel = supabase
      .channel("admin-lead-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
        },
        (payload) => {
          const newLead = payload.new as { id: string; name: string; created_at: string };
          
          setNotifications(prev => [
            {
              id: newLead.id,
              name: newLead.name || "New Lead",
              created_at: newLead.created_at,
              read: false,
            },
            ...prev.slice(0, 19), // Keep max 20 notifications
          ]);
          
          playDing();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playDing]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    markAllRead,
    clearNotifications,
  };
}
