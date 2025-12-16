-- Add delivery_method_used and preferred_delivery_method columns to pcp_summary_tasks
ALTER TABLE public.pcp_summary_tasks 
ADD COLUMN IF NOT EXISTS delivery_method_used text,
ADD COLUMN IF NOT EXISTS preferred_delivery_method text;

-- Update existing 'pending' status to 'READY', 'sent' to 'SENT', 'skipped' to 'SKIPPED'
UPDATE public.pcp_summary_tasks SET status = 'READY' WHERE status = 'pending';
UPDATE public.pcp_summary_tasks SET status = 'SENT' WHERE status = 'sent';
UPDATE public.pcp_summary_tasks SET status = 'SKIPPED' WHERE status = 'skipped';

-- Add comment explaining the status enum values
COMMENT ON COLUMN public.pcp_summary_tasks.status IS 'Delivery status: READY, SENT, FAILED, RESEND_REQUIRED, SKIPPED';
COMMENT ON COLUMN public.pcp_summary_tasks.delivery_method_used IS 'Method used for delivery: FAX, SECURE_EMAIL, PORTAL_UPLOAD, MANUAL_EXPORT';
COMMENT ON COLUMN public.pcp_summary_tasks.preferred_delivery_method IS 'Preferred delivery method for this PCP: FAX, SECURE_EMAIL, PORTAL_UPLOAD, MANUAL_EXPORT';