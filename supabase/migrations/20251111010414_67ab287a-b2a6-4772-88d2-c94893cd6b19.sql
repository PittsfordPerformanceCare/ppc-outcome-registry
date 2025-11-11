-- Create email template usage tracking table
CREATE TABLE public.email_template_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id TEXT NOT NULL, -- can be custom template UUID or predefined template ID
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('predefined', 'custom')),
  custom_template_id UUID, -- references custom_email_templates if template_type = 'custom'
  notification_id UUID, -- references notifications_history
  user_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  episode_id TEXT,
  patient_email TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_template_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view template usage for their clinic"
ON public.email_template_usage
FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid()
  )
  OR is_admin(auth.uid())
);

CREATE POLICY "System can insert template usage"
ON public.email_template_usage
FOR INSERT
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_template_usage_clinic ON public.email_template_usage(clinic_id);
CREATE INDEX idx_template_usage_template ON public.email_template_usage(template_id);
CREATE INDEX idx_template_usage_custom_template ON public.email_template_usage(custom_template_id);
CREATE INDEX idx_template_usage_notification ON public.email_template_usage(notification_id);
CREATE INDEX idx_template_usage_sent_at ON public.email_template_usage(sent_at DESC);