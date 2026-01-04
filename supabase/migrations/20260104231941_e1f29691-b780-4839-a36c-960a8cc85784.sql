-- Add site_id column to research_exports for site filtering support
ALTER TABLE public.research_exports 
ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES public.clinics(id);

-- Add index for site-based queries
CREATE INDEX IF NOT EXISTS idx_research_exports_site_id ON public.research_exports(site_id);

-- Comment for documentation
COMMENT ON COLUMN public.research_exports.site_id IS 'Optional site filter applied during export. NULL means all sites.';