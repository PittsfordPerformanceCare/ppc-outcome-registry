import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClinicianNotificationRequest {
  clinicianId: string;
  clinicianName: string;
  clinicianEmail: string;
  messageId: string;
  messageType: "message" | "callback_request";
  patientName: string;
  subject: string;
  message: string;
  episodeInfo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      clinicianName,
      clinicianEmail,
      messageType,
      patientName,
      subject,
      message,
      episodeInfo,
    }: ClinicianNotificationRequest = await req.json();

    console.log("Sending clinician notification:", {
      clinicianEmail,
      messageType,
      patientName,
    });

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
            
            <a href="${Deno.env.get("SUPABASE_URL")?.replace("/rest/v1", "") || "https://app.example.com"}/clinician-inbox" class="button">
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
      to: [clinicianEmail],
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
