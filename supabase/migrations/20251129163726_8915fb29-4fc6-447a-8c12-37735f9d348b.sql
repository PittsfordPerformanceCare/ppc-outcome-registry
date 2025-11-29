-- Fix RLS policy to allow clinicians to view all referral inquiries
-- regardless of clinic_id assignment
DROP POLICY IF EXISTS "Clinicians can view referral inquiries" ON public.referral_inquiries;

CREATE POLICY "Clinicians can view referral inquiries"
ON public.referral_inquiries
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);