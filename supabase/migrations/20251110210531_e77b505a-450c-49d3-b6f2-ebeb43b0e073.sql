-- Fix search path for calculate_next_retry function
DROP FUNCTION IF EXISTS calculate_next_retry(integer, integer);

CREATE OR REPLACE FUNCTION calculate_next_retry(
  current_retry_count integer,
  base_delay_minutes integer DEFAULT 5
)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Exponential backoff: 5min, 15min, 45min, etc.
  RETURN now() + (base_delay_minutes * POWER(3, current_retry_count)) * interval '1 minute';
END;
$$;