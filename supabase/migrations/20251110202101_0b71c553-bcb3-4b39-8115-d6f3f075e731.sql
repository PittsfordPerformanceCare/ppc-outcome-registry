-- Create notifications_history table
CREATE TABLE public.notifications_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id text NOT NULL,
  patient_name text NOT NULL,
  patient_email text,
  patient_phone text,
  clinician_name text NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('email', 'sms')),
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  delivery_details jsonb,
  error_message text,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  clinic_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view notification history"
  ON public.notifications_history
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid()) 
    OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "System can insert notification history"
  ON public.notifications_history
  FOR INSERT
  WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_notifications_history_episode_id ON public.notifications_history(episode_id);
CREATE INDEX idx_notifications_history_sent_at ON public.notifications_history(sent_at DESC);
CREATE INDEX idx_notifications_history_user_id ON public.notifications_history(user_id);

COMMENT ON TABLE public.notifications_history IS 'Tracks all email and SMS notifications sent to patients';
COMMENT ON COLUMN public.notifications_history.notification_type IS 'Type of notification: email or sms';
COMMENT ON COLUMN public.notifications_history.status IS 'Delivery status: sent, failed, or pending';
COMMENT ON COLUMN public.notifications_history.delivery_details IS 'Additional details about the delivery (message ID, etc)';
