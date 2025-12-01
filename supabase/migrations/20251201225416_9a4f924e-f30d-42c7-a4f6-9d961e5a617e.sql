-- Add status to referral_inquiries to track prospect journey
ALTER TABLE referral_inquiries 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'prospect_awaiting_review' 
CHECK (status IN ('prospect_awaiting_review', 'approved', 'declined', 'scheduled', 'converted'));

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_referral_inquiries_status ON referral_inquiries(status);

-- Create trigger function to notify clinicians of new prospects
CREATE OR REPLACE FUNCTION notify_clinician_new_prospect()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_id BIGINT;
  v_clinic_name TEXT;
  v_clinic_phone TEXT;
BEGIN
  -- Get clinic info for the notification
  SELECT clinic_name, phone INTO v_clinic_name, v_clinic_phone
  FROM clinic_settings
  LIMIT 1;

  -- Send notification to all clinicians via edge function
  SELECT net.http_post(
    url := 'https://qpsoytsyrdgouqrgkura.supabase.co/functions/v1/send-clinician-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc295dHN5cmRnb3VxcmdrdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTI2MTksImV4cCI6MjA3ODE2ODYxOX0.kSio8Gitd5on51mNTi3vdqIhN8ixgor6L2dixQPSXls'
    ),
    body := jsonb_build_object(
      'messageType', 'new_prospect',
      'subject', 'New Lead Awaiting Approval',
      'prospectName', NEW.name,
      'prospectEmail', NEW.email,
      'prospectPhone', NEW.phone,
      'chiefComplaint', NEW.chief_complaint,
      'referralSource', NEW.referral_source,
      'inquiryId', NEW.id,
      'clinicName', v_clinic_name
    )
  ) INTO v_request_id;

  RETURN NEW;
END;
$$;

-- Create trigger on referral_inquiries insert
DROP TRIGGER IF EXISTS on_referral_inquiry_created ON referral_inquiries;
CREATE TRIGGER on_referral_inquiry_created
  AFTER INSERT ON referral_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION notify_clinician_new_prospect();