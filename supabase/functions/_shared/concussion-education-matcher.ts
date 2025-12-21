/**
 * Concussion Education Candidate Matcher
 * 
 * Determines if a given reason/concern text qualifies for concussion education delivery.
 * Used consistently across frontend (PatientThankYou) and backend (create-lead edge function).
 * 
 * NOTE: This file is a copy of src/utils/concussionEducationMatcher.ts for edge function use.
 * Keep both files in sync when updating matching logic.
 */

// Exact matches for dropdown values (case-insensitive after normalization)
const EXACT_MATCHES = ["concussion", "headaches", "dizziness"];

// Contains patterns - clinical terms that indicate concussion-related concerns
const CONTAINS_PATTERNS = [
  "concussion",
  "head injury",
  "head-injury",
  "dizziness",
  "vertigo",
  "headache",
  "tbi",
  "traumatic brain",
  "post-concussion",
  "post concussion",
];

// Clinical balance phrases that indicate neurologic balance issues
const CLINICAL_BALANCE_PHRASES = [
  "balance issues",
  "balance problems",
  "balance problem",
  "loss of balance",
  "off balance",
  "off-balance",
  "unsteady",
  "unsteadiness",
  "poor balance",
  "balance disorder",
  "balance difficulty",
  "balance difficulties",
];

// Neuro keywords that validate "balance" as a standalone term
const NEURO_KEYWORDS = [
  "concussion",
  "head injury",
  "dizzy",
  "dizziness",
  "vertigo",
  "headache",
  "tbi",
  "traumatic brain",
  "post-concussion",
  "post concussion",
];

// Exclusion phrases - financial/admin terms that should never trigger education
const EXCLUSION_PHRASES = [
  "balance billing",
  "billing balance",
  "account balance",
  "remaining balance",
  "pay balance",
  "payment balance",
  "statement balance",
  "outstanding balance",
  "owed balance",
  "balance due",
  "balance owed",
];

/**
 * Normalizes input text for consistent matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // collapse multiple spaces
    .replace(/[.,!?;:'"()[\]{}]/g, ""); // remove common punctuation
}

/**
 * Checks if the normalized text contains any of the exclusion phrases
 */
function containsExclusionPhrase(normalizedText: string): boolean {
  return EXCLUSION_PHRASES.some(phrase => normalizedText.includes(phrase));
}

/**
 * Checks if standalone "balance" word appears with a neuro keyword
 */
function hasBalanceWithNeuroContext(normalizedText: string): boolean {
  // Check if "balance" appears as a standalone word (not part of clinical phrases)
  const hasStandaloneBalance = /\bbalance\b/.test(normalizedText);
  
  if (!hasStandaloneBalance) return false;
  
  // Check if it's already matched by clinical phrases
  const matchesClinicalPhrase = CLINICAL_BALANCE_PHRASES.some(phrase => 
    normalizedText.includes(phrase)
  );
  
  if (matchesClinicalPhrase) return true; // Already valid via clinical phrase
  
  // Check for co-occurrence with neuro keywords
  return NEURO_KEYWORDS.some(keyword => normalizedText.includes(keyword));
}

/**
 * Determines if a reason/concern text qualifies for concussion education delivery.
 * 
 * @param reasonText - The primary reason, concern, or chief complaint text
 * @returns true if the text qualifies for concussion education delivery
 */
export function isConcussionEducationCandidate(reasonText: string | null | undefined): boolean {
  if (!reasonText || typeof reasonText !== "string") return false;
  
  const normalized = normalizeText(reasonText);
  
  if (!normalized) return false;
  
  // First check exclusions - if any match, immediately return false
  if (containsExclusionPhrase(normalized)) {
    return false;
  }
  
  // Check exact matches (normalized text equals the pattern exactly)
  if (EXACT_MATCHES.includes(normalized)) {
    return true;
  }
  
  // Check contains patterns (clinical terms)
  if (CONTAINS_PATTERNS.some(pattern => normalized.includes(pattern))) {
    return true;
  }
  
  // Check clinical balance phrases
  if (CLINICAL_BALANCE_PHRASES.some(phrase => normalized.includes(phrase))) {
    return true;
  }
  
  // Check if standalone "balance" appears with neuro context
  if (hasBalanceWithNeuroContext(normalized)) {
    return true;
  }
  
  return false;
}
