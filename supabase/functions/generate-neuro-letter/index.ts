import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { episodeId, letterType } = await req.json();
    
    if (!episodeId || !letterType) {
      throw new Error("Missing required parameters");
    }

    if (!["employee", "school"].includes(letterType)) {
      throw new Error("Invalid letter type. Must be 'employee' or 'school'");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Fetch episode data
    const { data: episode, error: episodeError } = await supabaseClient
      .from("episodes")
      .select("*")
      .eq("id", episodeId)
      .single();

    if (episodeError) throw episodeError;

    // Fetch clinic settings
    const { data: clinicSettings } = await supabaseClient
      .from("clinic_settings")
      .select("*")
      .single();

    // Fetch neuro exams
    const { data: exams, error: examsError } = await supabaseClient
      .from("neurologic_exams")
      .select("*")
      .eq("episode_id", episodeId)
      .order("exam_date", { ascending: true });

    if (examsError) throw examsError;

    const baselineExam = exams?.find(e => e.exam_type === "baseline");
    const finalExam = exams?.find(e => e.exam_type === "final");

    // Build context for AI
    const context = {
      patient: episode.patient_name,
      dateOfService: episode.date_of_service,
      diagnosis: episode.diagnosis,
      clinician: episode.clinician,
      credentials: episode.clinician_credentials,
      injuryDate: episode.injury_date,
      injuryMechanism: episode.injury_mechanism,
      baselineFindings: baselineExam ? {
        date: baselineExam.exam_date,
        vestibular: baselineExam.vestibular_vor,
        balance: baselineExam.vestibular_rombergs,
        coordination: baselineExam.neuro_finger_to_nose_left,
        notes: baselineExam.overall_notes
      } : null,
      finalFindings: finalExam ? {
        date: finalExam.exam_date,
        vestibular: finalExam.vestibular_vor,
        balance: finalExam.vestibular_rombergs,
        coordination: finalExam.neuro_finger_to_nose_left,
        notes: finalExam.overall_notes
      } : null,
      functionalLimitations: episode.functional_limitations,
      treatmentGoals: episode.treatment_goals
    };

    const systemPrompt = letterType === "employee" 
      ? `You are a physical therapist writing a professional letter to an employer regarding a patient's work restrictions and capabilities following neurological rehabilitation. The letter should be formal, clear, and focused on functional abilities and any necessary accommodations.`
      : `You are a physical therapist writing a professional letter to a school regarding a student's academic accommodations and restrictions following neurological rehabilitation. The letter should be formal, clear, and focused on cognitive and physical considerations for the educational environment.`;

    const userPrompt = `Generate a professional ${letterType} letter based on the following patient information:

LETTERHEAD (use this for the top of the letter):
${clinicSettings?.clinic_name || "PPC Outcome Registry"}
${clinicSettings?.tagline || "Clinical Excellence Platform"}
${clinicSettings?.address ? `Address: ${clinicSettings.address}` : ""}
${clinicSettings?.phone ? `Phone: ${clinicSettings.phone}` : ""}
${clinicSettings?.email ? `Email: ${clinicSettings.email}` : ""}

Patient: ${context.patient}
Diagnosis: ${context.diagnosis}
Injury Date: ${context.injuryDate}
Injury Mechanism: ${context.injuryMechanism}

${context.baselineFindings ? `
Baseline Exam (${context.baselineFindings.date}):
- Vestibular Function: ${context.baselineFindings.vestibular}
- Balance: ${context.baselineFindings.balance}
- Coordination: ${context.baselineFindings.coordination}
- Assessment: ${context.baselineFindings.notes}
` : ''}

${context.finalFindings ? `
Current Status (${context.finalFindings.date}):
- Vestibular Function: ${context.finalFindings.vestibular}
- Balance: ${context.finalFindings.balance}
- Coordination: ${context.finalFindings.coordination}
- Assessment: ${context.finalFindings.notes}
` : ''}

Functional Limitations: ${context.functionalLimitations?.join(", ") || "None specified"}

The letter should:
1. Be professionally formatted with proper letterhead structure
2. Clearly state the diagnosis and treatment period
3. Describe functional limitations and progress
4. Provide specific ${letterType === "employee" ? "work restrictions or accommodations" : "academic accommodations"}
5. Include a timeline for reassessment if applicable
6. Be signed by ${context.clinician}, ${context.credentials}
7. Use clear, accessible language appropriate for ${letterType === "employee" ? "HR professionals" : "school administrators"}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const letterContent = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ letter: letterContent }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error generating letter:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
