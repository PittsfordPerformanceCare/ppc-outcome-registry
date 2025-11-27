import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  examId: string;
  patientEmail: string;
  patientName: string;
  clinicianName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { examId, patientEmail, patientName, clinicianName }: EmailRequest = await req.json();

    console.log("Sending neuro exam summary for exam:", examId);

    // Fetch exam data
    const { data: exam, error: examError } = await supabase
      .from("neurologic_exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examError) throw examError;

    // Get clinic settings
    const { data: settings } = await supabase
      .from("clinic_settings")
      .select("clinic_name, phone, email, address")
      .single();

    const clinicName = settings?.clinic_name || "Our Clinic";
    const clinicPhone = settings?.phone || "(555) 123-4567";
    const clinicEmail = settings?.email || "info@clinic.com";

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
    };

    const getStatusBadge = (value?: string) => {
      if (!value) return "";
      
      const lowerValue = value.toLowerCase();
      if (lowerValue.includes("normal") || lowerValue.includes("within") || lowerValue.includes("intact")) {
        return '<span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">✓ Normal</span>';
      }
      if (lowerValue.includes("impaired") || lowerValue.includes("abnormal") || lowerValue.includes("limited")) {
        return '<span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">⚠ Needs Attention</span>';
      }
      return '<span style="background: #94a3b8; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">See Details</span>';
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 650px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
            .section { margin: 25px 0; }
            .section-title { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #0EA5E9; }
            .finding-card { background: #f0f9ff; padding: 16px; margin: 12px 0; border-radius: 8px; border-left: 4px solid #0EA5E9; }
            .finding-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
            .finding-title { font-weight: 600; color: #0369a1; }
            .finding-detail { font-size: 14px; color: #475569; margin: 4px 0; }
            .info-box { background: linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0EA5E9; }
            .summary-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            .meta-info { font-size: 14px; color: #64748b; margin: 8px 0; }
            .print-note { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🧠 Your Neurologic Examination Summary</h1>
            </div>
            
            <div class="content">
              <div class="meta-info">
                <p><strong>Patient:</strong> ${patientName}</p>
                <p><strong>Exam Date:</strong> ${formatDate(exam.exam_date)} ${exam.exam_time ? `at ${exam.exam_time}` : ""}</p>
                ${clinicianName ? `<p><strong>Clinician:</strong> ${clinicianName}</p>` : ""}
                <p><strong>Exam Type:</strong> ${exam.exam_type === "baseline" ? "Initial Assessment" : "Follow-up Assessment"}</p>
              </div>

              ${exam.clinical_history ? `
                <div class="section">
                  <div class="section-title">Clinical History</div>
                  <p style="color: #475569;">${exam.clinical_history}</p>
                </div>
              ` : ""}

              <div class="section">
                <div class="section-title">Key Findings</div>

                ${(exam.vestibular_rombergs || exam.vestibular_vor) ? `
                  <div class="finding-card">
                    <div class="finding-header">
                      <div class="finding-title">⚖️ Balance & Vestibular System</div>
                      ${getStatusBadge(exam.vestibular_rombergs || exam.vestibular_vor)}
                    </div>
                    ${exam.vestibular_rombergs ? `<div class="finding-detail"><strong>Balance Test:</strong> ${exam.vestibular_rombergs}</div>` : ""}
                    ${exam.vestibular_vor ? `<div class="finding-detail"><strong>Eye-Head Coordination:</strong> ${exam.vestibular_vor}</div>` : ""}
                  </div>
                ` : ""}

                ${(exam.visual_pursuits || exam.visual_convergence) ? `
                  <div class="finding-card">
                    <div class="finding-header">
                      <div class="finding-title">👁️ Visual System</div>
                      ${getStatusBadge(exam.visual_pursuits || exam.visual_convergence)}
                    </div>
                    ${exam.visual_pursuits ? `<div class="finding-detail"><strong>Eye Tracking:</strong> ${exam.visual_pursuits}</div>` : ""}
                    ${exam.visual_convergence ? `<div class="finding-detail"><strong>Near Focus:</strong> ${exam.visual_convergence}</div>` : ""}
                  </div>
                ` : ""}

                ${(exam.neuro_finger_to_nose_left || exam.neuro_finger_to_nose_right) ? `
                  <div class="finding-card">
                    <div class="finding-header">
                      <div class="finding-title">🎯 Coordination</div>
                      ${getStatusBadge(exam.neuro_finger_to_nose_left || exam.neuro_finger_to_nose_right)}
                    </div>
                    ${exam.neuro_finger_to_nose_left ? `<div class="finding-detail"><strong>Left Side:</strong> ${exam.neuro_finger_to_nose_left}</div>` : ""}
                    ${exam.neuro_finger_to_nose_right ? `<div class="finding-detail"><strong>Right Side:</strong> ${exam.neuro_finger_to_nose_right}</div>` : ""}
                  </div>
                ` : ""}

                ${(exam.reflex_bicep_left || exam.reflex_patellar_left) ? `
                  <div class="finding-card">
                    <div class="finding-header">
                      <div class="finding-title">⚡ Reflexes</div>
                      ${getStatusBadge(exam.reflex_bicep_left || exam.reflex_patellar_left)}
                    </div>
                    ${exam.reflex_bicep_left ? `<div class="finding-detail"><strong>Upper Body:</strong> ${exam.reflex_bicep_left}</div>` : ""}
                    ${exam.reflex_patellar_left ? `<div class="finding-detail"><strong>Lower Body:</strong> ${exam.reflex_patellar_left}</div>` : ""}
                  </div>
                ` : ""}
              </div>

              ${exam.overall_notes ? `
                <div class="summary-box">
                  <div style="font-weight: 600; color: #92400e; margin-bottom: 10px;">📋 Summary & Recommendations</div>
                  <p style="margin: 0; color: #78350f; white-space: pre-wrap;">${exam.overall_notes}</p>
                </div>
              ` : ""}

              <div class="info-box">
                <h3 style="margin-top: 0; color: #0369a1;">What This Means For You</h3>
                <p style="margin: 0; color: #0c4a6e;">
                  This examination helps us understand how your nervous system is functioning. 
                  The results guide your treatment plan and help us track your progress. 
                  Your clinician will discuss any findings that need attention and create a 
                  personalized care plan for you.
                </p>
              </div>

              <div class="print-note">
                <p style="margin: 0;">💡 <strong>Tip:</strong> You can print this email for your records or bring it to your next appointment.</p>
              </div>

              <div class="footer">
                <p><strong>${clinicName}</strong></p>
                ${settings?.address ? `<p>${settings.address}</p>` : ""}
                <p>📞 ${clinicPhone} | 📧 ${clinicEmail}</p>
                <p style="margin-top: 15px;">If you have any questions about your examination results, please contact your clinician.</p>
                <p style="color: #9ca3af; font-size: 11px; margin-top: 15px;">Exam ID: ${examId}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${clinicName} <onboarding@resend.dev>`,
      to: [patientEmail],
      subject: `Your Neurologic Examination Summary - ${formatDate(exam.exam_date)}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("Neuro exam summary sent successfully");

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-neuro-exam-summary:", error);
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
