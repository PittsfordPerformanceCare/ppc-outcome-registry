-- =============================================
-- FIX ALL PUBLIC DATA EXPOSURE ISSUES
-- =============================================

-- 1. INTAKE_PROGRESS - Restrict SELECT to authenticated only
ALTER TABLE public.intake_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clinicians can view intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "Service role can insert intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "Service role can update intake progress" ON public.intake_progress;

CREATE POLICY "Authenticated users can view intake progress"
ON public.intake_progress FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert intake progress"
ON public.intake_progress FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update intake progress"
ON public.intake_progress FOR UPDATE
TO authenticated
USING (true);

-- 2. LEADS - Restrict SELECT to authenticated only
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "System and admins can update leads" ON public.leads;

CREATE POLICY "Authenticated users can view leads"
ON public.leads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert leads"
ON public.leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
ON public.leads FOR UPDATE
TO authenticated
USING (true);

-- 3. REFERRAL_INQUIRIES - Restrict SELECT to authenticated only
ALTER TABLE public.referral_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit referral inquiries" ON public.referral_inquiries;
DROP POLICY IF EXISTS "Authenticated users can view referral inquiries" ON public.referral_inquiries;

CREATE POLICY "Authenticated users can view referral inquiries"
ON public.referral_inquiries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can submit referral inquiries"
ON public.referral_inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update referral inquiries"
ON public.referral_inquiries FOR UPDATE
TO authenticated
USING (true);

-- 4. NEUROLOGIC_INTAKE_LEADS - Restrict SELECT to authenticated only
ALTER TABLE public.neurologic_intake_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can create neurologic intake leads" ON public.neurologic_intake_leads;
DROP POLICY IF EXISTS "Admins can view neurologic intake leads" ON public.neurologic_intake_leads;
DROP POLICY IF EXISTS "Admins can update neurologic intake leads" ON public.neurologic_intake_leads;

CREATE POLICY "Authenticated users can view neurologic leads"
ON public.neurologic_intake_leads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert neurologic leads"
ON public.neurologic_intake_leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update neurologic leads"
ON public.neurologic_intake_leads FOR UPDATE
TO authenticated
USING (true);

-- 5. INTAKE_FORMS - Already has RLS, ensure SELECT is authenticated only
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can submit intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Clinicians can view intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Clinicians can update intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Admins can delete intake forms" ON public.intake_forms;

CREATE POLICY "Authenticated users can view intake forms"
ON public.intake_forms FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can submit intake forms"
ON public.intake_forms FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update intake forms"
ON public.intake_forms FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete intake forms"
ON public.intake_forms FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));