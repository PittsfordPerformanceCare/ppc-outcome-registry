-- Add outcome measure reminder configuration to clinic_settings
ALTER TABLE clinic_settings
ADD COLUMN IF NOT EXISTS outcome_reminder_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS outcome_reminder_interval_days integer DEFAULT 14,
ADD COLUMN IF NOT EXISTS outcome_reminder_email_subject text DEFAULT 'Time to Complete Your Outcome Measure - {{patient_name}}',
ADD COLUMN IF NOT EXISTS outcome_reminder_email_template text DEFAULT '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Time for Your Progress Check-in</h1>
  <p>Dear {{patient_name}},</p>
  <p>As part of your ongoing physical therapy treatment with {{clinic_name}}, it''s time to complete your {{outcome_tool}} assessment. This helps us track your progress and ensure your treatment plan is working effectively.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Your Treatment Details</h2>
    <p><strong>Episode ID:</strong> {{episode_id}}</p>
    <p><strong>Clinician:</strong> {{clinician_name}}</p>
    <p><strong>Region:</strong> {{region}}</p>
  </div>
  <p>Please complete the assessment at your earliest convenience. This only takes a few minutes and provides valuable information about your recovery progress.</p>
  <p>If you have any questions about the assessment or your treatment, please call us at {{clinic_phone}}.</p>
  <p style="margin-top: 30px;">Thank you for your continued dedication to your recovery!<br/>{{clinic_name}} Team</p>
</div>',
ADD COLUMN IF NOT EXISTS outcome_reminder_sms_template text DEFAULT '{{clinic_name}}: Hi {{patient_name}}, it''s time to complete your {{outcome_tool}} assessment for your PT treatment. This helps track your progress. Call {{clinic_phone}} with questions.';