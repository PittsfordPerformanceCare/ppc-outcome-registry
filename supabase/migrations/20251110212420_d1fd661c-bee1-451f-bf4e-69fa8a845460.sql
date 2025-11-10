-- Create rate limit configuration table
CREATE TABLE IF NOT EXISTS public.rate_limit_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL CHECK (service_type IN ('email', 'sms', 'all')),
  limit_type TEXT NOT NULL CHECK (limit_type IN ('per_minute', 'per_hour', 'per_day')),
  max_requests INTEGER NOT NULL CHECK (max_requests > 0),
  enabled BOOLEAN NOT NULL DEFAULT true,
  clinic_id UUID REFERENCES public.clinics(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_type, limit_type, clinic_id)
);

-- Create rate limit tracking table
CREATE TABLE IF NOT EXISTS public.rate_limit_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL CHECK (service_type IN ('email', 'sms')),
  request_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT true,
  clinic_id UUID REFERENCES public.clinics(id),
  user_id UUID REFERENCES auth.users(id),
  episode_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_rate_limit_tracking_timestamp ON public.rate_limit_tracking(request_timestamp);
CREATE INDEX idx_rate_limit_tracking_service ON public.rate_limit_tracking(service_type, request_timestamp);
CREATE INDEX idx_rate_limit_tracking_clinic ON public.rate_limit_tracking(clinic_id, request_timestamp);

-- Enable RLS
ALTER TABLE public.rate_limit_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rate_limit_config
CREATE POLICY "Admins can manage rate limit config"
  ON public.rate_limit_config
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view rate limit config for their clinic"
  ON public.rate_limit_config
  FOR SELECT
  USING (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()));

-- RLS Policies for rate_limit_tracking
CREATE POLICY "System can insert rate limit tracking"
  ON public.rate_limit_tracking
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view rate limit tracking"
  ON public.rate_limit_tracking
  FOR SELECT
  USING (
    is_admin(auth.uid()) OR 
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_service_type TEXT,
  p_clinic_id UUID DEFAULT NULL
)
RETURNS TABLE(
  allowed BOOLEAN,
  limit_type TEXT,
  current_count BIGINT,
  max_allowed INTEGER,
  reset_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_count BIGINT;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check each rate limit type in order of strictness
  FOR v_config IN 
    SELECT service_type, limit_type, max_requests
    FROM rate_limit_config
    WHERE enabled = true
      AND (service_type = p_service_type OR service_type = 'all')
      AND (clinic_id IS NULL OR clinic_id = p_clinic_id)
    ORDER BY 
      CASE limit_type 
        WHEN 'per_minute' THEN 1 
        WHEN 'per_hour' THEN 2 
        WHEN 'per_day' THEN 3 
      END
  LOOP
    -- Calculate window start based on limit type
    CASE v_config.limit_type
      WHEN 'per_minute' THEN
        v_window_start := now() - interval '1 minute';
        v_reset_at := date_trunc('minute', now()) + interval '1 minute';
      WHEN 'per_hour' THEN
        v_window_start := now() - interval '1 hour';
        v_reset_at := date_trunc('hour', now()) + interval '1 hour';
      WHEN 'per_day' THEN
        v_window_start := now() - interval '1 day';
        v_reset_at := date_trunc('day', now()) + interval '1 day';
    END CASE;

    -- Count requests in the window
    SELECT COUNT(*)
    INTO v_count
    FROM rate_limit_tracking
    WHERE service_type = p_service_type
      AND request_timestamp >= v_window_start
      AND (p_clinic_id IS NULL OR clinic_id = p_clinic_id);

    -- If limit exceeded, return false
    IF v_count >= v_config.max_requests THEN
      RETURN QUERY SELECT 
        false, 
        v_config.limit_type, 
        v_count, 
        v_config.max_requests,
        v_reset_at;
      RETURN;
    END IF;
  END LOOP;

  -- All limits passed
  RETURN QUERY SELECT true, NULL::TEXT, 0::BIGINT, 0::INTEGER, now();
END;
$$;

-- Create function to record rate limit usage
CREATE OR REPLACE FUNCTION public.record_rate_limit_usage(
  p_service_type TEXT,
  p_success BOOLEAN,
  p_clinic_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_episode_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO rate_limit_tracking (
    service_type,
    success,
    clinic_id,
    user_id,
    episode_id
  )
  VALUES (
    p_service_type,
    p_success,
    p_clinic_id,
    p_user_id,
    p_episode_id
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Insert default rate limits
INSERT INTO public.rate_limit_config (service_type, limit_type, max_requests, enabled)
VALUES 
  ('email', 'per_minute', 10, true),
  ('email', 'per_hour', 100, true),
  ('email', 'per_day', 1000, true),
  ('sms', 'per_minute', 5, true),
  ('sms', 'per_hour', 50, true),
  ('sms', 'per_day', 500, true)
ON CONFLICT (service_type, limit_type, clinic_id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_rate_limit_config_updated_at
  BEFORE UPDATE ON public.rate_limit_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.rate_limit_config IS 'Configuration for rate limiting notification sending';
COMMENT ON TABLE public.rate_limit_tracking IS 'Tracks notification sending for rate limit enforcement';
COMMENT ON FUNCTION public.check_rate_limit IS 'Checks if a notification can be sent within rate limits';
COMMENT ON FUNCTION public.record_rate_limit_usage IS 'Records a notification send attempt for rate limiting';