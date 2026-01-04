-- Add all missing columns for neurologic_exams form
ALTER TABLE public.neurologic_exams 
ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'baseline',
ADD COLUMN IF NOT EXISTS clinical_history TEXT,
ADD COLUMN IF NOT EXISTS o2_saturation_walking TEXT,
ADD COLUMN IF NOT EXISTS walking_o2_notes TEXT,
ADD COLUMN IF NOT EXISTS overall_notes TEXT;