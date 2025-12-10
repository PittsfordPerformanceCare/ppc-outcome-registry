-- Add contact tracking fields to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS lead_status text DEFAULT 'new',
ADD COLUMN IF NOT EXISTS contact_attempt_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_contacted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS next_follow_up_date date;

-- Create contact attempts table for tracking individual attempts
CREATE TABLE IF NOT EXISTS public.lead_contact_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL,
  method text NOT NULL CHECK (method IN ('phone', 'email')),
  notes text,
  contacted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on contact attempts table
ALTER TABLE public.lead_contact_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for contact attempts
CREATE POLICY "Clinicians and admins can view contact attempts"
ON public.lead_contact_attempts FOR SELECT
USING (has_role(auth.uid(), 'clinician'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clinicians and admins can insert contact attempts"
ON public.lead_contact_attempts FOR INSERT
WITH CHECK (has_role(auth.uid(), 'clinician'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clinicians and admins can update contact attempts"
ON public.lead_contact_attempts FOR UPDATE
USING (has_role(auth.uid(), 'clinician'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clinicians and admins can delete contact attempts"
ON public.lead_contact_attempts FOR DELETE
USING (has_role(auth.uid(), 'clinician'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lead_contact_attempts_lead_id ON public.lead_contact_attempts(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_lead_status ON public.leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON public.leads(next_follow_up_date);