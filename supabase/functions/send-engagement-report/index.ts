import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecipientMetrics {
  email: string;
  totalReceived: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  engagementLevel: string;
}

const getEngagementLevel = (openRate: number): string => {
  if (openRate >= 75) return 'High';
  if (openRate >= 50) return 'Medium';
  if (openRate >= 25) return 'Low';
  return 'Very Low';
};

const generateEmailHTML = (data: { schedule: any; recipients: RecipientMetrics[]; summary: any }) => {
  const { schedule, recipients, summary } = data;
  
  const tableRows = recipients.map(r => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px;">${r.email}</td>
      <td style="padding: 12px; text-align: right;">${r.totalReceived}</td>
      <td style="padding: 12px; text-align: right;">${r.totalOpened}</td>
      <td style="padding: 12px; text-align: right;">
        <span style="font-weight: 600;">${r.openRate}%</span>
      </td>
      <td style="padding: 12px; text-align: right;">${r.totalClicked}</td>
      <td style="padding: 12px; text-align: right;">
        <span style="font-weight: 600;">${r.clickRate}%</span>
      </td>
      <td style="padding: 12px;">
        <span style="
          padding: 4px 12px; 
          border-radius: 12px; 
          font-size: 12px; 
          font-weight: 600;
          background: ${r.engagementLevel === 'High' ? '#dcfce7' : r.engagementLevel === 'Medium' ? '#fef9c3' : r.engagementLevel === 'Low' ? '#fed7aa' : '#fee2e2'};
          color: ${r.engagementLevel === 'High' ? '#166534' : r.engagementLevel === 'Medium' ? '#854d0e' : r.engagementLevel === 'Low' ? '#9a3412' : '#991b1b'};
        ">${r.engagementLevel}</span>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #374151; }
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .summary-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-value { font-size: 28px; font-weight: bold; color: #1f2937; margin: 10px 0; }
    .summary-label { font-size: 14px; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f9fafb; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Recipient Engagement Report</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${schedule.name}</p>
    </div>
    
    <div class="content">
      <p>This is your ${schedule.frequency} scheduled recipient engagement report.</p>
      
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Total Recipients</div>
          <div class="summary-value">${summary.totalRecipients}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Avg Open Rate</div>
          <div class="summary-value" style="color: #3b82f6;">${summary.avgOpenRate}%</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Avg Click Rate</div>
          <div class="summary-value" style="color: #8b5cf6;">${summary.avgClickRate}%</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Reports Sent</div>
          <div class="summary-value">${summary.totalSent}</div>
        </div>
      </div>
      
      <h2 style="color: #1f2937; margin-top: 30px;">Recipient Performance</h2>
      
      <table>
        <thead>
          <tr>
            <th>Recipient</th>
            <th style="text-align: right;">Received</th>
            <th style="text-align: right;">Opened</th>
            <th style="text-align: right;">Open Rate</th>
            <th style="text-align: right;">Clicked</th>
            <th style="text-align: right;">Click Rate</th>
            <th>Engagement</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        This report includes all recipients and their engagement with comparison reports.
      </p>
    </div>
    
    <div class="footer">
      <p>PPC Outcome Registry - Recipient Engagement Analytics</p>
      <p>This is an automated report. Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
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

    const { scheduleId } = await req.json();

    console.log(`Processing engagement report for schedule: ${scheduleId}`);

    // Get schedule details
    const { data: schedule, error: scheduleError } = await supabase
      .from("recipient_engagement_schedules")
      .select("*")
      .eq("id", scheduleId)
      .single();

    if (scheduleError) throw scheduleError;
    if (!schedule.enabled) {
      console.log("Schedule is disabled, skipping");
      return new Response(JSON.stringify({ message: "Schedule disabled" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get all comparison report deliveries
    const { data: deliveries, error: deliveriesError } = await supabase
      .from("comparison_report_deliveries")
      .select("*")
      .eq("status", "success")
      .order("sent_at", { ascending: false });

    if (deliveriesError) throw deliveriesError;

    // Aggregate by recipient
    const recipientMap = new Map<string, RecipientMetrics>();

    (deliveries || []).forEach((delivery: any) => {
      delivery.recipient_emails.forEach((email: string) => {
        const existing = recipientMap.get(email) || {
          email,
          totalReceived: 0,
          totalOpened: 0,
          totalClicked: 0,
          openRate: 0,
          clickRate: 0,
          engagementLevel: '',
        };

        existing.totalReceived += 1;
        if (delivery.open_count > 0) existing.totalOpened += 1;
        if (delivery.click_count > 0) existing.totalClicked += 1;

        recipientMap.set(email, existing);
      });
    });

    // Calculate rates and engagement levels
    let recipients = Array.from(recipientMap.values()).map(r => {
      const openRate = r.totalReceived > 0 
        ? Math.round((r.totalOpened / r.totalReceived) * 100) 
        : 0;
      const clickRate = r.totalReceived > 0 
        ? Math.round((r.totalClicked / r.totalReceived) * 100) 
        : 0;
      
      return {
        ...r,
        openRate,
        clickRate,
        engagementLevel: getEngagementLevel(openRate),
      };
    });

    // Apply engagement filter
    if (schedule.min_engagement_filter && schedule.min_engagement_filter !== 'all') {
      const filterMap: Record<string, string[]> = {
        'high': ['High'],
        'medium': ['High', 'Medium'],
        'low': ['High', 'Medium', 'Low'],
        'very_low': ['High', 'Medium', 'Low', 'Very Low'],
      };
      const allowedLevels = filterMap[schedule.min_engagement_filter] || [];
      recipients = recipients.filter(r => allowedLevels.includes(r.engagementLevel));
    }

    // Sort by open rate descending
    recipients.sort((a, b) => b.openRate - a.openRate);

    // Calculate summary
    const summary = {
      totalRecipients: recipients.length,
      avgOpenRate: recipients.length > 0 
        ? Math.round(recipients.reduce((sum, r) => sum + r.openRate, 0) / recipients.length)
        : 0,
      avgClickRate: recipients.length > 0 
        ? Math.round(recipients.reduce((sum, r) => sum + r.clickRate, 0) / recipients.length)
        : 0,
      totalSent: recipients.reduce((sum, r) => sum + r.totalReceived, 0),
    };

    // Generate and send email
    const emailHTML = generateEmailHTML({ schedule, recipients, summary });

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "PPC Outcome Registry <onboarding@resend.dev>",
        to: schedule.recipient_emails,
        subject: `${schedule.name} - ${schedule.frequency === 'weekly' ? 'Weekly' : 'Monthly'} Engagement Report`,
        html: emailHTML,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error(`Email API error: ${emailResponse.status}`);
    }

    console.log('Engagement report sent successfully');

    // Update schedule
    const nextSendAt = calculateNextSendAt(schedule.frequency, schedule.send_day, schedule.send_time);
    
    await supabase
      .from("recipient_engagement_schedules")
      .update({
        last_sent_at: new Date().toISOString(),
        next_send_at: nextSendAt,
      })
      .eq("id", scheduleId);

    console.log(`Report sent successfully to ${schedule.recipient_emails.length} recipient(s)`);

    // Trigger Zapier webhooks
    await triggerWebhooks(supabase, schedule.user_id, 'report_sent', summary);

    // Check for threshold-based triggers
    if (summary.avgOpenRate < 30) {
      await triggerWebhooks(supabase, schedule.user_id, 'low_open_rate', summary, 30);
    }
    if (summary.avgClickRate < 10) {
      await triggerWebhooks(supabase, schedule.user_id, 'low_click_rate', summary, 10);
    }
    if (summary.avgOpenRate >= 75) {
      await triggerWebhooks(supabase, schedule.user_id, 'high_engagement', summary, 75);
    }
    if (summary.avgOpenRate < 25) {
      await triggerWebhooks(supabase, schedule.user_id, 'low_engagement', summary, 25);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        recipients: schedule.recipient_emails.length,
        recipientsAnalyzed: recipients.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending engagement report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function calculateNextSendAt(frequency: string, sendDay: string, sendTime: string): string {
  const now = new Date();
  const [hours, minutes] = sendTime.split(':').map(Number);
  
  if (frequency === 'weekly') {
    const dayMap: Record<string, number> = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    
    const targetDay = dayMap[sendDay.toLowerCase()];
    const currentDay = now.getDay();
    const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7;
    
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysUntilNext);
    nextDate.setHours(hours, minutes, 0, 0);
    
    return nextDate.toISOString();
  } else {
    // Monthly
    const targetDate = parseInt(sendDay);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, targetDate, hours, minutes, 0, 0);
    return nextMonth.toISOString();
  }
}

async function triggerWebhooks(
  supabase: any,
  userId: string,
  triggerType: string,
  summary: any,
  threshold?: number
): Promise<void> {
  console.log(`Triggering webhooks for type: ${triggerType}, threshold: ${threshold}`);
  
  try {
    // Build the query
    let query = supabase
      .from('zapier_webhook_config')
      .select('*')
      .eq('user_id', userId)
      .eq('trigger_type', triggerType)
      .eq('enabled', true);

    // Filter by threshold if provided
    if (threshold !== undefined) {
      query = query.lte('threshold_value', threshold);
    }

    const { data: webhooks, error } = await query;

    if (error) {
      console.error('Error fetching webhooks:', error);
      return;
    }

    if (!webhooks || webhooks.length === 0) {
      console.log('No webhooks found for trigger');
      return;
    }

    console.log(`Found ${webhooks.length} webhooks to trigger`);

    // Trigger each webhook
    for (const webhook of webhooks) {
      const startTime = Date.now();
      let status = 'failed';
      let responseStatus: number | null = null;
      let responseBody: string | null = null;
      let errorMessage: string | null = null;

      try {
        console.log(`Triggering webhook: ${webhook.name} to ${webhook.webhook_url}`);
        
        const payload = {
          trigger_type: triggerType,
          webhook_name: webhook.name,
          timestamp: new Date().toISOString(),
          data: summary
        };

        const response = await fetch(webhook.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        const duration = Date.now() - startTime;
        responseStatus = response.status;

        try {
          responseBody = await response.text();
        } catch (e) {
          responseBody = 'Unable to read response body';
        }

        if (response.ok) {
          status = 'success';
          console.log(`Webhook ${webhook.name} triggered successfully`);
          
          // Update last_triggered_at
          await supabase
            .from('zapier_webhook_config')
            .update({ last_triggered_at: new Date().toISOString() })
            .eq('id', webhook.id);
        } else {
          status = 'failed';
          errorMessage = `HTTP ${response.status}: ${responseBody}`;
          console.error(`Webhook ${webhook.name} failed with status ${response.status}`);
        }

        // Log the webhook activity
        const { data: activityLog } = await supabase
          .from('webhook_activity_log')
          .insert({
            webhook_config_id: webhook.id,
            user_id: userId,
            clinic_id: webhook.clinic_id,
            webhook_name: webhook.name,
            trigger_type: triggerType,
            webhook_url: webhook.webhook_url,
            status,
            request_payload: payload,
            response_status: responseStatus,
            response_body: responseBody?.substring(0, 5000),
            error_message: errorMessage,
            duration_ms: duration,
          })
          .select()
          .single();

        // If failed, add to retry queue
        if (status === 'failed') {
          const { data: retryTime } = await supabase
            .rpc('calculate_webhook_retry_time', { retry_count: 0 });

          await supabase
            .from('webhook_retry_queue')
            .insert({
              webhook_config_id: webhook.id,
              activity_log_id: activityLog?.id,
              user_id: userId,
              clinic_id: webhook.clinic_id,
              webhook_name: webhook.name,
              webhook_url: webhook.webhook_url,
              trigger_type: triggerType,
              request_payload: payload,
              retry_count: 0,
              max_retries: 5,
              next_retry_at: retryTime,
              last_error: errorMessage,
              status: 'pending',
            });

          console.log(`Added failed webhook ${webhook.name} to retry queue`);
        }

      } catch (webhookError: any) {
        const duration = Date.now() - startTime;
        
        if (webhookError.name === 'TimeoutError') {
          status = 'timeout';
          errorMessage = 'Request timed out after 30 seconds';
        } else {
          status = 'failed';
          errorMessage = webhookError.message || 'Unknown error';
        }

        console.error(`Error triggering webhook ${webhook.name}:`, webhookError);

        // Log the failed webhook activity
        const { data: activityLog } = await supabase
          .from('webhook_activity_log')
          .insert({
            webhook_config_id: webhook.id,
            user_id: userId,
            clinic_id: webhook.clinic_id,
            webhook_name: webhook.name,
            trigger_type: triggerType,
            webhook_url: webhook.webhook_url,
            status,
            request_payload: {
              trigger_type: triggerType,
              webhook_name: webhook.name,
              timestamp: new Date().toISOString(),
              data: summary
            },
            response_status: responseStatus,
            response_body: responseBody,
            error_message: errorMessage,
            duration_ms: duration,
          })
          .select()
          .single();

        // Add to retry queue
        const { data: retryTime } = await supabase
          .rpc('calculate_webhook_retry_time', { retry_count: 0 });

        await supabase
          .from('webhook_retry_queue')
          .insert({
            webhook_config_id: webhook.id,
            activity_log_id: activityLog?.id,
            user_id: userId,
            clinic_id: webhook.clinic_id,
            webhook_name: webhook.name,
            webhook_url: webhook.webhook_url,
            trigger_type: triggerType,
            request_payload: {
              trigger_type: triggerType,
              webhook_name: webhook.name,
              timestamp: new Date().toISOString(),
              data: summary
            },
            retry_count: 0,
            max_retries: 5,
            next_retry_at: retryTime,
            last_error: errorMessage,
            status: 'pending',
          });

        console.log(`Added failed webhook ${webhook.name} to retry queue`);
      }
    }
  } catch (error) {
    console.error('Error in triggerWebhooks:', error);
  }
}

serve(handler);
