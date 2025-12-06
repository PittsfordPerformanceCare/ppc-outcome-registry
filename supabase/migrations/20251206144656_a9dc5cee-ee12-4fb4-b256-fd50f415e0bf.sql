-- Drop any existing permissive INSERT policy
DROP POLICY IF EXISTS "Allow public lead creation" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Public can create leads" ON public.leads;

-- Create a restrictive INSERT policy - only authenticated clinicians/admins can create leads
-- OR allow public inserts from edge functions (service role bypasses RLS)
CREATE POLICY "Only clinicians and admins can insert leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'clinician'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Also add DELETE policy for completeness
DROP POLICY IF EXISTS "Only clinicians and admins can delete leads" ON public.leads;

CREATE POLICY "Only clinicians and admins can delete leads"
ON public.leads
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'clinician'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);