-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'clinician');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Update profiles RLS policies to allow admins to see all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin(auth.uid())
  );

-- Update episodes RLS policies to allow admins to see all episodes
DROP POLICY IF EXISTS "Users can view own episodes" ON public.episodes;
CREATE POLICY "Users can view episodes"
  ON public.episodes FOR SELECT
  USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own episodes" ON public.episodes;
CREATE POLICY "Users can update episodes"
  ON public.episodes FOR UPDATE
  USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own episodes" ON public.episodes;
CREATE POLICY "Users can delete episodes"
  ON public.episodes FOR DELETE
  USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

-- Update outcome_scores RLS policies
DROP POLICY IF EXISTS "Users can view own outcome scores" ON public.outcome_scores;
CREATE POLICY "Users can view outcome scores"
  ON public.outcome_scores FOR SELECT
  USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own outcome scores" ON public.outcome_scores;
CREATE POLICY "Users can update outcome scores"
  ON public.outcome_scores FOR UPDATE
  USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

-- Update followups RLS policies
DROP POLICY IF EXISTS "Users can view own followups" ON public.followups;
CREATE POLICY "Users can view followups"
  ON public.followups FOR SELECT
  USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own followups" ON public.followups;
CREATE POLICY "Users can update followups"
  ON public.followups FOR UPDATE
  USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

-- Update audit_logs RLS policies
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

-- Automatically assign clinician role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'clinician');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();