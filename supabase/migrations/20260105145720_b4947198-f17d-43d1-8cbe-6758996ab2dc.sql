
-- Strengthen episodes RLS with clinic isolation
-- Drop existing policies that need strengthening
DROP POLICY IF EXISTS "Assigned clinician or admin can view episodes" ON public.episodes;
DROP POLICY IF EXISTS "Assigned clinician or admin can update episodes" ON public.episodes;

-- Create strengthened SELECT policy with clinic isolation
CREATE POLICY "Clinician can view own clinic episodes" 
ON public.episodes 
FOR SELECT 
TO authenticated
USING (
  -- User must be authenticated and either:
  -- 1. Is the assigned clinician for this episode
  -- 2. Is an admin
  -- 3. Is in the same clinic (if clinic_id is set)
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid() 
    OR is_admin(auth.uid())
    OR (
      clinic_id IS NOT NULL 
      AND clinic_id = get_user_clinic_id(auth.uid())
      AND (has_role(auth.uid(), 'clinician') OR has_role(auth.uid(), 'admin'))
    )
  )
);

-- Create strengthened UPDATE policy with clinic isolation
CREATE POLICY "Clinician can update own clinic episodes" 
ON public.episodes 
FOR UPDATE 
TO authenticated
USING (
  -- User must be the assigned clinician OR admin OR same clinic clinician
  user_id = auth.uid() 
  OR is_admin(auth.uid())
  OR (
    clinic_id IS NOT NULL 
    AND clinic_id = get_user_clinic_id(auth.uid())
    AND has_role(auth.uid(), 'clinician')
  )
);

-- Also remove duplicate INSERT policy (keep only the more restrictive one)
DROP POLICY IF EXISTS "Authenticated users can create episodes" ON public.episodes;
