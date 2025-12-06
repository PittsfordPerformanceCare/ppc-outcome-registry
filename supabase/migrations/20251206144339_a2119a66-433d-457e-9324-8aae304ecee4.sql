-- Enable RLS on rate_limit_config table and restrict to admins
ALTER TABLE public.rate_limit_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view rate limit config" ON public.rate_limit_config;
DROP POLICY IF EXISTS "Admins can update rate limit config" ON public.rate_limit_config;
DROP POLICY IF EXISTS "Admins can insert rate limit config" ON public.rate_limit_config;
DROP POLICY IF EXISTS "Admins can delete rate limit config" ON public.rate_limit_config;

CREATE POLICY "Admins can view rate limit config"
ON public.rate_limit_config
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update rate limit config"
ON public.rate_limit_config
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert rate limit config"
ON public.rate_limit_config
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete rate limit config"
ON public.rate_limit_config
FOR DELETE
USING (is_admin(auth.uid()));

-- Enable RLS on notification_alert_config table and restrict to admins
ALTER TABLE public.notification_alert_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view notification alert config" ON public.notification_alert_config;
DROP POLICY IF EXISTS "Admins can update notification alert config" ON public.notification_alert_config;
DROP POLICY IF EXISTS "Admins can insert notification alert config" ON public.notification_alert_config;
DROP POLICY IF EXISTS "Admins can delete notification alert config" ON public.notification_alert_config;

CREATE POLICY "Admins can view notification alert config"
ON public.notification_alert_config
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update notification alert config"
ON public.notification_alert_config
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert notification alert config"
ON public.notification_alert_config
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete notification alert config"
ON public.notification_alert_config
FOR DELETE
USING (is_admin(auth.uid()));

-- Enable RLS on pending_episode_thresholds table and restrict to authenticated staff
ALTER TABLE public.pending_episode_thresholds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view pending episode thresholds" ON public.pending_episode_thresholds;
DROP POLICY IF EXISTS "Admins can manage pending episode thresholds" ON public.pending_episode_thresholds;

-- All authenticated users (staff) can view thresholds
CREATE POLICY "Staff can view pending episode thresholds"
ON public.pending_episode_thresholds
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admins can modify thresholds
CREATE POLICY "Admins can insert pending episode thresholds"
ON public.pending_episode_thresholds
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update pending episode thresholds"
ON public.pending_episode_thresholds
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete pending episode thresholds"
ON public.pending_episode_thresholds
FOR DELETE
USING (is_admin(auth.uid()));