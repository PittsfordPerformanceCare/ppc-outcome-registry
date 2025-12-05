-- Add funnel tracking columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS funnel_stage TEXT,
ADD COLUMN IF NOT EXISTS pillar_origin TEXT;

-- Add funnel tracking columns to neurologic_intake_leads table
ALTER TABLE public.neurologic_intake_leads 
ADD COLUMN IF NOT EXISTS origin_page TEXT,
ADD COLUMN IF NOT EXISTS origin_cta TEXT,
ADD COLUMN IF NOT EXISTS funnel_stage TEXT,
ADD COLUMN IF NOT EXISTS pillar_origin TEXT;

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_leads_pillar_origin ON public.leads(pillar_origin);
CREATE INDEX IF NOT EXISTS idx_leads_funnel_stage ON public.leads(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_neurologic_leads_pillar_origin ON public.neurologic_intake_leads(pillar_origin);
CREATE INDEX IF NOT EXISTS idx_neurologic_leads_funnel_stage ON public.neurologic_intake_leads(funnel_stage);

-- Comment the columns for documentation
COMMENT ON COLUMN public.leads.funnel_stage IS 'Stage in conversion funnel: severity-check, intake-started, intake-completed, schedule-eval, episode-created';
COMMENT ON COLUMN public.leads.pillar_origin IS 'Source pillar app: hub, concussion_pillar, msk_pillar, registry';
COMMENT ON COLUMN public.neurologic_intake_leads.funnel_stage IS 'Stage in conversion funnel';
COMMENT ON COLUMN public.neurologic_intake_leads.pillar_origin IS 'Source pillar app';