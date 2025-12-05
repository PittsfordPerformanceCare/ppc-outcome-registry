-- Drop and recreate the SELECT policy to be more explicit
DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON public.profiles;

-- Allow users to view their own profile, and clinicians/admins can view all profiles (for care coordination)
CREATE POLICY "Users view own profile, staff view all" ON public.profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = id OR
    has_role(auth.uid(), 'clinician'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  )
);