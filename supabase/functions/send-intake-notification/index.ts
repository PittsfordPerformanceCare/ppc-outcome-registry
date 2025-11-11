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
  userId: string;
  clinicId?: string;
  isTest?: boolean;
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
      appointmentTime,
      userId,
      clinicId,
      isTest = false
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
    
    // Template replacement helper
    const replacePlaceholders = (template: string) => {
      return template
        .replace(/\{\{patient_name\}\}/g, patientName)
        .replace(/\{\{clinician_name\}\}/g, clinicianName)
        .replace(/\{\{episode_id\}\}/g, episodeId)
        .replace(/\{\{clinic_name\}\}/g, clinicName)
        .replace(/\{\{clinic_phone\}\}/g, clinicPhone)
        .replace(/\{\{clinic_email\}\}/g, clinicEmail)
        .replace(/\{\{appointment_date\}\}/g, appointmentDate || '')
        .replace(/\{\{appointment_time\}\}/g, appointmentTime || '');
    };

    // Helper function to wrap links with tracking
    const wrapLinksWithTracking = (html: string, notificationId: string) => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      // Match all anchor tags with href attributes
      return html.replace(
        /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>(.*?)<\/a>/gi,
        (match, before, url, after, text) => {
          // Skip tracking pixel and mailto links
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
          // Check rate limit for email (skip for test notifications)
          if (!isTest) {
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
                
                // Log rate limit exceeded in notifications history
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
                
                // Continue to SMS check if available
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
                // Skip email and continue to SMS
                if (patientPhone) {
                  // Jump to SMS section below
                } else {
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
          }
          // Generate tracking ID for email open tracking
          const trackingId = crypto.randomUUID();
          
          // Get custom templates or use defaults
          let emailSubject = clinicSettings?.email_subject 
            ? replacePlaceholders(clinicSettings.email_subject)
            : 'Your Rehabilitative Care Episode Has Been Created';
          
          // Add TEST prefix for test emails
          if (isTest) {
            emailSubject = `[TEST] ${emailSubject}`;
          }
          
          let emailHtml = clinicSettings?.email_template
            ? replacePlaceholders(clinicSettings.email_template)
            : replacePlaceholders(`
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
                  <div style="background-color: #a51c30; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Welcome to {{clinic_name}}!</h1>
                  </div>
                  
                  <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">Dear <strong>{{patient_name}}</strong>,</p>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                      Great news! Your intake form has been reviewed and approved. Your rehabilitative care episode has been successfully created, and we're excited to begin your journey to recovery.
                    </p>
                    
                    <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #a51c30;">
                      <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">📋 Your Episode Details</h2>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Assigned Clinician:</td>
                          <td style="padding: 8px 0; color: #111827;">{{clinician_name}}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Episode ID:</td>
                          <td style="padding: 8px 0; color: #111827;">{{episode_id}}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #86efac;">
                      <h3 style="color: #166534; margin-top: 0; font-size: 18px;">✅ Next Steps</h3>
                      <ol style="color: #166534; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                        <li>Our team will contact you within 1-2 business days to schedule your first appointment</li>
                        <li>Please have your insurance information ready</li>
                        <li>Bring any previous medical records or imaging results to your first visit</li>
                      </ol>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                      Your clinician, <strong>{{clinician_name}}</strong>, will be working closely with you to develop a personalized treatment plan designed to help you achieve your recovery goals.
                    </p>
                    
                    <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                      <p style="margin: 0; color: #92400e; font-size: 15px;">
                        <strong>📞 Questions or Need to Reschedule?</strong><br/>
                        Call us at <a href="tel:{{clinic_phone}}" style="color: #a51c30; text-decoration: none; font-weight: 600;">{{clinic_phone}}</a>
                      </p>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-top: 30px;">
                      We're honored to be part of your healthcare journey and look forward to helping you feel your best!
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                      Best regards,<br/>
                      <strong>The {{clinic_name}} Team</strong>
                    </p>
                  </div>
                  
                  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                    <p style="margin: 5px 0;">This email was sent because your intake form was converted to an active treatment episode.</p>
                    <p style="margin: 5px 0;">© 2025 {{clinic_name}}. All rights reserved.</p>
                  </div>
                </div>
              `);
          
          // Pre-insert notification record to get ID for link tracking (skip for test notifications)
          let notificationId = null;
          if (!isTest) {
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
            }
          }
          
          // Wrap links with tracking if we have a notification ID
          if (notificationId) {
            emailHtml = wrapLinksWithTracking(emailHtml, notificationId);
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
            console.log('Email sent to:', patientEmail);
            
            // Record rate limit usage for successful email (skip for test notifications)
            if (!isTest) {
              await supabase.rpc('record_rate_limit_usage', {
                p_service_type: 'email',
                p_success: true,
                p_clinic_id: clinicId || null,
                p_user_id: userId,
                p_episode_id: episodeId
              });
            }
            
            // Update notification status to sent
            if (notificationId) {
              await supabase.from('notifications_history')
                .update({
                  status: 'sent',
                  delivery_details: { message_id: responseData.id }
                })
                .eq('id', notificationId);
            }
          } else {
            const errorData = await emailResponse.text();
            results.email.message = `Email failed: ${errorData}`;
            console.error('Email send failed:', errorData);
            
            // Record rate limit usage for failed email (skip for test notifications)
            if (!isTest) {
              await supabase.rpc('record_rate_limit_usage', {
                p_service_type: 'email',
                p_success: false,
                p_clinic_id: clinicId || null,
                p_user_id: userId,
                p_episode_id: episodeId
              });
            }
            
            // Update notification status to failed
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
          
          // Update notification status to failed
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

    // Send SMS Notification (Placeholder for future Twilio integration)
    if (patientPhone) {
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        try {
          // Check rate limit for SMS (skip for test notifications)
          if (!isTest) {
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
                
                // Log rate limit exceeded in notifications history
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
          }
          // Get custom SMS template or use default
          let smsMessage = clinicSettings?.sms_template
            ? replacePlaceholders(clinicSettings.sms_template)
            : replacePlaceholders(`🎉 {{clinic_name}}: Great news! Your PT episode with {{clinician_name}} is confirmed (ID: {{episode_id}}). We'll call you within 1-2 days to schedule your first appointment. Questions? Call {{clinic_phone}}`);
          
          // Add TEST prefix for test SMS
          if (isTest) {
            smsMessage = `[TEST] ${smsMessage}`;
          }

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
            console.log('SMS sent to:', patientPhone);
            
            // Record rate limit usage for successful SMS (skip for test notifications)
            if (!isTest) {
              await supabase.rpc('record_rate_limit_usage', {
                p_service_type: 'sms',
                p_success: true,
                p_clinic_id: clinicId || null,
                p_user_id: userId,
                p_episode_id: episodeId
              });
              
              // Log to history
              await supabase.from('notifications_history').insert({
                episode_id: episodeId,
                patient_name: patientName,
                patient_phone: patientPhone,
                clinician_name: clinicianName,
                notification_type: 'sms',
                status: 'sent',
                delivery_details: { sid: responseData.sid },
                user_id: userId,
                clinic_id: clinicId
              });
            }
          } else {
            const errorData = await smsResponse.text();
            results.sms.message = `SMS failed: ${errorData}`;
            console.error('SMS send failed:', errorData);
            
            // Record rate limit usage for failed SMS (skip for test notifications)
            if (!isTest) {
              await supabase.rpc('record_rate_limit_usage', {
                p_service_type: 'sms',
                p_success: false,
                p_clinic_id: clinicId || null,
                p_user_id: userId,
                p_episode_id: episodeId
              });
              
              // Log failure to history
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
          }
        } catch (error: any) {
          results.sms.message = `SMS error: ${error.message}`;
          console.error('SMS error:', error);
          
          // Log error to history (skip for test notifications)
          if (!isTest) {
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
