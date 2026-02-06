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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_courses: {
        Row: {
          course_code: string
          course_title: string
          course_type: string
          created_at: string
          description: string | null
          id: string
          institution_id: string | null
          instructor_id: string | null
          is_active: boolean | null
          linked_research_domains: string[] | null
          term: string | null
        }
        Insert: {
          course_code: string
          course_title: string
          course_type: string
          created_at?: string
          description?: string | null
          id?: string
          institution_id?: string | null
          instructor_id?: string | null
          is_active?: boolean | null
          linked_research_domains?: string[] | null
          term?: string | null
        }
        Update: {
          course_code?: string
          course_title?: string
          course_type?: string
          created_at?: string
          description?: string | null
          id?: string
          institution_id?: string | null
          instructor_id?: string | null
          is_active?: boolean | null
          linked_research_domains?: string[] | null
          term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_courses_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_disciplines: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          name: string
          parent_discipline_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
          parent_discipline_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
          parent_discipline_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_disciplines_parent_discipline_id_fkey"
            columns: ["parent_discipline_id"]
            isOneToOne: false
            referencedRelation: "academic_disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_disputes: {
        Row: {
          confidentiality_level: string
          created_at: string
          description: string
          dispute_type: string
          id: string
          priority: string
          raised_by_user_id: string
          related_entity_id: string | null
          related_entity_type: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          confidentiality_level?: string
          created_at?: string
          description: string
          dispute_type: string
          id?: string
          priority?: string
          raised_by_user_id: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          confidentiality_level?: string
          created_at?: string
          description?: string
          dispute_type?: string
          id?: string
          priority?: string
          raised_by_user_id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_disputes_raised_by_user_id_fkey"
            columns: ["raised_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_records: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          institution_id: string | null
          is_public: boolean
          metadata: Json | null
          record_type: string
          skills_demonstrated: string[] | null
          start_date: string | null
          supervisor_id: string | null
          title: string
          updated_at: string
          user_id: string
          verification_hash: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          institution_id?: string | null
          is_public?: boolean
          metadata?: Json | null
          record_type: string
          skills_demonstrated?: string[] | null
          start_date?: string | null
          supervisor_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          verification_hash?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          institution_id?: string | null
          is_public?: boolean
          metadata?: Json | null
          record_type?: string
          skills_demonstrated?: string[] | null
          start_date?: string | null
          supervisor_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          verification_hash?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_traditions: {
        Row: {
          collaboration_norms: Json | null
          core_values: Json
          created_at: string
          description: string
          hierarchy_expectations: Json | null
          id: string
          is_active: boolean | null
          peer_review_customs: Json | null
          publication_preferences: Json | null
          regions: string[]
          tradition_name: string
        }
        Insert: {
          collaboration_norms?: Json | null
          core_values: Json
          created_at?: string
          description: string
          hierarchy_expectations?: Json | null
          id?: string
          is_active?: boolean | null
          peer_review_customs?: Json | null
          publication_preferences?: Json | null
          regions: string[]
          tradition_name: string
        }
        Update: {
          collaboration_norms?: Json | null
          core_values?: Json
          created_at?: string
          description?: string
          hierarchy_expectations?: Json | null
          id?: string
          is_active?: boolean | null
          peer_review_customs?: Json | null
          publication_preferences?: Json | null
          regions?: string[]
          tradition_name?: string
        }
        Relationships: []
      }
      accessibility_preferences: {
        Row: {
          audio_descriptions_enabled: boolean | null
          keyboard_navigation_enhanced: boolean | null
          preferred_contrast: string | null
          reduced_motion: boolean | null
          screen_reader_mode: boolean | null
          text_scaling: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_descriptions_enabled?: boolean | null
          keyboard_navigation_enhanced?: boolean | null
          preferred_contrast?: string | null
          reduced_motion?: boolean | null
          screen_reader_mode?: boolean | null
          text_scaling?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_descriptions_enabled?: boolean | null
          keyboard_navigation_enhanced?: boolean | null
          preferred_contrast?: string | null
          reduced_motion?: boolean | null
          screen_reader_mode?: boolean | null
          text_scaling?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      accountability_records: {
        Row: {
          collaboration_type: string
          created_at: string | null
          deadline: string | null
          escrow_amount: number | null
          escrow_locked_at: string | null
          escrow_released_at: string | null
          executor_id: string
          failure_attributed_to: string | null
          failure_reason: string | null
          funder_id: string | null
          id: string
          initiator_id: string
          is_public: boolean | null
          outcome_evidence: Json | null
          outcome_status: string
          outcome_verdict: string | null
          project_id: string | null
          promised_deliverables: string[]
          roles: Json | null
          total_paid: number | null
          trust_impact_applied: boolean | null
          trust_impact_executor: number | null
          trust_impact_initiator: number | null
          updated_at: string | null
          verification_method: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          collaboration_type?: string
          created_at?: string | null
          deadline?: string | null
          escrow_amount?: number | null
          escrow_locked_at?: string | null
          escrow_released_at?: string | null
          executor_id: string
          failure_attributed_to?: string | null
          failure_reason?: string | null
          funder_id?: string | null
          id?: string
          initiator_id: string
          is_public?: boolean | null
          outcome_evidence?: Json | null
          outcome_status?: string
          outcome_verdict?: string | null
          project_id?: string | null
          promised_deliverables?: string[]
          roles?: Json | null
          total_paid?: number | null
          trust_impact_applied?: boolean | null
          trust_impact_executor?: number | null
          trust_impact_initiator?: number | null
          updated_at?: string | null
          verification_method?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          collaboration_type?: string
          created_at?: string | null
          deadline?: string | null
          escrow_amount?: number | null
          escrow_locked_at?: string | null
          escrow_released_at?: string | null
          executor_id?: string
          failure_attributed_to?: string | null
          failure_reason?: string | null
          funder_id?: string | null
          id?: string
          initiator_id?: string
          is_public?: boolean | null
          outcome_evidence?: Json | null
          outcome_status?: string
          outcome_verdict?: string | null
          project_id?: string | null
          promised_deliverables?: string[]
          roles?: Json | null
          total_paid?: number | null
          trust_impact_applied?: boolean | null
          trust_impact_executor?: number | null
          trust_impact_initiator?: number | null
          updated_at?: string | null
          verification_method?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accountability_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      accountability_reports: {
        Row: {
          created_at: string
          executive_summary: string
          financial_summary: Json | null
          full_report_url: string | null
          governance_changes: Json | null
          id: string
          incident_summary: Json | null
          is_public: boolean | null
          key_metrics: Json
          published_at: string | null
          report_period_end: string
          report_period_start: string
          report_type: string
          title: string
        }
        Insert: {
          created_at?: string
          executive_summary: string
          financial_summary?: Json | null
          full_report_url?: string | null
          governance_changes?: Json | null
          id?: string
          incident_summary?: Json | null
          is_public?: boolean | null
          key_metrics: Json
          published_at?: string | null
          report_period_end: string
          report_period_start: string
          report_type: string
          title: string
        }
        Update: {
          created_at?: string
          executive_summary?: string
          financial_summary?: Json | null
          full_report_url?: string | null
          governance_changes?: Json | null
          id?: string
          incident_summary?: Json | null
          is_public?: boolean | null
          key_metrics?: Json
          published_at?: string | null
          report_period_end?: string
          report_period_start?: string
          report_type?: string
          title?: string
        }
        Relationships: []
      }
      action_confirmations: {
        Row: {
          action_target_id: string
          action_type: string
          confirmation_data: Json
          confirmed_at: string | null
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          action_target_id: string
          action_type: string
          confirmation_data: Json
          confirmed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          action_target_id?: string
          action_type?: string
          confirmation_data?: Json
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          created_at: string
          created_by: string
          entity_id: string
          entity_type: string
          id: string
          note: string
        }
        Insert: {
          created_at?: string
          created_by: string
          entity_id: string
          entity_type: string
          id?: string
          note: string
        }
        Update: {
          created_at?: string
          created_by?: string
          entity_id?: string
          entity_type?: string
          id?: string
          note?: string
        }
        Relationships: []
      }
      admin_scopes: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean | null
          scope: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          scope: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          scope?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_applications: {
        Row: {
          account_age_days: number
          acknowledged_rules: boolean
          affiliate_type: Database["public"]["Enums"]["affiliate_type"]
          created_at: string
          has_completed_outcomes: boolean
          has_spam_flags: boolean
          has_unresolved_disputes: boolean
          id: string
          institution_id: string | null
          motivation: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_audience: string
          trust_score_at_application: number
          trust_tier_at_application: string
          updated_at: string
          user_id: string
          value_proposition: string
        }
        Insert: {
          account_age_days: number
          acknowledged_rules?: boolean
          affiliate_type?: Database["public"]["Enums"]["affiliate_type"]
          created_at?: string
          has_completed_outcomes?: boolean
          has_spam_flags?: boolean
          has_unresolved_disputes?: boolean
          id?: string
          institution_id?: string | null
          motivation: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_audience: string
          trust_score_at_application: number
          trust_tier_at_application: string
          updated_at?: string
          user_id: string
          value_proposition: string
        }
        Update: {
          account_age_days?: number
          acknowledged_rules?: boolean
          affiliate_type?: Database["public"]["Enums"]["affiliate_type"]
          created_at?: string
          has_completed_outcomes?: boolean
          has_spam_flags?: boolean
          has_unresolved_disputes?: boolean
          id?: string
          institution_id?: string | null
          motivation?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_audience?: string
          trust_score_at_application?: number
          trust_tier_at_application?: string
          updated_at?: string
          user_id?: string
          value_proposition?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commission_tiers: {
        Row: {
          base_commission_rate: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          max_trust_score: number | null
          min_trust_score: number
          tier_name: string
          trust_weight: number
        }
        Insert: {
          base_commission_rate: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_trust_score?: number | null
          min_trust_score: number
          tier_name: string
          trust_weight?: number
        }
        Update: {
          base_commission_rate?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_trust_score?: number | null
          min_trust_score?: number
          tier_name?: string
          trust_weight?: number
        }
        Relationships: []
      }
      affiliate_conversions: {
        Row: {
          affiliate_id: string | null
          commission_amount: number
          created_at: string | null
          id: string
          referred_user_id: string | null
          status: string | null
          transaction_amount: number
          transaction_type: string
        }
        Insert: {
          affiliate_id?: string | null
          commission_amount: number
          created_at?: string | null
          id?: string
          referred_user_id?: string | null
          status?: string | null
          transaction_amount: number
          transaction_type: string
        }
        Update: {
          affiliate_id?: string | null
          commission_amount?: number
          created_at?: string | null
          id?: string
          referred_user_id?: string | null
          status?: string | null
          transaction_amount?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_eligibility_rules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          rule_key: string
          rule_name: string
          rule_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          rule_key: string
          rule_name: string
          rule_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          rule_key?: string
          rule_name?: string
          rule_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_referral_outcomes: {
        Row: {
          affiliate_id: string
          approved_at: string | null
          commission_earned: number | null
          commission_status: string
          created_at: string
          id: string
          outcome_type: Database["public"]["Enums"]["referral_outcome_type"]
          outcome_value: number | null
          referred_user_id: string | null
          referred_user_retained: boolean | null
          referred_user_trust_score: number | null
          related_entity_id: string | null
          related_entity_type: string | null
          released_at: string | null
          retention_days: number | null
          reversal_reason: string | null
          reversed_at: string | null
        }
        Insert: {
          affiliate_id: string
          approved_at?: string | null
          commission_earned?: number | null
          commission_status?: string
          created_at?: string
          id?: string
          outcome_type: Database["public"]["Enums"]["referral_outcome_type"]
          outcome_value?: number | null
          referred_user_id?: string | null
          referred_user_retained?: boolean | null
          referred_user_trust_score?: number | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          released_at?: string | null
          retention_days?: number | null
          reversal_reason?: string | null
          reversed_at?: string | null
        }
        Update: {
          affiliate_id?: string
          approved_at?: string | null
          commission_earned?: number | null
          commission_status?: string
          created_at?: string
          id?: string
          outcome_type?: Database["public"]["Enums"]["referral_outcome_type"]
          outcome_value?: number | null
          referred_user_id?: string | null
          referred_user_retained?: boolean | null
          referred_user_trust_score?: number | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          released_at?: string | null
          retention_days?: number | null
          reversal_reason?: string | null
          reversed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referral_outcomes_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referral_outcomes_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_violations: {
        Row: {
          affiliate_id: string
          appeal_text: string | null
          auto_detected: boolean | null
          commission_penalty_percent: number | null
          created_at: string
          description: string
          evidence: Json | null
          id: string
          reported_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          resulted_in_pause: boolean | null
          resulted_in_revocation: boolean | null
          severity: Database["public"]["Enums"]["violation_severity"]
          status: string
          trust_penalty: number | null
          violation_type: string
        }
        Insert: {
          affiliate_id: string
          appeal_text?: string | null
          auto_detected?: boolean | null
          commission_penalty_percent?: number | null
          created_at?: string
          description: string
          evidence?: Json | null
          id?: string
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resulted_in_pause?: boolean | null
          resulted_in_revocation?: boolean | null
          severity?: Database["public"]["Enums"]["violation_severity"]
          status?: string
          trust_penalty?: number | null
          violation_type: string
        }
        Update: {
          affiliate_id?: string
          appeal_text?: string | null
          auto_detected?: boolean | null
          commission_penalty_percent?: number | null
          created_at?: string
          description?: string
          evidence?: Json | null
          id?: string
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resulted_in_pause?: boolean | null
          resulted_in_revocation?: boolean | null
          severity?: Database["public"]["Enums"]["violation_severity"]
          status?: string
          trust_penalty?: number | null
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_violations_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_type: Database["public"]["Enums"]["affiliate_type"] | null
          application_id: string | null
          available_earnings: number | null
          base_commission_rate: number | null
          commission_rate: number | null
          created_at: string | null
          current_trust_weight: number | null
          custom_commission_rate: number | null
          effective_commission_rate: number | null
          id: string
          institution_id: string | null
          last_violation_at: string | null
          lifecycle_status:
            | Database["public"]["Enums"]["affiliate_lifecycle_status"]
            | null
          lifetime_earnings: number | null
          notes: string | null
          outcome_conversion_rate: number | null
          paused_at: string | null
          paused_reason: string | null
          pending_earnings: number | null
          referral_code: string
          referral_quality_score: number | null
          revoked_at: string | null
          revoked_reason: string | null
          status: string | null
          total_clicks: number | null
          total_conversions: number | null
          total_outcomes: number | null
          total_signups: number | null
          trust_score_at_activation: number | null
          updated_at: string | null
          user_id: string
          violation_count: number | null
        }
        Insert: {
          affiliate_type?: Database["public"]["Enums"]["affiliate_type"] | null
          application_id?: string | null
          available_earnings?: number | null
          base_commission_rate?: number | null
          commission_rate?: number | null
          created_at?: string | null
          current_trust_weight?: number | null
          custom_commission_rate?: number | null
          effective_commission_rate?: number | null
          id?: string
          institution_id?: string | null
          last_violation_at?: string | null
          lifecycle_status?:
            | Database["public"]["Enums"]["affiliate_lifecycle_status"]
            | null
          lifetime_earnings?: number | null
          notes?: string | null
          outcome_conversion_rate?: number | null
          paused_at?: string | null
          paused_reason?: string | null
          pending_earnings?: number | null
          referral_code: string
          referral_quality_score?: number | null
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_outcomes?: number | null
          total_signups?: number | null
          trust_score_at_activation?: number | null
          updated_at?: string | null
          user_id: string
          violation_count?: number | null
        }
        Update: {
          affiliate_type?: Database["public"]["Enums"]["affiliate_type"] | null
          application_id?: string | null
          available_earnings?: number | null
          base_commission_rate?: number | null
          commission_rate?: number | null
          created_at?: string | null
          current_trust_weight?: number | null
          custom_commission_rate?: number | null
          effective_commission_rate?: number | null
          id?: string
          institution_id?: string | null
          last_violation_at?: string | null
          lifecycle_status?:
            | Database["public"]["Enums"]["affiliate_lifecycle_status"]
            | null
          lifetime_earnings?: number | null
          notes?: string | null
          outcome_conversion_rate?: number | null
          paused_at?: string | null
          paused_reason?: string | null
          pending_earnings?: number | null
          referral_code?: string
          referral_quality_score?: number | null
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_outcomes?: number | null
          total_signups?: number | null
          trust_score_at_activation?: number | null
          updated_at?: string | null
          user_id?: string
          violation_count?: number | null
        }
        Relationships: []
      }
      ai_advisory_records: {
        Row: {
          ai_model_id: string | null
          created_at: string
          decided_by: string | null
          decision_class_id: string | null
          decision_context: string
          divergence_reason: string | null
          full_reasoning: Json | null
          human_decision: string | null
          id: string
          recommendation_summary: string
          uncertainty_level: string
          was_followed: boolean | null
        }
        Insert: {
          ai_model_id?: string | null
          created_at?: string
          decided_by?: string | null
          decision_class_id?: string | null
          decision_context: string
          divergence_reason?: string | null
          full_reasoning?: Json | null
          human_decision?: string | null
          id?: string
          recommendation_summary: string
          uncertainty_level: string
          was_followed?: boolean | null
        }
        Update: {
          ai_model_id?: string | null
          created_at?: string
          decided_by?: string | null
          decision_class_id?: string | null
          decision_context?: string
          divergence_reason?: string | null
          full_reasoning?: Json | null
          human_decision?: string | null
          id?: string
          recommendation_summary?: string
          uncertainty_level?: string
          was_followed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_advisory_records_decision_class_id_fkey"
            columns: ["decision_class_id"]
            isOneToOne: false
            referencedRelation: "decision_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assistance_records: {
        Row: {
          ai_model_version: string | null
          ai_tool_name: string
          assistance_type: string
          id: string
          initiated_by_user_id: string | null
          input_tokens: number | null
          output_tokens: number | null
          research_timeline_id: string | null
          scope_description: string | null
          used_at: string
          workspace_id: string | null
        }
        Insert: {
          ai_model_version?: string | null
          ai_tool_name: string
          assistance_type: string
          id?: string
          initiated_by_user_id?: string | null
          input_tokens?: number | null
          output_tokens?: number | null
          research_timeline_id?: string | null
          scope_description?: string | null
          used_at?: string
          workspace_id?: string | null
        }
        Update: {
          ai_model_version?: string | null
          ai_tool_name?: string
          assistance_type?: string
          id?: string
          initiated_by_user_id?: string | null
          input_tokens?: number | null
          output_tokens?: number | null
          research_timeline_id?: string | null
          scope_description?: string | null
          used_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_assistance_records_initiated_by_user_id_fkey"
            columns: ["initiated_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_assistance_records_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_assistance_records_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "collaborative_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assistant_outputs: {
        Row: {
          ai_output: string
          citations_used: Json | null
          confidence_level: string
          created_at: string
          id: string
          model_used: string | null
          processing_time_ms: number | null
          prompt_summary: string
          session_id: string
          tokens_used: number | null
          user_feedback: string | null
          user_rating: number | null
          was_helpful: boolean | null
        }
        Insert: {
          ai_output: string
          citations_used?: Json | null
          confidence_level?: string
          created_at?: string
          id?: string
          model_used?: string | null
          processing_time_ms?: number | null
          prompt_summary: string
          session_id: string
          tokens_used?: number | null
          user_feedback?: string | null
          user_rating?: number | null
          was_helpful?: boolean | null
        }
        Update: {
          ai_output?: string
          citations_used?: Json | null
          confidence_level?: string
          created_at?: string
          id?: string
          model_used?: string | null
          processing_time_ms?: number | null
          prompt_summary?: string
          session_id?: string
          tokens_used?: number | null
          user_feedback?: string | null
          user_rating?: number | null
          was_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_assistant_outputs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_assistant_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assistant_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          intent: string
          is_active: boolean | null
          scope_id: string | null
          scope_type: string | null
          session_title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          intent: string
          is_active?: boolean | null
          scope_id?: string | null
          scope_type?: string | null
          session_title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          intent?: string
          is_active?: boolean | null
          scope_id?: string | null
          scope_type?: string | null
          session_title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_assistant_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_attribution_statements: {
        Row: {
          ai_tools_used: string[] | null
          approved_at: string | null
          approved_by_user_id: string | null
          disclosure_text: string
          generated_at: string
          id: string
          is_public: boolean | null
          target_id: string
          target_type: string
        }
        Insert: {
          ai_tools_used?: string[] | null
          approved_at?: string | null
          approved_by_user_id?: string | null
          disclosure_text: string
          generated_at?: string
          id?: string
          is_public?: boolean | null
          target_id: string
          target_type: string
        }
        Update: {
          ai_tools_used?: string[] | null
          approved_at?: string | null
          approved_by_user_id?: string | null
          disclosure_text?: string
          generated_at?: string
          id?: string
          is_public?: boolean | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_attribution_statements_approved_by_user_id_fkey"
            columns: ["approved_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_bias_monitoring: {
        Row: {
          ai_capability: string
          bias_indicators: Json | null
          created_at: string
          demographic_breakdown: Json | null
          fairness_score: number | null
          id: string
          monitoring_period_end: string
          monitoring_period_start: string
          outcome_distribution: Json | null
          recommendations: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          total_decisions: number
        }
        Insert: {
          ai_capability: string
          bias_indicators?: Json | null
          created_at?: string
          demographic_breakdown?: Json | null
          fairness_score?: number | null
          id?: string
          monitoring_period_end: string
          monitoring_period_start: string
          outcome_distribution?: Json | null
          recommendations?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          total_decisions: number
        }
        Update: {
          ai_capability?: string
          bias_indicators?: Json | null
          created_at?: string
          demographic_breakdown?: Json | null
          fairness_score?: number | null
          id?: string
          monitoring_period_end?: string
          monitoring_period_start?: string
          outcome_distribution?: Json | null
          recommendations?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          total_decisions?: number
        }
        Relationships: []
      }
      ai_constitutional_rules: {
        Row: {
          can_be_suspended: boolean | null
          created_at: string
          created_by_charter: string | null
          effective_from: string
          enforcement_mechanism: string
          id: string
          rationale: string
          rule_category: string
          rule_definition: string
          rule_name: string
          suspension_requires: string | null
          violation_consequences: string
        }
        Insert: {
          can_be_suspended?: boolean | null
          created_at?: string
          created_by_charter?: string | null
          effective_from?: string
          enforcement_mechanism: string
          id?: string
          rationale: string
          rule_category: string
          rule_definition: string
          rule_name: string
          suspension_requires?: string | null
          violation_consequences: string
        }
        Update: {
          can_be_suspended?: boolean | null
          created_at?: string
          created_by_charter?: string | null
          effective_from?: string
          enforcement_mechanism?: string
          id?: string
          rationale?: string
          rule_category?: string
          rule_definition?: string
          rule_name?: string
          suspension_requires?: string | null
          violation_consequences?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_constitutional_rules_created_by_charter_fkey"
            columns: ["created_by_charter"]
            isOneToOne: false
            referencedRelation: "platform_charters"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_context_snapshots: {
        Row: {
          context_id: string
          context_summary: string
          context_tokens: number | null
          context_type: string
          id: string
          is_active: boolean | null
          last_updated_at: string
          user_id: string
        }
        Insert: {
          context_id: string
          context_summary: string
          context_tokens?: number | null
          context_type: string
          id?: string
          is_active?: boolean | null
          last_updated_at?: string
          user_id: string
        }
        Update: {
          context_id?: string
          context_summary?: string
          context_tokens?: number | null
          context_type?: string
          id?: string
          is_active?: boolean | null
          last_updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_context_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_contribution_flags: {
        Row: {
          ai_involvement_level: string
          applied_at: string
          flag_reason: string | null
          flagged_by: string | null
          id: string
          review_status: string | null
          reviewed_at: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          ai_involvement_level: string
          applied_at?: string
          flag_reason?: string | null
          flagged_by?: string | null
          id?: string
          review_status?: string | null
          reviewed_at?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          ai_involvement_level?: string
          applied_at?: string
          flag_reason?: string | null
          flagged_by?: string | null
          id?: string
          review_status?: string | null
          reviewed_at?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_contribution_flags_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_credit_packs: {
        Row: {
          bonus_credits: number
          created_at: string
          credits: number
          id: string
          is_active: boolean
          name: string
          price: number
        }
        Insert: {
          bonus_credits?: number
          created_at?: string
          credits: number
          id?: string
          is_active?: boolean
          name: string
          price: number
        }
        Update: {
          bonus_credits?: number
          created_at?: string
          credits?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      ai_credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_guardrail_events: {
        Row: {
          guardrail_type: string
          id: string
          message: string
          session_id: string | null
          severity: string
          triggered_at: string
          user_id: string | null
          was_blocked: boolean | null
        }
        Insert: {
          guardrail_type: string
          id?: string
          message: string
          session_id?: string | null
          severity?: string
          triggered_at?: string
          user_id?: string | null
          was_blocked?: boolean | null
        }
        Update: {
          guardrail_type?: string
          id?: string
          message?: string
          session_id?: string | null
          severity?: string
          triggered_at?: string
          user_id?: string | null
          was_blocked?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_guardrail_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_assistant_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_guardrail_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_human_overrides: {
        Row: {
          ai_capability: string
          ai_decision_id: string | null
          ai_recommendation: Json
          created_at: string
          human_decision: Json
          id: string
          learning_incorporated: boolean | null
          outcome_after_override: string | null
          overridden_by: string
          override_authority: string
          override_reason: string
          was_ai_correct: boolean | null
        }
        Insert: {
          ai_capability: string
          ai_decision_id?: string | null
          ai_recommendation: Json
          created_at?: string
          human_decision: Json
          id?: string
          learning_incorporated?: boolean | null
          outcome_after_override?: string | null
          overridden_by: string
          override_authority: string
          override_reason: string
          was_ai_correct?: boolean | null
        }
        Update: {
          ai_capability?: string
          ai_decision_id?: string | null
          ai_recommendation?: Json
          created_at?: string
          human_decision?: Json
          id?: string
          learning_incorporated?: boolean | null
          outcome_after_override?: string | null
          overridden_by?: string
          override_authority?: string
          override_reason?: string
          was_ai_correct?: boolean | null
        }
        Relationships: []
      }
      ai_kill_switches: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          auto_deactivate_at: string | null
          created_at: string | null
          deactivated_at: string | null
          deactivated_by: string | null
          id: string
          is_active: boolean | null
          notification_sent: boolean | null
          reason: string
          switch_target: string | null
          switch_type: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          auto_deactivate_at?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          id?: string
          is_active?: boolean | null
          notification_sent?: boolean | null
          reason: string
          switch_target?: string | null
          switch_type: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          auto_deactivate_at?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          id?: string
          is_active?: boolean | null
          notification_sent?: boolean | null
          reason?: string
          switch_target?: string | null
          switch_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_kill_switches_activated_by_fkey"
            columns: ["activated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_kill_switches_deactivated_by_fkey"
            columns: ["deactivated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_match_results: {
        Row: {
          algorithm_version: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          match_reasons: Json | null
          match_score: number
          matched_user_id: string
          user_id: string
        }
        Insert: {
          algorithm_version?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          match_reasons?: Json | null
          match_score: number
          matched_user_id: string
          user_id: string
        }
        Update: {
          algorithm_version?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          match_reasons?: Json | null
          match_score?: number
          matched_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_match_results_matched_user_id_fkey"
            columns: ["matched_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_match_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_model_registry: {
        Row: {
          approval_council: string | null
          approved_at: string | null
          bias_assessment: Json | null
          capabilities: string[]
          created_at: string
          id: string
          limitations: string[] | null
          model_identifier: string
          provider: string
          replacement_model_id: string | null
          safety_rating: string | null
          sunset_date: string | null
          updated_at: string
          usage_restrictions: Json | null
        }
        Insert: {
          approval_council?: string | null
          approved_at?: string | null
          bias_assessment?: Json | null
          capabilities: string[]
          created_at?: string
          id?: string
          limitations?: string[] | null
          model_identifier: string
          provider: string
          replacement_model_id?: string | null
          safety_rating?: string | null
          sunset_date?: string | null
          updated_at?: string
          usage_restrictions?: Json | null
        }
        Update: {
          approval_council?: string | null
          approved_at?: string | null
          bias_assessment?: Json | null
          capabilities?: string[]
          created_at?: string
          id?: string
          limitations?: string[] | null
          model_identifier?: string
          provider?: string
          replacement_model_id?: string | null
          safety_rating?: string | null
          sunset_date?: string | null
          updated_at?: string
          usage_restrictions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_model_registry_approval_council_fkey"
            columns: ["approval_council"]
            isOneToOne: false
            referencedRelation: "governance_councils"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_model_registry_replacement_model_id_fkey"
            columns: ["replacement_model_id"]
            isOneToOne: false
            referencedRelation: "ai_model_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models_registry: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          capabilities: string[] | null
          cost_per_1k_tokens: number | null
          created_at: string | null
          data_retention_policy: string | null
          enabled: boolean | null
          id: string
          max_tokens_per_request: number | null
          model_identifier: string
          model_name: string
          model_version: string | null
          provider: string
          purpose: string
          requires_human_review: boolean | null
          risk_level: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          capabilities?: string[] | null
          cost_per_1k_tokens?: number | null
          created_at?: string | null
          data_retention_policy?: string | null
          enabled?: boolean | null
          id?: string
          max_tokens_per_request?: number | null
          model_identifier: string
          model_name: string
          model_version?: string | null
          provider: string
          purpose: string
          requires_human_review?: boolean | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          capabilities?: string[] | null
          cost_per_1k_tokens?: number | null
          created_at?: string | null
          data_retention_policy?: string | null
          enabled?: boolean | null
          id?: string
          max_tokens_per_request?: number | null
          model_identifier?: string
          model_name?: string
          model_version?: string | null
          provider?: string
          purpose?: string
          requires_human_review?: boolean | null
          risk_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_models_registry_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_policies: {
        Row: {
          allow_analysis: boolean | null
          allow_co_authoring: boolean | null
          allow_generation: boolean | null
          allow_matching: boolean | null
          allow_training: boolean | null
          created_at: string | null
          created_by: string | null
          human_review_required: boolean | null
          id: string
          is_active: boolean | null
          max_tokens_per_day: number | null
          policy_name: string
          priority: number | null
          rules: Json
          scope: string
          scope_id: string | null
          updated_at: string | null
        }
        Insert: {
          allow_analysis?: boolean | null
          allow_co_authoring?: boolean | null
          allow_generation?: boolean | null
          allow_matching?: boolean | null
          allow_training?: boolean | null
          created_at?: string | null
          created_by?: string | null
          human_review_required?: boolean | null
          id?: string
          is_active?: boolean | null
          max_tokens_per_day?: number | null
          policy_name: string
          priority?: number | null
          rules?: Json
          scope: string
          scope_id?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_analysis?: boolean | null
          allow_co_authoring?: boolean | null
          allow_generation?: boolean | null
          allow_matching?: boolean | null
          allow_training?: boolean | null
          created_at?: string | null
          created_by?: string | null
          human_review_required?: boolean | null
          id?: string
          is_active?: boolean | null
          max_tokens_per_day?: number | null
          policy_name?: string
          priority?: number | null
          rules?: Json
          scope?: string
          scope_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_policies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_policy_profiles: {
        Row: {
          allowed_uses: string[] | null
          created_at: string
          disclosure_required: boolean | null
          id: string
          is_active: boolean | null
          max_ai_contribution_percentage: number | null
          policy_name: string
          prohibited_uses: string[] | null
          scope: string
          scope_id: string | null
          updated_at: string
        }
        Insert: {
          allowed_uses?: string[] | null
          created_at?: string
          disclosure_required?: boolean | null
          id?: string
          is_active?: boolean | null
          max_ai_contribution_percentage?: number | null
          policy_name: string
          prohibited_uses?: string[] | null
          scope: string
          scope_id?: string | null
          updated_at?: string
        }
        Update: {
          allowed_uses?: string[] | null
          created_at?: string
          disclosure_required?: boolean | null
          id?: string
          is_active?: boolean | null
          max_ai_contribution_percentage?: number | null
          policy_name?: string
          prohibited_uses?: string[] | null
          scope?: string
          scope_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          cost_estimate: number | null
          created_at: string | null
          feature: string
          id: string
          input_hash: string
          input_tokens: number | null
          latency_ms: number | null
          model_id: string | null
          output_hash: string
          output_tokens: number | null
          rejection_reason: string | null
          session_id: string | null
          total_tokens: number | null
          user_id: string
          was_rejected: boolean | null
          was_reviewed: boolean | null
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string | null
          feature: string
          id?: string
          input_hash: string
          input_tokens?: number | null
          latency_ms?: number | null
          model_id?: string | null
          output_hash: string
          output_tokens?: number | null
          rejection_reason?: string | null
          session_id?: string | null
          total_tokens?: number | null
          user_id: string
          was_rejected?: boolean | null
          was_reviewed?: boolean | null
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string | null
          feature?: string
          id?: string
          input_hash?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model_id?: string | null
          output_hash?: string
          output_tokens?: number | null
          rejection_reason?: string | null
          session_id?: string | null
          total_tokens?: number | null
          user_id?: string
          was_rejected?: boolean | null
          was_reviewed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_quotas: {
        Row: {
          created_at: string
          id: string
          period_end: string
          period_start: string
          quota_type: string
          sessions_count: number | null
          tokens_limit: number
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          quota_type: string
          sessions_count?: number | null
          tokens_limit?: number
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          quota_type?: string
          sessions_count?: number | null
          tokens_limit?: number
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_quotas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ambient_insights: {
        Row: {
          action_url: string | null
          created_at: string
          description: string
          expires_at: string | null
          id: string
          insight_type: string
          is_dismissed: boolean
          is_read: boolean
          metadata: Json | null
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          insight_type: string
          is_dismissed?: boolean
          is_read?: boolean
          metadata?: Json | null
          priority?: string
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_dismissed?: boolean
          is_read?: boolean
          metadata?: Json | null
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambient_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_guardrails: {
        Row: {
          description: string
          guardrail_type: string
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          trigger_condition: Json
          triggered_at: string
        }
        Insert: {
          description: string
          guardrail_type: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          trigger_condition: Json
          triggered_at?: string
        }
        Update: {
          description?: string
          guardrail_type?: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          trigger_condition?: Json
          triggered_at?: string
        }
        Relationships: []
      }
      analytics_snapshots: {
        Row: {
          computed_at: string
          id: string
          metric_key: string
          metric_value: number
          period: string
          period_start: string
          scope_id: string | null
          scope_type: string
        }
        Insert: {
          computed_at?: string
          id?: string
          metric_key: string
          metric_value?: number
          period: string
          period_start: string
          scope_id?: string | null
          scope_type: string
        }
        Update: {
          computed_at?: string
          id?: string
          metric_key?: string
          metric_value?: number
          period?: string
          period_start?: string
          scope_id?: string | null
          scope_type?: string
        }
        Relationships: []
      }
      api_clients: {
        Row: {
          client_name: string
          client_secret_hash: string
          created_at: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          owner_entity_id: string
          owner_entity_type: string
          rate_limit_per_hour: number | null
          scopes: string[]
          status: string
        }
        Insert: {
          client_name: string
          client_secret_hash: string
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          owner_entity_id: string
          owner_entity_type: string
          rate_limit_per_hour?: number | null
          scopes?: string[]
          status?: string
        }
        Update: {
          client_name?: string
          client_secret_hash?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          owner_entity_id?: string
          owner_entity_type?: string
          rate_limit_per_hour?: number | null
          scopes?: string[]
          status?: string
        }
        Relationships: []
      }
      archival_objects: {
        Row: {
          archival_format: string
          archival_status: string
          archived_at: string
          checksum: string
          id: string
          metadata: Json | null
          size_mb: number | null
          storage_location: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          archival_format: string
          archival_status?: string
          archived_at?: string
          checksum: string
          id?: string
          metadata?: Json | null
          size_mb?: number | null
          storage_location?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          archival_format?: string
          archival_status?: string
          archived_at?: string
          checksum?: string
          id?: string
          metadata?: Json | null
          size_mb?: number | null
          storage_location?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      archival_snapshots: {
        Row: {
          archival_object_id: string
          created_at: string
          id: string
          snapshot_metadata: Json | null
          snapshot_reason: string
        }
        Insert: {
          archival_object_id: string
          created_at?: string
          id?: string
          snapshot_metadata?: Json | null
          snapshot_reason: string
        }
        Update: {
          archival_object_id?: string
          created_at?: string
          id?: string
          snapshot_metadata?: Json | null
          snapshot_reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "archival_snapshots_archival_object_id_fkey"
            columns: ["archival_object_id"]
            isOneToOne: false
            referencedRelation: "archival_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      artifact_lineage: {
        Row: {
          child_artifact_id: string
          confidence_level: string | null
          created_at: string | null
          created_by: string | null
          id: string
          parent_artifact_id: string
          relationship: string
          relationship_details: string | null
        }
        Insert: {
          child_artifact_id: string
          confidence_level?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          parent_artifact_id: string
          relationship: string
          relationship_details?: string | null
        }
        Update: {
          child_artifact_id?: string
          confidence_level?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          parent_artifact_id?: string
          relationship?: string
          relationship_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artifact_lineage_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attack_surfaces: {
        Row: {
          authentication_required: boolean | null
          authorization_level: string | null
          component: string
          created_at: string | null
          data_sensitivity: string | null
          entry_points: string[] | null
          exposure_level: string | null
          id: string
          known_vulnerabilities: string[] | null
          last_assessed_at: string | null
          notes: string | null
          risk_score: number | null
          surface_name: string
          surface_type: string
          updated_at: string | null
        }
        Insert: {
          authentication_required?: boolean | null
          authorization_level?: string | null
          component: string
          created_at?: string | null
          data_sensitivity?: string | null
          entry_points?: string[] | null
          exposure_level?: string | null
          id?: string
          known_vulnerabilities?: string[] | null
          last_assessed_at?: string | null
          notes?: string | null
          risk_score?: number | null
          surface_name: string
          surface_type: string
          updated_at?: string | null
        }
        Update: {
          authentication_required?: boolean | null
          authorization_level?: string | null
          component?: string
          created_at?: string | null
          data_sensitivity?: string | null
          entry_points?: string[] | null
          exposure_level?: string | null
          id?: string
          known_vulnerabilities?: string[] | null
          last_assessed_at?: string | null
          notes?: string | null
          risk_score?: number | null
          surface_name?: string
          surface_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id: string
          category?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bridge_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          research_timeline_id: string
          role_type: string
          scholar_passport_id: string
          source_discipline_id: string | null
          target_discipline_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          research_timeline_id: string
          role_type: string
          scholar_passport_id: string
          source_discipline_id?: string | null
          target_discipline_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          research_timeline_id?: string
          role_type?: string
          scholar_passport_id?: string
          source_discipline_id?: string | null
          target_discipline_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bridge_roles_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bridge_roles_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bridge_roles_source_discipline_id_fkey"
            columns: ["source_discipline_id"]
            isOneToOne: false
            referencedRelation: "academic_disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bridge_roles_target_discipline_id_fkey"
            columns: ["target_discipline_id"]
            isOneToOne: false
            referencedRelation: "academic_disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      canonical_knowledge_records: {
        Row: {
          abstract: string | null
          artifact_id: string | null
          artifact_type: string
          canonical_version: string
          checksum: string
          created_at: string
          declared_scope: string
          governance_body: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          abstract?: string | null
          artifact_id?: string | null
          artifact_type: string
          canonical_version?: string
          checksum: string
          created_at?: string
          declared_scope: string
          governance_body?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          abstract?: string | null
          artifact_id?: string | null
          artifact_type?: string
          canonical_version?: string
          checksum?: string
          created_at?: string
          declared_scope?: string
          governance_body?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      career_milestones: {
        Row: {
          achieved_at: string
          career_profile_id: string
          created_at: string
          description: string | null
          id: string
          institution: string | null
          is_public: boolean | null
          milestone_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          verification_status: string | null
          verified_by: string | null
        }
        Insert: {
          achieved_at: string
          career_profile_id: string
          created_at?: string
          description?: string | null
          id?: string
          institution?: string | null
          is_public?: boolean | null
          milestone_type: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          verification_status?: string | null
          verified_by?: string | null
        }
        Update: {
          achieved_at?: string
          career_profile_id?: string
          created_at?: string
          description?: string | null
          id?: string
          institution?: string | null
          is_public?: boolean | null
          milestone_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          verification_status?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_milestones_career_profile_id_fkey"
            columns: ["career_profile_id"]
            isOneToOne: false
            referencedRelation: "career_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_milestones_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_profiles: {
        Row: {
          career_goal_statement: string | null
          created_at: string
          current_stage: string
          id: string
          is_open_to_mentoring: boolean | null
          max_mentees: number | null
          mentoring_interests: string[] | null
          mentorship_needs: string[] | null
          primary_domain: string | null
          privacy_level: string | null
          scholar_passport_id: string
          secondary_domains: string[] | null
          seeking_mentorship: boolean | null
          updated_at: string
          years_in_academia: number | null
        }
        Insert: {
          career_goal_statement?: string | null
          created_at?: string
          current_stage?: string
          id?: string
          is_open_to_mentoring?: boolean | null
          max_mentees?: number | null
          mentoring_interests?: string[] | null
          mentorship_needs?: string[] | null
          primary_domain?: string | null
          privacy_level?: string | null
          scholar_passport_id: string
          secondary_domains?: string[] | null
          seeking_mentorship?: boolean | null
          updated_at?: string
          years_in_academia?: number | null
        }
        Update: {
          career_goal_statement?: string | null
          created_at?: string
          current_stage?: string
          id?: string
          is_open_to_mentoring?: boolean | null
          max_mentees?: number | null
          mentoring_interests?: string[] | null
          mentorship_needs?: string[] | null
          primary_domain?: string | null
          privacy_level?: string | null
          scholar_passport_id?: string
          secondary_domains?: string[] | null
          seeking_mentorship?: boolean | null
          updated_at?: string
          years_in_academia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "career_profiles_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: true
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      career_risk_flags: {
        Row: {
          acknowledged_at: string | null
          career_profile_id: string
          description: string | null
          detected_at: string
          id: string
          is_visible_to_user: boolean | null
          resolution_notes: string | null
          resolved_at: string | null
          risk_type: string
          severity: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          career_profile_id: string
          description?: string | null
          detected_at?: string
          id?: string
          is_visible_to_user?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          risk_type: string
          severity?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          career_profile_id?: string
          description?: string | null
          detected_at?: string
          id?: string
          is_visible_to_user?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          risk_type?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_risk_flags_career_profile_id_fkey"
            columns: ["career_profile_id"]
            isOneToOne: false
            referencedRelation: "career_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      civilizational_principles: {
        Row: {
          change_requirements: Json
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          principle_name: string
          ratified_at: string | null
          ratified_by: Json | null
          scope: string
        }
        Insert: {
          change_requirements?: Json
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          principle_name: string
          ratified_at?: string | null
          ratified_by?: Json | null
          scope: string
        }
        Update: {
          change_requirements?: Json
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          principle_name?: string
          ratified_at?: string | null
          ratified_by?: Json | null
          scope?: string
        }
        Relationships: []
      }
      cohort_members: {
        Row: {
          cohort_id: string
          enrollment_status: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          cohort_id: string
          enrollment_status?: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          cohort_id?: string
          enrollment_status?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_members_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "student_cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_cooldowns: {
        Row: {
          collaboration_count: number
          created_at: string
          id: string
          last_collaboration_at: string
          next_full_credit_at: string | null
          trust_dampening_factor: number
          updated_at: string
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          collaboration_count?: number
          created_at?: string
          id?: string
          last_collaboration_at?: string
          next_full_credit_at?: string | null
          trust_dampening_factor?: number
          updated_at?: string
          user_a_id: string
          user_b_id: string
        }
        Update: {
          collaboration_count?: number
          created_at?: string
          id?: string
          last_collaboration_at?: string
          next_full_credit_at?: string | null
          trust_dampening_factor?: number
          updated_at?: string
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: []
      }
      collaboration_members: {
        Row: {
          collaboration_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          collaboration_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          collaboration_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_members_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborations: {
        Row: {
          collaboration_type: string | null
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          organization_id: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          collaboration_type?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          collaboration_type?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborative_workspaces: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_archived: boolean
          research_timeline_id: string | null
          settings: Json | null
          title: string
          updated_at: string
          workspace_type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_archived?: boolean
          research_timeline_id?: string | null
          settings?: Json | null
          title: string
          updated_at?: string
          workspace_type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          research_timeline_id?: string | null
          settings?: Json | null
          title?: string
          updated_at?: string
          workspace_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborative_workspaces_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborative_workspaces_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      collusion_flags: {
        Row: {
          confidence_score: number
          created_at: string
          evidence_data: Json | null
          flag_type: string
          id: string
          resolution: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          confidence_score: number
          created_at?: string
          evidence_data?: Json | null
          flag_type: string
          id?: string
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_a_id: string
          user_b_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          evidence_data?: Json | null
          flag_type?: string
          id?: string
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commercialization_requests: {
        Row: {
          business_plan_summary: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          expected_revenue_share: number | null
          id: string
          intended_use: string
          ip_record_id: string
          market_description: string | null
          proposed_terms: Json | null
          requester_org_id: string | null
          requester_user_id: string | null
          review_notes: string | null
          status: string
        }
        Insert: {
          business_plan_summary?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          expected_revenue_share?: number | null
          id?: string
          intended_use: string
          ip_record_id: string
          market_description?: string | null
          proposed_terms?: Json | null
          requester_org_id?: string | null
          requester_user_id?: string | null
          review_notes?: string | null
          status?: string
        }
        Update: {
          business_plan_summary?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          expected_revenue_share?: number | null
          id?: string
          intended_use?: string
          ip_record_id?: string
          market_description?: string | null
          proposed_terms?: Json | null
          requester_org_id?: string | null
          requester_user_id?: string | null
          review_notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercialization_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercialization_requests_ip_record_id_fkey"
            columns: ["ip_record_id"]
            isOneToOne: false
            referencedRelation: "ip_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercialization_requests_requester_org_id_fkey"
            columns: ["requester_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercialization_requests_requester_user_id_fkey"
            columns: ["requester_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_challenges: {
        Row: {
          appeal_available: boolean | null
          appealed: boolean | null
          assigned_council: string | null
          challenge_description: string
          challenge_title: string
          challenge_type: string
          challenger_id: string | null
          challenger_type: string
          created_at: string
          id: string
          resolution: string | null
          resolution_date: string | null
          status: string
          supporting_evidence: string | null
          target_entity_id: string | null
          target_entity_type: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          appeal_available?: boolean | null
          appealed?: boolean | null
          assigned_council?: string | null
          challenge_description: string
          challenge_title: string
          challenge_type: string
          challenger_id?: string | null
          challenger_type: string
          created_at?: string
          id?: string
          resolution?: string | null
          resolution_date?: string | null
          status?: string
          supporting_evidence?: string | null
          target_entity_id?: string | null
          target_entity_type: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          appeal_available?: boolean | null
          appealed?: boolean | null
          assigned_council?: string | null
          challenge_description?: string
          challenge_title?: string
          challenge_type?: string
          challenger_id?: string | null
          challenger_type?: string
          created_at?: string
          id?: string
          resolution?: string | null
          resolution_date?: string | null
          status?: string
          supporting_evidence?: string | null
          target_entity_id?: string | null
          target_entity_type?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_challenges_assigned_council_fkey"
            columns: ["assigned_council"]
            isOneToOne: false
            referencedRelation: "governance_councils"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_guarantees: {
        Row: {
          affected_users_estimate: number | null
          breaking_change_policy: string | null
          created_at: string
          description: string
          guarantee_type: string
          guaranteed_until: string
          id: string
          migration_support_commitment: string | null
          version: string
        }
        Insert: {
          affected_users_estimate?: number | null
          breaking_change_policy?: string | null
          created_at?: string
          description: string
          guarantee_type: string
          guaranteed_until: string
          id?: string
          migration_support_commitment?: string | null
          version: string
        }
        Update: {
          affected_users_estimate?: number | null
          breaking_change_policy?: string | null
          created_at?: string
          description?: string
          guarantee_type?: string
          guaranteed_until?: string
          id?: string
          migration_support_commitment?: string | null
          version?: string
        }
        Relationships: []
      }
      connection_degrees: {
        Row: {
          computed_at: string
          degree: number
          id: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          computed_at?: string
          degree: number
          id?: string
          target_user_id: string
          user_id: string
        }
        Update: {
          computed_at?: string
          degree?: number
          id?: string
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_degrees_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_degrees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_requests: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
        }
        Relationships: []
      }
      connectivity_profiles: {
        Row: {
          avg_bandwidth_kbps: number | null
          last_detected_at: string | null
          low_data_mode: boolean | null
          offline_mode_enabled: boolean | null
          preferred_media_quality: string | null
          user_id: string
        }
        Insert: {
          avg_bandwidth_kbps?: number | null
          last_detected_at?: string | null
          low_data_mode?: boolean | null
          offline_mode_enabled?: boolean | null
          preferred_media_quality?: string | null
          user_id: string
        }
        Update: {
          avg_bandwidth_kbps?: number | null
          last_detected_at?: string | null
          low_data_mode?: boolean | null
          offline_mode_enabled?: boolean | null
          preferred_media_quality?: string | null
          user_id?: string
        }
        Relationships: []
      }
      consequence_ledgers: {
        Row: {
          completion_rate: number | null
          computed_at: string | null
          created_at: string | null
          disputes_lost: number | null
          disputes_raised: number | null
          disputes_won: number | null
          escrow_success_rate: number | null
          id: string
          institutions_worked_with: string[] | null
          last_completed_project_at: string | null
          last_failure_at: string | null
          on_time_rate: number | null
          projects_abandoned: number | null
          projects_attempted: number | null
          projects_completed: number | null
          projects_failed: number | null
          total_escrow_disputed: number | null
          total_escrow_handled: number | null
          total_escrow_released: number | null
          trust_score_current: number | null
          trust_score_lowest: number | null
          trust_score_peak: number | null
          trust_trajectory: string | null
          user_id: string
          verified_associations: number | null
        }
        Insert: {
          completion_rate?: number | null
          computed_at?: string | null
          created_at?: string | null
          disputes_lost?: number | null
          disputes_raised?: number | null
          disputes_won?: number | null
          escrow_success_rate?: number | null
          id?: string
          institutions_worked_with?: string[] | null
          last_completed_project_at?: string | null
          last_failure_at?: string | null
          on_time_rate?: number | null
          projects_abandoned?: number | null
          projects_attempted?: number | null
          projects_completed?: number | null
          projects_failed?: number | null
          total_escrow_disputed?: number | null
          total_escrow_handled?: number | null
          total_escrow_released?: number | null
          trust_score_current?: number | null
          trust_score_lowest?: number | null
          trust_score_peak?: number | null
          trust_trajectory?: string | null
          user_id: string
          verified_associations?: number | null
        }
        Update: {
          completion_rate?: number | null
          computed_at?: string | null
          created_at?: string | null
          disputes_lost?: number | null
          disputes_raised?: number | null
          disputes_won?: number | null
          escrow_success_rate?: number | null
          id?: string
          institutions_worked_with?: string[] | null
          last_completed_project_at?: string | null
          last_failure_at?: string | null
          on_time_rate?: number | null
          projects_abandoned?: number | null
          projects_attempted?: number | null
          projects_completed?: number | null
          projects_failed?: number | null
          total_escrow_disputed?: number | null
          total_escrow_handled?: number | null
          total_escrow_released?: number | null
          trust_score_current?: number | null
          trust_score_lowest?: number | null
          trust_score_peak?: number | null
          trust_trajectory?: string | null
          user_id?: string
          verified_associations?: number | null
        }
        Relationships: []
      }
      contextual_permissions: {
        Row: {
          action_key: string
          allowed: boolean
          context_id: string
          context_type: string
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          action_key: string
          allowed?: boolean
          context_id: string
          context_type: string
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action_key?: string
          allowed?: boolean
          context_id?: string
          context_type?: string
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contextual_permissions_action_key_fkey"
            columns: ["action_key"]
            isOneToOne: false
            referencedRelation: "permission_definitions"
            referencedColumns: ["action_key"]
          },
        ]
      }
      continuity_checkpoints: {
        Row: {
          checkpoint_date: string
          checkpoint_type: string
          created_at: string
          id: string
          integrity_hash: string
          recovery_test_date: string | null
          recovery_tested: boolean | null
          recovery_time_objective: string | null
          storage_nodes: string[] | null
          systems_included: string[]
          verification_status: string
        }
        Insert: {
          checkpoint_date: string
          checkpoint_type: string
          created_at?: string
          id?: string
          integrity_hash: string
          recovery_test_date?: string | null
          recovery_tested?: boolean | null
          recovery_time_objective?: string | null
          storage_nodes?: string[] | null
          systems_included: string[]
          verification_status: string
        }
        Update: {
          checkpoint_date?: string
          checkpoint_type?: string
          created_at?: string
          id?: string
          integrity_hash?: string
          recovery_test_date?: string | null
          recovery_tested?: boolean | null
          recovery_time_objective?: string | null
          storage_nodes?: string[] | null
          systems_included?: string[]
          verification_status?: string
        }
        Relationships: []
      }
      continuity_triggers: {
        Row: {
          activated_at: string | null
          created_at: string
          id: string
          predefined_response: string
          resolved_at: string | null
          response_steps: Json | null
          responsible_steward_id: string | null
          status: string | null
          trigger_conditions: Json
          trigger_type: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          id?: string
          predefined_response: string
          resolved_at?: string | null
          response_steps?: Json | null
          responsible_steward_id?: string | null
          status?: string | null
          trigger_conditions: Json
          trigger_type: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          id?: string
          predefined_response?: string
          resolved_at?: string | null
          response_steps?: Json | null
          responsible_steward_id?: string | null
          status?: string | null
          trigger_conditions?: Json
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "continuity_triggers_responsible_steward_id_fkey"
            columns: ["responsible_steward_id"]
            isOneToOne: false
            referencedRelation: "stewardship_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_usage: {
        Row: {
          additional_metrics: Json | null
          ai_credits_used: number | null
          api_calls: number | null
          contract_id: string
          created_at: string
          id: string
          reports_generated: number | null
          storage_used_mb: number | null
          usage_period_end: string
          usage_period_start: string
          users_active: number | null
        }
        Insert: {
          additional_metrics?: Json | null
          ai_credits_used?: number | null
          api_calls?: number | null
          contract_id: string
          created_at?: string
          id?: string
          reports_generated?: number | null
          storage_used_mb?: number | null
          usage_period_end: string
          usage_period_start: string
          users_active?: number | null
        }
        Update: {
          additional_metrics?: Json | null
          ai_credits_used?: number | null
          api_calls?: number | null
          contract_id?: string
          created_at?: string
          id?: string
          reports_generated?: number | null
          storage_used_mb?: number | null
          usage_period_end?: string
          usage_period_start?: string
          users_active?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_usage_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "infrastructure_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contribution_disputes: {
        Row: {
          contribution_record_id: string
          created_at: string
          id: string
          raised_by: string
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          contribution_record_id: string
          created_at?: string
          id?: string
          raised_by: string
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          contribution_record_id?: string
          created_at?: string
          id?: string
          raised_by?: string
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contribution_disputes_contribution_record_id_fkey"
            columns: ["contribution_record_id"]
            isOneToOne: false
            referencedRelation: "contribution_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contribution_disputes_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contribution_disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contribution_graph_snapshots: {
        Row: {
          collaboration_depth_score: number
          contribution_diversity_score: number
          last_updated_at: string
          total_contributions: number
          user_id: string
          validated_contributions: number
        }
        Insert: {
          collaboration_depth_score?: number
          contribution_diversity_score?: number
          last_updated_at?: string
          total_contributions?: number
          user_id: string
          validated_contributions?: number
        }
        Update: {
          collaboration_depth_score?: number
          contribution_diversity_score?: number
          last_updated_at?: string
          total_contributions?: number
          user_id?: string
          validated_contributions?: number
        }
        Relationships: [
          {
            foreignKeyName: "contribution_graph_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contribution_records: {
        Row: {
          contribution_description: string | null
          contribution_type: string
          contributor_user_id: string
          created_at: string
          effort_weight: number | null
          id: string
          is_locked: boolean
          target_id: string
          target_type: string
        }
        Insert: {
          contribution_description?: string | null
          contribution_type: string
          contributor_user_id: string
          created_at?: string
          effort_weight?: number | null
          id?: string
          is_locked?: boolean
          target_id: string
          target_type: string
        }
        Update: {
          contribution_description?: string | null
          contribution_type?: string
          contributor_user_id?: string
          created_at?: string
          effort_weight?: number | null
          id?: string
          is_locked?: boolean
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contribution_records_contributor_user_id_fkey"
            columns: ["contributor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contribution_rewards: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean | null
          reason: string
          reward_type: string
          scholar_passport_id: string | null
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          reason: string
          reward_type: string
          scholar_passport_id?: string | null
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string
          reward_type?: string
          scholar_passport_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contribution_rewards_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contribution_rewards_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      contribution_validations: {
        Row: {
          comment: string | null
          contribution_record_id: string
          created_at: string
          id: string
          validation_type: string
          validator_user_id: string
        }
        Insert: {
          comment?: string | null
          contribution_record_id: string
          created_at?: string
          id?: string
          validation_type: string
          validator_user_id: string
        }
        Update: {
          comment?: string | null
          contribution_record_id?: string
          created_at?: string
          id?: string
          validation_type?: string
          validator_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contribution_validations_contribution_record_id_fkey"
            columns: ["contribution_record_id"]
            isOneToOne: false
            referencedRelation: "contribution_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contribution_validations_validator_user_id_fkey"
            columns: ["validator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      council_decisions: {
        Row: {
          affected_systems: string[] | null
          challenge_reason: string | null
          challenge_resolved_at: string | null
          challenged: boolean | null
          council_id: string
          created_at: string
          decision_outcome: string | null
          decision_type: string
          description: string
          id: string
          implementation_deadline: string | null
          implemented_at: string | null
          quorum_met: boolean | null
          rationale: string | null
          title: string
          votes_abstain: number | null
          votes_against: number | null
          votes_for: number | null
        }
        Insert: {
          affected_systems?: string[] | null
          challenge_reason?: string | null
          challenge_resolved_at?: string | null
          challenged?: boolean | null
          council_id: string
          created_at?: string
          decision_outcome?: string | null
          decision_type: string
          description: string
          id?: string
          implementation_deadline?: string | null
          implemented_at?: string | null
          quorum_met?: boolean | null
          rationale?: string | null
          title: string
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Update: {
          affected_systems?: string[] | null
          challenge_reason?: string | null
          challenge_resolved_at?: string | null
          challenged?: boolean | null
          council_id?: string
          created_at?: string
          decision_outcome?: string | null
          decision_type?: string
          description?: string
          id?: string
          implementation_deadline?: string | null
          implemented_at?: string | null
          quorum_met?: boolean | null
          rationale?: string | null
          title?: string
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "council_decisions_council_id_fkey"
            columns: ["council_id"]
            isOneToOne: false
            referencedRelation: "governance_councils"
            referencedColumns: ["id"]
          },
        ]
      }
      council_memberships: {
        Row: {
          appointed_by: string | null
          appointment_reason: string | null
          council_id: string
          created_at: string
          ends_at: string | null
          external_member_name: string | null
          external_member_org: string | null
          id: string
          is_active: boolean | null
          recusal_topics: string[] | null
          role_in_council: string
          started_at: string
          succession_priority: number | null
          user_id: string | null
          voting_power: number | null
        }
        Insert: {
          appointed_by?: string | null
          appointment_reason?: string | null
          council_id: string
          created_at?: string
          ends_at?: string | null
          external_member_name?: string | null
          external_member_org?: string | null
          id?: string
          is_active?: boolean | null
          recusal_topics?: string[] | null
          role_in_council: string
          started_at?: string
          succession_priority?: number | null
          user_id?: string | null
          voting_power?: number | null
        }
        Update: {
          appointed_by?: string | null
          appointment_reason?: string | null
          council_id?: string
          created_at?: string
          ends_at?: string | null
          external_member_name?: string | null
          external_member_org?: string | null
          id?: string
          is_active?: boolean | null
          recusal_topics?: string[] | null
          role_in_council?: string
          started_at?: string
          succession_priority?: number | null
          user_id?: string | null
          voting_power?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "council_memberships_appointed_by_fkey"
            columns: ["appointed_by"]
            isOneToOne: false
            referencedRelation: "council_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "council_memberships_council_id_fkey"
            columns: ["council_id"]
            isOneToOne: false
            referencedRelation: "governance_councils"
            referencedColumns: ["id"]
          },
        ]
      }
      council_votes: {
        Row: {
          decision_id: string
          id: string
          member_id: string
          reasoning: string | null
          vote: string
          vote_hash: string | null
          voted_at: string
        }
        Insert: {
          decision_id: string
          id?: string
          member_id: string
          reasoning?: string | null
          vote: string
          vote_hash?: string | null
          voted_at?: string
        }
        Update: {
          decision_id?: string
          id?: string
          member_id?: string
          reasoning?: string | null
          vote?: string
          vote_hash?: string | null
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "council_votes_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "council_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "council_votes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "council_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      country_policies: {
        Row: {
          compliance_notes: string | null
          country_code: string
          country_name: string
          created_at: string
          data_residency_required: boolean
          government_integration_enabled: boolean
          id: string
          identity_verification_required: boolean
          is_enabled: boolean
          min_age_requirement: number | null
          payment_enabled: boolean
          special_restrictions: Json | null
          tax_compliance_required: boolean
          tax_rate_percentage: number | null
          updated_at: string
        }
        Insert: {
          compliance_notes?: string | null
          country_code: string
          country_name: string
          created_at?: string
          data_residency_required?: boolean
          government_integration_enabled?: boolean
          id?: string
          identity_verification_required?: boolean
          is_enabled?: boolean
          min_age_requirement?: number | null
          payment_enabled?: boolean
          special_restrictions?: Json | null
          tax_compliance_required?: boolean
          tax_rate_percentage?: number | null
          updated_at?: string
        }
        Update: {
          compliance_notes?: string | null
          country_code?: string
          country_name?: string
          created_at?: string
          data_residency_required?: boolean
          government_integration_enabled?: boolean
          id?: string
          identity_verification_required?: boolean
          is_enabled?: boolean
          min_age_requirement?: number | null
          payment_enabled?: boolean
          special_restrictions?: Json | null
          tax_compliance_required?: boolean
          tax_rate_percentage?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      course_certificates: {
        Row: {
          certificate_number: string
          certificate_url: string | null
          course_id: string
          id: string
          is_revoked: boolean | null
          issued_at: string
          revoked_reason: string | null
          user_id: string
          verification_hash: string
        }
        Insert: {
          certificate_number: string
          certificate_url?: string | null
          course_id: string
          id?: string
          is_revoked?: boolean | null
          issued_at?: string
          revoked_reason?: string | null
          user_id: string
          verification_hash: string
        }
        Update: {
          certificate_number?: string
          certificate_url?: string | null
          course_id?: string
          id?: string
          is_revoked?: boolean | null
          issued_at?: string
          revoked_reason?: string | null
          user_id?: string
          verification_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress_percent: number
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress_percent?: number
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress_percent?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          content_text: string | null
          content_url: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          is_preview: boolean | null
          lesson_order: number
          lesson_type: string
          module_id: string
          title: string
        }
        Insert: {
          content_text?: string | null
          content_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          lesson_order?: number
          lesson_type: string
          module_id: string
          title: string
        }
        Update: {
          content_text?: string | null
          content_url?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          lesson_order?: number
          lesson_type?: string
          module_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          module_order: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          module_order?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          module_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          course_id: string
          created_at: string
          id: string
          is_verified_enrollment: boolean | null
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          is_verified_enrollment?: boolean | null
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_verified_enrollment?: boolean | null
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          avg_rating: number | null
          category: string
          created_at: string
          description: string | null
          estimated_hours: number | null
          id: string
          instructor_org_id: string | null
          instructor_user_id: string | null
          is_featured: boolean | null
          is_published: boolean | null
          language: string | null
          level: string
          price: number
          slug: string
          thumbnail_url: string | null
          title: string
          total_enrollments: number
          updated_at: string
        }
        Insert: {
          avg_rating?: number | null
          category: string
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          instructor_org_id?: string | null
          instructor_user_id?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          language?: string | null
          level?: string
          price?: number
          slug: string
          thumbnail_url?: string | null
          title: string
          total_enrollments?: number
          updated_at?: string
        }
        Update: {
          avg_rating?: number | null
          category?: string
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          instructor_org_id?: string | null
          instructor_user_id?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          language?: string | null
          level?: string
          price?: number
          slug?: string
          thumbnail_url?: string | null
          title?: string
          total_enrollments?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_org_id_fkey"
            columns: ["instructor_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credential_verifications: {
        Row: {
          created_at: string
          credential_id: string
          id: string
          ip_address: string | null
          user_agent: string | null
          verification_method: string
          verification_result: boolean | null
          verifier_email: string | null
          verifier_organization: string | null
        }
        Insert: {
          created_at?: string
          credential_id: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          verification_method: string
          verification_result?: boolean | null
          verifier_email?: string | null
          verifier_organization?: string | null
        }
        Update: {
          created_at?: string
          credential_id?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          verification_method?: string
          verification_result?: boolean | null
          verifier_email?: string | null
          verifier_organization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credential_verifications_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "digital_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_communications: {
        Row: {
          approved_by: string | null
          content: string
          created_at: string
          crisis_mode_id: string | null
          expires_at: string | null
          id: string
          message_type: string
          published_at: string | null
          target_audience: string | null
          title: string
        }
        Insert: {
          approved_by?: string | null
          content: string
          created_at?: string
          crisis_mode_id?: string | null
          expires_at?: string | null
          id?: string
          message_type: string
          published_at?: string | null
          target_audience?: string | null
          title: string
        }
        Update: {
          approved_by?: string | null
          content?: string
          created_at?: string
          crisis_mode_id?: string | null
          expires_at?: string | null
          id?: string
          message_type?: string
          published_at?: string | null
          target_audience?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crisis_communications_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crisis_communications_crisis_mode_id_fkey"
            columns: ["crisis_mode_id"]
            isOneToOne: false
            referencedRelation: "crisis_modes"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_modes: {
        Row: {
          activated_at: string
          activated_by: string | null
          created_at: string
          crisis_type: string
          deactivated_at: string | null
          deactivated_by: string | null
          id: string
          reason: string | null
          ruleset_applied: Json | null
          scope: string
          scope_id: string | null
        }
        Insert: {
          activated_at?: string
          activated_by?: string | null
          created_at?: string
          crisis_type: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          id?: string
          reason?: string | null
          ruleset_applied?: Json | null
          scope: string
          scope_id?: string | null
        }
        Update: {
          activated_at?: string
          activated_by?: string | null
          created_at?: string
          crisis_type?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          id?: string
          reason?: string | null
          ruleset_applied?: Json | null
          scope?: string
          scope_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crisis_modes_activated_by_fkey"
            columns: ["activated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crisis_modes_deactivated_by_fkey"
            columns: ["deactivated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          dashboard_type: string
          data_accessed: Json | null
          id: string
          ip_address: string | null
          scope_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          dashboard_type: string
          data_accessed?: Json | null
          id?: string
          ip_address?: string | null
          scope_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          dashboard_type?: string
          data_accessed?: Json | null
          id?: string
          ip_address?: string | null
          scope_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_access_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          request_type: string
          requested_at: string
          response_file_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          requested_at?: string
          response_file_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          requested_at?: string
          response_file_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      data_custody_nodes: {
        Row: {
          access_protocol: string
          continuity_priority: number | null
          created_at: string
          data_categories: string[]
          encryption_standard: string
          geographic_location: string
          id: string
          jurisdiction: string
          last_sync_at: string | null
          node_name: string
          node_type: string
          offline_capable: boolean | null
          operator_organization: string | null
          sovereignty_compliant: boolean | null
          sync_frequency: string | null
          updated_at: string
        }
        Insert: {
          access_protocol: string
          continuity_priority?: number | null
          created_at?: string
          data_categories: string[]
          encryption_standard: string
          geographic_location: string
          id?: string
          jurisdiction: string
          last_sync_at?: string | null
          node_name: string
          node_type: string
          offline_capable?: boolean | null
          operator_organization?: string | null
          sovereignty_compliant?: boolean | null
          sync_frequency?: string | null
          updated_at?: string
        }
        Update: {
          access_protocol?: string
          continuity_priority?: number | null
          created_at?: string
          data_categories?: string[]
          encryption_standard?: string
          geographic_location?: string
          id?: string
          jurisdiction?: string
          last_sync_at?: string | null
          node_name?: string
          node_type?: string
          offline_capable?: boolean | null
          operator_organization?: string | null
          sovereignty_compliant?: boolean | null
          sync_frequency?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      data_escrow: {
        Row: {
          created_at: string
          encryption_key_holder: string | null
          escrow_provider: string
          escrow_type: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          metadata: Json | null
          retention_years: number
          sync_frequency_hours: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          encryption_key_holder?: string | null
          escrow_provider: string
          escrow_type: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          metadata?: Json | null
          retention_years?: number
          sync_frequency_hours?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          encryption_key_holder?: string | null
          escrow_provider?: string
          escrow_type?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          metadata?: Json | null
          retention_years?: number
          sync_frequency_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      data_exchange_logs: {
        Row: {
          consent_reference: string | null
          data_type: string
          exchange_direction: string
          exchanged_at: string
          id: string
          record_count: number | null
          source_node_id: string | null
          status: string
          target_node_id: string | null
        }
        Insert: {
          consent_reference?: string | null
          data_type: string
          exchange_direction: string
          exchanged_at?: string
          id?: string
          record_count?: number | null
          source_node_id?: string | null
          status?: string
          target_node_id?: string | null
        }
        Update: {
          consent_reference?: string | null
          data_type?: string
          exchange_direction?: string
          exchanged_at?: string
          id?: string
          record_count?: number | null
          source_node_id?: string | null
          status?: string
          target_node_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_exchange_logs_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "federated_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_exchange_logs_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "federated_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      data_format_versions: {
        Row: {
          backward_compatible_with: string[] | null
          created_at: string
          format_name: string
          id: string
          migration_scripts: Json | null
          replacement_version: string | null
          schema_definition: Json
          sunset_date: string | null
          version: string
        }
        Insert: {
          backward_compatible_with?: string[] | null
          created_at?: string
          format_name: string
          id?: string
          migration_scripts?: Json | null
          replacement_version?: string | null
          schema_definition: Json
          sunset_date?: string | null
          version: string
        }
        Update: {
          backward_compatible_with?: string[] | null
          created_at?: string
          format_name?: string
          id?: string
          migration_scripts?: Json | null
          replacement_version?: string | null
          schema_definition?: Json
          sunset_date?: string | null
          version?: string
        }
        Relationships: []
      }
      data_residency_proofs: {
        Row: {
          created_at: string | null
          data_location_verified: string
          deployment_instance_id: string
          evidence_metadata: Json | null
          evidence_urls: string[] | null
          id: string
          is_current: boolean | null
          proof_certificate_chain: string | null
          proof_hash: string
          proof_signature: string | null
          proof_timestamp: string
          proof_type: string
          valid_from: string
          valid_until: string | null
          verification_method: string
          verifier_entity: string | null
        }
        Insert: {
          created_at?: string | null
          data_location_verified: string
          deployment_instance_id: string
          evidence_metadata?: Json | null
          evidence_urls?: string[] | null
          id?: string
          is_current?: boolean | null
          proof_certificate_chain?: string | null
          proof_hash: string
          proof_signature?: string | null
          proof_timestamp?: string
          proof_type: string
          valid_from?: string
          valid_until?: string | null
          verification_method: string
          verifier_entity?: string | null
        }
        Update: {
          created_at?: string | null
          data_location_verified?: string
          deployment_instance_id?: string
          evidence_metadata?: Json | null
          evidence_urls?: string[] | null
          id?: string
          is_current?: boolean | null
          proof_certificate_chain?: string | null
          proof_hash?: string
          proof_signature?: string | null
          proof_timestamp?: string
          proof_type?: string
          valid_from?: string
          valid_until?: string | null
          verification_method?: string
          verifier_entity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_residency_proofs_deployment_instance_id_fkey"
            columns: ["deployment_instance_id"]
            isOneToOne: false
            referencedRelation: "deployment_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      dataset_access_requests: {
        Row: {
          access_expires_at: string | null
          created_at: string
          data_management_plan: string | null
          dataset_id: string
          ethics_approval_ref: string | null
          id: string
          institution: string | null
          intended_use: string | null
          purpose: string
          requester_user_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          access_expires_at?: string | null
          created_at?: string
          data_management_plan?: string | null
          dataset_id: string
          ethics_approval_ref?: string | null
          id?: string
          institution?: string | null
          intended_use?: string | null
          purpose: string
          requester_user_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          access_expires_at?: string | null
          created_at?: string
          data_management_plan?: string | null
          dataset_id?: string
          ethics_approval_ref?: string | null
          id?: string
          institution?: string | null
          intended_use?: string | null
          purpose?: string
          requester_user_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataset_access_requests_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "research_datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataset_access_requests_requester_user_id_fkey"
            columns: ["requester_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataset_access_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dataset_usage_logs: {
        Row: {
          created_at: string
          dataset_id: string
          id: string
          metadata: Json | null
          usage_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dataset_id: string
          id?: string
          metadata?: Json | null
          usage_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dataset_id?: string
          id?: string
          metadata?: Json | null
          usage_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dataset_usage_logs_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "research_datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataset_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dataset_versions: {
        Row: {
          change_log: string
          checksum: string | null
          created_at: string
          created_by: string
          dataset_id: string
          file_manifest: Json | null
          id: string
          schema_definition: Json | null
          total_records: number | null
          version_number: number
        }
        Insert: {
          change_log: string
          checksum?: string | null
          created_at?: string
          created_by: string
          dataset_id: string
          file_manifest?: Json | null
          id?: string
          schema_definition?: Json | null
          total_records?: number | null
          version_number?: number
        }
        Update: {
          change_log?: string
          checksum?: string | null
          created_at?: string
          created_by?: string
          dataset_id?: string
          file_manifest?: Json | null
          id?: string
          schema_definition?: Json | null
          total_records?: number | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "dataset_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dataset_versions_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "research_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_health_metrics: {
        Row: {
          calculated_at: string
          communication_score: number | null
          confidence: number | null
          days_since_activity: number | null
          deal_id: string
          health_score: number
          id: string
          last_activity_at: string | null
          metadata: Json | null
          milestone_velocity: number | null
          predicted_outcome: string | null
          risk_factors: Json | null
          sentiment_trend: string | null
        }
        Insert: {
          calculated_at?: string
          communication_score?: number | null
          confidence?: number | null
          days_since_activity?: number | null
          deal_id: string
          health_score: number
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          milestone_velocity?: number | null
          predicted_outcome?: string | null
          risk_factors?: Json | null
          sentiment_trend?: string | null
        }
        Update: {
          calculated_at?: string
          communication_score?: number | null
          confidence?: number | null
          days_since_activity?: number | null
          deal_id?: string
          health_score?: number
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          milestone_velocity?: number | null
          predicted_outcome?: string | null
          risk_factors?: Json | null
          sentiment_trend?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_health_metrics_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_rooms: {
        Row: {
          agreed_amount: number | null
          buyer_id: string
          completed_at: string | null
          created_at: string
          escrow_amount: number | null
          escrow_status: string | null
          id: string
          metadata: Json | null
          milestones: Json | null
          offer_id: string | null
          seller_id: string
          status: string
          terms: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          agreed_amount?: number | null
          buyer_id: string
          completed_at?: string | null
          created_at?: string
          escrow_amount?: number | null
          escrow_status?: string | null
          id?: string
          metadata?: Json | null
          milestones?: Json | null
          offer_id?: string | null
          seller_id: string
          status?: string
          terms?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          agreed_amount?: number | null
          buyer_id?: string
          completed_at?: string | null
          created_at?: string
          escrow_amount?: number | null
          escrow_status?: string | null
          id?: string
          metadata?: Json | null
          milestones?: Json | null
          offer_id?: string | null
          seller_id?: string
          status?: string
          terms?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_rooms_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_rooms_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_rooms_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_classes: {
        Row: {
          ai_allowed_role: string
          created_at: string
          description: string | null
          domain: string
          examples: Json | null
          human_override_required: boolean
          id: string
          impact_level: string
        }
        Insert: {
          ai_allowed_role: string
          created_at?: string
          description?: string | null
          domain: string
          examples?: Json | null
          human_override_required?: boolean
          id?: string
          impact_level: string
        }
        Update: {
          ai_allowed_role?: string
          created_at?: string
          description?: string | null
          domain?: string
          examples?: Json | null
          human_override_required?: boolean
          id?: string
          impact_level?: string
        }
        Relationships: []
      }
      deployment_admins: {
        Row: {
          admin_role: string
          can_access_data: boolean | null
          can_approve_updates: boolean | null
          can_manage_admins: boolean | null
          can_modify_config: boolean | null
          deployment_instance_id: string
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          admin_role?: string
          can_access_data?: boolean | null
          can_approve_updates?: boolean | null
          can_manage_admins?: boolean | null
          can_modify_config?: boolean | null
          deployment_instance_id: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          admin_role?: string
          can_access_data?: boolean | null
          can_approve_updates?: boolean | null
          can_manage_admins?: boolean | null
          can_modify_config?: boolean | null
          deployment_instance_id?: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_admins_deployment_instance_id_fkey"
            columns: ["deployment_instance_id"]
            isOneToOne: false
            referencedRelation: "deployment_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_admins_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_compliance_status: {
        Row: {
          certificate_expires_at: string | null
          certificate_url: string | null
          certifying_authority: string | null
          compliance_framework: string
          created_at: string | null
          critical_findings: number | null
          deployment_instance_id: string
          finding_count: number | null
          id: string
          is_certified: boolean | null
          last_assessment_at: string | null
          next_assessment_due: string | null
          remediation_plan_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          certificate_expires_at?: string | null
          certificate_url?: string | null
          certifying_authority?: string | null
          compliance_framework: string
          created_at?: string | null
          critical_findings?: number | null
          deployment_instance_id: string
          finding_count?: number | null
          id?: string
          is_certified?: boolean | null
          last_assessment_at?: string | null
          next_assessment_due?: string | null
          remediation_plan_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          certificate_expires_at?: string | null
          certificate_url?: string | null
          certifying_authority?: string | null
          compliance_framework?: string
          created_at?: string | null
          critical_findings?: number | null
          deployment_instance_id?: string
          finding_count?: number | null
          id?: string
          is_certified?: boolean | null
          last_assessment_at?: string | null
          next_assessment_due?: string | null
          remediation_plan_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_compliance_status_deployment_instance_id_fkey"
            columns: ["deployment_instance_id"]
            isOneToOne: false
            referencedRelation: "deployment_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_configurations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          config_key: string
          config_type: string
          config_value: Json
          created_at: string | null
          default_value: Json | null
          deployment_instance_id: string
          id: string
          overrides_default: boolean | null
          requires_approval: boolean | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          config_key: string
          config_type: string
          config_value: Json
          created_at?: string | null
          default_value?: Json | null
          deployment_instance_id: string
          id?: string
          overrides_default?: boolean | null
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          config_key?: string
          config_type?: string
          config_value?: Json
          created_at?: string | null
          default_value?: Json | null
          deployment_instance_id?: string
          id?: string
          overrides_default?: boolean | null
          requires_approval?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_configurations_deployment_instance_id_fkey"
            columns: ["deployment_instance_id"]
            isOneToOne: false
            referencedRelation: "deployment_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_instances: {
        Row: {
          allowed_outbound_domains: string[] | null
          auth_tenant_id: string | null
          created_at: string | null
          created_by: string | null
          data_residency_certificate_url: string | null
          data_residency_certified: boolean | null
          data_residency_country: string | null
          database_cluster_id: string | null
          governance_authority_contact: string | null
          governance_authority_name: string | null
          governance_mode: Database["public"]["Enums"]["governance_mode"]
          health_status: string | null
          id: string
          instance_code: string
          instance_name: string
          instance_type: Database["public"]["Enums"]["deployment_type"]
          isolation_level: Database["public"]["Enums"]["isolation_level"]
          last_health_check: string | null
          local_payment_config: Json | null
          local_services_config: Json | null
          network_mode: string | null
          owner_contact_email: string | null
          owner_entity_id: string | null
          owner_entity_type: string
          payment_provider: string | null
          provisioned_at: string | null
          region: string
          status: string | null
          storage_bucket_prefix: string | null
          stripe_account_id: string | null
          updated_at: string | null
        }
        Insert: {
          allowed_outbound_domains?: string[] | null
          auth_tenant_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_residency_certificate_url?: string | null
          data_residency_certified?: boolean | null
          data_residency_country?: string | null
          database_cluster_id?: string | null
          governance_authority_contact?: string | null
          governance_authority_name?: string | null
          governance_mode?: Database["public"]["Enums"]["governance_mode"]
          health_status?: string | null
          id?: string
          instance_code: string
          instance_name: string
          instance_type?: Database["public"]["Enums"]["deployment_type"]
          isolation_level?: Database["public"]["Enums"]["isolation_level"]
          last_health_check?: string | null
          local_payment_config?: Json | null
          local_services_config?: Json | null
          network_mode?: string | null
          owner_contact_email?: string | null
          owner_entity_id?: string | null
          owner_entity_type?: string
          payment_provider?: string | null
          provisioned_at?: string | null
          region?: string
          status?: string | null
          storage_bucket_prefix?: string | null
          stripe_account_id?: string | null
          updated_at?: string | null
        }
        Update: {
          allowed_outbound_domains?: string[] | null
          auth_tenant_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_residency_certificate_url?: string | null
          data_residency_certified?: boolean | null
          data_residency_country?: string | null
          database_cluster_id?: string | null
          governance_authority_contact?: string | null
          governance_authority_name?: string | null
          governance_mode?: Database["public"]["Enums"]["governance_mode"]
          health_status?: string | null
          id?: string
          instance_code?: string
          instance_name?: string
          instance_type?: Database["public"]["Enums"]["deployment_type"]
          isolation_level?: Database["public"]["Enums"]["isolation_level"]
          last_health_check?: string | null
          local_payment_config?: Json | null
          local_services_config?: Json | null
          network_mode?: string | null
          owner_contact_email?: string | null
          owner_entity_id?: string | null
          owner_entity_type?: string
          payment_provider?: string | null
          provisioned_at?: string | null
          region?: string
          status?: string | null
          storage_bucket_prefix?: string | null
          stripe_account_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_instances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_isolation_audit: {
        Row: {
          access_path: string | null
          access_type: string
          accessor_user_id: string | null
          block_reason: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          source_instance_id: string | null
          target_instance_id: string | null
          user_agent: string | null
          was_blocked: boolean
        }
        Insert: {
          access_path?: string | null
          access_type: string
          accessor_user_id?: string | null
          block_reason?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          source_instance_id?: string | null
          target_instance_id?: string | null
          user_agent?: string | null
          was_blocked?: boolean
        }
        Update: {
          access_path?: string | null
          access_type?: string
          accessor_user_id?: string | null
          block_reason?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          source_instance_id?: string | null
          target_instance_id?: string | null
          user_agent?: string | null
          was_blocked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "deployment_isolation_audit_source_instance_id_fkey"
            columns: ["source_instance_id"]
            isOneToOne: false
            referencedRelation: "deployment_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_isolation_audit_target_instance_id_fkey"
            columns: ["target_instance_id"]
            isOneToOne: false
            referencedRelation: "deployment_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_schema_versions: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          compatibility_notes: string | null
          deployment_instance_id: string
          id: string
          is_compatible_with_platform: boolean | null
          migration_hash: string
          rollback_available: boolean | null
          rollback_script_url: string | null
          schema_version: string
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          compatibility_notes?: string | null
          deployment_instance_id: string
          id?: string
          is_compatible_with_platform?: boolean | null
          migration_hash: string
          rollback_available?: boolean | null
          rollback_script_url?: string | null
          schema_version: string
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          compatibility_notes?: string | null
          deployment_instance_id?: string
          id?: string
          is_compatible_with_platform?: boolean | null
          migration_hash?: string
          rollback_available?: boolean | null
          rollback_script_url?: string | null
          schema_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_schema_versions_deployment_instance_id_fkey"
            columns: ["deployment_instance_id"]
            isOneToOne: false
            referencedRelation: "deployment_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_update_schedule: {
        Row: {
          approval_authority_user_id: string | null
          auto_update_enabled: boolean | null
          created_at: string | null
          deployment_instance_id: string
          id: string
          last_update_at: string | null
          last_update_status: string | null
          last_update_version: string | null
          pending_update_notes: string | null
          pending_update_schema_changes: Json | null
          pending_update_version: string | null
          requires_manual_approval: boolean | null
          update_window_day: string | null
          update_window_end_hour: number | null
          update_window_start_hour: number | null
          update_window_timezone: string | null
          updated_at: string | null
        }
        Insert: {
          approval_authority_user_id?: string | null
          auto_update_enabled?: boolean | null
          created_at?: string | null
          deployment_instance_id: string
          id?: string
          last_update_at?: string | null
          last_update_status?: string | null
          last_update_version?: string | null
          pending_update_notes?: string | null
          pending_update_schema_changes?: Json | null
          pending_update_version?: string | null
          requires_manual_approval?: boolean | null
          update_window_day?: string | null
          update_window_end_hour?: number | null
          update_window_start_hour?: number | null
          update_window_timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_authority_user_id?: string | null
          auto_update_enabled?: boolean | null
          created_at?: string | null
          deployment_instance_id?: string
          id?: string
          last_update_at?: string | null
          last_update_status?: string | null
          last_update_version?: string | null
          pending_update_notes?: string | null
          pending_update_schema_changes?: Json | null
          pending_update_version?: string | null
          requires_manual_approval?: boolean | null
          update_window_day?: string | null
          update_window_end_hour?: number | null
          update_window_start_hour?: number | null
          update_window_timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_update_schedule_deployment_instance_id_fkey"
            columns: ["deployment_instance_id"]
            isOneToOne: false
            referencedRelation: "deployment_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_credentials: {
        Row: {
          created_at: string
          credential_data: Json | null
          credential_type: string
          description: string | null
          expiry_date: string | null
          id: string
          is_revoked: boolean
          issue_date: string
          issuer_id: string | null
          issuer_name: string
          issuer_type: string
          related_record_id: string | null
          revoked_at: string | null
          revoked_reason: string | null
          title: string
          updated_at: string
          user_id: string
          verification_code: string
          verification_url: string | null
        }
        Insert: {
          created_at?: string
          credential_data?: Json | null
          credential_type: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_revoked?: boolean
          issue_date: string
          issuer_id?: string | null
          issuer_name: string
          issuer_type: string
          related_record_id?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          title: string
          updated_at?: string
          user_id: string
          verification_code: string
          verification_url?: string | null
        }
        Update: {
          created_at?: string
          credential_data?: Json | null
          credential_type?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_revoked?: boolean
          issue_date?: string
          issuer_id?: string | null
          issuer_name?: string
          issuer_type?: string
          related_record_id?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          verification_code?: string
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_credentials_related_record_id_fkey"
            columns: ["related_record_id"]
            isOneToOne: false
            referencedRelation: "academic_records"
            referencedColumns: ["id"]
          },
        ]
      }
      discipline_affiliations: {
        Row: {
          created_at: string
          depth_level: string
          discipline_id: string
          id: string
          scholar_passport_id: string
          verified: boolean | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          depth_level: string
          discipline_id: string
          id?: string
          scholar_passport_id: string
          verified?: boolean | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          depth_level?: string
          discipline_id?: string
          id?: string
          scholar_passport_id?: string
          verified?: boolean | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discipline_affiliations_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "academic_disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discipline_affiliations_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_signals: {
        Row: {
          computed_at: string
          context: Json | null
          entity_id: string
          entity_type: string
          id: string
          signal_type: string
          signal_value: number | null
        }
        Insert: {
          computed_at?: string
          context?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          signal_type: string
          signal_value?: number | null
        }
        Update: {
          computed_at?: string
          context?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          signal_type?: string
          signal_value?: number | null
        }
        Relationships: []
      }
      dispute_actions: {
        Row: {
          action_type: string
          content: string
          created_at: string
          created_by: string
          dispute_id: string
          id: string
          visibility: string
        }
        Insert: {
          action_type: string
          content: string
          created_at?: string
          created_by: string
          dispute_id: string
          id?: string
          visibility?: string
        }
        Update: {
          action_type?: string
          content?: string
          created_at?: string
          created_by?: string
          dispute_id?: string
          id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_actions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_actions_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "academic_disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_evidence: {
        Row: {
          content: string
          created_at: string
          dispute_id: string
          evidence_type: string
          file_url: string | null
          id: string
          submitted_by: string
          title: string | null
        }
        Insert: {
          content: string
          created_at?: string
          dispute_id: string
          evidence_type: string
          file_url?: string | null
          id?: string
          submitted_by: string
          title?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          dispute_id?: string
          evidence_type?: string
          file_url?: string | null
          id?: string
          submitted_by?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_evidence_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "academic_disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_evidence_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_participants: {
        Row: {
          created_at: string
          dispute_id: string
          id: string
          notified_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dispute_id: string
          id?: string
          notified_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          dispute_id?: string
          id?: string
          notified_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_participants_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "academic_disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          arbitration_deadline: string | null
          auto_mediation_result: string | null
          created_at: string
          escalation_level: number | null
          evidence_files: Json | null
          id: string
          initiated_by: string
          milestone_id: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          arbitration_deadline?: string | null
          auto_mediation_result?: string | null
          created_at?: string
          escalation_level?: number | null
          evidence_files?: Json | null
          id?: string
          initiated_by: string
          milestone_id: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          arbitration_deadline?: string | null
          auto_mediation_result?: string | null
          created_at?: string
          escalation_level?: number | null
          evidence_files?: Json | null
          id?: string
          initiated_by?: string
          milestone_id?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      due_diligence_contributions: {
        Row: {
          check_type: string
          confidence_score: number | null
          created_at: string
          evidence_urls: string[] | null
          findings: string
          id: string
          investigator_id: string
          request_id: string
          reward_earned: number | null
          risk_level: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          check_type: string
          confidence_score?: number | null
          created_at?: string
          evidence_urls?: string[] | null
          findings: string
          id?: string
          investigator_id: string
          request_id: string
          reward_earned?: number | null
          risk_level?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          check_type?: string
          confidence_score?: number | null
          created_at?: string
          evidence_urls?: string[] | null
          findings?: string
          id?: string
          investigator_id?: string
          request_id?: string
          reward_earned?: number | null
          risk_level?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "due_diligence_contributions_investigator_id_fkey"
            columns: ["investigator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "due_diligence_contributions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "due_diligence_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "due_diligence_contributions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      due_diligence_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          deadline: string | null
          final_report: Json | null
          id: string
          max_investigators: number | null
          metadata: Json | null
          requester_id: string
          required_checks: Json
          reward_amount: number | null
          scope: string
          status: Database["public"]["Enums"]["due_diligence_status"]
          target_id: string
          target_type: string
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          final_report?: Json | null
          id?: string
          max_investigators?: number | null
          metadata?: Json | null
          requester_id: string
          required_checks?: Json
          reward_amount?: number | null
          scope: string
          status?: Database["public"]["Enums"]["due_diligence_status"]
          target_id: string
          target_type: string
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          final_report?: Json | null
          id?: string
          max_investigators?: number | null
          metadata?: Json | null
          requester_id?: string
          required_checks?: Json
          reward_amount?: number | null
          scope?: string
          status?: Database["public"]["Enums"]["due_diligence_status"]
          target_id?: string
          target_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "due_diligence_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      earning_bids: {
        Row: {
          amount: number
          bidder_id: string
          created_at: string
          delivery_days: number
          id: string
          message: string | null
          project_id: string
        }
        Insert: {
          amount: number
          bidder_id: string
          created_at?: string
          delivery_days: number
          id?: string
          message?: string | null
          project_id: string
        }
        Update: {
          amount?: number
          bidder_id?: string
          created_at?: string
          delivery_days?: number
          id?: string
          message?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earning_bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "earning_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      earning_projects: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string
          deadline_days: number | null
          description: string | null
          id: string
          location: string | null
          owner_id: string
          status: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          deadline_days?: number | null
          description?: string | null
          id?: string
          location?: string | null
          owner_id: string
          status?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          deadline_days?: number | null
          description?: string | null
          id?: string
          location?: string | null
          owner_id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      emergency_activations: {
        Row: {
          actions_taken: Json | null
          activated_at: string
          activated_by: string
          activation_reason: string
          deactivated_at: string | null
          deactivated_by: string | null
          deactivation_reason: string | null
          evidence: Json | null
          id: string
          protocol_id: string
          review_notes: string | null
          review_outcome: string | null
          reviewed_by_council: string | null
        }
        Insert: {
          actions_taken?: Json | null
          activated_at?: string
          activated_by: string
          activation_reason: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          deactivation_reason?: string | null
          evidence?: Json | null
          id?: string
          protocol_id: string
          review_notes?: string | null
          review_outcome?: string | null
          reviewed_by_council?: string | null
        }
        Update: {
          actions_taken?: Json | null
          activated_at?: string
          activated_by?: string
          activation_reason?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          deactivation_reason?: string | null
          evidence?: Json | null
          id?: string
          protocol_id?: string
          review_notes?: string | null
          review_outcome?: string | null
          reviewed_by_council?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_activations_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "emergency_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_activations_reviewed_by_council_fkey"
            columns: ["reviewed_by_council"]
            isOneToOne: false
            referencedRelation: "governance_councils"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_protocols: {
        Row: {
          automatic_review_after_hours: number | null
          created_at: string
          deactivation_conditions: Json | null
          id: string
          is_active: boolean | null
          powers_granted: Json
          protocol_name: string
          requires_council: string[] | null
          severity_level: number
          time_limit_hours: number | null
          trigger_conditions: Json
        }
        Insert: {
          automatic_review_after_hours?: number | null
          created_at?: string
          deactivation_conditions?: Json | null
          id?: string
          is_active?: boolean | null
          powers_granted: Json
          protocol_name: string
          requires_council?: string[] | null
          severity_level: number
          time_limit_hours?: number | null
          trigger_conditions: Json
        }
        Update: {
          automatic_review_after_hours?: number | null
          created_at?: string
          deactivation_conditions?: Json | null
          id?: string
          is_active?: boolean | null
          powers_granted?: Json
          protocol_name?: string
          requires_council?: string[] | null
          severity_level?: number
          time_limit_hours?: number | null
          trigger_conditions?: Json
        }
        Relationships: []
      }
      endowment_funds: {
        Row: {
          created_at: string
          currency: string | null
          current_amount: number | null
          custodian: string
          donor_visibility: string | null
          fund_name: string
          id: string
          investment_policy: string | null
          purpose: string
          restricted_uses: string[] | null
          spending_rule: string | null
          target_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          current_amount?: number | null
          custodian: string
          donor_visibility?: string | null
          fund_name: string
          id?: string
          investment_policy?: string | null
          purpose: string
          restricted_uses?: string[] | null
          spending_rule?: string | null
          target_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          current_amount?: number | null
          custodian?: string
          donor_visibility?: string | null
          fund_name?: string
          id?: string
          investment_policy?: string | null
          purpose?: string
          restricted_uses?: string[] | null
          spending_rule?: string | null
          target_amount?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      equity_adjustment_rules: {
        Row: {
          adjustment_bounds: Json | null
          adjustment_logic: Json
          approved_by: string | null
          created_at: string
          id: string
          is_active: boolean | null
          rule_name: string
          rule_type: string
          target_group: string
        }
        Insert: {
          adjustment_bounds?: Json | null
          adjustment_logic: Json
          approved_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          rule_name: string
          rule_type: string
          target_group: string
        }
        Update: {
          adjustment_bounds?: Json | null
          adjustment_logic?: Json
          approved_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          rule_name?: string
          rule_type?: string
          target_group?: string
        }
        Relationships: []
      }
      equity_metrics_snapshots: {
        Row: {
          computed_at: string
          funding_access_stats: Json | null
          id: string
          inclusion_indicators: Json | null
          participation_distribution: Json | null
          review_visibility_stats: Json | null
          scope_id: string | null
          scope_type: string
        }
        Insert: {
          computed_at?: string
          funding_access_stats?: Json | null
          id?: string
          inclusion_indicators?: Json | null
          participation_distribution?: Json | null
          review_visibility_stats?: Json | null
          scope_id?: string | null
          scope_type: string
        }
        Update: {
          computed_at?: string
          funding_access_stats?: Json | null
          id?: string
          inclusion_indicators?: Json | null
          participation_distribution?: Json | null
          review_visibility_stats?: Json | null
          scope_id?: string | null
          scope_type?: string
        }
        Relationships: []
      }
      ethics_board_members: {
        Row: {
          appointed_at: string
          board_role: string | null
          expertise_areas: string[] | null
          id: string
          institution_id: string | null
          is_active: boolean | null
          term_expires_at: string | null
          user_id: string
        }
        Insert: {
          appointed_at?: string
          board_role?: string | null
          expertise_areas?: string[] | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          term_expires_at?: string | null
          user_id: string
        }
        Update: {
          appointed_at?: string
          board_role?: string | null
          expertise_areas?: string[] | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          term_expires_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ethics_board_members_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_board_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ethics_protocol_templates: {
        Row: {
          created_at: string
          created_by: string | null
          ethics_scope: string
          id: string
          institution_id: string | null
          is_public: boolean | null
          template_content: Json
          template_name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ethics_scope: string
          id?: string
          institution_id?: string | null
          is_public?: boolean | null
          template_content: Json
          template_name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ethics_scope?: string
          id?: string
          institution_id?: string | null
          is_public?: boolean | null
          template_content?: Json
          template_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ethics_protocol_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_protocol_templates_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ethics_reviews: {
        Row: {
          created_at: string
          findings: string
          id: string
          management_response: string | null
          public_summary: string | null
          recommendations: string[] | null
          remediated_at: string | null
          remediation_deadline: string | null
          review_scope: string
          review_type: string
          reviewer_name: string | null
          reviewer_organization: string | null
          reviewer_type: string
          severity: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          findings: string
          id?: string
          management_response?: string | null
          public_summary?: string | null
          recommendations?: string[] | null
          remediated_at?: string | null
          remediation_deadline?: string | null
          review_scope: string
          review_type: string
          reviewer_name?: string | null
          reviewer_organization?: string | null
          reviewer_type: string
          severity?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          findings?: string
          id?: string
          management_response?: string | null
          public_summary?: string | null
          recommendations?: string[] | null
          remediated_at?: string | null
          remediation_deadline?: string | null
          review_scope?: string
          review_type?: string
          reviewer_name?: string | null
          reviewer_organization?: string | null
          reviewer_type?: string
          severity?: string | null
          subject?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          event_id: string
          id: string
          registered_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          reminder_offset_minutes: number | null
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          reminder_offset_minutes?: number | null
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          reminder_offset_minutes?: number | null
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reports: {
        Row: {
          created_at: string | null
          details: string | null
          event_id: string
          id: string
          reason: string
          reporter_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          event_id: string
          id?: string
          reason: string
          reporter_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          event_id?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_speakers: {
        Row: {
          bio: string | null
          created_at: string | null
          event_id: string
          id: string
          speaker_name: string
          speaker_order: number | null
          title_or_affiliation: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          speaker_name: string
          speaker_order?: number | null
          title_or_affiliation?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          speaker_name?: string
          speaker_order?: number | null
          title_or_affiliation?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_speakers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendee_count: number | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          end_datetime: string | null
          event_type: string
          group_id: string | null
          id: string
          is_featured: boolean | null
          location_text: string | null
          max_attendees: number | null
          meeting_link: string | null
          mode: string | null
          organizer_org_id: string | null
          organizer_user_id: string | null
          registration_url: string | null
          start_datetime: string
          timezone: string | null
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          attendee_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_datetime?: string | null
          event_type: string
          group_id?: string | null
          id?: string
          is_featured?: boolean | null
          location_text?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          mode?: string | null
          organizer_org_id?: string | null
          organizer_user_id?: string | null
          registration_url?: string | null
          start_datetime: string
          timezone?: string | null
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          attendee_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_datetime?: string | null
          event_type?: string
          group_id?: string | null
          id?: string
          is_featured?: boolean | null
          location_text?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          mode?: string | null
          organizer_org_id?: string | null
          organizer_user_id?: string | null
          registration_url?: string | null
          start_datetime?: string
          timezone?: string | null
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_org_id_fkey"
            columns: ["organizer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_user_id_fkey"
            columns: ["organizer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      export_packages: {
        Row: {
          created_at: string
          download_url: string | null
          expires_at: string | null
          export_scope: string
          format: string
          id: string
          requested_by: string
          status: string
        }
        Insert: {
          created_at?: string
          download_url?: string | null
          expires_at?: string | null
          export_scope: string
          format: string
          id?: string
          requested_by: string
          status?: string
        }
        Update: {
          created_at?: string
          download_url?: string | null
          expires_at?: string | null
          export_scope?: string
          format?: string
          id?: string
          requested_by?: string
          status?: string
        }
        Relationships: []
      }
      failure_records: {
        Row: {
          created_at: string
          description: string
          failure_type: string
          id: string
          lessons_learned: string | null
          recovery_actions: Json | null
          related_outcome_id: string | null
          root_cause: string | null
          trust_impact: number | null
          updated_at: string
          user_id: string | null
          visibility: string
        }
        Insert: {
          created_at?: string
          description: string
          failure_type: string
          id?: string
          lessons_learned?: string | null
          recovery_actions?: Json | null
          related_outcome_id?: string | null
          root_cause?: string | null
          trust_impact?: number | null
          updated_at?: string
          user_id?: string | null
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string
          failure_type?: string
          id?: string
          lessons_learned?: string | null
          recovery_actions?: Json | null
          related_outcome_id?: string | null
          root_cause?: string | null
          trust_impact?: number | null
          updated_at?: string
          user_id?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "failure_records_related_outcome_id_fkey"
            columns: ["related_outcome_id"]
            isOneToOne: false
            referencedRelation: "outcomes"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_access_gates: {
        Row: {
          created_at: string
          description: string | null
          feature_name: string
          id: string
          is_active: boolean
          max_disputes_allowed: number | null
          minimum_account_age_days: number
          minimum_projects_completed: number
          minimum_trust_score: number
          requires_escrow_history: boolean
          requires_verification: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          feature_name: string
          id?: string
          is_active?: boolean
          max_disputes_allowed?: number | null
          minimum_account_age_days?: number
          minimum_projects_completed?: number
          minimum_trust_score?: number
          requires_escrow_history?: boolean
          requires_verification?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          feature_name?: string
          id?: string
          is_active?: boolean
          max_disputes_allowed?: number | null
          minimum_account_age_days?: number
          minimum_projects_completed?: number
          minimum_trust_score?: number
          requires_escrow_history?: boolean
          requires_verification?: boolean
        }
        Relationships: []
      }
      feature_entitlements: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          feature_key: string
          id: string
          is_active: boolean | null
          min_tier_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          feature_key: string
          id?: string
          is_active?: boolean | null
          min_tier_name?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          feature_key?: string
          id?: string
          is_active?: boolean | null
          min_tier_name?: string
        }
        Relationships: []
      }
      feature_flag_audits: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          feature_key: string
          id: string
          new_state: Json | null
          previous_state: Json | null
          reason: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          feature_key: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          reason?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          feature_key?: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          reason?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          conditions: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean
          feature_key: string
          id: string
          is_kill_switch: boolean | null
          priority: number | null
          scope: string
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          feature_key: string
          id?: string
          is_kill_switch?: boolean | null
          priority?: number | null
          scope?: string
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          feature_key?: string
          id?: string
          is_kill_switch?: boolean | null
          priority?: number | null
          scope?: string
          updated_at?: string
        }
        Relationships: []
      }
      featured_listings: {
        Row: {
          amount_paid: number
          boost_level: number
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          listing_id: string
          listing_type: string
          starts_at: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          boost_level?: number
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          listing_id: string
          listing_type: string
          starts_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          boost_level?: number
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          listing_id?: string
          listing_type?: string
          starts_at?: string
          user_id?: string
        }
        Relationships: []
      }
      federated_collaboration_requests: {
        Row: {
          artifact_reference: string | null
          collaboration_type: string
          expires_at: string | null
          id: string
          local_governance_approved: boolean | null
          purpose: string
          requested_at: string | null
          requesting_instance_id: string
          requesting_user_hash: string | null
          response_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scope: Json | null
          status: string | null
          target_instance_id: string
        }
        Insert: {
          artifact_reference?: string | null
          collaboration_type: string
          expires_at?: string | null
          id?: string
          local_governance_approved?: boolean | null
          purpose: string
          requested_at?: string | null
          requesting_instance_id: string
          requesting_user_hash?: string | null
          response_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scope?: Json | null
          status?: string | null
          target_instance_id: string
        }
        Update: {
          artifact_reference?: string | null
          collaboration_type?: string
          expires_at?: string | null
          id?: string
          local_governance_approved?: boolean | null
          purpose?: string
          requested_at?: string | null
          requesting_instance_id?: string
          requesting_user_hash?: string | null
          response_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scope?: Json | null
          status?: string | null
          target_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "federated_collaboration_requests_requesting_instance_id_fkey"
            columns: ["requesting_instance_id"]
            isOneToOne: false
            referencedRelation: "federated_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "federated_collaboration_requests_target_instance_id_fkey"
            columns: ["target_instance_id"]
            isOneToOne: false
            referencedRelation: "federated_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      federated_discovery_cache: {
        Row: {
          cached_at: string | null
          expires_at: string | null
          id: string
          metadata: Json
          resource_hash: string
          resource_type: string
          source_instance_id: string
          visibility: string | null
        }
        Insert: {
          cached_at?: string | null
          expires_at?: string | null
          id?: string
          metadata: Json
          resource_hash: string
          resource_type: string
          source_instance_id: string
          visibility?: string | null
        }
        Update: {
          cached_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json
          resource_hash?: string
          resource_type?: string
          source_instance_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "federated_discovery_cache_source_instance_id_fkey"
            columns: ["source_instance_id"]
            isOneToOne: false
            referencedRelation: "federated_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      federated_identities: {
        Row: {
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          linked_at: string | null
          local_user_id: string
          permissions: string[] | null
          remote_instance_id: string
          remote_user_hash: string
          trust_score_snapshot: number | null
          verification_level: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          linked_at?: string | null
          local_user_id: string
          permissions?: string[] | null
          remote_instance_id: string
          remote_user_hash: string
          trust_score_snapshot?: number | null
          verification_level?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          linked_at?: string | null
          local_user_id?: string
          permissions?: string[] | null
          remote_instance_id?: string
          remote_user_hash?: string
          trust_score_snapshot?: number | null
          verification_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "federated_identities_local_user_id_fkey"
            columns: ["local_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "federated_identities_remote_instance_id_fkey"
            columns: ["remote_instance_id"]
            isOneToOne: false
            referencedRelation: "federated_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      federated_instances: {
        Row: {
          agreement_signed_at: string | null
          api_version: string | null
          created_at: string | null
          data_residency: string | null
          federation_agreement_signed: boolean | null
          governance_authority: string | null
          health_status: string | null
          id: string
          instance_code: string
          instance_name: string
          instance_type: string
          last_heartbeat_at: string | null
          metadata: Json | null
          public_endpoint: string
          public_key: string | null
          supported_features: string[] | null
          trust_level: string | null
          updated_at: string | null
        }
        Insert: {
          agreement_signed_at?: string | null
          api_version?: string | null
          created_at?: string | null
          data_residency?: string | null
          federation_agreement_signed?: boolean | null
          governance_authority?: string | null
          health_status?: string | null
          id?: string
          instance_code: string
          instance_name: string
          instance_type: string
          last_heartbeat_at?: string | null
          metadata?: Json | null
          public_endpoint: string
          public_key?: string | null
          supported_features?: string[] | null
          trust_level?: string | null
          updated_at?: string | null
        }
        Update: {
          agreement_signed_at?: string | null
          api_version?: string | null
          created_at?: string | null
          data_residency?: string | null
          federation_agreement_signed?: boolean | null
          governance_authority?: string | null
          health_status?: string | null
          id?: string
          instance_code?: string
          instance_name?: string
          instance_type?: string
          last_heartbeat_at?: string | null
          metadata?: Json | null
          public_endpoint?: string
          public_key?: string | null
          supported_features?: string[] | null
          trust_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      federated_nodes: {
        Row: {
          base_url: string
          capabilities: string[] | null
          federation_protocol: string
          id: string
          last_sync_at: string | null
          node_name: string
          node_type: string
          public_key: string | null
          registered_at: string
          status: string
          trust_level: string
        }
        Insert: {
          base_url: string
          capabilities?: string[] | null
          federation_protocol?: string
          id?: string
          last_sync_at?: string | null
          node_name: string
          node_type: string
          public_key?: string | null
          registered_at?: string
          status?: string
          trust_level?: string
        }
        Update: {
          base_url?: string
          capabilities?: string[] | null
          federation_protocol?: string
          id?: string
          last_sync_at?: string | null
          node_name?: string
          node_type?: string
          public_key?: string | null
          registered_at?: string
          status?: string
          trust_level?: string
        }
        Relationships: []
      }
      federated_verification_attestations: {
        Row: {
          attestation_type: string
          attested_at: string | null
          attester_hash: string | null
          id: string
          invalidated_at: string | null
          invalidation_reason: string | null
          is_valid: boolean | null
          local_artifact_id: string | null
          proof_hash: string | null
          proof_reference: string | null
          remote_artifact_hash: string
          remote_instance_id: string
          verdict: string
        }
        Insert: {
          attestation_type: string
          attested_at?: string | null
          attester_hash?: string | null
          id?: string
          invalidated_at?: string | null
          invalidation_reason?: string | null
          is_valid?: boolean | null
          local_artifact_id?: string | null
          proof_hash?: string | null
          proof_reference?: string | null
          remote_artifact_hash: string
          remote_instance_id: string
          verdict: string
        }
        Update: {
          attestation_type?: string
          attested_at?: string | null
          attester_hash?: string | null
          id?: string
          invalidated_at?: string | null
          invalidation_reason?: string | null
          is_valid?: boolean | null
          local_artifact_id?: string | null
          proof_hash?: string | null
          proof_reference?: string | null
          remote_artifact_hash?: string
          remote_instance_id?: string
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "federated_verification_attestations_remote_instance_id_fkey"
            columns: ["remote_instance_id"]
            isOneToOne: false
            referencedRelation: "federated_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_events: {
        Row: {
          actor_id: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          event_type: Database["public"]["Enums"]["feed_event_type"]
          id: string
          is_hidden: boolean
          metadata: Json | null
          title: string | null
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          actor_id: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type: string
          event_type: Database["public"]["Enums"]["feed_event_type"]
          id?: string
          is_hidden?: boolean
          metadata?: Json | null
          title?: string | null
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          actor_id?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          event_type?: Database["public"]["Enums"]["feed_event_type"]
          id?: string
          is_hidden?: boolean
          metadata?: Json | null
          title?: string | null
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "feed_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      field_translation_records: {
        Row: {
          created_at: string
          created_by: string
          id: string
          key_concepts_mapped: Json | null
          methodology_adaptations: string | null
          related_research_timeline_id: string | null
          source_discipline_id: string
          target_discipline_id: string
          translation_summary: string
          visibility: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          key_concepts_mapped?: Json | null
          methodology_adaptations?: string | null
          related_research_timeline_id?: string | null
          source_discipline_id: string
          target_discipline_id: string
          translation_summary: string
          visibility?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          key_concepts_mapped?: Json | null
          methodology_adaptations?: string | null
          related_research_timeline_id?: string | null
          source_discipline_id?: string
          target_discipline_id?: string
          translation_summary?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_translation_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_translation_records_related_research_timeline_id_fkey"
            columns: ["related_research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_translation_records_source_discipline_id_fkey"
            columns: ["source_discipline_id"]
            isOneToOne: false
            referencedRelation: "academic_disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_translation_records_target_discipline_id_fkey"
            columns: ["target_discipline_id"]
            isOneToOne: false
            referencedRelation: "academic_disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transparency_reports: {
        Row: {
          approved_by: string | null
          created_at: string
          id: string
          operating_costs: Json | null
          published_at: string | null
          reporting_period_end: string
          reporting_period_start: string
          revenue_breakdown: Json
          subsidy_allocation: Json | null
          surplus_use: Json | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          id?: string
          operating_costs?: Json | null
          published_at?: string | null
          reporting_period_end: string
          reporting_period_start: string
          revenue_breakdown?: Json
          subsidy_allocation?: Json | null
          surplus_use?: Json | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          id?: string
          operating_costs?: Json | null
          published_at?: string | null
          reporting_period_end?: string
          reporting_period_start?: string
          revenue_breakdown?: Json
          subsidy_allocation?: Json | null
          surplus_use?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transparency_reports_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flagged_behaviors: {
        Row: {
          action_taken: string | null
          ai_confidence: number | null
          auto_flagged: boolean
          behavior_type: string
          created_at: string
          description: string | null
          id: string
          reviewed: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          ai_confidence?: number | null
          auto_flagged?: boolean
          behavior_type: string
          created_at?: string
          description?: string | null
          id?: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          user_id: string
        }
        Update: {
          action_taken?: string | null
          ai_confidence?: number | null
          auto_flagged?: boolean
          behavior_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      foresight_scenarios: {
        Row: {
          assumptions: Json
          created_at: string
          created_by: string
          id: string
          opportunity_factors: string[] | null
          probability_assessment: string | null
          projected_outcomes: Json
          risk_factors: string[] | null
          scenario_name: string
          scenario_scope: string
          scope_id: string | null
          status: string
          time_horizon_months: number | null
          updated_at: string
        }
        Insert: {
          assumptions: Json
          created_at?: string
          created_by: string
          id?: string
          opportunity_factors?: string[] | null
          probability_assessment?: string | null
          projected_outcomes: Json
          risk_factors?: string[] | null
          scenario_name: string
          scenario_scope: string
          scope_id?: string | null
          status?: string
          time_horizon_months?: number | null
          updated_at?: string
        }
        Update: {
          assumptions?: Json
          created_at?: string
          created_by?: string
          id?: string
          opportunity_factors?: string[] | null
          probability_assessment?: string | null
          projected_outcomes?: Json
          risk_factors?: string[] | null
          scenario_name?: string
          scenario_scope?: string
          scope_id?: string | null
          status?: string
          time_horizon_months?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      fork_exit_protocols: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          asset_distribution_rules: Json | null
          conditions: string
          created_at: string
          data_preservation_rules: Json | null
          id: string
          is_active: boolean | null
          protocol_name: string
          protocol_type: string
          user_rights_during_exit: Json | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          asset_distribution_rules?: Json | null
          conditions: string
          created_at?: string
          data_preservation_rules?: Json | null
          id?: string
          is_active?: boolean | null
          protocol_name: string
          protocol_type: string
          user_rights_during_exit?: Json | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          asset_distribution_rules?: Json | null
          conditions?: string
          created_at?: string
          data_preservation_rules?: Json | null
          id?: string
          is_active?: boolean | null
          protocol_name?: string
          protocol_type?: string
          user_rights_during_exit?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fork_exit_protocols_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "stewardship_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      format_migration_records: {
        Row: {
          archival_object_id: string
          from_format: string
          id: string
          migrated_at: string
          migrated_by: string | null
          migration_notes: string | null
          migration_reason: string
          to_format: string
        }
        Insert: {
          archival_object_id: string
          from_format: string
          id?: string
          migrated_at?: string
          migrated_by?: string | null
          migration_notes?: string | null
          migration_reason: string
          to_format: string
        }
        Update: {
          archival_object_id?: string
          from_format?: string
          id?: string
          migrated_at?: string
          migrated_by?: string | null
          migration_notes?: string | null
          migration_reason?: string
          to_format?: string
        }
        Relationships: [
          {
            foreignKeyName: "format_migration_records_archival_object_id_fkey"
            columns: ["archival_object_id"]
            isOneToOne: false
            referencedRelation: "archival_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_detection_logs: {
        Row: {
          action_taken: string | null
          created_at: string
          details: Json | null
          detection_type: string
          id: string
          reviewed: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          details?: Json | null
          detection_type: string
          id?: string
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          details?: Json | null
          detection_type?: string
          id?: string
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_detection_logs_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_allocations: {
        Row: {
          allocation_status: string
          approval_notes: string | null
          approved_amount: number
          approved_at: string
          approved_by: string | null
          created_at: string
          escrow_wallet_id: string | null
          funding_application_id: string
          id: string
          released_amount: number
        }
        Insert: {
          allocation_status?: string
          approval_notes?: string | null
          approved_amount: number
          approved_at?: string
          approved_by?: string | null
          created_at?: string
          escrow_wallet_id?: string | null
          funding_application_id: string
          id?: string
          released_amount?: number
        }
        Update: {
          allocation_status?: string
          approval_notes?: string | null
          approved_amount?: number
          approved_at?: string
          approved_by?: string | null
          created_at?: string
          escrow_wallet_id?: string | null
          funding_application_id?: string
          id?: string
          released_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "funding_allocations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_allocations_escrow_wallet_id_fkey"
            columns: ["escrow_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_allocations_funding_application_id_fkey"
            columns: ["funding_application_id"]
            isOneToOne: true
            referencedRelation: "funding_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_applications: {
        Row: {
          applicant_user_id: string
          budget_breakdown: Json | null
          created_at: string
          detailed_proposal: string | null
          duration_months: number | null
          funding_program_id: string
          id: string
          proposal_summary: string
          proposal_title: string
          requested_amount: number
          research_timeline_id: string | null
          status: string
          submitted_at: string | null
          team_members: Json | null
          updated_at: string
        }
        Insert: {
          applicant_user_id: string
          budget_breakdown?: Json | null
          created_at?: string
          detailed_proposal?: string | null
          duration_months?: number | null
          funding_program_id: string
          id?: string
          proposal_summary: string
          proposal_title: string
          requested_amount: number
          research_timeline_id?: string | null
          status?: string
          submitted_at?: string | null
          team_members?: Json | null
          updated_at?: string
        }
        Update: {
          applicant_user_id?: string
          budget_breakdown?: Json | null
          created_at?: string
          detailed_proposal?: string | null
          duration_months?: number | null
          funding_program_id?: string
          id?: string
          proposal_summary?: string
          proposal_title?: string
          requested_amount?: number
          research_timeline_id?: string | null
          status?: string
          submitted_at?: string | null
          team_members?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_applications_applicant_user_id_fkey"
            columns: ["applicant_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_applications_funding_program_id_fkey"
            columns: ["funding_program_id"]
            isOneToOne: false
            referencedRelation: "funding_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_applications_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_milestones: {
        Row: {
          created_at: string
          deliverables: Json | null
          due_date: string | null
          funding_allocation_id: string
          id: string
          milestone_number: number
          milestone_title: string
          release_amount: number
          required_outcome: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_notes: string | null
          submitted_at: string | null
        }
        Insert: {
          created_at?: string
          deliverables?: Json | null
          due_date?: string | null
          funding_allocation_id: string
          id?: string
          milestone_number: number
          milestone_title: string
          release_amount: number
          required_outcome: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_notes?: string | null
          submitted_at?: string | null
        }
        Update: {
          created_at?: string
          deliverables?: Json | null
          due_date?: string | null
          funding_allocation_id?: string
          id?: string
          milestone_number?: number
          milestone_title?: string
          release_amount?: number
          required_outcome?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_notes?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funding_milestones_funding_allocation_id_fkey"
            columns: ["funding_allocation_id"]
            isOneToOne: false
            referencedRelation: "funding_allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_milestones_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_models: {
        Row: {
          activated_at: string | null
          cost_structure: Json | null
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          model_name: string
          model_type: string
          revenue_sources: Json
          sustainability_metrics: Json | null
          transition_requirements: string | null
        }
        Insert: {
          activated_at?: string | null
          cost_structure?: Json | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          model_name: string
          model_type: string
          revenue_sources: Json
          sustainability_metrics?: Json | null
          transition_requirements?: string | null
        }
        Update: {
          activated_at?: string | null
          cost_structure?: Json | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          model_name?: string
          model_type?: string
          revenue_sources?: Json
          sustainability_metrics?: Json | null
          transition_requirements?: string | null
        }
        Relationships: []
      }
      funding_programs: {
        Row: {
          application_deadline: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          eligibility_criteria: Json | null
          focus_areas: string[] | null
          id: string
          max_amount: number | null
          min_amount: number | null
          program_name: string
          review_process: string
          sponsor_name: string | null
          sponsor_org_id: string | null
          sponsor_type: string
          status: string
          total_budget: number | null
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          eligibility_criteria?: Json | null
          focus_areas?: string[] | null
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          program_name: string
          review_process?: string
          sponsor_name?: string | null
          sponsor_org_id?: string | null
          sponsor_type: string
          status?: string
          total_budget?: number | null
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          eligibility_criteria?: Json | null
          focus_areas?: string[] | null
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          program_name?: string
          review_process?: string
          sponsor_name?: string | null
          sponsor_org_id?: string | null
          sponsor_type?: string
          status?: string
          total_budget?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_programs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_programs_sponsor_org_id_fkey"
            columns: ["sponsor_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_reviews: {
        Row: {
          created_at: string
          feasibility_score: number | null
          feedback: string | null
          funding_application_id: string
          id: string
          impact_score: number | null
          innovation_score: number | null
          is_conflicted: boolean
          recommendation: string | null
          reviewer_user_id: string
          score: number | null
        }
        Insert: {
          created_at?: string
          feasibility_score?: number | null
          feedback?: string | null
          funding_application_id: string
          id?: string
          impact_score?: number | null
          innovation_score?: number | null
          is_conflicted?: boolean
          recommendation?: string | null
          reviewer_user_id: string
          score?: number | null
        }
        Update: {
          created_at?: string
          feasibility_score?: number | null
          feedback?: string | null
          funding_application_id?: string
          id?: string
          impact_score?: number | null
          innovation_score?: number | null
          is_conflicted?: boolean
          recommendation?: string | null
          reviewer_user_id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "funding_reviews_funding_application_id_fkey"
            columns: ["funding_application_id"]
            isOneToOne: false
            referencedRelation: "funding_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_reviews_reviewer_user_id_fkey"
            columns: ["reviewer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fyp_requests: {
        Row: {
          assigned_to: string | null
          budget: number | null
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          requester_id: string
          service_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget?: number | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          requester_id: string
          service_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget?: number | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          requester_id?: string
          service_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fyp_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fyp_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fyp_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "fyp_services"
            referencedColumns: ["id"]
          },
        ]
      }
      fyp_services: {
        Row: {
          created_at: string | null
          currency: string | null
          delivery_days: number | null
          description: string | null
          id: string
          is_active: boolean | null
          price_max: number | null
          price_min: number | null
          provider_id: string
          rating: number | null
          service_type: string | null
          title: string
          total_orders: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          delivery_days?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          price_max?: number | null
          price_min?: number | null
          provider_id: string
          rating?: number | null
          service_type?: string | null
          title: string
          total_orders?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          delivery_days?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          price_max?: number | null
          price_min?: number | null
          provider_id?: string
          rating?: number | null
          service_type?: string | null
          title?: string
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fyp_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gaming_detection_events: {
        Row: {
          detected_at: string
          detection_type: string
          evidence_summary: string | null
          id: string
          related_users: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          status: string
          user_id: string
        }
        Insert: {
          detected_at?: string
          detection_type: string
          evidence_summary?: string | null
          id?: string
          related_users?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity: string
          status?: string
          user_id: string
        }
        Update: {
          detected_at?: string
          detection_type?: string
          evidence_summary?: string | null
          id?: string
          related_users?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaming_detection_events_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gaming_detection_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          emergency_contact_info: Json | null
          expires_at: string | null
          governance_role_id: string
          id: string
          is_active: boolean
          succession_priority: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          emergency_contact_info?: Json | null
          expires_at?: string | null
          governance_role_id: string
          id?: string
          is_active?: boolean
          succession_priority?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          emergency_contact_info?: Json | null
          expires_at?: string | null
          governance_role_id?: string
          id?: string
          is_active?: boolean
          succession_priority?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_assignments_governance_role_id_fkey"
            columns: ["governance_role_id"]
            isOneToOne: false
            referencedRelation: "governance_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_councils: {
        Row: {
          authority_scope: Json | null
          can_be_dissolved: boolean | null
          council_type: string
          created_at: string
          description: string | null
          dissolution_requires: string | null
          id: string
          max_members: number | null
          min_members: number | null
          name: string
          quorum_requirement: number | null
          reporting_to_id: string | null
          term_length_months: number | null
          updated_at: string
        }
        Insert: {
          authority_scope?: Json | null
          can_be_dissolved?: boolean | null
          council_type: string
          created_at?: string
          description?: string | null
          dissolution_requires?: string | null
          id?: string
          max_members?: number | null
          min_members?: number | null
          name: string
          quorum_requirement?: number | null
          reporting_to_id?: string | null
          term_length_months?: number | null
          updated_at?: string
        }
        Update: {
          authority_scope?: Json | null
          can_be_dissolved?: boolean | null
          council_type?: string
          created_at?: string
          description?: string | null
          dissolution_requires?: string | null
          id?: string
          max_members?: number | null
          min_members?: number | null
          name?: string
          quorum_requirement?: number | null
          reporting_to_id?: string | null
          term_length_months?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_councils_reporting_to_id_fkey"
            columns: ["reporting_to_id"]
            isOneToOne: false
            referencedRelation: "governance_councils"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_proposals: {
        Row: {
          affected_scope: string | null
          created_at: string
          decided_at: string | null
          id: string
          proposal_text: string
          proposal_type: string
          proposed_by: string
          rationale: string | null
          required_majority: number | null
          sponsoring_council_id: string | null
          status: string
          title: string
          voting_closes_at: string | null
          voting_opens_at: string | null
        }
        Insert: {
          affected_scope?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          proposal_text: string
          proposal_type: string
          proposed_by: string
          rationale?: string | null
          required_majority?: number | null
          sponsoring_council_id?: string | null
          status?: string
          title: string
          voting_closes_at?: string | null
          voting_opens_at?: string | null
        }
        Update: {
          affected_scope?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          proposal_text?: string
          proposal_type?: string
          proposed_by?: string
          rationale?: string | null
          required_majority?: number | null
          sponsoring_council_id?: string | null
          status?: string
          title?: string
          voting_closes_at?: string | null
          voting_opens_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_proposals_sponsoring_council_id_fkey"
            columns: ["sponsoring_council_id"]
            isOneToOne: false
            referencedRelation: "governance_councils"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          max_holders: number | null
          permissions: Json
          requires_mfa: boolean
          role_level: number
          role_name: string
          succession_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          max_holders?: number | null
          permissions?: Json
          requires_mfa?: boolean
          role_level: number
          role_name: string
          succession_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          max_holders?: number | null
          permissions?: Json
          requires_mfa?: boolean
          role_level?: number
          role_name?: string
          succession_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      governance_votes: {
        Row: {
          cast_at: string
          governance_proposal_id: string
          id: string
          reasoning: string | null
          vote: string
          vote_weight: number | null
          voter_scholar_passport_id: string
        }
        Insert: {
          cast_at?: string
          governance_proposal_id: string
          id?: string
          reasoning?: string | null
          vote: string
          vote_weight?: number | null
          voter_scholar_passport_id: string
        }
        Update: {
          cast_at?: string
          governance_proposal_id?: string
          id?: string
          reasoning?: string | null
          vote?: string
          vote_weight?: number | null
          voter_scholar_passport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_votes_governance_proposal_id_fkey"
            columns: ["governance_proposal_id"]
            isOneToOne: false
            referencedRelation: "governance_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_votes_voter_scholar_passport_id_fkey"
            columns: ["voter_scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      government_bodies: {
        Row: {
          access_restrictions: Json | null
          agreement_signed_at: string | null
          api_access_level: string
          body_type: string
          contact_email: string | null
          contact_name: string | null
          country: string
          created_at: string
          data_sharing_agreement_id: string | null
          id: string
          integration_status: string
          mou_document_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          access_restrictions?: Json | null
          agreement_signed_at?: string | null
          api_access_level?: string
          body_type: string
          contact_email?: string | null
          contact_name?: string | null
          country: string
          created_at?: string
          data_sharing_agreement_id?: string | null
          id?: string
          integration_status?: string
          mou_document_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          access_restrictions?: Json | null
          agreement_signed_at?: string | null
          api_access_level?: string
          body_type?: string
          contact_email?: string | null
          contact_name?: string | null
          country?: string
          created_at?: string
          data_sharing_agreement_id?: string | null
          id?: string
          integration_status?: string
          mou_document_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      government_report_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_status: string
          file_size_bytes: number | null
          file_url: string | null
          id: string
          parameters_snapshot: Json | null
          report_id: string
          requested_by: string | null
          started_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_status?: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          parameters_snapshot?: Json | null
          report_id: string
          requested_by?: string | null
          started_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_status?: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          parameters_snapshot?: Json | null
          report_id?: string
          requested_by?: string | null
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_report_executions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "government_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      government_reports: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          format: string
          government_body_id: string
          id: string
          is_active: boolean
          last_generated_at: string | null
          next_scheduled_at: string | null
          parameters: Json | null
          report_name: string
          report_type: string
          schedule: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          format?: string
          government_body_id: string
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          next_scheduled_at?: string | null
          parameters?: Json | null
          report_name: string
          report_type: string
          schedule?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          format?: string
          government_body_id?: string
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          next_scheduled_at?: string | null
          parameters?: Json | null
          report_name?: string
          report_type?: string
          schedule?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "government_reports_government_body_id_fkey"
            columns: ["government_body_id"]
            isOneToOne: false
            referencedRelation: "government_bodies"
            referencedColumns: ["id"]
          },
        ]
      }
      government_users: {
        Row: {
          created_at: string
          email: string
          government_body_id: string
          id: string
          is_active: boolean
          last_access_at: string | null
          name: string
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          government_body_id: string
          id?: string
          is_active?: boolean
          last_access_at?: string | null
          name: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          government_body_id?: string
          id?: string
          is_active?: boolean
          last_access_at?: string | null
          name?: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_users_government_body_id_fkey"
            columns: ["government_body_id"]
            isOneToOne: false
            referencedRelation: "government_bodies"
            referencedColumns: ["id"]
          },
        ]
      }
      grant_bookmarks: {
        Row: {
          created_at: string | null
          grant_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          grant_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          grant_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grant_bookmarks_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grant_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grants: {
        Row: {
          amount_max: number | null
          amount_min: number | null
          application_url: string | null
          created_at: string | null
          currency: string | null
          deadline: string | null
          description: string | null
          eligibility: string | null
          fields: string[] | null
          funder: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          posted_by: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount_max?: number | null
          amount_min?: number | null
          application_url?: string | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          fields?: string[] | null
          funder: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          posted_by?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount_max?: number | null
          amount_min?: number | null
          application_url?: string | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          fields?: string[] | null
          funder?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          posted_by?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grants_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invitations: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          invitee_id: string
          inviter_id: string
          message: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          invitee_id: string
          inviter_id: string
          message?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          message?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_post_comments: {
        Row: {
          content: string
          created_at: string | null
          group_post_id: string
          id: string
          likes_count: number | null
          parent_comment_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          group_post_id: string
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          group_post_id?: string
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_post_comments_group_post_id_fkey"
            columns: ["group_post_id"]
            isOneToOne: false
            referencedRelation: "group_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "group_post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string
          created_at: string | null
          group_id: string
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          post_type: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string | null
          group_id: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          post_type?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string | null
          group_id?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          post_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          group_type: string
          id: string
          is_active: boolean | null
          member_count: number | null
          name: string
          organization_id: string | null
          rules: string | null
          slug: string | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          group_type: string
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name: string
          organization_id?: string | null
          rules?: string | null
          slug?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          group_type?: string
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          name?: string
          organization_id?: string | null
          rules?: string | null
          slug?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_evolution: {
        Row: {
          contributors: string[] | null
          created_at: string
          description: string
          evidence_links: string[] | null
          evolution_type: string | null
          field: string
          id: string
          idea_identifier: string
          impact_assessment: string | null
          originated_from: string | null
          related_projects: string[] | null
          title: string
        }
        Insert: {
          contributors?: string[] | null
          created_at?: string
          description: string
          evidence_links?: string[] | null
          evolution_type?: string | null
          field: string
          id?: string
          idea_identifier: string
          impact_assessment?: string | null
          originated_from?: string | null
          related_projects?: string[] | null
          title: string
        }
        Update: {
          contributors?: string[] | null
          created_at?: string
          description?: string
          evidence_links?: string[] | null
          evolution_type?: string | null
          field?: string
          id?: string
          idea_identifier?: string
          impact_assessment?: string | null
          originated_from?: string | null
          related_projects?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_evolution_originated_from_fkey"
            columns: ["originated_from"]
            isOneToOne: false
            referencedRelation: "idea_evolution"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_adoptions: {
        Row: {
          adopting_entity_id: string | null
          adopting_entity_name: string
          adopting_entity_type: string
          adoption_date: string
          adoption_description: string
          adoption_evidence_url: string | null
          created_at: string
          id: string
          impact_pathway_id: string
          verification_status: string
          verified_by: string | null
        }
        Insert: {
          adopting_entity_id?: string | null
          adopting_entity_name: string
          adopting_entity_type: string
          adoption_date: string
          adoption_description: string
          adoption_evidence_url?: string | null
          created_at?: string
          id?: string
          impact_pathway_id: string
          verification_status?: string
          verified_by?: string | null
        }
        Update: {
          adopting_entity_id?: string | null
          adopting_entity_name?: string
          adopting_entity_type?: string
          adoption_date?: string
          adoption_description?: string
          adoption_evidence_url?: string | null
          created_at?: string
          id?: string
          impact_pathway_id?: string
          verification_status?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_adoptions_impact_pathway_id_fkey"
            columns: ["impact_pathway_id"]
            isOneToOne: false
            referencedRelation: "impact_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_disclaimers: {
        Row: {
          created_at: string
          disclaimer_text: string
          id: string
          impact_pathway_id: string
          required_by: string | null
          visibility: string
        }
        Insert: {
          created_at?: string
          disclaimer_text: string
          id?: string
          impact_pathway_id: string
          required_by?: string | null
          visibility?: string
        }
        Update: {
          created_at?: string
          disclaimer_text?: string
          id?: string
          impact_pathway_id?: string
          required_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_disclaimers_impact_pathway_id_fkey"
            columns: ["impact_pathway_id"]
            isOneToOne: false
            referencedRelation: "impact_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_evaluations: {
        Row: {
          data_sources: string[] | null
          evaluated_at: string
          evaluated_by: string
          evaluation_method: string
          external_evaluator: string | null
          findings_summary: string
          id: string
          impact_pathway_id: string
          lessons_learned: string | null
          success_indicators: Json | null
          unintended_effects: string | null
        }
        Insert: {
          data_sources?: string[] | null
          evaluated_at?: string
          evaluated_by: string
          evaluation_method: string
          external_evaluator?: string | null
          findings_summary: string
          id?: string
          impact_pathway_id: string
          lessons_learned?: string | null
          success_indicators?: Json | null
          unintended_effects?: string | null
        }
        Update: {
          data_sources?: string[] | null
          evaluated_at?: string
          evaluated_by?: string
          evaluation_method?: string
          external_evaluator?: string | null
          findings_summary?: string
          id?: string
          impact_pathway_id?: string
          lessons_learned?: string | null
          success_indicators?: Json | null
          unintended_effects?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_evaluations_impact_pathway_id_fkey"
            columns: ["impact_pathway_id"]
            isOneToOne: false
            referencedRelation: "impact_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_pathways: {
        Row: {
          created_at: string
          id: string
          impact_domain: string
          intended_outcome: string
          primary_contact_id: string | null
          research_timeline_id: string
          status: string
          theory_of_change: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          impact_domain: string
          intended_outcome: string
          primary_contact_id?: string | null
          research_timeline_id: string
          status?: string
          theory_of_change?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          impact_domain?: string
          intended_outcome?: string
          primary_contact_id?: string | null
          research_timeline_id?: string
          status?: string
          theory_of_change?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_pathways_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_response_actions: {
        Row: {
          action_description: string
          action_type: string
          evidence: Json | null
          id: string
          incident_id: string
          next_steps: string | null
          outcome: string | null
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          evidence?: Json | null
          id?: string
          incident_id: string
          next_steps?: string | null
          outcome?: string | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          evidence?: Json | null
          id?: string
          incident_id?: string
          next_steps?: string | null
          outcome?: string | null
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_response_actions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "security_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_response_actions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      infrastructure_contracts: {
        Row: {
          auto_renew: boolean
          billing_cycle: string | null
          contract_type: string
          contract_value: number | null
          country_code: string | null
          created_at: string
          currency: string
          end_date: string | null
          entity_id: string | null
          entity_name: string
          entity_type: string
          id: string
          services_included: Json | null
          signed_at: string | null
          signed_by: string | null
          start_date: string
          status: string
          terms_document_url: string | null
          updated_at: string
          usage_limits: Json | null
        }
        Insert: {
          auto_renew?: boolean
          billing_cycle?: string | null
          contract_type: string
          contract_value?: number | null
          country_code?: string | null
          created_at?: string
          currency?: string
          end_date?: string | null
          entity_id?: string | null
          entity_name: string
          entity_type: string
          id?: string
          services_included?: Json | null
          signed_at?: string | null
          signed_by?: string | null
          start_date: string
          status?: string
          terms_document_url?: string | null
          updated_at?: string
          usage_limits?: Json | null
        }
        Update: {
          auto_renew?: boolean
          billing_cycle?: string | null
          contract_type?: string
          contract_value?: number | null
          country_code?: string | null
          created_at?: string
          currency?: string
          end_date?: string | null
          entity_id?: string | null
          entity_name?: string
          entity_type?: string
          id?: string
          services_included?: Json | null
          signed_at?: string | null
          signed_by?: string | null
          start_date?: string
          status?: string
          terms_document_url?: string | null
          updated_at?: string
          usage_limits?: Json | null
        }
        Relationships: []
      }
      institution_dashboard_access: {
        Row: {
          access_level: string
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          access_level?: string
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          access_level?: string
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_dashboard_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_dashboard_access_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_dashboard_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_partnerships: {
        Row: {
          agreement_end_date: string | null
          agreement_start_date: string | null
          created_at: string
          id: string
          institution_a_id: string
          institution_b_id: string
          is_active: boolean
          partnership_type: string
          terms: Json | null
        }
        Insert: {
          agreement_end_date?: string | null
          agreement_start_date?: string | null
          created_at?: string
          id?: string
          institution_a_id: string
          institution_b_id: string
          is_active?: boolean
          partnership_type: string
          terms?: Json | null
        }
        Update: {
          agreement_end_date?: string | null
          agreement_start_date?: string | null
          created_at?: string
          id?: string
          institution_a_id?: string
          institution_b_id?: string
          is_active?: boolean
          partnership_type?: string
          terms?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_partnerships_institution_a_id_fkey"
            columns: ["institution_a_id"]
            isOneToOne: false
            referencedRelation: "international_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_partnerships_institution_b_id_fkey"
            columns: ["institution_b_id"]
            isOneToOne: false
            referencedRelation: "international_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_research_links: {
        Row: {
          created_at: string | null
          department: string | null
          end_date: string | null
          id: string
          institution_id: string
          is_current: boolean | null
          is_verified: boolean | null
          role: string
          scholar_passport_id: string
          start_date: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          id?: string
          institution_id: string
          is_current?: boolean | null
          is_verified?: boolean | null
          role: string
          scholar_passport_id: string
          start_date: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          id?: string
          institution_id?: string
          is_current?: boolean | null
          is_verified?: boolean | null
          role?: string
          scholar_passport_id?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_research_links_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_research_links_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_research_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_research_links_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_research_snapshots: {
        Row: {
          active_research_timelines: number | null
          avg_project_completion_rate: number | null
          collaborations_count: number | null
          completed_research_timelines: number | null
          created_at: string | null
          external_collaborations: number | null
          funding_received: number | null
          funding_utilized: number | null
          id: string
          institution_id: string
          interdisciplinary_score: number | null
          last_updated_at: string | null
          period_end: string
          period_start: string
          research_domains: Json | null
          snapshot_period: string
          total_publications: number | null
          total_researchers: number | null
        }
        Insert: {
          active_research_timelines?: number | null
          avg_project_completion_rate?: number | null
          collaborations_count?: number | null
          completed_research_timelines?: number | null
          created_at?: string | null
          external_collaborations?: number | null
          funding_received?: number | null
          funding_utilized?: number | null
          id?: string
          institution_id: string
          interdisciplinary_score?: number | null
          last_updated_at?: string | null
          period_end: string
          period_start: string
          research_domains?: Json | null
          snapshot_period?: string
          total_publications?: number | null
          total_researchers?: number | null
        }
        Update: {
          active_research_timelines?: number | null
          avg_project_completion_rate?: number | null
          collaborations_count?: number | null
          completed_research_timelines?: number | null
          created_at?: string | null
          external_collaborations?: number | null
          funding_received?: number | null
          funding_utilized?: number | null
          id?: string
          institution_id?: string
          interdisciplinary_score?: number | null
          last_updated_at?: string | null
          period_end?: string
          period_start?: string
          research_domains?: Json | null
          snapshot_period?: string
          total_publications?: number | null
          total_researchers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_research_snapshots_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      institutional_capabilities: {
        Row: {
          capability_type: string
          created_at: string
          enabled: boolean | null
          id: string
          limits: Json | null
          organization_id: string
        }
        Insert: {
          capability_type: string
          created_at?: string
          enabled?: boolean | null
          id?: string
          limits?: Json | null
          organization_id: string
        }
        Update: {
          capability_type?: string
          created_at?: string
          enabled?: boolean | null
          id?: string
          limits?: Json | null
          organization_id?: string
        }
        Relationships: []
      }
      integration_mappings: {
        Row: {
          created_at: string
          external_identifier: string
          external_system: string
          id: string
          internal_entity_id: string
          internal_entity_type: string
          last_synced_at: string | null
          mapping_metadata: Json | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          external_identifier: string
          external_system: string
          id?: string
          internal_entity_id: string
          internal_entity_type: string
          last_synced_at?: string | null
          mapping_metadata?: Json | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          external_identifier?: string
          external_system?: string
          id?: string
          internal_entity_id?: string
          internal_entity_type?: string
          last_synced_at?: string | null
          mapping_metadata?: Json | null
          verified?: boolean | null
        }
        Relationships: []
      }
      integrity_flags: {
        Row: {
          applied_at: string
          applied_by: string | null
          entity_id: string
          entity_type: string
          flag_reason: string
          flag_type: string
          id: string
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          entity_id: string
          entity_type: string
          flag_reason: string
          flag_type: string
          id?: string
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          entity_id?: string
          entity_type?: string
          flag_reason?: string
          flag_type?: string
          id?: string
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrity_flags_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrity_flags_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interdisciplinary_calls: {
        Row: {
          collaboration_type: string
          created_at: string
          created_by_user_id: string
          expected_duration: string | null
          id: string
          missing_disciplines: string[]
          primary_discipline_id: string
          problem_statement: string
          status: string
          updated_at: string
          visibility: string | null
        }
        Insert: {
          collaboration_type: string
          created_at?: string
          created_by_user_id: string
          expected_duration?: string | null
          id?: string
          missing_disciplines: string[]
          primary_discipline_id: string
          problem_statement: string
          status?: string
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          collaboration_type?: string
          created_at?: string
          created_by_user_id?: string
          expected_duration?: string | null
          id?: string
          missing_disciplines?: string[]
          primary_discipline_id?: string
          problem_statement?: string
          status?: string
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interdisciplinary_calls_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interdisciplinary_calls_primary_discipline_id_fkey"
            columns: ["primary_discipline_id"]
            isOneToOne: false
            referencedRelation: "academic_disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      interdisciplinary_programs: {
        Row: {
          created_at: string
          description: string | null
          disciplines_involved: string[]
          end_date: string | null
          funding_source: string | null
          id: string
          institution_id: string | null
          program_lead_user_id: string | null
          program_name: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          disciplines_involved: string[]
          end_date?: string | null
          funding_source?: string | null
          id?: string
          institution_id?: string | null
          program_lead_user_id?: string | null
          program_name: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          disciplines_involved?: string[]
          end_date?: string | null
          funding_source?: string | null
          id?: string
          institution_id?: string | null
          program_lead_user_id?: string | null
          program_name?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interdisciplinary_programs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interdisciplinary_programs_program_lead_user_id_fkey"
            columns: ["program_lead_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interdisciplinary_responses: {
        Row: {
          call_id: string
          created_at: string
          id: string
          offering_disciplines: string[]
          proposal_text: string
          responder_user_id: string
          status: string
        }
        Insert: {
          call_id: string
          created_at?: string
          id?: string
          offering_disciplines: string[]
          proposal_text: string
          responder_user_id: string
          status?: string
        }
        Update: {
          call_id?: string
          created_at?: string
          id?: string
          offering_disciplines?: string[]
          proposal_text?: string
          responder_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "interdisciplinary_responses_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "interdisciplinary_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interdisciplinary_responses_responder_user_id_fkey"
            columns: ["responder_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      intergenerational_safeguards: {
        Row: {
          created_at: string
          decision_id: string | null
          id: string
          last_reviewed_at: string | null
          next_review_at: string | null
          parameters: Json
          review_count: number | null
          safeguard_type: string
        }
        Insert: {
          created_at?: string
          decision_id?: string | null
          id?: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          parameters: Json
          review_count?: number | null
          safeguard_type: string
        }
        Update: {
          created_at?: string
          decision_id?: string | null
          id?: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          parameters?: Json
          review_count?: number | null
          safeguard_type?: string
        }
        Relationships: []
      }
      international_institutions: {
        Row: {
          accreditation_status: string | null
          city: string | null
          country_code: string
          created_at: string
          id: string
          institution_type: string
          local_org_id: string | null
          metadata: Json | null
          name: string
          ranking_tier: string | null
          updated_at: string
          verified: boolean
          verified_at: string | null
          website_url: string | null
        }
        Insert: {
          accreditation_status?: string | null
          city?: string | null
          country_code: string
          created_at?: string
          id?: string
          institution_type: string
          local_org_id?: string | null
          metadata?: Json | null
          name: string
          ranking_tier?: string | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          website_url?: string | null
        }
        Update: {
          accreditation_status?: string | null
          city?: string | null
          country_code?: string
          created_at?: string
          id?: string
          institution_type?: string
          local_org_id?: string | null
          metadata?: Json | null
          name?: string
          ranking_tier?: string | null
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "international_institutions_local_org_id_fkey"
            columns: ["local_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_contributors: {
        Row: {
          acknowledged_at: string | null
          contribution_record_id: string | null
          created_at: string
          id: string
          ip_record_id: string
          ownership_percentage: number | null
          rights_description: string | null
          role: string
          scholar_passport_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          contribution_record_id?: string | null
          created_at?: string
          id?: string
          ip_record_id: string
          ownership_percentage?: number | null
          rights_description?: string | null
          role: string
          scholar_passport_id: string
        }
        Update: {
          acknowledged_at?: string | null
          contribution_record_id?: string | null
          created_at?: string
          id?: string
          ip_record_id?: string
          ownership_percentage?: number | null
          rights_description?: string | null
          role?: string
          scholar_passport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_contributors_contribution_record_id_fkey"
            columns: ["contribution_record_id"]
            isOneToOne: false
            referencedRelation: "contribution_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_contributors_ip_record_id_fkey"
            columns: ["ip_record_id"]
            isOneToOne: false
            referencedRelation: "ip_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_contributors_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_disputes: {
        Row: {
          created_at: string
          description: string
          dispute_type: string
          evidence_summary: string | null
          id: string
          ip_record_id: string
          mediator_id: string | null
          raised_by: string
          resolution_summary: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description: string
          dispute_type: string
          evidence_summary?: string | null
          id?: string
          ip_record_id: string
          mediator_id?: string | null
          raised_by: string
          resolution_summary?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string
          dispute_type?: string
          evidence_summary?: string | null
          id?: string
          ip_record_id?: string
          mediator_id?: string | null
          raised_by?: string
          resolution_summary?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_disputes_ip_record_id_fkey"
            columns: ["ip_record_id"]
            isOneToOne: false
            referencedRelation: "ip_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_disputes_mediator_id_fkey"
            columns: ["mediator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_disputes_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_licenses: {
        Row: {
          created_at: string
          currency: string | null
          duration_months: number | null
          expires_at: string | null
          id: string
          ip_record_id: string
          license_type: string
          licensee_name: string | null
          licensee_org_id: string | null
          licensee_type: string | null
          royalty_terms: Json | null
          scope: string
          signed_at: string | null
          status: string
          territory: string | null
          updated_at: string
          upfront_fee: number | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          duration_months?: number | null
          expires_at?: string | null
          id?: string
          ip_record_id: string
          license_type: string
          licensee_name?: string | null
          licensee_org_id?: string | null
          licensee_type?: string | null
          royalty_terms?: Json | null
          scope: string
          signed_at?: string | null
          status?: string
          territory?: string | null
          updated_at?: string
          upfront_fee?: number | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          duration_months?: number | null
          expires_at?: string | null
          id?: string
          ip_record_id?: string
          license_type?: string
          licensee_name?: string | null
          licensee_org_id?: string | null
          licensee_type?: string | null
          royalty_terms?: Json | null
          scope?: string
          signed_at?: string | null
          status?: string
          territory?: string | null
          updated_at?: string
          upfront_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ip_licenses_ip_record_id_fkey"
            columns: ["ip_record_id"]
            isOneToOne: false
            referencedRelation: "ip_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_licenses_licensee_org_id_fkey"
            columns: ["licensee_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_records: {
        Row: {
          created_at: string
          declared_at: string
          declared_by: string
          description: string | null
          id: string
          institution_policy_id: string | null
          ip_regime: string
          status: string
          target_id: string
          target_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          declared_at?: string
          declared_by: string
          description?: string | null
          id?: string
          institution_policy_id?: string | null
          ip_regime: string
          status?: string
          target_id: string
          target_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          declared_at?: string
          declared_by?: string
          description?: string | null
          id?: string
          institution_policy_id?: string | null
          ip_regime?: string
          status?: string
          target_id?: string
          target_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ip_records_declared_by_fkey"
            columns: ["declared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ip_records_institution_policy_id_fkey"
            columns: ["institution_policy_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          id: string
          job_id: string
          resume_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          application_url: string | null
          created_at: string | null
          currency: string | null
          deadline: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_remote: boolean | null
          job_type: string | null
          location: string | null
          organization_id: string | null
          posted_by: string | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_url?: string | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          job_type?: string | null
          location?: string | null
          organization_id?: string | null
          posted_by?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_url?: string | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          job_type?: string | null
          location?: string | null
          organization_id?: string | null
          posted_by?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_context_layers: {
        Row: {
          authored_by: string | null
          canonical_record_id: string
          content: string
          created_at: string
          id: string
          layer_type: string
          version_applicable: string | null
        }
        Insert: {
          authored_by?: string | null
          canonical_record_id: string
          content: string
          created_at?: string
          id?: string
          layer_type: string
          version_applicable?: string | null
        }
        Update: {
          authored_by?: string | null
          canonical_record_id?: string
          content?: string
          created_at?: string
          id?: string
          layer_type?: string
          version_applicable?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_context_layers_canonical_record_id_fkey"
            columns: ["canonical_record_id"]
            isOneToOne: false
            referencedRelation: "canonical_knowledge_records"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_contributions: {
        Row: {
          contribution_notes: string | null
          contribution_type: string
          contributor_id: string
          created_at: string
          id: string
          knowledge_node_id: string
        }
        Insert: {
          contribution_notes?: string | null
          contribution_type: string
          contributor_id: string
          created_at?: string
          id?: string
          knowledge_node_id: string
        }
        Update: {
          contribution_notes?: string | null
          contribution_type?: string
          contributor_id?: string
          created_at?: string
          id?: string
          knowledge_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_contributions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_contributions_knowledge_node_id_fkey"
            columns: ["knowledge_node_id"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_dissent_records: {
        Row: {
          canonical_record_id: string
          created_at: string
          dissenting_claim: string
          id: string
          rejection_reason: string | null
          status: string
          submitted_by: string | null
          supporting_evidence: Json | null
          visibility: string
        }
        Insert: {
          canonical_record_id: string
          created_at?: string
          dissenting_claim: string
          id?: string
          rejection_reason?: string | null
          status?: string
          submitted_by?: string | null
          supporting_evidence?: Json | null
          visibility?: string
        }
        Update: {
          canonical_record_id?: string
          created_at?: string
          dissenting_claim?: string
          id?: string
          rejection_reason?: string | null
          status?: string
          submitted_by?: string | null
          supporting_evidence?: Json | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_dissent_records_canonical_record_id_fkey"
            columns: ["canonical_record_id"]
            isOneToOne: false
            referencedRelation: "canonical_knowledge_records"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_edges: {
        Row: {
          confidence_level: string | null
          created_at: string
          created_by: string
          evidence_summary: string | null
          id: string
          relationship_type: string
          source_node_id: string
          target_node_id: string
        }
        Insert: {
          confidence_level?: string | null
          created_at?: string
          created_by: string
          evidence_summary?: string | null
          id?: string
          relationship_type: string
          source_node_id: string
          target_node_id: string
        }
        Update: {
          confidence_level?: string | null
          created_at?: string
          created_by?: string
          evidence_summary?: string | null
          id?: string
          relationship_type?: string
          source_node_id?: string
          target_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_edges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_export_jobs: {
        Row: {
          created_at: string
          download_url: string | null
          expires_at: string | null
          export_type: string
          format: string
          id: string
          requested_by: string | null
          scope: Json
          status: string
        }
        Insert: {
          created_at?: string
          download_url?: string | null
          expires_at?: string | null
          export_type: string
          format: string
          id?: string
          requested_by?: string | null
          scope: Json
          status?: string
        }
        Update: {
          created_at?: string
          download_url?: string | null
          expires_at?: string | null
          export_type?: string
          format?: string
          id?: string
          requested_by?: string | null
          scope?: Json
          status?: string
        }
        Relationships: []
      }
      knowledge_governance_bodies: {
        Row: {
          created_at: string
          decision_process: string
          id: string
          is_active: boolean | null
          jurisdiction: string
          mandate: string
          members: Json | null
          name: string
          quorum_rules: Json
        }
        Insert: {
          created_at?: string
          decision_process: string
          id?: string
          is_active?: boolean | null
          jurisdiction: string
          mandate: string
          members?: Json | null
          name: string
          quorum_rules?: Json
        }
        Update: {
          created_at?: string
          decision_process?: string
          id?: string
          is_active?: boolean | null
          jurisdiction?: string
          mandate?: string
          members?: Json | null
          name?: string
          quorum_rules?: Json
        }
        Relationships: []
      }
      knowledge_graph_snapshots: {
        Row: {
          discipline_id: string | null
          edge_count: number | null
          id: string
          key_concepts: string[] | null
          last_computed_at: string
          major_clusters: Json | null
          node_count: number | null
          scope_id: string | null
          scope_type: string
        }
        Insert: {
          discipline_id?: string | null
          edge_count?: number | null
          id?: string
          key_concepts?: string[] | null
          last_computed_at?: string
          major_clusters?: Json | null
          node_count?: number | null
          scope_id?: string | null
          scope_type: string
        }
        Update: {
          discipline_id?: string | null
          edge_count?: number | null
          id?: string
          key_concepts?: string[] | null
          last_computed_at?: string
          major_clusters?: Json | null
          node_count?: number | null
          scope_id?: string | null
          scope_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_graph_snapshots_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "academic_disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_lineages: {
        Row: {
          descendant_node_id: string
          id: string
          lineage_type: string
          recorded_at: string
          recorded_by: string | null
          root_node_id: string
          transformation_notes: string | null
        }
        Insert: {
          descendant_node_id: string
          id?: string
          lineage_type: string
          recorded_at?: string
          recorded_by?: string | null
          root_node_id: string
          transformation_notes?: string | null
        }
        Update: {
          descendant_node_id?: string
          id?: string
          lineage_type?: string
          recorded_at?: string
          recorded_by?: string | null
          root_node_id?: string
          transformation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_lineages_descendant_node_id_fkey"
            columns: ["descendant_node_id"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_lineages_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_lineages_root_node_id_fkey"
            columns: ["root_node_id"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_node_tags: {
        Row: {
          created_at: string
          id: string
          knowledge_node_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          knowledge_node_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          knowledge_node_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_node_tags_knowledge_node_id_fkey"
            columns: ["knowledge_node_id"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_nodes: {
        Row: {
          confidence_level: string | null
          created_at: string
          created_by_user_id: string
          description: string | null
          discipline_id: string | null
          id: string
          node_type: string
          title: string
          updated_at: string
          visibility: string | null
        }
        Insert: {
          confidence_level?: string | null
          created_at?: string
          created_by_user_id: string
          description?: string | null
          discipline_id?: string | null
          id?: string
          node_type: string
          title: string
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          confidence_level?: string | null
          created_at?: string
          created_by_user_id?: string
          description?: string | null
          discipline_id?: string | null
          id?: string
          node_type?: string
          title?: string
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_nodes_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_nodes_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "academic_disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_objects: {
        Row: {
          citation_count: number | null
          content: Json
          created_at: string
          credibility_score: number | null
          deleted_at: string | null
          domain: string[] | null
          id: string
          knowledge_type: string
          organization_id: string | null
          owner_id: string | null
          status: string
          summary: string | null
          superseded_by: string | null
          tags: string[] | null
          title: string
          updated_at: string
          usage_count: number | null
          visibility: string
        }
        Insert: {
          citation_count?: number | null
          content?: Json
          created_at?: string
          credibility_score?: number | null
          deleted_at?: string | null
          domain?: string[] | null
          id?: string
          knowledge_type?: string
          organization_id?: string | null
          owner_id?: string | null
          status?: string
          summary?: string | null
          superseded_by?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          usage_count?: number | null
          visibility?: string
        }
        Update: {
          citation_count?: number | null
          content?: Json
          created_at?: string
          credibility_score?: number | null
          deleted_at?: string | null
          domain?: string[] | null
          id?: string
          knowledge_type?: string
          organization_id?: string | null
          owner_id?: string | null
          status?: string
          summary?: string | null
          superseded_by?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          usage_count?: number | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_objects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_snapshots: {
        Row: {
          access_restrictions: Json | null
          accessible_until: string | null
          created_at: string
          created_by: string | null
          data_scope: string[] | null
          description: string
          format_version: string
          id: string
          snapshot_date: string
          snapshot_type: string
          storage_location: string
          verification_hash: string
        }
        Insert: {
          access_restrictions?: Json | null
          accessible_until?: string | null
          created_at?: string
          created_by?: string | null
          data_scope?: string[] | null
          description: string
          format_version: string
          id?: string
          snapshot_date: string
          snapshot_type: string
          storage_location: string
          verification_hash: string
        }
        Update: {
          access_restrictions?: Json | null
          accessible_until?: string | null
          created_at?: string
          created_by?: string | null
          data_scope?: string[] | null
          description?: string
          format_version?: string
          id?: string
          snapshot_date?: string
          snapshot_type?: string
          storage_location?: string
          verification_hash?: string
        }
        Relationships: []
      }
      knowledge_sources: {
        Row: {
          citation_text: string | null
          created_at: string
          external_url: string | null
          id: string
          knowledge_node_id: string
          note: string | null
          source_id: string | null
          source_type: string
        }
        Insert: {
          citation_text?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          knowledge_node_id: string
          note?: string | null
          source_id?: string | null
          source_type: string
        }
        Update: {
          citation_text?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          knowledge_node_id?: string
          note?: string | null
          source_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_sources_knowledge_node_id_fkey"
            columns: ["knowledge_node_id"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_usage_events: {
        Row: {
          context_id: string | null
          context_type: string | null
          created_at: string
          id: string
          knowledge_object_id: string | null
          metadata: Json | null
          usage_type: string
          user_id: string | null
        }
        Insert: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          knowledge_object_id?: string | null
          metadata?: Json | null
          usage_type: string
          user_id?: string | null
        }
        Update: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          knowledge_object_id?: string | null
          metadata?: Json | null
          usage_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_validations: {
        Row: {
          confidence_score: number | null
          created_at: string
          evidence: Json | null
          id: string
          knowledge_object_id: string | null
          outcome: string
          reasoning: string | null
          validation_type: string
          validator_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          evidence?: Json | null
          id?: string
          knowledge_object_id?: string | null
          outcome: string
          reasoning?: string | null
          validation_type: string
          validator_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          evidence?: Json | null
          id?: string
          knowledge_object_id?: string | null
          outcome?: string
          reasoning?: string | null
          validation_type?: string
          validator_id?: string | null
        }
        Relationships: []
      }
      knowledge_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          canonical_record_id: string
          change_type: string
          context_snapshot: Json | null
          created_at: string
          evidence_links: Json | null
          id: string
          justification: string
          supersedes_version_id: string | null
          version_label: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          canonical_record_id: string
          change_type: string
          context_snapshot?: Json | null
          created_at?: string
          evidence_links?: Json | null
          id?: string
          justification: string
          supersedes_version_id?: string | null
          version_label: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          canonical_record_id?: string
          change_type?: string
          context_snapshot?: Json | null
          created_at?: string
          evidence_links?: Json | null
          id?: string
          justification?: string
          supersedes_version_id?: string | null
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_versions_canonical_record_id_fkey"
            columns: ["canonical_record_id"]
            isOneToOne: false
            referencedRelation: "canonical_knowledge_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_versions_supersedes_version_id_fkey"
            columns: ["supersedes_version_id"]
            isOneToOne: false
            referencedRelation: "knowledge_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      language_support_profiles: {
        Row: {
          preferred_academic_language: string | null
          primary_language: string
          secondary_languages: string[] | null
          translation_assist_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          preferred_academic_language?: string | null
          primary_language?: string
          secondary_languages?: string[] | null
          translation_assist_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          preferred_academic_language?: string | null
          primary_language?: string
          secondary_languages?: string[] | null
          translation_assist_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          lesson_id: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_interactions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          interaction_type: string
          logged_by: string
          mentorship_relationship_id: string
          occurred_at: string
          summary: string | null
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          interaction_type: string
          logged_by: string
          mentorship_relationship_id: string
          occurred_at?: string
          summary?: string | null
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          interaction_type?: string
          logged_by?: string
          mentorship_relationship_id?: string
          occurred_at?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_interactions_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_interactions_mentorship_relationship_id_fkey"
            columns: ["mentorship_relationship_id"]
            isOneToOne: false
            referencedRelation: "mentorship_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_relationships: {
        Row: {
          actual_end_date: string | null
          created_at: string
          expected_end_date: string | null
          expected_frequency: string | null
          goals: string | null
          id: string
          initiated_by: string
          mentee_consent_at: string | null
          mentee_scholar_passport_id: string
          mentor_consent_at: string | null
          mentor_scholar_passport_id: string
          mentorship_type: string
          start_date: string
          status: string
          termination_reason: string | null
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          created_at?: string
          expected_end_date?: string | null
          expected_frequency?: string | null
          goals?: string | null
          id?: string
          initiated_by: string
          mentee_consent_at?: string | null
          mentee_scholar_passport_id: string
          mentor_consent_at?: string | null
          mentor_scholar_passport_id: string
          mentorship_type: string
          start_date?: string
          status?: string
          termination_reason?: string | null
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          created_at?: string
          expected_end_date?: string | null
          expected_frequency?: string | null
          goals?: string | null
          id?: string
          initiated_by?: string
          mentee_consent_at?: string | null
          mentee_scholar_passport_id?: string
          mentor_consent_at?: string | null
          mentor_scholar_passport_id?: string
          mentorship_type?: string
          start_date?: string
          status?: string
          termination_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_relationships_mentee_scholar_passport_id_fkey"
            columns: ["mentee_scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_relationships_mentor_scholar_passport_id_fkey"
            columns: ["mentor_scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          archived_by_user_a: boolean | null
          archived_by_user_b: boolean | null
          created_at: string
          id: string
          last_message_at: string
          last_message_text: string | null
          muted_by_user_a_until: string | null
          muted_by_user_b_until: string | null
          pair_key: string | null
          starred_by_user_a: boolean | null
          starred_by_user_b: boolean | null
          user_a: string
          user_b: string
        }
        Insert: {
          archived_by_user_a?: boolean | null
          archived_by_user_b?: boolean | null
          created_at?: string
          id?: string
          last_message_at?: string
          last_message_text?: string | null
          muted_by_user_a_until?: string | null
          muted_by_user_b_until?: string | null
          pair_key?: string | null
          starred_by_user_a?: boolean | null
          starred_by_user_b?: boolean | null
          user_a: string
          user_b: string
        }
        Update: {
          archived_by_user_a?: boolean | null
          archived_by_user_b?: boolean | null
          created_at?: string
          id?: string
          last_message_at?: string
          last_message_text?: string | null
          muted_by_user_a_until?: string | null
          muted_by_user_b_until?: string | null
          pair_key?: string | null
          starred_by_user_a?: boolean | null
          starred_by_user_b?: boolean | null
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment: Json | null
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          reactions: Json | null
          read_at: string | null
          sender_id: string
          thread_id: string
          type: string
        }
        Insert: {
          attachment?: Json | null
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          reactions?: Json | null
          read_at?: string | null
          sender_id: string
          thread_id: string
          type?: string
        }
        Update: {
          attachment?: Json | null
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          reactions?: Json | null
          read_at?: string | null
          sender_id?: string
          thread_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          amount: number
          approval_reminder_sent: boolean | null
          approved_at: string | null
          auto_release_at: string | null
          created_at: string
          description: string | null
          expected_delivery: string | null
          id: string
          offer_id: string
          order_index: number
          partial_release_amount: number | null
          released_at: string | null
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          approval_reminder_sent?: boolean | null
          approved_at?: string | null
          auto_release_at?: string | null
          created_at?: string
          description?: string | null
          expected_delivery?: string | null
          id?: string
          offer_id: string
          order_index?: number
          partial_release_amount?: number | null
          released_at?: string | null
          status?: string
          submitted_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approval_reminder_sent?: boolean | null
          approved_at?: string | null
          auto_release_at?: string | null
          created_at?: string
          description?: string | null
          expected_delivery?: string | null
          id?: string
          offer_id?: string
          order_index?: number
          partial_release_amount?: number | null
          released_at?: string | null
          status?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      misuse_reports: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          evidence_urls: string[] | null
          id: string
          misuse_type: string
          reported_by: string | null
          reported_entity_id: string
          reported_entity_type: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          misuse_type: string
          reported_by?: string | null
          reported_entity_id: string
          reported_entity_type: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          misuse_type?: string
          reported_by?: string | null
          reported_entity_id?: string
          reported_entity_type?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "misuse_reports_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "misuse_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mobility_agreements: {
        Row: {
          agreement_summary: string
          agreement_type: string
          confidentiality_terms: string | null
          created_at: string
          expires_at: string | null
          id: string
          ip_terms: string | null
          mobility_request_id: string
          obligations_home: string | null
          obligations_host: string | null
          scholar_rights: string | null
          signed_at: string | null
          status: string
        }
        Insert: {
          agreement_summary: string
          agreement_type: string
          confidentiality_terms?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_terms?: string | null
          mobility_request_id: string
          obligations_home?: string | null
          obligations_host?: string | null
          scholar_rights?: string | null
          signed_at?: string | null
          status?: string
        }
        Update: {
          agreement_summary?: string
          agreement_type?: string
          confidentiality_terms?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          ip_terms?: string | null
          mobility_request_id?: string
          obligations_home?: string | null
          obligations_host?: string | null
          scholar_rights?: string | null
          signed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobility_agreements_mobility_request_id_fkey"
            columns: ["mobility_request_id"]
            isOneToOne: false
            referencedRelation: "research_mobility_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      mobility_approvals: {
        Row: {
          approver_org_id: string | null
          approver_type: string
          approver_user_id: string | null
          conditions: string | null
          created_at: string
          decided_at: string | null
          decision: string | null
          id: string
          mobility_request_id: string
          notes: string | null
        }
        Insert: {
          approver_org_id?: string | null
          approver_type: string
          approver_user_id?: string | null
          conditions?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          id?: string
          mobility_request_id: string
          notes?: string | null
        }
        Update: {
          approver_org_id?: string | null
          approver_type?: string
          approver_user_id?: string | null
          conditions?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          id?: string
          mobility_request_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobility_approvals_approver_org_id_fkey"
            columns: ["approver_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobility_approvals_approver_user_id_fkey"
            columns: ["approver_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobility_approvals_mobility_request_id_fkey"
            columns: ["mobility_request_id"]
            isOneToOne: false
            referencedRelation: "research_mobility_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      mobility_compliance_flags: {
        Row: {
          created_at: string
          description: string | null
          flag_type: string
          id: string
          mobility_request_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          flag_type: string
          id?: string
          mobility_request_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          flag_type?: string
          id?: string
          mobility_request_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobility_compliance_flags_mobility_request_id_fkey"
            columns: ["mobility_request_id"]
            isOneToOne: false
            referencedRelation: "research_mobility_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobility_compliance_flags_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      national_dashboard_access: {
        Row: {
          access_level: string
          country_code: string
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          organization_affiliation: string | null
          user_id: string
        }
        Insert: {
          access_level?: string
          country_code: string
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_affiliation?: string | null
          user_id: string
        }
        Update: {
          access_level?: string
          country_code?: string
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_affiliation?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "national_dashboard_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "national_dashboard_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      national_infrastructure_profiles: {
        Row: {
          activated_at: string | null
          country_code: string
          country_name: string
          created_at: string
          data_residency_rules: Json | null
          deployment_model: string
          governing_body_id: string | null
          id: string
          status: string | null
        }
        Insert: {
          activated_at?: string | null
          country_code: string
          country_name: string
          created_at?: string
          data_residency_rules?: Json | null
          deployment_model: string
          governing_body_id?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          activated_at?: string | null
          country_code?: string
          country_name?: string
          created_at?: string
          data_residency_rules?: Json | null
          deployment_model?: string
          governing_body_id?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "national_infrastructure_profiles_governing_body_id_fkey"
            columns: ["governing_body_id"]
            isOneToOne: false
            referencedRelation: "governance_councils"
            referencedColumns: ["id"]
          },
        ]
      }
      national_insights: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          confidence_score: number | null
          country_code: string | null
          created_at: string
          data_sources: Json | null
          detailed_analysis: string | null
          generated_by: string
          id: string
          insight_type: string
          is_public: boolean
          recommendations: Json | null
          summary: string
          title: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          confidence_score?: number | null
          country_code?: string | null
          created_at?: string
          data_sources?: Json | null
          detailed_analysis?: string | null
          generated_by?: string
          id?: string
          insight_type: string
          is_public?: boolean
          recommendations?: Json | null
          summary: string
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          confidence_score?: number | null
          country_code?: string | null
          created_at?: string
          data_sources?: Json | null
          detailed_analysis?: string | null
          generated_by?: string
          id?: string
          insight_type?: string
          is_public?: boolean
          recommendations?: Json | null
          summary?: string
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      national_research_snapshots: {
        Row: {
          avg_funding_per_researcher: number | null
          collaboration_density: number | null
          computed_at: string | null
          country_code: string
          country_name: string
          emerging_domains: Json | null
          funding_distribution: Json | null
          id: string
          institution_participation: Json | null
          international_collaboration_rate: number | null
          period_end: string
          period_start: string
          research_domains: Json | null
          snapshot_period: string
          talent_flow_metrics: Json | null
          top_research_areas: Json | null
          total_active_research: number | null
          total_institutions: number | null
          total_publications: number | null
          total_researchers: number | null
        }
        Insert: {
          avg_funding_per_researcher?: number | null
          collaboration_density?: number | null
          computed_at?: string | null
          country_code: string
          country_name: string
          emerging_domains?: Json | null
          funding_distribution?: Json | null
          id?: string
          institution_participation?: Json | null
          international_collaboration_rate?: number | null
          period_end: string
          period_start: string
          research_domains?: Json | null
          snapshot_period?: string
          talent_flow_metrics?: Json | null
          top_research_areas?: Json | null
          total_active_research?: number | null
          total_institutions?: number | null
          total_publications?: number | null
          total_researchers?: number | null
        }
        Update: {
          avg_funding_per_researcher?: number | null
          collaboration_density?: number | null
          computed_at?: string | null
          country_code?: string
          country_name?: string
          emerging_domains?: Json | null
          funding_distribution?: Json | null
          id?: string
          institution_participation?: Json | null
          international_collaboration_rate?: number | null
          period_end?: string
          period_start?: string
          research_domains?: Json | null
          snapshot_period?: string
          talent_flow_metrics?: Json | null
          top_research_areas?: Json | null
          total_active_research?: number | null
          total_institutions?: number | null
          total_publications?: number | null
          total_researchers?: number | null
        }
        Relationships: []
      }
      national_research_strategies: {
        Row: {
          adopted_at: string | null
          adopted_by: string | null
          capacity_goals: Json | null
          country_code: string
          created_at: string
          id: string
          priority_domains: string[] | null
          public_values_statement: string | null
          strategy_name: string
          strategy_period_end: string
          strategy_period_start: string
        }
        Insert: {
          adopted_at?: string | null
          adopted_by?: string | null
          capacity_goals?: Json | null
          country_code: string
          created_at?: string
          id?: string
          priority_domains?: string[] | null
          public_values_statement?: string | null
          strategy_name: string
          strategy_period_end: string
          strategy_period_start: string
        }
        Update: {
          adopted_at?: string | null
          adopted_by?: string | null
          capacity_goals?: Json | null
          country_code?: string
          created_at?: string
          id?: string
          priority_domains?: string[] | null
          public_values_statement?: string | null
          strategy_name?: string
          strategy_period_end?: string
          strategy_period_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "national_research_strategies_adopted_by_fkey"
            columns: ["adopted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      negative_results_archive: {
        Row: {
          actual_outcome: string
          created_at: string
          expected_outcome: string
          field: string
          future_implications: string | null
          hypothesis: string
          id: string
          is_public: boolean | null
          lessons_learned: string | null
          methodology: string
          project_id: string | null
          replication_attempts: number | null
          researcher_id: string
          why_it_failed: string
        }
        Insert: {
          actual_outcome: string
          created_at?: string
          expected_outcome: string
          field: string
          future_implications?: string | null
          hypothesis: string
          id?: string
          is_public?: boolean | null
          lessons_learned?: string | null
          methodology: string
          project_id?: string | null
          replication_attempts?: number | null
          researcher_id: string
          why_it_failed: string
        }
        Update: {
          actual_outcome?: string
          created_at?: string
          expected_outcome?: string
          field?: string
          future_implications?: string | null
          hypothesis?: string
          id?: string
          is_public?: boolean | null
          lessons_learned?: string | null
          methodology?: string
          project_id?: string | null
          replication_attempts?: number | null
          researcher_id?: string
          why_it_failed?: string
        }
        Relationships: []
      }
      network_suggestions: {
        Row: {
          created_at: string
          id: string
          is_dismissed: boolean | null
          reason: string
          score: number
          suggested_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          reason: string
          score?: number
          suggested_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          reason?: string
          score?: number
          suggested_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "network_suggestions_suggested_user_id_fkey"
            columns: ["suggested_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          attempted_at: string | null
          channel: string
          created_at: string | null
          error_message: string | null
          id: string
          notification_id: string
          status: string | null
        }
        Insert: {
          attempted_at?: string | null
          channel: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_id: string
          status?: string | null
        }
        Update: {
          attempted_at?: string | null
          channel?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_global_settings: {
        Row: {
          created_at: string | null
          dnd_end_time: string | null
          dnd_start_time: string | null
          do_not_disturb: boolean | null
          email_digest_frequency: string | null
          id: string
          muted_until: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dnd_end_time?: string | null
          dnd_start_time?: string | null
          do_not_disturb?: boolean | null
          email_digest_frequency?: string | null
          id?: string
          muted_until?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dnd_end_time?: string | null
          dnd_start_time?: string | null
          do_not_disturb?: boolean | null
          email_digest_frequency?: string | null
          id?: string
          muted_until?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_global_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          notification_type_id: string
          push_enabled: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          notification_type_id: string
          push_enabled?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          notification_type_id?: string
          push_enabled?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_notification_type_id_fkey"
            columns: ["notification_type_id"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_types: {
        Row: {
          body_template: string | null
          category: string
          created_at: string | null
          default_email: boolean | null
          default_in_app: boolean | null
          default_push: boolean | null
          id: string
          importance: string | null
          key: string
          title_template: string
        }
        Insert: {
          body_template?: string | null
          category: string
          created_at?: string | null
          default_email?: boolean | null
          default_in_app?: boolean | null
          default_push?: boolean | null
          id?: string
          importance?: string | null
          key: string
          title_template: string
        }
        Update: {
          body_template?: string | null
          category?: string
          created_at?: string | null
          default_email?: boolean | null
          default_in_app?: boolean | null
          default_push?: boolean | null
          id?: string
          importance?: string | null
          key?: string
          title_template?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offer_attachments: {
        Row: {
          created_at: string
          id: string
          label: string | null
          offer_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          offer_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          offer_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_attachments_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string
          currency: string
          delivery_days: number | null
          description: string | null
          id: string
          offer_type: string
          price: number
          recipient_id: string
          required_skills: string[] | null
          sender_id: string
          status: string
          thread_id: string
          title: string
        }
        Insert: {
          created_at?: string
          currency?: string
          delivery_days?: number | null
          description?: string | null
          id?: string
          offer_type: string
          price: number
          recipient_id: string
          required_skills?: string[] | null
          sender_id: string
          status?: string
          thread_id: string
          title: string
        }
        Update: {
          created_at?: string
          currency?: string
          delivery_days?: number | null
          description?: string | null
          id?: string
          offer_type?: string
          price?: number
          recipient_id?: string
          required_skills?: string[] | null
          sender_id?: string
          status?: string
          thread_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ombuds_assignments: {
        Row: {
          assigned_at: string
          completed_at: string | null
          dispute_id: string
          id: string
          ombuds_user_id: string
          role: string
        }
        Insert: {
          assigned_at?: string
          completed_at?: string | null
          dispute_id: string
          id?: string
          ombuds_user_id: string
          role: string
        }
        Update: {
          assigned_at?: string
          completed_at?: string | null
          dispute_id?: string
          id?: string
          ombuds_user_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ombuds_assignments_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "academic_disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ombuds_assignments_ombuds_user_id_fkey"
            columns: ["ombuds_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          created_at: string
          current_step: string | null
          dismissed_tips: Json
          first_bid_placed: boolean
          first_milestone_completed: boolean
          first_offer_sent: boolean
          first_project_posted: boolean
          last_activity_at: string | null
          profile_strength_score: number
          steps_completed: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: string | null
          dismissed_tips?: Json
          first_bid_placed?: boolean
          first_milestone_completed?: boolean
          first_offer_sent?: boolean
          first_project_posted?: boolean
          last_activity_at?: string | null
          profile_strength_score?: number
          steps_completed?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: string | null
          dismissed_tips?: Json
          first_bid_placed?: boolean
          first_milestone_completed?: boolean
          first_offer_sent?: boolean
          first_project_posted?: boolean
          last_activity_at?: string | null
          profile_strength_score?: number
          steps_completed?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      open_science_badges: {
        Row: {
          badge_type: string
          expires_at: string | null
          id: string
          issued_at: string
          issued_by: string
          issuer_entity_id: string | null
          target_id: string
          target_type: string
          verification_url: string | null
        }
        Insert: {
          badge_type: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          issued_by?: string
          issuer_entity_id?: string | null
          target_id: string
          target_type: string
          verification_url?: string | null
        }
        Update: {
          badge_type?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          issued_by?: string
          issuer_entity_id?: string | null
          target_id?: string
          target_type?: string
          verification_url?: string | null
        }
        Relationships: []
      }
      opportunity_alerts: {
        Row: {
          alert_type: string
          created_at: string
          deadline_distance_days: number | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          is_notified: boolean | null
          match_reasons: Json | null
          match_score: number
          notified_at: string | null
          opportunity_id: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          deadline_distance_days?: number | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_notified?: boolean | null
          match_reasons?: Json | null
          match_score: number
          notified_at?: string | null
          opportunity_id: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          deadline_distance_days?: number | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_notified?: boolean | null
          match_reasons?: Json | null
          match_score?: number
          notified_at?: string | null
          opportunity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_alerts_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_bulk_licenses: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          monthly_cost: number
          org_id: string | null
          status: string | null
          tool_id: string | null
          total_seats: number
          used_seats: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          monthly_cost: number
          org_id?: string | null
          status?: string | null
          tool_id?: string | null
          total_seats: number
          used_seats?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          monthly_cost?: number
          org_id?: string | null
          status?: string | null
          tool_id?: string | null
          total_seats?: number
          used_seats?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "org_bulk_licenses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_bulk_licenses_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      org_departments: {
        Row: {
          budget_limit: number | null
          created_at: string
          head_user_id: string | null
          id: string
          member_limit: number | null
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          budget_limit?: number | null
          created_at?: string
          head_user_id?: string | null
          id?: string
          member_limit?: number | null
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          budget_limit?: number | null
          created_at?: string
          head_user_id?: string | null
          id?: string
          member_limit?: number | null
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_departments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_internal_projects: {
        Row: {
          created_at: string
          department_id: string | null
          earning_project_id: string
          id: string
          org_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          earning_project_id: string
          id?: string
          org_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          earning_project_id?: string
          id?: string
          org_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_internal_projects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "org_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_internal_projects_earning_project_id_fkey"
            columns: ["earning_project_id"]
            isOneToOne: true
            referencedRelation: "earning_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_internal_projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          department_id: string | null
          id: string
          is_faculty_admin: boolean | null
          org_id: string | null
          role: string | null
          status: string | null
          tool_access: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_faculty_admin?: boolean | null
          org_id?: string | null
          role?: string | null
          status?: string | null
          tool_access?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_faculty_admin?: boolean | null
          org_id?: string | null
          role?: string | null
          status?: string | null
          tool_access?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "org_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          admin_contact_email: string | null
          admin_contact_name: string | null
          city: string | null
          country: string | null
          created_at: string | null
          custom_pricing_enabled: boolean | null
          data_retention_days: number | null
          id: string
          invoice_prefix: string | null
          member_limit: number | null
          name: string
          org_trust_score: number | null
          parent_org_id: string | null
          sla_tier: string | null
          status: string | null
          subscription_plan: string | null
          total_spent: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          admin_contact_email?: string | null
          admin_contact_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_pricing_enabled?: boolean | null
          data_retention_days?: number | null
          id?: string
          invoice_prefix?: string | null
          member_limit?: number | null
          name: string
          org_trust_score?: number | null
          parent_org_id?: string | null
          sla_tier?: string | null
          status?: string | null
          subscription_plan?: string | null
          total_spent?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          admin_contact_email?: string | null
          admin_contact_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_pricing_enabled?: boolean | null
          data_retention_days?: number | null
          id?: string
          invoice_prefix?: string | null
          member_limit?: number | null
          name?: string
          org_trust_score?: number | null
          parent_org_id?: string | null
          sla_tier?: string | null
          status?: string | null
          subscription_plan?: string | null
          total_spent?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      outcome_feed_items: {
        Row: {
          actor_id: string | null
          actor_type: string
          created_at: string
          engagement_disabled: boolean | null
          id: string
          is_verified: boolean | null
          item_type: string
          proof_reference: Json | null
          relevance_tags: string[] | null
          summary: string | null
          target_id: string | null
          target_type: string | null
          title: string
          visibility: string
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          created_at?: string
          engagement_disabled?: boolean | null
          id?: string
          is_verified?: boolean | null
          item_type: string
          proof_reference?: Json | null
          relevance_tags?: string[] | null
          summary?: string | null
          target_id?: string | null
          target_type?: string | null
          title: string
          visibility?: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          engagement_disabled?: boolean | null
          id?: string
          is_verified?: boolean | null
          item_type?: string
          proof_reference?: Json | null
          relevance_tags?: string[] | null
          summary?: string | null
          target_id?: string | null
          target_type?: string | null
          title?: string
          visibility?: string
        }
        Relationships: []
      }
      outcome_links: {
        Row: {
          contribution_weight: number | null
          created_at: string
          id: string
          linked_entity_id: string
          linked_entity_type: string
          metadata: Json | null
          outcome_id: string | null
          relationship_type: string
        }
        Insert: {
          contribution_weight?: number | null
          created_at?: string
          id?: string
          linked_entity_id: string
          linked_entity_type: string
          metadata?: Json | null
          outcome_id?: string | null
          relationship_type: string
        }
        Update: {
          contribution_weight?: number | null
          created_at?: string
          id?: string
          linked_entity_id?: string
          linked_entity_type?: string
          metadata?: Json | null
          outcome_id?: string | null
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcome_links_outcome_id_fkey"
            columns: ["outcome_id"]
            isOneToOne: false
            referencedRelation: "outcomes"
            referencedColumns: ["id"]
          },
        ]
      }
      outcomes: {
        Row: {
          completed_at: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          evidence: Json | null
          id: string
          organization_id: string | null
          outcome_type: string
          primary_owner_id: string | null
          status: string
          title: string
          trust_impact: number | null
          updated_at: string
          value_generated: number | null
          verified_at: string | null
          verified_by: string | null
          visibility: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          evidence?: Json | null
          id?: string
          organization_id?: string | null
          outcome_type: string
          primary_owner_id?: string | null
          status?: string
          title: string
          trust_impact?: number | null
          updated_at?: string
          value_generated?: number | null
          verified_at?: string | null
          verified_by?: string | null
          visibility?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          evidence?: Json | null
          id?: string
          organization_id?: string | null
          outcome_type?: string
          primary_owner_id?: string | null
          status?: string
          title?: string
          trust_impact?: number | null
          updated_at?: string
          value_generated?: number | null
          verified_at?: string | null
          verified_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcomes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      paid_boosts: {
        Row: {
          boost_type: string
          created_at: string
          ends_at: string
          entity_id: string
          entity_type: string
          id: string
          price: number
          starts_at: string
          status: string
          user_id: string
        }
        Insert: {
          boost_type: string
          created_at?: string
          ends_at: string
          entity_id: string
          entity_type: string
          id?: string
          price: number
          starts_at?: string
          status?: string
          user_id: string
        }
        Update: {
          boost_type?: string
          created_at?: string
          ends_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          price?: number
          starts_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      peer_review_ai_assists: {
        Row: {
          ai_feedback_summary: string | null
          confidence_score: number | null
          created_at: string
          id: string
          strengths_detected: Json | null
          suggestions: Json | null
          target_id: string
          target_type: string
          weaknesses_detected: Json | null
        }
        Insert: {
          ai_feedback_summary?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          strengths_detected?: Json | null
          suggestions?: Json | null
          target_id: string
          target_type: string
          weaknesses_detected?: Json | null
        }
        Update: {
          ai_feedback_summary?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          strengths_detected?: Json | null
          suggestions?: Json | null
          target_id?: string
          target_type?: string
          weaknesses_detected?: Json | null
        }
        Relationships: []
      }
      peer_review_requests: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          requester_id: string
          review_type: string
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          requester_id: string
          review_type?: string
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          requester_id?: string
          review_type?: string
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_review_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_review_sections: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          peer_review_id: string
          score: number | null
          section_type: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          peer_review_id: string
          score?: number | null
          section_type: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          peer_review_id?: string
          score?: number | null
          section_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_review_sections_peer_review_id_fkey"
            columns: ["peer_review_id"]
            isOneToOne: false
            referencedRelation: "peer_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_reviews: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean
          overall_score: number | null
          review_request_id: string
          reviewer_id: string
          summary_feedback: string | null
          visibility: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          overall_score?: number | null
          review_request_id: string
          reviewer_id: string
          summary_feedback?: string | null
          visibility?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean
          overall_score?: number | null
          review_request_id?: string
          reviewer_id?: string
          summary_feedback?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_reviews_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: false
            referencedRelation: "peer_review_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_audit_logs: {
        Row: {
          action_key: string
          action_type: string
          admin_id: string
          created_at: string
          id: string
          new_value: Json | null
          old_value: Json | null
          reason: string | null
          target_id: string | null
          target_table: string
        }
        Insert: {
          action_key: string
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          target_id?: string | null
          target_table: string
        }
        Update: {
          action_key?: string
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          target_id?: string | null
          target_table?: string
        }
        Relationships: []
      }
      permission_definitions: {
        Row: {
          action_key: string
          created_at: string
          description: string | null
          entity_type: string
          id: string
          is_stripe_related: boolean | null
        }
        Insert: {
          action_key: string
          created_at?: string
          description?: string | null
          entity_type: string
          id?: string
          is_stripe_related?: boolean | null
        }
        Update: {
          action_key?: string
          created_at?: string
          description?: string | null
          entity_type?: string
          id?: string
          is_stripe_related?: boolean | null
        }
        Relationships: []
      }
      pinned_messages: {
        Row: {
          created_at: string | null
          id: string
          is_global: boolean | null
          message_id: string
          pinned_by: string
          thread_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          message_id: string
          pinned_by: string
          thread_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          message_id?: string
          pinned_by?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_charters: {
        Row: {
          amendment_process: string | null
          charter_type: string
          content: string
          created_at: string
          effective_from: string
          id: string
          is_active: boolean | null
          ratification_threshold: number | null
          ratified_by: string[] | null
          rationale: string | null
          supersedes_id: string | null
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          amendment_process?: string | null
          charter_type: string
          content: string
          created_at?: string
          effective_from?: string
          id?: string
          is_active?: boolean | null
          ratification_threshold?: number | null
          ratified_by?: string[] | null
          rationale?: string | null
          supersedes_id?: string | null
          title: string
          updated_at?: string
          version: string
        }
        Update: {
          amendment_process?: string | null
          charter_type?: string
          content?: string
          created_at?: string
          effective_from?: string
          id?: string
          is_active?: boolean | null
          ratification_threshold?: number | null
          ratified_by?: string[] | null
          rationale?: string | null
          supersedes_id?: string | null
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_charters_supersedes_id_fkey"
            columns: ["supersedes_id"]
            isOneToOne: false
            referencedRelation: "platform_charters"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_evolution_proposals: {
        Row: {
          constitutional_implications: string | null
          created_at: string
          decided_at: string | null
          id: string
          impact_assessment: string | null
          proposal_text: string
          proposal_type: string
          proposed_by: string | null
          status: string | null
          stewardship_entity_id: string | null
          title: string
          votes_abstain: number | null
          votes_against: number | null
          votes_for: number | null
          voting_deadline: string | null
          voting_threshold_percentage: number | null
        }
        Insert: {
          constitutional_implications?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          impact_assessment?: string | null
          proposal_text: string
          proposal_type: string
          proposed_by?: string | null
          status?: string | null
          stewardship_entity_id?: string | null
          title: string
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
          voting_deadline?: string | null
          voting_threshold_percentage?: number | null
        }
        Update: {
          constitutional_implications?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          impact_assessment?: string | null
          proposal_text?: string
          proposal_type?: string
          proposed_by?: string | null
          status?: string | null
          stewardship_entity_id?: string | null
          title?: string
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
          voting_deadline?: string | null
          voting_threshold_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_evolution_proposals_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_evolution_proposals_stewardship_entity_id_fkey"
            columns: ["stewardship_entity_id"]
            isOneToOne: false
            referencedRelation: "stewardship_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_fee_rules: {
        Row: {
          created_at: string
          fee_percentage: number
          id: string
          is_active: boolean
          max_fee: number | null
          min_fee: number | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fee_percentage: number
          id?: string
          is_active?: boolean
          max_fee?: number | null
          min_fee?: number | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fee_percentage?: number
          id?: string
          is_active?: boolean
          max_fee?: number | null
          min_fee?: number | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_mission_registry: {
        Row: {
          adopted_at: string
          adopted_by_constitution_version: number | null
          core_principles: string[]
          id: string
          mission_statement: string
          non_negotiables: string[]
          superseded_at: string | null
          superseded_by_version: number | null
          version_number: number
        }
        Insert: {
          adopted_at?: string
          adopted_by_constitution_version?: number | null
          core_principles: string[]
          id?: string
          mission_statement: string
          non_negotiables: string[]
          superseded_at?: string | null
          superseded_by_version?: number | null
          version_number: number
        }
        Update: {
          adopted_at?: string
          adopted_by_constitution_version?: number | null
          core_principles?: string[]
          id?: string
          mission_statement?: string
          non_negotiables?: string[]
          superseded_at?: string | null
          superseded_by_version?: number | null
          version_number?: number
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acceptances: {
        Row: {
          accepted_at: string
          id: string
          ip_address: unknown
          policy_type: string
          policy_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          ip_address?: unknown
          policy_type: string
          policy_version: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          ip_address?: unknown
          policy_type?: string
          policy_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      policy_insight_flags: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_domains: string[] | null
          confidence_score: number | null
          created_at: string | null
          data_sources: Json | null
          detailed_analysis: Json | null
          expires_at: string | null
          generated_at: string | null
          id: string
          insight_type: string
          is_active: boolean | null
          recommendations: Json | null
          scope: string
          scope_id: string | null
          severity: string
          summary: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_domains?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: Json | null
          detailed_analysis?: Json | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insight_type: string
          is_active?: boolean | null
          recommendations?: Json | null
          scope: string
          scope_id?: string | null
          severity?: string
          summary: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_domains?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: Json | null
          detailed_analysis?: Json | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insight_type?: string
          is_active?: boolean | null
          recommendations?: Json | null
          scope?: string
          scope_id?: string | null
          severity?: string
          summary?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_insight_flags_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_translation_records: {
        Row: {
          created_at: string
          created_by: string
          evidence_strength: string
          id: string
          impact_pathway_id: string
          limitations: string | null
          plain_language_summary: string | null
          policy_area: string
          reviewed_by: string | null
          target_audience: string | null
          translation_summary: string
        }
        Insert: {
          created_at?: string
          created_by: string
          evidence_strength: string
          id?: string
          impact_pathway_id: string
          limitations?: string | null
          plain_language_summary?: string | null
          policy_area: string
          reviewed_by?: string | null
          target_audience?: string | null
          translation_summary: string
        }
        Update: {
          created_at?: string
          created_by?: string
          evidence_strength?: string
          id?: string
          impact_pathway_id?: string
          limitations?: string | null
          plain_language_summary?: string | null
          policy_area?: string
          reviewed_by?: string | null
          target_audience?: string | null
          translation_summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_translation_records_impact_pathway_id_fkey"
            columns: ["impact_pathway_id"]
            isOneToOne: false
            referencedRelation: "impact_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          link: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          link?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          link?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_edited: boolean
          is_hidden: boolean
          likes_count: number
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean
          is_hidden?: boolean
          likes_count?: number
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean
          is_hidden?: boolean
          likes_count?: number
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          created_at: string
          id: string
          post_id: string
          share_comment: string | null
          user_id: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          share_comment?: string | null
          user_id: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          share_comment?: string | null
          user_id?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          comments_count: number
          content: string
          created_at: string
          hidden_by: string | null
          hidden_reason: string | null
          id: string
          is_edited: boolean
          is_hidden: boolean
          likes_count: number
          linked_entity_id: string | null
          linked_entity_type: string | null
          media_urls: string[] | null
          mentioned_users: string[] | null
          organization_id: string | null
          post_type: Database["public"]["Enums"]["post_type"]
          shares_count: number
          tags: string[] | null
          updated_at: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          author_id: string
          comments_count?: number
          content: string
          created_at?: string
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          is_edited?: boolean
          is_hidden?: boolean
          likes_count?: number
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          media_urls?: string[] | null
          mentioned_users?: string[] | null
          organization_id?: string | null
          post_type?: Database["public"]["Enums"]["post_type"]
          shares_count?: number
          tags?: string[] | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          author_id?: string
          comments_count?: number
          content?: string
          created_at?: string
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          is_edited?: boolean
          is_hidden?: boolean
          likes_count?: number
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          media_urls?: string[] | null
          mentioned_users?: string[] | null
          organization_id?: string | null
          post_type?: Database["public"]["Enums"]["post_type"]
          shares_count?: number
          tags?: string[] | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_markets: {
        Row: {
          created_at: string
          created_by: string | null
          current_liquidity: number | null
          description: string | null
          id: string
          initial_liquidity: number | null
          market_type: string
          metadata: Json | null
          outcomes: Json
          project_id: string | null
          question: string
          resolution_criteria: string | null
          resolution_date: string | null
          resolved_at: string | null
          resolved_outcome: string | null
          resolver_id: string | null
          status: Database["public"]["Enums"]["prediction_market_status"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_liquidity?: number | null
          description?: string | null
          id?: string
          initial_liquidity?: number | null
          market_type?: string
          metadata?: Json | null
          outcomes?: Json
          project_id?: string | null
          question: string
          resolution_criteria?: string | null
          resolution_date?: string | null
          resolved_at?: string | null
          resolved_outcome?: string | null
          resolver_id?: string | null
          status?: Database["public"]["Enums"]["prediction_market_status"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_liquidity?: number | null
          description?: string | null
          id?: string
          initial_liquidity?: number | null
          market_type?: string
          metadata?: Json | null
          outcomes?: Json
          project_id?: string | null
          question?: string
          resolution_criteria?: string | null
          resolution_date?: string | null
          resolved_at?: string | null
          resolved_outcome?: string | null
          resolver_id?: string | null
          status?: Database["public"]["Enums"]["prediction_market_status"]
        }
        Relationships: [
          {
            foreignKeyName: "prediction_markets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_markets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_markets_resolver_id_fkey"
            columns: ["resolver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_positions: {
        Row: {
          average_price: number
          created_at: string
          id: string
          market_id: string
          outcome_id: string
          realized_pnl: number | null
          shares: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_price: number
          created_at?: string
          id?: string
          market_id: string
          outcome_id: string
          realized_pnl?: number | null
          shares?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_price?: number
          created_at?: string
          id?: string
          market_id?: string
          outcome_id?: string
          realized_pnl?: number | null
          shares?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_positions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_positions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_trades: {
        Row: {
          created_at: string
          id: string
          market_id: string
          outcome_id: string
          price: number
          shares: number
          total_cost: number
          trade_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_id: string
          outcome_id: string
          price: number
          shares: number
          total_cost: number
          trade_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          market_id?: string
          outcome_id?: string
          price?: number
          shares?: number
          total_cost?: number
          trade_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_trades_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preservation_audit_logs: {
        Row: {
          action_type: string
          archival_object_id: string
          details: Json | null
          id: string
          performed_at: string
          performed_by: string | null
        }
        Insert: {
          action_type: string
          archival_object_id: string
          details?: Json | null
          id?: string
          performed_at?: string
          performed_by?: string | null
        }
        Update: {
          action_type?: string
          archival_object_id?: string
          details?: Json | null
          id?: string
          performed_at?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preservation_audit_logs_archival_object_id_fkey"
            columns: ["archival_object_id"]
            isOneToOne: false
            referencedRelation: "archival_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_models: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          last_reviewed_at: string | null
          pricing_rules: Json
          pricing_type: string
          revenue_stream_id: string | null
          review_cycle_months: number | null
          reviewed_by: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          last_reviewed_at?: string | null
          pricing_rules?: Json
          pricing_type: string
          revenue_stream_id?: string | null
          review_cycle_months?: number | null
          reviewed_by?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          last_reviewed_at?: string | null
          pricing_rules?: Json
          pricing_type?: string
          revenue_stream_id?: string | null
          review_cycle_months?: number | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_models_revenue_stream_id_fkey"
            columns: ["revenue_stream_id"]
            isOneToOne: false
            referencedRelation: "revenue_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_models_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_snapshots: {
        Row: {
          category: string
          confidence_level: number | null
          created_at: string
          id: string
          max_price: number | null
          median_price: number | null
          metadata: Json | null
          min_price: number | null
          region: string | null
          sample_size: number | null
          snapshot_date: string
          subcategory: string | null
          trust_weighted_avg: number | null
        }
        Insert: {
          category: string
          confidence_level?: number | null
          created_at?: string
          id?: string
          max_price?: number | null
          median_price?: number | null
          metadata?: Json | null
          min_price?: number | null
          region?: string | null
          sample_size?: number | null
          snapshot_date: string
          subcategory?: string | null
          trust_weighted_avg?: number | null
        }
        Update: {
          category?: string
          confidence_level?: number | null
          created_at?: string
          id?: string
          max_price?: number | null
          median_price?: number | null
          metadata?: Json | null
          min_price?: number | null
          region?: string | null
          sample_size?: number | null
          snapshot_date?: string
          subcategory?: string | null
          trust_weighted_avg?: number | null
        }
        Relationships: []
      }
      profile_analytics: {
        Row: {
          connection_requests_received: number
          endorsements_received: number
          id: string
          post_impressions: number
          profile_views: number
          publication_views: number
          search_appearances: number
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_requests_received?: number
          endorsements_received?: number
          id?: string
          post_impressions?: number
          profile_views?: number
          publication_views?: number
          search_appearances?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_requests_received?: number
          endorsements_received?: number
          id?: string
          post_impressions?: number
          profile_views?: number
          publication_views?: number
          search_appearances?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_causes: {
        Row: {
          cause_name: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          cause_name: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          cause_name?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_causes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_certifications: {
        Row: {
          created_at: string | null
          credential_id: string | null
          credential_url: string | null
          expiration_date: string | null
          id: string
          issue_date: string | null
          issuing_body: string
          name: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          credential_id?: string | null
          credential_url?: string | null
          expiration_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_body: string
          name: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          credential_id?: string | null
          credential_url?: string | null
          expiration_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_body?: string
          name?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_education: {
        Row: {
          activities: string | null
          created_at: string | null
          degree: string
          description: string | null
          end_year: number | null
          field_of_study: string | null
          grade_or_gpa: string | null
          id: string
          institution_id: string | null
          institution_name: string
          start_year: number | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          activities?: string | null
          created_at?: string | null
          degree: string
          description?: string | null
          end_year?: number | null
          field_of_study?: string | null
          grade_or_gpa?: string | null
          id?: string
          institution_id?: string | null
          institution_name: string
          start_year?: number | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          activities?: string | null
          created_at?: string | null
          degree?: string
          description?: string | null
          end_year?: number | null
          field_of_study?: string | null
          grade_or_gpa?: string | null
          id?: string
          institution_id?: string | null
          institution_name?: string
          start_year?: number | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_education_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_education_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_experiences: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          experience_type: string
          id: string
          is_current: boolean | null
          organization_id: string | null
          organization_name: string
          role_title: string
          start_date: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          experience_type?: string
          id?: string
          is_current?: boolean | null
          organization_id?: string | null
          organization_name: string
          role_title: string
          start_date: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          experience_type?: string
          id?: string
          is_current?: boolean | null
          organization_id?: string | null
          organization_name?: string
          role_title?: string
          start_date?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_experiences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_headers: {
        Row: {
          cover_image_url: string | null
          google_scholar_url: string | null
          headline: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          open_to_collaboration: boolean | null
          orcid_id: string | null
          summary_bio: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          cover_image_url?: string | null
          google_scholar_url?: string | null
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          open_to_collaboration?: boolean | null
          orcid_id?: string | null
          summary_bio?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          cover_image_url?: string | null
          google_scholar_url?: string | null
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          open_to_collaboration?: boolean | null
          orcid_id?: string | null
          summary_bio?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_headers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_languages: {
        Row: {
          created_at: string | null
          id: string
          language: string
          proficiency: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language: string
          proficiency: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string
          proficiency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_languages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_proof_metrics: {
        Row: {
          computed_at: string
          dispute_loss_count: number | null
          earnings_visibility: string | null
          escrow_success_rate: number | null
          grants_won: number | null
          id: string
          institutions_worked_with: string[] | null
          last_activity_at: string | null
          peer_reviews_received: number | null
          projects_completed: number | null
          total_earnings: number | null
          user_id: string
          verification_count: number | null
        }
        Insert: {
          computed_at?: string
          dispute_loss_count?: number | null
          earnings_visibility?: string | null
          escrow_success_rate?: number | null
          grants_won?: number | null
          id?: string
          institutions_worked_with?: string[] | null
          last_activity_at?: string | null
          peer_reviews_received?: number | null
          projects_completed?: number | null
          total_earnings?: number | null
          user_id: string
          verification_count?: number | null
        }
        Update: {
          computed_at?: string
          dispute_loss_count?: number | null
          earnings_visibility?: string | null
          escrow_success_rate?: number | null
          grants_won?: number | null
          id?: string
          institutions_worked_with?: string[] | null
          last_activity_at?: string | null
          peer_reviews_received?: number | null
          projects_completed?: number | null
          total_earnings?: number | null
          user_id?: string
          verification_count?: number | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          viewed_user_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          viewed_user_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          viewed_user_id?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_viewed_user_id_fkey"
            columns: ["viewed_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_volunteering: {
        Row: {
          cause: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          organization: string
          role: string
          start_date: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          cause?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization: string
          role: string
          start_date?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          cause?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization?: string
          role?: string
          start_date?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_volunteering_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          audio_bio_duration_seconds: number | null
          audio_bio_path: string | null
          audio_bio_transcript: string | null
          created_at: string
          department: string | null
          education_level: string | null
          first_name: string | null
          full_name: string | null
          id: string
          interests: string[] | null
          last_name: string | null
          location: string | null
          onboarding_completed: boolean | null
          research_level: string | null
          role: string | null
          skills: string[] | null
          university: string | null
          updated_at: string
        }
        Insert: {
          audio_bio_duration_seconds?: number | null
          audio_bio_path?: string | null
          audio_bio_transcript?: string | null
          created_at?: string
          department?: string | null
          education_level?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          last_name?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          research_level?: string | null
          role?: string | null
          skills?: string[] | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          audio_bio_duration_seconds?: number | null
          audio_bio_path?: string | null
          audio_bio_transcript?: string | null
          created_at?: string
          department?: string | null
          education_level?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          last_name?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          research_level?: string | null
          role?: string | null
          skills?: string[] | null
          university?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_analytics: {
        Row: {
          avg_bid_amount: number | null
          bids_count: number
          completion_rate: number | null
          conversion_rate: number | null
          id: string
          project_id: string
          updated_at: string
          views: number
        }
        Insert: {
          avg_bid_amount?: number | null
          bids_count?: number
          completion_rate?: number | null
          conversion_rate?: number | null
          id?: string
          project_id: string
          updated_at?: string
          views?: number
        }
        Update: {
          avg_bid_amount?: number | null
          bids_count?: number
          completion_rate?: number | null
          conversion_rate?: number | null
          id?: string
          project_id?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      project_reviews: {
        Row: {
          comment: string | null
          communication_rating: number
          created_at: string
          id: string
          is_visible: boolean
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string
          offer_id: string
          overall_rating: number
          quality_rating: number
          reviewee_id: string
          reviewer_id: string
          timeliness_rating: number
          updated_at: string
          visibility_unlocked_at: string | null
        }
        Insert: {
          comment?: string | null
          communication_rating: number
          created_at?: string
          id?: string
          is_visible?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string
          offer_id: string
          overall_rating: number
          quality_rating: number
          reviewee_id: string
          reviewer_id: string
          timeliness_rating: number
          updated_at?: string
          visibility_unlocked_at?: string | null
        }
        Update: {
          comment?: string | null
          communication_rating?: number
          created_at?: string
          id?: string
          is_visible?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string
          offer_id?: string
          overall_rating?: number
          quality_rating?: number
          reviewee_id?: string
          reviewer_id?: string
          timeliness_rating?: number
          updated_at?: string
          visibility_unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_reviews_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      project_thresholds: {
        Row: {
          applies_to: string
          created_at: string
          id: string
          is_active: boolean
          rationale: string | null
          threshold_type: string
          threshold_value: number
          trust_level_required: number | null
        }
        Insert: {
          applies_to?: string
          created_at?: string
          id?: string
          is_active?: boolean
          rationale?: string | null
          threshold_type: string
          threshold_value: number
          trust_level_required?: number | null
        }
        Update: {
          applies_to?: string
          created_at?: string
          id?: string
          is_active?: boolean
          rationale?: string | null
          threshold_type?: string
          threshold_value?: number
          trust_level_required?: number | null
        }
        Relationships: []
      }
      public_accountability_reports: {
        Row: {
          access_statistics: Json | null
          approved_by: string | null
          country_code: string
          created_at: string
          funding_flow_summary: Json | null
          governance_activity: Json | null
          id: string
          published_at: string | null
          reporting_period_end: string
          reporting_period_start: string
          research_output_summary: Json | null
        }
        Insert: {
          access_statistics?: Json | null
          approved_by?: string | null
          country_code: string
          created_at?: string
          funding_flow_summary?: Json | null
          governance_activity?: Json | null
          id?: string
          published_at?: string | null
          reporting_period_end: string
          reporting_period_start: string
          research_output_summary?: Json | null
        }
        Update: {
          access_statistics?: Json | null
          approved_by?: string | null
          country_code?: string
          created_at?: string
          funding_flow_summary?: Json | null
          governance_activity?: Json | null
          id?: string
          published_at?: string | null
          reporting_period_end?: string
          reporting_period_start?: string
          research_output_summary?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "public_accountability_reports_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_authors: {
        Row: {
          affiliation: string | null
          author_name: string
          author_order: number
          created_at: string | null
          id: string
          is_corresponding_author: boolean | null
          publication_id: string
          user_id: string | null
        }
        Insert: {
          affiliation?: string | null
          author_name: string
          author_order?: number
          created_at?: string | null
          id?: string
          is_corresponding_author?: boolean | null
          publication_id: string
          user_id?: string | null
        }
        Update: {
          affiliation?: string | null
          author_name?: string
          author_order?: number
          created_at?: string | null
          id?: string
          is_corresponding_author?: boolean | null
          publication_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_authors_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_authors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_claims: {
        Row: {
          claimant_user_id: string
          created_at: string | null
          id: string
          publication_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          claimant_user_id: string
          created_at?: string | null
          id?: string
          publication_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          claimant_user_id?: string
          created_at?: string | null
          id?: string
          publication_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_claims_claimant_user_id_fkey"
            columns: ["claimant_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_claims_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_claims_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_metrics: {
        Row: {
          citation_count: number | null
          downloads_count: number | null
          last_updated_at: string | null
          publication_id: string
          shares_count: number | null
          views_count: number | null
        }
        Insert: {
          citation_count?: number | null
          downloads_count?: number | null
          last_updated_at?: string | null
          publication_id: string
          shares_count?: number | null
          views_count?: number | null
        }
        Update: {
          citation_count?: number | null
          downloads_count?: number | null
          last_updated_at?: string | null
          publication_id?: string
          shares_count?: number | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_metrics_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: true
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_verifications: {
        Row: {
          id: string
          notes: string | null
          publication_id: string
          verification_source: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          publication_id: string
          verification_source: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          publication_id?: string
          verification_source?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_verifications_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          abstract: string | null
          created_at: string | null
          doi: string | null
          external_url: string | null
          id: string
          is_featured: boolean | null
          journal_or_venue: string | null
          pdf_url: string | null
          publication_date: string | null
          publication_type: string
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          abstract?: string | null
          created_at?: string | null
          doi?: string | null
          external_url?: string | null
          id?: string
          is_featured?: boolean | null
          journal_or_venue?: string | null
          pdf_url?: string | null
          publication_date?: string | null
          publication_type: string
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          abstract?: string | null
          created_at?: string | null
          doi?: string | null
          external_url?: string | null
          id?: string
          is_featured?: boolean | null
          journal_or_venue?: string | null
          pdf_url?: string | null
          publication_date?: string | null
          publication_type?: string
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      query_execution_logs: {
        Row: {
          executed_at: string
          executed_by: string
          execution_time_ms: number | null
          filters_applied: Json | null
          id: string
          query_id: string | null
          query_text: string
          ranking_factors: Json | null
          result_count: number | null
        }
        Insert: {
          executed_at?: string
          executed_by: string
          execution_time_ms?: number | null
          filters_applied?: Json | null
          id?: string
          query_id?: string | null
          query_text: string
          ranking_factors?: Json | null
          result_count?: number | null
        }
        Update: {
          executed_at?: string
          executed_by?: string
          execution_time_ms?: number | null
          filters_applied?: Json | null
          id?: string
          query_id?: string | null
          query_text?: string
          ranking_factors?: Json | null
          result_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "query_execution_logs_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_execution_logs_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "semantic_queries"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action_type: string
          created_at: string
          id: string
          is_active: boolean
          max_per_day: number
          max_per_hour: number
          role: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_per_day: number
          max_per_hour: number
          role: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_per_day?: number
          max_per_hour?: number
          role?: string
        }
        Relationships: []
      }
      reality_feed_events: {
        Row: {
          amount_involved: number | null
          created_at: string | null
          currency: string | null
          event_type: string
          id: string
          is_verified: boolean | null
          primary_actor_id: string
          primary_actor_type: string | null
          reference_id: string | null
          reference_type: string | null
          secondary_actor_id: string | null
          summary: string | null
          title: string
          trust_impact: number | null
          verified_by: string | null
          visibility: string | null
        }
        Insert: {
          amount_involved?: number | null
          created_at?: string | null
          currency?: string | null
          event_type: string
          id?: string
          is_verified?: boolean | null
          primary_actor_id: string
          primary_actor_type?: string | null
          reference_id?: string | null
          reference_type?: string | null
          secondary_actor_id?: string | null
          summary?: string | null
          title: string
          trust_impact?: number | null
          verified_by?: string | null
          visibility?: string | null
        }
        Update: {
          amount_involved?: number | null
          created_at?: string | null
          currency?: string | null
          event_type?: string
          id?: string
          is_verified?: boolean | null
          primary_actor_id?: string
          primary_actor_type?: string | null
          reference_id?: string | null
          reference_type?: string | null
          secondary_actor_id?: string | null
          summary?: string | null
          title?: string
          trust_impact?: number | null
          verified_by?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      recommendation_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          requester_id: string
          status: string | null
          target_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          requester_id: string
          status?: string | null
          target_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          requester_id?: string
          status?: string | null
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_requests_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          content: string
          context_id: string | null
          context_type: string
          created_at: string
          id: string
          recommended_user_id: string
          recommender_id: string
          status: string | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          content: string
          context_id?: string | null
          context_type?: string
          created_at?: string
          id?: string
          recommended_user_id: string
          recommender_id: string
          status?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          content?: string
          context_id?: string | null
          context_type?: string
          created_at?: string
          id?: string
          recommended_user_id?: string
          recommender_id?: string
          status?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_recommended_user_id_fkey"
            columns: ["recommended_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_recommender_id_fkey"
            columns: ["recommender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_governance: {
        Row: {
          autonomy_level: string
          created_at: string
          cultural_adaptations: Json | null
          governance_council_id: string | null
          id: string
          language_requirements: string[] | null
          local_policies: Json | null
          region_code: string
          region_name: string
          regulatory_compliance: Json | null
          reports_to_global: boolean | null
          updated_at: string
        }
        Insert: {
          autonomy_level: string
          created_at?: string
          cultural_adaptations?: Json | null
          governance_council_id?: string | null
          id?: string
          language_requirements?: string[] | null
          local_policies?: Json | null
          region_code: string
          region_name: string
          regulatory_compliance?: Json | null
          reports_to_global?: boolean | null
          updated_at?: string
        }
        Update: {
          autonomy_level?: string
          created_at?: string
          cultural_adaptations?: Json | null
          governance_council_id?: string | null
          id?: string
          language_requirements?: string[] | null
          local_policies?: Json | null
          region_code?: string
          region_name?: string
          regulatory_compliance?: Json | null
          reports_to_global?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regional_governance_governance_council_id_fkey"
            columns: ["governance_council_id"]
            isOneToOne: false
            referencedRelation: "governance_councils"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_entropy: {
        Row: {
          calculated_at: string
          connection_id: string
          days_since_interaction: number | null
          entropy_score: number
          id: string
          interaction_frequency: number | null
          interaction_trend: string | null
          last_interaction_at: string | null
          relationship_value: number | null
          suggested_action: string | null
          user_id: string
        }
        Insert: {
          calculated_at?: string
          connection_id: string
          days_since_interaction?: number | null
          entropy_score: number
          id?: string
          interaction_frequency?: number | null
          interaction_trend?: string | null
          last_interaction_at?: string | null
          relationship_value?: number | null
          suggested_action?: string | null
          user_id: string
        }
        Update: {
          calculated_at?: string
          connection_id?: string
          days_since_interaction?: number | null
          entropy_score?: number
          id?: string
          interaction_frequency?: number | null
          interaction_trend?: string | null
          last_interaction_at?: string | null
          relationship_value?: number | null
          suggested_action?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_entropy_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_entropy_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reported_posts: {
        Row: {
          comment_id: string | null
          created_at: string
          details: string | null
          id: string
          post_id: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string | null
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reported_posts_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reported_posts_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          message_id: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at: string | null
          status: string
          thread_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          message_id?: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at?: string | null
          status?: string
          thread_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          message_id?: string | null
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: string
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      reproducibility_claims: {
        Row: {
          artifact_id: string
          claim_level: string | null
          claim_type: string
          environment_specification: Json | null
          estimated_cost: string | null
          estimated_reproduction_time: string | null
          id: string
          limitations: string | null
          requirements: Json | null
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string | null
          submitted_by: string
        }
        Insert: {
          artifact_id: string
          claim_level?: string | null
          claim_type: string
          environment_specification?: Json | null
          estimated_cost?: string | null
          estimated_reproduction_time?: string | null
          id?: string
          limitations?: string | null
          requirements?: Json | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string | null
          submitted_by: string
        }
        Update: {
          artifact_id?: string
          claim_level?: string | null
          claim_type?: string
          environment_specification?: Json | null
          estimated_cost?: string | null
          estimated_reproduction_time?: string | null
          id?: string
          limitations?: string | null
          requirements?: Json | null
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string | null
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "reproducibility_claims_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reproducibility_claims_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reproducibility_records: {
        Row: {
          code_available: boolean | null
          created_at: string
          data_available: boolean | null
          environment_specified: boolean | null
          id: string
          methodology_documented: boolean | null
          reproduced_by: string | null
          reproducibility_level: string
          reproduction_notes: string | null
          target_id: string
          target_type: string
          updated_at: string
          verification_date: string | null
        }
        Insert: {
          code_available?: boolean | null
          created_at?: string
          data_available?: boolean | null
          environment_specified?: boolean | null
          id?: string
          methodology_documented?: boolean | null
          reproduced_by?: string | null
          reproducibility_level?: string
          reproduction_notes?: string | null
          target_id: string
          target_type: string
          updated_at?: string
          verification_date?: string | null
        }
        Update: {
          code_available?: boolean | null
          created_at?: string
          data_available?: boolean | null
          environment_specified?: boolean | null
          id?: string
          methodology_documented?: boolean | null
          reproduced_by?: string | null
          reproducibility_level?: string
          reproduction_notes?: string | null
          target_id?: string
          target_type?: string
          updated_at?: string
          verification_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reproducibility_records_reproduced_by_fkey"
            columns: ["reproduced_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      research_artifacts: {
        Row: {
          artifact_type: string
          created_at: string
          file_name: string | null
          file_size_bytes: number | null
          file_url: string
          id: string
          related_entry_id: string | null
          research_timeline_id: string
          uploaded_by: string
        }
        Insert: {
          artifact_type: string
          created_at?: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_url: string
          id?: string
          related_entry_id?: string | null
          research_timeline_id: string
          uploaded_by: string
        }
        Update: {
          artifact_type?: string
          created_at?: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          related_entry_id?: string | null
          research_timeline_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_artifacts_related_entry_id_fkey"
            columns: ["related_entry_id"]
            isOneToOne: false
            referencedRelation: "research_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_artifacts_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_artifacts_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      research_collaborators: {
        Row: {
          added_at: string
          id: string
          research_timeline_id: string
          role: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          research_timeline_id: string
          role?: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          research_timeline_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_collaborators_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      research_compliance_tracker: {
        Row: {
          compliance_issues: Json | null
          consent_coverage_percent: number | null
          data_sensitivity_level: string | null
          ethics_approved: boolean | null
          id: string
          last_compliance_check: string | null
          protocol_id: string | null
          research_timeline_id: string
          updated_at: string
        }
        Insert: {
          compliance_issues?: Json | null
          consent_coverage_percent?: number | null
          data_sensitivity_level?: string | null
          ethics_approved?: boolean | null
          id?: string
          last_compliance_check?: string | null
          protocol_id?: string | null
          research_timeline_id: string
          updated_at?: string
        }
        Update: {
          compliance_issues?: Json | null
          consent_coverage_percent?: number | null
          data_sensitivity_level?: string | null
          ethics_approved?: boolean | null
          id?: string
          last_compliance_check?: string | null
          protocol_id?: string | null
          research_timeline_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_compliance_tracker_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "research_ethics_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_compliance_tracker_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: true
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      research_consent_records: {
        Row: {
          consent_method: string | null
          consent_text_version: string
          consent_type: string
          created_at: string
          expires_at: string | null
          id: string
          obtained_at: string
          participant_identifier: string
          protocol_id: string
          scope_limitations: Json | null
          withdrawn_at: string | null
        }
        Insert: {
          consent_method?: string | null
          consent_text_version: string
          consent_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          obtained_at: string
          participant_identifier: string
          protocol_id: string
          scope_limitations?: Json | null
          withdrawn_at?: string | null
        }
        Update: {
          consent_method?: string | null
          consent_text_version?: string
          consent_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          obtained_at?: string
          participant_identifier?: string
          protocol_id?: string
          scope_limitations?: Json | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_consent_records_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "research_ethics_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      research_data_sensitivity: {
        Row: {
          access_restrictions: string | null
          flagged_at: string
          flagged_by: string | null
          handling_requirements: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          sensitivity_type: string
          target_id: string
          target_type: string
        }
        Insert: {
          access_restrictions?: string | null
          flagged_at?: string
          flagged_by?: string | null
          handling_requirements?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sensitivity_type: string
          target_id: string
          target_type: string
        }
        Update: {
          access_restrictions?: string | null
          flagged_at?: string
          flagged_by?: string | null
          handling_requirements?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sensitivity_type?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_data_sensitivity_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_data_sensitivity_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      research_datasets: {
        Row: {
          access_level: string
          consent_type: string | null
          created_at: string
          dataset_type: string
          description: string | null
          doi: string | null
          embargo_until: string | null
          ethical_approval_ref: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          license: string | null
          methodology_summary: string | null
          owner_user_id: string
          research_timeline_id: string | null
          size_mb: number | null
          storage_location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          consent_type?: string | null
          created_at?: string
          dataset_type: string
          description?: string | null
          doi?: string | null
          embargo_until?: string | null
          ethical_approval_ref?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          license?: string | null
          methodology_summary?: string | null
          owner_user_id: string
          research_timeline_id?: string | null
          size_mb?: number | null
          storage_location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          consent_type?: string | null
          created_at?: string
          dataset_type?: string
          description?: string | null
          doi?: string | null
          embargo_until?: string | null
          ethical_approval_ref?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          license?: string | null
          methodology_summary?: string | null
          owner_user_id?: string
          research_timeline_id?: string | null
          size_mb?: number | null
          storage_location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_datasets_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_datasets_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      research_domain_registry: {
        Row: {
          created_at: string | null
          description: string | null
          domain_code: string
          domain_name: string
          id: string
          is_interdisciplinary: boolean | null
          parent_domain_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain_code: string
          domain_name: string
          id?: string
          is_interdisciplinary?: boolean | null
          parent_domain_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain_code?: string
          domain_name?: string
          id?: string
          is_interdisciplinary?: boolean | null
          parent_domain_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_domain_registry_parent_domain_id_fkey"
            columns: ["parent_domain_id"]
            isOneToOne: false
            referencedRelation: "research_domain_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      research_entries: {
        Row: {
          content: string | null
          created_at: string
          created_by: string
          entry_type: string
          id: string
          research_timeline_id: string
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by: string
          entry_type: string
          id?: string
          research_timeline_id: string
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string
          entry_type?: string
          id?: string
          research_timeline_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_entries_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      research_ethics_audit: {
        Row: {
          action_details: Json | null
          action_type: string
          id: string
          ip_address: string | null
          performed_at: string
          performed_by: string | null
          protocol_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          id?: string
          ip_address?: string | null
          performed_at?: string
          performed_by?: string | null
          protocol_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          id?: string
          ip_address?: string | null
          performed_at?: string
          performed_by?: string | null
          protocol_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_ethics_audit_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_ethics_audit_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "research_ethics_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      research_ethics_decisions: {
        Row: {
          conditions: string | null
          decision: string
          feedback: string | null
          id: string
          protocol_id: string
          reviewed_at: string
          reviewer_id: string
          reviewer_role: string
        }
        Insert: {
          conditions?: string | null
          decision: string
          feedback?: string | null
          id?: string
          protocol_id: string
          reviewed_at?: string
          reviewer_id: string
          reviewer_role: string
        }
        Update: {
          conditions?: string | null
          decision?: string
          feedback?: string | null
          id?: string
          protocol_id?: string
          reviewed_at?: string
          reviewer_id?: string
          reviewer_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_ethics_decisions_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "research_ethics_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_ethics_decisions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      research_ethics_protocols: {
        Row: {
          approved_at: string | null
          created_at: string
          created_by: string
          data_handling_plan: string | null
          ethics_scope: string
          expires_at: string | null
          id: string
          participant_protection_measures: string | null
          requires_review: boolean | null
          research_timeline_id: string | null
          risk_level: string
          status: string
          summary: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          created_by: string
          data_handling_plan?: string | null
          ethics_scope: string
          expires_at?: string | null
          id?: string
          participant_protection_measures?: string | null
          requires_review?: boolean | null
          research_timeline_id?: string | null
          risk_level?: string
          status?: string
          summary: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          created_by?: string
          data_handling_plan?: string | null
          ethics_scope?: string
          expires_at?: string | null
          id?: string
          participant_protection_measures?: string | null
          requires_review?: boolean | null
          research_timeline_id?: string | null
          risk_level?: string
          status?: string
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_ethics_protocols_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_ethics_protocols_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      research_lineage: {
        Row: {
          contributions: string | null
          created_at: string
          ended_at: string | null
          field_of_study: string | null
          id: string
          institution_id: string | null
          mentor_id: string | null
          relationship_type: string
          researcher_id: string
          started_at: string | null
          verified: boolean | null
          verified_by: string | null
        }
        Insert: {
          contributions?: string | null
          created_at?: string
          ended_at?: string | null
          field_of_study?: string | null
          id?: string
          institution_id?: string | null
          mentor_id?: string | null
          relationship_type: string
          researcher_id: string
          started_at?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Update: {
          contributions?: string | null
          created_at?: string
          ended_at?: string | null
          field_of_study?: string | null
          id?: string
          institution_id?: string | null
          mentor_id?: string | null
          relationship_type?: string
          researcher_id?: string
          started_at?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_lineage_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      research_mobility_requests: {
        Row: {
          applicant_scholar_passport_id: string
          created_at: string
          funding_details: Json | null
          funding_source: string | null
          home_institution_id: string | null
          host_institution_id: string
          id: string
          mobility_type: string
          proposed_end_date: string
          proposed_start_date: string
          purpose_statement: string | null
          research_timeline_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_scholar_passport_id: string
          created_at?: string
          funding_details?: Json | null
          funding_source?: string | null
          home_institution_id?: string | null
          host_institution_id: string
          id?: string
          mobility_type: string
          proposed_end_date: string
          proposed_start_date: string
          purpose_statement?: string | null
          research_timeline_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_scholar_passport_id?: string
          created_at?: string
          funding_details?: Json | null
          funding_source?: string | null
          home_institution_id?: string | null
          host_institution_id?: string
          id?: string
          mobility_type?: string
          proposed_end_date?: string
          proposed_start_date?: string
          purpose_statement?: string | null
          research_timeline_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_mobility_requests_applicant_scholar_passport_id_fkey"
            columns: ["applicant_scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_mobility_requests_home_institution_id_fkey"
            columns: ["home_institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_mobility_requests_host_institution_id_fkey"
            columns: ["host_institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_mobility_requests_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      research_timelines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          owner_user_id: string
          research_domain: string | null
          status: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          owner_user_id: string
          research_domain?: string | null
          status?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          owner_user_id?: string
          research_domain?: string | null
          status?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_timelines_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      research_trend_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_summary: string
          alert_type: string
          created_at: string
          id: string
          target_audience: string
          target_id: string | null
          trend_output_id: string | null
          urgency: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          alert_summary: string
          alert_type: string
          created_at?: string
          id?: string
          target_audience: string
          target_id?: string | null
          trend_output_id?: string | null
          urgency?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          alert_summary?: string
          alert_type?: string
          created_at?: string
          id?: string
          target_audience?: string
          target_id?: string | null
          trend_output_id?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_trend_alerts_trend_output_id_fkey"
            columns: ["trend_output_id"]
            isOneToOne: false
            referencedRelation: "trend_outputs"
            referencedColumns: ["id"]
          },
        ]
      }
      research_versions: {
        Row: {
          change_summary: string | null
          content_snapshot: string
          created_at: string
          created_by: string
          id: string
          research_entry_id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          content_snapshot: string
          created_at?: string
          created_by: string
          id?: string
          research_entry_id: string
          version_number?: number
        }
        Update: {
          change_summary?: string | null
          content_snapshot?: string
          created_at?: string
          created_by?: string
          id?: string
          research_entry_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "research_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_versions_research_entry_id_fkey"
            columns: ["research_entry_id"]
            isOneToOne: false
            referencedRelation: "research_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      researcher_protection_events: {
        Row: {
          id: string
          logged_at: string
          logged_by: string | null
          resolved_at: string | null
          response_action: string | null
          scholar_passport_id: string | null
          severity: string | null
          source_context: string | null
          status: string | null
          threat_type: string
        }
        Insert: {
          id?: string
          logged_at?: string
          logged_by?: string | null
          resolved_at?: string | null
          response_action?: string | null
          scholar_passport_id?: string | null
          severity?: string | null
          source_context?: string | null
          status?: string | null
          threat_type: string
        }
        Update: {
          id?: string
          logged_at?: string
          logged_by?: string | null
          resolved_at?: string | null
          response_action?: string | null
          scholar_passport_id?: string | null
          severity?: string | null
          source_context?: string | null
          status?: string | null
          threat_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "researcher_protection_events_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "researcher_protection_events_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_shares: {
        Row: {
          beneficiary_id: string | null
          beneficiary_org_id: string | null
          created_at: string
          effective_from: string
          effective_until: string | null
          id: string
          is_active: boolean | null
          share_percentage: number
          share_type: string
          source_entity_id: string
          source_entity_type: string
          updated_at: string
        }
        Insert: {
          beneficiary_id?: string | null
          beneficiary_org_id?: string | null
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean | null
          share_percentage: number
          share_type: string
          source_entity_id: string
          source_entity_type: string
          updated_at?: string
        }
        Update: {
          beneficiary_id?: string | null
          beneficiary_org_id?: string | null
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean | null
          share_percentage?: number
          share_type?: string
          source_entity_id?: string
          source_entity_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_shares_beneficiary_org_id_fkey"
            columns: ["beneficiary_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_streams: {
        Row: {
          created_at: string
          description: string | null
          governed_by: string | null
          id: string
          is_active: boolean | null
          name: string
          stream_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          governed_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          stream_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          governed_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          stream_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_streams_governed_by_fkey"
            columns: ["governed_by"]
            isOneToOne: false
            referencedRelation: "governance_councils"
            referencedColumns: ["id"]
          },
        ]
      }
      review_unlock_queue: {
        Row: {
          created_at: string
          id: string
          offer_id: string
          review_a_submitted: boolean
          review_b_submitted: boolean
          reviewer_a_id: string
          reviewer_b_id: string
          unlock_deadline: string
          unlocked_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          offer_id: string
          review_a_submitted?: boolean
          review_b_submitted?: boolean
          reviewer_a_id: string
          reviewer_b_id: string
          unlock_deadline?: string
          unlocked_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          offer_id?: string
          review_a_submitted?: boolean
          review_b_submitted?: boolean
          reviewer_a_id?: string
          reviewer_b_id?: string
          unlock_deadline?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_unlock_queue_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: true
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      reviewer_profiles: {
        Row: {
          avg_review_quality_score: number | null
          last_review_at: string | null
          reviews_given: number
          specialization_areas: string[] | null
          total_review_words: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_review_quality_score?: number | null
          last_review_at?: string | null
          reviews_given?: number
          specialization_areas?: string[] | null
          total_review_words?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_review_quality_score?: number | null
          last_review_at?: string | null
          reviews_given?: number
          specialization_areas?: string[] | null
          total_review_words?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviewer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rls_audit_checklist: {
        Row: {
          admin_access_tested: boolean | null
          audited_by: string | null
          blocked_user_tested: boolean | null
          created_at: string
          cross_user_tested: boolean | null
          delete_policy_verified: boolean | null
          has_rls_enabled: boolean | null
          id: string
          insert_policy_verified: boolean | null
          last_audited_at: string | null
          notes: string | null
          select_policy_verified: boolean | null
          table_name: string
          update_policy_verified: boolean | null
          updated_at: string
        }
        Insert: {
          admin_access_tested?: boolean | null
          audited_by?: string | null
          blocked_user_tested?: boolean | null
          created_at?: string
          cross_user_tested?: boolean | null
          delete_policy_verified?: boolean | null
          has_rls_enabled?: boolean | null
          id?: string
          insert_policy_verified?: boolean | null
          last_audited_at?: string | null
          notes?: string | null
          select_policy_verified?: boolean | null
          table_name: string
          update_policy_verified?: boolean | null
          updated_at?: string
        }
        Update: {
          admin_access_tested?: boolean | null
          audited_by?: string | null
          blocked_user_tested?: boolean | null
          created_at?: string
          cross_user_tested?: boolean | null
          delete_policy_verified?: boolean | null
          has_rls_enabled?: boolean | null
          id?: string
          insert_policy_verified?: boolean | null
          last_audited_at?: string | null
          notes?: string | null
          select_policy_verified?: boolean | null
          table_name?: string
          update_policy_verified?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          action_key: string
          allowed: boolean
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          action_key: string
          allowed?: boolean
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          action_key?: string
          allowed?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_action_key_fkey"
            columns: ["action_key"]
            isOneToOne: false
            referencedRelation: "permission_definitions"
            referencedColumns: ["action_key"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          last_used_at: string
          query_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          last_used_at?: string
          query_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          last_used_at?: string
          query_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_changes: {
        Row: {
          backward_compatible: boolean
          change_type: string
          created_at: string
          deprecation_deadline: string | null
          deprecation_notice: string | null
          id: string
          new_definition: Json | null
          old_definition: Json | null
          schema_version_id: string | null
          table_name: string | null
        }
        Insert: {
          backward_compatible?: boolean
          change_type: string
          created_at?: string
          deprecation_deadline?: string | null
          deprecation_notice?: string | null
          id?: string
          new_definition?: Json | null
          old_definition?: Json | null
          schema_version_id?: string | null
          table_name?: string | null
        }
        Update: {
          backward_compatible?: boolean
          change_type?: string
          created_at?: string
          deprecation_deadline?: string | null
          deprecation_notice?: string | null
          id?: string
          new_definition?: Json | null
          old_definition?: Json | null
          schema_version_id?: string | null
          table_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schema_changes_schema_version_id_fkey"
            columns: ["schema_version_id"]
            isOneToOne: false
            referencedRelation: "schema_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_versions: {
        Row: {
          applied_at: string
          applied_by: string | null
          description: string
          id: string
          is_active: boolean
          migration_sql: string | null
          rollback_sql: string | null
          version: string
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          description: string
          id?: string
          is_active?: boolean
          migration_sql?: string | null
          rollback_sql?: string | null
          version: string
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          migration_sql?: string | null
          rollback_sql?: string | null
          version?: string
        }
        Relationships: []
      }
      scholar_credentials: {
        Row: {
          created_at: string
          credential_title: string
          credential_type: string
          expires_at: string | null
          id: string
          issued_date: string | null
          issuing_body: string
          issuing_body_verified: boolean
          scholar_passport_id: string
          verification_notes: string | null
          verification_source: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          credential_title: string
          credential_type: string
          expires_at?: string | null
          id?: string
          issued_date?: string | null
          issuing_body: string
          issuing_body_verified?: boolean
          scholar_passport_id: string
          verification_notes?: string | null
          verification_source?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          credential_title?: string
          credential_type?: string
          expires_at?: string | null
          id?: string
          issued_date?: string | null
          issuing_body?: string
          issuing_body_verified?: boolean
          scholar_passport_id?: string
          verification_notes?: string | null
          verification_source?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholar_credentials_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholar_credentials_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scholar_identity_links: {
        Row: {
          created_at: string
          external_identifier: string
          id: string
          profile_url: string | null
          provider: string
          scholar_passport_id: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          external_identifier: string
          id?: string
          profile_url?: string | null
          provider: string
          scholar_passport_id: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          external_identifier?: string
          id?: string
          profile_url?: string | null
          provider?: string
          scholar_passport_id?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholar_identity_links_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      scholar_passports: {
        Row: {
          academic_role: string | null
          created_at: string
          id: string
          passport_status: string
          primary_affiliation: string | null
          public_scholar_id: string
          research_interests: string[] | null
          updated_at: string
          user_id: string
          verification_level: string
        }
        Insert: {
          academic_role?: string | null
          created_at?: string
          id?: string
          passport_status?: string
          primary_affiliation?: string | null
          public_scholar_id: string
          research_interests?: string[] | null
          updated_at?: string
          user_id: string
          verification_level?: string
        }
        Update: {
          academic_role?: string | null
          created_at?: string
          id?: string
          passport_status?: string
          primary_affiliation?: string | null
          public_scholar_id?: string
          research_interests?: string[] | null
          updated_at?: string
          user_id?: string
          verification_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholar_passports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scholar_verification_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          new_value: string | null
          notes: string | null
          performed_by: string | null
          previous_value: string | null
          scholar_passport_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          new_value?: string | null
          notes?: string | null
          performed_by?: string | null
          previous_value?: string | null
          scholar_passport_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          performed_by?: string | null
          previous_value?: string | null
          scholar_passport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholar_verification_events_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholar_verification_events_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarly_legacy_profiles: {
        Row: {
          created_at: string
          designated_heirs: string[] | null
          id: string
          legacy_statement: string | null
          legacy_visibility: string
          preservation_preferences: Json | null
          scholar_passport_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          designated_heirs?: string[] | null
          id?: string
          legacy_statement?: string | null
          legacy_visibility?: string
          preservation_preferences?: Json | null
          scholar_passport_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          designated_heirs?: string[] | null
          id?: string
          legacy_statement?: string | null
          legacy_visibility?: string
          preservation_preferences?: Json | null
          scholar_passport_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarly_legacy_profiles_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: true
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      search_events: {
        Row: {
          created_at: string
          entity_clicked: string | null
          entity_type_clicked: string | null
          filters: Json | null
          id: string
          query: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_clicked?: string | null
          entity_type_clicked?: string | null
          filters?: Json | null
          id?: string
          query: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_clicked?: string | null
          entity_type_clicked?: string | null
          filters?: Json | null
          id?: string
          query?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_index: {
        Row: {
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          organization_id: string | null
          searchable_text: unknown
          skills: string[] | null
          tags: string[] | null
          title: string
          trust_score_snapshot: number | null
          university: string | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          organization_id?: string | null
          searchable_text?: unknown
          skills?: string[] | null
          tags?: string[] | null
          title: string
          trust_score_snapshot?: number | null
          university?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string | null
          searchable_text?: unknown
          skills?: string[] | null
          tags?: string[] | null
          title?: string
          trust_score_snapshot?: number | null
          university?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      search_indexes: {
        Row: {
          domains: string[] | null
          embedding_version: string | null
          entity_id: string
          entity_type: string
          id: string
          keywords: string[] | null
          last_indexed_at: string
          owner_id: string | null
          searchable_text: string
          visibility_scope: string
        }
        Insert: {
          domains?: string[] | null
          embedding_version?: string | null
          entity_id: string
          entity_type: string
          id?: string
          keywords?: string[] | null
          last_indexed_at?: string
          owner_id?: string | null
          searchable_text: string
          visibility_scope?: string
        }
        Update: {
          domains?: string[] | null
          embedding_version?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          keywords?: string[] | null
          last_indexed_at?: string
          owner_id?: string | null
          searchable_text?: string
          visibility_scope?: string
        }
        Relationships: []
      }
      security_audit_events: {
        Row: {
          action: string
          anomaly_detected: boolean | null
          created_at: string | null
          event_category: string
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          result: string
          risk_score: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          anomaly_detected?: boolean | null
          created_at?: string | null
          event_category: string
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          result: string
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          anomaly_detected?: boolean | null
          created_at?: string | null
          event_category?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          result?: string
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          affected_components: string[] | null
          affected_users_count: number | null
          closed_at: string | null
          contained_at: string | null
          created_at: string | null
          data_compromised: boolean | null
          data_types_affected: string[] | null
          description: string
          detected_at: string | null
          detection_method: string | null
          eradicated_at: string | null
          id: string
          incident_id: string
          incident_type: string
          lead_responder_id: string | null
          lessons_learned: string | null
          recovered_at: string | null
          root_cause: string | null
          severity: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          affected_components?: string[] | null
          affected_users_count?: number | null
          closed_at?: string | null
          contained_at?: string | null
          created_at?: string | null
          data_compromised?: boolean | null
          data_types_affected?: string[] | null
          description: string
          detected_at?: string | null
          detection_method?: string | null
          eradicated_at?: string | null
          id?: string
          incident_id: string
          incident_type: string
          lead_responder_id?: string | null
          lessons_learned?: string | null
          recovered_at?: string | null
          root_cause?: string | null
          severity: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          affected_components?: string[] | null
          affected_users_count?: number | null
          closed_at?: string | null
          contained_at?: string | null
          created_at?: string | null
          data_compromised?: boolean | null
          data_types_affected?: string[] | null
          description?: string
          detected_at?: string | null
          detection_method?: string | null
          eradicated_at?: string | null
          id?: string
          incident_id?: string
          incident_type?: string
          lead_responder_id?: string | null
          lessons_learned?: string | null
          recovered_at?: string | null
          root_cause?: string | null
          severity?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_incidents_lead_responder_id_fkey"
            columns: ["lead_responder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_test_results: {
        Row: {
          component: string
          evidence: Json | null
          id: string
          recommendation: string | null
          reproduction_steps: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          result: string
          severity: string | null
          suite_id: string | null
          test_name: string
          test_type: string
          tested_at: string | null
          tested_by: string | null
        }
        Insert: {
          component: string
          evidence?: Json | null
          id?: string
          recommendation?: string | null
          reproduction_steps?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          result: string
          severity?: string | null
          suite_id?: string | null
          test_name: string
          test_type: string
          tested_at?: string | null
          tested_by?: string | null
        }
        Update: {
          component?: string
          evidence?: Json | null
          id?: string
          recommendation?: string | null
          reproduction_steps?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          result?: string
          severity?: string | null
          suite_id?: string | null
          test_name?: string
          test_type?: string
          tested_at?: string | null
          tested_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_test_results_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_test_results_suite_id_fkey"
            columns: ["suite_id"]
            isOneToOne: false
            referencedRelation: "security_test_suites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_test_results_tested_by_fkey"
            columns: ["tested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_test_suites: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_destructive: boolean | null
          last_run_at: string | null
          last_run_status: string | null
          requires_approval: boolean | null
          schedule: string | null
          suite_name: string
          suite_type: string
          test_cases: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_destructive?: boolean | null
          last_run_at?: string | null
          last_run_status?: string | null
          requires_approval?: boolean | null
          schedule?: string | null
          suite_name: string
          suite_type: string
          test_cases?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_destructive?: boolean | null
          last_run_at?: string | null
          last_run_status?: string | null
          requires_approval?: boolean | null
          schedule?: string | null
          suite_name?: string
          suite_type?: string
          test_cases?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      security_vulnerabilities: {
        Row: {
          attack_surface_id: string | null
          component: string
          created_at: string | null
          cvss_score: number | null
          description: string
          discovered_at: string | null
          discovered_by: string | null
          id: string
          remediation_deadline: string | null
          remediation_plan: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string | null
          threat_model_id: string | null
          title: string
          updated_at: string | null
          vulnerability_type: string
        }
        Insert: {
          attack_surface_id?: string | null
          component: string
          created_at?: string | null
          cvss_score?: number | null
          description: string
          discovered_at?: string | null
          discovered_by?: string | null
          id?: string
          remediation_deadline?: string | null
          remediation_plan?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string | null
          threat_model_id?: string | null
          title: string
          updated_at?: string | null
          vulnerability_type: string
        }
        Update: {
          attack_surface_id?: string | null
          component?: string
          created_at?: string | null
          cvss_score?: number | null
          description?: string
          discovered_at?: string | null
          discovered_by?: string | null
          id?: string
          remediation_deadline?: string | null
          remediation_plan?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string | null
          threat_model_id?: string | null
          title?: string
          updated_at?: string | null
          vulnerability_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_vulnerabilities_attack_surface_id_fkey"
            columns: ["attack_surface_id"]
            isOneToOne: false
            referencedRelation: "attack_surfaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_vulnerabilities_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_vulnerabilities_threat_model_id_fkey"
            columns: ["threat_model_id"]
            isOneToOne: false
            referencedRelation: "threat_models"
            referencedColumns: ["id"]
          },
        ]
      }
      semantic_queries: {
        Row: {
          created_at: string
          entity_types: string[] | null
          filters: Json | null
          id: string
          is_alert_enabled: boolean
          last_executed_at: string | null
          parsed_structure: Json | null
          query_name: string | null
          query_text: string
          scope: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_types?: string[] | null
          filters?: Json | null
          id?: string
          is_alert_enabled?: boolean
          last_executed_at?: string | null
          parsed_structure?: Json | null
          query_name?: string | null
          query_text: string
          scope?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_types?: string[] | null
          filters?: Json | null
          id?: string
          is_alert_enabled?: boolean
          last_executed_at?: string | null
          parsed_structure?: Json | null
          query_name?: string | null
          query_text?: string
          scope?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "semantic_queries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_abstractions: {
        Row: {
          abstraction_interface: string
          alternative_providers: Json | null
          created_at: string
          current_provider: string
          deprecation_timeline: string | null
          id: string
          last_provider_evaluation: string | null
          migration_complexity: string | null
          migration_plan_url: string | null
          service_category: string
          updated_at: string
          vendor_lock_in_risk: string | null
        }
        Insert: {
          abstraction_interface: string
          alternative_providers?: Json | null
          created_at?: string
          current_provider: string
          deprecation_timeline?: string | null
          id?: string
          last_provider_evaluation?: string | null
          migration_complexity?: string | null
          migration_plan_url?: string | null
          service_category: string
          updated_at?: string
          vendor_lock_in_risk?: string | null
        }
        Update: {
          abstraction_interface?: string
          alternative_providers?: Json | null
          created_at?: string
          current_provider?: string
          deprecation_timeline?: string | null
          id?: string
          last_provider_evaluation?: string | null
          migration_complexity?: string | null
          migration_plan_url?: string | null
          service_category?: string
          updated_at?: string
          vendor_lock_in_risk?: string | null
        }
        Relationships: []
      }
      shutdown_modes: {
        Row: {
          created_at: string
          data_export_enabled: boolean | null
          description: string
          estimated_duration_days: number | null
          federation_participation: boolean | null
          id: string
          mode_name: string
          preservation_level: string
          steps: Json
        }
        Insert: {
          created_at?: string
          data_export_enabled?: boolean | null
          description: string
          estimated_duration_days?: number | null
          federation_participation?: boolean | null
          id?: string
          mode_name: string
          preservation_level: string
          steps?: Json
        }
        Update: {
          created_at?: string
          data_export_enabled?: boolean | null
          description?: string
          estimated_duration_days?: number | null
          federation_participation?: boolean | null
          id?: string
          mode_name?: string
          preservation_level?: string
          steps?: Json
        }
        Relationships: []
      }
      skill_endorsements: {
        Row: {
          created_at: string
          endorsement_strength: number | null
          endorser_id: string
          id: string
          user_skill_id: string
        }
        Insert: {
          created_at?: string
          endorsement_strength?: number | null
          endorser_id: string
          id?: string
          user_skill_id: string
        }
        Update: {
          created_at?: string
          endorsement_strength?: number | null
          endorser_id?: string
          id?: string
          user_skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_endorsements_endorser_id_fkey"
            columns: ["endorser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_endorsements_user_skill_id_fkey"
            columns: ["user_skill_id"]
            isOneToOne: false
            referencedRelation: "user_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      sovereign_data_controls: {
        Row: {
          created_at: string
          cross_border_rules: Json | null
          data_type: string
          encryption_requirements: Json | null
          enforced_at: string
          id: string
          infrastructure_profile_id: string | null
          residency_requirement: string
        }
        Insert: {
          created_at?: string
          cross_border_rules?: Json | null
          data_type: string
          encryption_requirements?: Json | null
          enforced_at?: string
          id?: string
          infrastructure_profile_id?: string | null
          residency_requirement: string
        }
        Update: {
          created_at?: string
          cross_border_rules?: Json | null
          data_type?: string
          encryption_requirements?: Json | null
          enforced_at?: string
          id?: string
          infrastructure_profile_id?: string | null
          residency_requirement?: string
        }
        Relationships: [
          {
            foreignKeyName: "sovereign_data_controls_infrastructure_profile_id_fkey"
            columns: ["infrastructure_profile_id"]
            isOneToOne: false
            referencedRelation: "national_infrastructure_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sovereign_federation_links: {
        Row: {
          activated_at: string | null
          allowed_data_types: string[] | null
          bilateral_agreement_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          source_country: string
          status: string | null
          target_country: string
          treaty_reference: string | null
        }
        Insert: {
          activated_at?: string | null
          allowed_data_types?: string[] | null
          bilateral_agreement_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          source_country: string
          status?: string | null
          target_country: string
          treaty_reference?: string | null
        }
        Update: {
          activated_at?: string | null
          allowed_data_types?: string[] | null
          bilateral_agreement_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          source_country?: string
          status?: string | null
          target_country?: string
          treaty_reference?: string | null
        }
        Relationships: []
      }
      state_transition_logs: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          from_state: string
          id: string
          metadata: Json | null
          to_state: string
          trigger_reason: string | null
          triggered_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          from_state: string
          id?: string
          metadata?: Json | null
          to_state: string
          trigger_reason?: string | null
          triggered_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          from_state?: string
          id?: string
          metadata?: Json | null
          to_state?: string
          trigger_reason?: string | null
          triggered_by?: string | null
        }
        Relationships: []
      }
      state_transitions: {
        Row: {
          auto_trigger_condition: Json | null
          created_at: string
          from_state: string
          id: string
          required_role: string | null
          requires_validation: boolean | null
          state_machine_id: string | null
          to_state: string
        }
        Insert: {
          auto_trigger_condition?: Json | null
          created_at?: string
          from_state: string
          id?: string
          required_role?: string | null
          requires_validation?: boolean | null
          state_machine_id?: string | null
          to_state: string
        }
        Update: {
          auto_trigger_condition?: Json | null
          created_at?: string
          from_state?: string
          id?: string
          required_role?: string | null
          requires_validation?: boolean | null
          state_machine_id?: string | null
          to_state?: string
        }
        Relationships: [
          {
            foreignKeyName: "state_transitions_state_machine_id_fkey"
            columns: ["state_machine_id"]
            isOneToOne: false
            referencedRelation: "system_state_machines"
            referencedColumns: ["id"]
          },
        ]
      }
      stewardship_entities: {
        Row: {
          activated_at: string | null
          contact_info: Json | null
          created_at: string
          entity_type: string
          id: string
          jurisdiction: string | null
          legal_registration: string | null
          mandate: string
          name: string
          status: string | null
        }
        Insert: {
          activated_at?: string | null
          contact_info?: Json | null
          created_at?: string
          entity_type: string
          id?: string
          jurisdiction?: string | null
          legal_registration?: string | null
          mandate: string
          name: string
          status?: string | null
        }
        Update: {
          activated_at?: string | null
          contact_info?: Json | null
          created_at?: string
          entity_type?: string
          id?: string
          jurisdiction?: string | null
          legal_registration?: string | null
          mandate?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      stewardship_roles: {
        Row: {
          authority_scope: string
          expires_at: string | null
          granted_at: string
          id: string
          is_active: boolean | null
          limitations: string | null
          stewardship_entity_id: string | null
        }
        Insert: {
          authority_scope: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          is_active?: boolean | null
          limitations?: string | null
          stewardship_entity_id?: string | null
        }
        Update: {
          authority_scope?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          is_active?: boolean | null
          limitations?: string | null
          stewardship_entity_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stewardship_roles_stewardship_entity_id_fkey"
            columns: ["stewardship_entity_id"]
            isOneToOne: false
            referencedRelation: "stewardship_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      stewardship_transfers: {
        Row: {
          approved_at: string | null
          completed_at: string | null
          created_at: string
          from_body: string | null
          id: string
          scope: string
          status: string
          to_body: string | null
          transition_plan: Json
        }
        Insert: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          from_body?: string | null
          id?: string
          scope: string
          status?: string
          to_body?: string | null
          transition_plan: Json
        }
        Update: {
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          from_body?: string | null
          id?: string
          scope?: string
          status?: string
          to_body?: string | null
          transition_plan?: Json
        }
        Relationships: []
      }
      student_cohorts: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          name: string
          org_id: string
          start_date: string | null
          supervisor_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          org_id: string
          start_date?: string | null
          supervisor_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          org_id?: string
          start_date?: string | null
          supervisor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_cohorts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_research_links: {
        Row: {
          contribution_scope: string
          created_at: string
          credit_visibility: string | null
          credited: boolean | null
          hours_contributed: number | null
          id: string
          research_timeline_id: string
          scholar_passport_id: string
          supervisor_approved: boolean | null
        }
        Insert: {
          contribution_scope: string
          created_at?: string
          credit_visibility?: string | null
          credited?: boolean | null
          hours_contributed?: number | null
          id?: string
          research_timeline_id: string
          scholar_passport_id: string
          supervisor_approved?: boolean | null
        }
        Update: {
          contribution_scope?: string
          created_at?: string
          credit_visibility?: string | null
          credited?: boolean | null
          hours_contributed?: number | null
          id?: string
          research_timeline_id?: string
          scholar_passport_id?: string
          supervisor_approved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "student_research_links_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_research_links_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          advanced_analytics: boolean | null
          ai_credits_included: number
          badge_name: string | null
          created_at: string
          description: string | null
          featured_profile: boolean
          features: Json
          id: string
          is_active: boolean
          max_bids_month: number | null
          max_boosts_monthly: number | null
          max_projects_month: number | null
          max_saved_searches: number | null
          name: string
          price_monthly: number
          price_yearly: number
          priority_support: boolean
          updated_at: string
        }
        Insert: {
          advanced_analytics?: boolean | null
          ai_credits_included?: number
          badge_name?: string | null
          created_at?: string
          description?: string | null
          featured_profile?: boolean
          features?: Json
          id?: string
          is_active?: boolean
          max_bids_month?: number | null
          max_boosts_monthly?: number | null
          max_projects_month?: number | null
          max_saved_searches?: number | null
          name: string
          price_monthly?: number
          price_yearly?: number
          priority_support?: boolean
          updated_at?: string
        }
        Update: {
          advanced_analytics?: boolean | null
          ai_credits_included?: number
          badge_name?: string | null
          created_at?: string
          description?: string | null
          featured_profile?: boolean
          features?: Json
          id?: string
          is_active?: boolean
          max_bids_month?: number | null
          max_boosts_monthly?: number | null
          max_projects_month?: number | null
          max_saved_searches?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          priority_support?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      subsidy_programs: {
        Row: {
          created_at: string
          eligibility_criteria: Json | null
          eligible_group: string
          expires_at: string | null
          funding_source: string | null
          id: string
          is_active: boolean | null
          name: string
          subsidy_percentage: number | null
          subsidy_scope: string
        }
        Insert: {
          created_at?: string
          eligibility_criteria?: Json | null
          eligible_group: string
          expires_at?: string | null
          funding_source?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subsidy_percentage?: number | null
          subsidy_scope: string
        }
        Update: {
          created_at?: string
          eligibility_criteria?: Json | null
          eligible_group?: string
          expires_at?: string | null
          funding_source?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subsidy_percentage?: number | null
          subsidy_scope?: string
        }
        Relationships: []
      }
      sunset_policies: {
        Row: {
          auto_suspend_on_failure: boolean | null
          component: string
          created_at: string
          id: string
          last_renewed_at: string | null
          next_review_at: string | null
          renewal_requirements: Json
          review_interval_years: number
          status: string
        }
        Insert: {
          auto_suspend_on_failure?: boolean | null
          component: string
          created_at?: string
          id?: string
          last_renewed_at?: string | null
          next_review_at?: string | null
          renewal_requirements?: Json
          review_interval_years?: number
          status?: string
        }
        Update: {
          auto_suspend_on_failure?: boolean | null
          component?: string
          created_at?: string
          id?: string
          last_renewed_at?: string | null
          next_review_at?: string | null
          renewal_requirements?: Json
          review_interval_years?: number
          status?: string
        }
        Relationships: []
      }
      supervision_records: {
        Row: {
          actual_end_date: string | null
          created_at: string
          expected_end_date: string | null
          formal_agreement: string | null
          id: string
          research_timeline_id: string | null
          start_date: string
          status: string
          supervisee_scholar_passport_id: string
          supervision_type: string
          supervisor_scholar_passport_id: string
          termination_reason: string | null
          updated_at: string
        }
        Insert: {
          actual_end_date?: string | null
          created_at?: string
          expected_end_date?: string | null
          formal_agreement?: string | null
          id?: string
          research_timeline_id?: string | null
          start_date: string
          status?: string
          supervisee_scholar_passport_id: string
          supervision_type: string
          supervisor_scholar_passport_id: string
          termination_reason?: string | null
          updated_at?: string
        }
        Update: {
          actual_end_date?: string | null
          created_at?: string
          expected_end_date?: string | null
          formal_agreement?: string | null
          id?: string
          research_timeline_id?: string | null
          start_date?: string
          status?: string
          supervisee_scholar_passport_id?: string
          supervision_type?: string
          supervisor_scholar_passport_id?: string
          termination_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervision_records_research_timeline_id_fkey"
            columns: ["research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervision_records_supervisee_scholar_passport_id_fkey"
            columns: ["supervisee_scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervision_records_supervisor_scholar_passport_id_fkey"
            columns: ["supervisor_scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          message: string
          problem_type: string
          resolved_at: string | null
          status: string
          subscription_id: string | null
          tool_id: string | null
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message: string
          problem_type: string
          resolved_at?: string | null
          status?: string
          subscription_id?: string | null
          tool_id?: string | null
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message?: string
          problem_type?: string
          resolved_at?: string | null
          status?: string
          subscription_id?: string | null
          tool_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "tool_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      swarm_decisions: {
        Row: {
          closes_at: string
          context_id: string | null
          context_type: string | null
          created_at: string
          created_by: string | null
          decision_type: string
          description: string
          id: string
          metadata: Json | null
          min_participants: number | null
          opens_at: string
          options: Json
          quorum_percentage: number | null
          result: Json | null
          status: Database["public"]["Enums"]["swarm_decision_status"]
          title: string
          updated_at: string
          voting_method: string
        }
        Insert: {
          closes_at: string
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          created_by?: string | null
          decision_type?: string
          description: string
          id?: string
          metadata?: Json | null
          min_participants?: number | null
          opens_at?: string
          options?: Json
          quorum_percentage?: number | null
          result?: Json | null
          status?: Database["public"]["Enums"]["swarm_decision_status"]
          title: string
          updated_at?: string
          voting_method?: string
        }
        Update: {
          closes_at?: string
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          created_by?: string | null
          decision_type?: string
          description?: string
          id?: string
          metadata?: Json | null
          min_participants?: number | null
          opens_at?: string
          options?: Json
          quorum_percentage?: number | null
          result?: Json | null
          status?: Database["public"]["Enums"]["swarm_decision_status"]
          title?: string
          updated_at?: string
          voting_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "swarm_decisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swarm_votes: {
        Row: {
          confidence: number | null
          created_at: string
          decision_id: string
          id: string
          option_id: string
          reasoning: string | null
          voter_id: string
          weight: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          decision_id: string
          id?: string
          option_id: string
          reasoning?: string | null
          voter_id: string
          weight?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          decision_id?: string
          id?: string
          option_id?: string
          reasoning?: string | null
          voter_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "swarm_votes_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "swarm_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swarm_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_recommendations: {
        Row: {
          action_data: Json | null
          action_url: string | null
          confidence_score: number | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_acted_upon: boolean | null
          is_dismissed: boolean | null
          priority: number | null
          reasoning: string | null
          recommendation_type: string
          title: string
          user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          action_url?: string | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_acted_upon?: boolean | null
          is_dismissed?: boolean | null
          priority?: number | null
          reasoning?: string | null
          recommendation_type: string
          title: string
          user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          action_url?: string | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_acted_upon?: boolean | null
          is_dismissed?: boolean | null
          priority?: number | null
          reasoning?: string | null
          recommendation_type?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_scope_limits: {
        Row: {
          created_at: string
          domain: string
          explicitly_allowed: Json
          explicitly_prohibited: Json
          id: string
          last_reviewed_at: string | null
          next_review_at: string | null
          rationale: string
          reviewed_by: string | null
        }
        Insert: {
          created_at?: string
          domain: string
          explicitly_allowed?: Json
          explicitly_prohibited?: Json
          id?: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          rationale: string
          reviewed_by?: string | null
        }
        Update: {
          created_at?: string
          domain?: string
          explicitly_allowed?: Json
          explicitly_prohibited?: Json
          id?: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          rationale?: string
          reviewed_by?: string | null
        }
        Relationships: []
      }
      system_signals: {
        Row: {
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          is_processed: boolean | null
          message: string | null
          processed_at: string | null
          processed_by: string | null
          severity: string
          signal_type: string
          source_system: string
          target_entity_id: string | null
          target_entity_type: string | null
          target_user_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_processed?: boolean | null
          message?: string | null
          processed_at?: string | null
          processed_by?: string | null
          severity?: string
          signal_type: string
          source_system: string
          target_entity_id?: string | null
          target_entity_type?: string | null
          target_user_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_processed?: boolean | null
          message?: string | null
          processed_at?: string | null
          processed_by?: string | null
          severity?: string
          signal_type?: string
          source_system?: string
          target_entity_id?: string | null
          target_entity_type?: string | null
          target_user_id?: string | null
          title?: string
        }
        Relationships: []
      }
      system_state_machines: {
        Row: {
          created_at: string
          entity_type: string
          id: string
          initial_state: string
          states: string[]
          terminal_states: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_type: string
          id?: string
          initial_state: string
          states: string[]
          terminal_states?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_type?: string
          id?: string
          initial_state?: string
          states?: string[]
          terminal_states?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      teaching_research_outputs: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          linked_research_timeline_id: string | null
          output_type: string
          published: boolean | null
          student_contributors: string[] | null
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          linked_research_timeline_id?: string | null
          output_type: string
          published?: boolean | null
          student_contributors?: string[] | null
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          linked_research_timeline_id?: string | null
          output_type?: string
          published?: boolean | null
          student_contributors?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "teaching_research_outputs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academic_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teaching_research_outputs_linked_research_timeline_id_fkey"
            columns: ["linked_research_timeline_id"]
            isOneToOne: false
            referencedRelation: "research_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          thread_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          thread_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          thread_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_notes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_models: {
        Row: {
          attack_vector: string | null
          component: string
          created_at: string | null
          description: string
          id: string
          likelihood: string | null
          mitigation: string | null
          mitigation_status: string | null
          owner_id: string | null
          potential_impact: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string
          threat_category: string | null
          threat_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attack_vector?: string | null
          component: string
          created_at?: string | null
          description: string
          id?: string
          likelihood?: string | null
          mitigation?: string | null
          mitigation_status?: string | null
          owner_id?: string | null
          potential_impact?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          threat_category?: string | null
          threat_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attack_vector?: string | null
          component?: string
          created_at?: string | null
          description?: string
          id?: string
          likelihood?: string | null
          mitigation?: string | null
          mitigation_status?: string | null
          owner_id?: string | null
          potential_impact?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string
          threat_category?: string | null
          threat_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "threat_models_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threat_models_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          delivery_details: Json | null
          duration_months: number | null
          id: string
          payment_method: string | null
          plan_id: string | null
          plan_name: string | null
          status: string
          subscription_id: string | null
          tool_id: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          delivery_details?: Json | null
          duration_months?: number | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          plan_name?: string | null
          status?: string
          subscription_id?: string | null
          tool_id: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          delivery_details?: Json | null
          duration_months?: number | null
          id?: string
          payment_method?: string | null
          plan_id?: string | null
          plan_name?: string | null
          status?: string
          subscription_id?: string | null
          tool_id?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_orders_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "tool_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_orders_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_subscriptions: {
        Row: {
          auto_renew: boolean | null
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_name: string | null
          plan_type: string
          started_at: string
          status: string
          tool_id: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_name?: string | null
          plan_type?: string
          started_at?: string
          status?: string
          tool_id: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_name?: string | null
          plan_type?: string
          started_at?: string
          status?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_subscriptions_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          category: string
          created_at: string
          description: string | null
          features: Json | null
          icon: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          pricing: Json | null
          short_description: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          pricing?: Json | null
          short_description?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          pricing?: Json | null
          short_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trend_models: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          model_name: string
          model_scope: string
          model_type: string
          parameters: Json
          scope_id: string | null
          version_number: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          model_name: string
          model_scope: string
          model_type: string
          parameters?: Json
          scope_id?: string | null
          version_number?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          model_name?: string
          model_scope?: string
          model_type?: string
          parameters?: Json
          scope_id?: string | null
          version_number?: number | null
        }
        Relationships: []
      }
      trend_outputs: {
        Row: {
          computed_at: string
          confidence_band: string
          domain: string
          explanation: string
          id: string
          signal_direction: string
          signal_strength: number | null
          supporting_data: Json | null
          trend_model_id: string
        }
        Insert: {
          computed_at?: string
          confidence_band: string
          domain: string
          explanation: string
          id?: string
          signal_direction: string
          signal_strength?: number | null
          supporting_data?: Json | null
          trend_model_id: string
        }
        Update: {
          computed_at?: string
          confidence_band?: string
          domain?: string
          explanation?: string
          id?: string
          signal_direction?: string
          signal_strength?: number | null
          supporting_data?: Json | null
          trend_model_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trend_outputs_trend_model_id_fkey"
            columns: ["trend_model_id"]
            isOneToOne: false
            referencedRelation: "trend_models"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_access_gates: {
        Row: {
          created_at: string | null
          denial_message: string | null
          feature_type: string
          gate_description: string | null
          gate_name: string
          id: string
          is_active: boolean | null
          max_dispute_rate: number | null
          min_escrow_success_rate: number | null
          min_projects_completed: number | null
          min_trust_score: number | null
          min_trust_tier: string | null
          requires_verification: boolean | null
        }
        Insert: {
          created_at?: string | null
          denial_message?: string | null
          feature_type: string
          gate_description?: string | null
          gate_name: string
          id?: string
          is_active?: boolean | null
          max_dispute_rate?: number | null
          min_escrow_success_rate?: number | null
          min_projects_completed?: number | null
          min_trust_score?: number | null
          min_trust_tier?: string | null
          requires_verification?: boolean | null
        }
        Update: {
          created_at?: string | null
          denial_message?: string | null
          feature_type?: string
          gate_description?: string | null
          gate_name?: string
          id?: string
          is_active?: boolean | null
          max_dispute_rate?: number | null
          min_escrow_success_rate?: number | null
          min_projects_completed?: number | null
          min_trust_score?: number | null
          min_trust_tier?: string | null
          requires_verification?: boolean | null
        }
        Relationships: []
      }
      trust_contexts: {
        Row: {
          computed_at: string
          context_id: string
          context_score: number | null
          context_type: string
          id: string
          trust_state: string
          user_id: string
        }
        Insert: {
          computed_at?: string
          context_id: string
          context_score?: number | null
          context_type: string
          id?: string
          trust_state?: string
          user_id: string
        }
        Update: {
          computed_at?: string
          context_id?: string
          context_score?: number | null
          context_type?: string
          id?: string
          trust_state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_contexts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_decay_log: {
        Row: {
          applied_at: string
          days_inactive: number | null
          decay_amount: number
          decay_reason: string
          id: string
          new_score: number
          previous_score: number
          user_id: string
        }
        Insert: {
          applied_at?: string
          days_inactive?: number | null
          decay_amount: number
          decay_reason: string
          id?: string
          new_score: number
          previous_score: number
          user_id: string
        }
        Update: {
          applied_at?: string
          days_inactive?: number | null
          decay_amount?: number
          decay_reason?: string
          id?: string
          new_score?: number
          previous_score?: number
          user_id?: string
        }
        Relationships: []
      }
      trust_events: {
        Row: {
          created_at: string | null
          event_source: string | null
          event_type: string
          evidence_links: Json | null
          evidence_summary: string | null
          hide_reason: string | null
          id: string
          is_public: boolean | null
          reference_id: string | null
          reference_type: string | null
          tier_after: string | null
          tier_before: string | null
          trust_after: number
          trust_before: number
          trust_delta: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_source?: string | null
          event_type: string
          evidence_links?: Json | null
          evidence_summary?: string | null
          hide_reason?: string | null
          id?: string
          is_public?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          tier_after?: string | null
          tier_before?: string | null
          trust_after: number
          trust_before: number
          trust_delta: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_source?: string | null
          event_type?: string
          evidence_links?: Json | null
          evidence_summary?: string | null
          hide_reason?: string | null
          id?: string
          is_public?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          tier_after?: string | null
          tier_before?: string | null
          trust_after?: number
          trust_before?: number
          trust_delta?: number
          user_id?: string
        }
        Relationships: []
      }
      trust_hard_penalties: {
        Row: {
          applied_at: string
          applied_by: string | null
          evidence_reference: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          penalty_points: number
          penalty_type: string
          recovery_months: number
          user_id: string
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          evidence_reference?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          penalty_points: number
          penalty_type: string
          recovery_months: number
          user_id: string
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          evidence_reference?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          penalty_points?: number
          penalty_type?: string
          recovery_months?: number
          user_id?: string
        }
        Relationships: []
      }
      trust_interventions: {
        Row: {
          applied_at: string
          applied_by: string | null
          details: Json | null
          expires_at: string | null
          id: string
          intervention_type: string
          lift_reason: string | null
          lifted_at: string | null
          lifted_by: string | null
          reason: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          details?: Json | null
          expires_at?: string | null
          id?: string
          intervention_type: string
          lift_reason?: string | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason: string
          user_id: string
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          details?: Json | null
          expires_at?: string | null
          id?: string
          intervention_type?: string
          lift_reason?: string | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_interventions_applied_by_fkey"
            columns: ["applied_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_interventions_lifted_by_fkey"
            columns: ["lifted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_interventions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_profiles: {
        Row: {
          base_trust_level: string
          created_at: string
          is_manually_set: boolean
          last_computed_at: string
          manual_set_by: string | null
          manual_set_reason: string | null
          trust_score: number | null
          user_id: string
          verification_weight: number | null
        }
        Insert: {
          base_trust_level?: string
          created_at?: string
          is_manually_set?: boolean
          last_computed_at?: string
          manual_set_by?: string | null
          manual_set_reason?: string | null
          trust_score?: number | null
          user_id: string
          verification_weight?: number | null
        }
        Update: {
          base_trust_level?: string
          created_at?: string
          is_manually_set?: boolean
          last_computed_at?: string
          manual_set_by?: string | null
          manual_set_reason?: string | null
          trust_score?: number | null
          user_id?: string
          verification_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_profiles_manual_set_by_fkey"
            columns: ["manual_set_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_score_components: {
        Row: {
          abandoned_collaborations: number
          active_months: number
          avg_peer_rating: number | null
          avg_response_hours: number | null
          collaboration_score: number
          computed_at: string
          consistency_score: number
          delivery_score: number
          disputes_lost: number
          disputes_raised: number
          escrow_cancellations: number
          escrow_releases_successful: number
          financial_score: number
          grants_executed: number
          id: string
          institutional_affiliations: number
          institutional_disputes: number
          institutional_score: number
          last_decay_applied_at: string | null
          longest_inactive_days: number
          on_time_rate: number
          partial_deliveries: number
          peer_reviews_received: number
          projects_completed: number
          projects_failed: number
          refunds_issued: number
          repeat_collaborations: number
          total_trust_score: number
          trend_direction: string | null
          trust_volatility: number
          user_id: string
          verifications_count: number
        }
        Insert: {
          abandoned_collaborations?: number
          active_months?: number
          avg_peer_rating?: number | null
          avg_response_hours?: number | null
          collaboration_score?: number
          computed_at?: string
          consistency_score?: number
          delivery_score?: number
          disputes_lost?: number
          disputes_raised?: number
          escrow_cancellations?: number
          escrow_releases_successful?: number
          financial_score?: number
          grants_executed?: number
          id?: string
          institutional_affiliations?: number
          institutional_disputes?: number
          institutional_score?: number
          last_decay_applied_at?: string | null
          longest_inactive_days?: number
          on_time_rate?: number
          partial_deliveries?: number
          peer_reviews_received?: number
          projects_completed?: number
          projects_failed?: number
          refunds_issued?: number
          repeat_collaborations?: number
          total_trust_score?: number
          trend_direction?: string | null
          trust_volatility?: number
          user_id: string
          verifications_count?: number
        }
        Update: {
          abandoned_collaborations?: number
          active_months?: number
          avg_peer_rating?: number | null
          avg_response_hours?: number | null
          collaboration_score?: number
          computed_at?: string
          consistency_score?: number
          delivery_score?: number
          disputes_lost?: number
          disputes_raised?: number
          escrow_cancellations?: number
          escrow_releases_successful?: number
          financial_score?: number
          grants_executed?: number
          id?: string
          institutional_affiliations?: number
          institutional_disputes?: number
          institutional_score?: number
          last_decay_applied_at?: string | null
          longest_inactive_days?: number
          on_time_rate?: number
          partial_deliveries?: number
          peer_reviews_received?: number
          projects_completed?: number
          projects_failed?: number
          refunds_issued?: number
          repeat_collaborations?: number
          total_trust_score?: number
          trend_direction?: string | null
          trust_volatility?: number
          user_id?: string
          verifications_count?: number
        }
        Relationships: []
      }
      trust_score_history: {
        Row: {
          change_reason: string
          change_source: string
          created_at: string
          id: string
          metadata: Json | null
          new_score: number
          previous_score: number
          user_id: string
        }
        Insert: {
          change_reason: string
          change_source?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_score: number
          previous_score: number
          user_id: string
        }
        Update: {
          change_reason?: string
          change_source?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_score?: number
          previous_score?: number
          user_id?: string
        }
        Relationships: []
      }
      trust_signals: {
        Row: {
          context_id: string | null
          context_type: string | null
          decays_at: string | null
          generated_at: string
          id: string
          signal_type: string
          signal_value: number
          source_entity_id: string | null
          source_entity_type: string | null
          user_id: string
          weight: number
        }
        Insert: {
          context_id?: string | null
          context_type?: string | null
          decays_at?: string | null
          generated_at?: string
          id?: string
          signal_type: string
          signal_value: number
          source_entity_id?: string | null
          source_entity_type?: string | null
          user_id: string
          weight?: number
        }
        Update: {
          context_id?: string | null
          context_type?: string | null
          decays_at?: string | null
          generated_at?: string
          id?: string
          signal_type?: string
          signal_value?: number
          source_entity_id?: string | null
          source_entity_type?: string | null
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "trust_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_tier_requirements: {
        Row: {
          description: string | null
          max_budget_access: number | null
          min_projects_completed: number
          min_trust_score: number
          org_access_allowed: boolean
          priority_support: boolean
          requires_verification: boolean
          tier: string
        }
        Insert: {
          description?: string | null
          max_budget_access?: number | null
          min_projects_completed?: number
          min_trust_score: number
          org_access_allowed?: boolean
          priority_support?: boolean
          requires_verification?: boolean
          tier: string
        }
        Update: {
          description?: string | null
          max_budget_access?: number | null
          min_projects_completed?: number
          min_trust_score?: number
          org_access_allowed?: boolean
          priority_support?: boolean
          requires_verification?: boolean
          tier?: string
        }
        Relationships: []
      }
      user_ai_credits: {
        Row: {
          balance: number
          last_refill_at: string | null
          lifetime_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          last_refill_at?: string | null
          lifetime_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          last_refill_at?: string | null
          lifetime_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_name: string
          badge_type: string
          description: string | null
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_name: string
          badge_type: string
          description?: string | null
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_name?: string
          badge_type?: string
          description?: string | null
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          connected_at: string
          connection_strength: number | null
          id: string
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          connected_at?: string
          connection_strength?: number | null
          id?: string
          user_a_id: string
          user_b_id: string
        }
        Update: {
          connected_at?: string
          connection_strength?: number | null
          id?: string
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_connections_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          granted_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
          version: string
          withdrawn_at: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted: boolean
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
          version: string
          withdrawn_at?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
          version?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      user_drafts: {
        Row: {
          auto_saved: boolean
          content: Json
          created_at: string
          draft_type: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_saved?: boolean
          content?: Json
          created_at?: string
          draft_type: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_saved?: boolean
          content?: Json
          created_at?: string
          draft_type?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feature_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean
          expires_at: string | null
          feature_key: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled: boolean
          expires_at?: string | null
          feature_key: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          expires_at?: string | null
          feature_key?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_restrictions: {
        Row: {
          applied_by: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          reason: string
          restriction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason: string
          restriction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string
          restriction_type?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_skills: {
        Row: {
          created_at: string
          endorsement_count: number | null
          id: string
          is_featured: boolean | null
          proficiency_level: string
          skill_category: string
          skill_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endorsement_count?: number | null
          id?: string
          is_featured?: boolean | null
          proficiency_level?: string
          skill_category?: string
          skill_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          endorsement_count?: number | null
          id?: string
          is_featured?: boolean | null
          proficiency_level?: string
          skill_category?: string
          skill_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean
          billing_cycle: string
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          payment_method_id: string | null
          started_at: string
          status: string
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_method_id?: string | null
          started_at?: string
          status?: string
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_method_id?: string | null
          started_at?: string
          status?: string
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_trust_profiles: {
        Row: {
          avg_milestone_approval_hours: number | null
          created_at: string
          decay_applied_at: string | null
          dispute_rate: number | null
          financial_reliability_score: number | null
          frozen_at: string | null
          frozen_by: string | null
          frozen_reason: string | null
          id: string
          is_frozen: boolean | null
          is_verified_partner: boolean
          is_verified_researcher: boolean
          is_verified_student: boolean
          last_activity_at: string | null
          response_time_hours: number | null
          successful_rate: number | null
          total_projects_completed: number
          total_projects_posted: number
          trust_score: number
          trust_tier: Database["public"]["Enums"]["trust_tier"] | null
          updated_at: string
          user_id: string
          verification_level: string
        }
        Insert: {
          avg_milestone_approval_hours?: number | null
          created_at?: string
          decay_applied_at?: string | null
          dispute_rate?: number | null
          financial_reliability_score?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          frozen_reason?: string | null
          id?: string
          is_frozen?: boolean | null
          is_verified_partner?: boolean
          is_verified_researcher?: boolean
          is_verified_student?: boolean
          last_activity_at?: string | null
          response_time_hours?: number | null
          successful_rate?: number | null
          total_projects_completed?: number
          total_projects_posted?: number
          trust_score?: number
          trust_tier?: Database["public"]["Enums"]["trust_tier"] | null
          updated_at?: string
          user_id: string
          verification_level?: string
        }
        Update: {
          avg_milestone_approval_hours?: number | null
          created_at?: string
          decay_applied_at?: string | null
          dispute_rate?: number | null
          financial_reliability_score?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          frozen_reason?: string | null
          id?: string
          is_frozen?: boolean | null
          is_verified_partner?: boolean
          is_verified_researcher?: boolean
          is_verified_student?: boolean
          last_activity_at?: string | null
          response_time_hours?: number | null
          successful_rate?: number | null
          total_projects_completed?: number
          total_projects_posted?: number
          trust_score?: number
          trust_tier?: Database["public"]["Enums"]["trust_tier"] | null
          updated_at?: string
          user_id?: string
          verification_level?: string
        }
        Relationships: []
      }
      value_units: {
        Row: {
          amount: number
          created_at: string
          id: string
          last_activity_at: string | null
          lifetime_earned: number
          lifetime_spent: number
          locked_amount: number
          unit_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          last_activity_at?: string | null
          lifetime_earned?: number
          lifetime_spent?: number
          locked_amount?: number
          unit_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          last_activity_at?: string | null
          lifetime_earned?: number
          lifetime_spent?: number
          locked_amount?: number
          unit_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      verification_attempts: {
        Row: {
          artifact_id: string
          claim_id: string | null
          conflict_details: string | null
          conflict_of_interest_declared: boolean | null
          cost_incurred: number | null
          created_at: string | null
          deviations_noted: string | null
          environment_used: Json | null
          evidence_checksums: string[] | null
          evidence_links: string[] | null
          id: string
          is_public: boolean | null
          methodology_followed: boolean | null
          outcome: string
          outcome_details: string | null
          published_at: string | null
          time_spent_hours: number | null
          verifier_id: string
          verifier_institution_id: string | null
        }
        Insert: {
          artifact_id: string
          claim_id?: string | null
          conflict_details?: string | null
          conflict_of_interest_declared?: boolean | null
          cost_incurred?: number | null
          created_at?: string | null
          deviations_noted?: string | null
          environment_used?: Json | null
          evidence_checksums?: string[] | null
          evidence_links?: string[] | null
          id?: string
          is_public?: boolean | null
          methodology_followed?: boolean | null
          outcome: string
          outcome_details?: string | null
          published_at?: string | null
          time_spent_hours?: number | null
          verifier_id: string
          verifier_institution_id?: string | null
        }
        Update: {
          artifact_id?: string
          claim_id?: string | null
          conflict_details?: string | null
          conflict_of_interest_declared?: boolean | null
          cost_incurred?: number | null
          created_at?: string | null
          deviations_noted?: string | null
          environment_used?: Json | null
          evidence_checksums?: string[] | null
          evidence_links?: string[] | null
          id?: string
          is_public?: boolean | null
          methodology_followed?: boolean | null
          outcome?: string
          outcome_details?: string | null
          published_at?: string | null
          time_spent_hours?: number | null
          verifier_id?: string
          verifier_institution_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_attempts_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "reproducibility_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_attempts_verifier_id_fkey"
            columns: ["verifier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_attempts_verifier_institution_id_fkey"
            columns: ["verifier_institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_submissions: {
        Row: {
          created_at: string
          documents: Json | null
          id: string
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          status: string
          submitted_data: Json | null
          updated_at: string
          user_id: string
          verification_type: string
        }
        Insert: {
          created_at?: string
          documents?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_data?: Json | null
          updated_at?: string
          user_id: string
          verification_type: string
        }
        Update: {
          created_at?: string
          documents?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_data?: Json | null
          updated_at?: string
          user_id?: string
          verification_type?: string
        }
        Relationships: []
      }
      visiting_scholar_records: {
        Row: {
          access_scope: string
          active_from: string
          active_until: string
          created_at: string
          host_institution_id: string
          id: string
          is_active: boolean
          local_contact_id: string | null
          mobility_request_id: string | null
          office_location: string | null
          scholar_passport_id: string
        }
        Insert: {
          access_scope?: string
          active_from: string
          active_until: string
          created_at?: string
          host_institution_id: string
          id?: string
          is_active?: boolean
          local_contact_id?: string | null
          mobility_request_id?: string | null
          office_location?: string | null
          scholar_passport_id: string
        }
        Update: {
          access_scope?: string
          active_from?: string
          active_until?: string
          created_at?: string
          host_institution_id?: string
          id?: string
          is_active?: boolean
          local_contact_id?: string | null
          mobility_request_id?: string | null
          office_location?: string | null
          scholar_passport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visiting_scholar_records_host_institution_id_fkey"
            columns: ["host_institution_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visiting_scholar_records_local_contact_id_fkey"
            columns: ["local_contact_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visiting_scholar_records_mobility_request_id_fkey"
            columns: ["mobility_request_id"]
            isOneToOne: false
            referencedRelation: "research_mobility_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visiting_scholar_records_scholar_passport_id_fkey"
            columns: ["scholar_passport_id"]
            isOneToOne: false
            referencedRelation: "scholar_passports"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_notes: {
        Row: {
          context_id: string | null
          context_type: string
          created_at: string
          duration_seconds: number
          id: string
          metadata: Json | null
          sentiment_score: number | null
          storage_path: string
          transcript: string | null
          user_id: string
        }
        Insert: {
          context_id?: string | null
          context_type: string
          created_at?: string
          duration_seconds?: number
          id?: string
          metadata?: Json | null
          sentiment_score?: number | null
          storage_path: string
          transcript?: string | null
          user_id: string
        }
        Update: {
          context_id?: string | null
          context_type?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          metadata?: Json | null
          sentiment_score?: number | null
          storage_path?: string
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          status: string
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number
          created_at: string
          currency: string
          escrow_balance: number
          fraud_flags: Json | null
          frozen_reason: string | null
          id: string
          is_frozen: boolean | null
          pending_balance: number
          risk_score: number | null
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          created_at?: string
          currency?: string
          escrow_balance?: number
          fraud_flags?: Json | null
          frozen_reason?: string | null
          id?: string
          is_frozen?: boolean | null
          pending_balance?: number
          risk_score?: number | null
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          created_at?: string
          currency?: string
          escrow_balance?: number
          fraud_flags?: Json | null
          frozen_reason?: string | null
          id?: string
          is_frozen?: boolean | null
          pending_balance?: number
          risk_score?: number | null
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_connections: {
        Row: {
          connected_user_id: string
          connection_type: string
          created_at: string
          id: string
          project_reference: string | null
          user_id: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          connected_user_id: string
          connection_type: string
          created_at?: string
          id?: string
          project_reference?: string | null
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          connected_user_id?: string
          connection_type?: string
          created_at?: string
          id?: string
          project_reference?: string | null
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      workspace_block_versions: {
        Row: {
          block_id: string
          change_note: string | null
          change_type: string | null
          content_snapshot: Json
          created_at: string
          edited_by: string
          id: string
          version_number: number
        }
        Insert: {
          block_id: string
          change_note?: string | null
          change_type?: string | null
          content_snapshot: Json
          created_at?: string
          edited_by: string
          id?: string
          version_number: number
        }
        Update: {
          block_id?: string
          change_note?: string | null
          change_type?: string | null
          content_snapshot?: Json
          created_at?: string
          edited_by?: string
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workspace_block_versions_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "workspace_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_block_versions_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_blocks: {
        Row: {
          block_type: string
          content: Json
          created_at: string
          created_by: string
          id: string
          is_locked: boolean
          last_edited_by: string | null
          locked_by: string | null
          parent_block_id: string | null
          position: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          block_type: string
          content?: Json
          created_at?: string
          created_by: string
          id?: string
          is_locked?: boolean
          last_edited_by?: string | null
          locked_by?: string | null
          parent_block_id?: string | null
          position?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          block_type?: string
          content?: Json
          created_at?: string
          created_by?: string
          id?: string
          is_locked?: boolean
          last_edited_by?: string | null
          locked_by?: string | null
          parent_block_id?: string | null
          position?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_blocks_last_edited_by_fkey"
            columns: ["last_edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_blocks_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_blocks_parent_block_id_fkey"
            columns: ["parent_block_id"]
            isOneToOne: false
            referencedRelation: "workspace_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_blocks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "collaborative_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_discussions: {
        Row: {
          content: string
          created_at: string
          created_by: string
          discussion_type: string
          id: string
          is_resolved: boolean
          related_block_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          discussion_type: string
          id?: string
          is_resolved?: boolean
          related_block_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          discussion_type?: string
          id?: string
          is_resolved?: boolean
          related_block_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_discussions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_discussions_related_block_id_fkey"
            columns: ["related_block_id"]
            isOneToOne: false
            referencedRelation: "workspace_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_discussions_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_discussions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "collaborative_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "collaborative_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_presence: {
        Row: {
          current_block_id: string | null
          cursor_position: Json | null
          id: string
          last_seen_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          current_block_id?: string | null
          cursor_position?: Json | null
          id?: string
          last_seen_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          current_block_id?: string | null
          cursor_position?: Json | null
          id?: string
          last_seen_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_presence_current_block_id_fkey"
            columns: ["current_block_id"]
            isOneToOne: false
            referencedRelation: "workspace_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_presence_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "collaborative_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_freeze_trust_profile: {
        Args: { p_freeze: boolean; p_reason?: string; p_user_id: string }
        Returns: boolean
      }
      admin_freeze_wallet: {
        Args: { p_freeze: boolean; p_reason?: string; p_wallet_id: string }
        Returns: boolean
      }
      admin_override_trust_score: {
        Args: { p_new_score: number; p_reason: string; p_user_id: string }
        Returns: boolean
      }
      apply_trust_decay: {
        Args: { p_days_inactive: number; p_user_id: string }
        Returns: undefined
      }
      apply_user_restriction: {
        Args: {
          p_expires_at?: string
          p_reason: string
          p_restriction_type: string
          p_user_id: string
        }
        Returns: string
      }
      are_connected: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      calculate_affiliate_commission_rate: {
        Args: { p_affiliate_id: string }
        Returns: number
      }
      calculate_dynamic_trust_score: {
        Args: { p_user_id: string }
        Returns: {
          new_score: number
          new_tier: Database["public"]["Enums"]["trust_tier"]
        }[]
      }
      calculate_profile_completeness: {
        Args: { p_user_id: string }
        Returns: number
      }
      calculate_trust_score: { Args: { p_user_id: string }; Returns: number }
      can_view_post: {
        Args: {
          post_row: Database["public"]["Tables"]["posts"]["Row"]
          viewer_id: string
        }
        Returns: boolean
      }
      check_affiliate_eligibility: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_and_unlock_reviews: {
        Args: { p_offer_id: string }
        Returns: boolean
      }
      check_feature_access: {
        Args: { p_feature_name: string; p_user_id: string }
        Returns: boolean
      }
      check_fraud_patterns: { Args: { p_wallet_id: string }; Returns: number }
      check_permission: {
        Args: {
          _action_key: string
          _context_id?: string
          _context_type?: string
          _user_id: string
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: { p_action_type: string; p_user_id: string }
        Returns: boolean
      }
      check_trust_gate: {
        Args: { p_gate_name: string; p_user_id: string }
        Returns: Json
      }
      compute_consequence_ledger: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      compute_profile_proof_metrics: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      create_academic_record_from_offer: {
        Args: { p_offer_id: string }
        Returns: string
      }
      execute_state_transition: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_from_state: string
          p_metadata?: Json
          p_reason?: string
          p_to_state: string
        }
        Returns: boolean
      }
      generate_credential_verification_code: { Args: never; Returns: string }
      generate_residency_proof: {
        Args: {
          p_data_location: string
          p_deployment_id: string
          p_proof_type: string
          p_verification_method: string
        }
        Returns: string
      }
      generate_scholar_id: { Args: never; Returns: string }
      get_collaboration_dampening: {
        Args: { p_user_a: string; p_user_b: string }
        Returns: number
      }
      get_connection_degree: {
        Args: { source_user: string; target_user: string }
        Returns: number
      }
      get_current_deployment_instance: { Args: never; Returns: string }
      get_mutual_connections_count: {
        Args: { user_a: string; user_b: string }
        Returns: number
      }
      get_platform_fee: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      get_user_review_stats: {
        Args: { p_user_id: string }
        Returns: {
          avg_communication: number
          avg_overall: number
          avg_quality: number
          avg_timeliness: number
          total_reviews: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_subscription_tier: {
        Args: { p_user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_ai_feature_enabled: {
        Args: { p_feature: string; p_user_id?: string }
        Returns: boolean
      }
      is_blocked: { Args: { user_a: string; user_b: string }; Returns: boolean }
      is_deployment_admin: {
        Args: { p_deployment_id: string; p_user_id: string }
        Returns: boolean
      }
      is_feature_enabled: {
        Args: { p_feature_key: string; p_user_id?: string }
        Returns: boolean
      }
      is_following: {
        Args: { follower: string; following: string }
        Returns: boolean
      }
      is_shadow_banned: { Args: { check_user_id: string }; Returns: boolean }
      is_user_restricted: {
        Args: { p_restriction_type?: string; p_user_id: string }
        Returns: boolean
      }
      issue_digital_credential: {
        Args: {
          p_credential_type: string
          p_issuer_name: string
          p_issuer_type: string
          p_related_record_id?: string
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
      log_platform_event: {
        Args: {
          _context?: Json
          _entity_id?: string
          _entity_type?: string
          _event_type: string
          _severity?: string
          _user_id?: string
        }
        Returns: string
      }
      partial_release_milestone: {
        Args: { p_amount: number; p_milestone_id: string; p_reason: string }
        Returns: boolean
      }
      register_outcome: {
        Args: {
          p_description?: string
          p_outcome_type: string
          p_title: string
          p_value_generated?: number
        }
        Returns: string
      }
      release_expired_embargoes: { Args: never; Returns: undefined }
      submit_review: {
        Args: {
          p_comment?: string
          p_communication_rating: number
          p_offer_id: string
          p_overall_rating: number
          p_quality_rating: number
          p_timeliness_rating: number
        }
        Returns: string
      }
      update_contribution_snapshot: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      use_ai_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: boolean
      }
      user_has_feature: {
        Args: { p_feature: string; p_user_id: string }
        Returns: boolean
      }
      validate_state_transition: {
        Args: {
          p_entity_type: string
          p_from_state: string
          p_to_state: string
          p_user_id?: string
        }
        Returns: boolean
      }
      verify_deployment_isolation: {
        Args: {
          p_access_type: string
          p_accessor_user_id?: string
          p_source_deployment_id: string
          p_target_deployment_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      affiliate_lifecycle_status:
        | "not_applied"
        | "applied"
        | "under_review"
        | "approved"
        | "active"
        | "paused"
        | "suspended"
        | "revoked"
      affiliate_type: "standard" | "institutional" | "ambassador"
      app_role: "student" | "researcher" | "admin"
      deployment_type: "saas" | "dedicated" | "sovereign"
      due_diligence_status: "pending" | "in_progress" | "completed" | "flagged"
      entity_lifecycle_state:
        | "draft"
        | "pending"
        | "active"
        | "paused"
        | "restricted"
        | "completed"
        | "archived"
        | "deleted"
      feed_event_type:
        | "new_connection"
        | "new_publication"
        | "project_completed"
        | "verification_approved"
        | "organization_joined"
        | "badge_earned"
        | "milestone_reached"
        | "collaboration_started"
        | "tool_purchased"
        | "review_received"
        | "profile_updated"
      governance_mode: "platform" | "delegated" | "autonomous"
      isolation_level: "shared" | "logical" | "physical"
      knowledge_status:
        | "draft"
        | "under_review"
        | "validated"
        | "superseded"
        | "archived"
      knowledge_type:
        | "finding"
        | "method"
        | "dataset"
        | "tool"
        | "theory"
        | "replication"
        | "synthesis"
      outcome_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "validated"
        | "disputed"
        | "legacy"
      post_type:
        | "text"
        | "research_update"
        | "announcement"
        | "publication"
        | "organization_post"
        | "milestone"
        | "collaboration_request"
      post_visibility:
        | "public"
        | "connections"
        | "followers"
        | "organization"
        | "private"
      prediction_market_status: "active" | "resolved" | "cancelled"
      referral_outcome_type:
        | "signup"
        | "onboarding_complete"
        | "first_project_completed"
        | "first_subscription"
        | "first_earning"
        | "milestone_delivered"
        | "tool_purchase"
        | "bundle_purchase"
      report_reason:
        | "spam"
        | "harassment"
        | "misinformation"
        | "inappropriate_content"
        | "copyright_violation"
        | "off_topic"
        | "other"
      signal_severity: "info" | "low" | "medium" | "high" | "critical"
      swarm_decision_status: "open" | "voting" | "closed" | "executed"
      trust_tier: "bronze" | "silver" | "gold" | "platinum"
      violation_severity: "warning" | "minor" | "major" | "critical"
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
      affiliate_lifecycle_status: [
        "not_applied",
        "applied",
        "under_review",
        "approved",
        "active",
        "paused",
        "suspended",
        "revoked",
      ],
      affiliate_type: ["standard", "institutional", "ambassador"],
      app_role: ["student", "researcher", "admin"],
      deployment_type: ["saas", "dedicated", "sovereign"],
      due_diligence_status: ["pending", "in_progress", "completed", "flagged"],
      entity_lifecycle_state: [
        "draft",
        "pending",
        "active",
        "paused",
        "restricted",
        "completed",
        "archived",
        "deleted",
      ],
      feed_event_type: [
        "new_connection",
        "new_publication",
        "project_completed",
        "verification_approved",
        "organization_joined",
        "badge_earned",
        "milestone_reached",
        "collaboration_started",
        "tool_purchased",
        "review_received",
        "profile_updated",
      ],
      governance_mode: ["platform", "delegated", "autonomous"],
      isolation_level: ["shared", "logical", "physical"],
      knowledge_status: [
        "draft",
        "under_review",
        "validated",
        "superseded",
        "archived",
      ],
      knowledge_type: [
        "finding",
        "method",
        "dataset",
        "tool",
        "theory",
        "replication",
        "synthesis",
      ],
      outcome_status: [
        "pending",
        "in_progress",
        "completed",
        "validated",
        "disputed",
        "legacy",
      ],
      post_type: [
        "text",
        "research_update",
        "announcement",
        "publication",
        "organization_post",
        "milestone",
        "collaboration_request",
      ],
      post_visibility: [
        "public",
        "connections",
        "followers",
        "organization",
        "private",
      ],
      prediction_market_status: ["active", "resolved", "cancelled"],
      referral_outcome_type: [
        "signup",
        "onboarding_complete",
        "first_project_completed",
        "first_subscription",
        "first_earning",
        "milestone_delivered",
        "tool_purchase",
        "bundle_purchase",
      ],
      report_reason: [
        "spam",
        "harassment",
        "misinformation",
        "inappropriate_content",
        "copyright_violation",
        "off_topic",
        "other",
      ],
      signal_severity: ["info", "low", "medium", "high", "critical"],
      swarm_decision_status: ["open", "voting", "closed", "executed"],
      trust_tier: ["bronze", "silver", "gold", "platinum"],
      violation_severity: ["warning", "minor", "major", "critical"],
    },
  },
} as const
