-- Add new fields to intake_forms table for additional patient information
ALTER TABLE public.intake_forms
ADD COLUMN IF NOT EXISTS guardian_phone text,
ADD COLUMN IF NOT EXISTS referral_source text,
ADD COLUMN IF NOT EXISTS bill_responsible_party text,
ADD COLUMN IF NOT EXISTS consent_clinic_updates boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS opt_out_newsletter boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pcp_phone text,
ADD COLUMN IF NOT EXISTS pcp_address text,
ADD COLUMN IF NOT EXISTS specialist_seen text,
ADD COLUMN IF NOT EXISTS hospitalization_history text,
ADD COLUMN IF NOT EXISTS surgery_history text;