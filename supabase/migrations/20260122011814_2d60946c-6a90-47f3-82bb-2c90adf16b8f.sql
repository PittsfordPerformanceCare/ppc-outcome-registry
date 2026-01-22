-- Create admin notifications table for in-app notifications
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL, -- 'intake_converted', 'episode_discharged'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT, -- 'episode', 'intake_form', etc.
  entity_id TEXT, -- The ID of the related entity
  patient_name TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_admin_notifications_recipient ON public.admin_notifications(recipient_id);
CREATE INDEX idx_admin_notifications_unread ON public.admin_notifications(recipient_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_admin_notifications_created ON public.admin_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Staff can read their own notifications
CREATE POLICY "Users can read own notifications" ON public.admin_notifications
FOR SELECT USING (auth.uid() = recipient_id);

-- Staff can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" ON public.admin_notifications
FOR UPDATE USING (auth.uid() = recipient_id);

-- System can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications" ON public.admin_notifications
FOR INSERT WITH CHECK (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Add comment for documentation
COMMENT ON TABLE public.admin_notifications IS 'In-app notifications for admin staff (e.g., Jennifer) about clinical events';