-- Create comparison report delivery history table
CREATE TABLE IF NOT EXISTS public.comparison_report_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.comparison_report_schedules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  clinic_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_emails TEXT[] NOT NULL,
  export_ids TEXT[] NOT NULL,
  export_names TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  delivery_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comparison_report_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own delivery history"
  ON public.comparison_report_deliveries
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
    OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "System can insert delivery history"
  ON public.comparison_report_deliveries
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_comparison_deliveries_schedule_id ON public.comparison_report_deliveries(schedule_id);
CREATE INDEX idx_comparison_deliveries_sent_at ON public.comparison_report_deliveries(sent_at DESC);