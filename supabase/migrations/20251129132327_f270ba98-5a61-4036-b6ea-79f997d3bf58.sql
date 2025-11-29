-- Relax RLS policy so patients can claim access codes even when patient_id is not yet their auth user id
ALTER POLICY "Patients can claim access via invitation code"
ON public.patient_episode_access
USING ((invitation_code IS NOT NULL) AND (code_used_at IS NULL));