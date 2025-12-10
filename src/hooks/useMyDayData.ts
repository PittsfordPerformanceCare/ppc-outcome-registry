import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, subDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

// Types for appointments (NPEs and Follow-ups)
export interface TodayAppointment {
  id: string;
  patient_name: string;
  patient_email: string | null;
  scheduled_date: string;
  scheduled_time: string;
  status: string | null;
  intake_form_id: string | null;
  appointment_type: "npe" | "followup";
  // Lead data
  lead_data: {
    primary_concern: string | null;
    symptom_summary: string | null;
    severity_score: number | null;
    system_category: string | null;
    pillar_origin: string | null;
  } | null;
  // Intake form data
  intake_form_data: {
    id: string;
    patient_name: string;
    chief_complaint: string;
    medical_history: string | null;
    current_medications: string | null;
    allergies: string | null;
    pain_level: number | null;
    referring_physician: string | null;
    status: string;
    submitted_at: string | null;
  } | null;
  // Episode data (for follow-ups)
  episode_data: {
    id: string;
    patient_name: string;
    region: string;
    current_status: string | null;
    start_date: string | null;
    discharge_date: string | null;
    clinician: string | null;
    episode_type: string | null;
  } | null;
  // Derived fields
  condition_type: "neuro" | "msk" | "pediatric" | "unknown";
  is_referral: boolean;
  form_status: "completed" | "not_completed";
}

// Types for episodes needing action
export interface EpisodeNeedingAction {
  id: string;
  patient_name: string;
  region: string;
  current_status: string | null;
  start_date: string | null;
  discharge_date: string | null;
  followup_date: string | null;
  clinician: string | null;
  episode_type: string | null;
  has_ortho_referral: boolean | null;
  return_to_registry_required: boolean | null;
  days_since_start: number | null;
  action_type: "ready_for_discharge" | "needs_followup" | "overdue_followup" | "pending_ortho_return" | "needs_attention";
  action_label: string;
}

