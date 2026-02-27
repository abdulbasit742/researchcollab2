
-- GEEL: Global Execution Economy Layer

-- 1. Execution Credit Score (ECS)
CREATE TABLE public.geel_execution_credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_punctuality NUMERIC DEFAULT 0,
  escrow_compliance NUMERIC DEFAULT 0,
  dispute_resolution_efficiency NUMERIC DEFAULT 0,
  knowledge_contribution_impact NUMERIC DEFAULT 0,
  institutional_endorsement NUMERIC DEFAULT 0,
  cross_border_reliability NUMERIC DEFAULT 0,
  startup_survival_contribution NUMERIC DEFAULT 0,
  funding_transparency NUMERIC DEFAULT 0,
  policy_alignment NUMERIC DEFAULT 0,
  long_term_consistency NUMERIC DEFAULT 0,
  composite_ecs NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Programmable Funding Layer
CREATE TABLE public.geel_programmable_funding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  funding_type TEXT DEFAULT 'milestone_locked',
  total_amount NUMERIC DEFAULT 0,
  released_amount NUMERIC DEFAULT 0,
  frozen_amount NUMERIC DEFAULT 0,
  milestone_conditions JSONB DEFAULT '[]',
  performance_unlock_rules JSONB DEFAULT '[]',
  compliance_triggers JSONB DEFAULT '[]',
  cross_border_filters JSONB DEFAULT '[]',
  risk_tier TEXT DEFAULT 'standard',
  escrow_structure JSONB DEFAULT '{}',
  institutional_reporting JSONB DEFAULT '{}',
  ai_oversight_enabled BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Trust Network Economy
