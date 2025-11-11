import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting webhook health check...");

    // Get all enabled alert configurations
    const { data: alertConfigs, error: configError } = await supabase
      .from("webhook_alert_config")
      .select("*")
      .eq("enabled", true);

    if (configError) {
      console.error("Error fetching alert configs:", configError);
      throw configError;
    }

    if (!alertConfigs || alertConfigs.length === 0) {
      console.log("No alert configurations found");
      return new Response(
        JSON.stringify({ message: "No alert configurations", alerts_sent: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${alertConfigs.length} alert configuration(s)`);

    let totalAlertsSent = 0;

    for (const config of alertConfigs) {
      console.log(`Checking alerts for user: ${config.user_id}`);

      // Check if in cooldown period
      if (config.last_alert_sent_at) {
        const cooldownEnd = new Date(config.last_alert_sent_at);
        cooldownEnd.setHours(cooldownEnd.getHours() + config.cooldown_hours);
        
        if (new Date() < cooldownEnd) {
          console.log(`Config ${config.id} is in cooldown period, skipping`);
          continue;
        }
      }

      const windowStart = new Date();
      windowStart.setHours(windowStart.getHours() - config.check_window_hours);

      // Get webhook activity in the time window
      const { data: activityLogs, error: logsError } = await supabase
        .from("webhook_activity_log")
        .select("*")
        .eq("user_id", config.user_id)
        .gte("triggered_at", windowStart.toISOString())
        .order("triggered_at", { ascending: false });

      if (logsError) {
        console.error("Error fetching activity logs:", logsError);
        continue;
      }

      if (!activityLogs || activityLogs.length < config.min_calls_required) {
        console.log(`Not enough calls (${activityLogs?.length || 0} < ${config.min_calls_required}), skipping checks`);
        continue;
      }

      const alerts: Array<{ type: string; webhook_name?: string; details: any }> = [];

      // Check for abandoned webhooks
      const { data: abandonedWebhooks, error: abandonedError } = await supabase
        .from("webhook_retry_queue")
        .select("*")
        .eq("user_id", config.user_id)
        .eq("status", "abandoned")
        .gte("updated_at", windowStart.toISOString());

      if (!abandonedError && abandonedWebhooks && abandonedWebhooks.length > 0) {
        for (const webhook of abandonedWebhooks) {
          alerts.push({
            type: "abandoned_webhook",
            webhook_name: webhook.webhook_name,
            details: {
              webhook_url: webhook.webhook_url,
              retry_count: webhook.retry_count,
              last_error: webhook.last_error,
              abandoned_at: webhook.updated_at,
            },
          });
        }
      }

      // Check failure rates by webhook
      const webhookMap = new Map<string, { total: number; failed: number; timeout: number; durations: number[] }>();
      
      activityLogs.forEach((log: any) => {
        const existing = webhookMap.get(log.webhook_name) || { 
          total: 0, 
          failed: 0, 
          timeout: 0,
          durations: []
        };
        
        existing.total++;
        if (log.status === "failed") existing.failed++;
        if (log.status === "timeout") existing.timeout++;
        if (log.duration_ms) existing.durations.push(log.duration_ms);
        
        webhookMap.set(log.webhook_name, existing);
      });

      // Check each webhook's metrics
      for (const [webhookName, stats] of webhookMap.entries()) {
        const failureCount = stats.failed + stats.timeout;
        const failureRate = (failureCount / stats.total) * 100;

        // Check failure rate threshold
        if (failureRate >= config.failure_rate_threshold && stats.total >= config.min_calls_required) {
          alerts.push({
            type: "high_failure_rate",
            webhook_name: webhookName,
            details: {
              failure_rate: Math.round(failureRate * 10) / 10,
              total_calls: stats.total,
              failed_calls: failureCount,
              threshold: config.failure_rate_threshold,
              window_hours: config.check_window_hours,
            },
          });
        }

        // Check response time threshold
        if (stats.durations.length > 0) {
          const avgResponseTime = stats.durations.reduce((sum, d) => sum + d, 0) / stats.durations.length;
          
          if (avgResponseTime >= config.response_time_threshold) {
            alerts.push({
              type: "slow_response_time",
              webhook_name: webhookName,
              details: {
                avg_response_time: Math.round(avgResponseTime),
                threshold: config.response_time_threshold,
                calls_analyzed: stats.durations.length,
                window_hours: config.check_window_hours,
              },
            });
          }
        }
      }

      // Send alerts if any were triggered
      if (alerts.length > 0) {
        console.log(`Sending ${alerts.length} alert(s) for config ${config.id}`);
        
        const emailHTML = generateAlertEmail(alerts, config);
        
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "PPC Outcome Registry Alerts <onboarding@resend.dev>",
            to: config.alert_recipients,
            subject: `⚠️ Webhook Alert: ${alerts.length} issue${alerts.length > 1 ? 's' : ''} detected`,
            html: emailHTML,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error(`Failed to send alert email: ${emailResponse.status} - ${errorText}`);
          continue;
        }

        console.log("Alert email sent successfully");
        totalAlertsSent += alerts.length;

        // Record alerts in history
        for (const alert of alerts) {
          await supabase
            .from("webhook_alert_history")
            .insert({
              config_id: config.id,
              alert_type: alert.type,
              webhook_name: alert.webhook_name,
              alert_sent_to: config.alert_recipients,
              alert_details: alert.details,
            });
        }

        // Update last alert sent timestamp
        await supabase
          .from("webhook_alert_config")
          .update({ last_alert_sent_at: new Date().toISOString() })
          .eq("id", config.id);
      } else {
        console.log(`No alerts triggered for config ${config.id}`);
      }
    }

    console.log(`Health check complete. Total alerts sent: ${totalAlertsSent}`);

    return new Response(
      JSON.stringify({
        success: true,
        configs_checked: alertConfigs.length,
        alerts_sent: totalAlertsSent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-webhook-health:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateAlertEmail(alerts: Array<{ type: string; webhook_name?: string; details: any }>, config: any): string {
  const alertsByType = {
    abandoned_webhook: alerts.filter(a => a.type === "abandoned_webhook"),
    high_failure_rate: alerts.filter(a => a.type === "high_failure_rate"),
    slow_response_time: alerts.filter(a => a.type === "slow_response_time"),
  };

  let alertSections = "";

  if (alertsByType.abandoned_webhook.length > 0) {
    alertSections += `
      <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 16px 0; border-radius: 4px;">
        <h3 style="color: #991b1b; margin: 0 0 12px 0; font-size: 16px;">🚨 Abandoned Webhooks (${alertsByType.abandoned_webhook.length})</h3>
        <p style="margin: 0 0 12px 0; color: #7f1d1d;">These webhooks have exhausted all retry attempts and require immediate attention:</p>
        ${alertsByType.abandoned_webhook.map(alert => `
          <div style="background: white; padding: 12px; margin: 8px 0; border-radius: 4px;">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">${alert.webhook_name}</div>
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">${alert.details.webhook_url}</div>
            <div style="font-size: 13px; color: #dc2626;">Failed after ${alert.details.retry_count} attempts</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px; font-family: monospace;">${alert.details.last_error}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (alertsByType.high_failure_rate.length > 0) {
    alertSections += `
      <div style="background: #fed7aa; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 4px;">
        <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">⚠️ High Failure Rates (${alertsByType.high_failure_rate.length})</h3>
        <p style="margin: 0 0 12px 0; color: #78350f;">These webhooks are experiencing elevated failure rates:</p>
        ${alertsByType.high_failure_rate.map(alert => `
          <div style="background: white; padding: 12px; margin: 8px 0; border-radius: 4px;">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">${alert.webhook_name}</div>
            <div style="font-size: 14px; color: #dc2626; margin-bottom: 4px;">
              <strong>${alert.details.failure_rate}%</strong> failure rate 
              (${alert.details.failed_calls}/${alert.details.total_calls} calls failed)
            </div>
            <div style="font-size: 13px; color: #6b7280;">
              Threshold: ${alert.details.threshold}% over last ${alert.details.window_hours} hour(s)
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (alertsByType.slow_response_time.length > 0) {
    alertSections += `
      <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 4px;">
        <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px;">🐌 Slow Response Times (${alertsByType.slow_response_time.length})</h3>
        <p style="margin: 0 0 12px 0; color: #1e3a8a;">These webhooks are responding slower than expected:</p>
        ${alertsByType.slow_response_time.map(alert => `
          <div style="background: white; padding: 12px; margin: 8px 0; border-radius: 4px;">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">${alert.webhook_name}</div>
            <div style="font-size: 14px; color: #1e40af; margin-bottom: 4px;">
              Average: <strong>${alert.details.avg_response_time}ms</strong>
            </div>
            <div style="font-size: 13px; color: #6b7280;">
              Threshold: ${alert.details.threshold}ms over ${alert.details.calls_analyzed} calls in last ${alert.details.window_hours} hour(s)
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #374151; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; }
    .footer { text-align: center; padding: 16px; color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Webhook Health Alert</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">${new Date().toLocaleString()}</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; margin: 0 0 20px 0;">
        We've detected ${alerts.length} webhook issue${alerts.length > 1 ? 's' : ''} that require your attention:
      </p>
      
      ${alertSections}
      
      <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          <strong>What to do next:</strong><br/>
          1. Review your webhook configurations<br/>
          2. Check external service status<br/>
          3. Verify webhook URLs are correct<br/>
          4. Review webhook activity logs for details
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p>PPC Outcome Registry - Webhook Health Monitoring</p>
      <p>This is an automated alert. You can adjust alert settings in your dashboard.</p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(handler);
