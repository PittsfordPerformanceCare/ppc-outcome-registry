-- Create patient notification preferences table
CREATE TABLE IF NOT EXISTS patient_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT true,
  points_notifications boolean NOT NULL DEFAULT true,
  achievement_notifications boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(patient_id)
);

-- Enable RLS
ALTER TABLE patient_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Patients can view own preferences" ON patient_notification_preferences;
DROP POLICY IF EXISTS "Patients can insert own preferences" ON patient_notification_preferences;
DROP POLICY IF EXISTS "Patients can update own preferences" ON patient_notification_preferences;
DROP POLICY IF EXISTS "Clinicians can view patient preferences" ON patient_notification_preferences;

-- Patients can view their own preferences
CREATE POLICY "Patients can view own preferences"
  ON patient_notification_preferences
  FOR SELECT
  USING (auth.uid() = patient_id);

-- Patients can insert their own preferences
CREATE POLICY "Patients can insert own preferences"
  ON patient_notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own preferences
CREATE POLICY "Patients can update own preferences"
  ON patient_notification_preferences
  FOR UPDATE
  USING (auth.uid() = patient_id);

-- Clinicians can view preferences for their patients
CREATE POLICY "Clinicians can view patient preferences"
  ON patient_notification_preferences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_episode_access pea
      JOIN episodes e ON e.id = pea.episode_id
      WHERE pea.patient_id = patient_notification_preferences.patient_id
        AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
    ) OR is_admin(auth.uid())
  );

-- Drop and recreate trigger for updated_at
DROP TRIGGER IF EXISTS update_patient_notification_preferences_updated_at ON patient_notification_preferences;
CREATE TRIGGER update_patient_notification_preferences_updated_at
  BEFORE UPDATE ON patient_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patient_notification_preferences_patient_id 
  ON patient_notification_preferences(patient_id);

-- Update notification functions to check preferences
CREATE OR REPLACE FUNCTION notify_points_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_account RECORD;
  v_total_points INTEGER;
  v_request_id BIGINT;
  v_prefs RECORD;
BEGIN
  -- Get patient account details
  SELECT 
    full_name,
    email,
    phone
  INTO v_patient_account
  FROM patient_accounts
  WHERE id = NEW.patient_id;

  -- If patient account not found, exit
  IF v_patient_account IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get notification preferences
  SELECT 
    email_enabled,
    sms_enabled,
    points_notifications
  INTO v_prefs
  FROM patient_notification_preferences
  WHERE patient_id = NEW.patient_id;

  -- If no preferences found or points notifications disabled, exit
  IF v_prefs IS NULL OR v_prefs.points_notifications = false THEN
    RETURN NEW;
  END IF;

  -- If both email and SMS are disabled, exit
  IF v_prefs.email_enabled = false AND v_prefs.sms_enabled = false THEN
    RETURN NEW;
  END IF;

  -- Calculate total points
  SELECT get_patient_total_points(NEW.patient_id) INTO v_total_points;

  -- Call the edge function via pg_net with preference-filtered contact info
  SELECT net.http_post(
    url := 'https://qpsoytsyrdgouqrgkura.supabase.co/functions/v1/send-reward-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc295dHN5cmRnb3VxcmdrdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTI2MTksImV4cCI6MjA3ODE2ODYxOX0.kSio8Gitd5on51mNTi3vdqIhN8ixgor6L2dixQPSXls'
    ),
    body := jsonb_build_object(
      'patientId', NEW.patient_id,
      'patientName', v_patient_account.full_name,
      'patientEmail', CASE WHEN v_prefs.email_enabled THEN v_patient_account.email ELSE NULL END,
      'patientPhone', CASE WHEN v_prefs.sms_enabled THEN v_patient_account.phone ELSE NULL END,
      'notificationType', 'points_earned',
      'points', NEW.points,
      'pointsReason', NEW.reason,
      'totalPoints', v_total_points
    )
  ) INTO v_request_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_achievement_unlocked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_account RECORD;
  v_achievement RECORD;
  v_total_points INTEGER;
  v_request_id BIGINT;
  v_prefs RECORD;
BEGIN
  -- Get patient account details
  SELECT 
    full_name,
    email,
    phone
  INTO v_patient_account
  FROM patient_accounts
  WHERE id = NEW.patient_id;

  -- If patient account not found, exit
  IF v_patient_account IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get notification preferences
  SELECT 
    email_enabled,
    sms_enabled,
    achievement_notifications
  INTO v_prefs
  FROM patient_notification_preferences
  WHERE patient_id = NEW.patient_id;

  -- If no preferences found or achievement notifications disabled, exit
  IF v_prefs IS NULL OR v_prefs.achievement_notifications = false THEN
    RETURN NEW;
  END IF;

  -- If both email and SMS are disabled, exit
  IF v_prefs.email_enabled = false AND v_prefs.sms_enabled = false THEN
    RETURN NEW;
  END IF;

  -- Get achievement details
  SELECT 
    name,
    description
  INTO v_achievement
  FROM achievement_definitions
  WHERE id = NEW.achievement_id;

  -- Calculate total points
  SELECT get_patient_total_points(NEW.patient_id) INTO v_total_points;

  -- Call the edge function via pg_net with preference-filtered contact info
  SELECT net.http_post(
    url := 'https://qpsoytsyrdgouqrgkura.supabase.co/functions/v1/send-reward-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc295dHN5cmRnb3VxcmdrdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTI2MTksImV4cCI6MjA3ODE2ODYxOX0.kSio8Gitd5on51mNTi3vdqIhN8ixgor6L2dixQPSXls'
    ),
    body := jsonb_build_object(
      'patientId', NEW.patient_id,
      'patientName', v_patient_account.full_name,
      'patientEmail', CASE WHEN v_prefs.email_enabled THEN v_patient_account.email ELSE NULL END,
      'patientPhone', CASE WHEN v_prefs.sms_enabled THEN v_patient_account.phone ELSE NULL END,
      'notificationType', 'achievement_unlocked',
      'achievementName', v_achievement.name,
      'achievementDescription', v_achievement.description,
      'totalPoints', v_total_points
    )
  ) INTO v_request_id;

  RETURN NEW;
END;
$$;