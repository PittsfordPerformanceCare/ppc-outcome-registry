-- Add missing structured column for pupillary fatigue data
ALTER TABLE public.neurologic_exams 
ADD COLUMN IF NOT EXISTS neuro_pupillary_fatigue_structured JSONB;