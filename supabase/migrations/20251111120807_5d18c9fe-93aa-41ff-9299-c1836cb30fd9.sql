-- Create table for clinician notification preferences
CREATE TABLE public.clinician_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_enabled boolean NOT NULL DEFAULT true,
  notify_on_new_message boolean NOT NULL DEFAULT true,
  notify_on_callback_request boolean NOT NULL DEFAULT true,
  notify_on_pending_feedback boolean NOT NULL DEFAULT true,
  notification_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinician_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notification preferences"
  ON public.clinician_notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.clinician_notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.clinician_notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_clinician_notification_preferences_updated_at
  BEFORE UPDATE ON public.clinician_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to notify clinicians about new messages
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
BEGIN
  -- Get the clinician ID from the episode or clinic
  IF NEW.episode_id IS NOT NULL THEN
    SELECT user_id INTO v_clinician_id
    FROM episodes
    WHERE id = NEW.episode_id
    LIMIT 1;
  END IF;

  -- If no specific clinician, notify all clinicians in the clinic
  IF v_clinician_id IS NULL AND NEW.clinic_id IS NOT NULL THEN
    -- For clinic-wide messages, we'll notify admins
    -- This will be handled by iterating through clinicians with notification preferences
    v_clinician_id := NULL;
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
        NEW.clinic_id IS NULL OR 
        p.clinic_id = NEW.clinic_id OR
        cnp.user_id IN (
          SELECT id FROM profiles WHERE clinic_id = NEW.clinic_id
        )
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

-- Create trigger for new messages
CREATE TRIGGER notify_clinician_on_new_message
  AFTER INSERT ON public.patient_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_clinician_new_message();