-- Create webhook alert configuration table
CREATE TABLE public.webhook_alert_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID,
  alert_recipients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Thresholds
  failure_rate_threshold INTEGER NOT NULL DEFAULT 30 CHECK (failure_rate_threshold >= 0 AND failure_rate_threshold <= 100),
  response_time_threshold INTEGER NOT NULL DEFAULT 5000, -- milliseconds
  check_window_hours INTEGER NOT NULL DEFAULT 1,
  min_calls_required INTEGER NOT NULL DEFAULT 5,
  
  -- Cooldown to prevent alert spam
  cooldown_hours INTEGER NOT NULL DEFAULT 2,
  last_alert_sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.webhook_alert_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own alert config"
  ON public.webhook_alert_config
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid()) 
    OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can create own alert config"
  ON public.webhook_alert_config
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can update own alert config"
  ON public.webhook_alert_config
  FOR UPDATE
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Create webhook alert history table
CREATE TABLE public.webhook_alert_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.webhook_alert_config(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('abandoned_webhook', 'high_failure_rate', 'slow_response_time')),
  webhook_name TEXT,
  alert_sent_to TEXT[] NOT NULL,
  alert_details JSONB,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.webhook_alert_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own alert history"
  ON public.webhook_alert_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM webhook_alert_config wac
      WHERE wac.id = webhook_alert_history.config_id
      AND (auth.uid() = wac.user_id OR is_admin(auth.uid()) OR (wac.clinic_id IS NOT NULL AND wac.clinic_id = get_user_clinic_id(auth.uid())))
    )
  );

CREATE POLICY "System can insert alert history"
  ON public.webhook_alert_history
  FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_webhook_alert_config_user_id ON public.webhook_alert_config(user_id);
CREATE INDEX idx_webhook_alert_config_enabled ON public.webhook_alert_config(enabled) WHERE enabled = true;
CREATE INDEX idx_webhook_alert_history_config_id ON public.webhook_alert_history(config_id);
CREATE INDEX idx_webhook_alert_history_triggered_at ON public.webhook_alert_history(triggered_at DESC);

-- Create trigger for updating updated_at
CREATE TRIGGER update_webhook_alert_config_updated_at
  BEFORE UPDATE ON public.webhook_alert_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();