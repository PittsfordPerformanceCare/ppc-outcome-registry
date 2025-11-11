import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RewardNotificationRequest {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  notificationType: 'points_earned' | 'achievement_unlocked';
  points?: number;
  pointsReason?: string;
  achievementName?: string;
  achievementDescription?: string;
  totalPoints?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      notificationType,
      points,
      pointsReason,
      achievementName,
      achievementDescription,
      totalPoints,
    }: RewardNotificationRequest = await req.json();

    console.log('Processing reward notification:', {
      patientId,
      notificationType,
      points,
      achievementName,
    });

    // Fetch clinic settings for templates
    const { data: clinicSettings } = await supabase
      .from('clinic_settings')
      .select('*')
      .limit(1)
      .single();

    let emailSent = false;
    let smsSent = false;

    // Send Email Notification
    if (patientEmail) {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      if (resendApiKey) {
        try {
          // Check rate limit
          const { data: rateLimitCheck } = await supabase.rpc('check_rate_limit', {
            p_service_type: 'email',
            p_clinic_id: clinicSettings?.clinic_id || null,
          });

          if (rateLimitCheck && rateLimitCheck[0]?.allowed) {
            const emailSubject = notificationType === 'points_earned'
              ? `🎉 You earned ${points} points!`
              : `🏆 Achievement Unlocked: ${achievementName}!`;

            const emailBody = notificationType === 'points_earned'
              ? `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #4F46E5;">Congratulations, ${patientName}! 🎉</h2>
                  <p style="font-size: 16px;">You've earned <strong>${points} points</strong>!</p>
                  <p style="color: #666;">${pointsReason}</p>
                  <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 18px;"><strong>Total Points: ${totalPoints || points}</strong></p>
                  </div>
                  <p>Keep up the great work with your recovery journey!</p>
                </div>
              `
              : `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #4F46E5;">Achievement Unlocked! 🏆</h2>
                  <h3>${achievementName}</h3>
                  <p style="font-size: 16px; color: #666;">${achievementDescription}</p>
                  <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 18px;"><strong>Total Points: ${totalPoints}</strong></p>
                  </div>
                  <p>Congratulations on this milestone in your recovery!</p>
                </div>
              `;

            // Insert pending notification
            const { data: notification } = await supabase
              .from('notifications_history')
              .insert({
                patient_name: patientName,
                patient_email: patientEmail,
                notification_type: 'reward',
                status: 'pending',
                delivery_method: 'email',
              })
              .select()
              .single();

            // Send email
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: clinicSettings?.email_from || 'notifications@yourdomain.com',
                to: patientEmail,
                subject: emailSubject,
                html: emailBody,
              }),
            });

            if (emailResponse.ok) {
              const emailData = await emailResponse.json();
              
              await supabase
                .from('notifications_history')
                .update({
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                  email_id: emailData.id,
                })
                .eq('id', notification.id);

              await supabase.rpc('record_rate_limit_usage', {
                p_service_type: 'email',
                p_success: true,
                p_clinic_id: clinicSettings?.clinic_id || null,
                p_user_id: patientId,
              });

              emailSent = true;
              console.log('Email sent successfully:', emailData.id);
            } else {
              const error = await emailResponse.text();
              console.error('Email send failed:', error);
              
              await supabase
                .from('notifications_history')
                .update({
                  status: 'failed',
                  error_message: error,
                })
                .eq('id', notification.id);
            }
          } else {
            console.log('Email rate limit exceeded');
          }
        } catch (emailError) {
          console.error('Email error:', emailError);
        }
      }
    }

    // Send SMS Notification
    if (patientPhone) {
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        try {
          const { data: rateLimitCheck } = await supabase.rpc('check_rate_limit', {
            p_service_type: 'sms',
            p_clinic_id: clinicSettings?.clinic_id || null,
          });

          if (rateLimitCheck && rateLimitCheck[0]?.allowed) {
            const smsMessage = notificationType === 'points_earned'
              ? `🎉 ${patientName}, you earned ${points} points! ${pointsReason} Total: ${totalPoints || points} points. Keep going!`
              : `🏆 Achievement Unlocked! ${achievementName}. ${achievementDescription} Total: ${totalPoints} points!`;

            const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
            const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

            const smsResponse = await fetch(twilioUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${twilioAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                To: patientPhone,
                From: twilioPhoneNumber,
                Body: smsMessage,
              }),
            });

            if (smsResponse.ok) {
              const smsData = await smsResponse.json();
              
              await supabase
                .from('notifications_history')
                .insert({
                  patient_name: patientName,
                  patient_phone: patientPhone,
                  notification_type: 'reward',
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                  delivery_method: 'sms',
                  sms_id: smsData.sid,
                });

              await supabase.rpc('record_rate_limit_usage', {
                p_service_type: 'sms',
                p_success: true,
                p_clinic_id: clinicSettings?.clinic_id || null,
                p_user_id: patientId,
              });

              smsSent = true;
              console.log('SMS sent successfully:', smsData.sid);
            }
          }
        } catch (smsError) {
          console.error('SMS error:', smsError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: emailSent || smsSent,
        emailSent,
        smsSent,
        message: 'Reward notification processed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-reward-notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
