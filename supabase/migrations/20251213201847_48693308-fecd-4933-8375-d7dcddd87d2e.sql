-- Create table to store raw question responses for outcome measures
CREATE TABLE public.outcome_measure_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outcome_score_id UUID NOT NULL REFERENCES public.outcome_scores(id) ON DELETE CASCADE,
  episode_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id),
  instrument_code TEXT NOT NULL CHECK (instrument_code IN ('ODI', 'QUICKDASH', 'LEFS', 'NDI', 'RPQ')),
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  response_value INTEGER,
  response_text TEXT,
  is_skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_outcome_measure_responses_outcome_score_id ON public.outcome_measure_responses(outcome_score_id);
CREATE INDEX idx_outcome_measure_responses_episode_id ON public.outcome_measure_responses(episode_id);

-- Enable RLS
ALTER TABLE public.outcome_measure_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own responses"
  ON public.outcome_measure_responses
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()) OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can insert own responses"
  ON public.outcome_measure_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patient portal users can view responses for their episodes"
  ON public.outcome_measure_responses
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM patient_episode_access pea
    WHERE pea.episode_id = outcome_measure_responses.episode_id
    AND pea.patient_id = auth.uid()
    AND pea.is_active = true
  ));