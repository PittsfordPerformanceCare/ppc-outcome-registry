-- Grant INSERT permission to anon and authenticated roles
-- This is required for RLS policies to work - policies define WHICH rows,
-- but GRANT defines WHETHER you can perform the operation at all

GRANT INSERT ON public.neurologic_intake_leads TO anon;
GRANT INSERT ON public.neurologic_intake_leads TO authenticated;

-- Also grant SELECT so they can receive the inserted row back
GRANT SELECT ON public.neurologic_intake_leads TO anon;
GRANT SELECT ON public.neurologic_intake_leads TO authenticated;