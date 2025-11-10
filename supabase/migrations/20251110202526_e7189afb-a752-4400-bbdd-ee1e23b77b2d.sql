-- Add appointment time fields and reminder tracking
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS followup_time text,
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone;

ALTER TABLE public.followups
ADD COLUMN IF NOT EXISTS scheduled_time text,
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone;

-- Add reminder configuration to clinic settings
ALTER TABLE public.clinic_settings
ADD COLUMN IF NOT EXISTS reminder_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_hours_before integer DEFAULT 24,
ADD COLUMN IF NOT EXISTS reminder_email_subject text DEFAULT 'Appointment Reminder: {{patient_name}} - {{appointment_date}}',
ADD COLUMN IF NOT EXISTS reminder_email_template text DEFAULT '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Appointment Reminder</h1>
  <p>Dear {{patient_name}},</p>
  <p>This is a friendly reminder about your upcoming physical therapy appointment.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Appointment Details</h2>
    <p><strong>Date:</strong> {{appointment_date}}</p>
    <p><strong>Time:</strong> {{appointment_time}}</p>
    <p><strong>Clinician:</strong> {{clinician_name}}</p>
  </div>
  <p>If you need to reschedule or have any questions, please call us at {{clinic_phone}}.</p>
  <p style="margin-top: 30px;">See you soon!<br/>{{clinic_name}} Team</p>
</div>',
ADD COLUMN IF NOT EXISTS reminder_sms_template text DEFAULT '{{clinic_name}}: Reminder - You have a PT appointment on {{appointment_date}} at {{appointment_time}} with {{clinician_name}}. Call {{clinic_phone}} to reschedule.';

COMMENT ON COLUMN public.episodes.followup_time IS 'Time of the follow-up appointment';
COMMENT ON COLUMN public.episodes.reminder_sent_at IS 'Timestamp when appointment reminder was sent';
COMMENT ON COLUMN public.followups.scheduled_time IS 'Time of the scheduled follow-up';
COMMENT ON COLUMN public.followups.reminder_sent_at IS 'Timestamp when appointment reminder was sent';
COMMENT ON COLUMN public.clinic_settings.reminder_enabled IS 'Whether appointment reminders are enabled';
COMMENT ON COLUMN public.clinic_settings.reminder_hours_before IS 'How many hours before appointment to send reminder';

-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;