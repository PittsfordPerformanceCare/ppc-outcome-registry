-- Fix leads table: Restrict SELECT to clinicians/admins only
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;

CREATE POLICY "Clinicians and admins can view leads" ON public.leads
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'clinician'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Clinicians and admins can update leads" ON public.leads
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'clinician'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Fix referral_inquiries: Remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view referral inquiries" ON public.referral_inquiries;
DROP POLICY IF EXISTS "Authenticated users can update referral inquiries" ON public.referral_inquiries;

-- Fix neurologic_intake_leads: Remove overly permissive policies (keep admin-only)
DROP POLICY IF EXISTS "Authenticated users can view neurologic leads" ON public.neurologic_intake_leads;
DROP POLICY IF EXISTS "Authenticated users can update neurologic leads" ON public.neurologic_intake_leads;
DROP POLICY IF EXISTS "Anyone can insert neurologic leads" ON public.neurologic_intake_leads;

-- Add clinician access to neurologic_intake_leads
CREATE POLICY "Clinicians can view neurologic leads" ON public.neurologic_intake_leads
FOR SELECT USING (
  auth.uid() IS NOT NULL AND has_role(auth.uid(), 'clinician'::app_role)
);

CREATE POLICY "Clinicians can update neurologic leads" ON public.neurologic_intake_leads
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND has_role(auth.uid(), 'clinician'::app_role)
);

-- Fix intake_progress: Restrict to clinicians/admins
DROP POLICY IF EXISTS "Staff can view intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "Staff can update intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "Staff can insert intake progress" ON public.intake_progress;

CREATE POLICY "Clinicians and admins can view intake progress" ON public.intake_progress
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'clinician'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Clinicians and admins can update intake progress" ON public.intake_progress
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'clinician'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Clinicians and admins can insert intake progress" ON public.intake_progress
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'clinician'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Fix intake_forms: Restrict UPDATE to clinicians/admins only
DROP POLICY IF EXISTS "Staff can update intake forms" ON public.intake_forms;

CREATE POLICY "Clinicians and admins can update intake forms" ON public.intake_forms
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'clinician'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  )
);