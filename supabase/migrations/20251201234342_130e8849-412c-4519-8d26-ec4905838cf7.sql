-- Create trigger function to send welcome email when intake form is submitted
CREATE OR REPLACE FUNCTION public.notify_intake_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_request_id BIGINT;
BEGIN
  -- Only trigger when status changes to 'submitted' or when submitted_at is first set
  IF (TG_OP = 'INSERT' AND NEW.status = 'submitted') OR 
     (TG_OP = 'UPDATE' AND OLD.status != 'submitted' AND NEW.status = 'submitted') OR
     (TG_OP = 'UPDATE' AND OLD.submitted_at IS NULL AND NEW.submitted_at IS NOT NULL) THEN
    
    -- Send welcome email via edge function (non-blocking)
    SELECT net.http_post(
      url := 'https://qpsoytsyrdgouqrgkura.supabase.co/functions/v1/send-intake-welcome',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwc295dHN5cmRnb3VxcmdrdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTI2MTksImV4cCI6MjA3ODE2ODYxOX0.kSio8Gitd5on51mNTi3vdqIhN8ixgor6L2dixQPSXls'
      ),
      body := jsonb_build_object(
        'intakeFormId', NEW.id,
        'patientName', NEW.patient_name,
        'patientEmail', NEW.email
      )
    ) INTO v_request_id;

    RAISE NOTICE 'Intake welcome notification triggered for form % (request_id: %)', NEW.id, v_request_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_intake_submitted ON public.intake_forms;

-- Create trigger on intake_forms table
CREATE TRIGGER trigger_notify_intake_submitted
  AFTER INSERT OR UPDATE ON public.intake_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_intake_submitted();