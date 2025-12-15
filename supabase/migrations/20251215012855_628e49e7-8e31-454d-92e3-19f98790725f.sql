-- Drop the existing constraint and add updated one with all service types
ALTER TABLE public.rate_limit_config 
DROP CONSTRAINT IF EXISTS rate_limit_config_service_type_check;

ALTER TABLE public.rate_limit_config 
ADD CONSTRAINT rate_limit_config_service_type_check 
CHECK (service_type IN ('email', 'sms', 'all', 'lead_submission', 'neurologic_intake', 'intake_form', 'referral_submission'));