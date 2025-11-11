-- Create webhook retry queue table
CREATE TABLE public.webhook_retry_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_config_id UUID REFERENCES public.zapier_webhook_config(id) ON DELETE CASCADE,
  activity_log_id UUID REFERENCES public.webhook_activity_log(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  clinic_id UUID,
  webhook_name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  request_payload JSONB NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 5,
  next_retry_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_error TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'succeeded', 'failed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.webhook_retry_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook retry queue
CREATE POLICY "Users can view own retry queue"
  ON public.webhook_retry_queue
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid()) 
    OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "System can insert into retry queue"
  ON public.webhook_retry_queue
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update retry queue"
  ON public.webhook_retry_queue
  FOR UPDATE
  USING (true);

-- Create indexes for faster queries
CREATE INDEX idx_webhook_retry_queue_status ON public.webhook_retry_queue(status);
CREATE INDEX idx_webhook_retry_queue_next_retry ON public.webhook_retry_queue(next_retry_at) WHERE status IN ('pending', 'retrying');
CREATE INDEX idx_webhook_retry_queue_user_id ON public.webhook_retry_queue(user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_webhook_retry_queue_updated_at
  BEFORE UPDATE ON public.webhook_retry_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate next retry time with exponential backoff
CREATE OR REPLACE FUNCTION public.calculate_webhook_retry_time(retry_count INTEGER)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Exponential backoff: 1min, 2min, 4min, 8min, 16min
  -- Formula: 2^retry_count minutes
  RETURN now() + (POWER(2, retry_count) * interval '1 minute');
END;
$$;