-- Drop the overly permissive policy that exposes all profiles to any authenticated user
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- The remaining policies are properly scoped:
-- 1. "Users can view own profile or same clinic profiles" - allows viewing own profile or same clinic
-- 2. "Admins can view clinic profiles" - allows admins to view profiles in their clinic
-- These are sufficient and properly restrictive