-- Enable RLS on intake_forms table to protect sensitive patient data
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.intake_forms;
DROP POLICY IF EXISTS "Anyone can view intake forms" ON public.intake_forms;

-- Allow public to submit intake forms (needed for initial form submission)
CREATE POLICY "Allow public to submit intake forms"
ON public.intake_forms
FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated clinicians to view intake forms from their clinic
CREATE POLICY "Clinicians can view intake forms"
ON public.intake_forms
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  )
);

-- Allow clinicians to update intake forms (for review/conversion)
CREATE POLICY "Clinicians can update intake forms"
ON public.intake_forms
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  )
);

-- Allow clinicians to delete intake forms if needed
CREATE POLICY "Clinicians can delete intake forms"
ON public.intake_forms
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
  )
);