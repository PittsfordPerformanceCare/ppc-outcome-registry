-- Create webhook activity log table
CREATE TABLE public.webhook_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_config_id UUID REFERENCES public.zapier_webhook_config(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  clinic_id UUID,
  webhook_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'timeout')),
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  duration_ms INTEGER,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.webhook_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook activity log
CREATE POLICY "Users can view own webhook activity"
  ON public.webhook_activity_log
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid()) 
    OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "System can insert webhook activity"
  ON public.webhook_activity_log
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_webhook_activity_log_user_id ON public.webhook_activity_log(user_id);
CREATE INDEX idx_webhook_activity_log_webhook_config_id ON public.webhook_activity_log(webhook_config_id);
CREATE INDEX idx_webhook_activity_log_triggered_at ON public.webhook_activity_log(triggered_at DESC);
CREATE INDEX idx_webhook_activity_log_status ON public.webhook_activity_log(status);