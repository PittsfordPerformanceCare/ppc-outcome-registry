import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntegrityIssue {
  episode_id: string;
  patient_name: string;
  clinician_id: string | null;
  clinic_id: string | null;
  issue_type: string;
  issue_details: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const appUrl = Deno.env.get("APP_URL") || "https://ppc-outcome-registry.lovable.app";
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Create a check run record
  const { data: checkRun, error: runError } = await supabase
    .from("episode_integrity_check_runs")
    .insert({
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (runError) {
    console.error("Failed to create check run:", runError);
    return new Response(
      JSON.stringify({ error: "Failed to create check run" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const runId = checkRun.id;
  const issues: IntegrityIssue[] = [];
  const issuesByType: Record<string, number> = {
    missing_baseline: 0,
    missing_discharge: 0,
    stale_episode: 0,
    duplicate_episode: 0,
  };

  try {
    console.log("Starting Episode Lifecycle Integrity Check...");

    // Get all episodes
    const { data: episodes, error: episodesError } = await supabase
      .from("episodes")
      .select("*");

    if (episodesError) {
      throw new Error(`Failed to fetch episodes: ${episodesError.message}`);
    }

    console.log(`Found ${episodes?.length || 0} episodes to check`);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

    // Get existing active issues to avoid duplicates
    const { data: existingIssues } = await supabase
      .from("episode_integrity_issues")
      .select("episode_id, issue_type")
      .eq("is_active", true);

    const existingIssueSet = new Set(
      (existingIssues || []).map((i) => `${i.episode_id}-${i.issue_type}`)
    );

    // Get all outcome scores for baseline check
    const { data: outcomeScores } = await supabase
      .from("outcome_scores")
      .select("episode_id, score_type");

    const episodesWithBaseline = new Set(
      (outcomeScores || [])
        .filter((s) => s.score_type === "baseline")
        .map((s) => s.episode_id)
    );

    const episodesWithDischarge = new Set(
      (outcomeScores || [])
        .filter((s) => s.score_type === "discharge")
        .map((s) => s.episode_id)
    );

    // Check 1: Missing Baseline (active episodes > 7 days without baseline)
    console.log("Checking for missing baseline notes...");
    for (const episode of episodes || []) {
      const isActive = !episode.discharge_date && 
        episode.current_status !== "CLOSED" && 
        episode.current_status !== "DISCHARGED";
      
      const createdAt = new Date(episode.created_at);
      const isOlderThan7Days = createdAt < sevenDaysAgo;

      if (isActive && isOlderThan7Days && !episodesWithBaseline.has(episode.id)) {
        const issueKey = `${episode.id}-missing_baseline`;
        if (!existingIssueSet.has(issueKey)) {
          issues.push({
            episode_id: episode.id,
            patient_name: episode.patient_name,
            clinician_id: episode.user_id,
            clinic_id: episode.clinic_id,
            issue_type: "missing_baseline",
            issue_details: `Active episode created ${Math.floor((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000))} days ago with no baseline outcome measure recorded.`,
          });
          issuesByType.missing_baseline++;
        }
      }
    }

    // Check 2: Missing Discharge Note (closed episodes without discharge score)
    console.log("Checking for missing discharge documentation...");
    for (const episode of episodes || []) {
      const isClosed = episode.discharge_date || 
        episode.current_status === "CLOSED" || 
        episode.current_status === "DISCHARGED";

      if (isClosed && !episodesWithDischarge.has(episode.id)) {
        const issueKey = `${episode.id}-missing_discharge`;
        if (!existingIssueSet.has(issueKey)) {
          issues.push({
            episode_id: episode.id,
            patient_name: episode.patient_name,
            clinician_id: episode.user_id,
            clinic_id: episode.clinic_id,
            issue_type: "missing_discharge",
            issue_details: `Closed/discharged episode with no discharge outcome measure recorded.`,
          });
          issuesByType.missing_discharge++;
        }
      }
    }

    // Check 3: Stale Episodes (active > 60 days)
    console.log("Checking for stale episodes...");
    for (const episode of episodes || []) {
      const isActive = !episode.discharge_date && 
        episode.current_status !== "CLOSED" && 
        episode.current_status !== "DISCHARGED";
      
      const createdAt = new Date(episode.created_at);
      const isOlderThan60Days = createdAt < sixtyDaysAgo;

      if (isActive && isOlderThan60Days) {
        const issueKey = `${episode.id}-stale_episode`;
        if (!existingIssueSet.has(issueKey)) {
          const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
          issues.push({
            episode_id: episode.id,
            patient_name: episode.patient_name,
            clinician_id: episode.user_id,
            clinic_id: episode.clinic_id,
            issue_type: "stale_episode",
            issue_details: `Active episode has been open for ${daysSinceCreation} days. Review for discharge or status correction.`,
          });
          issuesByType.stale_episode++;
        }
      }
    }

    // Check 4: Potential Duplicates (same patient, same region, within 14 days)
    console.log("Checking for potential duplicate episodes...");
    const patientEpisodes: Record<string, typeof episodes> = {};
    
    for (const episode of episodes || []) {
      const key = `${episode.patient_name.toLowerCase().trim()}-${episode.region}`;
      if (!patientEpisodes[key]) {
        patientEpisodes[key] = [];
      }
      patientEpisodes[key].push(episode);
    }

    for (const [key, patientEps] of Object.entries(patientEpisodes)) {
      if (patientEps.length > 1) {
        // Sort by created_at
        patientEps.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        for (let i = 0; i < patientEps.length - 1; i++) {
          const ep1 = patientEps[i];
          const ep2 = patientEps[i + 1];
          const timeDiff = new Date(ep2.created_at).getTime() - new Date(ep1.created_at).getTime();
          
          if (timeDiff < fourteenDaysMs) {
            // Check both episodes for existing issues
            const issueKey1 = `${ep1.id}-duplicate_episode`;
            const issueKey2 = `${ep2.id}-duplicate_episode`;
            
            if (!existingIssueSet.has(issueKey2)) {
              issues.push({
                episode_id: ep2.id,
                patient_name: ep2.patient_name,
                clinician_id: ep2.user_id,
                clinic_id: ep2.clinic_id,
                issue_type: "duplicate_episode",
                issue_details: `Potential duplicate: Same patient (${ep2.patient_name}) and region (${ep2.region}) as episode ${ep1.id}, created ${Math.floor(timeDiff / (24 * 60 * 60 * 1000))} days apart.`,
              });
              issuesByType.duplicate_episode++;
            }
          }
        }
      }
    }

    // Insert new issues
    if (issues.length > 0) {
      console.log(`Inserting ${issues.length} new issues...`);
      const { error: insertError } = await supabase
        .from("episode_integrity_issues")
        .insert(issues);

      if (insertError) {
        console.error("Failed to insert issues:", insertError);
        throw new Error(`Failed to insert issues: ${insertError.message}`);
      }
    }

    // Get admin emails for notification
    const { data: admins } = await supabase
      .from("user_roles")
      .select("profiles!inner(email, full_name)")
      .eq("role", "admin");

    const adminEmails = (admins || [])
      .map((a: any) => a.profiles?.email)
      .filter(Boolean);

    console.log(`Found ${adminEmails.length} admin emails for notification`);

    // Send summary email
    let emailSent = false;
    if (resendApiKey && adminEmails.length > 0) {
      try {
        const resend = new Resend(resendApiKey);
        const totalIssues = Object.values(issuesByType).reduce((a, b) => a + b, 0);
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Episode Lifecycle Integrity Report</h1>
            <p style="color: #6b7280;">Weekly automated check completed on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div style="background-color: ${totalIssues > 0 ? '#fef3c7' : '#dcfce7'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: ${totalIssues > 0 ? '#92400e' : '#166534'}; margin-top: 0;">
                ${totalIssues > 0 ? `⚠️ ${totalIssues} Issues Found` : '✅ No New Issues Found'}
              </h2>
              
              ${totalIssues > 0 ? `
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Missing Baseline</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${issuesByType.missing_baseline}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Missing Discharge</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${issuesByType.missing_discharge}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Stale Episodes (&gt;60 days)</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${issuesByType.stale_episode}</td>
                </tr>
                <tr>
                  <td style="padding: 8px;"><strong>Potential Duplicates</strong></td>
                  <td style="padding: 8px; text-align: right;">${issuesByType.duplicate_episode}</td>
                </tr>
              </table>
              ` : '<p>All episodes passed integrity checks.</p>'}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/admin/episode-integrity" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Full Report
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
              This is an automated report from PPC Outcome Registry. 
              Issues require manual review and resolution.
            </p>
          </div>
        `;

        await resend.emails.send({
          from: "PPC Outcome Registry <onboarding@resend.dev>",
          to: adminEmails,
          subject: `PPC Episode Lifecycle Integrity Report - ${totalIssues > 0 ? `${totalIssues} Issues Found` : 'All Clear'}`,
          html: emailHtml,
        });

        emailSent = true;
        console.log("Summary email sent successfully");
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }

    // Update check run record
    const totalIssues = Object.values(issuesByType).reduce((a, b) => a + b, 0);
    await supabase
      .from("episode_integrity_check_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        issues_found: totalIssues,
        issues_by_type: issuesByType,
        email_sent: emailSent,
        email_recipients: emailSent ? adminEmails : [],
      })
      .eq("id", runId);

    console.log(`Episode Lifecycle Integrity Check completed. Found ${totalIssues} new issues.`);

    return new Response(
      JSON.stringify({
        success: true,
        runId,
        issuesFound: totalIssues,
        issuesByType,
        emailSent,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in episode lifecycle integrity check:", error);
    
    // Update check run with error
    await supabase
      .from("episode_integrity_check_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: error.message,
      })
      .eq("id", runId);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
