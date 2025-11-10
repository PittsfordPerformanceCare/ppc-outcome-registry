-- Add complaints field to store multiple complaints with primary flag
-- Keep chief_complaint for backward compatibility initially
ALTER TABLE public.intake_forms
ADD COLUMN IF NOT EXISTS complaints jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.intake_forms.complaints IS 'Array of complaint objects with text and is_primary flag: [{text: string, is_primary: boolean}]';