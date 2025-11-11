import { format } from "date-fns";

interface ExportEpisode {
  id: string;
  patient_name: string;
  region: string;
  date_of_service: string;
  diagnosis: string;
  discharge_date?: string;
  mcidAchieved?: boolean;
  improvement?: number;
  baselineScore?: number;
  finalScore?: number;
  indexType?: string;
  clinician?: string;
  injury_date?: string;
  pain_level?: string;
  treatment_goals?: any;
}

/**
 * Convert episode data to CSV format
 */
export function convertToCSV(episodes: ExportEpisode[], includeScores: boolean = false): string {
  if (episodes.length === 0) {
    return '';
  }

  // Define headers based on what data is included
  const headers = [
    'Episode ID',
    'Patient Name',
    'Region',
    'Date of Service',
    'Diagnosis',
    'Clinician',
    'Injury Date',
    'Pain Level',
    'Discharge Date',
    'Status'
  ];

  if (includeScores) {
    headers.push(
      'Index Type',
      'Baseline Score',
      'Final Score',
      'Improvement',
      'MCID Achieved'
    );
  }

  // Create CSV rows
  const rows = episodes.map(episode => {
    const baseRow = [
      episode.id,
      `"${episode.patient_name}"`,
      episode.region,
      format(new Date(episode.date_of_service), 'yyyy-MM-dd'),
      `"${episode.diagnosis || 'Not specified'}"`,
      `"${episode.clinician || 'Not specified'}"`,
      episode.injury_date ? format(new Date(episode.injury_date), 'yyyy-MM-dd') : '',
      episode.pain_level || '',
      episode.discharge_date ? format(new Date(episode.discharge_date), 'yyyy-MM-dd') : '',
      episode.discharge_date ? 'Completed' : 'Active'
    ];

    if (includeScores) {
      baseRow.push(
        episode.indexType || '',
        episode.baselineScore !== undefined ? episode.baselineScore.toString() : '',
        episode.finalScore !== undefined ? episode.finalScore.toString() : '',
        episode.improvement !== undefined ? episode.improvement.toFixed(1) : '',
        episode.mcidAchieved !== undefined ? (episode.mcidAchieved ? 'Yes' : 'No') : ''
      );
    }

    return baseRow.join(',');
  });

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger download of CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Convert episode data to Excel-compatible format (Tab-separated values)
 */
export function convertToExcel(episodes: ExportEpisode[], includeScores: boolean = false): string {
  if (episodes.length === 0) {
    return '';
  }

  // Define headers
  const headers = [
    'Episode ID',
    'Patient Name',
    'Region',
    'Date of Service',
    'Diagnosis',
    'Clinician',
    'Injury Date',
    'Pain Level',
    'Discharge Date',
    'Status'
  ];

  if (includeScores) {
    headers.push(
      'Index Type',
      'Baseline Score',
      'Final Score',
      'Improvement',
      'MCID Achieved'
    );
  }

  // Create rows with tab separators for Excel
  const rows = episodes.map(episode => {
    const baseRow = [
      episode.id,
      episode.patient_name,
      episode.region,
      format(new Date(episode.date_of_service), 'yyyy-MM-dd'),
      episode.diagnosis || 'Not specified',
      episode.clinician || 'Not specified',
      episode.injury_date ? format(new Date(episode.injury_date), 'yyyy-MM-dd') : '',
      episode.pain_level || '',
      episode.discharge_date ? format(new Date(episode.discharge_date), 'yyyy-MM-dd') : '',
      episode.discharge_date ? 'Completed' : 'Active'
    ];

    if (includeScores) {
      baseRow.push(
        episode.indexType || '',
        episode.baselineScore !== undefined ? episode.baselineScore.toString() : '',
        episode.finalScore !== undefined ? episode.finalScore.toString() : '',
        episode.improvement !== undefined ? episode.improvement.toFixed(1) : '',
        episode.mcidAchieved !== undefined ? (episode.mcidAchieved ? 'Yes' : 'No') : ''
      );
    }

    return baseRow.join('\t');
  });

  return [headers.join('\t'), ...rows].join('\n');
}

/**
 * Trigger download of Excel file
 */
export function downloadExcel(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for export
 */
export function generateExportFilename(prefix: string, extension: 'csv' | 'xls'): string {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const sanitizedPrefix = prefix.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${sanitizedPrefix}_${timestamp}.${extension}`;
}
