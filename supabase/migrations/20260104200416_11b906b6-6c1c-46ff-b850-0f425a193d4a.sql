-- Add missing structured column for red desaturation data
ALTER TABLE public.neurologic_exams 
ADD COLUMN IF NOT EXISTS neuro_red_desaturation_structured JSONB;