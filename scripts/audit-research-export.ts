#!/usr/bin/env -S deno run --allow-read

/**
 * PPC Research Export Accuracy Audit Script
 * 
 * Performs automated validation checks on de-identified research exports.
 * 
 * Usage:
 *   deno run --allow-read scripts/audit-research-export.ts <csv-file> <dataset-type>
 * 
 * Example:
 *   deno run --allow-read scripts/audit-research-export.ts export.csv care_targets
 */

// Allowed headers per dataset type
const ALLOWED_HEADERS: Record<string, string[]> = {
  care_targets: [
    'care_target_pid', 'episode_pid', 'patient_pid', 'body_region',
    'instrument_type', 'baseline_score', 'discharge_score', 'score_delta',
    'mcid_threshold', 'mcid_met', 'care_target_status', 
    'age_band_at_episode_start', 'episode_time_bucket'
  ],
  outcomes: [
    'care_target_pid', 'instrument_type', 'baseline_score', 
    'discharge_score', 'score_delta', 'mcid_met'
  ],
  episodes: [
    'episode_pid', 'patient_pid', 'episode_start_bucket',
    'episode_end_bucket', 'number_of_care_targets', 'episode_status'
  ]
};

// Forbidden column names (PHI indicators)
const FORBIDDEN_COLUMNS = [
  'name', 'patient_name', 'first_name', 'last_name',
  'dob', 'date_of_birth', 'birth_date', 'birthdate',
  'email', 'patient_email', 'email_address',
  'phone', 'patient_phone', 'phone_number', 'telephone',
  'address', 'patient_address', 'street', 'street_address',
  'ssn', 'social_security', 'social_security_number',
  'emergency_contact', 'emergency_phone',
  'insurance', 'insurance_id', 'insurance_provider'
];

// PHI detection patterns
const PHI_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: 'Email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { name: 'Phone (US)', regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g },
  { name: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { name: 'Street Address', regex: /\b\d+\s+[A-Za-z]+\s+(St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Ln|Lane)\b/gi },
  { name: 'Date (MM/DD/YYYY)', regex: /\b(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}\b/g }
];

interface AuditResult {
  check: string;
  passed: boolean;
  details: string;
}

