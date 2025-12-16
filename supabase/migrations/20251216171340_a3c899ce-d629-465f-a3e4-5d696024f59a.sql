-- Add total_visits_to_discharge to episodes table
-- This is a clinician-reported, discharge-time metric for visit efficiency tracking

ALTER TABLE public.episodes 
ADD COLUMN IF NOT EXISTS total_visits_to_discharge INTEGER;

-- Add constraint to ensure positive integer when set
ALTER TABLE public.episodes 
ADD CONSTRAINT total_visits_to_discharge_positive 
CHECK (total_visits_to_discharge IS NULL OR total_visits_to_discharge > 0);

-- Add comment for documentation
COMMENT ON COLUMN public.episodes.total_visits_to_discharge IS 
'Total number of clinical visits for this episode, including evaluation. Clinician-reported at discharge. Required when episode is discharged. Immutable after submission.';