import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DischargeNotificationRequest {
  episodeId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  clinicianName: string;
  dischargeDate: string;
  improvementSummary?: string;
  userId: string;
  clinicId?: string;
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
      dischargeDate,
      improvementSummary,
      userId,
      clinicId
    }: DischargeNotificationRequest = await req.json();

    console.log('Discharge notification request received:', {
      episodeId,
      patientName,
      hasEmail: !!patientEmail,
      hasPhone: !!patientPhone
    });

    const results = {
      email: { sent: false, message: '' },
      sms: { sent: false, message: '' }
    };

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get clinic settings for branding and templates
    const { data: clinicSettings } = await supabase
      .from('clinic_settings')
      .select('*')
      .single();

    const clinicName = clinicSettings?.clinic_name || 'Our Clinic';
    const clinicPhone = clinicSettings?.phone || '';
    const clinicEmail = clinicSettings?.email || '';
    
    // Format discharge date nicely
    const formattedDate = new Date(dischargeDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Template replacement helper
    const replacePlaceholders = (template: string) => {
      return template
        .replace(/\{\{patient_name\}\}/g, patientName)
        .replace(/\{\{clinician_name\}\}/g, clinicianName)
        .replace(/\{\{episode_id\}\}/g, episodeId)
        .replace(/\{\{clinic_name\}\}/g, clinicName)
        .replace(/\{\{clinic_phone\}\}/g, clinicPhone)
        .replace(/\{\{clinic_email\}\}/g, clinicEmail)
        .replace(/\{\{discharge_date\}\}/g, formattedDate)
        .replace(/\{\{improvement_summary\}\}/g, improvementSummary || 'Great progress throughout treatment');
    };

    // Helper function to wrap links with tracking
    const wrapLinksWithTracking = (html: string, notificationId: string) => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      return html.replace(
        /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>(.*?)<\/a>/gi,
        (match, before, url, after, text) => {
          if (url.includes('track-email-open') || url.startsWith('mailto:') || url.startsWith('tel:')) {
            return match;
          }
          const encodedUrl = encodeURIComponent(url);
          const encodedLabel = encodeURIComponent(text.replace(/<[^>]*>/g, '').trim());
          const trackingUrl = `${supabaseUrl}/functions/v1/track-link-click?nid=${notificationId}&url=${encodedUrl}&label=${encodedLabel}`;
          return `<a ${before}href="${trackingUrl}"${after}>${text}</a>`;
        }
      );
    };

    // Send Email Notification
    if (patientEmail) {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      if (resendApiKey) {
        let notificationId: string | null = null;
        
        try {
          // Check rate limit for email
          const { data: rateLimitCheck, error: rateLimitError } = await supabase
            .rpc('check_rate_limit', {
              p_service_type: 'email',
              p_clinic_id: clinicId || null
            });

          if (rateLimitError) {
            console.error('Rate limit check error:', rateLimitError);
          } else if (rateLimitCheck && rateLimitCheck.length > 0) {
            const result = rateLimitCheck[0];
            if (!result.allowed) {
              const resetTime = new Date(result.reset_at).toLocaleString();
              results.email.message = `Rate limit exceeded: ${result.current_count}/${result.max_allowed} ${result.limit_type}. Resets at ${resetTime}`;
              console.log('Email rate limit exceeded:', results.email.message);
              
              await supabase.from('notifications_history').insert({
                episode_id: episodeId,
                patient_name: patientName,
                patient_email: patientEmail,
                clinician_name: clinicianName,
                notification_type: 'email',
                status: 'failed',
                error_message: results.email.message,
                user_id: userId,
                clinic_id: clinicId
              });
              
              if (!patientPhone) {
                return new Response(
                  JSON.stringify({
                    success: false,
                    results,
                    error: 'Rate limit exceeded'
                  }),
                  {
                    status: 429,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                  }
                );
              }
            }
          }
          
          // Generate tracking ID for email open tracking
          const trackingId = crypto.randomUUID();
          
          // Get custom templates or use defaults
          let emailSubject = clinicSettings?.discharge_email_subject 
            ? replacePlaceholders(clinicSettings.discharge_email_subject)
            : 'Congratulations on Completing Your Physical Therapy!';
          
          let emailHtml = clinicSettings?.discharge_email_template
            ? replacePlaceholders(clinicSettings.discharge_email_template)
            : replacePlaceholders(`
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
                  <div style="background-color: #16a34a; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
                  </div>
                  
                  <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">Dear <strong>{{patient_name}}</strong>,</p>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                      Congratulations on completing your physical therapy treatment with {{clinic_name}}! We are incredibly proud of your dedication and the progress you've made throughout your recovery journey.
                    </p>
                    
                    <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #16a34a;">
                      <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">✅ Your Final Results</h2>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Episode ID:</td>
                          <td style="padding: 8px 0; color: #111827;">{{episode_id}}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Discharge Date:</td>
                          <td style="padding: 8px 0; color: #111827;">{{discharge_date}}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Clinician:</td>
                          <td style="padding: 8px 0; color: #111827;">{{clinician_name}}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #86efac;">
                      <h3 style="color: #166534; margin-top: 0; font-size: 18px;">📋 Next Steps & Recommendations</h3>
                      <ul style="color: #166534; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                        <li>Continue with your home exercise program as discussed</li>
                        <li>Gradually return to your normal activities</li>
                        <li>Monitor your symptoms and contact us if they return</li>
                        <li>We will follow up with you in 90 days to ensure your progress is maintained</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                      <p style="margin: 0; color: #92400e; font-size: 15px;">
                        <strong>📞 Questions or Concerns?</strong><br/>
                        If you experience any concerns or have questions about your recovery, please do not hesitate to reach out to us at <a href="tel:{{clinic_phone}}" style="color: #16a34a; text-decoration: none; font-weight: 600;">{{clinic_phone}}</a>
                      </p>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-top: 30px;">
                      Thank you for trusting us with your care. We wish you continued health and wellness!
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                      Best wishes,<br/>
                      <strong>The {{clinic_name}} Team</strong>
                    </p>
                  </div>
                  
                  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                    <p style="margin: 5px 0;">This email was sent because you completed your treatment episode.</p>
                    <p style="margin: 5px 0;">© 2025 {{clinic_name}}. All rights reserved.</p>
                  </div>
                </div>
              `);
          
          // Pre-insert notification record to get ID for link tracking
          const { data: insertedNotification } = await supabase.from('notifications_history').insert({
            episode_id: episodeId,
            patient_name: patientName,
            patient_email: patientEmail,
            clinician_name: clinicianName,
            notification_type: 'email',
            status: 'pending',
            tracking_id: trackingId,
            user_id: userId,
            clinic_id: clinicId
          }).select().single();
          
          if (insertedNotification) {
            notificationId = insertedNotification.id;
            if (notificationId) {
              emailHtml = wrapLinksWithTracking(emailHtml, notificationId);
            }
          }
          
          // Add tracking pixel to email HTML
          const supabaseUrl = Deno.env.get('SUPABASE_URL');
          emailHtml += `<img src="${supabaseUrl}/functions/v1/track-email-open?id=${trackingId}" width="1" height="1" alt="" style="display:block;border:0;" />`;
          
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `${clinicName} <onboarding@resend.dev>`,
              to: [patientEmail],
              subject: emailSubject,
              html: emailHtml,
            }),
          });

          if (emailResponse.ok) {
            const responseData = await emailResponse.json();
            results.email.sent = true;
            results.email.message = 'Email sent successfully';
            console.log('Discharge email sent to:', patientEmail);
            
            await supabase.rpc('record_rate_limit_usage', {
              p_service_type: 'email',
              p_success: true,
              p_clinic_id: clinicId || null,
              p_user_id: userId,
              p_episode_id: episodeId
            });
            
            if (notificationId) {
              await supabase.from('notifications_history')
                .update({
                  status: 'sent',
                  delivery_details: { message_id: responseData.id, type: 'discharge' }
                })
                .eq('id', notificationId);
            }
          } else {
            const errorData = await emailResponse.text();
            results.email.message = `Email failed: ${errorData}`;
            console.error('Email send failed:', errorData);
            
            await supabase.rpc('record_rate_limit_usage', {
              p_service_type: 'email',
              p_success: false,
              p_clinic_id: clinicId || null,
              p_user_id: userId,
              p_episode_id: episodeId
            });
            
            if (notificationId) {
              await supabase.from('notifications_history')
                .update({
                  status: 'failed',
                  error_message: errorData
                })
                .eq('id', notificationId);
            }
          }
        } catch (error: any) {
          results.email.message = `Email error: ${error.message}`;
          console.error('Email error:', error);
          
          if (notificationId) {
            await supabase.from('notifications_history')
              .update({
                status: 'failed',
                error_message: error.message
              })
              .eq('id', notificationId);
          }
        }
      } else {
        results.email.message = 'Email API key not configured';
        console.log('RESEND_API_KEY not found, skipping email');
      }
    }

    // Send SMS Notification
    if (patientPhone) {
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        try {
          // Check rate limit for SMS
          const { data: rateLimitCheck, error: rateLimitError } = await supabase
            .rpc('check_rate_limit', {
              p_service_type: 'sms',
              p_clinic_id: clinicId || null
            });

          if (rateLimitError) {
            console.error('SMS rate limit check error:', rateLimitError);
          } else if (rateLimitCheck && rateLimitCheck.length > 0) {
            const result = rateLimitCheck[0];
            if (!result.allowed) {
              const resetTime = new Date(result.reset_at).toLocaleString();
              results.sms.message = `Rate limit exceeded: ${result.current_count}/${result.max_allowed} ${result.limit_type}. Resets at ${resetTime}`;
              console.log('SMS rate limit exceeded:', results.sms.message);
              
              await supabase.from('notifications_history').insert({
                episode_id: episodeId,
                patient_name: patientName,
                patient_phone: patientPhone,
                clinician_name: clinicianName,
                notification_type: 'sms',
                status: 'failed',
                error_message: results.sms.message,
                user_id: userId,
                clinic_id: clinicId
              });
              
              return new Response(
                JSON.stringify({
                  success: !results.email.sent ? false : true,
                  results,
                  error: 'SMS rate limit exceeded'
                }),
                {
                  status: results.email.sent ? 200 : 429,
                  headers: { 'Content-Type': 'application/json', ...corsHeaders },
                }
              );
            }
          }
          
          const smsMessage = clinicSettings?.discharge_sms_template
            ? replacePlaceholders(clinicSettings.discharge_sms_template)
            : replacePlaceholders(`{{clinic_name}}: Congratulations {{patient_name}} on completing your PT treatment! Continue your home exercises and contact us at {{clinic_phone}} if you have any questions. We will check in with you in 90 days.`);

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
                Body: smsMessage,
              }).toString(),
            }
          );

          if (smsResponse.ok) {
            const responseData = await smsResponse.json();
            results.sms.sent = true;
            results.sms.message = 'SMS sent successfully';
            console.log('Discharge SMS sent to:', patientPhone);
            
            await supabase.rpc('record_rate_limit_usage', {
              p_service_type: 'sms',
              p_success: true,
              p_clinic_id: clinicId || null,
              p_user_id: userId,
              p_episode_id: episodeId
            });
            
            await supabase.from('notifications_history').insert({
              episode_id: episodeId,
              patient_name: patientName,
              patient_phone: patientPhone,
              clinician_name: clinicianName,
              notification_type: 'sms',
              status: 'sent',
              delivery_details: { sid: responseData.sid, type: 'discharge' },
              user_id: userId,
              clinic_id: clinicId
            });
          } else {
            const errorData = await smsResponse.text();
            results.sms.message = `SMS failed: ${errorData}`;
            console.error('SMS send failed:', errorData);
            
            await supabase.rpc('record_rate_limit_usage', {
              p_service_type: 'sms',
              p_success: false,
              p_clinic_id: clinicId || null,
              p_user_id: userId,
              p_episode_id: episodeId
            });
            
            await supabase.from('notifications_history').insert({
              episode_id: episodeId,
              patient_name: patientName,
              patient_phone: patientPhone,
              clinician_name: clinicianName,
              notification_type: 'sms',
              status: 'failed',
              error_message: errorData,
              user_id: userId,
              clinic_id: clinicId
            });
          }
        } catch (error: any) {
          results.sms.message = `SMS error: ${error.message}`;
          console.error('SMS error:', error);
          
          await supabase.from('notifications_history').insert({
            episode_id: episodeId,
            patient_name: patientName,
            patient_phone: patientPhone,
            clinician_name: clinicianName,
            notification_type: 'sms',
            status: 'failed',
            error_message: error.message,
            user_id: userId,
            clinic_id: clinicId
          });
        }
      } else {
        results.sms.message = 'SMS credentials not configured';
        console.log('Twilio credentials not found, skipping SMS');
      }
    }

    // Return results
    const success = results.email.sent || results.sms.sent;
    return new Response(
      JSON.stringify({
        success,
        results,
        message: success ? 'Discharge notification sent successfully' : 'Failed to send discharge notification'
      }),
      {
        status: success ? 200 : 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in send-discharge-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
