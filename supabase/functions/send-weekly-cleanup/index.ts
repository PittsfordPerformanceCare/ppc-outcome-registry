import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

interface CleanupItem {
  id: string;
  name: string;
  details: string;
  link: string;
}

interface CleanupSection {
  title: string;
  count: number;
  items: CleanupItem[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedSecret = req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("authorization");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    const hasValidCronSecret = cronSecret && providedSecret === cronSecret;
    const hasValidAuthHeader = authHeader && anonKey && authHeader.includes(anonKey);
    
    if (!hasValidCronSecret && !hasValidAuthHeader) {
      console.error("Unauthorized: Invalid or missing authentication");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting weekly cleanup check...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const sections: CleanupSection[] = [];
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // A. Incomplete Intakes - leads > 48 hours old without completed intake
    console.log("Checking incomplete intakes...");
    const { data: incompleteLeads, error: leadsError } = await supabase
      .from("leads")
      .select("id, name, email, created_at, intake_completed_at")
      .lt("created_at", fortyEightHoursAgo.toISOString())
      .is("intake_completed_at", null)
      .order("created_at", { ascending: true });

    if (leadsError) console.error("Error fetching incomplete leads:", leadsError);

    if (incompleteLeads && incompleteLeads.length > 0) {
      sections.push({
        title: "Incomplete Intakes",
        count: incompleteLeads.length,
        items: incompleteLeads.map((lead) => ({
          id: lead.id,
          name: lead.name || lead.email || "Unknown",
          details: `Created ${new Date(lead.created_at).toLocaleDateString()}`,
          link: `/admin/leads`,
        })),
      });
    }

    // B. Unassigned Leads - leads without assigned clinician (we check leads without episode)
    console.log("Checking unassigned leads...");
    const { data: unassignedLeads, error: unassignedError } = await supabase
      .from("leads")
      .select("id, name, email, created_at, episode_opened_at")
      .is("episode_opened_at", null)
      .order("created_at", { ascending: true })
      .limit(50);

    if (unassignedError) console.error("Error fetching unassigned leads:", unassignedError);

    if (unassignedLeads && unassignedLeads.length > 0) {
      sections.push({
        title: "Unassigned Leads (No Episode Created)",
        count: unassignedLeads.length,
        items: unassignedLeads.slice(0, 10).map((lead) => ({
          id: lead.id,
          name: lead.name || lead.email || "Unknown",
          details: `Created ${new Date(lead.created_at).toLocaleDateString()}`,
          link: `/admin/leads`,
        })),
      });
    }

    // C. PCP Summaries Pending
    console.log("Checking pending PCP summaries...");
    const { data: pendingPCP, error: pcpError } = await supabase
      .from("pcp_summary_tasks")
      .select("id, episode_id, patient_name, status, created_at")
      .in("status", ["pending", "open"])
      .order("created_at", { ascending: true });

    if (pcpError) console.error("Error fetching PCP tasks:", pcpError);

    if (pendingPCP && pendingPCP.length > 0) {
      sections.push({
        title: "PCP Summaries Pending",
        count: pendingPCP.length,
        items: pendingPCP.map((task) => ({
          id: task.id,
          name: task.patient_name || "Unknown Patient",
          details: `Episode: ${task.episode_id} - Status: ${task.status}`,
          link: `/pcp-summary`,
        })),
      });
    }

    // D. Episodes Ready to Close (active, last activity > 7 days ago)
    console.log("Checking stale active episodes...");
    const { data: staleEpisodes, error: staleError } = await supabase
      .from("episodes")
      .select("id, patient_name, region, current_status, updated_at, created_at")
      .eq("current_status", "active")
      .lt("updated_at", sevenDaysAgo.toISOString())
      .order("updated_at", { ascending: true })
      .limit(50);

    if (staleError) console.error("Error fetching stale episodes:", staleError);

    if (staleEpisodes && staleEpisodes.length > 0) {
      sections.push({
        title: "Episodes Ready to Close",
        count: staleEpisodes.length,
        items: staleEpisodes.slice(0, 10).map((ep) => ({
          id: ep.id,
          name: ep.patient_name,
          details: `${ep.region} - Last updated ${new Date(ep.updated_at).toLocaleDateString()}`,
          link: `/episode-summary?id=${ep.id}`,
        })),
      });
    }

    // E. Episode Type Mismatches - Neuro episodes without neuro exam data
    console.log("Checking episode type mismatches...");
    const { data: neuroEpisodes, error: neuroError } = await supabase
      .from("episodes")
      .select("id, patient_name, episode_type, region")
      .eq("episode_type", "Neurologic")
      .order("created_at", { ascending: false })
      .limit(100);

    if (neuroError) console.error("Error fetching neuro episodes:", neuroError);

    const mismatchedEpisodes: CleanupItem[] = [];
    if (neuroEpisodes) {
      for (const ep of neuroEpisodes.slice(0, 20)) {
        const { data: exams } = await supabase
          .from("neurologic_exams")
          .select("id")
          .eq("episode_id", ep.id)
          .limit(1);

        if (!exams || exams.length === 0) {
          mismatchedEpisodes.push({
            id: ep.id,
            name: ep.patient_name,
            details: `Neuro episode without exam data - ${ep.region}`,
            link: `/neuro-exam?episodeId=${ep.id}`,
          });
        }
        if (mismatchedEpisodes.length >= 10) break;
      }
    }

    if (mismatchedEpisodes.length > 0) {
      sections.push({
        title: "Episode Type Mismatches",
        count: mismatchedEpisodes.length,
        items: mismatchedEpisodes,
      });
    }

    // G. Episode Lifecycle Issues (from Automation #9)
    console.log("Checking episode integrity issues...");
    const { data: integrityIssues, error: integrityError } = await supabase
      .from("episode_integrity_issues")
      .select("id, episode_id, patient_name, issue_type, issue_details")
      .eq("is_active", true)
      .order("detected_at", { ascending: false })
      .limit(20);

    if (!integrityError && integrityIssues && integrityIssues.length > 0) {
      sections.push({
        title: "Episode Lifecycle Issues",
        count: integrityIssues.length,
        items: integrityIssues.slice(0, 10).map((issue) => ({
          id: issue.id,
          name: issue.patient_name,
          details: `${issue.issue_type.replace(/_/g, " ")} - ${issue.issue_details}`,
          link: `/admin/episode-integrity`,
        })),
      });
    }

    // Calculate totals
    const totalItems = sections.reduce((sum, s) => sum + s.count, 0);
    console.log(`Found ${totalItems} total cleanup items across ${sections.length} categories`);

    // Send email if there are items
    const resendKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (resendKey && totalItems > 0) {
      const resend = new Resend(resendKey);

      // Get admin emails
      const { data: adminUsers } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const adminEmails: string[] = [];
      if (adminUsers) {
        for (const admin of adminUsers) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", admin.user_id)
            .single();
          if (profile?.email) {
            adminEmails.push(profile.email);
          }
        }
      }

      if (adminEmails.length > 0) {
        const appUrl = Deno.env.get("APP_URL") || "https://ppc-outcome-registry.lovable.app";
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">PPC Weekly Clean-Up Checklist</h1>
            <p style="color: #6b7280;">Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; margin-top: 0;">Summary: ${totalItems} Items Need Attention</h2>
              <ul style="list-style: none; padding: 0;">
                ${sections.map((s) => `<li style="margin: 8px 0;">• <strong>${s.title}:</strong> ${s.count} items</li>`).join("")}
              </ul>
            </div>
            
            <div style="margin-top: 20px;">
              <a href="${appUrl}/admin/weekly-cleanup" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View Full Checklist
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
              This is an automated weekly clean-up reminder. No data has been modified.
            </p>
          </div>
        `;

        try {
          const emailResponse = await resend.emails.send({
            from: "PPC Registry <onboarding@resend.dev>",
            to: adminEmails,
            subject: `PPC Weekly Clean-Up Checklist - ${totalItems} Items (Automated)`,
            html: emailHtml,
          });
          console.log("Email sent successfully:", emailResponse);
          emailSent = true;
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalItems,
        sections,
        emailSent,
        generatedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in weekly cleanup:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
