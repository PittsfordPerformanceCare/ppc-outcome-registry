-- Create table for neurologic exam drafts
CREATE TABLE IF NOT EXISTS public.neurologic_exam_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id text NOT NULL,
  user_id uuid NOT NULL,
  clinic_id uuid,
  draft_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_saved_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(episode_id, user_id)
);

-- Enable RLS
ALTER TABLE public.neurologic_exam_drafts ENABLE ROW LEVEL SECURITY;

-- Users can view their own drafts
CREATE POLICY "Users can view own drafts"
  ON public.neurologic_exam_drafts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own drafts
CREATE POLICY "Users can create own drafts"
  ON public.neurologic_exam_drafts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND (clinic_id IS NULL OR clinic_id = (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    ))
  );

-- Users can update their own drafts
CREATE POLICY "Users can update own drafts"
  ON public.neurologic_exam_drafts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete own drafts"
  ON public.neurologic_exam_drafts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_neurologic_exam_drafts_episode_user 
  ON public.neurologic_exam_drafts(episode_id, user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_neurologic_exam_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_saved_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_neurologic_exam_drafts_timestamp
  BEFORE UPDATE ON public.neurologic_exam_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_neurologic_exam_drafts_updated_at();