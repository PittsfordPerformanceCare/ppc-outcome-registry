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
          email: string | null
          email_subject: string | null
          email_template: string | null
          id: string
          logo_url: string | null
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
          email?: string | null
          email_subject?: string | null
          email_template?: string | null
          id?: string
          logo_url?: string | null
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
          email?: string | null
          email_subject?: string | null
          email_template?: string | null
          id?: string
          logo_url?: string | null
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
      episodes: {
        Row: {
          cis_delta: number | null
          cis_post: number | null
          cis_pre: number | null
          clinic_id: string | null
          clinician: string | null
          compliance_notes: string | null
          compliance_rating: string | null
          created_at: string
          date_of_birth: string | null
          date_of_service: string
          diagnosis: string | null
          discharge_date: string | null
          emergency_contact: string | null
          emergency_phone: string | null
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
          prior_treatments: Json | null
          prior_treatments_other: string | null
          referral_reason: string | null
          referred_out: boolean | null
          referring_physician: string | null
          region: string
          reminder_sent_at: string | null
          resolution_days: string | null
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
          clinician?: string | null
          compliance_notes?: string | null
          compliance_rating?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_service: string
          diagnosis?: string | null
          discharge_date?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
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
          prior_treatments?: Json | null
          prior_treatments_other?: string | null
          referral_reason?: string | null
          referred_out?: boolean | null
          referring_physician?: string | null
          region: string
          reminder_sent_at?: string | null
          resolution_days?: string | null
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
          clinician?: string | null
          compliance_notes?: string | null
          compliance_rating?: string | null
          created_at?: string
          date_of_birth?: string | null
          date_of_service?: string
          diagnosis?: string | null
          discharge_date?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
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
          prior_treatments?: Json | null
          prior_treatments_other?: string | null
          referral_reason?: string | null
          referred_out?: boolean | null
          referring_physician?: string | null
          region?: string
          reminder_sent_at?: string | null
          resolution_days?: string | null
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
            foreignKeyName: "episodes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      notifications_history: {
        Row: {
          clinic_id: string | null
          clinician_name: string
          created_at: string
          delivery_details: Json | null
          episode_id: string
          error_message: string | null
          id: string
          notification_type: string
          open_count: number | null
          opened_at: string | null
          patient_email: string | null
          patient_name: string
          patient_phone: string | null
          sent_at: string
          status: string
          tracking_id: string | null
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          clinician_name: string
          created_at?: string
          delivery_details?: Json | null
          episode_id: string
          error_message?: string | null
          id?: string
          notification_type: string
          open_count?: number | null
          opened_at?: string | null
          patient_email?: string | null
          patient_name: string
          patient_phone?: string | null
          sent_at?: string
          status: string
          tracking_id?: string | null
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          clinician_name?: string
          created_at?: string
          delivery_details?: Json | null
          episode_id?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          open_count?: number | null
          opened_at?: string | null
          patient_email?: string | null
          patient_name?: string
          patient_phone?: string | null
          sent_at?: string
          status?: string
          tracking_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_clinic_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
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
