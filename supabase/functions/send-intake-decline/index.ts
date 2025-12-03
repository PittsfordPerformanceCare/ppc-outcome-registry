import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const { intakeId, patientName, patientEmail, declineReason } = await req.json();

    console.log("Processing intake decline:", { intakeId, patientName, patientEmail });

    if (patientEmail) {
      await resend.emails.send({
        from: "Pittsford Performance Care <notifications@resend.dev>",
        to: [patientEmail],
        subject: "Update on Your Intake Submission",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0a1628;">Thank You for Your Interest, ${patientName || ""}</h1>
            <p>After carefully reviewing your intake form, we've determined that your needs may be better served by a different specialist.</p>
            
            ${declineReason ? `
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Our Recommendation</h3>
              <p style="color: #4b5563;">${declineReason}</p>
            </div>
            ` : ''}
            
            <p>We want to make sure you receive the most appropriate care for your situation. If you have any questions about our recommendation or would like to discuss your case further, please don't hesitate to reach out.</p>
            
            <p style="margin-top: 30px;">We wish you all the best in your health journey.</p>
            <p>— Pittsford Performance Care Team</p>
          </div>
        `,
      });
      console.log("Decline email sent to:", patientEmail);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-intake-decline:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});