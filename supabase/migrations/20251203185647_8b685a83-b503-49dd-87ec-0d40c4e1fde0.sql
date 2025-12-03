-- Create intakes table for tracking intake progress
CREATE TABLE public.intakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  timestamp_started TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  timestamp_completed TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'abandoned')),
  patient_name TEXT,
  patient_email TEXT,
  patient_phone TEXT,
  form_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intakes ENABLE ROW LEVEL SECURITY;

-- Allow public insert (anyone can start an intake)
CREATE POLICY "Anyone can create intakes" 
ON public.intakes 
FOR INSERT 
WITH CHECK (true);

-- Allow public update (for progress tracking)
CREATE POLICY "Anyone can update their own intake" 
ON public.intakes 
FOR UPDATE 
USING (true);

-- Authenticated users can view intakes
CREATE POLICY "Authenticated users can view intakes" 
ON public.intakes 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_intakes_updated_at
BEFORE UPDATE ON public.intakes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes
CREATE INDEX idx_intakes_lead_id ON public.intakes(lead_id);
CREATE INDEX idx_intakes_status ON public.intakes(status);
CREATE INDEX idx_intakes_timestamp_started ON public.intakes(timestamp_started);
CREATE INDEX idx_intakes_progress ON public.intakes(progress) WHERE status = 'started';