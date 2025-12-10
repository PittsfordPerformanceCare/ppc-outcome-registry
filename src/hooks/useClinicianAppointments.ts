import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format, startOfDay, endOfDay } from "date-fns";

export interface ClinicianAppointment {
  id: string;
  patient_name: string;
  patient_email: string | null;
  scheduled_date: string;
  scheduled_time: string;
  status: string | null;
  intake_form_id: string | null;
  // Lead data (if linked)
  lead_id: string | null;
  lead_data: {
    primary_concern: string | null;
    symptom_summary: string | null;
    severity_score: number | null;
    system_category: string | null;
    who_is_this_for: string | null;
    pillar_origin: string | null;
    utm_source: string | null;
    created_at: string | null;
  } | null;
  // Intake form data (if completed)
  intake_form_data: {
    id: string;
    patient_name: string;
    chief_complaint: string;
    medical_history: string | null;
    current_medications: string | null;
    allergies: string | null;
    symptoms: string | null;
    pain_level: number | null;
    referring_physician: string | null;
    primary_care_physician: string | null;
    complaints: any[] | null;
    status: string;
    submitted_at: string | null;
  } | null;
  // Derived fields
  condition_type: "neuro" | "msk" | "pediatric" | "unknown";
  is_referral: boolean;
  form_status: "completed" | "not_completed";
}

interface UseClinicianAppointmentsReturn {
  appointments: ClinicianAppointment[];
  todayAppointments: ClinicianAppointment[];
  upcomingAppointments: ClinicianAppointment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClinicianAppointments(): UseClinicianAppointmentsReturn {
  const [appointments, setAppointments] = useState<ClinicianAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const nextWeek = format(addDays(new Date(), 7), "yyyy-MM-dd");

      // Fetch appointments for next 7 days
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
        .gte("scheduled_date", today)
        .lte("scheduled_date", nextWeek)
        .order("scheduled_date", { ascending: true })
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
            symptoms,
            pain_level,
            referring_physician,
            primary_care_physician,
            complaints,
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
            who_is_this_for,
            pillar_origin,
            utm_source,
            created_at
          `)
          .in("email", patientEmails);

        leads?.forEach(lead => {
          if (lead.email) {
            leadsMap[lead.email.toLowerCase()] = lead;
          }
        });
      }

      // Map appointments with enriched data
      const enrichedAppointments: ClinicianAppointment[] = (appointmentsData || []).map(apt => {
        const intakeForm = apt.intake_form_id ? intakeFormsMap[apt.intake_form_id] : null;
        const lead = apt.patient_email ? leadsMap[apt.patient_email.toLowerCase()] : null;

        // Determine condition type from lead or intake
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
          if (lead.system_category.toLowerCase().includes("neuro")) {
            conditionType = "neuro";
          } else if (lead.system_category.toLowerCase().includes("msk")) {
            conditionType = "msk";
          }
        }

        // Check if referral
        const isReferral = !!intakeForm?.referring_physician || lead?.utm_source === "referral";

        return {
          id: apt.id,
          patient_name: apt.patient_name,
          patient_email: apt.patient_email,
          scheduled_date: apt.scheduled_date,
          scheduled_time: apt.scheduled_time,
          status: apt.status,
          intake_form_id: apt.intake_form_id,
          lead_id: lead?.id || null,
          lead_data: lead ? {
            primary_concern: lead.primary_concern,
            symptom_summary: lead.symptom_summary,
            severity_score: lead.severity_score,
            system_category: lead.system_category,
            who_is_this_for: lead.who_is_this_for,
            pillar_origin: lead.pillar_origin,
            utm_source: lead.utm_source,
            created_at: lead.created_at,
          } : null,
          intake_form_data: intakeForm ? {
            id: intakeForm.id,
            patient_name: intakeForm.patient_name,
            chief_complaint: intakeForm.chief_complaint,
            medical_history: intakeForm.medical_history,
            current_medications: intakeForm.current_medications,
            allergies: intakeForm.allergies,
            symptoms: intakeForm.symptoms,
            pain_level: intakeForm.pain_level,
            referring_physician: intakeForm.referring_physician,
            primary_care_physician: intakeForm.primary_care_physician,
            complaints: intakeForm.complaints,
            status: intakeForm.status,
            submitted_at: intakeForm.submitted_at,
          } : null,
          condition_type: conditionType,
          is_referral: isReferral,
          form_status: intakeForm && intakeForm.status !== "pending" ? "completed" : "not_completed",
        };
      });

      setAppointments(enrichedAppointments);
    } catch (err) {
      console.error("Error fetching clinician appointments:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Split by today vs upcoming
  const today = format(new Date(), "yyyy-MM-dd");
  const todayAppointments = appointments.filter(apt => apt.scheduled_date === today);
  const upcomingAppointments = appointments.filter(apt => apt.scheduled_date > today);

  return {
    appointments,
    todayAppointments,
    upcomingAppointments,
    loading,
    error,
    refetch: fetchAppointments,
  };
}