function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.trim().split('\n');
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = lines.slice(1).map(line => {
    // Simple CSV parsing (doesn't handle all edge cases)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });
  
  return { headers, rows };
}

function checkHeaders(headers: string[], datasetType: string): AuditResult {
  const allowed = ALLOWED_HEADERS[datasetType];
  if (!allowed) {
    return {
      check: 'Header Validation',
      passed: false,
      details: `Unknown dataset type: ${datasetType}`
    };
  }
  
  const unexpected = headers.filter(h => !allowed.includes(h));
  const missing = allowed.filter(h => !headers.includes(h));
  
  if (unexpected.length > 0 || missing.length > 0) {
    const issues: string[] = [];
    if (unexpected.length > 0) issues.push(`Unexpected: ${unexpected.join(', ')}`);
    if (missing.length > 0) issues.push(`Missing: ${missing.join(', ')}`);
    return {
      check: 'Header Validation',
      passed: false,
      details: issues.join('; ')
    };
  }
  
  return {
    check: 'Header Validation',
    passed: true,
    details: `${headers.length} headers validated`
  };
}

function checkForbiddenColumns(headers: string[]): AuditResult {
  const found = headers.filter(h => 
    FORBIDDEN_COLUMNS.some(f => h.includes(f))
  );
  
  if (found.length > 0) {
    return {
      check: 'Forbidden Column Check',
      passed: false,
      details: `Found forbidden columns: ${found.join(', ')}`
    };
  }
  
  return {
    check: 'Forbidden Column Check',
    passed: true,
    details: 'No forbidden columns found'
  };
}

function scanForPHI(content: string): AuditResult {
  const findings: string[] = [];
  
  for (const pattern of PHI_PATTERNS) {
    const matches = content.match(pattern.regex);
    if (matches && matches.length > 0) {
      // Filter out false positives for pseudonymized IDs
      const realMatches = matches.filter(m => 
        !m.startsWith('PAT_') && 
        !m.startsWith('EPI_') && 
        !m.startsWith('CAR_')
      );
      if (realMatches.length > 0) {
        findings.push(`${pattern.name}: ${realMatches.length} potential matches`);
      }
    }
  }
  
  if (findings.length > 0) {
    return {
      check: 'PHI Pattern Scan',
      passed: false,
      details: findings.join('; ')
    };
  }
  
  return {
    check: 'PHI Pattern Scan',
    passed: true,
    details: 'No PHI patterns detected'
  };
}

function checkPseudonymStability(headers: string[], rows: string[][]): AuditResult {
  // Find PID columns
  const pidColumns = headers
    .map((h, i) => ({ header: h, index: i }))
    .filter(({ header }) => header.endsWith('_pid'));
  
  if (pidColumns.length === 0) {
    return {
      check: 'Pseudonym ID Stability',
      passed: false,
      details: 'No pseudonymized ID columns found (expected *_pid columns)'
    };
  }
  
  // Verify PID format (PREFIX_16hexchars)
  const pidFormatRegex = /^[A-Z]{3}_[a-f0-9]{16}$/;
  let invalidPids = 0;
  
  for (const row of rows) {
    for (const { index } of pidColumns) {
      const value = row[index];
      if (value && value !== '' && !pidFormatRegex.test(value)) {
        invalidPids++;
      }
    }
  }
  
  if (invalidPids > 0) {
    return {
      check: 'Pseudonym ID Stability',
      passed: false,
      details: `${invalidPids} PIDs don't match expected format (PREFIX_[16-hex-chars])`
    };
  }
  
  return {
    check: 'Pseudonym ID Stability',
    passed: true,
    details: `${pidColumns.length} PID columns validated`
  };
}

function countRows(rows: string[][]): AuditResult {
  return {
    check: 'Row Count',
    passed: true,
    details: `${rows.length} data rows`
  };
}

async function main() {
  const args = Deno.args;
  
  if (args.length < 2) {
    console.log('Usage: deno run --allow-read scripts/audit-research-export.ts <csv-file> <dataset-type>');
    console.log('');
    console.log('Dataset types: care_targets, outcomes, episodes');
    Deno.exit(1);
  }
  
  const [filePath, datasetType] = args;
  
  if (!['care_targets', 'outcomes', 'episodes'].includes(datasetType)) {
    console.error(`Invalid dataset type: ${datasetType}`);
    console.error('Must be one of: care_targets, outcomes, episodes');
    Deno.exit(1);
  }
  
  console.log('');
  console.log('PPC Export Accuracy Audit');
  console.log('=========================');
  console.log(`File: ${filePath}`);
  console.log(`Dataset Type: ${datasetType}`);
  console.log('');
  
  // Read file
  let content: string;
  try {
    content = await Deno.readTextFile(filePath);
  } catch (error) {
    console.error(`Error reading file: ${error}`);
    Deno.exit(1);
  }
  
  // Parse CSV
  const { headers, rows } = parseCSV(content);
  
  if (headers.length === 0) {
    console.error('Error: Empty or invalid CSV file');
    Deno.exit(1);
  }
  
  // Run checks
  const results: AuditResult[] = [];
  
  results.push(checkHeaders(headers, datasetType));
  results.push(scanForPHI(content));
  results.push(checkForbiddenColumns(headers));
  results.push(countRows(rows));
  results.push(checkPseudonymStability(headers, rows));
  
  // Print results
  let allPassed = true;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const checkNum = `[${i + 1}/${results.length}]`;
    const checkName = result.check.padEnd(25, '.');
    
    console.log(`${checkNum} ${checkName} ${status}`);
    if (!result.passed) {
      console.log(`       Details: ${result.details}`);
      allPassed = false;
    } else if (result.check === 'Row Count') {
      console.log(`       ${result.details}`);
    }
  }
  
  console.log('');
  if (allPassed) {
    console.log('Overall Result: ✅ ALL CHECKS PASSED');
  } else {
    console.log('Overall Result: ❌ SOME CHECKS FAILED');
    console.log('');
    console.log('⚠️  DO NOT distribute this export until issues are resolved.');
  }
  console.log('');
  
  Deno.exit(allPassed ? 0 : 1);
}

main();
