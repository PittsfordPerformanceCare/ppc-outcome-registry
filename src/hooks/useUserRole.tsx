import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'clinician' | 'patient';

interface UseUserRoleReturn {
  roles: AppRole[];
  isAdmin: boolean;
  isClinician: boolean;
  isPatient: boolean;
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to securely check user roles from the database.
 * 
 * SECURITY: This hook fetches roles from the server-side user_roles table,
 * protected by Row Level Security (RLS) policies. Never check roles using
 * client-side storage (localStorage/sessionStorage) as this can be manipulated.
 * 
 * @example
 * ```tsx
 * const { isAdmin, loading } = useUserRole();
 * 
 * if (loading) return <Spinner />;
 * if (!isAdmin) return <Navigate to="/unauthorized" />;
 * ```
 */
export function useUserRole(): UseUserRoleReturn {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRoles([]);
        return;
      }

      // Fetch roles from server-side table (protected by RLS)
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
        return;
      }

      // Extract role values
      const userRoles = data?.map(r => r.role as AppRole) || [];
      setRoles(userRoles);
    } catch (error) {
      console.error('Error in useUserRole:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRoles();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  return {
    roles,
    isAdmin: hasRole('admin'),
    isClinician: hasRole('clinician'),
    isPatient: hasRole('patient'),
    loading,
    hasRole,
    refetch: fetchRoles,
  };
}
