import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UAParser } from './useUAParser';

interface SessionInfo {
  id: string;
  session_token: string;
  device_info: any;
  ip_address: unknown;
  user_agent: string | null;
  last_active: string;
  created_at: string;
  is_revoked: boolean;
}

export const useSessionManagement = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get device information
  const getDeviceInfo = () => {
    const parser = new UAParser();
    const result = parser.getResult();
    
    return {
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || '',
      os: result.os.name || 'Unknown',
      osVersion: result.os.version || '',
      device: result.device.type || 'desktop',
      deviceVendor: result.device.vendor || '',
      deviceModel: result.device.model || '',
    };
  };

  // Register current session
  const registerSession = async (userId: string, accessToken: string) => {
    try {
      const deviceInfo = getDeviceInfo();
      const sessionToken = accessToken.substring(0, 32); // Use part of access token as identifier

      // Check if session already exists
      const { data: existing } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .single();

      if (existing) {
        // Update last active
        await supabase
          .from('user_sessions')
          .update({ last_active: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        // Create new session
        await supabase.from('user_sessions').insert({
          user_id: userId,
          session_token: sessionToken,
          device_info: deviceInfo,
          user_agent: navigator.userAgent,
        });
      }

      setCurrentSessionToken(sessionToken);
    } catch (error) {
      console.error('Error registering session:', error);
    }
  };

  // Check if current session is revoked
  const checkSessionRevoked = async () => {
    if (!currentSessionToken) return false;

    try {
      const { data } = await supabase
        .from('user_sessions')
        .select('is_revoked')
        .eq('session_token', currentSessionToken)
        .single();

      if (data?.is_revoked) {
        await supabase.auth.signOut();
        toast({
          title: 'Session Revoked',
          description: 'This session has been signed out from another device.',
          variant: 'destructive',
        });
        return true;
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }

    return false;
  };

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_revoked', false)
        .order('last_active', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Revoke a specific session
  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_revoked: true,
          revoked_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'Session Revoked',
        description: 'The selected session has been signed out.',
      });

      fetchSessions();
    } catch (error) {
      console.error('Error revoking session:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'destructive',
      });
    }
  };

  // Revoke all other sessions
  const revokeAllOtherSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentSessionToken) return;

      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          is_revoked: true,
          revoked_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .neq('session_token', currentSessionToken);

      if (error) throw error;

      toast({
        title: 'Sessions Revoked',
        description: 'All other sessions have been signed out.',
      });

      fetchSessions();
    } catch (error) {
      console.error('Error revoking sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke sessions',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const token = session.access_token.substring(0, 32);
        setCurrentSessionToken(token);
      }
    };

    initSession();
    fetchSessions();

    // Check session status periodically
    const interval = setInterval(checkSessionRevoked, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    sessions,
    currentSessionToken,
    loading,
    registerSession,
    checkSessionRevoked,
    revokeSession,
    revokeAllOtherSessions,
    fetchSessions,
  };
};

