import { supabase } from "@/integrations/supabase/client";

export interface IntakeValidationIssue {
  severity: "error" | "warning" | "info";
  message: string;
  field?: string;
}

export interface ValidatedIntake {
  id: string;
  patient_name: string;
  access_code: string;
  isValid: boolean;
  issues: IntakeValidationIssue[];
  canConvert: boolean;
  hasExistingEpisode?: boolean;
  existingEpisodeId?: string;
}

export interface IntakeBulkValidationResult {
  totalSelected: number;
  validForConversion: number;
  requiresReview: number;
  alreadyConverted: number;
  validatedIntakes: ValidatedIntake[];
}

/**
 * Validates a single intake form for conversion readiness
 */
export function validateSingleIntake(intake: any): ValidatedIntake {
  const issues: IntakeValidationIssue[] = [];
  let canConvert = true;

  // Critical fields - these prevent conversion
  if (!intake.patient_name || intake.patient_name.trim() === "") {
    issues.push({
      severity: "error",
      message: "Patient name is required",
      field: "patient_name"
    });
    canConvert = false;
  }

  if (!intake.date_of_birth) {
    issues.push({
      severity: "error",
      message: "Date of birth is required",
      field: "date_of_birth"
    });
    canConvert = false;
  }

  if (!intake.chief_complaint || intake.chief_complaint.trim() === "") {
    issues.push({
      severity: "error",
      message: "Chief complaint is required",
      field: "chief_complaint"
    });
    canConvert = false;
  }

  // Already converted check
  if (intake.status === "converted" || intake.converted_to_episode_id) {
    issues.push({
      severity: "error",
      message: "Intake already converted to episode",
      field: "status"
    });
    canConvert = false;
  }

  // Important fields - warnings
  if (!intake.phone && !intake.email) {
    issues.push({
      severity: "warning",
      message: "No contact information (phone or email)",
      field: "contact"
    });
  }

  if (!intake.insurance_provider && !intake.insurance_id) {
    issues.push({
      severity: "warning",
      message: "No insurance information",
      field: "insurance"
    });
  }

  if (!intake.emergency_contact_name || !intake.emergency_contact_phone) {
    issues.push({
      severity: "warning",
      message: "Incomplete emergency contact information",
      field: "emergency_contact"
    });
  }

  if (!intake.referring_physician) {
    issues.push({
      severity: "info",
      message: "No referring physician specified",
      field: "referring_physician"
    });
  }

  // Check if complaints are available for region inference
  if (!intake.complaints || intake.complaints.length === 0) {
    issues.push({
      severity: "warning",
      message: "No detailed complaints - manual region selection required",
      field: "complaints"
    });
  }

  return {
    id: intake.id,
    patient_name: intake.patient_name,
    access_code: intake.access_code,
    isValid: canConvert && issues.filter(i => i.severity === "error").length === 0,
    issues,
    canConvert
  };
}

/**
 * Validates multiple intake forms for bulk conversion
 */
export function validateBulkIntakes(intakes: any[]): IntakeBulkValidationResult {
  const validatedIntakes = intakes.map(intake => validateSingleIntake(intake));

  const validForConversion = validatedIntakes.filter(v => v.canConvert).length;
  const requiresReview = validatedIntakes.filter(v => !v.canConvert && v.issues.some(i => i.severity === "warning")).length;
  const alreadyConverted = validatedIntakes.filter(v => v.issues.some(i => i.field === "status")).length;

  return {
    totalSelected: intakes.length,
    validForConversion,
    requiresReview,
    alreadyConverted,
    validatedIntakes
  };
}

/**
 * Check for duplicate patients (same name and DOB) with active episodes
 */
export async function checkForDuplicatePatients(intakes: any[]): Promise<Map<string, string>> {
  const duplicateMap = new Map<string, string>();

  try {
    // Get all episodes
    const { data: episodes, error } = await supabase
      .from("episodes")
      .select("id, patient_name, date_of_birth, discharge_date")
      .is("discharge_date", null); // Only active episodes

    if (error) throw error;
    if (!episodes) return duplicateMap;

    // Check each intake against existing episodes
    for (const intake of intakes) {
      const duplicate = episodes.find(
        ep => 
          ep.patient_name.toLowerCase() === intake.patient_name.toLowerCase() &&
          ep.date_of_birth === intake.date_of_birth
      );

      if (duplicate) {
        duplicateMap.set(intake.id, duplicate.id);
      }
    }
  } catch (error) {
    console.error("Error checking for duplicates:", error);
  }

  return duplicateMap;
}

/**
 * Get validation summary statistics
 */
export function getValidationSummary(result: IntakeBulkValidationResult): string {
  const parts: string[] = [];

  if (result.validForConversion > 0) {
    parts.push(`${result.validForConversion} ready to convert`);
  }

  if (result.requiresReview > 0) {
    parts.push(`${result.requiresReview} need review`);
  }

  if (result.alreadyConverted > 0) {
    parts.push(`${result.alreadyConverted} already converted`);
  }

  return parts.join(", ");
}
