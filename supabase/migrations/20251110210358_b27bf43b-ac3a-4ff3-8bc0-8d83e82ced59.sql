-- Add retry tracking columns to notifications_history
ALTER TABLE notifications_history
ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retries integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS last_retry_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS next_retry_at timestamp with time zone;

-- Create index for efficient retry queries (without time-based predicate)
CREATE INDEX IF NOT EXISTS idx_notifications_retry 
ON notifications_history(status, next_retry_at, retry_count) 
WHERE status = 'failed';

-- Create function to calculate next retry time with exponential backoff
CREATE OR REPLACE FUNCTION calculate_next_retry(
  current_retry_count integer,
  base_delay_minutes integer DEFAULT 5
)
RETURNS timestamp with time zone
LANGUAGE plpgsql
AS $$
BEGIN
  -- Exponential backoff: 5min, 15min, 45min, etc.
  RETURN now() + (base_delay_minutes * POWER(3, current_retry_count)) * interval '1 minute';
END;
$$;