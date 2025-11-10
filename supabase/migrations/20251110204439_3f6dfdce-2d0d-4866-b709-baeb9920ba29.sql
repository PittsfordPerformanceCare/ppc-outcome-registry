-- Add email tracking fields to notifications_history
ALTER TABLE public.notifications_history
ADD COLUMN IF NOT EXISTS tracking_id uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS opened_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS open_count integer DEFAULT 0;

-- Create index for faster tracking lookups
CREATE INDEX IF NOT EXISTS idx_notifications_tracking_id ON public.notifications_history(tracking_id);

-- Update RLS policy to allow public access for tracking (pixel endpoint needs this)
CREATE POLICY "Allow public tracking pixel access"
ON public.notifications_history
FOR UPDATE
USING (true)
WITH CHECK (true);