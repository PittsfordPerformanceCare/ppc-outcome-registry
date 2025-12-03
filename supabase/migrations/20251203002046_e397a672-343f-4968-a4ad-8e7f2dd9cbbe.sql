-- Allow public/anonymous inserts to neurologic_intake_leads (similar to intake_forms)
CREATE POLICY "Anyone can submit neurologic intake leads"
ON public.neurologic_intake_leads
FOR INSERT
WITH CHECK (true);