-- Create export history table
CREATE TABLE public.export_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  export_id UUID NOT NULL,
  export_name TEXT NOT NULL,
  export_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'processing')),
  recipient_emails TEXT[] NOT NULL,
  record_count INTEGER,
  error_message TEXT,
  user_id UUID NOT NULL,
  clinic_id UUID,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own export history"
  ON public.export_history
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_admin(auth.uid())
    OR (clinic_id IS NOT NULL AND clinic_id = get_user_clinic_id(auth.uid()))
  );

CREATE POLICY "System can insert export history"
  ON public.export_history
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_export_history_export_id ON public.export_history(export_id);
CREATE INDEX idx_export_history_user_id ON public.export_history(user_id);
CREATE INDEX idx_export_history_executed_at ON public.export_history(executed_at DESC);