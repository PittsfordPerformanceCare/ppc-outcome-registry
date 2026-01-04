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
    const { episodeId } = await req.json();
    
    if (!episodeId) {
      throw new Error("Missing required parameter: episodeId");
    }

    console.log("Generating neuro PCP summary for episode:", episodeId);

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

    if (episodeError) {
      console.error("Error fetching episode:", episodeError);
      throw new Error("Episode not found");
    }

    // Fetch clinic settings
    const { data: clinicSettings } = await supabaseClient
      .from("clinic_settings")
      .select("*")
      .single();

    // Fetch all neuro exams for this episode
    const { data: exams, error: examsError } = await supabaseClient
      .from("neurologic_exams")
      .select("*")
      .eq("episode_id", episodeId)
      .order("exam_date", { ascending: true });

    if (examsError) {
      console.error("Error fetching exams:", examsError);
      throw examsError;
    }

    console.log(`Found ${exams?.length || 0} neurologic exams`);

    const baselineExam = exams?.find(e => e.exam_type === "baseline");
    const finalExam = exams?.find(e => e.exam_type === "final");
    const latestExam = exams?.[exams.length - 1];

    // Fetch outcome scores
    const { data: outcomes } = await supabaseClient
      .from("outcome_scores")
      .select("*")
      .eq("episode_id", episodeId)
      .order("recorded_at", { ascending: true });

    // Build comprehensive exam findings
    const formatExamFindings = (exam: any) => {
      if (!exam) return null;
      
      return {
        date: exam.exam_date,
        time: exam.exam_time,
        clinicalHistory: exam.clinical_history,
        
        // Vitals
        vitals: {
          bpSupine: { right: exam.bp_supine_right, left: exam.bp_supine_left },
          bpSeated: { right: exam.bp_seated_right, left: exam.bp_seated_left },
          bpStandingImmediate: { right: exam.bp_standing_immediate_right, left: exam.bp_standing_immediate_left },
          bpStanding3Min: { right: exam.bp_standing_3min_right, left: exam.bp_standing_3min_left },
          o2Supine: { right: exam.o2_saturation_supine_right, left: exam.o2_saturation_supine_left },
          o2Walking: exam.o2_saturation_walking,
          heartRate: { right: exam.heart_rate_supine_right, left: exam.heart_rate_supine_left },
          temperature: { right: exam.temperature_right, left: exam.temperature_left },
          notes: exam.vitals_notes
        },
        
        // Reflexes
        reflexes: {
          tricep: { right: exam.reflex_tricep_right, left: exam.reflex_tricep_left },
          bicep: { right: exam.reflex_bicep_right, left: exam.reflex_bicep_left },
          brachioradialis: { right: exam.reflex_brachioradialis_right, left: exam.reflex_brachioradialis_left },
          patellar: { right: exam.reflex_patellar_right, left: exam.reflex_patellar_left },
          achilles: { right: exam.reflex_achilles_right, left: exam.reflex_achilles_left },
          notes: exam.reflexes_notes
        },
        
        // Visual/Oculomotor
        visual: {
          opk: exam.visual_opk,
          saccades: exam.visual_saccades,
          pursuits: exam.visual_pursuits,
          convergence: exam.visual_convergence,
          maddoxRod: exam.visual_maddox_rod,
          notes: exam.visual_notes
        },
        
        // Neurologic
        neurologic: {
          redDesaturation: { right: exam.neuro_red_desaturation_right, left: exam.neuro_red_desaturation_left },
          pupillaryFatigue: { right: exam.neuro_pupillary_fatigue_right, left: exam.neuro_pupillary_fatigue_left },
          ueExtensorWeakness: { right: exam.neuro_ue_extensor_weakness_right, left: exam.neuro_ue_extensor_weakness_left },
          capillaryRefill: { right: exam.neuro_ue_capillary_refill_right, left: exam.neuro_ue_capillary_refill_left },
          babinski: { right: exam.neuro_babinski_right, left: exam.neuro_babinski_left },
          digitSense: { right: exam.neuro_digit_sense_right, left: exam.neuro_digit_sense_left },
          twoPointLocalization: { right: exam.neuro_2pt_localization_right, left: exam.neuro_2pt_localization_left },
          fingerToNose: { right: exam.neuro_finger_to_nose_right, left: exam.neuro_finger_to_nose_left },
          uprds: { right: exam.neuro_uprds_right, left: exam.neuro_uprds_left },
          notes: exam.neuro_notes
        },
        
        // Vestibular
        vestibular: {
          rombergs: exam.vestibular_rombergs,
          fakuda: exam.vestibular_fakuda,
          shuntStabilityEO: exam.vestibular_shunt_stability_eo,
          shuntStabilityEC: exam.vestibular_shunt_stability_ec,
          otr: { right: exam.vestibular_otr_right, left: exam.vestibular_otr_left, notes: exam.vestibular_otr_notes },
          canalTesting: exam.vestibular_canal_testing,
          vor: exam.vestibular_vor,
          notes: exam.vestibular_notes
        },
        
        // Motor
        motor: {
          deltoid: { right: exam.motor_deltoid_right, left: exam.motor_deltoid_left },
          latissimus: { right: exam.motor_latissimus_right, left: exam.motor_latissimus_left },
          iliopsoas: { right: exam.motor_iliopsoas_right, left: exam.motor_iliopsoas_left },
          gluteusMax: { right: exam.motor_gluteus_max_right, left: exam.motor_gluteus_max_left },
          notes: exam.motor_notes
        },
        
        // Overall assessment
        overallNotes: exam.overall_notes
      };
    };

    // Format outcome scores
    const formatOutcomes = () => {
      if (!outcomes || outcomes.length === 0) return "No outcome measures recorded";
      
      const grouped: Record<string, any[]> = {};
      outcomes.forEach((o: any) => {
        if (!grouped[o.index_type]) grouped[o.index_type] = [];
        grouped[o.index_type].push(o);
      });
      
      return Object.entries(grouped).map(([type, scores]) => {
        const baseline = scores.find(s => s.score_type === 'baseline');
        const discharge = scores.find(s => s.score_type === 'discharge');
        const followups = scores.filter(s => s.score_type === 'followup');
        
        return `${type}: Baseline ${baseline?.score ?? 'N/A'} → ${discharge ? `Discharge ${discharge.score}` : followups.length > 0 ? `Follow-up ${followups[followups.length - 1].score}` : 'In progress'}`;
      }).join("; ");
    };

    const baselineFindings = formatExamFindings(baselineExam);
    const finalFindings = formatExamFindings(finalExam);
    const latestFindings = formatExamFindings(latestExam);

    const systemPrompt = `You are a physical therapist writing a professional clinical summary letter to a referring physician (PCP) regarding a patient's neurological rehabilitation.

Your letter must:
- Be professional, thorough, and clinically precise
- Use appropriate medical terminology
- Provide a clear summary of examination findings
- Compare baseline to current status when both are available
- Include specific objective findings from the neurological examination
- Summarize functional progress and remaining limitations
- Provide clear recommendations for ongoing care
- Be formatted as a formal letter with proper letterhead structure`;

    const userPrompt = `Generate a comprehensive PCP summary letter for the following neurological rehabilitation case:

CLINIC LETTERHEAD:
${clinicSettings?.clinic_name || "PPC Outcome Registry"}
${clinicSettings?.address || ""}
${clinicSettings?.phone ? `Phone: ${clinicSettings.phone}` : ""}
${clinicSettings?.email ? `Email: ${clinicSettings.email}` : ""}

PATIENT INFORMATION:
Name: ${episode.patient_name}
Date of Birth: ${episode.date_of_birth || "Not recorded"}
Date of Service: ${episode.date_of_service}
${episode.injury_date ? `Date of Injury: ${episode.injury_date}` : ""}
${episode.injury_mechanism ? `Mechanism of Injury: ${episode.injury_mechanism}` : ""}
Diagnosis: ${episode.diagnosis || "Neurological condition under evaluation"}
${episode.referring_physician ? `Referring Physician: ${episode.referring_physician}` : ""}

OUTCOME MEASURES:
${formatOutcomes()}

${baselineFindings ? `
BASELINE EXAMINATION (${baselineFindings.date}):
${baselineFindings.clinicalHistory ? `Clinical History: ${baselineFindings.clinicalHistory}` : ""}

