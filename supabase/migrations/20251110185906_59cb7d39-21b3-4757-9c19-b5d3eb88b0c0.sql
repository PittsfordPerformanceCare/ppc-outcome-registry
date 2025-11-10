-- Add consent and HIPAA fields to intake_forms table
ALTER TABLE public.intake_forms 
ADD COLUMN consent_signature text,
ADD COLUMN consent_signed_name text,
ADD COLUMN consent_date date,
ADD COLUMN hipaa_acknowledged boolean DEFAULT false,
ADD COLUMN hipaa_signed_name text,
ADD COLUMN hipaa_date date;