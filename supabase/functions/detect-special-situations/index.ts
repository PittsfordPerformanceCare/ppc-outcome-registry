import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TriggerConfig {
  type: string;
  phrases: string[];
  label: string;
}

const TRIGGER_CONFIGS: TriggerConfig[] = [
  {
    type: "referral_initiated",
    phrases: ["referral to", "referred to", "referral initiated"],
    label: "Referral Initiated"
  },
  {
    type: "new_neurologic_symptoms",
    phrases: ["new neurologic symptoms", "new neuro symptoms", "new symptoms reported"],
    label: "New Neurologic Symptoms"
  },
  {
    type: "red_flag",
    phrases: ["red flag", "concerning finding", "urgent concern"],
    label: "Red Flag"
  },
  {
    type: "emergency_or_911",
    phrases: ["emergency", "call 911", "er referral", "emergency department"],
    label: "Emergency/911"
  },
  {
    type: "provider_transition",
    phrases: ["transition of care", "provider transition", "care transferred to"],
    label: "Provider Transition"
  },
  {
    type: "change_in_plan_unexpected",
    phrases: ["plan changed due to", "unexpected change in plan"],
    label: "Unexpected Change in Plan"
  }
];

interface DetectRequest {
  episodeId: string;
  patientName: string;
  clinicianId: string;
  clinicianName?: string;
  noteContent: string;
  clinicId?: string;
}

function detectTriggers(text: string): TriggerConfig[] {
  const lowerText = text.toLowerCase();
  return TRIGGER_CONFIGS.filter(config => 
    config.phrases.some(phrase => lowerText.includes(phrase))
  );
}

function findMatchedPhrase(text: string, config: TriggerConfig): string {
  const lowerText = text.toLowerCase();
  return config.phrases.find(phrase => lowerText.includes(phrase)) || config.phrases[0];
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Special Situations Detection starting...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: DetectRequest = await req.json();
    const { episodeId, patientName, clinicianId, clinicianName, noteContent, clinicId } = body;

    if (!episodeId || !patientName || !clinicianId || !noteContent) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Checking note for episode ${episodeId}...`);

    // Detect triggers in the note content
    const detectedTriggers = detectTriggers(noteContent);

    if (detectedTriggers.length === 0) {
      console.log("No triggers detected");
      return new Response(
        JSON.stringify({ success: true, situationsCreated: 0, triggers: [] }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Detected ${detectedTriggers.length} trigger(s):`, detectedTriggers.map(t => t.type));

    // Check for existing open situations for this episode
    const { data: existingSituations, error: existingError } = await supabase
      .from("special_situations")
      .select("situation_type")
      .eq("episode_id", episodeId)
      .eq("status", "open");

    if (existingError) {
      console.error("Error checking existing situations:", existingError);
      throw existingError;
    }

    const existingTypes = new Set(existingSituations?.map(s => s.situation_type) || []);

    // Filter out triggers that already have open situations
    const newTriggers = detectedTriggers.filter(t => !existingTypes.has(t.type));

    if (newTriggers.length === 0) {
      console.log("All detected triggers already have open situations");
      return new Response(
        JSON.stringify({ success: true, situationsCreated: 0, triggers: detectedTriggers.map(t => t.type) }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const situationsToInsert = newTriggers.map(trigger => {
      const matchedPhrase = findMatchedPhrase(noteContent, trigger);
      return {
        episode_id: episodeId,
        patient_name: patientName,
        clinician_id: clinicianId,
        clinician_name: clinicianName || null,
        note_content: noteContent.substring(0, 500), // Truncate for storage
        situation_type: trigger.type,
        summary: `${trigger.label}: phrase '${matchedPhrase}' found in note on ${today}.`,
        clinic_id: clinicId || null,
        status: "open"
      };
    });

    // Insert new situations
    const { data: insertedSituations, error: insertError } = await supabase
      .from("special_situations")
      .insert(situationsToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting situations:", insertError);
      throw insertError;
    }

    console.log(`Created ${insertedSituations?.length || 0} new special situation(s)`);

    // Send notification email for each new situation
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && insertedSituations && insertedSituations.length > 0) {
      const appUrl = Deno.env.get("APP_URL") || "https://ppc-outcome-registry.lovable.app";
      
      for (const situation of insertedSituations) {
        const triggerConfig = TRIGGER_CONFIGS.find(t => t.type === situation.situation_type);
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">New Special Situation Flagged</h1>
            <p>A new special situation has been detected in the PPC Outcome Registry.</p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #dc2626; margin-top: 0;">${triggerConfig?.label || situation.situation_type}</h2>
              <p><strong>Episode ID:</strong> ${situation.episode_id}</p>
              <p><strong>Clinician:</strong> ${situation.clinician_name || 'Unknown'}</p>
              <p><strong>Detected:</strong> ${new Date(situation.detected_at).toLocaleString()}</p>
            </div>
            
            <p style="margin-top: 30px;">
              <a href="${appUrl}/admin/special-situations?id=${situation.id}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View Special Situation
              </a>
            </p>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              This is an automated notification from the PPC Outcome Registry.
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
              subject: `New Special Situation Flagged: ${triggerConfig?.label || situation.situation_type}`,
              html: emailHtml
            })
          });
          
          if (emailResponse.ok) {
            console.log(`Notification email sent for situation ${situation.id}`);
          } else {
            console.error("Email send failed:", await emailResponse.text());
          }
        } catch (emailError) {
          console.error("Failed to send notification email:", emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        situationsCreated: insertedSituations?.length || 0,
        situations: insertedSituations,
        triggers: detectedTriggers.map(t => t.type)
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Special Situations Detection error:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
