import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReadyPatient {
  id: string;
  patientName: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  primaryComplaint: string;
  complaintClassification: 'Neurologic' | 'MSK';
  systemFocus?: string;
  intakeCompletedAt: string;
  isNewPatient: boolean;
  isInternalReferral?: boolean;
  priorEpisodeContext?: string;
  leadId?: string;
  source: 'care_request' | 'intake_form';
}

export interface ClinicalReadinessData {
  newNeuroPatients: ReadyPatient[];
  newMskPatients: ReadyPatient[];
  returningNeuroPatients: ReadyPatient[];
  returningMskPatients: ReadyPatient[];
  internalNeuroPatients: ReadyPatient[];
}

// Classify complaint into Neurologic or MSK
function classifyComplaint(complaint: string): { classification: 'Neurologic' | 'MSK'; systemFocus?: string } {
  const lowerComplaint = complaint.toLowerCase();
  
  const neuroKeywords = [
    'concussion', 'headache', 'migraine', 'dizziness', 'vertigo', 
    'vestibular', 'balance', 'cognitive', 'memory', 'brain', 
    'neurologic', 'neuro', 'tbi', 'post-concussion', 'autonomic',
    'vision', 'light sensitivity', 'fog', 'fatigue'
  ];
  
  const isNeuro = neuroKeywords.some(keyword => lowerComplaint.includes(keyword));
  
  if (isNeuro) {
    let systemFocus = 'General Neurologic';
    if (lowerComplaint.includes('concussion') || lowerComplaint.includes('tbi')) {
      systemFocus = 'Post-Concussion';
    } else if (lowerComplaint.includes('vestibular') || lowerComplaint.includes('dizziness') || lowerComplaint.includes('vertigo')) {
      systemFocus = 'Vestibular';
    } else if (lowerComplaint.includes('autonomic')) {
      systemFocus = 'Autonomic';
    }
    return { classification: 'Neurologic', systemFocus };
  }
  
  return { classification: 'MSK' };
}

