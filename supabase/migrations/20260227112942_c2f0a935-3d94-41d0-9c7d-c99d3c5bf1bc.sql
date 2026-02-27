
-- STIGL: Sovereign Trust Identity & Global Ledger

-- 1. Sovereign Execution ID (SEID)
CREATE TABLE public.stigl_sovereign_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  seid_hash TEXT NOT NULL,
  skill_registry JSONB DEFAULT '[]',
  project_history JSONB DEFAULT '[]',
  milestone_completion_log JSONB DEFAULT '[]',
  escrow_compliance_history JSONB DEFAULT '{}',
  dispute_resolution_history JSONB DEFAULT '[]',
  funding_participation JSONB DEFAULT '[]',
  institutional_endorsements JSONB DEFAULT '[]',
  patent_participation JSONB DEFAULT '[]',
  startup_involvement JSONB DEFAULT '[]',
  knowledge_publications JSONB DEFAULT '[]',
  cross_border_collaboration_index NUMERIC DEFAULT 0,
  governance_participation JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Global Trust Ledger (GTL)
CREATE TABLE public.stigl_trust_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_type TEXT NOT NULL,
  linked_entity_id UUID,
  linked_entity_type TEXT,
  verification_authority TEXT,
  trust_impact_delta NUMERIC DEFAULT 0,
  jurisdiction_tag TEXT,
  evidence_reference JSONB DEFAULT '{}',
  appeal_record JSONB,
  is_immutable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ECS 2.0 (Advanced Execution Credit Score)
CREATE TABLE public.stigl_ecs_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_punctuality NUMERIC DEFAULT 0,
  deliverable_quality NUMERIC DEFAULT 0,
  funding_compliance_rate NUMERIC DEFAULT 0,
  dispute_fairness NUMERIC DEFAULT 0,
  cross_border_reliability NUMERIC DEFAULT 0,
  institutional_endorsement_strength NUMERIC DEFAULT 0,
  knowledge_impact NUMERIC DEFAULT 0,
  startup_survival_contribution NUMERIC DEFAULT 0,
  policy_alignment_integrity NUMERIC DEFAULT 0,
  governance_participation_fairness NUMERIC DEFAULT 0,
  composite_ecs NUMERIC DEFAULT 0,
  decomposition JSONB DEFAULT '{}',
  is_portable BOOLEAN DEFAULT true,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Institutional Verification Layer
CREATE TABLE public.stigl_institutional_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  institution_id UUID,
  verification_type TEXT NOT NULL,
  verification_details JSONB DEFAULT '{}',
  signed_ledger_entry_id UUID REFERENCES public.stigl_trust_ledger(id),
  trust_delta_applied NUMERIC DEFAULT 0,
  verified_by UUID,
  verified_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Cross-Border Trust Compatibility Index
CREATE TABLE public.stigl_cross_border_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  jurisdiction_execution_history JSONB DEFAULT '[]',
  regulatory_compliance_history JSONB DEFAULT '[]',
  export_control_alignment NUMERIC DEFAULT 0,
  currency_handling_compliance NUMERIC DEFAULT 0,
  international_collaboration_record JSONB DEFAULT '[]',
  dispute_cross_border_stability NUMERIC DEFAULT 0,
  composite_compatibility NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Portable Identity Export Log
CREATE TABLE public.stigl_identity_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  export_format TEXT NOT NULL,
  export_scope JSONB DEFAULT '[]',
  recipient_type TEXT,
  recipient_id TEXT,
  export_hash TEXT,
  exported_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Privacy & Selective Disclosure
CREATE TABLE public.stigl_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  default_visibility TEXT DEFAULT 'selective',
  enterprise_access_granted JSONB DEFAULT '[]',
  institutional_access_granted JSONB DEFAULT '[]',
  funding_disclosure_level TEXT DEFAULT 'summary',
  anonymous_participation_enabled BOOLEAN DEFAULT false,
  redacted_summary_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 8. Anti-Fraud & Identity Protection
CREATE TABLE public.stigl_fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_type TEXT NOT NULL,
  target_user_id UUID,
  description TEXT,
  evidence JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Trust Inheritance & Recovery
CREATE TABLE public.stigl_trust_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trigger_event TEXT NOT NULL,
  trust_decrease NUMERIC DEFAULT 0,
  recovery_plan JSONB DEFAULT '{}',
  recovery_progress NUMERIC DEFAULT 0,
  appeal_submitted BOOLEAN DEFAULT false,
  appeal_outcome TEXT,
  institutional_mediation BOOLEAN DEFAULT false,
  correction_factor NUMERIC DEFAULT 0,
  consistency_dampening NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. AI Trust Analysis Engine
CREATE TABLE public.stigl_ai_trust_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL,
  analysis_summary TEXT NOT NULL,
  reasoning TEXT,
  trust_trajectory JSONB DEFAULT '{}',
  anomaly_detected BOOLEAN DEFAULT false,
  risk_zones JSONB DEFAULT '[]',
  recovery_suggestions JSONB DEFAULT '[]',
  diversification_suggestions JSONB DEFAULT '[]',
  concentration_risk NUMERIC DEFAULT 0,
  cross_border_compatibility_forecast JSONB DEFAULT '{}',
  confidence NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Enterprise & Government Integration
