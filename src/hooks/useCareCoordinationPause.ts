import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type PauseReason = 'neuro_exam' | 'imaging' | 'specialist_referral';

export interface CareCoordinationPause {
  id: string;
  episode_id: string;
  pause_reason: PauseReason;
  is_active: boolean;
  created_at: string;
  created_by_user_id: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

export const PAUSE_REASON_LABELS: Record<PauseReason, string> = {
  neuro_exam: 'Neuro exam in progress',
  imaging: 'Imaging requested',
  specialist_referral: 'Specialist referral in progress',
};

// Map from situation_type in special_situations to our pause reasons
const SITUATION_TYPE_TO_PAUSE_REASON: Record<string, PauseReason> = {
  neuro_exam_pivot: 'neuro_exam',
  imaging_request: 'imaging',
  ortho_referral: 'specialist_referral',
};

// Map from pause reason to situation_type for creating records
const PAUSE_REASON_TO_SITUATION_TYPE: Record<PauseReason, string> = {
  neuro_exam: 'neuro_exam_pivot',
  imaging: 'imaging_request',
  specialist_referral: 'ortho_referral',
};

interface UseCareCoordinationPauseReturn {
  activePause: CareCoordinationPause | null;
  loading: boolean;
  error: string | null;
  createPause: (reason: PauseReason) => Promise<boolean>;
  resolvePause: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useCareCoordinationPause(episodeId: string | undefined): UseCareCoordinationPauseReturn {
  const { user } = useAuth();
  const [activePause, setActivePause] = useState<CareCoordinationPause | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePause = useCallback(async () => {
    if (!episodeId) {
      setActivePause(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Query special_situations for active pause triggers
      const { data, error: fetchError } = await supabase
        .from('special_situations')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('status', 'open')
        .in('situation_type', ['neuro_exam_pivot', 'imaging_request', 'ortho_referral'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching care coordination pause:', fetchError);
        setError('Failed to load care status');
        setActivePause(null);
        return;
      }

      if (data) {
        const pauseReason = SITUATION_TYPE_TO_PAUSE_REASON[data.situation_type];
        if (pauseReason) {
          setActivePause({
            id: data.id,
            episode_id: data.episode_id,
            pause_reason: pauseReason,
            is_active: data.status === 'open',
            created_at: data.created_at,
            created_by_user_id: data.clinician_id,
            resolved_at: data.resolved_at,
            resolved_by: data.resolved_by,
          });
        } else {
          setActivePause(null);
        }
      } else {
        setActivePause(null);
      }
    } catch (err) {
      console.error('Error in useCareCoordinationPause:', err);
      setError('An error occurred');
      setActivePause(null);
    } finally {
      setLoading(false);
    }
  }, [episodeId]);

  useEffect(() => {
    fetchActivePause();
  }, [fetchActivePause]);

  const createPause = useCallback(async (reason: PauseReason): Promise<boolean> => {
    if (!episodeId || !user) {
      setError('Missing episode or user');
      return false;
    }

    try {
      setError(null);

      // First, get episode details for patient_name
      const { data: episode, error: episodeError } = await supabase
        .from('episodes')
        .select('patient_name, clinic_id')
        .eq('id', episodeId)
        .maybeSingle();

      if (episodeError || !episode) {
        setError('Episode not found');
        return false;
      }

      // Get user profile for clinician name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const situationType = PAUSE_REASON_TO_SITUATION_TYPE[reason];
      const summary = PAUSE_REASON_LABELS[reason];

      // Insert new special situation
      const { data: newPause, error: insertError } = await supabase
        .from('special_situations')
        .insert({
          episode_id: episodeId,
          patient_name: episode.patient_name,
          clinician_id: user.id,
          clinician_name: profile?.full_name || null,
          situation_type: situationType,
          summary: summary,
          status: 'open',
          clinic_id: episode.clinic_id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating pause:', insertError);
        setError('Failed to create pause');
        return false;
      }

      // Update local state
      setActivePause({
        id: newPause.id,
        episode_id: newPause.episode_id,
        pause_reason: reason,
        is_active: true,
        created_at: newPause.created_at,
        created_by_user_id: newPause.clinician_id,
        resolved_at: null,
        resolved_by: null,
      });

      return true;
    } catch (err) {
      console.error('Error creating pause:', err);
      setError('An error occurred');
      return false;
    }
  }, [episodeId, user]);

  const resolvePause = useCallback(async (): Promise<boolean> => {
    if (!activePause || !user) {
      setError('No active pause to resolve');
      return false;
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('special_situations')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq('id', activePause.id);

      if (updateError) {
        console.error('Error resolving pause:', updateError);
        setError('Failed to resolve pause');
        return false;
      }

      setActivePause(null);
      return true;
    } catch (err) {
      console.error('Error resolving pause:', err);
      setError('An error occurred');
      return false;
    }
  }, [activePause, user]);

  return {
    activePause,
    loading,
    error,
    createPause,
    resolvePause,
    refetch: fetchActivePause,
  };
}
