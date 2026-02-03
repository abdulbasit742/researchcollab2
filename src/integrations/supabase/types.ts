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
      affiliates: {
        Row: {
          available_earnings: number | null
          commission_rate: number | null
          created_at: string | null
          custom_commission_rate: number | null
          id: string
          lifetime_earnings: number | null
          notes: string | null
          pending_earnings: number | null
          referral_code: string
          status: string | null
          total_clicks: number | null
          total_conversions: number | null
          total_signups: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_earnings?: number | null
          commission_rate?: number | null
          created_at?: string | null
          custom_commission_rate?: number | null
          id?: string
          lifetime_earnings?: number | null
          notes?: string | null
          pending_earnings?: number | null
          referral_code: string
          status?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_signups?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_earnings?: number | null
          commission_rate?: number | null
          created_at?: string | null
          custom_commission_rate?: number | null
          id?: string
          lifetime_earnings?: number | null
          notes?: string | null
          pending_earnings?: number | null
          referral_code?: string
          status?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_signups?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      profiles: {
        Row: {
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
          university: string | null
          updated_at: string
        }
        Insert: {
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
          university?: string | null
          updated_at?: string
        }
        Update: {
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
          university?: string | null
          updated_at?: string
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
      subscription_tiers: {
        Row: {
          ai_credits_included: number
          badge_name: string | null
          created_at: string
          featured_profile: boolean
          features: Json
          id: string
          is_active: boolean
          max_bids_month: number | null
          max_projects_month: number | null
          name: string
          price_monthly: number
          price_yearly: number
          priority_support: boolean
          updated_at: string
        }
        Insert: {
          ai_credits_included?: number
          badge_name?: string | null
          created_at?: string
          featured_profile?: boolean
          features?: Json
          id?: string
          is_active?: boolean
          max_bids_month?: number | null
          max_projects_month?: number | null
          name: string
          price_monthly?: number
          price_yearly?: number
          priority_support?: boolean
          updated_at?: string
        }
        Update: {
          ai_credits_included?: number
          badge_name?: string | null
          created_at?: string
          featured_profile?: boolean
          features?: Json
          id?: string
          is_active?: boolean
          max_bids_month?: number | null
          max_projects_month?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          priority_support?: boolean
          updated_at?: string
        }
        Relationships: []
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
      apply_user_restriction: {
        Args: {
          p_expires_at?: string
          p_reason: string
          p_restriction_type: string
          p_user_id: string
        }
        Returns: string
      }
      calculate_dynamic_trust_score: {
        Args: { p_user_id: string }
        Returns: {
          new_score: number
          new_tier: Database["public"]["Enums"]["trust_tier"]
        }[]
      }
      check_and_unlock_reviews: {
        Args: { p_offer_id: string }
        Returns: boolean
      }
      check_fraud_patterns: { Args: { p_wallet_id: string }; Returns: number }
      check_rate_limit: {
        Args: { p_action_type: string; p_user_id: string }
        Returns: boolean
      }
      create_academic_record_from_offer: {
        Args: { p_offer_id: string }
        Returns: string
      }
      generate_credential_verification_code: { Args: never; Returns: string }
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
      is_blocked: { Args: { user_a: string; user_b: string }; Returns: boolean }
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
      partial_release_milestone: {
        Args: { p_amount: number; p_milestone_id: string; p_reason: string }
        Returns: boolean
      }
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
      use_ai_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: boolean
      }
      user_has_feature: {
        Args: { p_feature: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "researcher" | "admin"
      trust_tier: "bronze" | "silver" | "gold" | "platinum"
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
      app_role: ["student", "researcher", "admin"],
      trust_tier: ["bronze", "silver", "gold", "platinum"],
    },
  },
} as const
