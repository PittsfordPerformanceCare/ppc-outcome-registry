-- Create referral_inquiries table for QR code screening flow
CREATE TABLE public.referral_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  care_for text NOT NULL CHECK (care_for IN ('self', 'child')),
  chief_complaint text NOT NULL,
  referral_source text,
  referral_code text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamp with time zone,
  decline_reason text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  clinic_id uuid REFERENCES clinics(id)
);

-- Enable RLS
ALTER TABLE public.referral_inquiries ENABLE ROW LEVEL SECURITY;

-- Public can insert (no auth needed for form submission)
CREATE POLICY "Anyone can submit referral inquiries"
ON public.referral_inquiries
FOR INSERT
WITH CHECK (true);

-- Clinicians can view inquiries for their clinic
CREATE POLICY "Clinicians can view referral inquiries"
ON public.referral_inquiries
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    clinic_id = get_user_clinic_id(auth.uid()) OR
    is_admin(auth.uid())
  )
);

-- Clinicians can update inquiries (approve/decline)
CREATE POLICY "Clinicians can update referral inquiries"
ON public.referral_inquiries
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    clinic_id = get_user_clinic_id(auth.uid()) OR
    is_admin(auth.uid())
  )
);

-- Create index for faster queries
CREATE INDEX idx_referral_inquiries_status ON public.referral_inquiries(status);
CREATE INDEX idx_referral_inquiries_created_at ON public.referral_inquiries(created_at DESC);
CREATE INDEX idx_referral_inquiries_clinic_id ON public.referral_inquiries(clinic_id);

-- Add referral inquiry email templates to clinic_settings
ALTER TABLE public.clinic_settings
ADD COLUMN IF NOT EXISTS referral_approval_email_subject text DEFAULT 'Welcome to {{clinic_name}} - Next Steps',
ADD COLUMN IF NOT EXISTS referral_approval_email_template text DEFAULT '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">We Can Help!</h1>
  <p>Hi {{name}},</p>
  <p>Thanks for reaching out — we can help.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Next Steps</h2>
    <p>Please complete your full Neurologic Intake Form here:</p>
    <p><a href="{{intake_link}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Complete Intake Form</a></p>
  </div>
  <p>Once submitted, you will receive instructions for scheduling your first visit.</p>
  <p>We look forward to working with you.</p>
  <p style="margin-top: 30px;">— Dr. Luckey<br/>Pittsford Performance Care</p>
</div>',
ADD COLUMN IF NOT EXISTS referral_decline_email_subject text DEFAULT 'Thank You for Reaching Out',
ADD COLUMN IF NOT EXISTS referral_decline_email_template text DEFAULT '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Thank You for Reaching Out</h1>
  <p>Hi {{name}},</p>
  <p>Thank you for contacting us. Based on your brief description, your needs may be better served by a specialist in this area.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Our Recommendation</h2>
    <p>{{decline_reason}}</p>
  </div>
  <p>If you have questions about next steps, feel free to reach out.</p>
  <p style="margin-top: 30px;">— Dr. Luckey<br/>Pittsford Performance Care</p>
</div>';

-- Enable realtime for referral_inquiries
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_inquiries;

-- Trigger for updated_at
CREATE TRIGGER update_referral_inquiries_updated_at
  BEFORE UPDATE ON public.referral_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();