CREATE TABLE public.stigl_external_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_type TEXT NOT NULL,
  requester_id TEXT,
  requester_name TEXT,
  target_user_id UUID NOT NULL,
  integration_type TEXT NOT NULL,
  verification_result JSONB DEFAULT '{}',
  linked_contract_id UUID,
  performance_validation JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Trust Network Graph Data
CREATE TABLE public.stigl_trust_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  edge_type TEXT NOT NULL,
  trust_weight NUMERIC DEFAULT 0,
  collaboration_density NUMERIC DEFAULT 0,
  dispute_count INTEGER DEFAULT 0,
  funding_flow_impact NUMERIC DEFAULT 0,
  corridor_tag TEXT,
  region TEXT,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Generational Identity Continuity
CREATE TABLE public.stigl_generational_continuity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  career_arc_years INTEGER DEFAULT 0,
  institutional_successions JSONB DEFAULT '[]',
  startup_exit_history JSONB DEFAULT '[]',
  policy_cycle_participation JSONB DEFAULT '[]',
  cross_border_evolution JSONB DEFAULT '[]',
  skill_reinvention_history JSONB DEFAULT '[]',
  longitudinal_execution_memory JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Identity as Economic Access Key
CREATE TABLE public.stigl_access_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  access_type TEXT NOT NULL,
  access_level TEXT DEFAULT 'standard',
  ecs_threshold_met BOOLEAN DEFAULT false,
  trust_threshold_met BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'locked',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.stigl_sovereign_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_trust_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_ecs_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_institutional_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_cross_border_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_identity_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_trust_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_ai_trust_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_trust_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_generational_continuity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stigl_access_keys ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Read policies
  EXECUTE 'CREATE POLICY "stigl_seid_read" ON public.stigl_sovereign_ids FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "stigl_ledger_read" ON public.stigl_trust_ledger FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "stigl_ecs_read" ON public.stigl_ecs_v2 FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "stigl_verif_read" ON public.stigl_institutional_verifications FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "stigl_xborder_read" ON public.stigl_cross_border_compatibility FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "stigl_exports_read" ON public.stigl_identity_exports FOR SELECT TO authenticated USING (user_id = auth.uid())';
  EXECUTE 'CREATE POLICY "stigl_privacy_read" ON public.stigl_privacy_settings FOR SELECT TO authenticated USING (user_id = auth.uid())';
  EXECUTE 'CREATE POLICY "stigl_fraud_read" ON public.stigl_fraud_flags FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "stigl_recovery_read" ON public.stigl_trust_recovery FOR SELECT TO authenticated USING (user_id = auth.uid())';
  EXECUTE 'CREATE POLICY "stigl_ai_read" ON public.stigl_ai_trust_analysis FOR SELECT TO authenticated USING (user_id = auth.uid())';
  EXECUTE 'CREATE POLICY "stigl_ext_read" ON public.stigl_external_integrations FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "stigl_graph_read" ON public.stigl_trust_graph FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "stigl_gen_read" ON public.stigl_generational_continuity FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "stigl_access_read" ON public.stigl_access_keys FOR SELECT TO authenticated USING (user_id = auth.uid())';
  -- Insert policies
  EXECUTE 'CREATE POLICY "stigl_seid_insert" ON public.stigl_sovereign_ids FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
  EXECUTE 'CREATE POLICY "stigl_ledger_insert" ON public.stigl_trust_ledger FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_ecs_insert" ON public.stigl_ecs_v2 FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_verif_insert" ON public.stigl_institutional_verifications FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_xborder_insert" ON public.stigl_cross_border_compatibility FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_exports_insert" ON public.stigl_identity_exports FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
  EXECUTE 'CREATE POLICY "stigl_privacy_insert" ON public.stigl_privacy_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid())';
  EXECUTE 'CREATE POLICY "stigl_fraud_insert" ON public.stigl_fraud_flags FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_recovery_insert" ON public.stigl_trust_recovery FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_ai_insert" ON public.stigl_ai_trust_analysis FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_ext_insert" ON public.stigl_external_integrations FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_graph_insert" ON public.stigl_trust_graph FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_gen_insert" ON public.stigl_generational_continuity FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_access_insert" ON public.stigl_access_keys FOR INSERT TO authenticated WITH CHECK (true)';
  -- Update policies
  EXECUTE 'CREATE POLICY "stigl_seid_update" ON public.stigl_sovereign_ids FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
  EXECUTE 'CREATE POLICY "stigl_privacy_update" ON public.stigl_privacy_settings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
  EXECUTE 'CREATE POLICY "stigl_recovery_update" ON public.stigl_trust_recovery FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_fraud_update" ON public.stigl_fraud_flags FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_ext_update" ON public.stigl_external_integrations FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "stigl_access_update" ON public.stigl_access_keys FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
END $$;
