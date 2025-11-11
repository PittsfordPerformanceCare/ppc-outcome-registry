-- Create pending_episode_thresholds table for configurable settings
CREATE TABLE IF NOT EXISTS public.pending_episode_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  warning_days INTEGER NOT NULL DEFAULT 30,
  critical_days INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT warning_less_than_critical CHECK (warning_days < critical_days)
);

-- Enable RLS
ALTER TABLE public.pending_episode_thresholds ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage thresholds"
  ON public.pending_episode_thresholds
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view thresholds for their clinic"
  ON public.pending_episode_thresholds
  FOR SELECT
  USING ((clinic_id IS NULL) OR (clinic_id = get_user_clinic_id(auth.uid())));

-- Create trigger for updated_at
CREATE TRIGGER update_pending_episode_thresholds_updated_at
  BEFORE UPDATE ON public.pending_episode_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default global thresholds
INSERT INTO public.pending_episode_thresholds (clinic_id, warning_days, critical_days)
VALUES (NULL, 30, 60)
ON CONFLICT DO NOTHING;