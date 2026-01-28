-- Add new routing columns to leads table for concierge intake refactoring
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS time_sensitivity text,
ADD COLUMN IF NOT EXISTS goal_of_contact text,
ADD COLUMN IF NOT EXISTS route_label text;

-- Add comment for documentation
COMMENT ON COLUMN public.leads.time_sensitivity IS 'Time sensitivity selection: Yes/No/Not sure';
COMMENT ON COLUMN public.leads.goal_of_contact IS 'Goal of contact or referral purpose selection';
COMMENT ON COLUMN public.leads.route_label IS 'Computed routing label: MSK NP - Monday, Neuro NP - Wednesday, or Admin Review';