-- Drop the incorrectly targeted policy
DROP POLICY IF EXISTS "Public can submit neurologic intake leads" ON public.neurologic_intake_leads;

-- Create policy targeting the correct Supabase roles
CREATE POLICY "Anyone can submit neurologic intake leads"
ON public.neurologic_intake_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);