-- Add review_of_systems column to intake_forms table
ALTER TABLE public.intake_forms 
ADD COLUMN review_of_systems jsonb DEFAULT '[]'::jsonb;