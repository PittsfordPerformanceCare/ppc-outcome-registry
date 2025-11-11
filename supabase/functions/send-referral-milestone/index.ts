import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MilestoneRequest {
  referrerId: string;
  milestoneCount: number;
}

const getMilestoneDetails = (count: number) => {
  const milestones: Record<number, { title: string; badge: string; message: string; color: string }> = {
    3: {
      title: "Community Builder",
      badge: "🌟",
      message: "You've helped three people discover quality care! Your recommendations are making a real difference in our community.",
      color: "#0EA5E9"
    },
    5: {
      title: "Trusted Ambassador",
      badge: "⭐",
      message: "Five successful referrals! You're not just a patient—you're a valued partner in helping others find the care they need.",
      color: "#8B5CF6"
    },
    10: {
      title: "VIP Care Advocate",
      badge: "💎",
      message: "Ten referrals is extraordinary! Your trust and support have helped an entire community of people start their recovery journeys. You're making a lasting impact.",
      color: "#F59E0B"
    }
  };
  return milestones[count] || milestones[3];
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { referrerId, milestoneCount }: MilestoneRequest = await req.json();

    console.log(`Sending milestone ${milestoneCount} celebration to:`, referrerId);

    // Get referrer details
    const { data: referrer, error: referrerError } = await supabase
      .from("patient_accounts")
      .select("full_name, email")
      .eq("id", referrerId)
      .single();

    if (referrerError || !referrer) {
      throw new Error("Referrer not found");
    }

    // Get clinic settings
    const { data: settings } = await supabase
      .from("clinic_settings")
      .select("clinic_name, phone")
      .single();

    const clinicName = settings?.clinic_name || "Our Clinic";
    const clinicPhone = settings?.phone || "(555) 123-4567";
    
    const milestone = getMilestoneDetails(milestoneCount);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, ${milestone.color} 0%, ${milestone.color}dd 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; position: relative; overflow: hidden; }
            .badge { font-size: 64px; margin-bottom: 10px; animation: bounce 1s ease-in-out; }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px; }
            .celebration-box { background: linear-gradient(135deg, ${milestone.color}15 0%, ${milestone.color}08 100%); border: 2px solid ${milestone.color}40; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; }
            .stats-box { display: inline-block; background: white; padding: 20px 30px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .impact { background: white; border-left: 4px solid ${milestone.color}; padding: 20px; margin: 20px 0; border-radius: 6px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="badge">${milestone.badge}</div>
              <h1 style="margin: 10px 0 5px 0; font-size: 32px;">Congratulations!</h1>
              <p style="margin: 0; font-size: 18px; opacity: 0.95;">${referrer.full_name}</p>
            </div>
            
            <div class="content">
              <div class="celebration-box">
                <h2 style="color: ${milestone.color}; margin-top: 0; font-size: 28px;">${milestone.title}</h2>
                <div class="stats-box">
                  <div style="font-size: 48px; font-weight: bold; color: ${milestone.color}; line-height: 1;">${milestoneCount}</div>
                  <div style="font-size: 14px; color: #666; margin-top: 5px;">Successful Referrals</div>
                </div>
                <p style="font-size: 16px; color: #555; margin: 20px 0 0 0;">
                  ${milestone.message}
                </p>
              </div>

              <div class="impact">
                <h3 style="color: #1f2937; margin-top: 0;">Your Impact</h3>
                <p style="margin: 0; color: #4b5563;">
                  Thanks to your recommendations, <strong>${milestoneCount} people</strong> have discovered quality physical therapy care at ${clinicName}. Each person you've referred is now on their own recovery journey, and that's something truly special.
                </p>
              </div>

              <div style="background: linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 100%); border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
                <p style="margin: 0; color: #0369A1; font-size: 15px; line-height: 1.6;">
                  <strong>You're part of something bigger</strong><br>
                  Every referral helps us grow our community of care. We couldn't do this without patients like you who believe in what we do.
                </p>
              </div>

              ${milestoneCount === 10 ? `
                <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #F59E0B; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
                  <h3 style="color: #92400E; margin-top: 0;">🎉 Elite Status Unlocked!</h3>
                  <p style="margin: 0; color: #78350F; font-size: 15px;">
                    You've reached our highest referral milestone. As a VIP Care Advocate, you've made an extraordinary impact on our community. We're honored to have you as part of our family.
                  </p>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666; font-style: italic; font-size: 16px; margin: 0;">
                  "Thank you for being an incredible advocate for ${clinicName}"
                </p>
              </div>

              <div class="footer">
                <p>With deepest gratitude,<br><strong>The ${clinicName} Team</strong></p>
                <p>${clinicPhone} • ${clinicName}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${clinicName} <onboarding@resend.dev>`,
      to: [referrer.email],
      subject: `${milestone.badge} You've Reached a Special Milestone!`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("Milestone celebration email sent successfully");

    return new Response(
      JSON.stringify({
        success: true,
        emailSent: true,
        milestone: milestoneCount,
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
    console.error("Error in send-referral-milestone:", error);
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
