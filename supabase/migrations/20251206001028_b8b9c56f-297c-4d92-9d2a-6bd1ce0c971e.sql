-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users view own profile, staff view all" ON public.profiles;

-- Create a more restrictive policy: users can only view their own profile
-- Admins can view all profiles for admin management purposes
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create a security definer function for clinician name lookups (e.g., for displaying episode clinician names)
-- This prevents exposing full profile data while allowing necessary name lookups
CREATE OR REPLACE FUNCTION public.get_clinician_display_name(clinician_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT full_name FROM public.profiles WHERE id = clinician_id;
$$;