-- Episode Integrity Issues table for tracking lifecycle problems
CREATE TABLE public.episode_integrity_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  clinician_id UUID REFERENCES public.profiles(id),
  clinic_id UUID REFERENCES public.clinics(id),
  issue_type TEXT NOT NULL,
  issue_details TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_episode_integrity_issues_episode_id ON public.episode_integrity_issues(episode_id);
CREATE INDEX idx_episode_integrity_issues_issue_type ON public.episode_integrity_issues(issue_type);
CREATE INDEX idx_episode_integrity_issues_is_active ON public.episode_integrity_issues(is_active);
CREATE INDEX idx_episode_integrity_issues_clinic_id ON public.episode_integrity_issues(clinic_id);
CREATE INDEX idx_episode_integrity_issues_detected_at ON public.episode_integrity_issues(detected_at DESC);

-- Enable RLS
ALTER TABLE public.episode_integrity_issues ENABLE ROW LEVEL SECURITY;

-- Only admins can view integrity issues
CREATE POLICY "Admins can view integrity issues"
ON public.episode_integrity_issues
FOR SELECT
USING (is_admin(auth.uid()));

-- Only admins can update (resolve) issues
CREATE POLICY "Admins can update integrity issues"
ON public.episode_integrity_issues
FOR UPDATE
USING (is_admin(auth.uid()));

-- System can insert issues (for the scheduled job)
CREATE POLICY "System can insert integrity issues"
ON public.episode_integrity_issues
FOR INSERT
WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_episode_integrity_issues_updated_at
BEFORE UPDATE ON public.episode_integrity_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Episode Integrity Check Runs table for tracking when checks ran
CREATE TABLE public.episode_integrity_check_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  issues_found INTEGER NOT NULL DEFAULT 0,
  issues_by_type JSONB,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_recipients TEXT[],
  error_message TEXT,
  status TEXT NOT NULL DEFAULT 'running',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.episode_integrity_check_runs ENABLE ROW LEVEL SECURITY;

-- Only admins can view check runs
CREATE POLICY "Admins can view check runs"
ON public.episode_integrity_check_runs
FOR SELECT
USING (is_admin(auth.uid()));

-- System can insert/update check runs
CREATE POLICY "System can insert check runs"
ON public.episode_integrity_check_runs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update check runs"
ON public.episode_integrity_check_runs
FOR UPDATE
USING (true);