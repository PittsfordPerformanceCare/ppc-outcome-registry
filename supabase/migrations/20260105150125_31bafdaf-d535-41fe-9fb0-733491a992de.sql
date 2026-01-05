
-- Enable RLS and add policies for configuration tables

-- 1. verified_providers - restrict to authenticated users
ALTER TABLE public.verified_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view verified providers" ON public.verified_providers;
CREATE POLICY "Authenticated users can view verified providers" 
ON public.verified_providers 
FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage verified providers" ON public.verified_providers;
CREATE POLICY "Admins can manage verified providers" 
ON public.verified_providers 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));

-- 2. rate_limit_config - restrict to admins only
ALTER TABLE public.rate_limit_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view rate limit config" ON public.rate_limit_config;
CREATE POLICY "Admins can view rate limit config" 
ON public.rate_limit_config 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage rate limit config" ON public.rate_limit_config;
CREATE POLICY "Admins can manage rate limit config" 
ON public.rate_limit_config 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));

-- 3. notification_alert_config - restrict to admins only
ALTER TABLE public.notification_alert_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view alert config" ON public.notification_alert_config;
CREATE POLICY "Admins can view alert config" 
ON public.notification_alert_config 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage alert config" ON public.notification_alert_config;
CREATE POLICY "Admins can manage alert config" 
ON public.notification_alert_config 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));

-- 4. pending_episode_thresholds - restrict to authenticated staff
ALTER TABLE public.pending_episode_thresholds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view episode thresholds" ON public.pending_episode_thresholds;
CREATE POLICY "Staff can view episode thresholds" 
ON public.pending_episode_thresholds 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage episode thresholds" ON public.pending_episode_thresholds;
CREATE POLICY "Admins can manage episode thresholds" 
ON public.pending_episode_thresholds 
FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));
