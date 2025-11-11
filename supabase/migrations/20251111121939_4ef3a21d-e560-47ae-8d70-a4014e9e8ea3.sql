-- Fix the trigger function to not reference clinic_id in patient_messages
DROP TRIGGER IF EXISTS notify_clinician_on_new_message ON public.patient_messages;
DROP FUNCTION IF EXISTS public.notify_clinician_new_message();

CREATE OR REPLACE FUNCTION public.notify_clinician_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id BIGINT;
  v_clinician_id UUID;
  v_clinician_prefs RECORD;
  v_patient_name TEXT;
  v_episode_info TEXT;
  v_clinic_id UUID;
BEGIN
  -- Get the clinician ID and clinic ID from the episode
  IF NEW.episode_id IS NOT NULL THEN
    SELECT user_id, clinic_id INTO v_clinician_id, v_clinic_id
    FROM episodes
    WHERE id = NEW.episode_id
    LIMIT 1;
  END IF;

  -- Get patient name from patient_accounts
  SELECT full_name INTO v_patient_name
  FROM patient_accounts
  WHERE id = NEW.patient_id;

  -- Get episode info if available
  IF NEW.episode_id IS NOT NULL THEN
    SELECT CONCAT(patient_name, ' - ', region) INTO v_episode_info
    FROM episodes
    WHERE id = NEW.episode_id;
  END IF;

  -- Loop through clinicians who should be notified
  FOR v_clinician_prefs IN
    SELECT 
      cnp.user_id,
      cnp.notification_email,
      p.email as profile_email,
      p.full_name as clinician_name
    FROM clinician_notification_preferences cnp
    JOIN profiles p ON p.id = cnp.user_id
    WHERE cnp.email_enabled = true
      AND (
        (NEW.message_type = 'message' AND cnp.notify_on_new_message = true) OR
        (NEW.message_type = 'callback_request' AND cnp.notify_on_callback_request = true)
      )
      AND (
        v_clinician_id IS NULL OR cnp.user_id = v_clinician_id
      )
      AND (
        v_clinic_id IS NULL OR 
        p.clinic_id = v_clinic_id
      )
  LOOP
    -- Send notification via edge function
    SELECT net.http_post(
      url := 'https://qpsoytsyrdgouqrgkura.supabase.co/functions/v1/send-clinician-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc295dHN5cmRnb3VxcmdrdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTI2MTksImV4cCI6MjA3ODE2ODYxOX0.kSio8Gitd5on51mNTi3vdqIhN8ixgor6L2dixQPSXls'
      ),
      body := jsonb_build_object(
        'clinicianId', v_clinician_prefs.user_id,
        'clinicianName', v_clinician_prefs.clinician_name,
        'clinicianEmail', COALESCE(v_clinician_prefs.notification_email, v_clinician_prefs.profile_email),
        'messageId', NEW.id,
        'messageType', NEW.message_type,
        'patientName', COALESCE(v_patient_name, 'Unknown Patient'),
        'subject', NEW.subject,
        'message', NEW.message,
        'episodeInfo', v_episode_info
      )
    ) INTO v_request_id;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER notify_clinician_on_new_message
  AFTER INSERT ON public.patient_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_clinician_new_message();