-- Create patient referrals table
CREATE TABLE IF NOT EXISTS public.patient_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_patient_id UUID REFERENCES public.patient_accounts(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_patient_email TEXT,
  referred_patient_name TEXT,
  intake_form_id UUID REFERENCES public.intake_forms(id) ON DELETE SET NULL,
  episode_id TEXT REFERENCES public.episodes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  intake_submitted_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  points_awarded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add referral_code column to intake_forms
ALTER TABLE public.intake_forms 
ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Enable RLS
ALTER TABLE public.patient_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_referrals
CREATE POLICY "Patients can view their own referrals"
ON public.patient_referrals
FOR SELECT
USING (auth.uid() = referrer_patient_id);

CREATE POLICY "Patients can create referrals"
ON public.patient_referrals
FOR INSERT
WITH CHECK (auth.uid() = referrer_patient_id);

CREATE POLICY "System can update referrals"
ON public.patient_referrals
FOR UPDATE
USING (true);

CREATE POLICY "Clinicians can view all referrals"
ON public.patient_referrals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
  )
);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_patient_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character code
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || p_patient_id::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM patient_referrals WHERE referral_code = v_code
    ) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- Function to award referral bonus
CREATE OR REPLACE FUNCTION public.award_referral_bonus()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
  v_points INTEGER := 100;
BEGIN
  -- Only award when status changes to 'converted' and hasn't been awarded yet
  IF NEW.status = 'converted' AND OLD.status != 'converted' AND NEW.points_awarded_at IS NULL THEN
    v_referrer_id := NEW.referrer_patient_id;
    
    IF v_referrer_id IS NOT NULL THEN
      -- Award points to referrer
      PERFORM award_patient_points(
        v_referrer_id,
        v_points,
        'Referral bonus for ' || COALESCE(NEW.referred_patient_name, NEW.referred_patient_email),
        NEW.episode_id,
        NULL
      );
      
      -- Mark as awarded
      NEW.points_awarded_at := now();
      
      -- Check for new achievements
      PERFORM check_and_award_achievements(v_referrer_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for referral bonus
DROP TRIGGER IF EXISTS trigger_award_referral_bonus ON public.patient_referrals;
CREATE TRIGGER trigger_award_referral_bonus
BEFORE UPDATE ON public.patient_referrals
FOR EACH ROW
EXECUTE FUNCTION award_referral_bonus();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patient_referrals_code ON public.patient_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_patient_referrals_referrer ON public.patient_referrals(referrer_patient_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_referral_code ON public.intake_forms(referral_code);

-- Add referral achievement
INSERT INTO public.achievement_definitions (name, description, achievement_type, badge_icon, badge_color, criteria)
VALUES (
  'Referral Champion',
  'Referred 5 patients to the clinic',
  'milestone',
  '🤝',
  'purple',
  '{"referrals_count": 5}'::jsonb
)
ON CONFLICT (name) DO NOTHING;