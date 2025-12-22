-- Add columns for Phase 3 PCP Discharge Summary automation with clinician confirmation
ALTER TABLE public.pcp_summary_tasks 
ADD COLUMN IF NOT EXISTS draft_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS draft_summary JSONB,
ADD COLUMN IF NOT EXISTS clinician_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS clinician_confirmed_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS outcome_integrity_passed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS outcome_integrity_issues TEXT[],
ADD COLUMN IF NOT EXISTS care_targets_summary JSONB,
ADD COLUMN IF NOT EXISTS reason_for_referral TEXT,
ADD COLUMN IF NOT EXISTS clinical_course_summary TEXT,
ADD COLUMN IF NOT EXISTS recommendations TEXT[],
ADD COLUMN IF NOT EXISTS followup_guidance TEXT,
ADD COLUMN IF NOT EXISTS discharge_status TEXT;

-- Add index for efficient querying of drafts awaiting confirmation
CREATE INDEX IF NOT EXISTS idx_pcp_summary_tasks_awaiting_confirmation 
ON public.pcp_summary_tasks(status, clinician_confirmed_at) 
WHERE status = 'READY' AND clinician_confirmed_at IS NULL;

-- Add comment explaining the confirmation flow
COMMENT ON COLUMN public.pcp_summary_tasks.clinician_confirmed_at IS 
'Timestamp when clinician confirmed the summary is ready to send. Required before automated sending.';

COMMENT ON COLUMN public.pcp_summary_tasks.outcome_integrity_passed IS 
'True if all care targets have baseline and discharge outcomes. Summary cannot be auto-sent if false.';