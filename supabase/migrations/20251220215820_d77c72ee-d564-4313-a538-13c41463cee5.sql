-- Add communication preference columns to intake_forms table
ALTER TABLE public.intake_forms
ADD COLUMN preferred_contact_method text,
ADD COLUMN best_time_to_contact text,
ADD COLUMN language_preference text DEFAULT 'English';