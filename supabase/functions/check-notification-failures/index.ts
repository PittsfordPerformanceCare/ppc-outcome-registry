import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking notification failure rates...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all enabled alert configurations
    const { data: configs, error: configError } = await supabase
      .from('notification_alert_config')
      .select('*')
      .eq('enabled', true);

    if (configError) {
      console.error('Error fetching alert configs:', configError);
      throw configError;
    }

    if (!configs || configs.length === 0) {
      console.log('No active alert configurations found');
      return new Response(
        JSON.stringify({ message: 'No active alerts', checked: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    let alertsTriggered = 0;

    for (const config of configs) {
      console.log(`Checking config ${config.id}`);

      // Check if we're in cooldown period
      const { data: recentAlerts } = await supabase
        .from('notification_alert_history')
        .select('triggered_at')
        .eq('config_id', config.id)
        .order('triggered_at', { ascending: false })
        .limit(1)
        .single();

      if (recentAlerts) {
        const cooldownEnd = new Date(recentAlerts.triggered_at);
        cooldownEnd.setHours(cooldownEnd.getHours() + config.cooldown_hours);
        
        if (new Date() < cooldownEnd) {
          console.log(`Config ${config.id} is in cooldown period`);
          continue;
        }
      }

      // Calculate the time window
      const windowStart = new Date();
      windowStart.setHours(windowStart.getHours() - config.check_window_hours);

      // Get notifications in the time window
      const { data: notifications, error: notifError } = await supabase
        .from('notifications_history')
        .select('status, notification_type')
        .gte('sent_at', windowStart.toISOString());

      if (notifError) {
        console.error('Error fetching notifications:', notifError);
        continue;
      }

      const totalNotifications = notifications?.length || 0;

      // Skip if below minimum threshold
      if (totalNotifications < config.min_notifications_required) {
        console.log(`Config ${config.id}: Only ${totalNotifications} notifications, minimum ${config.min_notifications_required} required`);
        continue;
      }

      const failedNotifications = notifications?.filter(n => n.status === 'failed').length || 0;
      const failureRate = (failedNotifications / totalNotifications) * 100;

      console.log(`Config ${config.id}: Failure rate ${failureRate.toFixed(2)}% (${failedNotifications}/${totalNotifications})`);

      // Check if failure rate exceeds threshold
      if (failureRate >= config.failure_rate_threshold) {
        console.log(`ALERT: Failure rate ${failureRate.toFixed(2)}% exceeds threshold ${config.failure_rate_threshold}%`);

        // Get detailed breakdown
        const emailFailed = notifications?.filter(n => n.notification_type === 'email' && n.status === 'failed').length || 0;
        const smsFailed = notifications?.filter(n => n.notification_type === 'sms' && n.status === 'failed').length || 0;
        const emailTotal = notifications?.filter(n => n.notification_type === 'email').length || 0;
        const smsTotal = notifications?.filter(n => n.notification_type === 'sms').length || 0;

        const alertDetails = {
          window_hours: config.check_window_hours,
          email_failures: emailFailed,
          email_total: emailTotal,
          sms_failures: smsFailed,
          sms_total: smsTotal,
          email_failure_rate: emailTotal > 0 ? ((emailFailed / emailTotal) * 100).toFixed(2) : '0',
          sms_failure_rate: smsTotal > 0 ? ((smsFailed / smsTotal) * 100).toFixed(2) : '0',
        };

        // Send alert email if recipients configured
        if (config.alert_recipients && config.alert_recipients.length > 0) {
          await sendAlertEmail(
            config.alert_recipients,
            failureRate,
            totalNotifications,
            failedNotifications,
            config.check_window_hours,
            alertDetails
          );
        }

        // Log alert to history
        await supabase.from('notification_alert_history').insert({
          config_id: config.id,
          failure_rate: failureRate,
          total_notifications: totalNotifications,
          failed_notifications: failedNotifications,
          alert_sent_to: config.alert_recipients,
          alert_details: alertDetails,
        });

        alertsTriggered++;
      }
    }

    console.log(`Completed check: ${alertsTriggered} alerts triggered`);

    return new Response(
      JSON.stringify({ 
        success: true,
        checked: configs.length,
        alerts_triggered: alertsTriggered,
        message: `Checked ${configs.length} configurations, triggered ${alertsTriggered} alerts`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Error in check-notification-failures function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

async function sendAlertEmail(
  recipients: string[],
  failureRate: number,
  totalNotifications: number,
  failedNotifications: number,
  windowHours: number,
  details: any
) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured, cannot send alert email');
    return;
  }

  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">⚠️ Notification Delivery Alert</h1>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #1f2937; margin-top: 0;">
            <strong>Alert:</strong> Notification failure rate has exceeded the configured threshold.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h2 style="color: #ef4444; margin-top: 0; font-size: 20px;">Failure Rate: ${failureRate.toFixed(2)}%</h2>
            <p style="font-size: 14px; color: #6b7280; margin: 10px 0;">
              ${failedNotifications} of ${totalNotifications} notifications failed
            </p>
            <p style="font-size: 12px; color: #9ca3af;">
              In the last ${windowHours} hours
            </p>
          </div>
          
          <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 10px;">Breakdown by Channel</h3>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 600; color: #3b82f6;">📧 Email</span>
              <span style="font-weight: 600; color: ${parseFloat(details.email_failure_rate) > 20 ? '#ef4444' : '#10b981'};">
                ${details.email_failure_rate}%
              </span>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              ${details.email_failures} failed out of ${details.email_total} sent
            </p>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 600; color: #8b5cf6;">💬 SMS</span>
              <span style="font-weight: 600; color: ${parseFloat(details.sms_failure_rate) > 20 ? '#ef4444' : '#10b981'};">
                ${details.sms_failure_rate}%
              </span>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              ${details.sms_failures} failed out of ${details.sms_total} sent
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 10px;">Recommended Actions</h3>
            <ul style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              <li>Check the notification history for error details</li>
              <li>Verify API credentials (Resend, Twilio) are valid</li>
              <li>Review recent notification templates for issues</li>
              <li>Check for service outages with email/SMS providers</li>
              <li>Examine network logs for connectivity problems</li>
            </ul>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">
              <strong>Note:</strong> This alert will not trigger again for ${windowHours} hours to avoid alert fatigue.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>This is an automated alert from your notification monitoring system.</p>
        </div>
      </div>
    `;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Notification Alerts <onboarding@resend.dev>',
        to: recipients,
        subject: `🚨 ALERT: Notification Failure Rate at ${failureRate.toFixed(1)}%`,
        html: emailHtml,
      }),
    });

    if (emailResponse.ok) {
      console.log(`Alert email sent to ${recipients.join(', ')}`);
    } else {
      const error = await emailResponse.text();
      console.error('Failed to send alert email:', error);
    }
  } catch (error) {
    console.error('Error sending alert email:', error);
  }
}

serve(handler);
