-- Drop the restrictive clinician view policy
DROP POLICY IF EXISTS "Clinicians can view messages for their episodes" ON patient_messages;

-- Create a more permissive policy for clinicians to view all messages
CREATE POLICY "Clinicians can view all patient messages"
ON patient_messages
FOR SELECT
TO public
USING (
  -- Clinicians (users with profiles in the system) can view all patient messages
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
  )
  OR is_admin(auth.uid())
  OR auth.uid() = patient_id  -- Patients can still view their own
);

-- Update the update policy similarly
DROP POLICY IF EXISTS "Clinicians can update messages" ON patient_messages;

CREATE POLICY "Clinicians can update all patient messages"
ON patient_messages
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid()
  )
  OR is_admin(auth.uid())
);