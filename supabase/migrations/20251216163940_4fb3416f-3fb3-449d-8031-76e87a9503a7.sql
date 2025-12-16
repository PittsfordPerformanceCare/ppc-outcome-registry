-- 1️⃣ Decision Ownership Metadata
-- Add decision tracking to episodes table
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS decision_made_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS decision_timestamp timestamp with time zone,
ADD COLUMN IF NOT EXISTS decision_context text;

-- 2️⃣ Episode Transition Reason Codes
-- Create enum type for transition reasons
DO $$ BEGIN
  CREATE TYPE episode_transition_reason AS ENUM (
    'UNRELATED_NEW_COMPLAINT',
    'SEQUENTIAL_CARE',
    'EMERGED_DURING_TREATMENT',
    'PREVENTIVE_OR_PERFORMANCE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add transition reason to pending_episode_continuations
ALTER TABLE public.pending_episode_continuations
ADD COLUMN IF NOT EXISTS transition_reason text;

-- 3️⃣ Outcome Tool Locking at Episode Creation
-- Create outcome tool locks table
CREATE TABLE IF NOT EXISTS public.episode_outcome_tool_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id text NOT NULL,
  outcome_tools text[] NOT NULL,
  locked_at timestamp with time zone NOT NULL DEFAULT now(),
  locked_by uuid REFERENCES public.profiles(id),
  override_at timestamp with time zone,
  override_by uuid REFERENCES public.profiles(id),
  override_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.episode_outcome_tool_locks ENABLE ROW LEVEL SECURITY;

-- RLS policies for outcome tool locks
CREATE POLICY "Clinicians can view outcome tool locks"
ON public.episode_outcome_tool_locks FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Clinicians can create outcome tool locks"
ON public.episode_outcome_tool_locks FOR INSERT
WITH CHECK (auth.uid() = locked_by);

CREATE POLICY "Admins can update outcome tool locks"
ON public.episode_outcome_tool_locks FOR UPDATE
USING (is_admin(auth.uid()));

-- 4️⃣ Explicit Terminal Episode State
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS episode_terminal boolean DEFAULT false;

-- 5️⃣ Passive Task Escalation Ceiling
-- Add escalation tracking to communication_tasks
ALTER TABLE public.communication_tasks
ADD COLUMN IF NOT EXISTS stall_detected_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS stall_threshold_days integer DEFAULT 3;

-- Create view for stalled tasks (passive surfacing)
CREATE OR REPLACE VIEW public.stalled_communication_tasks AS
SELECT 
  ct.*,
  p.full_name as clinician_name,
  EXTRACT(DAY FROM (now() - ct.status_changed_at)) as days_in_status
FROM public.communication_tasks ct
LEFT JOIN public.profiles p ON ct.assigned_clinician_id = p.id
WHERE ct.status IN ('WAITING_ON_CLINICIAN', 'BLOCKED')
  AND ct.status_changed_at < (now() - (ct.stall_threshold_days || ' days')::interval)
  AND ct.completed_at IS NULL;

-- 6️⃣ Admin Coverage Mode
CREATE TABLE IF NOT EXISTS public.admin_coverage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.profiles(id),
  clinic_id uuid REFERENCES public.clinics(id),
  is_on_duty boolean NOT NULL DEFAULT true,
  coverage_start timestamp with time zone,
  coverage_end timestamp with time zone,
  covering_for uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_coverage ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin coverage
CREATE POLICY "Admins can view coverage"
ON public.admin_coverage FOR SELECT
USING (is_admin(auth.uid()) OR auth.uid() = admin_id);

CREATE POLICY "Admins can manage own coverage"
ON public.admin_coverage FOR INSERT
WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update own coverage"
ON public.admin_coverage FOR UPDATE
USING (auth.uid() = admin_id OR is_admin(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_admin_coverage_updated_at
  BEFORE UPDATE ON public.admin_coverage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7️⃣ Audit log enhancements for decision tracking
-- Add index for efficient audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_decision_context 
ON public.audit_logs(table_name, action) 
WHERE table_name = 'episodes';

-- Create function to auto-populate decision metadata on episode updates
CREATE OR REPLACE FUNCTION public.track_episode_decisions()
RETURNS TRIGGER AS $$
BEGIN
  -- Track discharge decisions
  IF NEW.discharge_outcome IS NOT NULL AND (OLD.discharge_outcome IS NULL OR OLD.discharge_outcome != NEW.discharge_outcome) THEN
    NEW.decision_made_by := auth.uid();
    NEW.decision_timestamp := now();
    NEW.decision_context := 'DISCHARGE';
  END IF;
  
  -- Set terminal state when care is complete with no follow-on
  IF NEW.discharge_outcome = 'care_complete' AND NEW.continuation_episode_source IS NULL THEN
    NEW.episode_terminal := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for decision tracking
DROP TRIGGER IF EXISTS track_episode_decisions_trigger ON public.episodes;
CREATE TRIGGER track_episode_decisions_trigger
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW
  EXECUTE FUNCTION public.track_episode_decisions();

-- Create function to auto-map transition reasons
CREATE OR REPLACE FUNCTION public.map_transition_reason()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-map based on continuation_source
  IF NEW.transition_reason IS NULL THEN
    IF NEW.continuation_source = 'documented' THEN
      NEW.transition_reason := 'SEQUENTIAL_CARE';
    ELSIF NEW.continuation_source = 'newly_identified' THEN
      NEW.transition_reason := 'EMERGED_DURING_TREATMENT';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for transition reason mapping
DROP TRIGGER IF EXISTS map_transition_reason_trigger ON public.pending_episode_continuations;
CREATE TRIGGER map_transition_reason_trigger
  BEFORE INSERT OR UPDATE ON public.pending_episode_continuations
  FOR EACH ROW
  EXECUTE FUNCTION public.map_transition_reason();

-- Function to detect stalled tasks (runs periodically)
CREATE OR REPLACE FUNCTION public.detect_stalled_tasks()
RETURNS void AS $$
BEGIN
  UPDATE public.communication_tasks
  SET stall_detected_at = now()
  WHERE status IN ('WAITING_ON_CLINICIAN', 'BLOCKED')
    AND completed_at IS NULL
    AND stall_detected_at IS NULL
    AND status_changed_at < (now() - (COALESCE(stall_threshold_days, 3) || ' days')::interval);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;