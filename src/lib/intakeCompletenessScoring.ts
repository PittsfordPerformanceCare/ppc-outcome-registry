/**
 * Intake Completeness Scoring System
 * Calculates how complete an intake form is based on required and optional fields
 */

export interface FieldGroup {
  name: string;
  weight: number; // Importance weight (higher = more important)
  fields: {
    name: string;
    key: string;
    required: boolean;
  }[];
}

export interface CompletenessResult {
  overallScore: number; // 0-100
  maxPossibleScore: number;
  actualScore: number;
  groupScores: {
    groupName: string;
    score: number;
    maxScore: number;
    percentage: number;
    missingFields: string[];
  }[];
  missingRequiredFields: string[];
  missingOptionalFields: string[];
  isReadyForConversion: boolean;
  grade: "A" | "B" | "C" | "D" | "F";
}

const FIELD_GROUPS: FieldGroup[] = [
  {
    name: "Patient Demographics",
    weight: 10,
    fields: [
      { name: "Patient Name", key: "patient_name", required: true },
      { name: "Date of Birth", key: "date_of_birth", required: true },
      { name: "Phone", key: "phone", required: false },
      { name: "Email", key: "email", required: false },
      { name: "Address", key: "address", required: false },
    ]
  },
  {
    name: "Insurance Information",
    weight: 7,
    fields: [
      { name: "Insurance Provider", key: "insurance_provider", required: false },
      { name: "Insurance ID", key: "insurance_id", required: false },
    ]
  },
  {
    name: "Emergency Contact",
    weight: 8,
    fields: [
      { name: "Emergency Contact Name", key: "emergency_contact_name", required: false },
      { name: "Emergency Contact Phone", key: "emergency_contact_phone", required: false },
      { name: "Emergency Contact Relationship", key: "emergency_contact_relationship", required: false },
    ]
  },
  {
    name: "Medical Providers",
    weight: 6,
    fields: [
      { name: "Primary Care Physician", key: "primary_care_physician", required: false },
      { name: "Referring Physician", key: "referring_physician", required: false },
    ]
  },
  {
    name: "Medical History",
    weight: 9,
    fields: [
      { name: "Current Medications", key: "current_medications", required: false },
      { name: "Allergies", key: "allergies", required: false },
      { name: "Medical History", key: "medical_history", required: false },
    ]
  },
  {
    name: "Chief Complaint",
    weight: 10,
    fields: [
      { name: "Chief Complaint", key: "chief_complaint", required: true },
      { name: "Date of Injury/Onset", key: "injury_date", required: false },
      { name: "Injury Mechanism", key: "injury_mechanism", required: false },
      { name: "Pain Level", key: "pain_level", required: false },
      { name: "Symptoms", key: "symptoms", required: false },
    ]
  },
  {
    name: "Detailed Complaints",
    weight: 8,
    fields: [
      { name: "Body Region Complaints", key: "complaints", required: false },
    ]
  },
  {
    name: "Consent & Compliance",
    weight: 7,
    fields: [
      { name: "HIPAA Acknowledgement", key: "hipaa_acknowledged", required: false },
      { name: "Consent Signature", key: "consent_signature", required: false },
    ]
  }
];

function isFieldComplete(intake: any, key: string): boolean {
  const value = intake[key];
  
  // Handle boolean fields
  if (typeof value === "boolean") {
    return value === true;
  }
  
  // Handle array fields (complaints, review_of_systems)
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  // Handle string/number fields
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  
  if (typeof value === "number") {
    return true; // Any number (including 0) is considered complete
  }
  
  return false;
}

export function calculateCompletenessScore(intake: any): CompletenessResult {
  let totalScore = 0;
  let maxPossibleScore = 0;
  const groupScores: CompletenessResult["groupScores"] = [];
  const missingRequiredFields: string[] = [];
  const missingOptionalFields: string[] = [];

  for (const group of FIELD_GROUPS) {
    let groupScore = 0;
    let groupMaxScore = 0;
    const missingFields: string[] = [];

    for (const field of group.fields) {
      const isComplete = isFieldComplete(intake, field.key);
      const fieldWeight = field.required ? group.weight * 1.5 : group.weight;
      
      groupMaxScore += fieldWeight;
      
      if (isComplete) {
        groupScore += fieldWeight;
      } else {
        missingFields.push(field.name);
        if (field.required) {
          missingRequiredFields.push(field.name);
        } else {
          missingOptionalFields.push(field.name);
        }
      }
    }

    totalScore += groupScore;
    maxPossibleScore += groupMaxScore;

    groupScores.push({
      groupName: group.name,
      score: groupScore,
      maxScore: groupMaxScore,
      percentage: groupMaxScore > 0 ? Math.round((groupScore / groupMaxScore) * 100) : 100,
      missingFields
    });
  }

  const overallScore = maxPossibleScore > 0 
    ? Math.round((totalScore / maxPossibleScore) * 100) 
    : 0;

  // Determine grade
  let grade: CompletenessResult["grade"];
  if (overallScore >= 90) grade = "A";
  else if (overallScore >= 80) grade = "B";
  else if (overallScore >= 70) grade = "C";
  else if (overallScore >= 60) grade = "D";
  else grade = "F";

  // Ready for conversion if all required fields are present
  const isReadyForConversion = missingRequiredFields.length === 0;

  return {
    overallScore,
    maxPossibleScore,
    actualScore: totalScore,
    groupScores,
    missingRequiredFields,
    missingOptionalFields,
    isReadyForConversion,
    grade
  };
}

export function getGradeColor(grade: CompletenessResult["grade"]): string {
  switch (grade) {
    case "A": return "text-green-600 dark:text-green-400";
    case "B": return "text-blue-600 dark:text-blue-400";
    case "C": return "text-amber-600 dark:text-amber-400";
    case "D": return "text-orange-600 dark:text-orange-400";
    case "F": return "text-red-600 dark:text-red-400";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 80) return "text-blue-600 dark:text-blue-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  if (score >= 60) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function getProgressColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 80) return "bg-blue-500";
  if (score >= 70) return "bg-amber-500";
  if (score >= 60) return "bg-orange-500";
  return "bg-red-500";
}
