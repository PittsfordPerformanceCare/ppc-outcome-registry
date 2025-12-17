-- Fix patient_episode_access UPDATE policy to require authentication
-- This prevents unauthenticated brute-force attempts on invitation codes

DROP POLICY IF EXISTS "Patients can claim access via invitation code" ON public.patient_episode_access;

-- Recreate with authentication requirement
CREATE POLICY "Patients can claim access via invitation code"
ON public.patient_episode_access
FOR UPDATE
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  -- Must have a valid, unused invitation code
  AND invitation_code IS NOT NULL 
  AND code_used_at IS NULL
  -- Code must not be expired (use existing token_expires_at column)
  AND (token_expires_at IS NULL OR token_expires_at > now())
);