Vitals:
- BP Supine: R ${baselineFindings.vitals.bpSupine.right || 'N/A'} / L ${baselineFindings.vitals.bpSupine.left || 'N/A'}
- BP Standing (3 min): R ${baselineFindings.vitals.bpStanding3Min.right || 'N/A'} / L ${baselineFindings.vitals.bpStanding3Min.left || 'N/A'}
- O2 Saturation Supine: R ${baselineFindings.vitals.o2Supine.right || 'N/A'}% / L ${baselineFindings.vitals.o2Supine.left || 'N/A'}%
${baselineFindings.vitals.o2Walking ? `- O2 After Walking: ${baselineFindings.vitals.o2Walking}%` : ''}
${baselineFindings.vitals.notes ? `- Notes: ${baselineFindings.vitals.notes}` : ''}

Oculomotor Function:
- Saccades: ${baselineFindings.visual.saccades || 'Not tested'}
- Pursuits: ${baselineFindings.visual.pursuits || 'Not tested'}
- Convergence: ${baselineFindings.visual.convergence || 'Not tested'}
- VOR: ${baselineFindings.vestibular.vor || 'Not tested'}
${baselineFindings.visual.notes ? `- Notes: ${baselineFindings.visual.notes}` : ''}

Vestibular Assessment:
- Romberg's: ${baselineFindings.vestibular.rombergs || 'Not tested'}
- Fukuda: ${baselineFindings.vestibular.fakuda || 'Not tested'}
- Shunt Stability (EO): ${baselineFindings.vestibular.shuntStabilityEO || 'Not tested'}
- Shunt Stability (EC): ${baselineFindings.vestibular.shuntStabilityEC || 'Not tested'}
${baselineFindings.vestibular.notes ? `- Notes: ${baselineFindings.vestibular.notes}` : ''}

