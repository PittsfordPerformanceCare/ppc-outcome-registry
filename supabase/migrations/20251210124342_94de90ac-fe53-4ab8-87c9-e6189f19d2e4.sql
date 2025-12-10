-- Drop the broken policy
DROP POLICY IF EXISTS "System can insert leads via edge functions" ON public.leads;

-- Create a proper policy allowing public lead submissions
CREATE POLICY "Allow public lead submissions"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);