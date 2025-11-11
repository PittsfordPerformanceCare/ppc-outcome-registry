-- Create referral report schedules table
CREATE TABLE IF NOT EXISTS public.referral_report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id),
  name TEXT NOT NULL,
  recipient_emails TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  enabled BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  send_day INTEGER NOT NULL DEFAULT 1, -- day of month (1-28)
  send_time TEXT NOT NULL DEFAULT '09:00',
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create referral report deliveries table
CREATE TABLE IF NOT EXISTS public.referral_report_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.referral_report_schedules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id),
  recipient_emails TEXT[] NOT NULL,
  report_data JSONB,
  status TEXT NOT NULL,
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_report_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_report_schedules
CREATE POLICY "Users can view own schedules"
  ON public.referral_report_schedules FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()) OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can create own schedules"
  ON public.referral_report_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can update own schedules"
  ON public.referral_report_schedules FOR UPDATE
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can delete own schedules"
  ON public.referral_report_schedules FOR DELETE
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- RLS policies for referral_report_deliveries
CREATE POLICY "Users can view own deliveries"
  ON public.referral_report_deliveries FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()) OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "System can insert deliveries"
  ON public.referral_report_deliveries FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_referral_report_schedules_next_send ON public.referral_report_schedules(next_send_at) WHERE enabled = true;
CREATE INDEX idx_referral_report_deliveries_schedule ON public.referral_report_deliveries(schedule_id);
CREATE INDEX idx_referral_report_deliveries_sent_at ON public.referral_report_deliveries(sent_at);