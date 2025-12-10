-- Remove the overly permissive public INSERT policy on leads table
DROP POLICY IF EXISTS "Public can submit leads via intake forms" ON public.leads;

-- Create a more restrictive policy that allows system/edge function inserts
-- Edge functions use service role which bypasses RLS, so this is for documentation
CREATE POLICY "System can insert leads via edge functions"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- Add a comment explaining the security model
COMMENT ON TABLE public.leads IS 'Leads must be submitted through the create-lead edge function which handles validation and rate limiting';