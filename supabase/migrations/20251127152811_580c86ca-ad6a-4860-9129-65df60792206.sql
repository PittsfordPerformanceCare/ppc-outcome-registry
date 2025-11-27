-- Add new fields to episodes table for enhanced PCP summary reporting

-- Clinical impression field
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS clinical_impression TEXT;

-- Return to function status items (stored as jsonb array)
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS return_to_function_items JSONB DEFAULT '[]'::jsonb;

-- PCP action steps items (stored as jsonb array)
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS pcp_action_items JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.episodes.clinical_impression IS 'One-line clinical summary for PCP communication';
COMMENT ON COLUMN public.episodes.return_to_function_items IS 'Array of return-to-function status items (e.g., ["Returned to full ADLs", "Improved overhead tolerance"])';
COMMENT ON COLUMN public.episodes.pcp_action_items IS 'Array of recommended PCP action items (e.g., ["Continue routine monitoring", "Re-evaluate if symptoms return"])';