-- Create function to notify on points awarded
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

  -- Calculate total points
  SELECT get_patient_total_points(NEW.patient_id) INTO v_total_points;

  -- Call the edge function via pg_net
  SELECT net.http_post(
    url := 'https://qpsoytsyrdgouqrgkura.supabase.co/functions/v1/send-reward-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc295dHN5cmRnb3VxcmdrdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTI2MTksImV4cCI6MjA3ODE2ODYxOX0.kSio8Gitd5on51mNTi3vdqIhN8ixgor6L2dixQPSXls'
    ),
    body := jsonb_build_object(
      'patientId', NEW.patient_id,
      'patientName', v_patient_account.full_name,
      'patientEmail', v_patient_account.email,
      'patientPhone', v_patient_account.phone,
      'notificationType', 'points_earned',
      'points', NEW.points,
      'pointsReason', NEW.reason,
      'totalPoints', v_total_points
    )
  ) INTO v_request_id;

  RETURN NEW;
END;
$$;

-- Create function to notify on achievement unlocked
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

  -- Get achievement details
  SELECT 
    name,
    description
  INTO v_achievement
  FROM achievement_definitions
  WHERE id = NEW.achievement_id;

  -- Calculate total points
  SELECT get_patient_total_points(NEW.patient_id) INTO v_total_points;

  -- Call the edge function via pg_net
  SELECT net.http_post(
    url := 'https://qpsoytsyrdgouqrgkura.supabase.co/functions/v1/send-reward-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc295dHN5cmRnb3VxcmdrdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTI2MTksImV4cCI6MjA3ODE2ODYxOX0.kSio8Gitd5on51mNTi3vdqIhN8ixgor6L2dixQPSXls'
    ),
    body := jsonb_build_object(
      'patientId', NEW.patient_id,
      'patientName', v_patient_account.full_name,
      'patientEmail', v_patient_account.email,
      'patientPhone', v_patient_account.phone,
      'notificationType', 'achievement_unlocked',
      'achievementName', v_achievement.name,
      'achievementDescription', v_achievement.description,
      'totalPoints', v_total_points
    )
  ) INTO v_request_id;

  RETURN NEW;
END;
$$;

-- Create trigger for points awarded
DROP TRIGGER IF EXISTS trigger_notify_points_earned ON patient_points;
CREATE TRIGGER trigger_notify_points_earned
  AFTER INSERT ON patient_points
  FOR EACH ROW
  EXECUTE FUNCTION notify_points_earned();

-- Create trigger for achievements unlocked
DROP TRIGGER IF EXISTS trigger_notify_achievement_unlocked ON patient_achievements;
CREATE TRIGGER trigger_notify_achievement_unlocked
  AFTER INSERT ON patient_achievements
  FOR EACH ROW
  EXECUTE FUNCTION notify_achievement_unlocked();