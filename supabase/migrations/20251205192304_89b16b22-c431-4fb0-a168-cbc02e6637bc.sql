-- Fix: Ensure google_calendar_connections tokens are properly protected
-- Check and tighten RLS policies

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Admins can manage calendar connections" ON public.google_calendar_connections;

-- Only admins can view calendar connections
CREATE POLICY "Only admins can view calendar connections"
ON public.google_calendar_connections
FOR SELECT
USING (is_admin(auth.uid()));

-- Only admins can insert calendar connections
CREATE POLICY "Only admins can insert calendar connections"
ON public.google_calendar_connections
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Only admins can update calendar connections
CREATE POLICY "Only admins can update calendar connections"
ON public.google_calendar_connections
FOR UPDATE
USING (is_admin(auth.uid()));

-- Only admins can delete calendar connections
CREATE POLICY "Only admins can delete calendar connections"
ON public.google_calendar_connections
FOR DELETE
USING (is_admin(auth.uid()));