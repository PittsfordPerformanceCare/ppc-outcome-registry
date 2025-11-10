-- Create table for notification alert configuration
CREATE TABLE IF NOT EXISTS public.notification_alert_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  failure_rate_threshold integer NOT NULL DEFAULT 20,
  check_window_hours integer NOT NULL DEFAULT 24,
  min_notifications_required integer NOT NULL DEFAULT 10,
  alert_recipients text[] NOT NULL DEFAULT ARRAY[]::text[],
  cooldown_hours integer NOT NULL DEFAULT 4,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for alert history
CREATE TABLE IF NOT EXISTS public.notification_alert_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id uuid REFERENCES public.notification_alert_config(id) ON DELETE CASCADE,
  triggered_at timestamp with time zone NOT NULL DEFAULT now(),
  failure_rate numeric NOT NULL,
  total_notifications integer NOT NULL,
  failed_notifications integer NOT NULL,
  alert_sent_to text[] NOT NULL,
  alert_details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_alert_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_alert_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_alert_config
CREATE POLICY "Admins can manage alert config"
ON public.notification_alert_config
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view alert config for their clinic"
ON public.notification_alert_config
FOR SELECT
USING (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()));

-- RLS policies for notification_alert_history
CREATE POLICY "Admins can view alert history"
ON public.notification_alert_history
FOR SELECT
USING (
  is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.notification_alert_config nac
    WHERE nac.id = notification_alert_history.config_id
    AND (nac.clinic_id IS NULL OR nac.clinic_id = get_user_clinic_id(auth.uid()))
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_alert_config_clinic ON public.notification_alert_config(clinic_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered ON public.notification_alert_history(triggered_at);
CREATE INDEX IF NOT EXISTS idx_alert_history_config ON public.notification_alert_history(config_id);

-- Add trigger for updated_at
CREATE TRIGGER update_notification_alert_config_updated_at
BEFORE UPDATE ON public.notification_alert_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration
INSERT INTO public.notification_alert_config (
  enabled,
  failure_rate_threshold,
  check_window_hours,
  min_notifications_required,
  alert_recipients,
  cooldown_hours
) VALUES (
  true,
  20,
  24,
  10,
  ARRAY[]::text[],
  4
) ON CONFLICT DO NOTHING;