-- Add RLS policy to allow anonymous users to insert into neurologic_intake_leads
-- This mirrors the pattern used for the leads table

CREATE POLICY "Anyone can create neurologic intake leads"
ON public.neurologic_intake_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);