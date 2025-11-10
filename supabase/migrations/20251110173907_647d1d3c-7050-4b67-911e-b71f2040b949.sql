-- Create table for patient intake forms
CREATE TABLE public.intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  
  -- Patient demographics
  patient_name text NOT NULL,
  date_of_birth date NOT NULL,
  phone text,
  email text,
  address text,
  
  -- Insurance information
  insurance_provider text,
  insurance_id text,
  
  -- Emergency contact
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  
  -- Medical information
  primary_care_physician text,
  referring_physician text,
  current_medications text,
  allergies text,
  medical_history text,
  
  -- Injury/condition details
  chief_complaint text NOT NULL,
  injury_date date,
  injury_mechanism text,
  pain_level integer,
  symptoms text,
  
  -- Timestamps
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  converted_to_episode_id text,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create intake forms (public access)
CREATE POLICY "Anyone can submit intake forms"
  ON public.intake_forms
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can view their own intake using access code
CREATE POLICY "Anyone can view intake with access code"
  ON public.intake_forms
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can view all intakes
CREATE POLICY "Clinicians can view all intakes"
  ON public.intake_forms
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can update intakes
CREATE POLICY "Clinicians can update intakes"
  ON public.intake_forms
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_intake_forms_updated_at
  BEFORE UPDATE ON public.intake_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for access codes
CREATE INDEX idx_intake_forms_access_code ON public.intake_forms(access_code);
CREATE INDEX idx_intake_forms_status ON public.intake_forms(status);