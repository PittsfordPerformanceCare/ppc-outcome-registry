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
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          cis_delta: number | null
          cis_post: number | null
          cis_pre: number | null
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
          resolution_days?: string | null
          start_date?: string | null
          treatment_goals?: Json | null
          updated_at?: string
          user_id?: string
          visits?: string | null
        }
        Relationships: [
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
          completed: boolean | null
          completed_date: string | null
          created_at: string
          episode_id: string
          id: string
          scheduled_date: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string
          episode_id: string
          id?: string
          scheduled_date: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string
          episode_id?: string
          id?: string
          scheduled_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
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
      outcome_scores: {
        Row: {
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
          clinician_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          npi: string | null
          updated_at: string
        }
        Insert: {
          clinician_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          npi?: string | null
          updated_at?: string
        }
        Update: {
          clinician_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          npi?: string | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
