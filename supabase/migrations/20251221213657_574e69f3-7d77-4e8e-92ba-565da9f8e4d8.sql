-- Add education tracking columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS education_delivered boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS education_asset text,
ADD COLUMN IF NOT EXISTS education_url text,
ADD COLUMN IF NOT EXISTS education_delivered_at timestamp with time zone;

-- Add index for querying leads with education delivered
CREATE INDEX IF NOT EXISTS idx_leads_education_delivered ON public.leads(education_delivered) WHERE education_delivered = true;

-- Add comment for documentation
COMMENT ON COLUMN public.leads.education_delivered IS 'Whether educational content was delivered to this lead';
COMMENT ON COLUMN public.leads.education_asset IS 'Identifier of the educational asset delivered (e.g., acute_concussion_guide_v1)';
COMMENT ON COLUMN public.leads.education_url IS 'URL path of the educational content delivered';
COMMENT ON COLUMN public.leads.education_delivered_at IS 'Timestamp when educational content was delivered';