-- Fix intake_forms: Restrict SELECT access to authenticated clinicians/admins only
-- Keep INSERT for public (patients submitting forms) but lock down reading

DROP POLICY IF EXISTS "Public can view intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Anyone can view intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Authenticated can view intake forms" ON public.intake_forms;

-- Only clinicians and admins can read intake forms
CREATE POLICY "Only clinicians and admins can view intake forms"
ON public.intake_forms
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'clinician'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure UPDATE is also restricted
DROP POLICY IF EXISTS "Only clinicians and admins can update intake forms" ON public.intake_forms;

CREATE POLICY "Only clinicians and admins can update intake forms"
ON public.intake_forms
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'clinician'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure DELETE is also restricted
DROP POLICY IF EXISTS "Only clinicians and admins can delete intake forms" ON public.intake_forms;

CREATE POLICY "Only clinicians and admins can delete intake forms"
ON public.intake_forms
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'clinician'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Fix google_calendar_connections: Ensure only authenticated clinic users can access their own tokens
ALTER TABLE public.google_calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendar_connections FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own calendar connections" ON public.google_calendar_connections;
DROP POLICY IF EXISTS "Admins can view all calendar connections" ON public.google_calendar_connections;

-- Users can only see their own calendar connections
CREATE POLICY "Users can view own calendar connections"
ON public.google_calendar_connections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can only update their own calendar connections
DROP POLICY IF EXISTS "Users can update own calendar connections" ON public.google_calendar_connections;

CREATE POLICY "Users can update own calendar connections"
ON public.google_calendar_connections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can only insert their own calendar connections
DROP POLICY IF EXISTS "Users can insert own calendar connections" ON public.google_calendar_connections;

CREATE POLICY "Users can insert own calendar connections"
ON public.google_calendar_connections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own calendar connections
DROP POLICY IF EXISTS "Users can delete own calendar connections" ON public.google_calendar_connections;

CREATE POLICY "Users can delete own calendar connections"
ON public.google_calendar_connections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);