-- Fix remaining RLS policies (patient_accounts already has policies)

-- Drop and recreate patient_accounts policies with correct names
DROP POLICY IF EXISTS "Patients can view own account" ON public.patient_accounts;
DROP POLICY IF EXISTS "Staff can view patient accounts" ON public.patient_accounts;

-- Create staff policy for patient_accounts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'patient_accounts' 
    AND policyname = 'Staff can view all patient accounts'
  ) THEN
    EXECUTE 'CREATE POLICY "Staff can view all patient accounts" ON public.patient_accounts
      FOR SELECT USING (has_role(auth.uid(), ''admin'') OR has_role(auth.uid(), ''clinician''))';
  END IF;
END $$;

-- Create patient self-view policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'patient_accounts' 
    AND policyname = 'Patients view own account by email'
  ) THEN
    EXECUTE 'CREATE POLICY "Patients view own account by email" ON public.patient_accounts
      FOR SELECT USING (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))';
  END IF;
END $$;

-- Fix patient_feedback - ensure only authenticated access
DROP POLICY IF EXISTS "Anyone can view patient feedback" ON public.patient_feedback;
DROP POLICY IF EXISTS "Public can view patient feedback" ON public.patient_feedback;

-- Fix leads - ensure only authenticated staff access (public insert is OK for forms)
DROP POLICY IF EXISTS "Anyone can view leads" ON public.leads;
DROP POLICY IF EXISTS "Public can view leads" ON public.leads;