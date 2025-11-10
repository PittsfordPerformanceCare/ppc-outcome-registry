-- Create table for tracking email link clicks
CREATE TABLE IF NOT EXISTS public.notification_link_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id uuid NOT NULL REFERENCES public.notifications_history(id) ON DELETE CASCADE,
  link_url text NOT NULL,
  link_label text,
  clicked_at timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text,
  ip_address inet,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_link_clicks_notification_id ON public.notification_link_clicks(notification_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON public.notification_link_clicks(clicked_at);

-- Enable RLS
ALTER TABLE public.notification_link_clicks ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing link clicks
CREATE POLICY "Users can view link clicks for their notifications"
ON public.notification_link_clicks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.notifications_history nh
    WHERE nh.id = notification_link_clicks.notification_id
    AND (
      auth.uid() = nh.user_id 
      OR is_admin(auth.uid())
      OR (nh.clinic_id IS NOT NULL AND nh.clinic_id = get_user_clinic_id(auth.uid()))
    )
  )
);

-- Allow public inserts for click tracking (edge function will use service role)
CREATE POLICY "Allow click tracking"
ON public.notification_link_clicks
FOR INSERT
WITH CHECK (true);

-- Add click tracking fields to notifications_history
ALTER TABLE public.notifications_history
ADD COLUMN IF NOT EXISTS click_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_clicked_at timestamp with time zone;