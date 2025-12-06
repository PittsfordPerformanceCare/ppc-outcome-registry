-- First, ensure RLS is enabled on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop the existing permissive INSERT policy and recreate with same behavior
-- (keeping it for documentation, but the issue is with SELECT)
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Recreate INSERT policy - this is intentional for public intake forms
-- The intake gateway at /begin-intake needs to create leads without authentication
CREATE POLICY "Public can submit leads via intake forms"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Drop and recreate SELECT policy to ensure it's correct
DROP POLICY IF EXISTS "Clinicians and admins can view leads" ON public.leads;

CREATE POLICY "Only clinicians and admins can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'clinician'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Verify UPDATE policy exists and is correct
DROP POLICY IF EXISTS "Clinicians and admins can update leads" ON public.leads;

CREATE POLICY "Only clinicians and admins can update leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'clinician'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);