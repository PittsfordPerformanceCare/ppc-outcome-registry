-- Create clinics table
CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  license_status text DEFAULT 'active',
  license_expires_at timestamp with time zone,
  settings jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Add clinic_id to profiles
ALTER TABLE public.profiles ADD COLUMN clinic_id uuid REFERENCES public.clinics(id);

-- Add clinic_id to episodes
ALTER TABLE public.episodes ADD COLUMN clinic_id uuid REFERENCES public.clinics(id);

-- Add clinic_id to outcome_scores
ALTER TABLE public.outcome_scores ADD COLUMN clinic_id uuid REFERENCES public.clinics(id);

-- Add clinic_id to followups
ALTER TABLE public.followups ADD COLUMN clinic_id uuid REFERENCES public.clinics(id);

-- Add clinic_id to audit_logs
ALTER TABLE public.audit_logs ADD COLUMN clinic_id uuid REFERENCES public.clinics(id);

-- Create function to get user's clinic_id
CREATE OR REPLACE FUNCTION public.get_user_clinic_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.profiles WHERE id = _user_id
$$;

-- Create trigger for clinics updated_at
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update RLS policies to be clinic-aware

-- Episodes policies
DROP POLICY IF EXISTS "Users can view episodes" ON public.episodes;
CREATE POLICY "Users can view episodes" 
ON public.episodes 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
  OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
);

DROP POLICY IF EXISTS "Users can create own episodes" ON public.episodes;
CREATE POLICY "Users can create own episodes" 
ON public.episodes 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
);

DROP POLICY IF EXISTS "Users can update episodes" ON public.episodes;
CREATE POLICY "Users can update episodes" 
ON public.episodes 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
  OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
);

DROP POLICY IF EXISTS "Users can delete episodes" ON public.episodes;
CREATE POLICY "Users can delete episodes" 
ON public.episodes 
FOR DELETE 
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
  OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
);

-- Outcome scores policies
DROP POLICY IF EXISTS "Users can view outcome scores" ON public.outcome_scores;
CREATE POLICY "Users can view outcome scores" 
ON public.outcome_scores 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
  OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
);

DROP POLICY IF EXISTS "Users can create own outcome scores" ON public.outcome_scores;
CREATE POLICY "Users can create own outcome scores" 
ON public.outcome_scores 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
);

DROP POLICY IF EXISTS "Users can update outcome scores" ON public.outcome_scores;
CREATE POLICY "Users can update outcome scores" 
ON public.outcome_scores 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
  OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
);

-- Followups policies
DROP POLICY IF EXISTS "Users can view followups" ON public.followups;
CREATE POLICY "Users can view followups" 
ON public.followups 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
  OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
);

DROP POLICY IF EXISTS "Users can create own followups" ON public.followups;
CREATE POLICY "Users can create own followups" 
ON public.followups 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
);

DROP POLICY IF EXISTS "Users can update followups" ON public.followups;
CREATE POLICY "Users can update followups" 
ON public.followups 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
  OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
);

-- Audit logs policies
DROP POLICY IF EXISTS "Users can view audit logs" ON public.audit_logs;
CREATE POLICY "Users can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
  OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
);

-- Profiles policies (allow viewing within same clinic)
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id 
  OR is_admin(auth.uid())
  OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
);

-- Clinics policies
CREATE POLICY "Users can view own clinic" 
ON public.clinics 
FOR SELECT 
USING (
  id = get_user_clinic_id(auth.uid()) 
  OR is_admin(auth.uid())
);

CREATE POLICY "Admins can manage clinics" 
ON public.clinics 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));