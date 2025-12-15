import { useMemo } from 'react';
import { isPasswordInDenylist, calculatePasswordEntropy } from '@/lib/passwordDenylist';

export interface PasswordValidationResult {
  isValid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  strengthScore: number; // 0-100
  errors: string[];
  warnings: string[];
  criteria: {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
    notInDenylist: boolean;
    criteriaMetCount: number;
  };
  guidance: string;
  entropy: number;
}

const MIN_PASSWORD_LENGTH = 12;
const REQUIRED_CRITERIA_COUNT = 3;

/**
 * Enhanced password validation hook with strength meter
 * 
 * Requirements:
 * - Minimum 12 characters
 * - At least 3 of 4 criteria: lowercase, uppercase, numbers, symbols
 * - Not in common password denylist
 * 
 * This is client-side validation only. Server-side HIBP protection
 * is not currently available in Lovable Cloud UI.
 */
export function usePasswordValidation(password: string): PasswordValidationResult {
  return useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check criteria
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    const minLength = password.length >= MIN_PASSWORD_LENGTH;
    const notInDenylist = !isPasswordInDenylist(password);
    
    // Count met criteria (excluding length which is mandatory)
    const criteriaMetCount = [hasLowercase, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length;
    
    // Build errors
    if (!password) {
      errors.push('Password is required');
    } else {
      if (!minLength) {
        errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      }
      
      if (criteriaMetCount < REQUIRED_CRITERIA_COUNT) {
        errors.push(`Password must meet at least ${REQUIRED_CRITERIA_COUNT} of 4 criteria: lowercase, uppercase, numbers, symbols`);
      }
      
      if (!notInDenylist) {
        errors.push('This password is too common and easily guessed');
      }
    }
    
    // Calculate entropy
    const entropy = calculatePasswordEntropy(password);
    
    // Build warnings
    if (password.length > 0 && password.length < 16) {
      warnings.push('Consider using a longer password (16+ characters) for extra security');
    }
    
    if (criteriaMetCount < 4 && errors.length === 0) {
      warnings.push('Adding more character types would increase security');
    }
    
    // Calculate strength score (0-100)
    let strengthScore = 0;
    
    if (password.length > 0) {
      // Length contribution (up to 40 points)
      strengthScore += Math.min(password.length * 2.5, 40);
      
      // Criteria contribution (up to 40 points, 10 each)
      strengthScore += criteriaMetCount * 10;
      
      // Entropy bonus (up to 20 points)
      strengthScore += Math.min(entropy / 4, 20);
      
      // Penalties
      if (!notInDenylist) {
        strengthScore = Math.min(strengthScore, 20); // Cap at 20 if in denylist
      }
      
      if (password.length < MIN_PASSWORD_LENGTH) {
        strengthScore = Math.min(strengthScore, 40); // Cap at 40 if too short
      }
      
      strengthScore = Math.round(Math.max(0, Math.min(100, strengthScore)));
    }
    
    // Determine strength label
    let strength: PasswordValidationResult['strength'];
    if (strengthScore < 25) {
      strength = 'weak';
    } else if (strengthScore < 50) {
      strength = 'fair';
    } else if (strengthScore < 70) {
      strength = 'good';
    } else if (strengthScore < 90) {
      strength = 'strong';
    } else {
      strength = 'excellent';
    }
    
    // Generate guidance
    let guidance = '';
    if (!password) {
      guidance = 'Enter a password to see strength requirements';
    } else if (errors.length > 0) {
      if (!minLength) {
        guidance = `Use ${MIN_PASSWORD_LENGTH}+ characters. Consider a memorable passphrase.`;
      } else if (!notInDenylist) {
        guidance = 'This password appears in breach databases. Choose something unique.';
      } else {
        guidance = `Add ${['lowercase', 'UPPERCASE', 'numbers', 'symbols!'][criteriaMetCount] || 'variety'} to strengthen.`;
      }
    } else if (strengthScore < 70) {
      guidance = 'Consider a longer passphrase for better security.';
    } else if (strengthScore < 90) {
      guidance = 'Good password! A passphrase would be even stronger.';
    } else {
      guidance = 'Excellent password strength!';
    }
    
    const isValid = errors.length === 0 && password.length > 0;
    
    return {
      isValid,
      strength,
      strengthScore,
      errors,
      warnings,
      criteria: {
        minLength,
        hasLowercase,
        hasUppercase,
        hasNumber,
        hasSymbol,
        notInDenylist,
        criteriaMetCount,
      },
      guidance,
      entropy,
    };
  }, [password]);
}

/**
 * Validates that password and confirm password match
 */
export function usePasswordMatch(password: string, confirmPassword: string): {
  matches: boolean;
  error: string | null;
} {
  return useMemo(() => {
    if (!confirmPassword) {
      return { matches: false, error: null };
    }
    
    if (password !== confirmPassword) {
      return { matches: false, error: 'Passwords do not match' };
    }
    
    return { matches: true, error: null };
  }, [password, confirmPassword]);
}
