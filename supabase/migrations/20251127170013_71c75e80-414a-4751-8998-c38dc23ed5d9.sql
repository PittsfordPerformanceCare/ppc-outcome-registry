-- Add exam_type column to neurologic_exams table
ALTER TABLE public.neurologic_exams 
ADD COLUMN exam_type text NOT NULL DEFAULT 'baseline' CHECK (exam_type IN ('baseline', 'final'));

-- Add index for better query performance
CREATE INDEX idx_neurologic_exams_episode_type ON public.neurologic_exams(episode_id, exam_type);

-- Add comment
COMMENT ON COLUMN public.neurologic_exams.exam_type IS 'Type of exam: baseline (initial/intake) or final (discharge/re-examination)';