-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  npi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create episodes table
CREATE TABLE public.episodes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  date_of_birth DATE,
  region TEXT NOT NULL,
  diagnosis TEXT,
  date_of_service DATE NOT NULL,
  injury_date DATE,
  injury_mechanism TEXT,
  pain_level TEXT,
  referring_physician TEXT,
  insurance TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  medications TEXT,
  medical_history TEXT,
  prior_treatments JSONB,
  prior_treatments_other TEXT,
  functional_limitations TEXT[],
  functional_limitation TEXT,
  treatment_goals JSONB,
  goals_other TEXT,
  start_date DATE,
  visits TEXT,
  resolution_days TEXT,
  compliance_rating TEXT,
  compliance_notes TEXT,
  referred_out BOOLEAN DEFAULT FALSE,
  referral_reason TEXT,
  discharge_date DATE,
  followup_date DATE,
  cis_pre NUMERIC,
  cis_post NUMERIC,
  cis_delta NUMERIC,
  pain_pre NUMERIC,
  pain_post NUMERIC,
  pain_delta NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Episodes RLS: Users can only access their own episodes
CREATE POLICY "Users can view own episodes"
  ON public.episodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own episodes"
  ON public.episodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own episodes"
  ON public.episodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own episodes"
  ON public.episodes FOR DELETE
  USING (auth.uid() = user_id);

-- Create outcome scores table
CREATE TABLE public.outcome_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id TEXT NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  index_type TEXT NOT NULL,
  score_type TEXT NOT NULL CHECK (score_type IN ('baseline', 'discharge', 'followup')),
  score NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.outcome_scores ENABLE ROW LEVEL SECURITY;

-- Outcome scores RLS
CREATE POLICY "Users can view own outcome scores"
  ON public.outcome_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own outcome scores"
  ON public.outcome_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outcome scores"
  ON public.outcome_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Create followups table
CREATE TABLE public.followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id TEXT NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT CHECK (status IN ('stable', 'improving', 'declining')),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;

-- Followups RLS
CREATE POLICY "Users can view own followups"
  ON public.followups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own followups"
  ON public.followups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own followups"
  ON public.followups FOR UPDATE
  USING (auth.uid() = user_id);

-- Create audit logs table for HIPAA compliance
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs RLS: Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_followups_updated_at
  BEFORE UPDATE ON public.followups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();