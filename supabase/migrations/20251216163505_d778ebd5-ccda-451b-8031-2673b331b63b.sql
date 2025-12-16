-- Add discharge outcome tracking to episodes
ALTER TABLE public.episodes 
ADD COLUMN IF NOT EXISTS discharge_outcome text CHECK (discharge_outcome IN ('care_complete', 'continuing_new_episode', 'care_paused')),
ADD COLUMN IF NOT EXISTS continuation_episode_source text CHECK (continuation_episode_source IN ('documented', 'newly_identified')),
ADD COLUMN IF NOT EXISTS continuation_details jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.episodes.discharge_outcome IS 'Clinician decision on episode discharge: care_complete, continuing_new_episode, or care_paused';
COMMENT ON COLUMN public.episodes.continuation_episode_source IS 'Source of continuation episode: documented (existing complaint) or newly_identified (new concern during care)';
COMMENT ON COLUMN public.episodes.continuation_details IS 'Details for continuation episode: {primary_complaint, category, documented_complaint_ref, outcome_tools_suggestion}';

-- Create pending episode continuations queue for admin
CREATE TABLE IF NOT EXISTS public.pending_episode_continuations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_episode_id text NOT NULL,
  patient_name text NOT NULL,
  clinician_id uuid REFERENCES public.profiles(id),
  clinician_name text,
  continuation_source text NOT NULL CHECK (continuation_source IN ('documented', 'newly_identified')),
  primary_complaint text NOT NULL,
  category text NOT NULL,
  documented_complaint_ref text,
  outcome_tools_suggestion text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'setup_complete', 'cancelled')),
  created_episode_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  completed_by uuid REFERENCES public.profiles(id),
  clinic_id uuid REFERENCES public.clinics(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  notes text
);

-- Enable RLS
ALTER TABLE public.pending_episode_continuations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pending_episode_continuations
CREATE POLICY "Clinicians can create continuation requests"
ON public.pending_episode_continuations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view clinic continuation requests"
ON public.pending_episode_continuations
FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() = clinician_id 
  OR is_admin(auth.uid()) 
  OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
);

CREATE POLICY "Admins can update continuation requests"
ON public.pending_episode_continuations
FOR UPDATE
USING (
  is_admin(auth.uid()) 
  OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
);

-- Create trigger for updated_at
CREATE TRIGGER update_pending_episode_continuations_updated_at
BEFORE UPDATE ON public.pending_episode_continuations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_pending_continuations_status ON public.pending_episode_continuations(status);
CREATE INDEX IF NOT EXISTS idx_pending_continuations_clinic ON public.pending_episode_continuations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pending_continuations_source_episode ON public.pending_episode_continuations(source_episode_id);