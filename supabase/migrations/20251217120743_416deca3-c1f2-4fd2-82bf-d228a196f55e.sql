-- Add patient contact information columns to communication_tasks
ALTER TABLE public.communication_tasks
ADD COLUMN patient_email text,
ADD COLUMN patient_phone text,
ADD COLUMN guardian_phone text;

-- Add comment for clarity
COMMENT ON COLUMN public.communication_tasks.guardian_phone IS 'Parent/guardian phone if patient is a minor';