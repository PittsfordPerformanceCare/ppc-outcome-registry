import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface IntakeNotification {
  id: string;
  patient_name: string;
  submitted_at: string;
  status: string;
  red_flags: string[];
  incomplete_sections: string[];
}

export const useIntakeNotifications = () => {
  const [notifications, setNotifications] = useState<IntakeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const detectRedFlags = (intake: any): string[] => {
    const flags: string[] = [];
    
    if (intake.pain_level && intake.pain_level >= 8) {
      flags.push('High pain level (8+)');
    }
    
    if (!intake.emergency_contact_name || !intake.emergency_contact_phone) {
      flags.push('Missing emergency contact');
    }
    
    if (!intake.insurance_provider) {
      flags.push('No insurance information');
    }
    
    if (intake.allergies?.toLowerCase().includes('severe') || 
        intake.allergies?.toLowerCase().includes('anaphylaxis')) {
      flags.push('Severe allergies noted');
    }
    
    if (intake.medical_history?.toLowerCase().includes('surgery') && 
        !intake.surgery_history) {
      flags.push('Surgery mentioned but details incomplete');
    }

    if (intake.specialist_seen && intake.specialist_seen.trim() !== '') {
      flags.push('Has seen specialist');
    }
    
    return flags;
  };

  const detectIncompleteSections = (intake: any): string[] => {
    const incomplete: string[] = [];
    
    if (!intake.date_of_birth) incomplete.push('Date of birth');
    if (!intake.phone && !intake.email) incomplete.push('Contact information');
    if (!intake.address) incomplete.push('Address');
    if (!intake.insurance_provider) incomplete.push('Insurance');
    if (!intake.emergency_contact_name) incomplete.push('Emergency contact');
    if (!intake.injury_date) incomplete.push('Injury date');
    if (!intake.chief_complaint) incomplete.push('Chief complaint');
    if (!intake.hipaa_acknowledged) incomplete.push('HIPAA acknowledgment');
    if (!intake.consent_signature) incomplete.push('Consent signature');
    
    return incomplete;
  };

  useEffect(() => {
    // Fetch recent pending intakes on mount
    const fetchPendingIntakes = async () => {
      const { data, error } = await supabase
        .from('intake_forms')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (data && !error) {
        const processedNotifications = data.map(intake => ({
          id: intake.id,
          patient_name: intake.patient_name,
          submitted_at: intake.submitted_at,
          status: intake.status,
          red_flags: detectRedFlags(intake),
          incomplete_sections: detectIncompleteSections(intake),
        }));
        setNotifications(processedNotifications);
        setUnreadCount(processedNotifications.length);
      }
    };

    fetchPendingIntakes();

    // Set up realtime subscription
    const channel = supabase
      .channel('intake-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'intake_forms',
        },
        (payload) => {
          const newIntake = payload.new;
          const notification: IntakeNotification = {
            id: newIntake.id,
            patient_name: newIntake.patient_name,
            submitted_at: newIntake.submitted_at,
            status: newIntake.status,
            red_flags: detectRedFlags(newIntake),
            incomplete_sections: detectIncompleteSections(newIntake),
          };

          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          const hasRedFlags = notification.red_flags.length > 0;
          toast.success(
            `New intake form: ${newIntake.patient_name}`,
            {
              description: hasRedFlags 
                ? `⚠️ ${notification.red_flags.length} red flag(s) detected`
                : 'Ready for review',
              duration: 5000,
            }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'intake_forms',
        },
        (payload) => {
          const updatedIntake = payload.new;
          
          // Remove from notifications if status changed from pending
          if (updatedIntake.status !== 'pending') {
            setNotifications(prev => 
              prev.filter(n => n.id !== updatedIntake.id)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
          } else {
            // Update existing notification
            setNotifications(prev =>
              prev.map(n =>
                n.id === updatedIntake.id
                  ? {
                      ...n,
                      red_flags: detectRedFlags(updatedIntake),
                      incomplete_sections: detectIncompleteSections(updatedIntake),
                    }
                  : n
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };
};