Neurologic Findings:
- Finger to Nose: R ${baselineFindings.neurologic.fingerToNose.right || 'N/A'} / L ${baselineFindings.neurologic.fingerToNose.left || 'N/A'}
- Babinski: R ${baselineFindings.neurologic.babinski.right || 'N/A'} / L ${baselineFindings.neurologic.babinski.left || 'N/A'}
- Pupillary Fatigue: R ${baselineFindings.neurologic.pupillaryFatigue.right || 'N/A'} / L ${baselineFindings.neurologic.pupillaryFatigue.left || 'N/A'}
${baselineFindings.neurologic.notes ? `- Notes: ${baselineFindings.neurologic.notes}` : ''}

Reflexes:
- Bicep: R ${baselineFindings.reflexes.bicep.right || 'N/A'} / L ${baselineFindings.reflexes.bicep.left || 'N/A'}
- Tricep: R ${baselineFindings.reflexes.tricep.right || 'N/A'} / L ${baselineFindings.reflexes.tricep.left || 'N/A'}
- Patellar: R ${baselineFindings.reflexes.patellar.right || 'N/A'} / L ${baselineFindings.reflexes.patellar.left || 'N/A'}
- Achilles: R ${baselineFindings.reflexes.achilles.right || 'N/A'} / L ${baselineFindings.reflexes.achilles.left || 'N/A'}
${baselineFindings.reflexes.notes ? `- Notes: ${baselineFindings.reflexes.notes}` : ''}

${baselineFindings.overallNotes ? `Overall Assessment: ${baselineFindings.overallNotes}` : ''}
` : 'No baseline examination recorded.'}

${finalFindings ? `
CURRENT/FINAL EXAMINATION (${finalFindings.date}):

Vitals:
- BP Supine: R ${finalFindings.vitals.bpSupine.right || 'N/A'} / L ${finalFindings.vitals.bpSupine.left || 'N/A'}
- BP Standing (3 min): R ${finalFindings.vitals.bpStanding3Min.right || 'N/A'} / L ${finalFindings.vitals.bpStanding3Min.left || 'N/A'}
- O2 Saturation Supine: R ${finalFindings.vitals.o2Supine.right || 'N/A'}% / L ${finalFindings.vitals.o2Supine.left || 'N/A'}%
${finalFindings.vitals.o2Walking ? `- O2 After Walking: ${finalFindings.vitals.o2Walking}%` : ''}
${finalFindings.vitals.notes ? `- Notes: ${finalFindings.vitals.notes}` : ''}

