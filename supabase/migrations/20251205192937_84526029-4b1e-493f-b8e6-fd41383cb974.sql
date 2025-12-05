-- Fix: Use explicit auth.uid() checks instead of USING (true)

-- 1. INTAKE_PROGRESS - Explicit auth check
DROP POLICY IF EXISTS "Authenticated users can view intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "Authenticated users can insert intake progress" ON public.intake_progress;
DROP POLICY IF EXISTS "Authenticated users can update intake progress" ON public.intake_progress;

CREATE POLICY "Staff can view intake progress"
ON public.intake_progress FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can insert intake progress"
ON public.intake_progress FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update intake progress"
ON public.intake_progress FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- 2. INTAKE_FORMS - Explicit auth check for SELECT
DROP POLICY IF EXISTS "Authenticated users can view intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Anyone can submit intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Authenticated users can update intake forms" ON public.intake_forms;
DROP POLICY IF EXISTS "Admins can delete intake forms" ON public.intake_forms;

CREATE POLICY "Staff can view intake forms"
ON public.intake_forms FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Public INSERT still needed for patient submissions
CREATE POLICY "Public can submit intake forms"
ON public.intake_forms FOR INSERT
WITH CHECK (true);

CREATE POLICY "Staff can update intake forms"
ON public.intake_forms FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete intake forms"
ON public.intake_forms FOR DELETE
USING (is_admin(auth.uid()));