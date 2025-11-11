-- Create recipient engagement report schedules table
CREATE TABLE IF NOT EXISTS public.recipient_engagement_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID,
  name TEXT NOT NULL,
  recipient_emails TEXT[] NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  send_day TEXT NOT NULL,
  send_time TEXT NOT NULL DEFAULT '09:00',
  enabled BOOLEAN NOT NULL DEFAULT true,
  min_engagement_filter TEXT CHECK (min_engagement_filter IN ('all', 'high', 'medium', 'low', 'very_low')),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recipient_engagement_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own engagement schedules"
  ON public.recipient_engagement_schedules
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
    OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can create own engagement schedules"
  ON public.recipient_engagement_schedules
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can update own engagement schedules"
  ON public.recipient_engagement_schedules
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
  );

CREATE POLICY "Users can delete own engagement schedules"
  ON public.recipient_engagement_schedules
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
  );

-- Create trigger for updated_at
CREATE TRIGGER update_recipient_engagement_schedules_updated_at
  BEFORE UPDATE ON public.recipient_engagement_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for next_send_at queries
CREATE INDEX idx_recipient_engagement_schedules_next_send_at 
  ON public.recipient_engagement_schedules(next_send_at) 
  WHERE enabled = true;