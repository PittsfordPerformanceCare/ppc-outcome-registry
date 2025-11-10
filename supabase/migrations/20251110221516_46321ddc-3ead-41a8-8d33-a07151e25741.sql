-- Drop existing policy
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Create more restrictive policy for viewing profiles
-- Users can only view their own profile, admins can view all
CREATE POLICY "Users can view own profile and admins can view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR is_admin(auth.uid())
);

-- Note: Clinic members can still access clinician names through the episodes table
-- This prevents email harvesting while maintaining necessary functionality