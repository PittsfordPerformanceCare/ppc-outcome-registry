-- Fix referral_inquiries RLS - restrict to clinicians/admins only, not patients
DROP POLICY IF EXISTS "Anyone can read referral inquiries" ON public.referral_inquiries;
DROP POLICY IF EXISTS "Authenticated users can view referral inquiries" ON public.referral_inquiries;
DROP POLICY IF EXISTS "Staff can view referral inquiries" ON public.referral_inquiries;

CREATE POLICY "Staff can view referral inquiries" ON public.referral_inquiries
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'clinician'::app_role)
  )
);