interface UseMyDayDataReturn {
  todayNPEs: TodayAppointment[];
  todayFollowups: TodayAppointment[];
  episodesNeedingAction: EpisodeNeedingAction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMyDayData(): UseMyDayDataReturn {
  const { user } = useAuth();
  const [todayNPEs, setTodayNPEs] = useState<TodayAppointment[]>([]);
  const [todayFollowups, setTodayFollowups] = useState<TodayAppointment[]>([]);
  const [episodesNeedingAction, setEpisodesNeedingAction] = useState<EpisodeNeedingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // ===== FETCH TODAY'S APPOINTMENTS (NPEs) =====
      const { data: appointmentsData, error: aptError } = await supabase
        .from("intake_appointments")
        .select(`
          id,
          patient_name,
          patient_email,
          scheduled_date,
          scheduled_time,
          status,
          intake_form_id
        `)
        .eq("scheduled_date", today)
        .order("scheduled_time", { ascending: true });

      if (aptError) throw aptError;

      // Get intake form IDs that exist
      const intakeFormIds = (appointmentsData || [])
        .filter(apt => apt.intake_form_id)
        .map(apt => apt.intake_form_id as string);

      // Fetch intake forms if any exist
      let intakeFormsMap: Record<string, any> = {};
      if (intakeFormIds.length > 0) {
        const { data: intakeForms } = await supabase
          .from("intake_forms")
          .select(`
            id,
            patient_name,
            chief_complaint,
            medical_history,
            current_medications,
            allergies,
            pain_level,
            referring_physician,
            status,
            submitted_at
          `)
          .in("id", intakeFormIds);

        intakeForms?.forEach(form => {
          intakeFormsMap[form.id] = form;
        });
      }

      // Get patient emails to find matching leads
      const patientEmails = (appointmentsData || [])
        .filter(apt => apt.patient_email)
        .map(apt => apt.patient_email as string);

      // Fetch leads by email match
      let leadsMap: Record<string, any> = {};
      if (patientEmails.length > 0) {
        const { data: leads } = await supabase
          .from("leads")
          .select(`
            id,
            email,
            primary_concern,
            symptom_summary,
            severity_score,
            system_category,
            pillar_origin
          `)
          .in("email", patientEmails);

        leads?.forEach(lead => {
          if (lead.email) {
            leadsMap[lead.email.toLowerCase()] = lead;
          }
        });
      }

      // Map NPE appointments
      const npeAppointments: TodayAppointment[] = (appointmentsData || []).map(apt => {
        const intakeForm = apt.intake_form_id ? intakeFormsMap[apt.intake_form_id] : null;
        const lead = apt.patient_email ? leadsMap[apt.patient_email.toLowerCase()] : null;

        // Determine condition type
        let conditionType: "neuro" | "msk" | "pediatric" | "unknown" = "unknown";
        if (lead?.pillar_origin) {
          if (lead.pillar_origin.toLowerCase().includes("neuro") || lead.pillar_origin.toLowerCase().includes("concussion")) {
            conditionType = "neuro";
          } else if (lead.pillar_origin.toLowerCase().includes("msk")) {
            conditionType = "msk";
          } else if (lead.pillar_origin.toLowerCase().includes("pediatric")) {
            conditionType = "pediatric";
          }
        } else if (lead?.system_category) {
          const cat = lead.system_category.toLowerCase();
          if (cat.includes("neuro")) conditionType = "neuro";
          else if (cat.includes("msk")) conditionType = "msk";
        }

        const isReferral = !!intakeForm?.referring_physician;

        return {
          id: apt.id,
          patient_name: apt.patient_name,
          patient_email: apt.patient_email,
          scheduled_date: apt.scheduled_date,
          scheduled_time: apt.scheduled_time,
          status: apt.status,
          intake_form_id: apt.intake_form_id,
          appointment_type: "npe" as const,
          lead_data: lead ? {
            primary_concern: lead.primary_concern,
            symptom_summary: lead.symptom_summary,
            severity_score: lead.severity_score,
            system_category: lead.system_category,
            pillar_origin: lead.pillar_origin,
          } : null,
          intake_form_data: intakeForm ? {
            id: intakeForm.id,
            patient_name: intakeForm.patient_name,
            chief_complaint: intakeForm.chief_complaint,
            medical_history: intakeForm.medical_history,
            current_medications: intakeForm.current_medications,
            allergies: intakeForm.allergies,
            pain_level: intakeForm.pain_level,
            referring_physician: intakeForm.referring_physician,
            status: intakeForm.status,
            submitted_at: intakeForm.submitted_at,
          } : null,
          episode_data: null,
          condition_type: conditionType,
          is_referral: isReferral,
          form_status: intakeForm && intakeForm.status !== "pending" ? "completed" : "not_completed",
        };
      });

      setTodayNPEs(npeAppointments);

      // ===== FETCH TODAY'S FOLLOW-UPS FROM EPISODES =====
      const { data: followupsData, error: followupError } = await supabase
        .from("followups")
        .select(`
          id,
          episode_id,
          scheduled_date,
          scheduled_time,
          status,
          completed
        `)
        .eq("scheduled_date", today)
        .eq("completed", false)
        .order("scheduled_time", { ascending: true });

      if (followupError) throw followupError;

      // Get episode IDs for follow-ups
      const episodeIds = (followupsData || []).map(f => f.episode_id);
      
      let episodesMap: Record<string, any> = {};
      if (episodeIds.length > 0) {
        const { data: episodes } = await supabase
          .from("episodes")
          .select(`
            id,
            patient_name,
            region,
            current_status,
            start_date,
            discharge_date,
            clinician,
            episode_type
          `)
          .in("id", episodeIds);

        episodes?.forEach(ep => {
          episodesMap[ep.id] = ep;
        });
      }

      // Map follow-up appointments
      const followupAppointments: TodayAppointment[] = (followupsData || []).map(fu => {
        const episode = episodesMap[fu.episode_id];
        
        let conditionType: "neuro" | "msk" | "pediatric" | "unknown" = "unknown";
        if (episode?.episode_type) {
          const type = episode.episode_type.toLowerCase();
          if (type.includes("neuro") || type.includes("concussion")) conditionType = "neuro";
          else if (type.includes("msk")) conditionType = "msk";
          else if (type.includes("pediatric")) conditionType = "pediatric";
        }

        return {
          id: fu.id,
          patient_name: episode?.patient_name || "Unknown Patient",
          patient_email: null,
          scheduled_date: fu.scheduled_date,
          scheduled_time: fu.scheduled_time || "09:00",
          status: fu.status,
          intake_form_id: null,
          appointment_type: "followup" as const,
          lead_data: null,
          intake_form_data: null,
          episode_data: episode ? {
            id: episode.id,
            patient_name: episode.patient_name,
            region: episode.region,
            current_status: episode.current_status,
            start_date: episode.start_date,
            discharge_date: episode.discharge_date,
            clinician: episode.clinician,
            episode_type: episode.episode_type,
          } : null,
          condition_type: conditionType,
          is_referral: false,
          form_status: "completed" as const,
        };
      });

      setTodayFollowups(followupAppointments);

      // ===== FETCH EPISODES NEEDING ACTION =====
      // Get active episodes that may need attention
      const { data: activeEpisodes, error: episodesError } = await supabase
        .from("episodes")
        .select(`
          id,
          patient_name,
          region,
          current_status,
          start_date,
          discharge_date,
          followup_date,
          clinician,
          episode_type,
          has_ortho_referral,
          return_to_registry_required,
          visits
        `)
        .is("discharge_date", null)
        .order("start_date", { ascending: true });

      if (episodesError) throw episodesError;

      // Process episodes to determine which need action
      const actionableEpisodes: EpisodeNeedingAction[] = [];

      (activeEpisodes || []).forEach(ep => {
        const startDate = ep.start_date ? new Date(ep.start_date) : null;
        const daysSinceStart = startDate 
          ? Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        // Check for overdue follow-up
        if (ep.followup_date) {
          const followupDate = new Date(ep.followup_date);
          const isOverdue = followupDate < new Date();
          if (isOverdue) {
            actionableEpisodes.push({
              id: ep.id,
              patient_name: ep.patient_name,
              region: ep.region,
              current_status: ep.current_status,
              start_date: ep.start_date,
              discharge_date: ep.discharge_date,
              followup_date: ep.followup_date,
              clinician: ep.clinician,
              episode_type: ep.episode_type,
              has_ortho_referral: ep.has_ortho_referral,
              return_to_registry_required: ep.return_to_registry_required,
              days_since_start: daysSinceStart,
              action_type: "overdue_followup",
              action_label: "Overdue Follow-up",
            });
            return; // Skip other checks for this episode
          }
        }

        // Check for ortho return pending
        if (ep.has_ortho_referral && ep.return_to_registry_required) {
          actionableEpisodes.push({
            id: ep.id,
            patient_name: ep.patient_name,
            region: ep.region,
            current_status: ep.current_status,
            start_date: ep.start_date,
            discharge_date: ep.discharge_date,
            followup_date: ep.followup_date,
            clinician: ep.clinician,
            episode_type: ep.episode_type,
            has_ortho_referral: ep.has_ortho_referral,
            return_to_registry_required: ep.return_to_registry_required,
            days_since_start: daysSinceStart,
            action_type: "pending_ortho_return",
            action_label: "Pending Ortho Return",
          });
          return;
        }

        // Check for episodes that may be ready for discharge (> 30 days, no recent activity)
        if (daysSinceStart && daysSinceStart > 30) {
          const visits = parseInt(ep.visits || "0");
          if (visits >= 3) {
            actionableEpisodes.push({
              id: ep.id,
              patient_name: ep.patient_name,
              region: ep.region,
              current_status: ep.current_status,
              start_date: ep.start_date,
              discharge_date: ep.discharge_date,
              followup_date: ep.followup_date,
              clinician: ep.clinician,
              episode_type: ep.episode_type,
              has_ortho_referral: ep.has_ortho_referral,
              return_to_registry_required: ep.return_to_registry_required,
              days_since_start: daysSinceStart,
              action_type: "ready_for_discharge",
              action_label: "Review for Discharge",
            });
            return;
          }
        }

        // Check for episodes needing follow-up scheduling (no followup_date set, > 14 days)
        if (!ep.followup_date && daysSinceStart && daysSinceStart > 14) {
          actionableEpisodes.push({
            id: ep.id,
            patient_name: ep.patient_name,
            region: ep.region,
            current_status: ep.current_status,
            start_date: ep.start_date,
            discharge_date: ep.discharge_date,
            followup_date: ep.followup_date,
            clinician: ep.clinician,
            episode_type: ep.episode_type,
            has_ortho_referral: ep.has_ortho_referral,
            return_to_registry_required: ep.return_to_registry_required,
            days_since_start: daysSinceStart,
            action_type: "needs_followup",
            action_label: "Schedule Follow-up",
          });
        }
      });

      setEpisodesNeedingAction(actionableEpisodes);

    } catch (err) {
      console.error("Error fetching My Day data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    todayNPEs,
    todayFollowups,
    episodesNeedingAction,
    loading,
    error,
    refetch: fetchData,
  };
}
