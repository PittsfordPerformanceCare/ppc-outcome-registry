import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  episodeId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  clinicianName: string;
  appointmentDate?: string;
  appointmentTime?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      episodeId,
      patientName,
      patientEmail,
      patientPhone,
      clinicianName,
      appointmentDate,
      appointmentTime
    }: NotificationRequest = await req.json();

    console.log('Notification request received:', {
      episodeId,
      patientName,
      hasEmail: !!patientEmail,
      hasPhone: !!patientPhone
    });

    const results = {
      email: { sent: false, message: '' },
      sms: { sent: false, message: '' }
    };

    // Get clinic settings for branding
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: clinicSettings } = await supabase
      .from('clinic_settings')
      .select('*')
      .single();

    const clinicName = clinicSettings?.clinic_name || 'Our Clinic';
    const clinicPhone = clinicSettings?.phone || '';
    const clinicEmail = clinicSettings?.email || '';

    // Send Email Notification
    if (patientEmail) {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      if (resendApiKey) {
        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `${clinicName} <onboarding@resend.dev>`,
              to: [patientEmail],
              subject: 'Your Physical Therapy Episode Has Been Created',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #2563eb;">Welcome to ${clinicName}!</h1>
                  
                  <p>Dear ${patientName},</p>
                  
                  <p>Your intake form has been reviewed and your physical therapy episode has been successfully created.</p>
                  
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1f2937; margin-top: 0;">Episode Details</h2>
                    <p><strong>Clinician:</strong> ${clinicianName}</p>
                    ${appointmentDate ? `<p><strong>First Appointment:</strong> ${appointmentDate}${appointmentTime ? ` at ${appointmentTime}` : ''}</p>` : ''}
                    <p><strong>Episode ID:</strong> ${episodeId}</p>
                  </div>
                  
                  <p>Your clinician will be working with you to develop a personalized treatment plan to help you achieve your recovery goals.</p>
                  
                  ${clinicPhone ? `<p>If you have any questions, please call us at ${clinicPhone}.</p>` : ''}
                  
                  <p style="margin-top: 30px;">Best regards,<br/>
                  ${clinicName} Team</p>
                  
                  ${clinicEmail ? `<p style="color: #6b7280; font-size: 12px;">Contact: ${clinicEmail}</p>` : ''}
                </div>
              `,
            }),
          });

          if (emailResponse.ok) {
            results.email.sent = true;
            results.email.message = 'Email sent successfully';
            console.log('Email sent to:', patientEmail);
          } else {
            const errorData = await emailResponse.text();
            results.email.message = `Email failed: ${errorData}`;
            console.error('Email send failed:', errorData);
          }
        } catch (error: any) {
          results.email.message = `Email error: ${error.message}`;
          console.error('Email error:', error);
        }
      } else {
        results.email.message = 'Email API key not configured';
        console.log('RESEND_API_KEY not found, skipping email');
      }
    }

    // Send SMS Notification (Placeholder for future Twilio integration)
    if (patientPhone) {
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        try {
          const message = `${clinicName}: Your PT episode has been created with ${clinicianName}. ${appointmentDate ? `First appointment: ${appointmentDate}. ` : ''}${clinicPhone ? `Call ${clinicPhone} with questions.` : ''}`;

          const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
          const smsResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                To: patientPhone,
                From: twilioPhoneNumber,
                Body: message,
              }).toString(),
            }
          );

          if (smsResponse.ok) {
            results.sms.sent = true;
            results.sms.message = 'SMS sent successfully';
            console.log('SMS sent to:', patientPhone);
          } else {
            const errorData = await smsResponse.text();
            results.sms.message = `SMS failed: ${errorData}`;
            console.error('SMS send failed:', errorData);
          }
        } catch (error: any) {
          results.sms.message = `SMS error: ${error.message}`;
          console.error('SMS error:', error);
        }
      } else {
        results.sms.message = 'SMS API not configured';
        console.log('Twilio credentials not found, skipping SMS');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in send-intake-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
