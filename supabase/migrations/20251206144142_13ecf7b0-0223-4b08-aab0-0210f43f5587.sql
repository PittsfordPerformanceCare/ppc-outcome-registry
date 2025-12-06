-- Fix profiles table RLS: users should only see own profile, admins can see profiles in their clinic
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Admins can view profiles within their clinic only
CREATE POLICY "Admins can view clinic profiles"
ON public.profiles
FOR SELECT
USING (
  is_admin(auth.uid()) AND (
    clinic_id IS NULL OR 
    clinic_id = get_user_clinic_id(auth.uid())
  )
);

-- For google_calendar_connections: ensure only the admin who created it or same-clinic admins can access
-- First drop existing policies
DROP POLICY IF EXISTS "Only admins can view calendar connections" ON public.google_calendar_connections;
DROP POLICY IF EXISTS "Only admins can update calendar connections" ON public.google_calendar_connections;
DROP POLICY IF EXISTS "Only admins can delete calendar connections" ON public.google_calendar_connections;
DROP POLICY IF EXISTS "Only admins can insert calendar connections" ON public.google_calendar_connections;

-- Admins can only view calendar connections for their own clinic
CREATE POLICY "Admins can view own clinic calendar connections"
ON public.google_calendar_connections
FOR SELECT
USING (
  is_admin(auth.uid()) AND (
    clinic_id IS NULL OR 
    clinic_id = get_user_clinic_id(auth.uid())
  )
);

-- Admins can only insert calendar connections for their own clinic
CREATE POLICY "Admins can insert own clinic calendar connections"
ON public.google_calendar_connections
FOR INSERT
WITH CHECK (
  is_admin(auth.uid()) AND (
    clinic_id IS NULL OR 
    clinic_id = get_user_clinic_id(auth.uid())
  )
);

-- Admins can only update calendar connections for their own clinic
CREATE POLICY "Admins can update own clinic calendar connections"
ON public.google_calendar_connections
FOR UPDATE
USING (
  is_admin(auth.uid()) AND (
    clinic_id IS NULL OR 
    clinic_id = get_user_clinic_id(auth.uid())
  )
);

-- Admins can only delete calendar connections for their own clinic
CREATE POLICY "Admins can delete own clinic calendar connections"
ON public.google_calendar_connections
FOR DELETE
USING (
  is_admin(auth.uid()) AND (
    clinic_id IS NULL OR 
    clinic_id = get_user_clinic_id(auth.uid())
  )
);