-- Remove old permissive policies that allow public access
DROP POLICY IF EXISTS "Anyone can view intake progress with valid token" ON public.intake_progress;
DROP POLICY IF EXISTS "Anyone can update intake progress with valid token" ON public.intake_progress;
DROP POLICY IF EXISTS "Anyone can save intake progress" ON public.intake_progress;

-- Keep only the staff policies that require auth.uid() IS NOT NULL
-- These should already exist from previous migration