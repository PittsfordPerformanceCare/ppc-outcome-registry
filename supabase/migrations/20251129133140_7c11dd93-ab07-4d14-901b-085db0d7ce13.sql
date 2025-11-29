-- Create table for patient letters and summaries
CREATE TABLE public.patient_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id text NOT NULL,
  user_id uuid NOT NULL,
  clinic_id uuid,
  letter_type text NOT NULL, -- 'employee', 'school', 'neuro_summary', etc.
  title text NOT NULL,
  content text NOT NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  generated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_letters ENABLE ROW LEVEL SECURITY;

-- Clinicians can create letters for their episodes
CREATE POLICY "Clinicians can create letters for their episodes"
ON public.patient_letters
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM episodes e
    WHERE e.id = patient_letters.episode_id
    AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
  )
  OR is_admin(auth.uid())
);

-- Clinicians can view letters for their episodes
CREATE POLICY "Clinicians can view letters for their episodes"
ON public.patient_letters
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM episodes e
    WHERE e.id = patient_letters.episode_id
    AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
  )
  OR is_admin(auth.uid())
);

-- Patients can view letters for their episodes
CREATE POLICY "Patients can view letters for their episodes"
ON public.patient_letters
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patient_episode_access pea
    WHERE pea.episode_id = patient_letters.episode_id
    AND pea.patient_id = auth.uid()
  )
);

-- Clinicians can update letters for their episodes
CREATE POLICY "Clinicians can update letters for their episodes"
ON public.patient_letters
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM episodes e
    WHERE e.id = patient_letters.episode_id
    AND (e.user_id = auth.uid() OR e.clinic_id = get_user_clinic_id(auth.uid()))
  )
  OR is_admin(auth.uid())
);

-- Create index for faster queries
CREATE INDEX idx_patient_letters_episode_id ON public.patient_letters(episode_id);
CREATE INDEX idx_patient_letters_user_id ON public.patient_letters(user_id);