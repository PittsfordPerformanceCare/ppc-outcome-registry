-- Update the referral bonus trigger to also send thank you notification
CREATE OR REPLACE FUNCTION public.award_referral_bonus()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
  v_points INTEGER := 100;
  v_request_id BIGINT;
BEGIN
  -- Only award when status changes to 'converted' and hasn't been awarded yet
  IF NEW.status = 'converted' AND OLD.status != 'converted' AND NEW.points_awarded_at IS NULL THEN
    v_referrer_id := NEW.referrer_patient_id;
    
    IF v_referrer_id IS NOT NULL THEN
      -- Award points to referrer
      PERFORM award_patient_points(
        v_referrer_id,
        v_points,
        'Referral bonus for ' || COALESCE(NEW.referred_patient_name, NEW.referred_patient_email),
        NEW.episode_id,
        NULL
      );
      
      -- Mark as awarded
      NEW.points_awarded_at := now();
      
      -- Check for new achievements
      PERFORM check_and_award_achievements(v_referrer_id);
      
      -- Send thank you notification via edge function (non-blocking)
      SELECT net.http_post(
        url := 'https://qpsoytsyrdgouqrgkura.supabase.co/functions/v1/send-referral-thank-you',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc295dHN5cmRnb3VxcmdrdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTI2MTksImV4cCI6MjA3ODE2ODYxOX0.kSio8Gitd5on51mNTi3vdqIhN8ixgor6L2dixQPSXls'
        ),
        body := jsonb_build_object(
          'referrerId', v_referrer_id,
          'referredPatientName', COALESCE(NEW.referred_patient_name, NEW.referred_patient_email)
        )
      ) INTO v_request_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;