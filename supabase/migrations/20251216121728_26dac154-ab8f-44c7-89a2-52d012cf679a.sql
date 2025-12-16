
-- Add feature flag to clinic_settings
ALTER TABLE public.clinic_settings 
ADD COLUMN IF NOT EXISTS care_request_mode_enabled boolean DEFAULT false;

-- Create care_requests table
CREATE TABLE public.care_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'IN_REVIEW', 'CLARIFICATION_REQUESTED', 'APPROVED_FOR_CARE', 'ARCHIVED')),
  admin_owner_id uuid REFERENCES public.profiles(id),
  assigned_clinician_id uuid REFERENCES public.profiles(id),
  source text NOT NULL DEFAULT 'WEBSITE' CHECK (source IN ('WEBSITE', 'PHYSICIAN_REFERRAL', 'SCHOOL', 'ATHLETE_PROGRAM', 'INTERNAL')),
  intake_payload jsonb NOT NULL,
  primary_complaint text,
  triage_notes text,
  approval_reason text,
  archive_reason text,
  patient_id uuid REFERENCES public.patient_accounts(id),
  episode_id text,
  approved_at timestamp with time zone
);

-- Create lifecycle_events table (append-only audit log)
CREATE TABLE public.lifecycle_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type text NOT NULL CHECK (entity_type IN ('CARE_REQUEST', 'PATIENT', 'APPOINTMENT', 'EPISODE')),
  entity_id uuid NOT NULL,
  event_type text NOT NULL,
  actor_type text NOT NULL CHECK (actor_type IN ('system', 'admin', 'clinician', 'patient')),
  actor_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create episode_intake_snapshots table for immutable clinical context
CREATE TABLE public.episode_intake_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id text NOT NULL,
  care_request_id uuid REFERENCES public.care_requests(id),
  intake_payload jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);

-- Enable RLS on all new tables
ALTER TABLE public.care_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episode_intake_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS for care_requests (admin-only)
CREATE POLICY "Admins can view care requests"
  ON public.care_requests FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert care requests"
  ON public.care_requests FOR INSERT
  WITH CHECK (is_admin(auth.uid()) OR auth.uid() IS NULL);

CREATE POLICY "Admins can update care requests"
  ON public.care_requests FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert care requests"
  ON public.care_requests FOR INSERT
  WITH CHECK (true);

-- RLS for lifecycle_events (admins can view, system can insert)
CREATE POLICY "Admins can view lifecycle events"
  ON public.lifecycle_events FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert lifecycle events"
  ON public.lifecycle_events FOR INSERT
  WITH CHECK (true);

-- RLS for episode_intake_snapshots
CREATE POLICY "Clinicians can view episode snapshots"
  ON public.episode_intake_snapshots FOR SELECT
  USING (
    is_admin(auth.uid()) OR 
    has_role(auth.uid(), 'clinician')
  );

CREATE POLICY "System can insert episode snapshots"
  ON public.episode_intake_snapshots FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_care_requests_status ON public.care_requests(status);
CREATE INDEX idx_care_requests_admin_owner ON public.care_requests(admin_owner_id);
CREATE INDEX idx_care_requests_created_at ON public.care_requests(created_at DESC);
CREATE INDEX idx_lifecycle_events_entity ON public.lifecycle_events(entity_type, entity_id);
CREATE INDEX idx_lifecycle_events_created_at ON public.lifecycle_events(created_at DESC);
CREATE INDEX idx_episode_intake_snapshots_episode ON public.episode_intake_snapshots(episode_id);

-- Trigger for updated_at on care_requests
CREATE TRIGGER update_care_requests_updated_at
  BEFORE UPDATE ON public.care_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
