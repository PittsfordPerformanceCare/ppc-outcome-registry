-- Create table for saved date range presets
CREATE TABLE IF NOT EXISTS public.merge_report_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merge_report_presets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own presets"
  ON public.merge_report_presets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own presets"
  ON public.merge_report_presets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid())));

CREATE POLICY "Users can update own presets"
  ON public.merge_report_presets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets"
  ON public.merge_report_presets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_merge_report_presets_user_id ON public.merge_report_presets(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_merge_report_presets_updated_at
  BEFORE UPDATE ON public.merge_report_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();