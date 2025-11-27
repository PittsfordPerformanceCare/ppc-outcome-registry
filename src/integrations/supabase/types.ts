export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          achievement_type: string
          badge_color: string
          badge_icon: string
          created_at: string
          criteria: Json
          description: string
          id: string
          name: string
          points_required: number | null
        }
        Insert: {
          achievement_type: string
          badge_color: string
          badge_icon: string
          created_at?: string
          criteria: Json
          description: string
          id?: string
          name: string
          points_required?: number | null
        }
        Update: {
          achievement_type?: string
          badge_color?: string
          badge_icon?: string
          created_at?: string
          criteria?: Json
          description?: string
          id?: string
          name?: string
          points_required?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          clinic_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          clinic_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          clinic_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_settings: {
        Row: {
          address: string | null
          clinic_name: string
          created_at: string
          discharge_email_subject: string | null
          discharge_email_template: string | null
          discharge_sms_template: string | null
          email: string | null
          email_subject: string | null
          email_template: string | null
          id: string
          logo_url: string | null
          outcome_reminder_email_subject: string | null
          outcome_reminder_email_template: string | null
          outcome_reminder_enabled: boolean | null
          outcome_reminder_interval_days: number | null
          outcome_reminder_sms_template: string | null
          phone: string | null
          reminder_email_subject: string | null
          reminder_email_template: string | null
          reminder_enabled: boolean | null
          reminder_hours_before: number | null
          reminder_sms_template: string | null
          sms_template: string | null
          tagline: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          clinic_name?: string
          created_at?: string
          discharge_email_subject?: string | null
          discharge_email_template?: string | null
          discharge_sms_template?: string | null
          email?: string | null
          email_subject?: string | null
          email_template?: string | null
          id?: string
          logo_url?: string | null
          outcome_reminder_email_subject?: string | null
          outcome_reminder_email_template?: string | null
          outcome_reminder_enabled?: boolean | null
          outcome_reminder_interval_days?: number | null
          outcome_reminder_sms_template?: string | null
          phone?: string | null
          reminder_email_subject?: string | null
          reminder_email_template?: string | null
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          reminder_sms_template?: string | null
          sms_template?: string | null
          tagline?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          clinic_name?: string
          created_at?: string
          discharge_email_subject?: string | null
          discharge_email_template?: string | null
          discharge_sms_template?: string | null
          email?: string | null
          email_subject?: string | null
          email_template?: string | null
          id?: string
          logo_url?: string | null
          outcome_reminder_email_subject?: string | null
          outcome_reminder_email_template?: string | null
          outcome_reminder_enabled?: boolean | null
          outcome_reminder_interval_days?: number | null
          outcome_reminder_sms_template?: string | null
          phone?: string | null
          reminder_email_subject?: string | null
          reminder_email_template?: string | null
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          reminder_sms_template?: string | null
          sms_template?: string | null
          tagline?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      clinician_notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          notification_email: string | null
          notify_on_callback_request: boolean
          notify_on_new_message: boolean
          notify_on_pending_feedback: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          notification_email?: string | null
          notify_on_callback_request?: boolean
          notify_on_new_message?: boolean
          notify_on_pending_feedback?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          notification_email?: string | null
          notify_on_callback_request?: boolean
          notify_on_new_message?: boolean
          notify_on_pending_feedback?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clinics: {
        Row: {
          created_at: string
          id: string
          license_expires_at: string | null
          license_status: string | null
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          license_expires_at?: string | null
          license_status?: string | null
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          license_expires_at?: string | null
          license_status?: string | null
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      comparison_report_clicks: {
        Row: {
          clicked_at: string
          created_at: string
          delivery_id: string
          id: string
          ip_address: unknown
          link_label: string | null
          link_url: string
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string
          created_at?: string
          delivery_id: string
          id?: string
          ip_address?: unknown
          link_label?: string | null
          link_url: string
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string
          created_at?: string
          delivery_id?: string
          id?: string
          ip_address?: unknown
          link_label?: string | null
          link_url?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comparison_report_clicks_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "comparison_report_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_report_deliveries: {
        Row: {
          click_count: number | null
          clinic_id: string | null
          created_at: string
          delivery_details: Json | null
          error_message: string | null
          export_ids: string[]
          export_names: string[]
          first_clicked_at: string | null
          id: string
          open_count: number | null
          opened_at: string | null
          recipient_emails: string[]
          schedule_id: string
          sent_at: string
          status: string
          tracking_id: string | null
          user_id: string
        }
        Insert: {
          click_count?: number | null
          clinic_id?: string | null
          created_at?: string
          delivery_details?: Json | null
          error_message?: string | null
          export_ids: string[]
          export_names?: string[]
          first_clicked_at?: string | null
          id?: string
          open_count?: number | null
          opened_at?: string | null
          recipient_emails: string[]
          schedule_id: string
          sent_at?: string
          status: string
          tracking_id?: string | null
          user_id: string
        }
        Update: {
          click_count?: number | null
          clinic_id?: string | null
          created_at?: string
          delivery_details?: Json | null
          error_message?: string | null
          export_ids?: string[]
          export_names?: string[]
          first_clicked_at?: string | null
          id?: string
          open_count?: number | null
          opened_at?: string | null
          recipient_emails?: string[]
          schedule_id?: string
          sent_at?: string
          status?: string
          tracking_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparison_report_deliveries_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "comparison_report_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_report_schedules: {
        Row: {
          clinic_id: string | null
          created_at: string
          enabled: boolean
          export_ids: string[]
          frequency: string
          id: string
          last_sent_at: string | null
          name: string
          next_send_at: string
          recipient_emails: string[]
          send_day: string
          send_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          export_ids: string[]
          frequency: string
          id?: string
          last_sent_at?: string | null
          name: string
          next_send_at: string
          recipient_emails?: string[]
          send_day: string
          send_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          export_ids?: string[]
          frequency?: string
          id?: string
          last_sent_at?: string | null
          name?: string
          next_send_at?: string
          recipient_emails?: string[]
          send_day?: string
          send_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparison_report_schedules_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_email_templates: {
        Row: {
          category: string
          clinic_id: string
          created_at: string
          description: string | null
          html: string
          id: string
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          category: string
          clinic_id: string
          created_at?: string
          description?: string | null
          html: string
          id?: string
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          clinic_id?: string
          created_at?: string
          description?: string | null
          html?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_template_usage: {
        Row: {
          clinic_id: string
          created_at: string
          custom_template_id: string | null
          episode_id: string | null
          id: string
          notification_id: string | null
          patient_email: string | null
          sent_at: string
          template_id: string
          template_name: string
          template_type: string
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          custom_template_id?: string | null
          episode_id?: string | null
          id?: string
          notification_id?: string | null
          patient_email?: string | null
          sent_at?: string
          template_id: string
          template_name: string
          template_type: string
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          custom_template_id?: string | null
          episode_id?: string | null
          id?: string
          notification_id?: string | null
          patient_email?: string | null
          sent_at?: string
          template_id?: string
          template_name?: string
          template_type?: string
          user_id?: string
        }
        Relationships: []
      }
      episodes: {
        Row: {
          cis_delta: number | null
          cis_post: number | null
          cis_pre: number | null
          clinic_id: string | null
          clinical_impression: string | null
          clinician: string | null
          complaint_priority: number | null
          compliance_notes: string | null
          compliance_rating: string | null
          created_at: string
          date_of_birth: string | null
          date_of_service: string
          diagnosis: string | null
          discharge_date: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          episode_type: string | null
          followup_date: string | null
          followup_time: string | null
          functional_limitation: string | null
          functional_limitations: string[] | null
          goals_other: string | null
          id: string
          injury_date: string | null
          injury_mechanism: string | null
          insurance: string | null
          medical_history: string | null
          medications: string | null
          npi: string | null
          pain_delta: number | null
          pain_level: string | null
          pain_post: number | null
          pain_pre: number | null
          patient_name: string
          pcp_action_items: Json | null
          prior_treatments: Json | null
          prior_treatments_other: string | null
          referral_reason: string | null
          referred_out: boolean | null
          referring_physician: string | null
          region: string
          reminder_sent_at: string | null
          resolution_days: string | null
          return_to_function_items: Json | null
          source_intake_form_id: string | null
          start_date: string | null
          treatment_goals: Json | null
          updated_at: string
          user_id: string
          visits: string | null
        }
        Insert: {
          cis_delta?: number | null
          cis_post?: number | null
          cis_pre?: number | null
          clinic_id?: string | null
          clinical_impression?: string | null
          clinician?: string | null
          complaint_priority?: number | null
          compliance_notes?: string | null
          compliance_rating?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_service: string
          diagnosis?: string | null
          discharge_date?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          episode_type?: string | null
          followup_date?: string | null
          followup_time?: string | null
          functional_limitation?: string | null
          functional_limitations?: string[] | null
          goals_other?: string | null
          id: string
          injury_date?: string | null
          injury_mechanism?: string | null
          insurance?: string | null
          medical_history?: string | null
          medications?: string | null
          npi?: string | null
          pain_delta?: number | null
          pain_level?: string | null
          pain_post?: number | null
          pain_pre?: number | null
          patient_name: string
          pcp_action_items?: Json | null
          prior_treatments?: Json | null
          prior_treatments_other?: string | null
          referral_reason?: string | null
          referred_out?: boolean | null
          referring_physician?: string | null
          region: string
          reminder_sent_at?: string | null
          resolution_days?: string | null
          return_to_function_items?: Json | null
          source_intake_form_id?: string | null
          start_date?: string | null
          treatment_goals?: Json | null
          updated_at?: string
          user_id: string
          visits?: string | null
        }
        Update: {
          cis_delta?: number | null
          cis_post?: number | null
          cis_pre?: number | null
          clinic_id?: string | null
          clinical_impression?: string | null
          clinician?: string | null
          complaint_priority?: number | null
          compliance_notes?: string | null
          compliance_rating?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_service?: string
          diagnosis?: string | null
          discharge_date?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          episode_type?: string | null
          followup_date?: string | null
          followup_time?: string | null
          functional_limitation?: string | null
          functional_limitations?: string[] | null
          goals_other?: string | null
          id?: string
          injury_date?: string | null
          injury_mechanism?: string | null
          insurance?: string | null
          medical_history?: string | null
          medications?: string | null
          npi?: string | null
          pain_delta?: number | null
          pain_level?: string | null
          pain_post?: number | null
          pain_pre?: number | null
          patient_name?: string
          pcp_action_items?: Json | null
          prior_treatments?: Json | null
          prior_treatments_other?: string | null
          referral_reason?: string | null
          referred_out?: boolean | null
          referring_physician?: string | null
          region?: string
          reminder_sent_at?: string | null
          resolution_days?: string | null
          return_to_function_items?: Json | null
          source_intake_form_id?: string | null
          start_date?: string | null
          treatment_goals?: Json | null
          updated_at?: string
          user_id?: string
          visits?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_source_intake_form_id_fkey"
            columns: ["source_intake_form_id"]
            isOneToOne: false
            referencedRelation: "intake_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      export_history: {
        Row: {
          clinic_id: string | null
          created_at: string
          error_message: string | null
          executed_at: string
          export_id: string
          export_name: string
          export_type: string
          id: string
          recipient_emails: string[]
          record_count: number | null
          status: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          error_message?: string | null
          executed_at?: string
          export_id: string
          export_name: string
          export_type: string
          id?: string
          recipient_emails: string[]
          record_count?: number | null
          status: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          error_message?: string | null
          executed_at?: string
          export_id?: string
          export_name?: string
          export_type?: string
          id?: string
          recipient_emails?: string[]
          record_count?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      export_templates: {
        Row: {
          clinic_id: string | null
          created_at: string
          description: string | null
          export_type: string
          filters: Json
          id: string
          is_shared: boolean
          name: string
          recipient_emails: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          export_type: string
          filters?: Json
          id?: string
          is_shared?: boolean
          name: string
          recipient_emails?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          export_type?: string
          filters?: Json
          id?: string
          is_shared?: boolean
          name?: string
          recipient_emails?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          clinic_id: string | null
          completed: boolean | null
          completed_date: string | null
          created_at: string
          episode_id: string
          id: string
          reminder_sent_at: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string
          episode_id: string
          id?: string
          reminder_sent_at?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string
          episode_id?: string
          id?: string
          reminder_sent_at?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followups_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_forms: {
        Row: {
          access_code: string
          address: string | null
          allergies: string | null
          bill_responsible_party: string | null
          chief_complaint: string
          complaints: Json | null
          consent_clinic_updates: boolean | null
          consent_date: string | null
          consent_signature: string | null
          consent_signed_name: string | null
          converted_to_episode_id: string | null
          created_at: string | null
          current_medications: string | null
          date_of_birth: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          guardian_phone: string | null
          hipaa_acknowledged: boolean | null
          hipaa_date: string | null
          hipaa_signed_name: string | null
          hospitalization_history: string | null
          id: string
          injury_date: string | null
          injury_mechanism: string | null
          insurance_id: string | null
          insurance_provider: string | null
          medical_history: string | null
          opt_out_newsletter: boolean | null
          pain_level: number | null
          patient_name: string
          pcp_address: string | null
          pcp_phone: string | null
          phone: string | null
          primary_care_physician: string | null
          referral_code: string | null
          referral_source: string | null
          referring_physician: string | null
          review_of_systems: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          specialist_seen: string | null
          status: string
          submitted_at: string | null
          surgery_history: string | null
          symptoms: string | null
          updated_at: string | null
        }
        Insert: {
          access_code: string
          address?: string | null
          allergies?: string | null
          bill_responsible_party?: string | null
          chief_complaint: string
          complaints?: Json | null
          consent_clinic_updates?: boolean | null
          consent_date?: string | null
          consent_signature?: string | null
          consent_signed_name?: string | null
          converted_to_episode_id?: string | null
          created_at?: string | null
          current_medications?: string | null
          date_of_birth: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          guardian_phone?: string | null
          hipaa_acknowledged?: boolean | null
          hipaa_date?: string | null
          hipaa_signed_name?: string | null
          hospitalization_history?: string | null
          id?: string
          injury_date?: string | null
          injury_mechanism?: string | null
          insurance_id?: string | null
          insurance_provider?: string | null
          medical_history?: string | null
          opt_out_newsletter?: boolean | null
          pain_level?: number | null
          patient_name: string
          pcp_address?: string | null
          pcp_phone?: string | null
          phone?: string | null
          primary_care_physician?: string | null
          referral_code?: string | null
          referral_source?: string | null
          referring_physician?: string | null
          review_of_systems?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialist_seen?: string | null
          status?: string
          submitted_at?: string | null
          surgery_history?: string | null
          symptoms?: string | null
          updated_at?: string | null
        }
        Update: {
          access_code?: string
          address?: string | null
          allergies?: string | null
          bill_responsible_party?: string | null
          chief_complaint?: string
          complaints?: Json | null
          consent_clinic_updates?: boolean | null
          consent_date?: string | null
          consent_signature?: string | null
          consent_signed_name?: string | null
          converted_to_episode_id?: string | null
          created_at?: string | null
          current_medications?: string | null
          date_of_birth?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          guardian_phone?: string | null
          hipaa_acknowledged?: boolean | null
          hipaa_date?: string | null
          hipaa_signed_name?: string | null
          hospitalization_history?: string | null
          id?: string
          injury_date?: string | null
          injury_mechanism?: string | null
          insurance_id?: string | null
          insurance_provider?: string | null
          medical_history?: string | null
          opt_out_newsletter?: boolean | null
          pain_level?: number | null
          patient_name?: string
          pcp_address?: string | null
          pcp_phone?: string | null
          phone?: string | null
          primary_care_physician?: string | null
          referral_code?: string | null
          referral_source?: string | null
          referring_physician?: string | null
          review_of_systems?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialist_seen?: string | null
          status?: string
          submitted_at?: string | null
          surgery_history?: string | null
          symptoms?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      intake_progress: {
        Row: {
          completed: boolean | null
          created_at: string
          expires_at: string
          form_data: Json
          id: string
          last_accessed_at: string | null
          patient_email: string | null
          patient_name: string | null
          patient_phone: string | null
          token: string
          updated_at: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          expires_at: string
          form_data?: Json
          id?: string
          last_accessed_at?: string | null
          patient_email?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          expires_at?: string
          form_data?: Json
          id?: string
          last_accessed_at?: string | null
          patient_email?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      merge_report_presets: {
        Row: {
          clinic_id: string | null
          created_at: string
          date_from: string
          date_to: string
          id: string
          is_shared: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          date_from: string
          date_to: string
          id?: string
          is_shared?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          date_from?: string
          date_to?: string
          id?: string
          is_shared?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merge_report_presets_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_alert_config: {
        Row: {
          alert_recipients: string[]
          check_window_hours: number
          clinic_id: string | null
          cooldown_hours: number
          created_at: string
          enabled: boolean
          failure_rate_threshold: number
          id: string
          min_notifications_required: number
          updated_at: string
        }
        Insert: {
          alert_recipients?: string[]
          check_window_hours?: number
          clinic_id?: string | null
          cooldown_hours?: number
          created_at?: string
          enabled?: boolean
          failure_rate_threshold?: number
          id?: string
          min_notifications_required?: number
          updated_at?: string
        }
        Update: {
          alert_recipients?: string[]
          check_window_hours?: number
          clinic_id?: string | null
          cooldown_hours?: number
          created_at?: string
          enabled?: boolean
          failure_rate_threshold?: number
          id?: string
          min_notifications_required?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_alert_config_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_alert_history: {
        Row: {
          alert_details: Json | null
          alert_sent_to: string[]
          config_id: string | null
          created_at: string
          failed_notifications: number
          failure_rate: number
          id: string
          total_notifications: number
          triggered_at: string
        }
        Insert: {
          alert_details?: Json | null
          alert_sent_to: string[]
          config_id?: string | null
          created_at?: string
          failed_notifications: number
          failure_rate: number
          id?: string
          total_notifications: number
          triggered_at?: string
        }
        Update: {
          alert_details?: Json | null
          alert_sent_to?: string[]
          config_id?: string | null
          created_at?: string
          failed_notifications?: number
          failure_rate?: number
          id?: string
          total_notifications?: number
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_alert_history_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "notification_alert_config"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_link_clicks: {
        Row: {
          clicked_at: string
          created_at: string
          id: string
          ip_address: unknown
          link_label: string | null
          link_url: string
          notification_id: string
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          link_label?: string | null
          link_url: string
          notification_id: string
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          link_label?: string | null
          link_url?: string
          notification_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_link_clicks_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications_history"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_history: {
        Row: {
          click_count: number | null
          clinic_id: string | null
          clinician_name: string
          created_at: string
          delivery_details: Json | null
          episode_id: string
          error_message: string | null
          first_clicked_at: string | null
          id: string
          last_retry_at: string | null
          max_retries: number | null
          next_retry_at: string | null
          notification_type: string
          open_count: number | null
          opened_at: string | null
          patient_email: string | null
          patient_name: string
          patient_phone: string | null
          retry_count: number | null
          sent_at: string
          status: string
          tracking_id: string | null
          user_id: string
        }
        Insert: {
          click_count?: number | null
          clinic_id?: string | null
          clinician_name: string
          created_at?: string
          delivery_details?: Json | null
          episode_id: string
          error_message?: string | null
          first_clicked_at?: string | null
          id?: string
          last_retry_at?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          notification_type: string
          open_count?: number | null
          opened_at?: string | null
          patient_email?: string | null
          patient_name: string
          patient_phone?: string | null
          retry_count?: number | null
          sent_at?: string
          status: string
          tracking_id?: string | null
          user_id: string
        }
        Update: {
          click_count?: number | null
          clinic_id?: string | null
          clinician_name?: string
          created_at?: string
          delivery_details?: Json | null
          episode_id?: string
          error_message?: string | null
          first_clicked_at?: string | null
          id?: string
          last_retry_at?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          notification_type?: string
          open_count?: number | null
          opened_at?: string | null
          patient_email?: string | null
          patient_name?: string
          patient_phone?: string | null
          retry_count?: number | null
          sent_at?: string
          status?: string
          tracking_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      outcome_reminder_report_deliveries: {
        Row: {
          clinic_id: string | null
          created_at: string
          error_message: string | null
          id: string
          recipient_emails: string[]
          report_data: Json | null
          schedule_id: string
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_emails: string[]
          report_data?: Json | null
          schedule_id: string
          sent_at?: string
          status: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_emails?: string[]
          report_data?: Json | null
          schedule_id?: string
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcome_reminder_report_deliveries_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "outcome_reminder_report_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      outcome_reminder_report_schedules: {
        Row: {
          clinic_id: string | null
          created_at: string
          enabled: boolean
          frequency: string
          id: string
          last_sent_at: string | null
          name: string
          next_send_at: string
          recipient_emails: string[]
          send_day: string
          send_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          frequency: string
          id?: string
          last_sent_at?: string | null
          name: string
          next_send_at: string
          recipient_emails?: string[]
          send_day: string
          send_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_sent_at?: string | null
          name?: string
          next_send_at?: string
          recipient_emails?: string[]
          send_day?: string
          send_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      outcome_scores: {
        Row: {
          clinic_id: string | null
          created_at: string
          episode_id: string
          id: string
          index_type: string
          recorded_at: string
          score: number
          score_type: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          episode_id: string
          id?: string
          index_type: string
          recorded_at?: string
          score: number
          score_type: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          episode_id?: string
          id?: string
          index_type?: string
          recorded_at?: string
          score?: number
          score_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcome_scores_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcome_scores_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcome_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_accounts: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          profile_image_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patient_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          episode_id: string | null
          id: string
          metadata: Json | null
          patient_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          episode_id?: string | null
          id?: string
          metadata?: Json | null
          patient_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          episode_id?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_episode_access: {
        Row: {
          code_used_at: string | null
          created_at: string
          episode_id: string
          granted_at: string
          granted_by: string | null
          id: string
          invitation_code: string | null
          is_active: boolean
          patient_id: string
        }
        Insert: {
          code_used_at?: string | null
          created_at?: string
          episode_id: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          invitation_code?: string | null
          is_active?: boolean
          patient_id: string
        }
        Update: {
          code_used_at?: string | null
          created_at?: string
          episode_id?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          invitation_code?: string | null
          is_active?: boolean
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_episode_access_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_episode_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_episode_access_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_feedback: {
        Row: {
          additional_comments: string | null
          allow_testimonial: boolean | null
          confidence_level: number | null
          created_at: string
          episode_id: string
          id: string
          patient_id: string
          recovery_surprise: string | null
          would_recommend: boolean | null
        }
        Insert: {
          additional_comments?: string | null
          allow_testimonial?: boolean | null
          confidence_level?: number | null
          created_at?: string
          episode_id: string
          id?: string
          patient_id: string
          recovery_surprise?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          additional_comments?: string | null
          allow_testimonial?: boolean | null
          confidence_level?: number | null
          created_at?: string
          episode_id?: string
          id?: string
          patient_id?: string
          recovery_surprise?: string | null
          would_recommend?: boolean | null
        }
        Relationships: []
      }
      patient_messages: {
        Row: {
          clinician_response: string | null
          created_at: string
          episode_id: string | null
          id: string
          message: string
          message_type: string
          patient_id: string
          responded_at: string | null
          responded_by: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          clinician_response?: string | null
          created_at?: string
          episode_id?: string | null
          id?: string
          message: string
          message_type: string
          patient_id: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          clinician_response?: string | null
          created_at?: string
          episode_id?: string | null
          id?: string
          message?: string
          message_type?: string
          patient_id?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patient_notification_preferences: {
        Row: {
          appointment_reminders: boolean | null
          clinician_notes: boolean | null
          created_at: string | null
          id: string
          outcome_reminders: boolean | null
          patient_id: string
          progress_updates: boolean | null
          updated_at: string | null
        }
        Insert: {
          appointment_reminders?: boolean | null
          clinician_notes?: boolean | null
          created_at?: string | null
          id?: string
          outcome_reminders?: boolean | null
          patient_id: string
          progress_updates?: boolean | null
          updated_at?: string | null
        }
        Update: {
          appointment_reminders?: boolean | null
          clinician_notes?: boolean | null
          created_at?: string | null
          id?: string
          outcome_reminders?: boolean | null
          patient_id?: string
          progress_updates?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_notification_preferences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patient_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_points: {
        Row: {
          created_at: string
          episode_id: string | null
          id: string
          outcome_score_id: string | null
          patient_id: string
          points: number
          reason: string
        }
        Insert: {
          created_at?: string
          episode_id?: string | null
          id?: string
          outcome_score_id?: string | null
          patient_id: string
          points: number
          reason: string
        }
        Update: {
          created_at?: string
          episode_id?: string | null
          id?: string
          outcome_score_id?: string | null
          patient_id?: string
          points?: number
          reason?: string
        }
        Relationships: []
      }
      patient_referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          episode_id: string | null
          id: string
          intake_form_id: string | null
          intake_submitted_at: string | null
          metadata: Json | null
          milestone_10_awarded_at: string | null
          milestone_3_awarded_at: string | null
          milestone_5_awarded_at: string | null
          points_awarded_at: string | null
          referral_code: string
          referred_patient_email: string | null
          referred_patient_name: string | null
          referrer_patient_id: string | null
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          episode_id?: string | null
          id?: string
          intake_form_id?: string | null
          intake_submitted_at?: string | null
          metadata?: Json | null
          milestone_10_awarded_at?: string | null
          milestone_3_awarded_at?: string | null
          milestone_5_awarded_at?: string | null
          points_awarded_at?: string | null
          referral_code: string
          referred_patient_email?: string | null
          referred_patient_name?: string | null
          referrer_patient_id?: string | null
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          episode_id?: string | null
          id?: string
          intake_form_id?: string | null
          intake_submitted_at?: string | null
          metadata?: Json | null
          milestone_10_awarded_at?: string | null
          milestone_3_awarded_at?: string | null
          milestone_5_awarded_at?: string | null
          points_awarded_at?: string | null
          referral_code?: string
          referred_patient_email?: string | null
          referred_patient_name?: string | null
          referrer_patient_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_referrals_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_referrals_intake_form_id_fkey"
            columns: ["intake_form_id"]
            isOneToOne: false
            referencedRelation: "intake_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_referrals_referrer_patient_id_fkey"
            columns: ["referrer_patient_id"]
            isOneToOne: false
            referencedRelation: "patient_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_rewards: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          patient_id: string
          qr_code_data: string | null
          reward_description: string | null
          reward_name: string
          reward_type: string
          updated_at: string
          valid_from: string
          valid_until: string | null
          view_count: number
          viewed_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          patient_id: string
          qr_code_data?: string | null
          reward_description?: string | null
          reward_name: string
          reward_type?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          view_count?: number
          viewed_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          patient_id?: string
          qr_code_data?: string | null
          reward_description?: string | null
          reward_name?: string
          reward_type?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          view_count?: number
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_rewards_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_episode_thresholds: {
        Row: {
          clinic_id: string | null
          created_at: string
          critical_days: number
          id: string
          updated_at: string
          warning_days: number
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          critical_days?: number
          id?: string
          updated_at?: string
          warning_days?: number
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          critical_days?: number
          id?: string
          updated_at?: string
          warning_days?: number
        }
        Relationships: []
      }
      pending_episodes: {
        Row: {
          clinic_id: string | null
          complaint_category: string | null
          complaint_priority: number
          complaint_text: string | null
          converted_at: string | null
          converted_to_episode_id: string | null
          created_at: string
          date_of_birth: string
          deferred_reason: string | null
          id: string
          intake_form_id: string
          notes: string | null
          patient_name: string
          previous_episode_id: string | null
          scheduled_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          complaint_category?: string | null
          complaint_priority: number
          complaint_text?: string | null
          converted_at?: string | null
          converted_to_episode_id?: string | null
          created_at?: string
          date_of_birth: string
          deferred_reason?: string | null
          id?: string
          intake_form_id: string
          notes?: string | null
          patient_name: string
          previous_episode_id?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          complaint_category?: string | null
          complaint_priority?: number
          complaint_text?: string | null
          converted_at?: string | null
          converted_to_episode_id?: string | null
          created_at?: string
          date_of_birth?: string
          deferred_reason?: string | null
          id?: string
          intake_form_id?: string
          notes?: string | null
          patient_name?: string
          previous_episode_id?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_episodes_converted_to_episode_id_fkey"
            columns: ["converted_to_episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_episodes_intake_form_id_fkey"
            columns: ["intake_form_id"]
            isOneToOne: false
            referencedRelation: "intake_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_episodes_previous_episode_id_fkey"
            columns: ["previous_episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          clinic_id: string | null
          clinician_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          npi: string | null
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          clinician_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          npi?: string | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          clinician_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          npi?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          p256dh: string
          patient_id: string
          user_agent: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          p256dh: string
          patient_id: string
          user_agent?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          p256dh?: string
          patient_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_config: {
        Row: {
          clinic_id: string | null
          created_at: string
          enabled: boolean
          id: string
          limit_type: string
          max_requests: number
          service_type: string
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          limit_type: string
          max_requests: number
          service_type: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          limit_type?: string
          max_requests?: number
          service_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_limit_config_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_tracking: {
        Row: {
          clinic_id: string | null
          created_at: string
          episode_id: string | null
          id: string
          request_timestamp: string
          service_type: string
          success: boolean
          user_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          episode_id?: string | null
          id?: string
          request_timestamp?: string
          service_type: string
          success?: boolean
          user_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          episode_id?: string | null
          id?: string
          request_timestamp?: string
          service_type?: string
          success?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_limit_tracking_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      recipient_engagement_schedules: {
        Row: {
          clinic_id: string | null
          created_at: string
          enabled: boolean
          frequency: string
          id: string
          last_sent_at: string | null
          min_engagement_filter: string | null
          name: string
          next_send_at: string
          recipient_emails: string[]
          send_day: string
          send_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          frequency: string
          id?: string
          last_sent_at?: string | null
          min_engagement_filter?: string | null
          name: string
          next_send_at: string
          recipient_emails: string[]
          send_day: string
          send_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_sent_at?: string | null
          min_engagement_filter?: string | null
          name?: string
          next_send_at?: string
          recipient_emails?: string[]
          send_day?: string
          send_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_report_deliveries: {
        Row: {
          clinic_id: string | null
          created_at: string
          error_message: string | null
          id: string
          recipient_emails: string[]
          report_data: Json | null
          schedule_id: string
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_emails: string[]
          report_data?: Json | null
          schedule_id: string
          sent_at?: string
          status: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_emails?: string[]
          report_data?: Json | null
          schedule_id?: string
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_report_deliveries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_report_deliveries_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "referral_report_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_report_schedules: {
        Row: {
          clinic_id: string | null
          created_at: string
          enabled: boolean
          frequency: string
          id: string
          last_sent_at: string | null
          name: string
          next_send_at: string
          recipient_emails: string[]
          send_day: number
          send_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_sent_at?: string | null
          name: string
          next_send_at: string
          recipient_emails?: string[]
          send_day?: number
          send_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_sent_at?: string | null
          name?: string
          next_send_at?: string
          recipient_emails?: string[]
          send_day?: number
          send_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_report_schedules_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_exports: {
        Row: {
          clinic_id: string | null
          created_at: string
          enabled: boolean
          export_type: string
          filters: Json
          frequency: string
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string
          recipient_emails: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          export_type: string
          filters?: Json
          frequency: string
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at: string
          recipient_emails?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          export_type?: string
          filters?: Json
          frequency?: string
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string
          recipient_emails?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          ip_address: unknown
          is_revoked: boolean
          last_active: string
          revoked_at: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          is_revoked?: boolean
          last_active?: string
          revoked_at?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          is_revoked?: boolean
          last_active?: string
          revoked_at?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhook_activity_log: {
        Row: {
          clinic_id: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          request_payload: Json
          response_body: string | null
          response_status: number | null
          status: string
          trigger_type: string
          triggered_at: string
          user_id: string
          webhook_config_id: string | null
          webhook_name: string
          webhook_url: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          request_payload?: Json
          response_body?: string | null
          response_status?: number | null
          status: string
          trigger_type: string
          triggered_at?: string
          user_id: string
          webhook_config_id?: string | null
          webhook_name: string
          webhook_url: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          request_payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string
          trigger_type?: string
          triggered_at?: string
          user_id?: string
          webhook_config_id?: string | null
          webhook_name?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_activity_log_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "zapier_webhook_config"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_alert_config: {
        Row: {
          alert_recipients: string[]
          check_window_hours: number
          clinic_id: string | null
          cooldown_hours: number
          created_at: string
          enabled: boolean
          failure_rate_threshold: number
          id: string
          last_alert_sent_at: string | null
          min_calls_required: number
          response_time_threshold: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_recipients?: string[]
          check_window_hours?: number
          clinic_id?: string | null
          cooldown_hours?: number
          created_at?: string
          enabled?: boolean
          failure_rate_threshold?: number
          id?: string
          last_alert_sent_at?: string | null
          min_calls_required?: number
          response_time_threshold?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_recipients?: string[]
          check_window_hours?: number
          clinic_id?: string | null
          cooldown_hours?: number
          created_at?: string
          enabled?: boolean
          failure_rate_threshold?: number
          id?: string
          last_alert_sent_at?: string | null
          min_calls_required?: number
          response_time_threshold?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_alert_history: {
        Row: {
          alert_details: Json | null
          alert_sent_to: string[]
          alert_type: string
          config_id: string | null
          created_at: string
          id: string
          triggered_at: string
          webhook_name: string | null
        }
        Insert: {
          alert_details?: Json | null
          alert_sent_to: string[]
          alert_type: string
          config_id?: string | null
          created_at?: string
          id?: string
          triggered_at?: string
          webhook_name?: string | null
        }
        Update: {
          alert_details?: Json | null
          alert_sent_to?: string[]
          alert_type?: string
          config_id?: string | null
          created_at?: string
          id?: string
          triggered_at?: string
          webhook_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_alert_history_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "webhook_alert_config"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_retry_queue: {
        Row: {
          activity_log_id: string | null
          clinic_id: string | null
          created_at: string
          id: string
          last_error: string | null
          max_retries: number
          next_retry_at: string
          request_payload: Json
          retry_count: number
          status: string
          trigger_type: string
          updated_at: string
          user_id: string
          webhook_config_id: string | null
          webhook_name: string
          webhook_url: string
        }
        Insert: {
          activity_log_id?: string | null
          clinic_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          max_retries?: number
          next_retry_at: string
          request_payload: Json
          retry_count?: number
          status?: string
          trigger_type: string
          updated_at?: string
          user_id: string
          webhook_config_id?: string | null
          webhook_name: string
          webhook_url: string
        }
        Update: {
          activity_log_id?: string | null
          clinic_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          max_retries?: number
          next_retry_at?: string
          request_payload?: Json
          retry_count?: number
          status?: string
          trigger_type?: string
          updated_at?: string
          user_id?: string
          webhook_config_id?: string | null
          webhook_name?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_retry_queue_activity_log_id_fkey"
            columns: ["activity_log_id"]
            isOneToOne: false
            referencedRelation: "webhook_activity_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_retry_queue_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "zapier_webhook_config"
            referencedColumns: ["id"]
          },
        ]
      }
      zapier_webhook_config: {
        Row: {
          clinic_id: string | null
          created_at: string
          enabled: boolean
          id: string
          last_triggered_at: string | null
          name: string
          threshold_value: number | null
          trigger_type: string
          updated_at: string
          user_id: string
          webhook_url: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          last_triggered_at?: string | null
          name: string
          threshold_value?: number | null
          trigger_type: string
          updated_at?: string
          user_id: string
          webhook_url: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          last_triggered_at?: string | null
          name?: string
          threshold_value?: number | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_on_time_bonus: { Args: never; Returns: undefined }
      award_patient_points: {
        Args: {
          p_episode_id?: string
          p_outcome_score_id?: string
          p_patient_id: string
          p_points: number
          p_reason: string
        }
        Returns: string
      }
      backfill_outcome_points: { Args: never; Returns: undefined }
      calculate_next_retry: {
        Args: { base_delay_minutes?: number; current_retry_count: number }
        Returns: string
      }
      calculate_webhook_retry_time: {
        Args: { retry_count: number }
        Returns: string
      }
      check_and_award_achievements: {
        Args: { p_patient_id: string }
        Returns: undefined
      }
      check_rate_limit: {
        Args: { p_clinic_id?: string; p_service_type: string }
        Returns: {
          allowed: boolean
          current_count: number
          limit_type: string
          max_allowed: number
          reset_at: string
        }[]
      }
      cleanup_expired_intake_progress: { Args: never; Returns: undefined }
      cleanup_old_sessions: { Args: never; Returns: undefined }
      generate_referral_code: {
        Args: { p_patient_id: string }
        Returns: string
      }
      get_patient_episode_view: {
        Args: { _episode_id: string; _patient_id: string }
        Returns: {
          clinician: string
          date_of_service: string
          diagnosis: string
          discharge_date: string
          followup_date: string
          functional_limitations: string[]
          id: string
          injury_date: string
          injury_mechanism: string
          pain_level: string
          patient_name: string
          region: string
          start_date: string
          treatment_goals: Json
        }[]
      }
      get_patient_total_points: {
        Args: { p_patient_id: string }
        Returns: number
      }
      get_user_clinic_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      patient_has_episode_access: {
        Args: { _episode_id: string; _patient_id: string }
        Returns: boolean
      }
      record_rate_limit_usage: {
        Args: {
          p_clinic_id?: string
          p_episode_id?: string
          p_service_type: string
          p_success: boolean
          p_user_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "clinician"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "clinician"],
    },
  },
} as const