Oculomotor Function:
- Saccades: ${finalFindings.visual.saccades || 'Not tested'}
- Pursuits: ${finalFindings.visual.pursuits || 'Not tested'}
- Convergence: ${finalFindings.visual.convergence || 'Not tested'}
- VOR: ${finalFindings.vestibular.vor || 'Not tested'}
${finalFindings.visual.notes ? `- Notes: ${finalFindings.visual.notes}` : ''}

Vestibular Assessment:
- Romberg's: ${finalFindings.vestibular.rombergs || 'Not tested'}
- Fukuda: ${finalFindings.vestibular.fakuda || 'Not tested'}
- Shunt Stability (EO): ${finalFindings.vestibular.shuntStabilityEO || 'Not tested'}
- Shunt Stability (EC): ${finalFindings.vestibular.shuntStabilityEC || 'Not tested'}
${finalFindings.vestibular.notes ? `- Notes: ${finalFindings.vestibular.notes}` : ''}

Neurologic Findings:
- Finger to Nose: R ${finalFindings.neurologic.fingerToNose.right || 'N/A'} / L ${finalFindings.neurologic.fingerToNose.left || 'N/A'}
- Babinski: R ${finalFindings.neurologic.babinski.right || 'N/A'} / L ${finalFindings.neurologic.babinski.left || 'N/A'}
- Pupillary Fatigue: R ${finalFindings.neurologic.pupillaryFatigue.right || 'N/A'} / L ${finalFindings.neurologic.pupillaryFatigue.left || 'N/A'}
${finalFindings.neurologic.notes ? `- Notes: ${finalFindings.neurologic.notes}` : ''}

${finalFindings.overallNotes ? `Overall Assessment: ${finalFindings.overallNotes}` : ''}
` : latestFindings && !baselineExam ? `
EXAMINATION (${latestFindings.date}):
${latestFindings.clinicalHistory ? `Clinical History: ${latestFindings.clinicalHistory}` : ""}

Vitals:
- BP Supine: R ${latestFindings.vitals.bpSupine.right || 'N/A'} / L ${latestFindings.vitals.bpSupine.left || 'N/A'}
- BP Standing (3 min): R ${latestFindings.vitals.bpStanding3Min.right || 'N/A'} / L ${latestFindings.vitals.bpStanding3Min.left || 'N/A'}
${latestFindings.vitals.notes ? `- Notes: ${latestFindings.vitals.notes}` : ''}

Oculomotor: Saccades ${latestFindings.visual.saccades || 'N/A'}, Pursuits ${latestFindings.visual.pursuits || 'N/A'}, VOR ${latestFindings.vestibular.vor || 'N/A'}
Vestibular: Romberg's ${latestFindings.vestibular.rombergs || 'N/A'}, Fukuda ${latestFindings.vestibular.fakuda || 'N/A'}
Neurologic: Finger to Nose R ${latestFindings.neurologic.fingerToNose.right || 'N/A'} / L ${latestFindings.neurologic.fingerToNose.left || 'N/A'}

${latestFindings.overallNotes ? `Overall Assessment: ${latestFindings.overallNotes}` : ''}
` : 'No final examination recorded yet.'}

FUNCTIONAL STATUS:
${episode.functional_limitations?.length > 0 ? `Limitations: ${episode.functional_limitations.join(", ")}` : "No specific limitations documented"}
${episode.treatment_goals ? `Treatment Goals: ${JSON.stringify(episode.treatment_goals)}` : ""}

Please generate a professional PCP summary letter that:
1. Uses proper letterhead formatting
2. Addresses the referring physician professionally
3. Summarizes the patient's condition and treatment course
4. Details significant examination findings with comparison between baseline and current status
5. Includes outcome measure progress (if available)
6. Provides clinical interpretation of findings
7. States current functional status and any remaining limitations
8. Includes recommendations for ongoing care or monitoring
9. Closes with availability for questions and collaboration
10. Is signed by ${episode.clinician || "Treating Clinician"}, ${episode.clinician_credentials || "PT, DPT"}

Format the letter professionally with clear sections and appropriate medical terminology.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling AI gateway to generate summary...");

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
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        console.error("Payment required");
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
    const summaryContent = aiData.choices[0].message.content;

    console.log("Successfully generated PCP summary");

    return new Response(
      JSON.stringify({ summary: summaryContent }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error generating neuro PCP summary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
