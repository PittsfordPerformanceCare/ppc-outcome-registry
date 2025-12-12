import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UseProfessionalAccessReturn {
  isVerifiedProfessional: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to check if the current user has verified professional access.
 * 
 * Professional access requires:
 * 1. User is authenticated
 * 2. User has 'professional_verified' role OR is a clinician/admin
 * 
 * This is used for gating access to the Professional Outcomes Portal condition views.
 */
export function useProfessionalAccess(): UseProfessionalAccessReturn {
  const { user, loading: authLoading } = useAuth();
  const [isVerifiedProfessional, setIsVerifiedProfessional] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkProfessionalAccess = async () => {
    if (!user) {
      setIsVerifiedProfessional(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check for professional_verified, clinician, or admin roles
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking professional access:', error);
        setIsVerifiedProfessional(false);
        return;
      }

      const roles = data?.map(r => r.role) || [];
      const hasAccess = roles.some(role => 
        role === 'professional_verified' || 
        role === 'clinician' || 
        role === 'admin' ||
        role === 'owner'
      );

      setIsVerifiedProfessional(hasAccess);
    } catch (error) {
      console.error('Error in useProfessionalAccess:', error);
      setIsVerifiedProfessional(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      checkProfessionalAccess();
    }
  }, [user, authLoading]);

  return {
    isVerifiedProfessional,
    isAuthenticated: !!user,
    loading: authLoading || loading,
    refetch: checkProfessionalAccess,
  };
}
