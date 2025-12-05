-- Fix RLS policies for rate_limit_config table
DROP POLICY IF EXISTS "Anyone can read rate limit config" ON public.rate_limit_config;
DROP POLICY IF EXISTS "Public can read rate limit config" ON public.rate_limit_config;

CREATE POLICY "Admins can read rate limit config" ON public.rate_limit_config
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'clinician'::app_role)
  )
);

-- Fix RLS policies for notification_alert_config table
DROP POLICY IF EXISTS "Anyone can read notification alert config" ON public.notification_alert_config;
DROP POLICY IF EXISTS "Public can read notification alert config" ON public.notification_alert_config;

CREATE POLICY "Staff can read notification alert config" ON public.notification_alert_config
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'clinician'::app_role)
  )
);

-- Fix RLS policies for pending_episode_thresholds table
DROP POLICY IF EXISTS "Anyone can read pending episode thresholds" ON public.pending_episode_thresholds;
DROP POLICY IF EXISTS "Public can read pending episode thresholds" ON public.pending_episode_thresholds;

CREATE POLICY "Staff can read pending episode thresholds" ON public.pending_episode_thresholds
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'clinician'::app_role)
  )
);