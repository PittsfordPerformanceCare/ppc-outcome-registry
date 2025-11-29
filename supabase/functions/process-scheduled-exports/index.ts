import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduledExport {
  id: string;
  name: string;
  export_type: string;
  frequency: string;
  recipient_emails: string[];
  filters: any;
  user_id: string;
  clinic_id: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify cron secret for automated calls
    const cronSecret = Deno.env.get('CRON_SECRET');
    const providedSecret = req.headers.get('x-cron-secret');
    
    // Only require secret if it's configured (allows gradual rollout)
    if (cronSecret && providedSecret !== cronSecret) {
      console.error('Unauthorized: Invalid or missing cron secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if a specific export ID was provided (manual run)
    let requestBody: any = {};
    try {
      requestBody = await req.json();
    } catch {
      // No body provided, process all due exports
    }

    const specificExportId = requestBody.export_id;

    // Find scheduled exports to process
    let query = supabase
      .from("scheduled_exports")
      .select("*")
      .eq("enabled", true);

    if (specificExportId) {
      // Manual run: process specific export regardless of schedule
      query = query.eq("id", specificExportId);
      console.log(`Manual run requested for export: ${specificExportId}`);
    } else {
      // Automatic run: process only due exports
      query = query.lte("next_run_at", new Date().toISOString());
    }

    const { data: dueExports, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching scheduled exports:", fetchError);
      throw fetchError;
    }

    if (!dueExports || dueExports.length === 0) {
      const message = specificExportId 
        ? "Export not found or disabled"
        : "No scheduled exports due at this time";
      console.log(message);
      return new Response(
        JSON.stringify({ message, processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${dueExports.length} scheduled export(s)`);
    
    const results = [];
    
    for (const exportJob of dueExports as ScheduledExport[]) {
      try {
        console.log(`Processing export: ${exportJob.name} (${exportJob.id})`);
        
        // Log export start
        const { data: historyRecord } = await supabase
          .from("export_history")
          .insert({
            export_id: exportJob.id,
            export_name: exportJob.name,
            export_type: exportJob.export_type,
            status: 'processing',
            recipient_emails: exportJob.recipient_emails,
            user_id: exportJob.user_id,
            clinic_id: exportJob.clinic_id,
          })
          .select()
          .single();
        
        const historyId = historyRecord?.id;
        
        // Fetch the data based on export type and filters
        const exportData = await fetchExportData(supabase, exportJob);
        
        // Generate CSV content
        const csvContent = generateCSV(exportData, exportJob.export_type);
        
        // Send email with CSV attachment
        const emailResult = await sendExportEmail(
          exportJob.name,
          exportJob.recipient_emails,
          csvContent,
          exportJob.export_type
        );
        
        if (emailResult.success) {
          // Update export history to success
          if (historyId) {
            await supabase
              .from("export_history")
              .update({
                status: 'success',
                record_count: exportData.length,
              })
              .eq("id", historyId);
          }
          
          // Update the scheduled export record
          // For manual runs, don't update next_run_at, only last_run_at
          const updateData: any = {
            last_run_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          // Only update next_run_at for automatic scheduled runs
          if (!specificExportId) {
            updateData.next_run_at = calculateNextRunAt(exportJob.frequency).toISOString();
          }
          
          await supabase
            .from("scheduled_exports")
            .update(updateData)
            .eq("id", exportJob.id);
          
          results.push({ id: exportJob.id, name: exportJob.name, status: "success" });
          console.log(`Successfully processed export: ${exportJob.name}`);
        } else {
          // Update export history to failed
          if (historyId) {
            await supabase
              .from("export_history")
              .update({
                status: 'failed',
                error_message: emailResult.error,
              })
              .eq("id", historyId);
          }
          
          results.push({ id: exportJob.id, name: exportJob.name, status: "failed", error: emailResult.error });
          console.error(`Failed to send email for export: ${exportJob.name}`, emailResult.error);
        }
      } catch (error: any) {
        console.error(`Error processing export ${exportJob.name}:`, error);
        results.push({ id: exportJob.id, name: exportJob.name, status: "error", error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Scheduled exports processed", 
        processed: results.length,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in process-scheduled-exports function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

async function fetchExportData(supabase: any, exportJob: ScheduledExport): Promise<any[]> {
  let query = supabase.from("episodes").select("*");
  
  // Apply clinic filter if set
  if (exportJob.clinic_id) {
    query = query.eq("clinic_id", exportJob.clinic_id);
  }
  
  // Apply user-specific filters from exportJob.filters
  const filters = exportJob.filters || {};
  
  if (filters.region && filters.region.length > 0) {
    query = query.in("region", filters.region);
  }
  
  if (filters.diagnosis && filters.diagnosis.length > 0) {
    query = query.in("diagnosis", filters.diagnosis);
  }
  
  if (filters.clinician && filters.clinician.length > 0) {
    query = query.in("clinician", filters.clinician);
  }
  
  if (filters.dateRange) {
    if (filters.dateRange.from) {
      query = query.gte("date_of_service", filters.dateRange.from);
    }
    if (filters.dateRange.to) {
      query = query.lte("date_of_service", filters.dateRange.to);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching export data:", error);
    throw error;
  }
  
  return data || [];
}

function generateCSV(data: any[], exportType: string): string {
  if (data.length === 0) {
    return "No data available for the selected criteria";
  }
  
  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvRows = [headers.join(",")];
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle null/undefined
      if (value === null || value === undefined) return "";
      // Handle arrays and objects
      if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      // Handle strings with commas or quotes
      if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(","));
  }
  
  return csvRows.join("\n");
}

async function sendExportEmail(
  exportName: string,
  recipients: string[],
  csvContent: string,
  exportType: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Convert CSV to base64
    const encoder = new TextEncoder();
    const csvBytes = encoder.encode(csvContent);
    const base64Content = btoa(String.fromCharCode(...csvBytes));

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "PT Outcomes <onboarding@resend.dev>",
        to: recipients,
        subject: `Scheduled Report: ${exportName}`,
        html: `
          <h2>Your Scheduled Export is Ready</h2>
          <p>Hello,</p>
          <p>Your scheduled export "<strong>${exportName}</strong>" has been generated successfully.</p>
          <p><strong>Export Type:</strong> ${exportType}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p>Please find the exported data attached as a CSV file.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">
            This is an automated report from PT Outcomes Registry. 
            To manage your scheduled exports, log in to your account.
          </p>
        `,
        attachments: [
          {
            filename: `${exportName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
            content: base64Content,
          },
        ],
      }),
    });

    if (emailResponse.ok) {
      const responseData = await emailResponse.json();
      console.log("Email sent successfully:", responseData);
      return { success: true };
    } else {
      const errorData = await emailResponse.text();
      console.error("Email send failed:", errorData);
      return { success: false, error: errorData };
    }
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

function calculateNextRunAt(frequency: string): Date {
  const now = new Date();
  
  switch (frequency) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

serve(handler);
