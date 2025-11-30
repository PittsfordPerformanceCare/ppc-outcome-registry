-- Ortho Referral & Return-to-Registry Module - Database Foundation
-- Phase 1: Core Infrastructure

-- Create episode_status enum for state machine
CREATE TYPE episode_status AS ENUM (
  'ACTIVE_CONSERVATIVE_CARE',
  'REFERRED_TO_ORTHO',
  'ORTHO_CONSULT_COMPLETED',
  'SURGERY_COMPLETED',
  'ORTHO_REHAB_IN_PROGRESS',
  'ORTHO_REHAB_COMPLETED',
  'PENDING_RETURN_TO_PPC',
  'FINAL_PPC_ASSESSMENT_COMPLETED',
  'EPISODE_CLOSED'
);

-- Create task_status enum
CREATE TYPE task_status AS ENUM (
  'Open',
  'Done'
);

-- Create ortho_partners table
CREATE TABLE public.ortho_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID,
  name TEXT NOT NULL,
  group_name TEXT,
  location TEXT,
  subspecialty TEXT,
  direct_secure_address TEXT,
  fax_or_email_backup TEXT,
  preferred_return_method TEXT,
  priority_scheduling_instructions TEXT,
  return_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ortho_partners
ALTER TABLE public.ortho_partners ENABLE ROW LEVEL SECURITY;

-- RLS policies for ortho_partners
CREATE POLICY "Users can view ortho partners for their clinic"
  ON public.ortho_partners FOR SELECT
  USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid()) OR 
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can create ortho partners"
  ON public.ortho_partners FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can update ortho partners"
  ON public.ortho_partners FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid()) OR 
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

-- Create ortho_referrals table
CREATE TABLE public.ortho_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID,
  patient_id UUID,
  episode_id TEXT NOT NULL,
  destination_ortho_id UUID NOT NULL REFERENCES public.ortho_partners(id) ON DELETE RESTRICT,
  referral_date DATE NOT NULL DEFAULT CURRENT_DATE,
  referral_reason_primary TEXT NOT NULL,
  referral_reason_secondary TEXT[],
  suspected_procedure_type TEXT,
  procedure_class TEXT,
  priority_flag BOOLEAN NOT NULL DEFAULT false,
  return_to_registry_required BOOLEAN NOT NULL DEFAULT true,
  expected_return_window_start DATE,
  expected_return_window_end DATE,
  communication_channel TEXT,
  notes_to_ortho TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ortho_referrals
ALTER TABLE public.ortho_referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for ortho_referrals
CREATE POLICY "Users can view ortho referrals for their clinic"
  ON public.ortho_referrals FOR SELECT
  USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid()) OR 
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can create ortho referrals"
  ON public.ortho_referrals FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can update ortho referrals"
  ON public.ortho_referrals FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid()) OR 
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

-- Create post_ortho_return_packets table
CREATE TABLE public.post_ortho_return_packets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID,
  patient_id UUID,
  episode_id TEXT NOT NULL,
  ortho_partner_id UUID NOT NULL REFERENCES public.ortho_partners(id) ON DELETE RESTRICT,
  procedure_performed TEXT,
  surgery_date DATE,
  rehab_facility TEXT,
  rehab_discharge_date DATE,
  complications TEXT,
  next_ortho_followup_date DATE,
  submitted_by TEXT,
  submitted_via TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on post_ortho_return_packets
ALTER TABLE public.post_ortho_return_packets ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_ortho_return_packets
CREATE POLICY "Users can view return packets for their clinic"
  ON public.post_ortho_return_packets FOR SELECT
  USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid()) OR 
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can create return packets"
  ON public.post_ortho_return_packets FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can update return packets"
  ON public.post_ortho_return_packets FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    is_admin(auth.uid()) OR 
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

-- Create ortho_tasks table
CREATE TABLE public.ortho_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID,
  task_type TEXT NOT NULL,
  patient_id UUID,
  episode_id TEXT,
  due_date DATE NOT NULL,
  status task_status NOT NULL DEFAULT 'Open',
  assigned_to UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ortho_tasks
ALTER TABLE public.ortho_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for ortho_tasks
CREATE POLICY "Users can view tasks for their clinic"
  ON public.ortho_tasks FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_to OR
    is_admin(auth.uid()) OR 
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can create tasks"
  ON public.ortho_tasks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "Users can update tasks"
  ON public.ortho_tasks FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_to OR
    is_admin(auth.uid()) OR 
    (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

-- Extend episodes table with ortho referral fields
ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS episode_type TEXT DEFAULT 'MSK',
  ADD COLUMN IF NOT EXISTS body_region TEXT,
  ADD COLUMN IF NOT EXISTS current_status episode_status DEFAULT 'ACTIVE_CONSERVATIVE_CARE',
  ADD COLUMN IF NOT EXISTS has_ortho_referral BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS return_to_registry_required BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS referral_id UUID REFERENCES public.ortho_referrals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS surgery_performed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS surgery_date DATE,
  ADD COLUMN IF NOT EXISTS final_closure_date DATE;

-- Create trigger to update updated_at on ortho_partners
CREATE TRIGGER update_ortho_partners_updated_at
  BEFORE UPDATE ON public.ortho_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update updated_at on ortho_referrals
CREATE TRIGGER update_ortho_referrals_updated_at
  BEFORE UPDATE ON public.ortho_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update updated_at on ortho_tasks
CREATE TRIGGER update_ortho_tasks_updated_at
  BEFORE UPDATE ON public.ortho_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for episode status queries
CREATE INDEX idx_episodes_current_status ON public.episodes(current_status);
CREATE INDEX idx_episodes_has_ortho_referral ON public.episodes(has_ortho_referral);
CREATE INDEX idx_ortho_referrals_episode_id ON public.ortho_referrals(episode_id);
CREATE INDEX idx_ortho_tasks_status ON public.ortho_tasks(status);
CREATE INDEX idx_ortho_tasks_due_date ON public.ortho_tasks(due_date);