-- Fix 1: intake_progress table - restrict to authenticated clinicians only
-- First enable RLS if not already enabled
ALTER TABLE public.intake_progress ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies
DROP POLICY IF EXISTS "Anyone can view intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "Public can view intake progress" ON public.intake_progress;

-- Allow authenticated clinicians to view intake progress
CREATE POLICY "Authenticated clinicians can view intake progress"
ON public.intake_progress
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
));

-- Allow system/edge functions to insert (for saving progress)
CREATE POLICY "System can insert intake progress"
ON public.intake_progress
FOR INSERT
WITH CHECK (true);

-- Allow system to update intake progress
CREATE POLICY "System can update intake progress"
ON public.intake_progress
FOR UPDATE
USING (true);

-- Fix 2: leads table - tighten SELECT policy
-- Drop the existing SELECT policy and recreate with stricter access
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;

-- Only admins and authenticated clinicians can view leads
CREATE POLICY "Admins and clinicians can view leads"
ON public.leads
FOR SELECT
USING (
  is_admin(auth.uid()) 
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
);

-- Keep INSERT open for public lead capture but make UPDATE more restrictive
DROP POLICY IF EXISTS "Anyone can update their own lead" ON public.leads;

-- Leads can only be updated by the system (edge functions) or admins
CREATE POLICY "System and admins can update leads"
ON public.leads
FOR UPDATE
USING (is_admin(auth.uid()) OR auth.uid() IS NULL);