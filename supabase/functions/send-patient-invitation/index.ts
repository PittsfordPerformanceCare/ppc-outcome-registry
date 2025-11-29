import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  episodeId: string;
  patientEmail: string;
  patientPhone?: string;
  patientName: string;
  clinicName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { episodeId, patientEmail, patientPhone, patientName, clinicName }: InvitationRequest = 
      await req.json();

    console.log("Generating invitation for episode:", episodeId);

    // Generate secure invitation code (8 characters)
    const invitationCode = generateInvitationCode();

    // Get episode details
    const { data: episode, error: episodeError } = await supabase
      .from("episodes")
      .select("patient_name, region, clinician")
      .eq("id", episodeId)
      .single();

    if (episodeError) {
      throw new Error(`Episode not found: ${episodeError.message}`);
    }

    // Create or find patient account by email
    const { data: existingAccount, error: findAccountError } = await supabase
      .from("patient_accounts")
      .select("id, email, full_name, phone")
      .eq("email", patientEmail)
      .maybeSingle();

    if (findAccountError) {
      console.error("Error looking up patient account:", findAccountError);
      throw new Error(`Failed to look up patient account: ${findAccountError.message}`);
    }

    let patientAccount = existingAccount;

    if (!patientAccount) {
      const newPatientId = crypto.randomUUID();
      const { data: insertedAccount, error: insertAccountError } = await supabase
        .from("patient_accounts")
        .insert({
          id: newPatientId,
          email: patientEmail,
          phone: patientPhone,
          full_name: patientName,
        })
        .select()
        .single();

      if (insertAccountError) {
        console.error("Error creating patient account:", insertAccountError);
        throw new Error(`Failed to create patient account: ${insertAccountError.message}`);
      }

      patientAccount = insertedAccount;
    }

    if (!patientAccount) {
      throw new Error("Patient account could not be created or found.");
    }

    // Check if patient already has access to this episode
    const { data: existingAccess, error: existingAccessError } = await supabase
      .from("patient_episode_access")
      .select("id, invitation_code")
      .eq("patient_id", patientAccount.id)
      .eq("episode_id", episodeId)
      .maybeSingle();

    if (existingAccessError && existingAccessError.code !== "PGRST116") {
      // PGRST116 = no rows found for maybeSingle; anything else is a real error
      console.error("Error looking up existing episode access:", existingAccessError);
      throw new Error(`Failed to look up existing episode access: ${existingAccessError.message}`);
    }

    let effectiveInvitationCode = invitationCode;

    if (existingAccess) {
      // Update existing access with a fresh invitation code and reactivate access
      const { error: updateAccessError } = await supabase
        .from("patient_episode_access")
        .update({
          invitation_code: invitationCode,
          is_active: true,
          code_used_at: null,
        })
        .eq("id", existingAccess.id);

      if (updateAccessError) {
        console.error("Error updating existing episode access:", updateAccessError);
        throw new Error(`Failed to update existing episode access: ${updateAccessError.message}`);
      }
    } else {
      // Create episode access with invitation code
      const { error: accessError } = await supabase
        .from("patient_episode_access")
        .insert({
          patient_id: patientAccount.id,
          episode_id: episodeId,
          invitation_code: invitationCode,
          granted_by: user.id,
        });

      if (accessError) {
        console.error("Error creating episode access:", accessError);
        throw new Error(`Failed to create episode access: ${accessError.message}`);
      }
    }

    // Send invitation email
    const appUrl = Deno.env.get("APP_URL") || "https://your-app-url.com";
    const invitationLink = `${appUrl}/patient-auth?code=${invitationCode}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0EA5E9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .code-box { background: white; border: 2px dashed #0EA5E9; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
            .code { font-size: 32px; font-weight: bold; color: #0EA5E9; letter-spacing: 4px; }
            .button { display: inline-block; background: #0EA5E9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Access Your Rehabilitative Care Records</h1>
            </div>
            <div class="content">
              <h2>Hello ${patientName}!</h2>
              <p>You've been invited to access your rehabilitative care episode records${clinicName ? ` from ${clinicName}` : ''}.</p>
              
              <p><strong>Episode Details:</strong></p>
              <ul>
                <li><strong>Patient:</strong> ${episode.patient_name}</li>
                <li><strong>Region:</strong> ${episode.region}</li>
                <li><strong>Clinician:</strong> ${episode.clinician}</li>
              </ul>

              <div class="code-box">
                <p style="margin-top: 0;">Your Access Code:</p>
                <div class="code">${invitationCode}</div>
              </div>

              <p style="text-align: center;">
                <a href="${invitationLink}" class="button">Access Your Records</a>
              </p>

              <p style="font-size: 14px; color: #666;">
                Or visit the patient portal and enter your access code: <strong>${invitationCode}</strong>
              </p>

              <div class="footer">
                <p>This invitation code will remain valid as long as you have access to this episode.</p>
                <p>If you didn't expect this email, please contact your healthcare provider.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: clinicName ? `${clinicName} <onboarding@resend.dev>` : "Rehabilitative Care Portal <onboarding@resend.dev>",
      to: [patientEmail],
      subject: "Access Your Rehabilitative Care Records",
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("Invitation sent successfully:", invitationCode);

    return new Response(
      JSON.stringify({
        success: true,
        invitationCode,
        patientId: patientAccount.id,
        emailSent: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-patient-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateInvitationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous characters
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

serve(handler);
