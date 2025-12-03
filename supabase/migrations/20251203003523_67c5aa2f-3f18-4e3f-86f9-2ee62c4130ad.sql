-- Drop the restrictive INSERT policies
DROP POLICY IF EXISTS "Anyone can submit neurologic intake leads" ON public.neurologic_intake_leads;
DROP POLICY IF EXISTS "Anyone can submit neurologic leads" ON public.neurologic_intake_leads;

-- Create a PERMISSIVE INSERT policy (default behavior)
CREATE POLICY "Public can submit neurologic intake leads"
ON public.neurologic_intake_leads
FOR INSERT
TO public
WITH CHECK (true);