// Check if patient has prior episodes
async function checkPriorEpisodes(patientName: string, email?: string): Promise<{ hasPrior: boolean; context?: string }> {
  const normalizedName = patientName.toLowerCase().replace(/\s+/g, ' ').trim();
  
  const { data: episodes } = await supabase
    .from('episodes')
    .select('id, patient_name, region, discharge_date, episode_type')
    .or(`patient_name.ilike.%${normalizedName}%`)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (!episodes || episodes.length === 0) {
    return { hasPrior: false };
  }
  
  // Find matching episodes by normalized name
  const matchingEpisodes = episodes.filter(ep => {
    const epName = ep.patient_name.toLowerCase().replace(/\s+/g, ' ').trim();
    return epName === normalizedName;
  });
  
  if (matchingEpisodes.length === 0) {
    return { hasPrior: false };
  }
  
  const mostRecent = matchingEpisodes[0];
  const wasDischargedRecently = mostRecent.discharge_date && 
    new Date(mostRecent.discharge_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  
  return {
    hasPrior: true,
    context: wasDischargedRecently 
      ? `Discharged from ${mostRecent.region || mostRecent.episode_type || 'prior'} care`
      : `Previous ${mostRecent.region || mostRecent.episode_type || ''} episode`
  };
}

export function useClinicalReadiness() {
  return useQuery({
    queryKey: ['clinical-readiness'],
    queryFn: async (): Promise<ClinicalReadinessData> => {
      // Fetch care requests that are approved but not yet converted to episodes
      const { data: careRequests, error: crError } = await supabase
        .from('care_requests')
        .select('*')
        .is('episode_id', null)
        .in('status', ['APPROVED_FOR_CARE', 'approved'])
        .order('created_at', { ascending: false });
      
      if (crError) throw crError;
      
      // Fetch intakes that have completed but no episode yet
      const { data: intakes, error: intakeError } = await supabase
        .from('intakes')
        .select('*')
        .eq('status', 'completed')
        .order('timestamp_completed', { ascending: false });
      
      if (intakeError) throw intakeError;
      
      // Process care requests into ready patients
      const readyPatients: ReadyPatient[] = [];
      
      for (const cr of careRequests || []) {
        const payload = cr.intake_payload as Record<string, unknown>;
        const patientName = (payload?.patientName || payload?.name || payload?.patient_name || 'Unknown') as string;
        const complaint = (cr.primary_complaint || payload?.primary_concern || payload?.chiefComplaint || '') as string;
        const { classification, systemFocus } = classifyComplaint(complaint);
        const priorCheck = await checkPriorEpisodes(patientName, payload?.email as string);
        
        // Detect internal referrals (from clinic staff or other clinicians)
        const isInternal = cr.source === 'internal' || 
          (payload?.referral_source as string)?.toLowerCase()?.includes('internal') ||
          (payload?.referral_source as string)?.toLowerCase()?.includes('clinician');
        
        readyPatients.push({
          id: cr.id,
          patientName,
          dateOfBirth: payload?.date_of_birth as string,
          email: payload?.email as string,
          phone: payload?.phone as string,
          primaryComplaint: complaint,
          complaintClassification: classification,
          systemFocus,
          intakeCompletedAt: cr.approved_at || cr.created_at,
          isNewPatient: !priorCheck.hasPrior,
          isInternalReferral: isInternal,
          priorEpisodeContext: priorCheck.context,
          leadId: (payload?.lead_id as string) || undefined,
          source: 'care_request'
        });
      }
      
      // Process completed intakes that may not have care requests
      for (const intake of intakes || []) {
        // Skip if we already have this patient from care requests
        const alreadyIncluded = readyPatients.some(p => 
          p.email === intake.patient_email || 
          p.patientName.toLowerCase().replace(/\s+/g, ' ').trim() === 
            (intake.patient_name || '').toLowerCase().replace(/\s+/g, ' ').trim()
        );
        
        if (alreadyIncluded) continue;
        
        const formData = intake.form_data as Record<string, unknown>;
        const complaint = (formData?.chiefComplaint || formData?.primary_concern || '') as string;
        const { classification, systemFocus } = classifyComplaint(complaint);
        const priorCheck = await checkPriorEpisodes(intake.patient_name || '', intake.patient_email || undefined);
        
        readyPatients.push({
          id: intake.id,
          patientName: intake.patient_name || 'Unknown',
          email: intake.patient_email || undefined,
          phone: intake.patient_phone || undefined,
          primaryComplaint: complaint,
          complaintClassification: classification,
          systemFocus,
          intakeCompletedAt: intake.timestamp_completed || intake.created_at,
          isNewPatient: !priorCheck.hasPrior,
          isInternalReferral: false,
          priorEpisodeContext: priorCheck.context,
          leadId: intake.lead_id || undefined,
          source: 'care_request'
        });
      }
      
      // Categorize patients into 5 groups
      const newNeuroPatients = readyPatients.filter(p => 
        p.isNewPatient && p.complaintClassification === 'Neurologic' && !p.isInternalReferral
      );
      const newMskPatients = readyPatients.filter(p => 
        p.isNewPatient && p.complaintClassification === 'MSK' && !p.isInternalReferral
      );
      const returningNeuroPatients = readyPatients.filter(p => 
        !p.isNewPatient && p.complaintClassification === 'Neurologic' && !p.isInternalReferral
      );
      const returningMskPatients = readyPatients.filter(p => 
        !p.isNewPatient && p.complaintClassification === 'MSK' && !p.isInternalReferral
      );
      const internalNeuroPatients = readyPatients.filter(p => 
        p.isInternalReferral && p.complaintClassification === 'Neurologic'
      );
      
      return { 
        newNeuroPatients, 
        newMskPatients, 
        returningNeuroPatients, 
        returningMskPatients, 
        internalNeuroPatients 
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
