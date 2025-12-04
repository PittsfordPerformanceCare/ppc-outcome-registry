-- Add tracking field to intake_appointments for alert deduplication
ALTER TABLE public.intake_appointments 
ADD COLUMN IF NOT EXISTS episode_missing_alert_sent_at TIMESTAMP WITH TIME ZONE;

-- Create table to track missing episode alerts
CREATE TABLE IF NOT EXISTS public.missing_episode_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.intake_appointments(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  clinician_name TEXT,
  alert_type TEXT NOT NULL DEFAULT 'missing_episode_for_appointment',
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(appointment_id)
);

-- Enable RLS
ALTER TABLE public.missing_episode_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view alerts"
  ON public.missing_episode_alerts FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "System can insert alerts"
  ON public.missing_episode_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts"
  ON public.missing_episode_alerts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()));

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_missing_episode_alerts_status 
ON public.missing_episode_alerts (status, scheduled_date);