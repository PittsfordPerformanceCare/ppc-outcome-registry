import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRecord {
  id: string;
  episode_id: string;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  clinician_name: string;
  notification_type: string;
  status: string;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  delivery_details: any;
  tracking_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body for manual retry
    const body = await req.json().catch(() => ({}));
    const manualRetryId = body.notificationId;

    let query = supabase
      .from('notifications_history')
      .select('*')
      .eq('status', 'failed');

    if (manualRetryId) {
      // Manual retry - retry specific notification
      query = query.eq('id', manualRetryId);
      console.log('Manual retry requested for notification:', manualRetryId);
    } else {
      // Automatic retry - retry notifications due for retry
      query = query
        .or('next_retry_at.is.null,next_retry_at.lte.now()')
        .limit(50); // Process up to 50 at a time
      console.log('Automatic retry check...');
    }

    const { data: failedNotifications, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching failed notifications:', fetchError);
      throw fetchError;
    }

    // Filter out notifications that have exceeded max retries
    const eligibleNotifications = (failedNotifications || []).filter(
      (n: any) => n.retry_count < n.max_retries
    );

    if (!eligibleNotifications || eligibleNotifications.length === 0) {
      console.log('No notifications to retry');
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0,
          message: 'No notifications need retry at this time'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${eligibleNotifications.length} eligible notifications to retry`);

    const results = {
      total: eligibleNotifications.length,
      succeeded: 0,
      failed: 0,
      skipped: 0
    };

    for (const notification of eligibleNotifications as NotificationRecord[]) {
      // Check if max retries reached
      if (notification.retry_count >= notification.max_retries) {
        console.log(`Notification ${notification.id} has reached max retries, skipping`);
        results.skipped++;
        continue;
      }

      try {
        console.log(`Retrying notification ${notification.id} (attempt ${notification.retry_count + 1}/${notification.max_retries})`);
        
        const retrySuccess = await retryNotification(supabase, notification);

        if (retrySuccess) {
          // Update to success
          await supabase
            .from('notifications_history')
            .update({
              status: 'sent',
              retry_count: notification.retry_count + 1,
              last_retry_at: new Date().toISOString(),
              error_message: null
            })
            .eq('id', notification.id);
          
          results.succeeded++;
          console.log(`Successfully retried notification ${notification.id}`);
        } else {
          // Update retry count and schedule next retry
          const newRetryCount = notification.retry_count + 1;
          const { data: nextRetry } = await supabase
            .rpc('calculate_next_retry', { 
              current_retry_count: newRetryCount 
            });

          await supabase
            .from('notifications_history')
            .update({
              retry_count: newRetryCount,
              last_retry_at: new Date().toISOString(),
              next_retry_at: nextRetry,
              error_message: 'Retry failed, will try again'
            })
            .eq('id', notification.id);
          
          results.failed++;
          console.log(`Retry failed for notification ${notification.id}, scheduled next retry`);
        }
      } catch (error: any) {
        console.error(`Error retrying notification ${notification.id}:`, error);
        results.failed++;
      }
    }

    console.log('Retry results:', results);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.total,
        succeeded: results.succeeded,
        failed: results.failed,
        skipped: results.skipped,
        message: `Processed ${results.total} notifications: ${results.succeeded} succeeded, ${results.failed} failed, ${results.skipped} skipped`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in retry-notifications function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

async function retryNotification(
  supabase: any,
  notification: NotificationRecord
): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
  const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

  let emailSuccess = false;
  let smsSuccess = false;

  // Retry email if applicable
  if (notification.patient_email && RESEND_API_KEY) {
    try {
      
      // Get clinic settings for templates
      const { data: settings } = await supabase
        .from('clinic_settings')
        .select('*')
        .single();

      const emailTemplate = notification.notification_type === 'appointment_reminder'
        ? settings?.reminder_email_template
        : settings?.email_template;

      const emailSubject = notification.notification_type === 'appointment_reminder'
        ? settings?.reminder_email_subject
        : settings?.email_subject;

      // Get original delivery details for placeholder values
      const deliveryDetails = notification.delivery_details || {};
      
      const emailBody = replacePlaceholders(emailTemplate || '', {
        patient_name: notification.patient_name,
        clinician_name: notification.clinician_name,
        episode_id: notification.episode_id,
        ...deliveryDetails
      });

      const subject = replacePlaceholders(emailSubject || 'Notification', {
        patient_name: notification.patient_name,
        ...deliveryDetails
      });

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Pittsford Performance Care <onboarding@resend.dev>',
          to: [notification.patient_email],
          subject: subject,
          html: emailBody,
        }),
      });

      if (response.ok) {
        console.log(`Email retry sent for notification ${notification.id}`);
        emailSuccess = true;
      }
    } catch (error: any) {
      console.error(`Email retry failed for notification ${notification.id}:`, error);
    }
  }

  // Retry SMS if applicable
  if (notification.patient_phone && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    try {
      const { data: settings } = await supabase
        .from('clinic_settings')
        .select('*')
        .single();

      const smsTemplate = notification.notification_type === 'appointment_reminder'
        ? settings?.reminder_sms_template
        : settings?.sms_template;

      const deliveryDetails = notification.delivery_details || {};
      
      const smsBody = replacePlaceholders(smsTemplate || '', {
        patient_name: notification.patient_name,
        clinician_name: notification.clinician_name,
        episode_id: notification.episode_id,
        ...deliveryDetails
      });

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: notification.patient_phone,
          From: TWILIO_PHONE_NUMBER,
          Body: smsBody,
        }),
      });

      if (response.ok) {
        console.log(`SMS retry sent for notification ${notification.id}`);
        smsSuccess = true;
      }
    } catch (error: any) {
      console.error(`SMS retry failed for notification ${notification.id}:`, error);
    }
  }

  // Consider success if at least one method succeeded
  return emailSuccess || smsSuccess;
}

function replacePlaceholders(template: string, values: Record<string, any>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, String(value || ''));
  }
  return result;
}

serve(handler);
