-- Create special_situations table
CREATE TABLE public.special_situations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  clinician_id UUID NOT NULL,
  clinician_name TEXT,
  note_content TEXT,
  situation_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  status TEXT NOT NULL DEFAULT 'open',
  clinic_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT special_situations_status_check CHECK (status IN ('open', 'resolved')),
  CONSTRAINT special_situations_type_check CHECK (situation_type IN (
    'referral_initiated',
    'new_neurologic_symptoms', 
    'red_flag',
    'emergency_or_911',
    'provider_transition',
    'change_in_plan_unexpected'
  ))
);

-- Create indexes for performance
CREATE INDEX idx_special_situations_episode_id ON public.special_situations(episode_id);
CREATE INDEX idx_special_situations_clinician_id ON public.special_situations(clinician_id);
CREATE INDEX idx_special_situations_status ON public.special_situations(status);
CREATE INDEX idx_special_situations_type ON public.special_situations(situation_type);
CREATE INDEX idx_special_situations_detected_at ON public.special_situations(detected_at);
CREATE UNIQUE INDEX idx_special_situations_unique_open ON public.special_situations(episode_id, situation_type) WHERE status = 'open';

-- Enable RLS
ALTER TABLE public.special_situations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can do everything with special situations"
  ON public.special_situations
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Clinicians can view own special situations"
  ON public.special_situations
  FOR SELECT
  USING (clinician_id = auth.uid());

CREATE POLICY "System can insert special situations"
  ON public.special_situations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update special situations"
  ON public.special_situations
  FOR UPDATE
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_special_situations_updated_at
  BEFORE UPDATE ON public.special_situations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();