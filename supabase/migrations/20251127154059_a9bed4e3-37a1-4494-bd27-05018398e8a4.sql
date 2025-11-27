-- Add new fields for clinician credentials and medication/allergy tracking
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS clinician_credentials TEXT,
ADD COLUMN IF NOT EXISTS med_changes_flag BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS med_changes_notes TEXT,
ADD COLUMN IF NOT EXISTS allergy_flag BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergy_notes TEXT;

COMMENT ON COLUMN public.episodes.clinician_credentials IS 'Professional credentials of the treating clinician (e.g., DC, PT, DO)';
COMMENT ON COLUMN public.episodes.med_changes_flag IS 'Indicates if there were medication changes during treatment';
COMMENT ON COLUMN public.episodes.med_changes_notes IS 'Details about medication changes';
COMMENT ON COLUMN public.episodes.allergy_flag IS 'Indicates if there are allergies relevant to care';
COMMENT ON COLUMN public.episodes.allergy_notes IS 'Details about allergies relevant to care';