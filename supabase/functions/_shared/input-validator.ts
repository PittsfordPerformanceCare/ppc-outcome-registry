/**
 * Enterprise-grade input validation utilities for edge functions
 * Prevents injection attacks and ensures data integrity
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)\.]{7,20}$/;
const NAME_REGEX = /^[a-zA-Z\s\-'\.]{1,100}$/;
const SAFE_TEXT_REGEX = /^[^<>]*$/; // No HTML tags

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  sanitized: Record<string, unknown>;
}

/**
 * Sanitize a string by trimming and removing dangerous characters
 */
export function sanitizeString(value: unknown, maxLength = 500): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  
  // Trim and limit length
  let sanitized = value.trim().slice(0, maxLength);
  
  // Remove null bytes and other control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  
  return sanitized || null;
}

/**
 * Validate email format
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const sanitized = email.trim().toLowerCase();
  return EMAIL_REGEX.test(sanitized) && sanitized.length <= 255;
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== "string") return false;
  const sanitized = phone.trim();
  return PHONE_REGEX.test(sanitized);
}

/**
 * Validate name format (letters, spaces, hyphens, apostrophes)
 */
export function isValidName(name: unknown): boolean {
  if (typeof name !== "string") return false;
  const sanitized = name.trim();
  return NAME_REGEX.test(sanitized) && sanitized.length >= 1;
}

/**
 * Check for potential XSS/injection patterns
 */
export function isSafeText(text: unknown): boolean {
  if (typeof text !== "string") return true;
  return SAFE_TEXT_REGEX.test(text);
}

/**
 * Validate a lead submission payload
 */
export function validateLeadPayload(body: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const sanitized: Record<string, unknown> = {};

  // Name validation
  const name = sanitizeString(body.full_name || body.name, 100);
  if (!name) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (!isValidName(name)) {
    errors.push({ field: "name", message: "Name contains invalid characters" });
  } else {
    sanitized.name = name;
  }

  // Email validation
  const email = sanitizeString(body.email, 255);
  if (email && !isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  } else {
    sanitized.email = email?.toLowerCase() || null;
  }

  // Phone validation
  const phone = sanitizeString(body.phone, 20);
  if (phone && !isValidPhone(phone)) {
    errors.push({ field: "phone", message: "Invalid phone format" });
  } else {
    sanitized.phone = phone;
  }

  // Require at least email or phone
  if (!sanitized.email && !sanitized.phone) {
    errors.push({ field: "contact", message: "Email or phone is required" });
  }

  // Sanitize optional text fields
  const textFields = [
    "who_is_this_for",
    "primary_concern",
    "symptom_summary",
    "preferred_contact_method",
    "notes",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "origin_page",
    "origin_cta",
    "pillar_origin",
  ];

  for (const field of textFields) {
    const value = sanitizeString(body[field], 500);
    if (value && !isSafeText(value)) {
      errors.push({ field, message: `${field} contains invalid characters` });
    } else {
      sanitized[field] = value;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Validate neurologic intake payload
 */
export function validateNeurologicIntakePayload(body: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  const sanitized: Record<string, unknown> = {};

  // Email is required
  const email = sanitizeString(body.email || body.Email, 255);
  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  } else {
    sanitized.email = email.toLowerCase();
  }

  // Optional name validation
  const name = sanitizeString(body.name || body.Name || body.full_name, 100);
  if (name) {
    if (!isValidName(name)) {
      errors.push({ field: "name", message: "Name contains invalid characters" });
    } else {
      sanitized.name = name;
    }
  }

  // Phone validation
  const phone = sanitizeString(body.phone || body.Phone, 20);
  if (phone && !isValidPhone(phone)) {
    errors.push({ field: "phone", message: "Invalid phone format" });
  } else {
    sanitized.phone = phone;
  }

  // Sanitize all other text fields
  const textFields = [
    "persona",
    "primary_concern",
    "symptom_profile",
    "duration",
    "parent_name",
    "child_name",
    "child_age",
    "symptom_location",
    "referrer_name",
    "role",
    "organization",
    "patient_name",
    "patient_age",
    "urgency",
    "notes",
    "source",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "origin_page",
    "origin_cta",
    "funnel_stage",
    "pillar_origin",
  ];

  for (const field of textFields) {
    // Handle various naming conventions
    const value = sanitizeString(
      body[field] || body[toCamelCase(field)],
      500
    );
    if (value && !isSafeText(value)) {
      errors.push({ field, message: `${field} contains invalid characters` });
    } else {
      sanitized[field] = value;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Convert snake_case to camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Create validation error response
 */
export function validationErrorResponse(
  errors: ValidationError[],
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: "Validation failed",
      details: errors,
    }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}
