-- Add discharge notification templates to clinic_settings
ALTER TABLE clinic_settings
ADD COLUMN IF NOT EXISTS discharge_email_subject text DEFAULT 'Congratulations on Completing Your Physical Therapy!',
ADD COLUMN IF NOT EXISTS discharge_email_template text DEFAULT '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Congratulations on Completing Your Treatment!</h1>
  <p>Dear {{patient_name}},</p>
  <p>Congratulations on completing your physical therapy treatment with {{clinic_name}}! We are so proud of your progress and dedication throughout your recovery journey.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Your Final Results</h2>
    <p><strong>Episode ID:</strong> {{episode_id}}</p>
    <p><strong>Clinician:</strong> {{clinician_name}}</p>
    <p><strong>Discharge Date:</strong> {{discharge_date}}</p>
  </div>
  <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #166534; margin-top: 0;">Next Steps & Recommendations</h3>
    <ul style="color: #166534;">
      <li>Continue with your home exercise program as discussed</li>
      <li>Gradually return to your normal activities</li>
      <li>Monitor your symptoms and contact us if they return</li>
      <li>We will follow up with you in 90 days to ensure your progress is maintained</li>
    </ul>
  </div>
  <p>If you experience any concerns or have questions about your recovery, please do not hesitate to reach out to us at {{clinic_phone}}.</p>
  <p style="margin-top: 30px;">Thank you for trusting us with your care!<br/>{{clinic_name}} Team</p>
</div>',
ADD COLUMN IF NOT EXISTS discharge_sms_template text DEFAULT '{{clinic_name}}: Congratulations {{patient_name}} on completing your PT treatment! Continue your home exercises and contact us at {{clinic_phone}} if you have any questions. We will check in with you in 90 days.';