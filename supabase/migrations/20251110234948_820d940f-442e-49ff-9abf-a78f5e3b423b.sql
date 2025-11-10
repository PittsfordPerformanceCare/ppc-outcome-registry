-- Create comparison report schedules table
CREATE TABLE public.comparison_report_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  export_ids TEXT[] NOT NULL,
  recipient_emails TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  send_day TEXT NOT NULL, -- 'monday', 'tuesday', etc. for weekly, '1', '2', '15' etc. for monthly
  send_time TEXT NOT NULL DEFAULT '09:00', -- HH:MM format
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comparison_report_schedules ENABLE ROW LEVEL SECURITY;

-- Users can view their own schedules
CREATE POLICY "Users can view own schedules"
ON public.comparison_report_schedules
FOR SELECT
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
  OR ((clinic_id IS NOT NULL) AND (clinic_id = get_user_clinic_id(auth.uid())))
);

-- Users can create their own schedules
CREATE POLICY "Users can create own schedules"
ON public.comparison_report_schedules
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND (clinic_id IS NULL OR clinic_id = get_user_clinic_id(auth.uid()))
);

-- Users can update their own schedules
CREATE POLICY "Users can update own schedules"
ON public.comparison_report_schedules
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
);

-- Users can delete their own schedules
CREATE POLICY "Users can delete own schedules"
ON public.comparison_report_schedules
FOR DELETE
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
);

-- Add trigger for updated_at
CREATE TRIGGER update_comparison_report_schedules_updated_at
  BEFORE UPDATE ON public.comparison_report_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();