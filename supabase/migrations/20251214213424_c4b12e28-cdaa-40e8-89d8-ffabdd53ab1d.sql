-- Fix mutable search_path warnings on database functions

-- Fix cleanup_expired_intake_progress
CREATE OR REPLACE FUNCTION public.cleanup_expired_intake_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.intake_progress
  WHERE expires_at < now() AND completed = false;
END;
$function$;

-- Fix update_intake_progress_timestamp
CREATE OR REPLACE FUNCTION public.update_intake_progress_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Create partial unique index for global rate limit configs (where clinic_id IS NULL)
DROP INDEX IF EXISTS idx_rate_limit_config_global_unique;
CREATE UNIQUE INDEX idx_rate_limit_config_global_unique 
ON public.rate_limit_config (service_type, limit_type) 
WHERE clinic_id IS NULL;