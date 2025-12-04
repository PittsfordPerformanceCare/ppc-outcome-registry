-- Add reminder tracking columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS intake_first_reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS intake_second_reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient querying of leads needing reminders
CREATE INDEX IF NOT EXISTS idx_leads_incomplete_reminders 
ON public.leads (created_at, intake_completed_at, intake_first_reminder_sent_at, intake_second_reminder_sent_at)
WHERE intake_completed_at IS NULL;