-- Add conversion tracking fields to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS origin_page text,
ADD COLUMN IF NOT EXISTS origin_cta text,
ADD COLUMN IF NOT EXISTS intake_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS episode_opened_at timestamp with time zone;

-- Add index for status tracking queries
CREATE INDEX IF NOT EXISTS idx_leads_checkpoint_status ON public.leads(checkpoint_status);

-- Add comment for documentation
COMMENT ON COLUMN public.leads.origin_page IS 'Source page where lead originated (e.g., pillar-home, pillar-services)';
COMMENT ON COLUMN public.leads.origin_cta IS 'CTA button clicked to start intake (e.g., schedule_neurologic_eval, severity_check)';
COMMENT ON COLUMN public.leads.intake_completed_at IS 'Timestamp when intake form was fully completed';
COMMENT ON COLUMN public.leads.episode_opened_at IS 'Timestamp when clinician created episode from this lead';