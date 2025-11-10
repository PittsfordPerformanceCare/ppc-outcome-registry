import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { UAParser } from "./useUAParser";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Register session on sign in
      if (event === 'SIGNED_IN' && session) {
        setTimeout(() => {
          registerSession(session.user.id, session.access_token);
        }, 0);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Register existing session
      if (session) {
        setTimeout(() => {
          registerSession(session.user.id, session.access_token);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Register session helper
  const registerSession = async (userId: string, accessToken: string) => {
    try {
      const sessionToken = accessToken.substring(0, 32);
      const parser = new UAParser();
      const result = parser.getResult();
      
      const deviceInfo = {
        browser: result.browser.name || 'Unknown',
        browserVersion: result.browser.version || '',
        os: result.os.name || 'Unknown',
        osVersion: result.os.version || '',
        device: result.device.type || 'desktop',
      };

      const { data: existing } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .single();

      if (existing) {
        await supabase
          .from('user_sessions')
          .update({ last_active: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('user_sessions').insert({
          user_id: userId,
          session_token: sessionToken,
          device_info: deviceInfo,
          user_agent: navigator.userAgent,
        });
      }
    } catch (error) {
      console.error('Error registering session:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return { user, session, loading, signOut };
}
