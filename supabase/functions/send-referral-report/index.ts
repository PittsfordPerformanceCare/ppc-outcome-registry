import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReferralReportRequest {
  scheduleId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get schedule ID from request or query all pending schedules
    const url = new URL(req.url);
    let scheduleId = url.searchParams.get("scheduleId");
    
    if (!scheduleId) {
      const body = await req.json().catch(() => ({})) as ReferralReportRequest;
      scheduleId = body.scheduleId;
    }

    console.log("Processing referral report for schedule:", scheduleId);

    // If no specific schedule, process all pending schedules
    let query = supabase
      .from("referral_report_schedules")
      .select("*")
      .eq("enabled", true)
      .lte("next_send_at", new Date().toISOString());
    
    if (scheduleId) {
      query = query.eq("id", scheduleId);
    }

    const { data: schedules, error: schedError } = await query;

    if (schedError) {
      console.error("Error fetching schedules:", schedError);
      throw schedError;
    }

    if (!schedules || schedules.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending reports to send" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const schedule of schedules) {
      try {
        console.log("Processing schedule:", schedule.id);

        // Calculate date range (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        // Get referral statistics
        const { data: referrals, error: refError } = await supabase
          .from("patient_referrals")
          .select(`
            *,
            referrer:patient_accounts!patient_referrals_referrer_patient_id_fkey(full_name, email)
          `)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        if (refError) {
          console.error("Error fetching referrals:", refError);
          throw refError;
        }

        // Calculate metrics
        const totalReferrals = referrals?.length || 0;
        const convertedReferrals = referrals?.filter(r => r.status === "converted").length || 0;
        const conversionRate = totalReferrals > 0 
          ? Math.round((convertedReferrals / totalReferrals) * 100) 
          : 0;

        // Group by referrer and calculate stats
        const referrerStats = new Map();
        referrals?.forEach(ref => {
          const referrerId = ref.referrer_patient_id;
          if (!referrerStats.has(referrerId)) {
            referrerStats.set(referrerId, {
              referrer: ref.referrer,
              total: 0,
              converted: 0,
              milestone3: ref.milestone_3_awarded_at,
              milestone5: ref.milestone_5_awarded_at,
              milestone10: ref.milestone_10_awarded_at,
            });
          }
          const stats = referrerStats.get(referrerId);
          stats.total++;
          if (ref.status === "converted") stats.converted++;
        });

        // Sort by converted referrals
        const topReferrers = Array.from(referrerStats.values())
          .sort((a, b) => b.converted - a.converted)
          .slice(0, 10);

        // Get clinic settings
        const { data: clinicSettings } = await supabase
          .from("clinic_settings")
          .select("clinic_name, phone")
          .single();

        const clinicName = clinicSettings?.clinic_name || "Physical Therapy Clinic";
        const clinicPhone = clinicSettings?.phone || "";

        // Build HTML email
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: white; padding: 30px; }
              .metric-card { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
              .metric-value { font-size: 32px; font-weight: bold; color: #667eea; margin: 10px 0; }
              .metric-label { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
              .leaderboard { margin: 30px 0; }
              .leaderboard-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center; }
              .rank { background: #667eea; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; }
              .referrer-info { flex: 1; }
              .referrer-name { font-weight: bold; margin-bottom: 5px; }
              .referrer-email { color: #666; font-size: 14px; }
              .stats { display: flex; gap: 20px; }
              .stat { text-align: center; }
              .stat-value { font-weight: bold; color: #667eea; font-size: 18px; }
              .stat-label { font-size: 12px; color: #666; }
              .milestone-badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-left: 8px; }
              .milestone-vip { background: #ffd700; color: #333; }
              .milestone-ambassador { background: #c0c0c0; color: #333; }
              .milestone-builder { background: #cd7f32; color: white; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 8px 8px; }
              .trend { color: #10b981; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📊 Monthly Referral Report</h1>
              <p style="margin: 10px 0; opacity: 0.9;">${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
            </div>
            
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Referral Performance Overview</h2>
              
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 30px 0;">
                <div class="metric-card">
                  <div class="metric-label">Total Referrals</div>
                  <div class="metric-value">${totalReferrals}</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">Converted</div>
                  <div class="metric-value">${convertedReferrals}</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">Conversion Rate</div>
                  <div class="metric-value">${conversionRate}%</div>
                </div>
              </div>

              ${topReferrers.length > 0 ? `
                <div class="leaderboard">
                  <h2 style="color: #333; margin-bottom: 20px;">🏆 Top Referrers</h2>
                  ${topReferrers.map((ref, idx) => {
                    const milestones = [];
                    if (ref.milestone10) milestones.push('<span class="milestone-badge milestone-vip">🌟 VIP Care Advocate</span>');
                    else if (ref.milestone5) milestones.push('<span class="milestone-badge milestone-ambassador">⭐ Trusted Ambassador</span>');
                    else if (ref.milestone3) milestones.push('<span class="milestone-badge milestone-builder">✨ Community Builder</span>');
                    
                    const convRate = ref.total > 0 ? Math.round((ref.converted / ref.total) * 100) : 0;
                    
                    return `
                      <div class="leaderboard-item">
                        <div class="rank">${idx + 1}</div>
                        <div class="referrer-info">
                          <div class="referrer-name">
                            ${ref.referrer?.full_name || "Unknown"}
                            ${milestones.join('')}
                          </div>
                          <div class="referrer-email">${ref.referrer?.email || ""}</div>
                        </div>
                        <div class="stats">
                          <div class="stat">
                            <div class="stat-value">${ref.converted}</div>
                            <div class="stat-label">Converted</div>
                          </div>
                          <div class="stat">
                            <div class="stat-value">${ref.total}</div>
                            <div class="stat-label">Total</div>
                          </div>
                          <div class="stat">
                            <div class="stat-value">${convRate}%</div>
                            <div class="stat-label">Rate</div>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : '<p style="text-align: center; color: #666; padding: 40px;">No referral activity in the past 30 days.</p>'}

              <div style="margin-top: 40px; padding: 20px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h3 style="color: #0369a1; margin-top: 0;">💡 Key Insights</h3>
                <ul style="color: #0c4a6e; margin: 10px 0;">
                  <li>Your referral program generated <strong>${totalReferrals} new patient leads</strong> this month</li>
                  <li>Conversion rate of <strong>${conversionRate}%</strong> ${conversionRate >= 40 ? '- Great performance! 🎉' : conversionRate >= 20 ? '- On track' : '- Room for improvement'}</li>
                  <li>${topReferrers.length > 0 ? `Top performer: <strong>${topReferrers[0]?.referrer?.full_name}</strong> with ${topReferrers[0]?.converted} conversions` : 'No top performers this period'}</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p><strong>${clinicName}</strong></p>
              ${clinicPhone ? `<p>Phone: ${clinicPhone}</p>` : ''}
              <p style="margin-top: 15px; font-size: 12px; color: #999;">
                This is an automated monthly report. To adjust your report settings, contact your administrator.
              </p>
            </div>
          </body>
          </html>
        `;

        // Send email to all recipients
        const emailPromises = schedule.recipient_emails.map((email: string) =>
          resend.emails.send({
            from: `${clinicName} <onboarding@resend.dev>`,
            to: [email],
            subject: `Monthly Referral Report - ${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
            html,
          })
        );

        await Promise.all(emailPromises);
        console.log(`Report sent to ${schedule.recipient_emails.length} recipients`);

        // Calculate next send date (next month, same day)
        const nextSend = new Date();
        nextSend.setMonth(nextSend.getMonth() + 1);
        nextSend.setDate(schedule.send_day);
        const [hours, minutes] = schedule.send_time.split(":");
        nextSend.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Update schedule
        await supabase
          .from("referral_report_schedules")
          .update({
            last_sent_at: new Date().toISOString(),
            next_send_at: nextSend.toISOString(),
          })
          .eq("id", schedule.id);

        // Log delivery
        await supabase
          .from("referral_report_deliveries")
          .insert({
            schedule_id: schedule.id,
            user_id: schedule.user_id,
            clinic_id: schedule.clinic_id,
            recipient_emails: schedule.recipient_emails,
            report_data: {
              totalReferrals,
              convertedReferrals,
              conversionRate,
              topReferrers: topReferrers.slice(0, 5).map(r => ({
                name: r.referrer?.full_name,
                converted: r.converted,
                total: r.total,
              })),
              period: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
              },
            },
            status: "sent",
          });

        results.push({ scheduleId: schedule.id, status: "sent" });
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Log failed delivery
        await supabase
          .from("referral_report_deliveries")
          .insert({
            schedule_id: schedule.id,
            user_id: schedule.user_id,
            clinic_id: schedule.clinic_id,
            recipient_emails: schedule.recipient_emails,
            status: "failed",
            error_message: errorMessage,
          });

        results.push({ 
          scheduleId: schedule.id, 
          status: "failed", 
          error: errorMessage
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-referral-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
