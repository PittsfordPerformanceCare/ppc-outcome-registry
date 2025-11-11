-- Create Zapier webhook configuration table
CREATE TABLE IF NOT EXISTS public.zapier_webhook_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID,
  name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('report_sent', 'low_open_rate', 'low_click_rate', 'high_engagement', 'low_engagement')),
  threshold_value INTEGER,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.zapier_webhook_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own webhook configs"
  ON public.zapier_webhook_config
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
    OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can create own webhook configs"
  ON public.zapier_webhook_config
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can update own webhook configs"
  ON public.zapier_webhook_config
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
  );

CREATE POLICY "Users can delete own webhook configs"
  ON public.zapier_webhook_config
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
  );

-- Create trigger for updated_at
CREATE TRIGGER update_zapier_webhook_config_updated_at
  BEFORE UPDATE ON public.zapier_webhook_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index
CREATE INDEX idx_zapier_webhook_config_user_id ON public.zapier_webhook_config(user_id);
CREATE INDEX idx_zapier_webhook_config_enabled ON public.zapier_webhook_config(enabled) WHERE enabled = true;