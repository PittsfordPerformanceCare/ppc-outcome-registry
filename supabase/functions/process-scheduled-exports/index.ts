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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find all scheduled exports that are due
    const { data: dueExports, error: fetchError } = await supabase
      .from("scheduled_exports")
      .select("*")
      .eq("enabled", true)
      .lte("next_run_at", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching scheduled exports:", fetchError);
      throw fetchError;
    }

    if (!dueExports || dueExports.length === 0) {
      console.log("No scheduled exports due at this time");
      return new Response(
        JSON.stringify({ message: "No scheduled exports due", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${dueExports.length} scheduled export(s)`);
    
    const results = [];
    
    for (const exportJob of dueExports as ScheduledExport[]) {
      try {
        console.log(`Processing export: ${exportJob.name} (${exportJob.id})`);
        
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
          // Update the scheduled export record
          const nextRunAt = calculateNextRunAt(exportJob.frequency);
          
          await supabase
            .from("scheduled_exports")
            .update({
              last_run_at: new Date().toISOString(),
              next_run_at: nextRunAt.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", exportJob.id);
          
          results.push({ id: exportJob.id, name: exportJob.name, status: "success" });
          console.log(`Successfully processed export: ${exportJob.name}`);
        } else {
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
