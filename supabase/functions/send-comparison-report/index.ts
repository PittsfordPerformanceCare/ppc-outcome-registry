import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComparisonMetrics {
  name: string;
  successRate: number;
  totalRecords: number;
  averageRecords: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
}

const calculateMetrics = (history: any[]): ComparisonMetrics => {
  if (history.length === 0) {
    return {
      name: "",
      successRate: 0,
      totalRecords: 0,
      averageRecords: 0,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
    };
  }

  const successfulRuns = history.filter(h => h.status === "success").length;
  const failedRuns = history.filter(h => h.status === "failed").length;
  const totalRuns = history.length;
  const successRate = (successfulRuns / totalRuns) * 100;
  
  const recordCounts = history
    .filter(h => h.status === "success" && h.record_count !== null)
    .map(h => h.record_count);
  
  const totalRecords = recordCounts.reduce((sum, count) => sum + count, 0);
  const averageRecords = recordCounts.length > 0 
    ? Math.round(totalRecords / recordCounts.length)
    : 0;

  return {
    name: "",
    successRate: Math.round(successRate),
    totalRecords,
    averageRecords,
    totalRuns,
    successfulRuns,
    failedRuns,
  };
};

const generateEmailHTML = (data: { schedule: any; exports: any[]; metricsData: ComparisonMetrics[]; trackingId: string }) => {
  const { schedule, exports, metricsData, trackingId } = data;
  const baseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const trackingPixelUrl = `${baseUrl}/functions/v1/track-comparison-open?id=${trackingId}`;
  const createTrackedLink = (url: string, label: string) => 
    `${baseUrl}/functions/v1/track-comparison-click?id=${trackingId}&url=${encodeURIComponent(url)}&label=${encodeURIComponent(label)}`;
  
  const tableRows = metricsData.map((metrics, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; font-weight: 600;">${exports[index]?.name || 'Unknown'}</td>
      <td style="padding: 12px; text-align: right;">${metrics.successRate}%</td>
      <td style="padding: 12px; text-align: right;">${metrics.totalRecords.toLocaleString()}</td>
      <td style="padding: 12px; text-align: right;">${metrics.averageRecords.toLocaleString()}</td>
      <td style="padding: 12px; text-align: right;">${metrics.totalRuns}</td>
      <td style="padding: 12px; text-align: right; color: ${metrics.failedRuns > 0 ? '#dc2626' : '#6b7280'};">${metrics.failedRuns}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #374151; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f9fafb; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-info { background: #dbeafe; color: #1e40af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Export Performance Comparison Report</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${schedule.name}</p>
    </div>
    
    <div class="content">
      <p>This is your ${schedule.frequency} scheduled comparison report for export performance metrics.</p>
      
      <h2 style="color: #1f2937; margin-top: 30px;">Performance Summary</h2>
      
      <table>
        <thead>
          <tr>
            <th>Export Schedule</th>
            <th style="text-align: right;">Success Rate</th>
            <th style="text-align: right;">Total Records</th>
            <th style="text-align: right;">Avg Records</th>
            <th style="text-align: right;">Total Runs</th>
            <th style="text-align: right;">Failed Runs</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #1f2937;">Key Insights</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Total exports compared: <strong>${exports.length}</strong></li>
          <li>Average success rate: <strong>${Math.round(metricsData.reduce((sum, m) => sum + m.successRate, 0) / metricsData.length)}%</strong></li>
          <li>Total records processed: <strong>${metricsData.reduce((sum, m) => sum + m.totalRecords, 0).toLocaleString()}</strong></li>
        </ul>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        To view detailed charts and trends, <a href="${createTrackedLink(baseUrl, 'Dashboard Link')}" style="color: #2754C5; text-decoration: underline;">log in to your PPC Outcome Registry dashboard</a>.
      </p>
    </div>
    
    <div class="footer">
      <p>PPC Outcome Registry - Export Performance Monitoring</p>
      <p>This is an automated report. Do not reply to this email.</p>
    </div>
  </div>
  <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
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

    console.log(`Processing comparison report for schedule: ${scheduleId}`);

    // Get schedule details
    const { data: schedule, error: scheduleError } = await supabase
      .from("comparison_report_schedules")
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

    // Get export schedules
    const { data: exports, error: exportsError } = await supabase
      .from("scheduled_exports")
      .select("*")
      .in("id", schedule.export_ids);

    if (exportsError) throw exportsError;
    if (!exports || exports.length === 0) {
      throw new Error("No exports found for this schedule");
    }

    // Get history for each export
    const metricsData: ComparisonMetrics[] = [];
    
    for (const exp of exports) {
      const { data: history, error: historyError } = await supabase
        .from("export_history")
        .select("*")
        .eq("export_id", exp.id)
        .order("executed_at", { ascending: false })
        .limit(50);

      if (historyError) {
        console.error(`Error fetching history for export ${exp.id}:`, historyError);
        continue;
      }

      const metrics = calculateMetrics(history || []);
      metrics.name = exp.name;
      metricsData.push(metrics);
    }

    // Generate tracking ID
    const trackingId = crypto.randomUUID();
    
    // Generate and send email
    const emailHTML = generateEmailHTML({ schedule, exports, metricsData, trackingId });
    const now = new Date().toISOString();
    
    let emailResponseData: any = null;
    let deliveryStatus = 'success';
    let errorMessage = null;

    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: "PPC Outcome Registry <onboarding@resend.dev>",
          to: schedule.recipient_emails,
          subject: `${schedule.name} - ${schedule.frequency === 'weekly' ? 'Weekly' : 'Monthly'} Comparison Report`,
          html: emailHTML,
        }),
      });

      if (emailResponse.ok) {
        emailResponseData = await emailResponse.json();
        console.log('Comparison report sent successfully:', emailResponseData);
      } else {
        throw new Error(`Email API error: ${emailResponse.status}`);
      }
    } catch (error: any) {
      deliveryStatus = 'failed';
      errorMessage = error.message;
      console.error('Error sending comparison report:', error);
    }

    // Log delivery history
    const exportNames = exports.map(exp => exp.name);
    const { error: historyError } = await supabase
      .from('comparison_report_deliveries')
      .insert({
        schedule_id: scheduleId,
        user_id: schedule.user_id,
        clinic_id: schedule.clinic_id,
        sent_at: now,
        recipient_emails: schedule.recipient_emails,
        export_ids: schedule.export_ids,
        export_names: exportNames,
        status: deliveryStatus,
        error_message: errorMessage,
        tracking_id: trackingId,
        delivery_details: emailResponseData ? {
          email_id: emailResponseData.id,
          metrics: metricsData,
        } : null,
      });

    if (historyError) {
      console.error('Error logging delivery history:', historyError);
    }

    // Update schedule
    const nextSendAt = calculateNextSendAt(schedule.frequency, schedule.send_day, schedule.send_time);
    
    await supabase
      .from("comparison_report_schedules")
      .update({
        last_sent_at: now,
        next_send_at: nextSendAt,
      })
      .eq("id", scheduleId);

    // If email failed to send, throw error after logging
    if (deliveryStatus === 'failed') {
      throw new Error(errorMessage || 'Failed to send email');
    }

    console.log(`Report sent successfully to ${schedule.recipient_emails.length} recipient(s)`);

    return new Response(
      JSON.stringify({ 
        success: true,
        recipients: schedule.recipient_emails.length,
        exportsCompared: exports.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending comparison report:", error);
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

serve(handler);
