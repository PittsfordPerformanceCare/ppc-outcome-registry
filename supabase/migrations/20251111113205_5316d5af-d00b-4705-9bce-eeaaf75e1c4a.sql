-- Add milestone tracking columns to patient_referrals table
ALTER TABLE public.patient_referrals
ADD COLUMN IF NOT EXISTS milestone_3_awarded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS milestone_5_awarded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS milestone_10_awarded_at TIMESTAMP WITH TIME ZONE;

-- Update the referral bonus trigger to check for milestones
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
  v_total_referrals INTEGER;
  v_milestone_3_awarded TIMESTAMP WITH TIME ZONE;
  v_milestone_5_awarded TIMESTAMP WITH TIME ZONE;
  v_milestone_10_awarded TIMESTAMP WITH TIME ZONE;
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
      
      -- Check for milestone achievements
      -- Count total converted referrals for this referrer
      SELECT COUNT(*)
      INTO v_total_referrals
      FROM patient_referrals
      WHERE referrer_patient_id = v_referrer_id
        AND status = 'converted';
      
      -- Get a sample record to check milestone status
      SELECT 
        milestone_3_awarded_at,
        milestone_5_awarded_at,
        milestone_10_awarded_at
      INTO
        v_milestone_3_awarded,
        v_milestone_5_awarded,
        v_milestone_10_awarded
      FROM patient_referrals
      WHERE referrer_patient_id = v_referrer_id
      LIMIT 1;
      
      -- Award milestone 3
      IF v_total_referrals = 3 AND v_milestone_3_awarded IS NULL THEN
        -- Update all referral records for this referrer
        UPDATE patient_referrals
        SET milestone_3_awarded_at = now()
        WHERE referrer_patient_id = v_referrer_id;
        
        -- Send milestone celebration email
        SELECT net.http_post(
          url := 'https://qpsoytsyrdgouqrgkura.supabase.co/functions/v1/send-referral-milestone',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc295dHN5cmRnb3VxcmdrdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTI2MTksImV4cCI6MjA3ODE2ODYxOX0.kSio8Gitd5on51mNTi3vdqIhN8ixgor6L2dixQPSXls'
          ),
          body := jsonb_build_object(
            'referrerId', v_referrer_id,
            'milestoneCount', 3
          )
        ) INTO v_request_id;
      END IF;
      
      -- Award milestone 5
      IF v_total_referrals = 5 AND v_milestone_5_awarded IS NULL THEN
        -- Update all referral records for this referrer
        UPDATE patient_referrals
        SET milestone_5_awarded_at = now()
        WHERE referrer_patient_id = v_referrer_id;
        
        -- Send milestone celebration email
        SELECT net.http_post(
          url := 'https://qpsoytsyrdgouqrgkura.supabase.co/functions/v1/send-referral-milestone',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc295dHN5cmRnb3VxcmdrdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTI2MTksImV4cCI6MjA3ODE2ODYxOX0.kSio8Gitd5on51mNTi3vdqIhN8ixgor6L2dixQPSXls'
          ),
          body := jsonb_build_object(
            'referrerId', v_referrer_id,
            'milestoneCount', 5
          )
        ) INTO v_request_id;
      END IF;
      
      -- Award milestone 10
      IF v_total_referrals = 10 AND v_milestone_10_awarded IS NULL THEN
        -- Update all referral records for this referrer
        UPDATE patient_referrals
        SET milestone_10_awarded_at = now()
        WHERE referrer_patient_id = v_referrer_id;
        
        -- Send milestone celebration email
        SELECT net.http_post(
          url := 'https://qpsoytsyrdgouqrgkura.supabase.co/functions/v1/send-referral-milestone',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc295dHN5cmRnb3VxcmdrdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTI2MTksImV4cCI6MjA3ODE2ODYxOX0.kSio8Gitd5on51mNTi3vdqIhN8ixgor6L2dixQPSXls'
          ),
          body := jsonb_build_object(
            'referrerId', v_referrer_id,
            'milestoneCount', 10
          )
        ) INTO v_request_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;