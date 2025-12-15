-- Drop the problematic policy that queries auth.users directly
DROP POLICY IF EXISTS "Patients view own account by email" ON public.patient_accounts;

-- Recreate with auth.email() function instead
CREATE POLICY "Patients view own account by email"
ON public.patient_accounts
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND email = auth.email()
);