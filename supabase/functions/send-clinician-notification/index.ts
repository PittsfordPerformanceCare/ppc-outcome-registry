import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClinicianNotificationRequest {
  clinicianId?: string;
  clinicianName?: string;
  clinicianEmail?: string;
  messageId?: string;
  messageType: "message" | "callback_request" | "new_prospect" | "new_assessment_lead";
  patientName?: string;
  subject: string;
  message?: string;
  episodeInfo?: string;
  // New prospect specific fields
  prospectName?: string;
  prospectEmail?: string;
  prospectPhone?: string;
  chiefComplaint?: string;
  referralSource?: string;
  inquiryId?: string;
  clinicName?: string;
  // Assessment lead specific fields
  assessmentType?: string;
  severityScore?: number;
  severityLevel?: string;
  symptomSummary?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ClinicianNotificationRequest = await req.json();
    const {
      clinicianName,
      clinicianEmail,
      messageType,
      patientName,
      subject,
      message,
      episodeInfo,
      prospectName,
      prospectEmail,
      prospectPhone,
      chiefComplaint,
      referralSource,
      inquiryId,
      clinicName,
      assessmentType,
      severityScore,
      severityLevel,
      symptomSummary,
    } = requestData;

    console.log("Sending clinician notification:", {
      messageType,
      clinicianEmail,
      prospectName,
    });

    // Handle new prospect notifications - send to all clinicians
    if (messageType === "new_prospect") {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get all clinician emails with notification preferences
      const { data: clinicians, error: cliniciansError } = await supabase
        .from("clinician_notification_preferences")
        .select("notification_email, profiles!inner(email, full_name)")
        .eq("email_enabled", true);

      if (cliniciansError) {
        console.error("Error fetching clinicians:", cliniciansError);
        throw new Error("Failed to fetch clinician list");
      }

      const emailPromises = (clinicians || []).map(async (clinician: any) => {
        const email = clinician.notification_email || clinician.profiles.email;
        const name = clinician.profiles.full_name || "Clinician";

        const prospectEmailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  color: white;
                  padding: 30px;
                  border-radius: 10px 10px 0 0;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                }
                .content {
                  background: #f8f9fa;
                  padding: 30px;
                  border-radius: 0 0 10px 10px;
                }
                .badge {
                  display: inline-block;
                  padding: 8px 16px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 700;
                  background: #dcfce7;
                  color: #166534;
                  margin-bottom: 20px;
                }
                .prospect-box {
                  background: white;
                  border-left: 4px solid #10b981;
                  padding: 20px;
                  margin: 20px 0;
                  border-radius: 5px;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 12px 0;
                  padding: 12px;
                  background: #f9fafb;
                  border-radius: 5px;
                }
                .info-label {
                  font-weight: 600;
                  color: #6b7280;
                }
                .info-value {
                  color: #111827;
                  font-weight: 500;
                }
                .complaint-box {
                  background: #fef3c7;
                  border-left: 4px solid #f59e0b;
                  padding: 15px;
                  margin: 15px 0;
                  border-radius: 5px;
                }
                .button {
                  display: inline-block;
                  padding: 14px 32px;
                  background: #10b981;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 600;
                  margin-top: 20px;
                }
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #ddd;
                  color: #666;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🎯 New Lead Awaiting Approval</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                
                <span class="badge">PROSPECT – AWAITING REVIEW</span>
                
                <p style="font-size: 16px; color: #059669; font-weight: 600;">
                  A new prospect has submitted a referral inquiry through your QR code.
                </p>
                
                <div class="prospect-box">
                  <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${prospectName}</span>
                  </div>
                  
                  ${prospectEmail ? `
                  <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${prospectEmail}</span>
                  </div>
                  ` : ""}
                  
                  ${prospectPhone ? `
                  <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${prospectPhone}</span>
                  </div>
                  ` : ""}
                  
                  ${referralSource ? `
                  <div class="info-row">
                    <span class="info-label">Referral Source:</span>
                    <span class="info-value">${referralSource}</span>
                  </div>
                  ` : ""}
                </div>
                
                ${chiefComplaint ? `
                <div class="complaint-box">
                  <strong style="color: #92400e;">Chief Complaint:</strong>
                  <p style="margin: 8px 0 0 0; color: #78350f;">${chiefComplaint}</p>
                </div>
                ` : ""}
                
                <p style="margin-top: 20px; color: #374151;">
                  <strong>Next Steps:</strong><br>
                  • Review the prospect's information<br>
                  • Determine if they're a good fit for PPC<br>
                  • Send approval and intake link, or decline with explanation
                </p>
                
                <a href="${Deno.env.get("APP_URL") || "https://app.example.com"}/referral-inbox" class="button">
                  Review Prospect in Referral Inbox →
                </a>
                
                <div class="footer">
                  <p>This lead is now tracked in your PPC Outcome Registry.</p>
                  <p>No referrals will be lost – every inquiry is recorded from minute 1.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        return resend.emails.send({
          from: "PPC Outcome Registry <notifications@resend.dev>",
          to: [email],
          subject: `🎯 New Lead Awaiting Approval - ${prospectName}`,
          html: prospectEmailHtml,
        });
      });

      await Promise.all(emailPromises);

      console.log(`Prospect notification sent to ${emailPromises.length} clinicians`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          recipients: emailPromises.length 
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Handle new assessment lead notifications - send to all clinicians
    if (messageType === "new_assessment_lead") {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get all clinician emails with notification preferences
      const { data: clinicians, error: cliniciansError } = await supabase
        .from("clinician_notification_preferences")
        .select("notification_email, profiles!inner(email, full_name)")
        .eq("email_enabled", true);

      if (cliniciansError) {
        console.error("Error fetching clinicians:", cliniciansError);
        throw new Error("Failed to fetch clinician list");
      }

      const severityColor = severityLevel === "high" ? "#dc2626" : severityLevel === "moderate" ? "#f59e0b" : "#10b981";
      const severityBg = severityLevel === "high" ? "#fef2f2" : severityLevel === "moderate" ? "#fffbeb" : "#f0fdf4";

      const emailPromises = (clinicians || []).map(async (clinician: any) => {
        const email = clinician.notification_email || clinician.profiles.email;
        const name = clinician.profiles.full_name || "Clinician";

        const assessmentEmailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                  color: white;
                  padding: 30px;
                  border-radius: 10px 10px 0 0;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                }
                .content {
                  background: #f8f9fa;
                  padding: 30px;
                  border-radius: 0 0 10px 10px;
                }
                .severity-badge {
                  display: inline-block;
                  padding: 8px 16px;
                  border-radius: 20px;
                  font-size: 14px;
                  font-weight: 700;
                  background: ${severityBg};
                  color: ${severityColor};
                  margin-bottom: 20px;
                  text-transform: uppercase;
                }
                .assessment-box {
                  background: white;
                  border-left: 4px solid #3b82f6;
                  padding: 20px;
                  margin: 20px 0;
                  border-radius: 5px;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 12px 0;
                  padding: 12px;
                  background: #f9fafb;
                  border-radius: 5px;
                }
                .info-label {
                  font-weight: 600;
                  color: #6b7280;
                }
                .info-value {
                  color: #111827;
                  font-weight: 500;
                }
                .symptoms-box {
                  background: #fef3c7;
                  border-left: 4px solid #f59e0b;
                  padding: 15px;
                  margin: 15px 0;
                  border-radius: 5px;
                }
                .button {
                  display: inline-block;
                  padding: 14px 32px;
                  background: #3b82f6;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 600;
                  margin-top: 20px;
                }
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #ddd;
                  color: #666;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🧠 New ${assessmentType?.charAt(0).toUpperCase()}${assessmentType?.slice(1) || 'Self'} Assessment</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                
                <span class="severity-badge">${severityLevel} Severity - Score: ${severityScore}/20</span>
                
                <p style="font-size: 16px; color: #1d4ed8; font-weight: 600;">
                  A patient has completed a self-assessment and requested an evaluation.
                </p>
                
                <div class="assessment-box">
                  <div class="info-row">
                    <span class="info-label">Assessment Type:</span>
                    <span class="info-value">${assessmentType?.charAt(0).toUpperCase()}${assessmentType?.slice(1) || 'Concussion'}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Severity Score:</span>
                    <span class="info-value" style="color: ${severityColor}; font-weight: 700;">${severityScore}/20</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Classification:</span>
                    <span class="info-value" style="color: ${severityColor};">${severityLevel?.charAt(0).toUpperCase()}${severityLevel?.slice(1) || ''}</span>
                  </div>
                </div>
                
                ${symptomSummary ? `
                <div class="symptoms-box">
                  <strong style="color: #92400e;">Symptom Summary:</strong>
                  <p style="margin: 8px 0 0 0; color: #78350f;">${symptomSummary}</p>
                </div>
                ` : ""}
                
                <p style="margin-top: 20px; color: #374151;">
                  <strong>What This Means:</strong><br>
                  The patient completed a self-assessment indicating ${severityLevel} severity symptoms.
                  They have requested an evaluation and will be prompted to complete an intake form.
                </p>
                
                <a href="${Deno.env.get("APP_URL") || "https://app.example.com"}/admin/leads" class="button">
                  View in Lead Management →
                </a>
                
                <div class="footer">
                  <p>This assessment lead is now tracked in your PPC Outcome Registry.</p>
                  <p>The patient will be guided through the intake process.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        return resend.emails.send({
          from: "PPC Outcome Registry <notifications@resend.dev>",
          to: [email],
          subject: `🧠 New ${assessmentType?.charAt(0).toUpperCase()}${assessmentType?.slice(1) || 'Self'} Assessment - ${severityLevel?.toUpperCase()} Severity`,
          html: assessmentEmailHtml,
        });
      });

      await Promise.all(emailPromises);

      console.log(`Assessment lead notification sent to ${emailPromises.length} clinicians`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          recipients: emailPromises.length 
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Handle existing message and callback request notifications
    const isCallbackRequest = messageType === "callback_request";
    const emailSubject = isCallbackRequest
      ? `🔔 New Callback Request from ${patientName}`
      : `📨 New Message from ${patientName}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 15px;
            }
            .badge-message {
              background: #e3f2fd;
              color: #1976d2;
            }
            .badge-callback {
              background: #fff3e0;
              color: #f57c00;
            }
            .message-box {
              background: white;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .message-box h3 {
              margin: 0 0 10px 0;
              color: #667eea;
              font-size: 16px;
            }
            .message-box p {
              margin: 5px 0;
              color: #666;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 10px;
              background: white;
              border-radius: 5px;
            }
            .info-label {
              font-weight: 600;
              color: #666;
            }
            .info-value {
              color: #333;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: 600;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${isCallbackRequest ? "🔔 New Callback Request" : "📨 New Patient Message"}</h1>
          </div>
          <div class="content">
            <p>Hi ${clinicianName},</p>
            
            <span class="badge ${isCallbackRequest ? "badge-callback" : "badge-message"}">
              ${isCallbackRequest ? "CALLBACK REQUEST" : "NEW MESSAGE"}
            </span>
            
            <div class="info-row">
              <span class="info-label">Patient:</span>
              <span class="info-value">${patientName}</span>
            </div>
            
            ${episodeInfo ? `
            <div class="info-row">
              <span class="info-label">Episode:</span>
              <span class="info-value">${episodeInfo}</span>
            </div>
            ` : ""}
            
            <div class="message-box">
              <h3>${subject}</h3>
              <p>${message}</p>
            </div>
            
            ${isCallbackRequest ? `
            <p style="color: #f57c00; font-weight: 600;">
              ⚡ This patient has requested a callback. Please respond as soon as possible.
            </p>
            ` : ""}
            
            <a href="${Deno.env.get("APP_URL") || "https://app.example.com"}/clinician-inbox" class="button">
              View in Clinician Inbox →
            </a>
            
            <div class="footer">
              <p>This is an automated notification from your PPC Outcome Registry.</p>
              <p>To manage your notification preferences, visit your account settings.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "PPC Outcome Registry <notifications@resend.dev>",
      to: [clinicianEmail!],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Clinician notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending clinician notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
