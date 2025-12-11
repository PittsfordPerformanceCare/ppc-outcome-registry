import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  name: string;
  role: 'admin' | 'clinician' | 'owner';
  unreadCount: number;
}

export interface TeamMessage {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

interface UseTeamChatReturn {
  teamMembers: TeamMember[];
  messages: TeamMessage[];
  currentUserId: string | null;
  selectedMemberId: string | null;
  loading: boolean;
  sendingMessage: boolean;
  selectMember: (memberId: string) => void;
  sendMessage: (body: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTeamChat(): UseTeamChatReturn {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch team members with unread counts
  const fetchTeamMembers = useCallback(async () => {
    if (!currentUserId) return;

    try {
      // Get all users with chat-eligible roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['admin', 'clinician', 'owner']);

      if (rolesError) throw rolesError;

      // Get profiles for these users
      const userIds = rolesData?.map(r => r.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, clinician_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get unread counts - use raw query approach
      const { data: unreadData, error: unreadError } = await supabase
        .from('team_messages')
        .select('sender_user_id')
        .eq('recipient_user_id', currentUserId)
        .is('read_at', null);

      if (unreadError) {
        console.error('Error fetching unread counts:', unreadError);
      }

      // Count unread per sender
      const unreadCounts: Record<string, number> = {};
      (unreadData || []).forEach(msg => {
        unreadCounts[msg.sender_user_id] = (unreadCounts[msg.sender_user_id] || 0) + 1;
      });

      // Build team members list (excluding current user)
      const members: TeamMember[] = (profilesData || [])
        .filter(p => p.id !== currentUserId)
        .map(profile => {
          const roleRecord = rolesData?.find(r => r.user_id === profile.id);
          return {
            id: profile.id,
            name: profile.clinician_name || profile.full_name || 'Unknown',
            role: (roleRecord?.role || 'clinician') as 'admin' | 'clinician' | 'owner',
            unreadCount: unreadCounts[profile.id] || 0,
          };
        })
        .sort((a, b) => {
          // Sort: Clinicians first, then Admin, then Owner
          const roleOrder = { clinician: 0, admin: 1, owner: 2 };
          return roleOrder[a.role] - roleOrder[b.role];
        });

      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !selectedMemberId) {
      setMessages([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_messages')
        .select('*')
        .or(`and(sender_user_id.eq.${currentUserId},recipient_user_id.eq.${selectedMemberId}),and(sender_user_id.eq.${selectedMemberId},recipient_user_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: TeamMessage[] = (data || []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_user_id,
        recipientId: msg.recipient_user_id,
        body: msg.body,
        createdAt: msg.created_at,
        readAt: msg.read_at,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [currentUserId, selectedMemberId]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!currentUserId || !selectedMemberId) return;

    try {
      await supabase
        .from('team_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_user_id', currentUserId)
        .eq('sender_user_id', selectedMemberId)
        .is('read_at', null);

      // Update local unread count
      setTeamMembers(prev => 
        prev.map(m => m.id === selectedMemberId ? { ...m, unreadCount: 0 } : m)
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [currentUserId, selectedMemberId]);

  // Send a message
  const sendMessage = useCallback(async (body: string) => {
    if (!currentUserId || !selectedMemberId || !body.trim()) return;

    setSendingMessage(true);
    try {
      const { data, error } = await supabase
        .from('team_messages')
        .insert({
          sender_user_id: currentUserId,
          recipient_user_id: selectedMemberId,
          body: body.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistically add to messages
      const newMessage: TeamMessage = {
        id: data.id,
        senderId: data.sender_user_id,
        recipientId: data.recipient_user_id,
        body: data.body,
        createdAt: data.created_at,
        readAt: data.read_at,
      };
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  }, [currentUserId, selectedMemberId, toast]);

  // Select a team member
  const selectMember = useCallback((memberId: string) => {
    setSelectedMemberId(memberId);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (currentUserId) {
      fetchTeamMembers();
    }
  }, [currentUserId, fetchTeamMembers]);

  // Fetch messages when selected member changes
  useEffect(() => {
    fetchMessages();
    if (selectedMemberId) {
      markAsRead();
    }
  }, [selectedMemberId, fetchMessages, markAsRead]);

  // Set up realtime subscription
  useEffect(() => {
    if (!currentUserId) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Subscribe to new messages
    const channel = supabase
      .channel('team-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_messages',
          filter: `recipient_user_id=eq.${currentUserId}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMsg = payload.new as any;
          
          // If from selected member, add to messages and mark as read
          if (newMsg.sender_user_id === selectedMemberId) {
            const message: TeamMessage = {
              id: newMsg.id,
              senderId: newMsg.sender_user_id,
              recipientId: newMsg.recipient_user_id,
              body: newMsg.body,
              createdAt: newMsg.created_at,
              readAt: newMsg.read_at,
            };
            setMessages(prev => [...prev, message]);
            markAsRead();
          } else {
            // Increment unread count for that sender
            setTeamMembers(prev =>
              prev.map(m =>
                m.id === newMsg.sender_user_id
                  ? { ...m, unreadCount: m.unreadCount + 1 }
                  : m
              )
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentUserId, selectedMemberId, markAsRead]);

  const refetch = useCallback(async () => {
    await fetchTeamMembers();
    await fetchMessages();
  }, [fetchTeamMembers, fetchMessages]);

  return {
    teamMembers,
    messages,
    currentUserId,
    selectedMemberId,
    loading,
    sendingMessage,
    selectMember,
    sendMessage,
    markAsRead,
    refetch,
  };
}
