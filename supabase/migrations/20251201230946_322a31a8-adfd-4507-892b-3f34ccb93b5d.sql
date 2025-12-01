-- Add new email templates to clinic_settings for intake completion workflow
ALTER TABLE clinic_settings 
ADD COLUMN IF NOT EXISTS intake_complete_welcome_subject TEXT DEFAULT 'Welcome to {{clinic_name}} – Here''s What Happens Next',
ADD COLUMN IF NOT EXISTS intake_complete_welcome_template TEXT DEFAULT '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Welcome to {{clinic_name}}!</h1>
  <p>Hi {{patient_name}},</p>
  <p>Thank you for completing your intake form. We''ve reviewed your information and created your care episode. Here''s what happens next:</p>
  
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Your Care Team</h2>
    <p><strong>Assigned Clinician:</strong> {{clinician_name}}</p>
    <p><strong>Episode Type:</strong> {{episode_type}}</p>
    <p><strong>Focus Area:</strong> {{body_region}}</p>
  </div>
  
  <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #166534; margin-top: 0;">What to Expect in Your First Visit</h3>
    <ul style="color: #166534;">
      <li>Comprehensive evaluation of your condition</li>
      <li>Discussion of your goals and expectations</li>
      <li>Development of your personalized treatment plan</li>
      <li>Initial treatment session (time permitting)</li>
    </ul>
  </div>
  
  <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #92400e; margin-top: 0;">Visit Preparation Checklist</h3>
    <ul style="color: #78350f;">
      <li>✓ Wear comfortable, loose-fitting clothing</li>
      <li>✓ Bring insurance card and photo ID</li>
      <li>✓ Arrive 10 minutes early for check-in</li>
      <li>✓ Bring any relevant imaging or medical records</li>
    </ul>
  </div>
  
  <div style="background-color: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #3730a3; margin-top: 0;">Office Information</h3>
    <p style="color: #4338ca;"><strong>Address:</strong> {{clinic_address}}</p>
    <p style="color: #4338ca;"><strong>Phone:</strong> {{clinic_phone}}</p>
    <p style="color: #4338ca;"><strong>Parking:</strong> Free parking available in front of the building</p>
  </div>
  
  <p style="margin-top: 30px;">Questions before your first visit? Call us at {{clinic_phone}} or reply to this email.</p>
  <p>We look forward to working with you!</p>
  <p style="margin-top: 30px;">— {{clinic_name}} Team</p>
</div>',
ADD COLUMN IF NOT EXISTS intake_complete_scheduling_subject TEXT DEFAULT 'Schedule Your First Appointment at {{clinic_name}}',
ADD COLUMN IF NOT EXISTS intake_complete_scheduling_template TEXT DEFAULT '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Ready to Get Started?</h1>
  <p>Hi {{patient_name}},</p>
  <p>Your intake is complete and we''re ready to see you! Let''s get your first appointment scheduled.</p>
  
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <h2 style="color: #1f2937; margin-top: 0;">Schedule Your First Visit</h2>
    <p>Call us to schedule: <strong style="color: #2563eb; font-size: 1.2em;">{{clinic_phone}}</strong></p>
    <p style="color: #6b7280; font-size: 0.9em;">Available Monday-Friday, 8am-6pm</p>
  </div>
  
  <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="color: #166534; margin: 0;"><strong>💡 Pro Tip:</strong> Morning appointments tend to fill up quickly. Call today to get your preferred time slot!</p>
  </div>
  
  <p>We look forward to meeting you!</p>
  <p style="margin-top: 30px;">— {{clinic_name}} Team</p>
</div>',
ADD COLUMN IF NOT EXISTS send_scheduling_email BOOLEAN DEFAULT false;