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
      admin_coverage: {
        Row: {
          admin_id: string
          clinic_id: string | null
          coverage_end: string | null
          coverage_start: string | null
          covering_for: string | null
          created_at: string
          id: string
          is_on_duty: boolean
          updated_at: string
        }
        Insert: {
          admin_id: string
          clinic_id?: string | null
          coverage_end?: string | null
          coverage_start?: string | null
          covering_for?: string | null
          created_at?: string
          id?: string
          is_on_duty?: boolean
          updated_at?: string
        }
        Update: {
          admin_id?: string
          clinic_id?: string | null
          coverage_end?: string | null
          coverage_start?: string | null
          covering_for?: string | null
          created_at?: string
          id?: string
          is_on_duty?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_coverage_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_coverage_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_coverage_covering_for_fkey"
            columns: ["covering_for"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      calendar_sync_history: {
        Row: {
          appointments_checked: number | null
          appointments_found: number | null
          completed_at: string | null
          connection_id: string | null
          error_message: string | null
          id: string
          started_at: string | null
          status: string | null
          sync_type: string
          triggered_by: string | null
        }
        Insert: {
          appointments_checked?: number | null
          appointments_found?: number | null
          completed_at?: string | null
          connection_id?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          sync_type: string
          triggered_by?: string | null
        }
        Update: {
          appointments_checked?: number | null
          appointments_found?: number | null
          completed_at?: string | null
          connection_id?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          sync_type?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_history_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "google_calendar_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      care_requests: {
        Row: {
          admin_owner_id: string | null
          approval_reason: string | null
          approved_at: string | null
          archive_reason: string | null
          assigned_clinician_id: string | null
          created_at: string
          episode_id: string | null
          id: string
          intake_payload: Json
          patient_id: string | null
          primary_complaint: string | null
          source: string
          status: string
          triage_notes: string | null
          updated_at: string
        }
        Insert: {
          admin_owner_id?: string | null
          approval_reason?: string | null
          approved_at?: string | null
          archive_reason?: string | null
          assigned_clinician_id?: string | null
          created_at?: string
          episode_id?: string | null
          id?: string
          intake_payload: Json
          patient_id?: string | null
          primary_complaint?: string | null
          source?: string
          status?: string
          triage_notes?: string | null
          updated_at?: string
        }
        Update: {
          admin_owner_id?: string | null
          approval_reason?: string | null
          approved_at?: string | null
          archive_reason?: string | null
          assigned_clinician_id?: string | null
          created_at?: string
          episode_id?: string | null
          id?: string
          intake_payload?: Json
          patient_id?: string | null
          primary_complaint?: string | null
          source?: string
          status?: string
          triage_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_requests_admin_owner_id_fkey"
            columns: ["admin_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_requests_assigned_clinician_id_fkey"
            columns: ["assigned_clinician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_settings: {
        Row: {
          address: string | null
          care_request_mode_enabled: boolean | null
          clinic_name: string
          created_at: string
          discharge_email_subject: string | null
          discharge_email_template: string | null
          discharge_sms_template: string | null
          email: string | null
          email_subject: string | null
          email_template: string | null
          id: string
          intake_complete_scheduling_subject: string | null
          intake_complete_scheduling_template: string | null
          intake_complete_welcome_subject: string | null
          intake_complete_welcome_template: string | null
          logo_url: string | null
          outcome_reminder_email_subject: string | null
          outcome_reminder_email_template: string | null
          outcome_reminder_enabled: boolean | null
          outcome_reminder_interval_days: number | null
          outcome_reminder_sms_template: string | null
          phone: string | null
          referral_approval_email_subject: string | null
          referral_approval_email_template: string | null
          referral_decline_email_subject: string | null
          referral_decline_email_template: string | null
          reminder_email_subject: string | null
          reminder_email_template: string | null
          reminder_enabled: boolean | null
          reminder_hours_before: number | null
          reminder_sms_template: string | null
          send_scheduling_email: boolean | null
          sms_template: string | null
          tagline: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          care_request_mode_enabled?: boolean | null
          clinic_name?: string
          created_at?: string
          discharge_email_subject?: string | null
          discharge_email_template?: string | null
          discharge_sms_template?: string | null
          email?: string | null
          email_subject?: string | null
          email_template?: string | null
          id?: string
          intake_complete_scheduling_subject?: string | null
          intake_complete_scheduling_template?: string | null
          intake_complete_welcome_subject?: string | null
          intake_complete_welcome_template?: string | null
          logo_url?: string | null
          outcome_reminder_email_subject?: string | null
          outcome_reminder_email_template?: string | null
          outcome_reminder_enabled?: boolean | null
          outcome_reminder_interval_days?: number | null
          outcome_reminder_sms_template?: string | null
          phone?: string | null
          referral_approval_email_subject?: string | null
          referral_approval_email_template?: string | null
          referral_decline_email_subject?: string | null
          referral_decline_email_template?: string | null
          reminder_email_subject?: string | null
          reminder_email_template?: string | null
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          reminder_sms_template?: string | null
          send_scheduling_email?: boolean | null
          sms_template?: string | null
          tagline?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          care_request_mode_enabled?: boolean | null
          clinic_name?: string
          created_at?: string
          discharge_email_subject?: string | null
          discharge_email_template?: string | null
          discharge_sms_template?: string | null
          email?: string | null
          email_subject?: string | null
          email_template?: string | null
          id?: string
          intake_complete_scheduling_subject?: string | null
          intake_complete_scheduling_template?: string | null
          intake_complete_welcome_subject?: string | null
          intake_complete_welcome_template?: string | null
          logo_url?: string | null
          outcome_reminder_email_subject?: string | null
          outcome_reminder_email_template?: string | null
          outcome_reminder_enabled?: boolean | null
          outcome_reminder_interval_days?: number | null
          outcome_reminder_sms_template?: string | null
          phone?: string | null
          referral_approval_email_subject?: string | null
          referral_approval_email_template?: string | null
          referral_decline_email_subject?: string | null
          referral_decline_email_template?: string | null
          reminder_email_subject?: string | null
          reminder_email_template?: string | null
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          reminder_sms_template?: string | null
          send_scheduling_email?: boolean | null
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
      communication_task_notes: {
        Row: {
          author_id: string
          created_at: string | null
          id: string
          note: string
          task_id: string
        }
        Insert: {
          author_id: string
          created_at?: string | null
          id?: string
          note: string
          task_id: string
        }
        Update: {
          author_id?: string
          created_at?: string | null
          id?: string
          note?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_task_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_task_notes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "communication_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_task_notes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "stalled_communication_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_tasks: {
        Row: {
          admin_acknowledged_at: string | null
          assigned_clinician_id: string
          cancelled_reason: string | null
          category: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string
          due_at: string
          episode_id: string | null
          guardian_phone: string | null
          id: string
          letter_file_url: string | null
          letter_subtype: string | null
          owner_type: Database["public"]["Enums"]["task_owner_type"]
          patient_email: string | null
          patient_id: string | null
          patient_message_id: string | null
          patient_name: string | null
          patient_phone: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          source: Database["public"]["Enums"]["task_source"]
          stall_detected_at: string | null
          stall_threshold_days: number | null
          status: string
          status_changed_at: string | null
          type: Database["public"]["Enums"]["task_type"]
          updated_at: string
        }
        Insert: {
          admin_acknowledged_at?: string | null
          assigned_clinician_id: string
          cancelled_reason?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          due_at?: string
          episode_id?: string | null
          guardian_phone?: string | null
          id?: string
          letter_file_url?: string | null
          letter_subtype?: string | null
          owner_type?: Database["public"]["Enums"]["task_owner_type"]
          patient_email?: string | null
          patient_id?: string | null
          patient_message_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          source: Database["public"]["Enums"]["task_source"]
          stall_detected_at?: string | null
          stall_threshold_days?: number | null
          status?: string
          status_changed_at?: string | null
          type: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Update: {
          admin_acknowledged_at?: string | null
          assigned_clinician_id?: string
          cancelled_reason?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_at?: string
          episode_id?: string | null
          guardian_phone?: string | null
          id?: string
          letter_file_url?: string | null
          letter_subtype?: string | null
          owner_type?: Database["public"]["Enums"]["task_owner_type"]
          patient_email?: string | null
          patient_id?: string | null
          patient_message_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          source?: Database["public"]["Enums"]["task_source"]
          stall_detected_at?: string | null
          stall_threshold_days?: number | null
          status?: string
          status_changed_at?: string | null
          type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_tasks_assigned_clinician_id_fkey"
            columns: ["assigned_clinician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      episode_intake_snapshots: {
        Row: {
          care_request_id: string | null
          created_at: string
          created_by: string | null
          episode_id: string
          id: string
          intake_payload: Json
        }
        Insert: {
          care_request_id?: string | null
          created_at?: string
          created_by?: string | null
          episode_id: string
          id?: string
          intake_payload: Json
        }
        Update: {
          care_request_id?: string | null
          created_at?: string
          created_by?: string | null
          episode_id?: string
          id?: string
          intake_payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "episode_intake_snapshots_care_request_id_fkey"
            columns: ["care_request_id"]
            isOneToOne: false
            referencedRelation: "care_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_intake_snapshots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_integrity_check_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          email_recipients: string[] | null
          email_sent: boolean
          error_message: string | null
          id: string
          issues_by_type: Json | null
          issues_found: number
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          email_recipients?: string[] | null
          email_sent?: boolean
          error_message?: string | null
          id?: string
          issues_by_type?: Json | null
          issues_found?: number
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          email_recipients?: string[] | null
          email_sent?: boolean
          error_message?: string | null
          id?: string
          issues_by_type?: Json | null
          issues_found?: number
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      episode_integrity_issues: {
        Row: {
          clinic_id: string | null
          clinician_id: string | null
          created_at: string
          detected_at: string
          episode_id: string
          id: string
          is_active: boolean
          issue_details: string
          issue_type: string
          patient_name: string
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          clinician_id?: string | null
          created_at?: string
          detected_at?: string
          episode_id: string
          id?: string
          is_active?: boolean
          issue_details: string
          issue_type: string
          patient_name: string
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          clinician_id?: string | null
          created_at?: string
          detected_at?: string
          episode_id?: string
          id?: string
          is_active?: boolean
          issue_details?: string
          issue_type?: string
          patient_name?: string
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_integrity_issues_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_integrity_issues_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_integrity_issues_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_outcome_tool_locks: {
        Row: {
          created_at: string
          episode_id: string
          id: string
          locked_at: string
          locked_by: string | null
          outcome_tools: string[]
          override_at: string | null
          override_by: string | null
          override_reason: string | null
        }
        Insert: {
          created_at?: string
          episode_id: string
          id?: string
          locked_at?: string
          locked_by?: string | null
          outcome_tools: string[]
          override_at?: string | null
          override_by?: string | null
          override_reason?: string | null
        }
        Update: {
          created_at?: string
          episode_id?: string
          id?: string
          locked_at?: string
          locked_by?: string | null
          outcome_tools?: string[]
          override_at?: string | null
          override_by?: string | null
          override_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episode_outcome_tool_locks_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_outcome_tool_locks_override_by_fkey"
            columns: ["override_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          allergy_flag: boolean | null
          allergy_notes: string | null
          body_region: string | null
          cis_delta: number | null
          cis_post: number | null
          cis_pre: number | null
          clinic_id: string | null
          clinical_impression: string | null
          clinician: string | null
          clinician_credentials: string | null
          complaint_priority: number | null
          compliance_notes: string | null
          compliance_rating: string | null
          continuation_details: Json | null
          continuation_episode_source: string | null
          created_at: string
          current_status: Database["public"]["Enums"]["episode_status"] | null
          date_of_birth: string | null
          date_of_service: string
          decision_context: string | null
          decision_made_by: string | null
          decision_timestamp: string | null
          diagnosis: string | null
          discharge_date: string | null
          discharge_outcome: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          episode_terminal: boolean | null
          episode_type: string | null
          final_closure_date: string | null
          followup_date: string | null
          followup_time: string | null
          functional_limitation: string | null
          functional_limitations: string[] | null
          goals_other: string | null
          has_ortho_referral: boolean | null
          id: string
          injury_date: string | null
          injury_mechanism: string | null
          insurance: string | null
          med_changes_flag: boolean | null
          med_changes_notes: string | null
          medical_history: string | null
          medications: string | null
          npi: string | null
          pain_delta: number | null
          pain_level: string | null
          pain_post: number | null
          pain_pre: number | null
          patient_name: string
          pcp_action_items: Json | null
          pcp_fax: string | null
          pcp_summary_generated_at: string | null
          pcp_summary_sent_at: string | null
          prior_treatments: Json | null
          prior_treatments_other: string | null
          referral_id: string | null
          referral_reason: string | null
          referred_out: boolean | null
          referring_physician: string | null
          region: string
          reminder_sent_at: string | null
          resolution_days: string | null
          return_to_function_items: Json | null
          return_to_registry_required: boolean | null
          source_intake_form_id: string | null
          start_date: string | null
          surgery_date: string | null
          surgery_performed: boolean | null
          total_visits_to_discharge: number | null
          treatment_goals: Json | null
          updated_at: string
          user_id: string
          visits: string | null
        }
        Insert: {
          allergy_flag?: boolean | null
          allergy_notes?: string | null
          body_region?: string | null
          cis_delta?: number | null
          cis_post?: number | null
          cis_pre?: number | null
          clinic_id?: string | null
          clinical_impression?: string | null
          clinician?: string | null
          clinician_credentials?: string | null
          complaint_priority?: number | null
          compliance_notes?: string | null
          compliance_rating?: string | null
          continuation_details?: Json | null
          continuation_episode_source?: string | null
          created_at?: string
          current_status?: Database["public"]["Enums"]["episode_status"] | null
          date_of_birth?: string | null
          date_of_service: string
          decision_context?: string | null
          decision_made_by?: string | null
          decision_timestamp?: string | null
          diagnosis?: string | null
          discharge_date?: string | null
          discharge_outcome?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          episode_terminal?: boolean | null
          episode_type?: string | null
          final_closure_date?: string | null
          followup_date?: string | null
          followup_time?: string | null
          functional_limitation?: string | null
          functional_limitations?: string[] | null
          goals_other?: string | null
          has_ortho_referral?: boolean | null
          id: string
          injury_date?: string | null
          injury_mechanism?: string | null
          insurance?: string | null
          med_changes_flag?: boolean | null
          med_changes_notes?: string | null
          medical_history?: string | null
          medications?: string | null
          npi?: string | null
          pain_delta?: number | null
          pain_level?: string | null
          pain_post?: number | null
          pain_pre?: number | null
          patient_name: string
          pcp_action_items?: Json | null
          pcp_fax?: string | null
          pcp_summary_generated_at?: string | null
          pcp_summary_sent_at?: string | null
          prior_treatments?: Json | null
          prior_treatments_other?: string | null
          referral_id?: string | null
          referral_reason?: string | null
          referred_out?: boolean | null
          referring_physician?: string | null
          region: string
          reminder_sent_at?: string | null
          resolution_days?: string | null
          return_to_function_items?: Json | null
          return_to_registry_required?: boolean | null
          source_intake_form_id?: string | null
          start_date?: string | null
          surgery_date?: string | null
          surgery_performed?: boolean | null
          total_visits_to_discharge?: number | null
          treatment_goals?: Json | null
          updated_at?: string
          user_id: string
          visits?: string | null
        }
        Update: {
          allergy_flag?: boolean | null
          allergy_notes?: string | null
          body_region?: string | null
          cis_delta?: number | null
          cis_post?: number | null
          cis_pre?: number | null
          clinic_id?: string | null
          clinical_impression?: string | null
          clinician?: string | null
          clinician_credentials?: string | null
          complaint_priority?: number | null
          compliance_notes?: string | null
          compliance_rating?: string | null
          continuation_details?: Json | null
          continuation_episode_source?: string | null
          created_at?: string
          current_status?: Database["public"]["Enums"]["episode_status"] | null
          date_of_birth?: string | null
          date_of_service?: string
          decision_context?: string | null
          decision_made_by?: string | null
          decision_timestamp?: string | null
          diagnosis?: string | null
          discharge_date?: string | null
          discharge_outcome?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          episode_terminal?: boolean | null
          episode_type?: string | null
          final_closure_date?: string | null
          followup_date?: string | null
          followup_time?: string | null
          functional_limitation?: string | null
          functional_limitations?: string[] | null
          goals_other?: string | null
          has_ortho_referral?: boolean | null
          id?: string
          injury_date?: string | null
          injury_mechanism?: string | null
          insurance?: string | null
          med_changes_flag?: boolean | null
          med_changes_notes?: string | null
          medical_history?: string | null
          medications?: string | null
          npi?: string | null
          pain_delta?: number | null
          pain_level?: string | null
          pain_post?: number | null
          pain_pre?: number | null
          patient_name?: string
          pcp_action_items?: Json | null
          pcp_fax?: string | null
          pcp_summary_generated_at?: string | null
          pcp_summary_sent_at?: string | null
          prior_treatments?: Json | null
          prior_treatments_other?: string | null
          referral_id?: string | null
          referral_reason?: string | null
          referred_out?: boolean | null
          referring_physician?: string | null
          region?: string
          reminder_sent_at?: string | null
          resolution_days?: string | null
          return_to_function_items?: Json | null
          return_to_registry_required?: boolean | null
          source_intake_form_id?: string | null
          start_date?: string | null
          surgery_date?: string | null
          surgery_performed?: boolean | null
          total_visits_to_discharge?: number | null
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
            foreignKeyName: "episodes_decision_made_by_fkey"
            columns: ["decision_made_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "ortho_referrals"
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
      google_calendar_connections: {
        Row: {
          access_token: string
          calendar_id: string
          calendar_name: string | null
          clinic_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          refresh_token: string
          token_expiry: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_id: string
          calendar_name?: string | null
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token: string
          token_expiry: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_id?: string
          calendar_name?: string | null
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string
          token_expiry?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_connections_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_appointments: {
        Row: {
          calendar_connection_id: string | null
          created_at: string | null
          episode_missing_alert_sent_at: string | null
          google_event_id: string | null
          id: string
          intake_form_id: string | null
          patient_email: string | null
          patient_name: string
          scheduled_date: string
          scheduled_time: string
          status: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          calendar_connection_id?: string | null
          created_at?: string | null
          episode_missing_alert_sent_at?: string | null
          google_event_id?: string | null
          id?: string
          intake_form_id?: string | null
          patient_email?: string | null
          patient_name: string
          scheduled_date: string
          scheduled_time: string
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          calendar_connection_id?: string | null
          created_at?: string | null
          episode_missing_alert_sent_at?: string | null
          google_event_id?: string | null
          id?: string
          intake_form_id?: string | null
          patient_email?: string | null
          patient_name?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_appointments_calendar_connection_id_fkey"
            columns: ["calendar_connection_id"]
            isOneToOne: false
            referencedRelation: "google_calendar_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_appointments_intake_form_id_fkey"
            columns: ["intake_form_id"]
            isOneToOne: true
            referencedRelation: "intake_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_forms: {
        Row: {
          access_code: string
          address: string | null
          allergies: string | null
          best_time_to_contact: string | null
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
          language_preference: string | null
          medical_history: string | null
          opt_out_newsletter: boolean | null
          pain_level: number | null
          patient_name: string
          pcp_address: string | null
          pcp_fax: string | null
          pcp_phone: string | null
          phone: string | null
          preferred_contact_method: string | null
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
          best_time_to_contact?: string | null
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
          language_preference?: string | null
          medical_history?: string | null
          opt_out_newsletter?: boolean | null
          pain_level?: number | null
          patient_name: string
          pcp_address?: string | null
          pcp_fax?: string | null
          pcp_phone?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
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
          best_time_to_contact?: string | null
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
          language_preference?: string | null
          medical_history?: string | null
          opt_out_newsletter?: boolean | null
          pain_level?: number | null
          patient_name?: string
          pcp_address?: string | null
          pcp_fax?: string | null
          pcp_phone?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
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
      intake_scheduling_reminders: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          intake_form_id: string
          reminder_type: string
          sent_at: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          intake_form_id: string
          reminder_type: string
          sent_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          intake_form_id?: string
          reminder_type?: string
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_scheduling_reminders_intake_form_id_fkey"
            columns: ["intake_form_id"]
            isOneToOne: false
            referencedRelation: "intake_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      intakes: {
        Row: {
          created_at: string
          form_data: Json | null
          id: string
          lead_id: string | null
          patient_email: string | null
          patient_name: string | null
          patient_phone: string | null
          progress: number
          status: string
          timestamp_completed: string | null
          timestamp_started: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          form_data?: Json | null
          id?: string
          lead_id?: string | null
          patient_email?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          progress?: number
          status?: string
          timestamp_completed?: string | null
          timestamp_started?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          form_data?: Json | null
          id?: string
          lead_id?: string | null
          patient_email?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          progress?: number
          status?: string
          timestamp_completed?: string | null
          timestamp_started?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intakes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_contact_attempts: {
        Row: {
          attempt_number: number
          contacted_at: string
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          method: string
          notes: string | null
        }
        Insert: {
          attempt_number: number
          contacted_at?: string
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          method: string
          notes?: string | null
        }
        Update: {
          attempt_number?: number
          contacted_at?: string
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          method?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_contact_attempts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          checkpoint_status: string
          contact_attempt_count: number | null
          created_at: string
          education_asset: string | null
          education_delivered: boolean | null
          education_delivered_at: string | null
          education_url: string | null
          email: string | null
          episode_opened_at: string | null
          funnel_stage: string | null
          id: string
          intake_completed_at: string | null
          intake_first_reminder_sent_at: string | null
          intake_second_reminder_sent_at: string | null
          last_contacted_at: string | null
          lead_status: string | null
          name: string | null
          next_follow_up_date: string | null
          notes: string | null
          origin_cta: string | null
          origin_page: string | null
          phone: string | null
          pillar_origin: string | null
          preferred_contact_method: string | null
          primary_concern: string | null
          severity_score: number | null
          symptom_summary: string | null
          system_category: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          who_is_this_for: string | null
        }
        Insert: {
          checkpoint_status?: string
          contact_attempt_count?: number | null
          created_at?: string
          education_asset?: string | null
          education_delivered?: boolean | null
          education_delivered_at?: string | null
          education_url?: string | null
          email?: string | null
          episode_opened_at?: string | null
          funnel_stage?: string | null
          id?: string
          intake_completed_at?: string | null
          intake_first_reminder_sent_at?: string | null
          intake_second_reminder_sent_at?: string | null
          last_contacted_at?: string | null
          lead_status?: string | null
          name?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          origin_cta?: string | null
          origin_page?: string | null
          phone?: string | null
          pillar_origin?: string | null
          preferred_contact_method?: string | null
          primary_concern?: string | null
          severity_score?: number | null
          symptom_summary?: string | null
          system_category?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          who_is_this_for?: string | null
        }
        Update: {
          checkpoint_status?: string
          contact_attempt_count?: number | null
          created_at?: string
          education_asset?: string | null
          education_delivered?: boolean | null
          education_delivered_at?: string | null
          education_url?: string | null
          email?: string | null
          episode_opened_at?: string | null
          funnel_stage?: string | null
          id?: string
          intake_completed_at?: string | null
          intake_first_reminder_sent_at?: string | null
          intake_second_reminder_sent_at?: string | null
          last_contacted_at?: string | null
          lead_status?: string | null
          name?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          origin_cta?: string | null
          origin_page?: string | null
          phone?: string | null
          pillar_origin?: string | null
          preferred_contact_method?: string | null
          primary_concern?: string | null
          severity_score?: number | null
          symptom_summary?: string | null
          system_category?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          who_is_this_for?: string | null
        }
        Relationships: []
      }
      lifecycle_events: {
        Row: {
          actor_id: string | null
          actor_type: string
          created_at: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          created_at?: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json | null
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
      missing_episode_alerts: {
        Row: {
          alert_type: string
          appointment_id: string
          clinician_name: string | null
          created_at: string
          id: string
          patient_name: string
          resolved_at: string | null
          resolved_by: string | null
          scheduled_date: string
          scheduled_time: string
          status: string
          updated_at: string
        }
        Insert: {
          alert_type?: string
          appointment_id: string
          clinician_name?: string | null
          created_at?: string
          id?: string
          patient_name: string
          resolved_at?: string | null
          resolved_by?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          appointment_id?: string
          clinician_name?: string | null
          created_at?: string
          id?: string
          patient_name?: string
          resolved_at?: string | null
          resolved_by?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missing_episode_alerts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "intake_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      neurologic_exam_drafts: {
        Row: {
          clinic_id: string | null
          created_at: string
          draft_data: Json
          episode_id: string
          id: string
          last_saved_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          draft_data?: Json
          episode_id: string
          id?: string
          last_saved_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          draft_data?: Json
          episode_id?: string
          id?: string
          last_saved_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      neurologic_exams: {
        Row: {
          auscultation_abdomen: string | null
          auscultation_heart: string | null
          auscultation_lungs: string | null
          auscultation_notes: string | null
          bp_seated_left: string | null
          bp_seated_right: string | null
          bp_standing_3min_left: string | null
          bp_standing_3min_right: string | null
          bp_standing_immediate_left: string | null
          bp_standing_immediate_right: string | null
          bp_supine_left: string | null
          bp_supine_right: string | null
          clinic_id: string | null
          clinical_history: string | null
          created_at: string
          episode_id: string
          exam_date: string
          exam_time: string | null
          exam_type: string
          heart_rate_supine_left: string | null
          heart_rate_supine_right: string | null
          id: string
          inputs_cerebellar_left: boolean | null
          inputs_cerebellar_notes: string | null
          inputs_cerebellar_right: boolean | null
          inputs_isometric_left: boolean | null
          inputs_isometric_notes: string | null
          inputs_isometric_right: boolean | null
          inputs_notes: string | null
          inputs_parietal_left: boolean | null
          inputs_parietal_notes: string | null
          inputs_parietal_right: boolean | null
          inputs_therapy_localization: string | null
          motor_deltoid_left: string | null
          motor_deltoid_right: string | null
          motor_gluteus_max_left: string | null
          motor_gluteus_max_right: string | null
          motor_iliopsoas_left: string | null
          motor_iliopsoas_right: string | null
          motor_latissimus_left: string | null
          motor_latissimus_right: string | null
          motor_notes: string | null
          neuro_2pt_localization_left: string | null
          neuro_2pt_localization_right: string | null
          neuro_babinski_left: string | null
          neuro_babinski_right: string | null
          neuro_digit_sense_left: string | null
          neuro_digit_sense_right: string | null
          neuro_finger_to_nose_left: string | null
          neuro_finger_to_nose_right: string | null
          neuro_notes: string | null
          neuro_pupillary_fatigue_left: string | null
          neuro_pupillary_fatigue_notes: string | null
          neuro_pupillary_fatigue_right: string | null
          neuro_red_desaturation_left: boolean | null
          neuro_red_desaturation_right: boolean | null
          neuro_ue_capillary_refill_left: string | null
          neuro_ue_capillary_refill_right: string | null
          neuro_ue_extensor_weakness_left: boolean | null
          neuro_ue_extensor_weakness_right: boolean | null
          neuro_uprds_left: string | null
          neuro_uprds_right: string | null
          o2_saturation_supine_left: string | null
          o2_saturation_supine_right: string | null
          overall_notes: string | null
          reflex_achilles_left: string | null
          reflex_achilles_right: string | null
          reflex_bicep_left: string | null
          reflex_bicep_right: string | null
          reflex_brachioradialis_left: string | null
          reflex_brachioradialis_right: string | null
          reflex_patellar_left: string | null
          reflex_patellar_right: string | null
          reflex_tricep_left: string | null
          reflex_tricep_right: string | null
          reflexes_notes: string | null
          temperature_left: string | null
          temperature_right: string | null
          updated_at: string
          user_id: string
          vestibular_canal_testing: string | null
          vestibular_fakuda: string | null
          vestibular_notes: string | null
          vestibular_otr_left: boolean | null
          vestibular_otr_notes: string | null
          vestibular_otr_right: boolean | null
          vestibular_rombergs: string | null
          vestibular_shunt_stability_ec: string | null
          vestibular_shunt_stability_eo: string | null
          vestibular_vor: string | null
          visual_convergence: string | null
          visual_maddox_rod: string | null
          visual_notes: string | null
          visual_opk: string | null
          visual_pursuits: string | null
          visual_saccades: string | null
          vitals_notes: string | null
        }
        Insert: {
          auscultation_abdomen?: string | null
          auscultation_heart?: string | null
          auscultation_lungs?: string | null
          auscultation_notes?: string | null
          bp_seated_left?: string | null
          bp_seated_right?: string | null
          bp_standing_3min_left?: string | null
          bp_standing_3min_right?: string | null
          bp_standing_immediate_left?: string | null
          bp_standing_immediate_right?: string | null
          bp_supine_left?: string | null
          bp_supine_right?: string | null
          clinic_id?: string | null
          clinical_history?: string | null
          created_at?: string
          episode_id: string
          exam_date?: string
          exam_time?: string | null
          exam_type?: string
          heart_rate_supine_left?: string | null
          heart_rate_supine_right?: string | null
          id?: string
          inputs_cerebellar_left?: boolean | null
          inputs_cerebellar_notes?: string | null
          inputs_cerebellar_right?: boolean | null
          inputs_isometric_left?: boolean | null
          inputs_isometric_notes?: string | null
          inputs_isometric_right?: boolean | null
          inputs_notes?: string | null
          inputs_parietal_left?: boolean | null
          inputs_parietal_notes?: string | null
          inputs_parietal_right?: boolean | null
          inputs_therapy_localization?: string | null
          motor_deltoid_left?: string | null
          motor_deltoid_right?: string | null
          motor_gluteus_max_left?: string | null
          motor_gluteus_max_right?: string | null
          motor_iliopsoas_left?: string | null
          motor_iliopsoas_right?: string | null
          motor_latissimus_left?: string | null
          motor_latissimus_right?: string | null
          motor_notes?: string | null
          neuro_2pt_localization_left?: string | null
          neuro_2pt_localization_right?: string | null
          neuro_babinski_left?: string | null
          neuro_babinski_right?: string | null
          neuro_digit_sense_left?: string | null
          neuro_digit_sense_right?: string | null
          neuro_finger_to_nose_left?: string | null
          neuro_finger_to_nose_right?: string | null
          neuro_notes?: string | null
          neuro_pupillary_fatigue_left?: string | null
          neuro_pupillary_fatigue_notes?: string | null
          neuro_pupillary_fatigue_right?: string | null
          neuro_red_desaturation_left?: boolean | null
          neuro_red_desaturation_right?: boolean | null
          neuro_ue_capillary_refill_left?: string | null
          neuro_ue_capillary_refill_right?: string | null
          neuro_ue_extensor_weakness_left?: boolean | null
          neuro_ue_extensor_weakness_right?: boolean | null
          neuro_uprds_left?: string | null
          neuro_uprds_right?: string | null
          o2_saturation_supine_left?: string | null
          o2_saturation_supine_right?: string | null
          overall_notes?: string | null
          reflex_achilles_left?: string | null
          reflex_achilles_right?: string | null
          reflex_bicep_left?: string | null
          reflex_bicep_right?: string | null
          reflex_brachioradialis_left?: string | null
          reflex_brachioradialis_right?: string | null
          reflex_patellar_left?: string | null
          reflex_patellar_right?: string | null
          reflex_tricep_left?: string | null
          reflex_tricep_right?: string | null
          reflexes_notes?: string | null
          temperature_left?: string | null
          temperature_right?: string | null
          updated_at?: string
          user_id: string
          vestibular_canal_testing?: string | null
          vestibular_fakuda?: string | null
          vestibular_notes?: string | null
          vestibular_otr_left?: boolean | null
          vestibular_otr_notes?: string | null
          vestibular_otr_right?: boolean | null
          vestibular_rombergs?: string | null
          vestibular_shunt_stability_ec?: string | null
          vestibular_shunt_stability_eo?: string | null
          vestibular_vor?: string | null
          visual_convergence?: string | null
          visual_maddox_rod?: string | null
          visual_notes?: string | null
          visual_opk?: string | null
          visual_pursuits?: string | null
          visual_saccades?: string | null
          vitals_notes?: string | null
        }
        Update: {
          auscultation_abdomen?: string | null
          auscultation_heart?: string | null
          auscultation_lungs?: string | null
          auscultation_notes?: string | null
          bp_seated_left?: string | null
          bp_seated_right?: string | null
          bp_standing_3min_left?: string | null
          bp_standing_3min_right?: string | null
          bp_standing_immediate_left?: string | null
          bp_standing_immediate_right?: string | null
          bp_supine_left?: string | null
          bp_supine_right?: string | null
          clinic_id?: string | null
          clinical_history?: string | null
          created_at?: string
          episode_id?: string
          exam_date?: string
          exam_time?: string | null
          exam_type?: string
          heart_rate_supine_left?: string | null
          heart_rate_supine_right?: string | null
          id?: string
          inputs_cerebellar_left?: boolean | null
          inputs_cerebellar_notes?: string | null
          inputs_cerebellar_right?: boolean | null
          inputs_isometric_left?: boolean | null
          inputs_isometric_notes?: string | null
          inputs_isometric_right?: boolean | null
          inputs_notes?: string | null
          inputs_parietal_left?: boolean | null
          inputs_parietal_notes?: string | null
          inputs_parietal_right?: boolean | null
          inputs_therapy_localization?: string | null
          motor_deltoid_left?: string | null
          motor_deltoid_right?: string | null
          motor_gluteus_max_left?: string | null
          motor_gluteus_max_right?: string | null
          motor_iliopsoas_left?: string | null
          motor_iliopsoas_right?: string | null
          motor_latissimus_left?: string | null
          motor_latissimus_right?: string | null
          motor_notes?: string | null
          neuro_2pt_localization_left?: string | null
          neuro_2pt_localization_right?: string | null
          neuro_babinski_left?: string | null
          neuro_babinski_right?: string | null
          neuro_digit_sense_left?: string | null
          neuro_digit_sense_right?: string | null
          neuro_finger_to_nose_left?: string | null
          neuro_finger_to_nose_right?: string | null
          neuro_notes?: string | null
          neuro_pupillary_fatigue_left?: string | null
          neuro_pupillary_fatigue_notes?: string | null
          neuro_pupillary_fatigue_right?: string | null
          neuro_red_desaturation_left?: boolean | null
          neuro_red_desaturation_right?: boolean | null
          neuro_ue_capillary_refill_left?: string | null
          neuro_ue_capillary_refill_right?: string | null
          neuro_ue_extensor_weakness_left?: boolean | null
          neuro_ue_extensor_weakness_right?: boolean | null
          neuro_uprds_left?: string | null
          neuro_uprds_right?: string | null
          o2_saturation_supine_left?: string | null
          o2_saturation_supine_right?: string | null
          overall_notes?: string | null
          reflex_achilles_left?: string | null
          reflex_achilles_right?: string | null
          reflex_bicep_left?: string | null
          reflex_bicep_right?: string | null
          reflex_brachioradialis_left?: string | null
          reflex_brachioradialis_right?: string | null
          reflex_patellar_left?: string | null
          reflex_patellar_right?: string | null
          reflex_tricep_left?: string | null
          reflex_tricep_right?: string | null
          reflexes_notes?: string | null
          temperature_left?: string | null
          temperature_right?: string | null
          updated_at?: string
          user_id?: string
          vestibular_canal_testing?: string | null
          vestibular_fakuda?: string | null
          vestibular_notes?: string | null
          vestibular_otr_left?: boolean | null
          vestibular_otr_notes?: string | null
          vestibular_otr_right?: boolean | null
          vestibular_rombergs?: string | null
          vestibular_shunt_stability_ec?: string | null
          vestibular_shunt_stability_eo?: string | null
          vestibular_vor?: string | null
          visual_convergence?: string | null
          visual_maddox_rod?: string | null
          visual_notes?: string | null
          visual_opk?: string | null
          visual_pursuits?: string | null
          visual_saccades?: string | null
          vitals_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neurologic_exams_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neurologic_exams_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neurologic_exams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      neurologic_intake_leads: {
        Row: {
          child_age: string | null
          child_name: string | null
          created_at: string
          duration: string | null
          email: string
          funnel_stage: string | null
          id: string
          name: string | null
          notes: string | null
          organization: string | null
          origin_cta: string | null
          origin_page: string | null
          parent_name: string | null
          patient_age: string | null
          patient_name: string | null
          persona: string
          phone: string | null
          pillar_origin: string | null
          primary_concern: string | null
          referrer_name: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role: string | null
          source: string | null
          status: string
          symptom_location: string | null
          symptom_profile: string | null
          updated_at: string
          urgency: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          child_age?: string | null
          child_name?: string | null
          created_at?: string
          duration?: string | null
          email: string
          funnel_stage?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          organization?: string | null
          origin_cta?: string | null
          origin_page?: string | null
          parent_name?: string | null
          patient_age?: string | null
          patient_name?: string | null
          persona: string
          phone?: string | null
          pillar_origin?: string | null
          primary_concern?: string | null
          referrer_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          source?: string | null
          status?: string
          symptom_location?: string | null
          symptom_profile?: string | null
          updated_at?: string
          urgency?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          child_age?: string | null
          child_name?: string | null
          created_at?: string
          duration?: string | null
          email?: string
          funnel_stage?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          organization?: string | null
          origin_cta?: string | null
          origin_page?: string | null
          parent_name?: string | null
          patient_age?: string | null
          patient_name?: string | null
          persona?: string
          phone?: string | null
          pillar_origin?: string | null
          primary_concern?: string | null
          referrer_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          source?: string | null
          status?: string
          symptom_location?: string | null
          symptom_profile?: string | null
          updated_at?: string
          urgency?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
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
      ortho_partners: {
        Row: {
          clinic_id: string | null
          created_at: string
          direct_secure_address: string | null
          fax_or_email_backup: string | null
          group_name: string | null
          id: string
          location: string | null
          name: string
          preferred_return_method: string | null
          priority_scheduling_instructions: string | null
          return_instructions: string | null
          subspecialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          direct_secure_address?: string | null
          fax_or_email_backup?: string | null
          group_name?: string | null
          id?: string
          location?: string | null
          name: string
          preferred_return_method?: string | null
          priority_scheduling_instructions?: string | null
          return_instructions?: string | null
          subspecialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          direct_secure_address?: string | null
          fax_or_email_backup?: string | null
          group_name?: string | null
          id?: string
          location?: string | null
          name?: string
          preferred_return_method?: string | null
          priority_scheduling_instructions?: string | null
          return_instructions?: string | null
          subspecialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ortho_referrals: {
        Row: {
          clinic_id: string | null
          communication_channel: string | null
          created_at: string
          destination_ortho_id: string
          episode_id: string
          expected_return_window_end: string | null
          expected_return_window_start: string | null
          id: string
          notes_to_ortho: string | null
          patient_id: string | null
          priority_flag: boolean
          procedure_class: string | null
          referral_date: string
          referral_reason_primary: string
          referral_reason_secondary: string[] | null
          return_to_registry_required: boolean
          suspected_procedure_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          communication_channel?: string | null
          created_at?: string
          destination_ortho_id: string
          episode_id: string
          expected_return_window_end?: string | null
          expected_return_window_start?: string | null
          id?: string
          notes_to_ortho?: string | null
          patient_id?: string | null
          priority_flag?: boolean
          procedure_class?: string | null
          referral_date?: string
          referral_reason_primary: string
          referral_reason_secondary?: string[] | null
          return_to_registry_required?: boolean
          suspected_procedure_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          communication_channel?: string | null
          created_at?: string
          destination_ortho_id?: string
          episode_id?: string
          expected_return_window_end?: string | null
          expected_return_window_start?: string | null
          id?: string
          notes_to_ortho?: string | null
          patient_id?: string | null
          priority_flag?: boolean
          procedure_class?: string | null
          referral_date?: string
          referral_reason_primary?: string
          referral_reason_secondary?: string[] | null
          return_to_registry_required?: boolean
          suspected_procedure_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ortho_referrals_destination_ortho_id_fkey"
            columns: ["destination_ortho_id"]
            isOneToOne: false
            referencedRelation: "ortho_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      ortho_tasks: {
        Row: {
          assigned_to: string | null
          clinic_id: string | null
          created_at: string
          description: string | null
          due_date: string
          episode_id: string | null
          id: string
          patient_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          episode_id?: string | null
          id?: string
          patient_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          episode_id?: string | null
          id?: string
          patient_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      outcome_measure_responses: {
        Row: {
          clinic_id: string | null
          created_at: string
          episode_id: string
          id: string
          instrument_code: string
          is_skipped: boolean | null
          outcome_score_id: string
          question_number: number
          question_text: string
          response_text: string | null
          response_value: number | null
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          episode_id: string
          id?: string
          instrument_code: string
          is_skipped?: boolean | null
          outcome_score_id: string
          question_number: number
          question_text: string
          response_text?: string | null
          response_value?: number | null
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          episode_id?: string
          id?: string
          instrument_code?: string
          is_skipped?: boolean | null
          outcome_score_id?: string
          question_number?: number
          question_text?: string
          response_text?: string | null
          response_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcome_measure_responses_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcome_measure_responses_outcome_score_id_fkey"
            columns: ["outcome_score_id"]
            isOneToOne: false
            referencedRelation: "outcome_scores"
            referencedColumns: ["id"]
          },
        ]
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
          magic_token: string | null
          patient_id: string
          token_expires_at: string | null
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
          magic_token?: string | null
          patient_id: string
          token_expires_at?: string | null
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
          magic_token?: string | null
          patient_id?: string
          token_expires_at?: string | null
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
      patient_letters: {
        Row: {
          clinic_id: string | null
          content: string
          created_at: string
          episode_id: string
          generated_at: string
          generated_by: string | null
          id: string
          letter_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          content: string
          created_at?: string
          episode_id: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          letter_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          content?: string
          created_at?: string
          episode_id?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          letter_type?: string
          title?: string
          updated_at?: string
          user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "patient_messages_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      pcp_summary_tasks: {
        Row: {
          care_targets_summary: Json | null
          clinic_id: string | null
          clinical_course_summary: string | null
          clinician_confirmed_at: string | null
          clinician_confirmed_by: string | null
          clinician_name: string | null
          created_at: string
          delivery_method_used: string | null
          discharge_date: string
          discharge_status: string | null
          draft_generated_at: string | null
          draft_summary: Json | null
          episode_id: string
          followup_guidance: string | null
          id: string
          notes: string | null
          outcome_integrity_issues: string[] | null
          outcome_integrity_passed: boolean | null
          patient_name: string
          pcp_contact: string | null
          pcp_name: string | null
          preferred_delivery_method: string | null
          reason_for_referral: string | null
          recommendations: string[] | null
          region: string | null
          sent_at: string | null
          sent_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          care_targets_summary?: Json | null
          clinic_id?: string | null
          clinical_course_summary?: string | null
          clinician_confirmed_at?: string | null
          clinician_confirmed_by?: string | null
          clinician_name?: string | null
          created_at?: string
          delivery_method_used?: string | null
          discharge_date: string
          discharge_status?: string | null
          draft_generated_at?: string | null
          draft_summary?: Json | null
          episode_id: string
          followup_guidance?: string | null
          id?: string
          notes?: string | null
          outcome_integrity_issues?: string[] | null
          outcome_integrity_passed?: boolean | null
          patient_name: string
          pcp_contact?: string | null
          pcp_name?: string | null
          preferred_delivery_method?: string | null
          reason_for_referral?: string | null
          recommendations?: string[] | null
          region?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          care_targets_summary?: Json | null
          clinic_id?: string | null
          clinical_course_summary?: string | null
          clinician_confirmed_at?: string | null
          clinician_confirmed_by?: string | null
          clinician_name?: string | null
          created_at?: string
          delivery_method_used?: string | null
          discharge_date?: string
          discharge_status?: string | null
          draft_generated_at?: string | null
          draft_summary?: Json | null
          episode_id?: string
          followup_guidance?: string | null
          id?: string
          notes?: string | null
          outcome_integrity_issues?: string[] | null
          outcome_integrity_passed?: boolean | null
          patient_name?: string
          pcp_contact?: string | null
          pcp_name?: string | null
          preferred_delivery_method?: string | null
          reason_for_referral?: string | null
          recommendations?: string[] | null
          region?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pcp_summary_tasks_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pcp_summary_tasks_clinician_confirmed_by_fkey"
            columns: ["clinician_confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pcp_summary_tasks_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: true
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_episode_continuations: {
        Row: {
          category: string
          clinic_id: string | null
          clinician_id: string | null
          clinician_name: string | null
          completed_at: string | null
          completed_by: string | null
          continuation_source: string
          created_at: string
          created_episode_id: string | null
          documented_complaint_ref: string | null
          id: string
          notes: string | null
          outcome_tools_suggestion: string[] | null
          patient_name: string
          primary_complaint: string
          source_episode_id: string
          status: string
          transition_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          clinic_id?: string | null
          clinician_id?: string | null
          clinician_name?: string | null
          completed_at?: string | null
          completed_by?: string | null
          continuation_source: string
          created_at?: string
          created_episode_id?: string | null
          documented_complaint_ref?: string | null
          id?: string
          notes?: string | null
          outcome_tools_suggestion?: string[] | null
          patient_name: string
          primary_complaint: string
          source_episode_id: string
          status?: string
          transition_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          clinic_id?: string | null
          clinician_id?: string | null
          clinician_name?: string | null
          completed_at?: string | null
          completed_by?: string | null
          continuation_source?: string
          created_at?: string
          created_episode_id?: string | null
          documented_complaint_ref?: string | null
          id?: string
          notes?: string | null
          outcome_tools_suggestion?: string[] | null
          patient_name?: string
          primary_complaint?: string
          source_episode_id?: string
          status?: string
          transition_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_episode_continuations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_episode_continuations_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_episode_continuations_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_episode_continuations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          body_region: string | null
          clinic_id: string | null
          complaint_category: string | null
          complaint_priority: number
          complaint_text: string | null
          converted_at: string | null
          converted_to_episode_id: string | null
          created_at: string
          date_of_birth: string | null
          deferred_reason: string | null
          episode_type: string | null
          id: string
          intake_form_id: string | null
          notes: string | null
          patient_name: string
          previous_episode_id: string | null
          referral_inquiry_id: string | null
          scheduled_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body_region?: string | null
          clinic_id?: string | null
          complaint_category?: string | null
          complaint_priority: number
          complaint_text?: string | null
          converted_at?: string | null
          converted_to_episode_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          deferred_reason?: string | null
          episode_type?: string | null
          id?: string
          intake_form_id?: string | null
          notes?: string | null
          patient_name: string
          previous_episode_id?: string | null
          referral_inquiry_id?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body_region?: string | null
          clinic_id?: string | null
          complaint_category?: string | null
          complaint_priority?: number
          complaint_text?: string | null
          converted_at?: string | null
          converted_to_episode_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          deferred_reason?: string | null
          episode_type?: string | null
          id?: string
          intake_form_id?: string | null
          notes?: string | null
          patient_name?: string
          previous_episode_id?: string | null
          referral_inquiry_id?: string | null
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
          {
            foreignKeyName: "pending_episodes_referral_inquiry_id_fkey"
            columns: ["referral_inquiry_id"]
            isOneToOne: false
            referencedRelation: "referral_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      post_ortho_return_packets: {
        Row: {
          clinic_id: string | null
          complications: string | null
          created_at: string
          episode_id: string
          id: string
          next_ortho_followup_date: string | null
          ortho_partner_id: string
          patient_id: string | null
          procedure_performed: string | null
          rehab_discharge_date: string | null
          rehab_facility: string | null
          submitted_by: string | null
          submitted_via: string | null
          surgery_date: string | null
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          complications?: string | null
          created_at?: string
          episode_id: string
          id?: string
          next_ortho_followup_date?: string | null
          ortho_partner_id: string
          patient_id?: string | null
          procedure_performed?: string | null
          rehab_discharge_date?: string | null
          rehab_facility?: string | null
          submitted_by?: string | null
          submitted_via?: string | null
          surgery_date?: string | null
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          complications?: string | null
          created_at?: string
          episode_id?: string
          id?: string
          next_ortho_followup_date?: string | null
          ortho_partner_id?: string
          patient_id?: string | null
          procedure_performed?: string | null
          rehab_discharge_date?: string | null
          rehab_facility?: string | null
          submitted_by?: string | null
          submitted_via?: string | null
          surgery_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_ortho_return_packets_ortho_partner_id_fkey"
            columns: ["ortho_partner_id"]
            isOneToOne: false
            referencedRelation: "ortho_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_shared_episodes: {
        Row: {
          access_level: string
          created_at: string
          episode_id: string
          expires_at: string | null
          id: string
          professional_user_id: string
          shared_at: string
          shared_by: string | null
          updated_at: string
        }
        Insert: {
          access_level?: string
          created_at?: string
          episode_id: string
          expires_at?: string | null
          id?: string
          professional_user_id: string
          shared_at?: string
          shared_by?: string | null
          updated_at?: string
        }
        Update: {
          access_level?: string
          created_at?: string
          episode_id?: string
          expires_at?: string | null
          id?: string
          professional_user_id?: string
          shared_at?: string
          shared_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_shared_episodes_episode_id_fkey"
            columns: ["episode_id"]
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
      referral_inquiries: {
        Row: {
          care_for: string
          chief_complaint: string
          clinic_id: string | null
          created_at: string
          decline_reason: string | null
          email: string
          id: string
          name: string
          pending_episode_id: string | null
          phone: string | null
          referral_code: string | null
          referral_source: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          care_for: string
          chief_complaint: string
          clinic_id?: string | null
          created_at?: string
          decline_reason?: string | null
          email: string
          id?: string
          name: string
          pending_episode_id?: string | null
          phone?: string | null
          referral_code?: string | null
          referral_source?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          care_for?: string
          chief_complaint?: string
          clinic_id?: string | null
          created_at?: string
          decline_reason?: string | null
          email?: string
          id?: string
          name?: string
          pending_episode_id?: string | null
          phone?: string | null
          referral_code?: string | null
          referral_source?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_inquiries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_inquiries_pending_episode_id_fkey"
            columns: ["pending_episode_id"]
            isOneToOne: false
            referencedRelation: "pending_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_inquiries_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      special_situations: {
        Row: {
          clinic_id: string | null
          clinician_id: string
          clinician_name: string | null
          created_at: string
          detected_at: string
          episode_id: string
          id: string
          note_content: string | null
          patient_name: string
          resolved_at: string | null
          resolved_by: string | null
          situation_type: string
          status: string
          summary: string
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          clinician_id: string
          clinician_name?: string | null
          created_at?: string
          detected_at?: string
          episode_id: string
          id?: string
          note_content?: string | null
          patient_name: string
          resolved_at?: string | null
          resolved_by?: string | null
          situation_type: string
          status?: string
          summary: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          clinician_id?: string
          clinician_name?: string | null
          created_at?: string
          detected_at?: string
          episode_id?: string
          id?: string
          note_content?: string | null
          patient_name?: string
          resolved_at?: string | null
          resolved_by?: string | null
          situation_type?: string
          status?: string
          summary?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_user_id: string
          sender_user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_user_id: string
          sender_user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_user_id?: string
          sender_user_id?: string
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
      utm_health_issues: {
        Row: {
          created_at: string
          detected_at: string
          id: string
          is_active: boolean
          issue_details: string
          issue_type: string
          lead_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          detected_at?: string
          id?: string
          is_active?: boolean
          issue_details: string
          issue_type: string
          lead_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          detected_at?: string
          id?: string
          is_active?: boolean
          issue_details?: string
          issue_type?: string
          lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "utm_health_issues_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
      stalled_communication_tasks: {
        Row: {
          admin_acknowledged_at: string | null
          assigned_clinician_id: string | null
          cancelled_reason: string | null
          category: string | null
          clinician_name: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          days_in_status: number | null
          description: string | null
          due_at: string | null
          episode_id: string | null
          id: string | null
          letter_file_url: string | null
          letter_subtype: string | null
          patient_id: string | null
          patient_message_id: string | null
          patient_name: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          source: Database["public"]["Enums"]["task_source"] | null
          stall_detected_at: string | null
          stall_threshold_days: number | null
          status: string | null
          status_changed_at: string | null
          type: Database["public"]["Enums"]["task_type"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_tasks_assigned_clinician_id_fkey"
            columns: ["assigned_clinician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auto_link_patient_episodes: {
        Args: { p_email: string; p_patient_account_id: string }
        Returns: undefined
      }
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
      detect_stalled_tasks: { Args: never; Returns: undefined }
      generate_referral_code: {
        Args: { p_patient_id: string }
        Returns: string
      }
      get_clinician_display_name: {
        Args: { clinician_id: string }
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
      has_team_chat_access: { Args: { _user_id: string }; Returns: boolean }
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
      app_role: "admin" | "clinician" | "owner" | "professional_verified"
      episode_status:
        | "ACTIVE_CONSERVATIVE_CARE"
        | "REFERRED_TO_ORTHO"
        | "ORTHO_CONSULT_COMPLETED"
        | "SURGERY_COMPLETED"
        | "ORTHO_REHAB_IN_PROGRESS"
        | "ORTHO_REHAB_COMPLETED"
        | "PENDING_RETURN_TO_PPC"
        | "FINAL_PPC_ASSESSMENT_COMPLETED"
        | "EPISODE_CLOSED"
      episode_transition_reason:
        | "UNRELATED_NEW_COMPLAINT"
        | "SEQUENTIAL_CARE"
        | "EMERGED_DURING_TREATMENT"
        | "PREVENTIVE_OR_PERFORMANCE"
      task_owner_type: "ADMIN" | "CLINICIAN"
      task_priority: "HIGH" | "NORMAL"
      task_source: "ADMIN" | "CLINICIAN" | "PATIENT_PORTAL"
      task_status: "Open" | "Done"
      task_type:
        | "CALL_BACK"
        | "EMAIL_REPLY"
        | "IMAGING_REPORT"
        | "PATIENT_MESSAGE"
        | "LETTER"
        | "OTHER_ACTION"
        | "PATIENT_CALLBACK"
        | "PATIENT_EMAIL_RESPONSE"
        | "PORTAL_MESSAGE_RESPONSE"
        | "RESEND_INTAKE_FORMS"
        | "FOLLOWUP_INCOMPLETE_FORMS"
        | "SEND_RECEIPT"
        | "ORDER_IMAGING"
        | "SCHEDULE_APPOINTMENT"
        | "CONFIRM_APPOINTMENT"
        | "REQUEST_OUTSIDE_RECORDS"
        | "SEND_RECORDS_TO_PATIENT"
        | "UPDATE_PATIENT_CONTACT"
        | "DOCUMENT_PATIENT_REQUEST"
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
      app_role: ["admin", "clinician", "owner", "professional_verified"],
      episode_status: [
        "ACTIVE_CONSERVATIVE_CARE",
        "REFERRED_TO_ORTHO",
        "ORTHO_CONSULT_COMPLETED",
        "SURGERY_COMPLETED",
        "ORTHO_REHAB_IN_PROGRESS",
        "ORTHO_REHAB_COMPLETED",
        "PENDING_RETURN_TO_PPC",
        "FINAL_PPC_ASSESSMENT_COMPLETED",
        "EPISODE_CLOSED",
      ],
      episode_transition_reason: [
        "UNRELATED_NEW_COMPLAINT",
        "SEQUENTIAL_CARE",
        "EMERGED_DURING_TREATMENT",
        "PREVENTIVE_OR_PERFORMANCE",
      ],
      task_owner_type: ["ADMIN", "CLINICIAN"],
      task_priority: ["HIGH", "NORMAL"],
      task_source: ["ADMIN", "CLINICIAN", "PATIENT_PORTAL"],
      task_status: ["Open", "Done"],
      task_type: [
        "CALL_BACK",
        "EMAIL_REPLY",
        "IMAGING_REPORT",
        "PATIENT_MESSAGE",
        "LETTER",
        "OTHER_ACTION",
        "PATIENT_CALLBACK",
        "PATIENT_EMAIL_RESPONSE",
        "PORTAL_MESSAGE_RESPONSE",
        "RESEND_INTAKE_FORMS",
        "FOLLOWUP_INCOMPLETE_FORMS",
        "SEND_RECEIPT",
        "ORDER_IMAGING",
        "SCHEDULE_APPOINTMENT",
        "CONFIRM_APPOINTMENT",
        "REQUEST_OUTSIDE_RECORDS",
        "SEND_RECORDS_TO_PATIENT",
        "UPDATE_PATIENT_CONTACT",
        "DOCUMENT_PATIENT_REQUEST",
      ],
    },
  },
} as const
