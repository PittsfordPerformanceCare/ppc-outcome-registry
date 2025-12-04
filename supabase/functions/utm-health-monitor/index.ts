import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Lead {
  id: string;
  name: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  origin_page: string | null;
  origin_cta: string | null;
  created_at: string;
}

interface UTMIssue {
  lead_id: string;
  issue_type: string;
  issue_details: string;
}

const PILLAR_PATTERNS = ['pillar-clinic-site', 'pillar', 'ppc-outcome-registry'];
const SUSPICIOUS_VALUES = ['unknown', 'not_set', '(not set)', 'undefined', 'null', ''];

function isPillarOrigin(origin_page: string | null): boolean {
  if (!origin_page) return false;
  return PILLAR_PATTERNS.some(pattern => origin_page.toLowerCase().includes(pattern));
}

function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim() === '';
}

function isSuspiciousValue(value: string | null): boolean {
  if (!value) return false;
  return SUSPICIOUS_VALUES.includes(value.toLowerCase().trim());
}

function checkLeadForIssues(lead: Lead): UTMIssue[] {
  const issues: UTMIssue[] = [];

  // Rule 1 - Completely Missing UTMs (from pillar origin)
  const hasNoUtms = isEmpty(lead.utm_source) && isEmpty(lead.utm_campaign) && isEmpty(lead.origin_cta);
  if (hasNoUtms && isPillarOrigin(lead.origin_page)) {
    issues.push({
      lead_id: lead.id,
      issue_type: 'no_utms',
      issue_details: 'Lead from pillar-origin page with no UTM or CTA attribution.'
    });
  }

  // Rule 2 - Missing Source
  if (!isEmpty(lead.origin_page) && isEmpty(lead.utm_source)) {
    issues.push({
      lead_id: lead.id,
      issue_type: 'missing_source',
      issue_details: 'Lead missing utm_source.'
    });
  }

  // Rule 3 - Missing Campaign
  if (!isEmpty(lead.origin_page) && isEmpty(lead.utm_campaign)) {
    issues.push({
      lead_id: lead.id,
      issue_type: 'missing_campaign',
      issue_details: 'Lead missing utm_campaign.'
    });
  }

  // Rule 4 - Missing CTA Identifier
  if (!isEmpty(lead.origin_page) && isEmpty(lead.origin_cta)) {
    issues.push({
      lead_id: lead.id,
      issue_type: 'missing_cta',
      issue_details: 'Lead missing origin_cta (CTA identifier).'
    });
  }

  // Rule 5 - Suspicious Values
  if (isSuspiciousValue(lead.utm_source) || isSuspiciousValue(lead.utm_campaign)) {
    issues.push({
      lead_id: lead.id,
      issue_type: 'suspicious_value',
      issue_details: 'UTM fields use ambiguous placeholder values.'
    });
  }

  return issues;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("UTM Health Monitor starting...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body for optional parameters
    let sendEmail = false;
    let daysBack = 30;
    try {
      const body = await req.json();
      sendEmail = body?.sendEmail ?? false;
      daysBack = body?.daysBack ?? 30;
    } catch {
      // No body provided, use defaults
    }

    // Calculate date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    console.log(`Checking leads from last ${daysBack} days (since ${cutoffDate.toISOString()})`);

    // Fetch leads from the last N days
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, name, utm_source, utm_medium, utm_campaign, utm_content, origin_page, origin_cta, created_at')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      throw leadsError;
    }

    console.log(`Found ${leads?.length || 0} leads to check`);

    // Get existing active issues to avoid duplicates
    const { data: existingIssues, error: existingError } = await supabase
      .from('utm_health_issues')
      .select('lead_id, issue_type')
      .eq('is_active', true);

    if (existingError) {
      console.error("Error fetching existing issues:", existingError);
      throw existingError;
    }

    // Create a set of existing issue keys for quick lookup
    const existingIssueKeys = new Set(
      (existingIssues || []).map(i => `${i.lead_id}:${i.issue_type}`)
    );

    // Check each lead for issues
    const newIssues: UTMIssue[] = [];
    const issuesByType: Record<string, number> = {
      no_utms: 0,
      missing_source: 0,
      missing_campaign: 0,
      missing_cta: 0,
      suspicious_value: 0
    };

    for (const lead of leads || []) {
      const leadIssues = checkLeadForIssues(lead);
      for (const issue of leadIssues) {
        const issueKey = `${issue.lead_id}:${issue.issue_type}`;
        if (!existingIssueKeys.has(issueKey)) {
          newIssues.push(issue);
          existingIssueKeys.add(issueKey); // Prevent duplicates in this run
        }
        issuesByType[issue.issue_type] = (issuesByType[issue.issue_type] || 0) + 1;
      }
    }

    console.log(`Found ${newIssues.length} new issues to insert`);

    // Insert new issues
    if (newIssues.length > 0) {
      const { error: insertError } = await supabase
        .from('utm_health_issues')
        .insert(newIssues);

      if (insertError) {
        console.error("Error inserting issues:", insertError);
        throw insertError;
      }
    }

    // Calculate summary stats
    const totalLeads = leads?.length || 0;
    const leadsWithIssues = new Set(newIssues.map(i => i.lead_id)).size + 
      new Set((existingIssues || []).map(i => i.lead_id)).size;
    const leadsWithCompleteUtms = totalLeads - leadsWithIssues;

    // Get top UTM sources and campaigns
    const utmSourceCounts: Record<string, number> = {};
    const utmCampaignCounts: Record<string, number> = {};
    
    for (const lead of leads || []) {
      if (lead.utm_source && !isEmpty(lead.utm_source)) {
        utmSourceCounts[lead.utm_source] = (utmSourceCounts[lead.utm_source] || 0) + 1;
      }
      if (lead.utm_campaign && !isEmpty(lead.utm_campaign)) {
        utmCampaignCounts[lead.utm_campaign] = (utmCampaignCounts[lead.utm_campaign] || 0) + 1;
      }
    }

    const topSources = Object.entries(utmSourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const topCampaigns = Object.entries(utmCampaignCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const summary = {
      totalLeads,
      leadsWithCompleteUtms,
      leadsWithIssues,
      completionRate: totalLeads > 0 ? Math.round((leadsWithCompleteUtms / totalLeads) * 100) : 0,
      issuesByType,
      newIssuesFound: newIssues.length,
      topSources,
      topCampaigns
    };

    console.log("UTM Health Summary:", JSON.stringify(summary, null, 2));

    // Send weekly email summary if requested
    if (sendEmail) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (resendApiKey) {
        const appUrl = Deno.env.get("APP_URL") || "https://ppc-outcome-registry.lovable.app";

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">PPC UTM Health Summary</h1>
            <p>Here's your weekly UTM attribution health report for the last 7 days:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; margin-top: 0;">Overview</h2>
              <p><strong>Total Leads:</strong> ${summary.totalLeads}</p>
              <p><strong>Complete Attribution:</strong> ${summary.completionRate}%</p>
              <p><strong>Leads with Issues:</strong> ${summary.leadsWithIssues}</p>
            </div>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #92400e; margin-top: 0;">Issues by Type</h2>
              <ul style="color: #78350f;">
                <li>No UTMs: ${summary.issuesByType.no_utms || 0}</li>
                <li>Missing Source: ${summary.issuesByType.missing_source || 0}</li>
                <li>Missing Campaign: ${summary.issuesByType.missing_campaign || 0}</li>
                <li>Missing CTA: ${summary.issuesByType.missing_cta || 0}</li>
                <li>Suspicious Values: ${summary.issuesByType.suspicious_value || 0}</li>
              </ul>
            </div>
            
            <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #166534; margin-top: 0;">Top Sources</h2>
              <ul style="color: #166534;">
                ${summary.topSources.map((s: {name: string; count: number}) => `<li>${s.name}: ${s.count}</li>`).join('') || '<li>No data</li>'}
              </ul>
              <h2 style="color: #166534;">Top Campaigns</h2>
              <ul style="color: #166534;">
                ${summary.topCampaigns.map((c: {name: string; count: number}) => `<li>${c.name}: ${c.count}</li>`).join('') || '<li>No data</li>'}
              </ul>
            </div>
            
            <p style="margin-top: 30px;">
              <a href="${appUrl}/admin/utm-health" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View Full Dashboard
              </a>
            </p>
          </div>
        `;

        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: "PPC Registry <onboarding@resend.dev>",
              to: ["admin@pittsfordperformancecare.com"],
              subject: "PPC UTM Health Summary (Last 7 Days)",
              html: emailHtml
            })
          });
          
          if (emailResponse.ok) {
            console.log("Weekly summary email sent successfully");
          } else {
            console.error("Email send failed:", await emailResponse.text());
          }
        } catch (emailError: unknown) {
          console.error("Failed to send email:", emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, summary }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("UTM Health Monitor error:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
