import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CareTargetPlainLanguage {
  id: string;
  name: string;
  status: string;
  plainLanguageStatus: string;
}

interface MessageTask {
  id: string;
  episode_id: string;
  care_target_id: string;
  draft_message: string | null;
  care_target_name_plain: string | null;
  remaining_active_targets_plain: string[] | null;
  draft_generated_at: string | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  sent_at: string | null;
}

interface UseCareTargetDischargeMessageReturn {
  isLoading: boolean;
  isGenerating: boolean;
  isConfirming: boolean;
  isSending: boolean;
  task: MessageTask | null;
  careTarget: CareTargetPlainLanguage | null;
  remainingActiveTargets: CareTargetPlainLanguage[];
  alreadySent: boolean;
  confirmed: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  generateDraft: (episodeId: string, careTargetId: string) => Promise<boolean>;
  confirmMessage: (episodeId: string, careTargetId: string) => Promise<boolean>;
  sendMessage: (episodeId: string, careTargetId: string) => Promise<boolean>;
  reset: () => void;
}

export function useCareTargetDischargeMessage(): UseCareTargetDischargeMessageReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [task, setTask] = useState<MessageTask | null>(null);
  const [careTarget, setCareTarget] = useState<CareTargetPlainLanguage | null>(null);
  const [remainingActiveTargets, setRemainingActiveTargets] = useState<CareTargetPlainLanguage[]>([]);
  const [alreadySent, setAlreadySent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setTask(null);
    setCareTarget(null);
    setRemainingActiveTargets([]);
    setAlreadySent(false);
    setConfirmed(false);
    setErrorCode(null);
    setErrorMessage(null);
  }, []);

  const generateDraft = useCallback(async (episodeId: string, careTargetId: string): Promise<boolean> => {
    setIsGenerating(true);
    setIsLoading(true);
    setErrorCode(null);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-care-target-discharge-message', {
        body: { episodeId, careTargetId, action: 'draft' }
      });

      if (error) {
        console.error('[Phase 4B Hook] Error generating draft:', error);
        setErrorMessage(error.message);
        toast.error('Failed to generate draft');
        return false;
      }

      if (!data.success) {
        setErrorCode(data.errorCode);
        setErrorMessage(data.errorMessage);
        
        if (data.errorCode === 'EPISODE_CLOSED') {
          toast.error('Cannot generate message - episode is closed');
        } else {
          toast.error(data.errorMessage || 'Failed to generate draft');
        }
        return false;
      }

      // Use type assertion since types may not be regenerated yet
      setTask(data.task as MessageTask);
      setCareTarget(data.careTarget);
      setRemainingActiveTargets(data.remainingActiveTargets || []);
      setAlreadySent(data.alreadySent || false);
      setConfirmed(data.confirmed || false);
      
      toast.success('Draft generated successfully');
      return true;
    } catch (err: any) {
      console.error('[Phase 4B Hook] Exception generating draft:', err);
      setErrorMessage(err.message);
      toast.error('Failed to generate draft');
      return false;
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  }, []);

  const confirmMessage = useCallback(async (episodeId: string, careTargetId: string): Promise<boolean> => {
    setIsConfirming(true);
    setErrorCode(null);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-care-target-discharge-message', {
        body: { episodeId, careTargetId, action: 'confirm' }
      });

      if (error) {
        console.error('[Phase 4B Hook] Error confirming message:', error);
        setErrorMessage(error.message);
        toast.error('Failed to confirm message');
        return false;
      }

      if (!data.success) {
        setErrorCode(data.errorCode);
        setErrorMessage(data.errorMessage);
        toast.error(data.errorMessage || 'Failed to confirm message');
        return false;
      }

      setTask(data.task as MessageTask);
      setConfirmed(true);
      toast.success('Message confirmed');
      return true;
    } catch (err: any) {
      console.error('[Phase 4B Hook] Exception confirming message:', err);
      setErrorMessage(err.message);
      toast.error('Failed to confirm message');
      return false;
    } finally {
      setIsConfirming(false);
    }
  }, []);

  const sendMessage = useCallback(async (episodeId: string, careTargetId: string): Promise<boolean> => {
    setIsSending(true);
    setErrorCode(null);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-care-target-discharge-message', {
        body: { episodeId, careTargetId, action: 'send' }
      });

      if (error) {
        console.error('[Phase 4B Hook] Error sending message:', error);
        setErrorMessage(error.message);
        toast.error('Failed to send message');
        return false;
      }

      if (!data.success) {
        setErrorCode(data.errorCode);
        setErrorMessage(data.errorMessage);
        
        if (data.errorCode === 'ALREADY_SENT') {
          toast.error('Message has already been sent');
          setAlreadySent(true);
        } else if (data.errorCode === 'CONFIRMATION_REQUIRED') {
          toast.error('Clinician confirmation required before sending');
        } else if (data.errorCode === 'EPISODE_CLOSED') {
          toast.error('Cannot send - episode is closed');
        } else {
          toast.error(data.errorMessage || 'Failed to send message');
        }
        return false;
      }

      setTask(data.task as MessageTask);
      setAlreadySent(true);
      toast.success('Message sent to patient');
      return true;
    } catch (err: any) {
      console.error('[Phase 4B Hook] Exception sending message:', err);
      setErrorMessage(err.message);
      toast.error('Failed to send message');
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    isLoading,
    isGenerating,
    isConfirming,
    isSending,
    task,
    careTarget,
    remainingActiveTargets,
    alreadySent,
    confirmed,
    errorCode,
    errorMessage,
    generateDraft,
    confirmMessage,
    sendMessage,
    reset
  };
}
