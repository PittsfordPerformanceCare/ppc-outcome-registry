-- Create table to track intake scheduling reminders
CREATE TABLE IF NOT EXISTS public.intake_scheduling_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_form_id UUID NOT NULL REFERENCES public.intake_forms(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('reminder_1', 'reminder_2', 'admin_alert')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(intake_form_id, reminder_type)
);

-- Enable RLS
ALTER TABLE public.intake_scheduling_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admin can view all scheduling reminders"
  ON public.intake_scheduling_reminders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert scheduling reminders"
  ON public.intake_scheduling_reminders
  FOR INSERT
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_intake_scheduling_reminders_intake_form_id 
  ON public.intake_scheduling_reminders(intake_form_id);

CREATE INDEX idx_intake_scheduling_reminders_sent_at 
  ON public.intake_scheduling_reminders(sent_at DESC);