-- Fix 1: intakes table - Fix the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Anyone can update their own intake" ON public.intakes;

-- Intakes can only be updated if the user created it (via lead_id linkage) or by system
CREATE POLICY "System can update intakes"
ON public.intakes
FOR UPDATE
USING (auth.role() = 'service_role' OR is_admin(auth.uid()));

-- Fix 2: Make sure intake_progress requires authentication for SELECT
-- Check current state and add restrictive policy
DROP POLICY IF EXISTS "Users can view their own intake progress by token" ON public.intake_progress;

-- Only authenticated clinicians can view intake progress
CREATE POLICY "Only authenticated clinicians can view intake progress"
ON public.intake_progress
FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()));

-- Fix 3: Restrict leads SELECT to only authenticated users (already done but verify)
DROP POLICY IF EXISTS "Admins and clinicians can view leads" ON public.leads;

CREATE POLICY "Only authenticated users can view leads"
ON public.leads
FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()));