CREATE TABLE public.geel_trust_network (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trust_source TEXT NOT NULL,
  trust_value NUMERIC DEFAULT 0,
  funding_eligibility_impact NUMERIC DEFAULT 0,
  opportunity_visibility_impact NUMERIC DEFAULT 0,
  institutional_partnership_impact NUMERIC DEFAULT 0,
  enterprise_contract_impact NUMERIC DEFAULT 0,
  policy_advisory_impact NUMERIC DEFAULT 0,
  startup_equity_impact NUMERIC DEFAULT 0,
  is_transferable BOOLEAN DEFAULT false,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Execution-Tiered Skill Economy
CREATE TABLE public.geel_skill_economy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  execution_level TEXT DEFAULT 'emerging',
  milestone_consistency NUMERIC DEFAULT 0,
  institutional_reliability NUMERIC DEFAULT 0,
  cross_border_readiness NUMERIC DEFAULT 0,
  funding_handling_capacity NUMERIC DEFAULT 0,
  dispute_recovery_strength NUMERIC DEFAULT 0,
  linked_outcomes JSONB DEFAULT '[]',
  escrow_history_summary JSONB DEFAULT '{}',
  patent_involvement INTEGER DEFAULT 0,
  startup_contributions INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Cross-Border Execution Corridors
CREATE TABLE public.geel_execution_corridors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corridor_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  source_region TEXT,
  target_region TEXT,
  regulatory_compatibility JSONB DEFAULT '{}',
  funding_eligibility JSONB DEFAULT '{}',
  ip_alignment JSONB DEFAULT '{}',
  trust_compatibility_score NUMERIC DEFAULT 0,
  cultural_integration_index NUMERIC DEFAULT 0,
  execution_success_history JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Institutional Integration Registry
CREATE TABLE public.geel_institutional_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID,
  institution_type TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  integration_config JSONB DEFAULT '{}',
  api_endpoint TEXT,
  status TEXT DEFAULT 'pending',
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Long-Term Capital Formation
CREATE TABLE public.geel_capital_formation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lifetime_funding_secured NUMERIC DEFAULT 0,
  milestones_delivered INTEGER DEFAULT 0,
  startups_formed INTEGER DEFAULT 0,
  patents_filed INTEGER DEFAULT 0,
  cross_border_projects INTEGER DEFAULT 0,
  institutional_partnerships INTEGER DEFAULT 0,
  knowledge_published INTEGER DEFAULT 0,
  policy_contributions INTEGER DEFAULT 0,
  regional_economic_impact NUMERIC DEFAULT 0,
  execution_capital_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Civilization-Scale Governance
CREATE TABLE public.geel_governance_monitor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC DEFAULT 0,
  trust_concentration_gini NUMERIC DEFAULT 0,
  funding_monopolization_risk NUMERIC DEFAULT 0,
  regional_imbalance_index NUMERIC DEFAULT 0,
  institutional_dominance_score NUMERIC DEFAULT 0,
  cross_border_exclusion_pct NUMERIC DEFAULT 0,
  opportunity_fairness_index NUMERIC DEFAULT 0,
  dispute_bias_score NUMERIC DEFAULT 0,
  alerts JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Macro Intelligence Dashboard
CREATE TABLE public.geel_macro_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT,
  funding_flow_data JSONB DEFAULT '{}',
  startup_formation_density NUMERIC DEFAULT 0,
  trust_concentration NUMERIC DEFAULT 0,
  skill_migration_flows JSONB DEFAULT '[]',
  innovation_pipeline_velocity NUMERIC DEFAULT 0,
  policy_adoption_rate NUMERIC DEFAULT 0,
  cross_border_density NUMERIC DEFAULT 0,
  economic_output_multiplier NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- 10. AI Infrastructure Orchestrator
CREATE TABLE public.geel_ai_orchestrator (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL,
  insight_summary TEXT NOT NULL,
  reasoning TEXT,
  affected_region TEXT,
  affected_domain TEXT,
  confidence NUMERIC DEFAULT 0,
  recommended_action TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Intergenerational Memory Engine
CREATE TABLE public.geel_intergenerational_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  data_snapshot JSONB DEFAULT '{}',
  linked_entities JSONB DEFAULT '[]',
  significance_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Revenue Model Tracking
CREATE TABLE public.geel_revenue_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_type TEXT NOT NULL,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  source_entity_id UUID,
  source_entity_type TEXT,
  period TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Open Economic API Registry
CREATE TABLE public.geel_api_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name TEXT NOT NULL,
  api_type TEXT NOT NULL,
  version TEXT DEFAULT 'v1',
  endpoint_pattern TEXT,
  rate_limit INTEGER DEFAULT 1000,
  requires_auth BOOLEAN DEFAULT true,
  tier TEXT DEFAULT 'standard',
  is_active BOOLEAN DEFAULT true,
  documentation_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Systemic Resilience Safeguards
CREATE TABLE public.geel_resilience_safeguards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  detection_rules JSONB DEFAULT '[]',
  mitigation_actions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.geel_execution_credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_programmable_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_trust_network ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_skill_economy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_execution_corridors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_institutional_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_capital_formation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_governance_monitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_macro_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_ai_orchestrator ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_intergenerational_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_api_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geel_resilience_safeguards ENABLE ROW LEVEL SECURITY;

-- Policies via DO block
DO $$ BEGIN
  -- Read
  EXECUTE 'CREATE POLICY "geel_ecs_read" ON public.geel_execution_credit_scores FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_funding_read" ON public.geel_programmable_funding FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_trust_read" ON public.geel_trust_network FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_skill_read" ON public.geel_skill_economy FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_corridors_read" ON public.geel_execution_corridors FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_integrations_read" ON public.geel_institutional_integrations FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_capital_read" ON public.geel_capital_formation FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_governance_read" ON public.geel_governance_monitor FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_macro_read" ON public.geel_macro_intelligence FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_ai_read" ON public.geel_ai_orchestrator FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_memory_read" ON public.geel_intergenerational_memory FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_revenue_read" ON public.geel_revenue_streams FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_api_read" ON public.geel_api_registry FOR SELECT TO authenticated USING (true)';
  EXECUTE 'CREATE POLICY "geel_resilience_read" ON public.geel_resilience_safeguards FOR SELECT TO authenticated USING (true)';
  -- Insert
  EXECUTE 'CREATE POLICY "geel_ecs_insert" ON public.geel_execution_credit_scores FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_funding_insert" ON public.geel_programmable_funding FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_trust_insert" ON public.geel_trust_network FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_skill_insert" ON public.geel_skill_economy FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_corridors_insert" ON public.geel_execution_corridors FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_integrations_insert" ON public.geel_institutional_integrations FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_capital_insert" ON public.geel_capital_formation FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_governance_insert" ON public.geel_governance_monitor FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_macro_insert" ON public.geel_macro_intelligence FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_ai_insert" ON public.geel_ai_orchestrator FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_memory_insert" ON public.geel_intergenerational_memory FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_revenue_insert" ON public.geel_revenue_streams FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_api_insert" ON public.geel_api_registry FOR INSERT TO authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_resilience_insert" ON public.geel_resilience_safeguards FOR INSERT TO authenticated WITH CHECK (true)';
  -- Update
  EXECUTE 'CREATE POLICY "geel_ecs_update" ON public.geel_execution_credit_scores FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_funding_update" ON public.geel_programmable_funding FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_skill_update" ON public.geel_skill_economy FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_corridors_update" ON public.geel_execution_corridors FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_integrations_update" ON public.geel_institutional_integrations FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_ai_update" ON public.geel_ai_orchestrator FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "geel_resilience_update" ON public.geel_resilience_safeguards FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
END $$;
