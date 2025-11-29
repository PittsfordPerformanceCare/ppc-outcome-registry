-- Fix the RLS policy to allow patients to claim access codes
-- The policy needs to allow UPDATE when they have a valid invitation code
DROP POLICY IF EXISTS "Patients can claim access via invitation code" ON public.patient_episode_access;

CREATE POLICY "Patients can claim access via invitation code"
ON public.patient_episode_access
FOR UPDATE
USING (
  invitation_code IS NOT NULL 
  AND code_used_at IS NULL
)
WITH CHECK (
  invitation_code IS NOT NULL 
  AND code_used_at IS NOT NULL
  AND patient_id = auth.uid()
);