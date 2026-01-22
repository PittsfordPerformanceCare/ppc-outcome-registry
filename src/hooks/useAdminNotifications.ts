import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface AdminNotification {
  id: string;
  sender_id: string | null;
  notification_type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  patient_name: string | null;
  read_at: string | null;
  created_at: string;
  sender?: {
    full_name: string | null;
  };
}

interface UseAdminNotificationsReturn {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearNotifications: () => void;
  refetch: () => Promise<void>;
}

export function useAdminNotifications(): UseAdminNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element for notification sound
  useEffect(() => {
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAHj9LNl3sBCIT1zZWEeQAAgO/Nj4N+AwCA78uJgXsHAYDvy4d9fQYAgO/Lg3l+BgKA78t/dX8GAwCA78t5cn4HAgCA78tzcn0IAgGA78ttcnwJAgKA78tncXsKAgOA78thcHoLAgSA78tcb3kMAgWB78tXbngNAgaB78tSbXcOAgaB78tNbHYPAgeB78tJa3UQAgeB78tFanQRAgiB78tBaXMSAgiB78s9aHITAgmB78s5Z3EUAgmB78s1ZnAVAgqB78sxZW8WAgqB78stZG4XAguB78spY20YAguB78slYmwZAgvB78siYWsaAgyB78seYGocAgyB78sbX2kdAg2B78sYXmgeAg2B78sVXWcfAg6B78sSXGYgAg6B78sPW2UhAg+B78sMWmQiAg+B78sJWWMjAhCB78sGWGIkAhCB78sDV2ElAhGB78sAVmAmAhGB78v+VF8nAhKB78v7U14oAhKB78v4Ul0pAhOB78v1UV0qAhOB78vyUFwrAhSB78vwT1ssAhSB78vtTlotAhSB78vqTVkuAhWB78vnTFgvAhWB78vkS1cwAhaB78vhSlYxAhaB78veSVUyAheB78vbSFQzAheB78vYR1M0AheB78vWRlI1AhiB78vTRVE2AhiB78vQRFA3AhmB78vNQ084AhmB78vKQk45AhmB78vIQU06AhqB78vFQEw7AhqB78vCP0s8AhuB78u/Pko9AhuB78u8PUk+AhyB78u5PEg/"
    );
    audioRef.current.volume = 0.5;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select(`
          id,
          sender_id,
          notification_type,
          title,
          message,
          entity_type,
          entity_id,
          patient_name,
          read_at,
          created_at
        `)
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching admin notifications:", error);
        return;
      }

      // Fetch sender names separately
      const senderIds = [...new Set((data || []).map(n => n.sender_id).filter(Boolean))];
      let senderMap: Record<string, string> = {};
      
      if (senderIds.length > 0) {
        const { data: senders } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", senderIds);
        
        senderMap = (senders || []).reduce((acc, s) => {
          acc[s.id] = s.full_name || "Unknown";
          return acc;
        }, {} as Record<string, string>);
      }

      const enrichedNotifications = (data || []).map(n => ({
        ...n,
        sender: n.sender_id ? { full_name: senderMap[n.sender_id] || null } : undefined,
      }));

      setNotifications(enrichedNotifications);
    } catch (err) {
      console.error("Error in fetchNotifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("admin-notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New admin notification received:", payload.new);
          const newNotif = payload.new as AdminNotification;
          
          setNotifications(prev => [
            { ...newNotif, sender: undefined },
            ...prev.slice(0, 49),
          ]);
          
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, playNotificationSound]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("admin_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("recipient_id", user.id);

    if (error) {
      console.error("Error marking notification as read:", error);
      return;
    }

    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;

    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("admin_notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds)
      .eq("recipient_id", user.id);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return;
    }

    setNotifications(prev =>
      prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
  }, [user, notifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllRead,
    clearNotifications,
    refetch: fetchNotifications,
  };
}
