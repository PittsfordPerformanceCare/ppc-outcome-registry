-- Create table for neurologic intake leads
CREATE TABLE public.neurologic_intake_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  persona TEXT NOT NULL CHECK (persona IN ('self', 'parent', 'professional')),
  
  -- Common fields
  email TEXT NOT NULL,
  phone TEXT,
  primary_concern TEXT,
  source TEXT DEFAULT 'concussion_pillar',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'converted', 'archived')),
  
  -- Self persona fields
  name TEXT,
  symptom_profile TEXT,
  duration TEXT,
  
  -- Parent persona fields
  parent_name TEXT,
  child_name TEXT,
  child_age TEXT,
  symptom_location TEXT,
  
  -- Professional referral fields
  referrer_name TEXT,
  role TEXT,
  organization TEXT,
  patient_name TEXT,
  patient_age TEXT,
  notes TEXT,
  urgency TEXT DEFAULT 'routine',
  
  -- Metadata
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.neurologic_intake_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit leads (public form)
CREATE POLICY "Anyone can submit neurologic leads"
  ON public.neurologic_intake_leads
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view leads
CREATE POLICY "Admins can view neurologic leads"
  ON public.neurologic_intake_leads
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Only admins can update leads
CREATE POLICY "Admins can update neurologic leads"
  ON public.neurologic_intake_leads
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_neurologic_intake_leads_updated_at
  BEFORE UPDATE ON public.neurologic_intake_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();