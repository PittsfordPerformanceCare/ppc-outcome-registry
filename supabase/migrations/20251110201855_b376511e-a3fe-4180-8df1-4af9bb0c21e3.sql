-- Add notification template columns to clinic_settings
ALTER TABLE public.clinic_settings
ADD COLUMN IF NOT EXISTS email_template text DEFAULT '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Welcome to {{clinic_name}}!</h1>
  <p>Dear {{patient_name}},</p>
  <p>Your intake form has been reviewed and your physical therapy episode has been successfully created.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Episode Details</h2>
    <p><strong>Clinician:</strong> {{clinician_name}}</p>
    <p><strong>Episode ID:</strong> {{episode_id}}</p>
  </div>
  <p>Your clinician will be working with you to develop a personalized treatment plan to help you achieve your recovery goals.</p>
  <p>If you have any questions, please call us at {{clinic_phone}}.</p>
  <p style="margin-top: 30px;">Best regards,<br/>{{clinic_name}} Team</p>
</div>',
ADD COLUMN IF NOT EXISTS sms_template text DEFAULT '{{clinic_name}}: Your PT episode has been created with {{clinician_name}}. Call {{clinic_phone}} with questions.',
ADD COLUMN IF NOT EXISTS email_subject text DEFAULT 'Your Physical Therapy Episode Has Been Created';

COMMENT ON COLUMN public.clinic_settings.email_template IS 'Email notification template with placeholders: {{patient_name}}, {{clinician_name}}, {{episode_id}}, {{clinic_name}}, {{clinic_phone}}, {{clinic_email}}';
COMMENT ON COLUMN public.clinic_settings.sms_template IS 'SMS notification template with placeholders: {{patient_name}}, {{clinician_name}}, {{episode_id}}, {{clinic_name}}, {{clinic_phone}}';
COMMENT ON COLUMN public.clinic_settings.email_subject IS 'Email subject line with placeholders: {{patient_name}}, {{clinic_name}}';