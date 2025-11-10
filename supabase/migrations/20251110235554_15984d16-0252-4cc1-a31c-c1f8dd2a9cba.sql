-- Add tracking fields to comparison_report_deliveries
ALTER TABLE public.comparison_report_deliveries
ADD COLUMN IF NOT EXISTS tracking_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_clicked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- Create index for tracking lookups
CREATE INDEX IF NOT EXISTS idx_comparison_deliveries_tracking_id ON public.comparison_report_deliveries(tracking_id);

-- Create table for comparison report link clicks
CREATE TABLE IF NOT EXISTS public.comparison_report_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID NOT NULL REFERENCES public.comparison_report_deliveries(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  link_url TEXT NOT NULL,
  link_label TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comparison_report_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clicks
CREATE POLICY "Users can view clicks for their deliveries"
  ON public.comparison_report_clicks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM comparison_report_deliveries crd
      WHERE crd.id = comparison_report_clicks.delivery_id
        AND (
          auth.uid() = crd.user_id 
          OR is_admin(auth.uid())
          OR (crd.clinic_id IS NOT NULL AND crd.clinic_id = get_user_clinic_id(auth.uid()))
        )
    )
  );

CREATE POLICY "Allow click tracking"
  ON public.comparison_report_clicks
  FOR INSERT
  WITH CHECK (true);

-- Allow public tracking pixel updates
CREATE POLICY "Allow public tracking updates"
  ON public.comparison_report_deliveries
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create index for click tracking
CREATE INDEX IF NOT EXISTS idx_comparison_clicks_delivery_id ON public.comparison_report_clicks(delivery_id);
CREATE INDEX IF NOT EXISTS idx_comparison_clicks_clicked_at ON public.comparison_report_clicks(clicked_at DESC);