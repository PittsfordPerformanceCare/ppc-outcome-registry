-- Ensure RLS is enabled on the leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner as well (important for security)
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;

-- Drop and recreate SELECT policy to ensure it's properly restrictive
DROP POLICY IF EXISTS "Only clinicians and admins can view leads" ON public.leads;

CREATE POLICY "Only clinicians and admins can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'clinician'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure UPDATE policy is also properly scoped
DROP POLICY IF EXISTS "Only clinicians and admins can update leads" ON public.leads;

CREATE POLICY "Only clinicians and admins can update leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'clinician'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);