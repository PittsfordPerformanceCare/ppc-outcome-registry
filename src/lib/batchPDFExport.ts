import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { calculateMCIDSummary } from "./mcidTracking";

interface EpisodeData {
  id: string;
  patient_name: string;
  date_of_birth?: string;
  region: string;
  diagnosis?: string;
  date_of_service: string;
  discharge_date?: string;
  clinician?: string;
  referring_physician?: string;
}

interface OutcomeScore {
  index_type: string;
  score_type: string;
  score: number;
}

export async function generateBatchMCIDReports(
  episodeIds: string[],
  clinicSettings?: {
    clinic_name: string;
    logo_url?: string;
    phone?: string;
    email?: string;
    address?: string;
  }
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const episodeId of episodeIds) {
    try {
      // Fetch episode data
      const { data: episode, error: episodeError } = await supabase
        .from("episodes")
        .select("*")
        .eq("id", episodeId)
        .single();

      if (episodeError || !episode) {
        throw new Error(`Failed to fetch episode ${episodeId}`);
      }

      // Only generate reports for completed episodes
      if (!episode.discharge_date) {
        errors.push(`${episode.patient_name}: Episode not yet discharged`);
        failed++;
        continue;
      }

      // Fetch outcome scores
      const { data: scores, error: scoresError } = await supabase
        .from("outcome_scores")
        .select("*")
        .eq("episode_id", episodeId);

      if (scoresError) {
        throw new Error(`Failed to fetch scores for ${episodeId}`);
      }

      // Group scores by type
      const baselineScores: Record<string, number> = {};
      const dischargeScores: Record<string, number> = {};

      scores?.forEach((score: OutcomeScore) => {
        if (score.score_type === "baseline") {
          baselineScores[score.index_type] = score.score;
        } else if (score.score_type === "discharge") {
          dischargeScores[score.index_type] = score.score;
        }
      });

      // Check if we have the necessary data
      if (Object.keys(baselineScores).length === 0 || Object.keys(dischargeScores).length === 0) {
        errors.push(`${episode.patient_name}: Missing baseline or discharge scores`);
        failed++;
        continue;
      }

      // Calculate MCID summary
      const mcidSummary = calculateMCIDSummary(baselineScores, dischargeScores);

      // Generate PDF
      await generateSinglePDF(episode as EpisodeData, baselineScores, dischargeScores, mcidSummary, clinicSettings);
      success++;

      // Small delay between PDFs to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error(`Error generating PDF for episode ${episodeId}:`, error);
      errors.push(`Episode ${episodeId}: ${error.message}`);
      failed++;
    }
  }

  return { success, failed, errors };
}

async function generateSinglePDF(
  episode: EpisodeData,
  baselineScores: Record<string, number>,
  dischargeScores: Record<string, number>,
  mcidSummary: any,
  clinicSettings?: {
    clinic_name: string;
    logo_url?: string;
    phone?: string;
    email?: string;
    address?: string;
  }
) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  let yPosition = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Header with clinic info
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(clinicSettings?.clinic_name || "PPC Outcome Registry", margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  if (clinicSettings?.phone) {
    pdf.text(`Phone: ${clinicSettings.phone}`, margin, yPosition);
    yPosition += 5;
  }
  if (clinicSettings?.email) {
    pdf.text(`Email: ${clinicSettings.email}`, margin, yPosition);
    yPosition += 5;
  }
  if (clinicSettings?.address) {
    pdf.text(`Address: ${clinicSettings.address}`, margin, yPosition);
    yPosition += 5;
  }

  yPosition += 5;
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Report Title
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("MCID Outcome Report", margin, yPosition);
  yPosition += 10;

  // Patient Information
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Patient Information", margin, yPosition);
  yPosition += 7;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Name: ${episode.patient_name}`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Episode ID: ${episode.id}`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Region: ${episode.region}`, margin, yPosition);
  yPosition += 5;
  if (episode.diagnosis) {
    pdf.text(`Diagnosis: ${episode.diagnosis}`, margin, yPosition);
    yPosition += 5;
  }
  pdf.text(`Date of Service: ${new Date(episode.date_of_service).toLocaleDateString()}`, margin, yPosition);
  yPosition += 5;
  if (episode.discharge_date) {
    pdf.text(`Discharge Date: ${new Date(episode.discharge_date).toLocaleDateString()}`, margin, yPosition);
    yPosition += 5;
  }
  if (episode.clinician) {
    pdf.text(`Clinician: ${episode.clinician}`, margin, yPosition);
    yPosition += 5;
  }
  if (episode.referring_physician) {
    pdf.text(`Referring Physician: ${episode.referring_physician}`, margin, yPosition);
    yPosition += 5;
  }

  yPosition += 5;

  // MCID Summary
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("MCID Summary", margin, yPosition);
  yPosition += 7;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Total Measurements: ${mcidSummary.totalMeasurements}`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Achieved MCID: ${mcidSummary.achievedMCID}`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Success Rate: ${mcidSummary.successRate.toFixed(1)}%`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Average Improvement: ${mcidSummary.averageImprovement.toFixed(1)}%`, margin, yPosition);
  yPosition += 10;

  // Outcome Scores Table
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Outcome Scores by Tool", margin, yPosition);
  yPosition += 7;

  // Table headers
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  const colWidths = [30, 25, 25, 25, 30];
  const cols = ["Tool", "Baseline", "Discharge", "Change", "MCID Status"];
  
  let xPos = margin;
  cols.forEach((col, idx) => {
    pdf.text(col, xPos, yPosition);
    xPos += colWidths[idx];
  });
  yPosition += 5;

  // Table rows
  pdf.setFont("helvetica", "normal");
  Object.keys(baselineScores).forEach((tool) => {
    const baseline = baselineScores[tool];
    const discharge = dischargeScores[tool];
    const change = baseline - discharge;
    const achievement = mcidSummary.achievements.find((a: any) => a.tool === tool);
    const status = achievement?.achieved ? "✓ Achieved" : "Not Achieved";

    xPos = margin;
    pdf.text(tool, xPos, yPosition);
    xPos += colWidths[0];
    pdf.text(baseline.toFixed(1), xPos, yPosition);
    xPos += colWidths[1];
    pdf.text(discharge.toFixed(1), xPos, yPosition);
    xPos += colWidths[2];
    pdf.text(change.toFixed(1), xPos, yPosition);
    xPos += colWidths[3];
    pdf.text(status, xPos, yPosition);
    
    yPosition += 6;
  });

  yPosition += 5;

  // Footer
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  pdf.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    margin,
    yPosition
  );

  // Save PDF
  const fileName = `MCID-Report-${episode.patient_name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(fileName);
}
