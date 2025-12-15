-- Drop any existing permissive policies on rate_limit_config
DROP POLICY IF EXISTS "Anyone can view rate limit config" ON public.rate_limit_config;
DROP POLICY IF EXISTS "Public can view rate limit config" ON public.rate_limit_config;

-- Create admin-only SELECT policy
CREATE POLICY "Only admins can view rate limit config"
ON public.rate_limit_config
FOR SELECT
USING (is_admin(auth.uid()));

-- Create admin-only INSERT policy
CREATE POLICY "Only admins can insert rate limit config"
ON public.rate_limit_config
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Create admin-only UPDATE policy
CREATE POLICY "Only admins can update rate limit config"
ON public.rate_limit_config
FOR UPDATE
USING (is_admin(auth.uid()));

-- Create admin-only DELETE policy
CREATE POLICY "Only admins can delete rate limit config"
ON public.rate_limit_config
FOR DELETE
USING (is_admin(auth.uid()));