
-- =====================================================
-- SECURITY FIX: Harden RLS policies for sensitive tables
-- =====================================================

-- 1. FIX PROFILES TABLE: Remove overly permissive "same clinic" policy
-- Only allow users to view their own profile + admins can view clinic profiles
DROP POLICY IF EXISTS "Same clinic users can view profiles" ON public.profiles;

-- Clinicians should only see profiles they need to work with (admins + own profile)
-- Not all profiles in their clinic
CREATE POLICY "Clinicians can view admin profiles in clinic"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- User can see their own profile
  auth.uid() = id
  -- OR they are an admin viewing clinic profiles  
  OR is_admin(auth.uid())
  -- OR they are viewing an admin's profile in their clinic (for contact info)
  OR (
    clinic_id = get_user_clinic_id(auth.uid())
    AND has_role(id, 'admin'::app_role)
  )
);

-- 2. FIX PCP_SUMMARY_TASKS: Restrict to task owner and admins only
DROP POLICY IF EXISTS "Users can view their own clinic's pcp summary tasks" ON public.pcp_summary_tasks;
DROP POLICY IF EXISTS "Users can update their own clinic's pcp summary tasks" ON public.pcp_summary_tasks;

CREATE POLICY "Users can view own pcp summary tasks or admins"
ON public.pcp_summary_tasks
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR is_admin(auth.uid())
);

CREATE POLICY "Users can update own pcp summary tasks or admins"
ON public.pcp_summary_tasks
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR is_admin(auth.uid())
);

-- 3. FIX GOOGLE_CALENDAR_CONNECTIONS: Remove admin access to other users' tokens
-- Only the token owner should be able to see their own tokens
DROP POLICY IF EXISTS "Admin can select clinic calendar connections" ON public.google_calendar_connections;
DROP POLICY IF EXISTS "Admins can view own clinic calendar connections" ON public.google_calendar_connections;
DROP POLICY IF EXISTS "Admins can delete own clinic calendar connections" ON public.google_calendar_connections;
DROP POLICY IF EXISTS "Admins can update own clinic calendar connections" ON public.google_calendar_connections;
DROP POLICY IF EXISTS "Admins can insert own clinic calendar connections" ON public.google_calendar_connections;

-- Admins can only see that a connection exists (for admin purposes), not the tokens
-- We'll create a view or function for admin oversight without exposing tokens
-- For now, remove admin access to tokens entirely - only owner can access

-- 4. FIX INTAKE_FORMS: The public INSERT is intentional for patient submissions
-- But we should add a note that this is expected behavior
-- The SELECT policies are already restricted to clinicians/admins which is appropriate
-- for a healthcare setting where staff need to review patient submissions

-- Add comment to document the intentional public insert
COMMENT ON POLICY "Public can submit intake forms" ON public.intake_forms IS 
'Intentional: Allows unauthenticated patients to submit intake forms. 
Forms are reviewed by authenticated clinicians/admins only.';
