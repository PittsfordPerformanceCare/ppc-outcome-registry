// Neurology-specific email templates

export const NEUROLOGY_EMAIL_TEMPLATES = {
  episodeCreation: {
    subject: "Your Neurologic Care Episode Has Been Created - {{clinic_name}}",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Welcome to Neurologic Care at {{clinic_name}}!</h1>
  <p>Dear {{patient_name}},</p>
  <p>Your intake form has been reviewed and your neurologic care episode has been successfully created. We understand that neurologic symptoms can be challenging, and we're here to support your recovery journey.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Episode Details</h2>
    <p><strong>Clinician:</strong> {{clinician_name}}</p>
    <p><strong>Episode ID:</strong> {{episode_id}}</p>
    <p><strong>Primary Concern:</strong> Neurologic symptoms</p>
  </div>
  <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af; margin-top: 0;">What to Expect</h3>
    <ul style="color: #1e40af;">
      <li>Comprehensive neurologic examination to assess your current function</li>
      <li>Regular progress tracking using validated outcome measures</li>
      <li>Evidence-based treatment tailored to your specific symptoms</li>
      <li>Follow-up assessments to monitor your recovery</li>
    </ul>
  </div>
  <p><strong>Important:</strong> Please complete the Rivermead Post-Concussion Symptoms Questionnaire (RPQ) at each visit to help us track your progress.</p>
  <p>If you have any questions, please call us at {{clinic_phone}}.</p>
  <p style="margin-top: 30px;">We look forward to helping you achieve your recovery goals.<br/>{{clinic_name}} Neurology Team</p>
</div>`,
    sms: "{{clinic_name}}: Your neurologic care episode has been created with {{clinician_name}}. We'll track your progress using specialized outcome measures. Call {{clinic_phone}} with questions."
  },
  
  neuroExamScheduled: {
    subject: "Neurologic Examination Scheduled - {{patient_name}}",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Neurologic Examination Scheduled</h1>
  <p>Dear {{patient_name}},</p>
  <p>Your neurologic examination has been scheduled as part of your ongoing care with {{clinic_name}}.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Appointment Details</h2>
    <p><strong>Date:</strong> {{exam_date}}</p>
    <p><strong>Time:</strong> {{exam_time}}</p>
    <p><strong>Type:</strong> {{exam_type}} Neurologic Examination</p>
    <p><strong>Clinician:</strong> {{clinician_name}}</p>
  </div>
  <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #92400e; margin-top: 0;">Preparation for Your Exam</h3>
    <p style="color: #92400e;">Please:</p>
    <ul style="color: #92400e;">
      <li>Get adequate rest the night before</li>
      <li>Avoid strenuous activity on exam day</li>
      <li>Bring a list of current medications</li>
      <li>Note any recent changes in symptoms</li>
      <li>Wear comfortable clothing</li>
    </ul>
  </div>
  <p>This comprehensive examination will help us assess your neurologic function and track your progress.</p>
  <p>If you need to reschedule, please call us at {{clinic_phone}}.</p>
  <p style="margin-top: 30px;">See you soon!<br/>{{clinic_name}} Team</p>
</div>`,
    sms: "{{clinic_name}}: Neurologic exam scheduled for {{exam_date}} at {{exam_time}} with {{clinician_name}}. Please get adequate rest beforehand. Call {{clinic_phone}} to reschedule."
  },
  
  discharge: {
    subject: "Congratulations on Completing Your Neurologic Care!",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Congratulations on Completing Your Neurologic Care!</h1>
  <p>Dear {{patient_name}},</p>
  <p>Congratulations on completing your neurologic care treatment with {{clinic_name}}! We are proud of the progress you've made throughout your recovery journey.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Your Final Results</h2>
    <p><strong>Episode ID:</strong> {{episode_id}}</p>
    <p><strong>Clinician:</strong> {{clinician_name}}</p>
    <p><strong>Discharge Date:</strong> {{discharge_date}}</p>
    <p><strong>RPQ Improvement:</strong> {{improvement_score}} points</p>
  </div>
  <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #166534; margin-top: 0;">Next Steps & Recommendations</h3>
    <ul style="color: #166534;">
      <li>Continue with your home exercise program as discussed</li>
      <li>Gradually return to your normal activities, respecting symptom limits</li>
      <li>Practice pacing strategies to avoid symptom flare ups</li>
      <li>Monitor for any return or worsening of neurologic symptoms</li>
      <li>Maintain good sleep hygiene and stress management</li>
      <li>We will follow up with you in 90 days to ensure your progress is maintained</li>
    </ul>
  </div>
  <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="color: #92400e; margin: 0;"><strong>⚠️ When to Contact Us:</strong> If you experience any return of symptoms, new symptoms, or have concerns about your recovery, please reach out immediately at {{clinic_phone}}.</p>
  </div>
  <p>Thank you for trusting us with your neurologic care!</p>
  <p style="margin-top: 30px;">Best wishes for continued health,<br/>{{clinic_name}} Neurology Team</p>
</div>`,
    sms: "{{clinic_name}}: Congratulations {{patient_name}} on completing neurologic care! Continue your exercises, respect symptom limits, and practice pacing. Contact {{clinic_phone}} if symptoms return. We'll check in at 90 days."
  },
  
  outcomeReminder: {
    subject: "Time to Complete Your RPQ Assessment - {{patient_name}}",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Time for Your Progress Check-in</h1>
  <p>Dear {{patient_name}},</p>
  <p>As part of your ongoing neurologic care with {{clinic_name}}, it's time to complete your Rivermead Post-Concussion Symptoms Questionnaire (RPQ). This helps us track your symptom progression and ensure your treatment plan is working effectively.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #1f2937; margin-top: 0;">Your Care Details</h2>
    <p><strong>Episode ID:</strong> {{episode_id}}</p>
    <p><strong>Clinician:</strong> {{clinician_name}}</p>
    <p><strong>Assessment:</strong> RPQ (Rivermead Post-Concussion Symptoms Questionnaire)</p>
  </div>
  <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af; margin-top: 0;">Why This Assessment Matters</h3>
    <p style="color: #1e40af;">The RPQ helps us:</p>
    <ul style="color: #1e40af;">
      <li>Track changes in your post concussion symptoms</li>
      <li>Identify areas of improvement or concern</li>
      <li>Adjust your treatment plan based on your progress</li>
      <li>Document your recovery for clinical records</li>
    </ul>
  </div>
  <p>Please complete the assessment at your earliest convenience. This only takes a few minutes and provides valuable information about your neurologic recovery.</p>
  <p>If you have any questions about the assessment or your treatment, please call us at {{clinic_phone}}.</p>
  <p style="margin-top: 30px;">Thank you for your continued dedication to your recovery!<br/>{{clinic_name}} Team</p>
</div>`,
    sms: "{{clinic_name}}: Hi {{patient_name}}, time to complete your RPQ symptom assessment for neurologic care. This tracks your recovery progress. Call {{clinic_phone}} with questions."
  }
};

// Template variable replacement helper
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

// Get appropriate template based on episode type
export function getEmailTemplate(
  episodeType: string | null | undefined,
  templateType: 'episodeCreation' | 'discharge' | 'outcomeReminder',
  defaultTemplate: { subject: string; html: string; sms?: string }
): { subject: string; html: string; sms?: string } {
  if (episodeType === 'Neurology' && NEUROLOGY_EMAIL_TEMPLATES[templateType]) {
    return NEUROLOGY_EMAIL_TEMPLATES[templateType];
  }
  return defaultTemplate;
}
