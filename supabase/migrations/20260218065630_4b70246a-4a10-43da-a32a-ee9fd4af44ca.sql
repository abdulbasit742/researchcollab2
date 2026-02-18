
-- Switching Cost Index
CREATE TABLE public.switching_cost_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  capital_history_depth INTEGER DEFAULT 0,
  trust_compounding_score NUMERIC(5,2) DEFAULT 0,
  startup_equity_dependency NUMERIC(5,2) DEFAULT 0,
  intelligence_subscription_reliance NUMERIC(5,2) DEFAULT 0,
  corporate_integration_depth NUMERIC(5,2) DEFAULT 0,
  escrow_history_count INTEGER DEFAULT 0,
  arbitration_record_count INTEGER DEFAULT 0,
  overall_switching_cost NUMERIC(5,2) DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.switching_cost_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage switching_cost_index" ON public.switching_cost_index FOR ALL USING (true);

-- Data Moat Growth Index
CREATE TABLE public.data_moat_growth_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period TEXT NOT NULL,
  total_escrow_transactions INTEGER DEFAULT 0,
  total_milestone_completions INTEGER DEFAULT 0,
  total_arbitration_cases INTEGER DEFAULT 0,
  total_startup_spinoffs INTEGER DEFAULT 0,
  total_equity_allocations INTEGER DEFAULT 0,
  total_employment_conversions INTEGER DEFAULT 0,
  cross_node_capital_flows NUMERIC(15,2) DEFAULT 0,
  intelligence_forecasting_history INTEGER DEFAULT 0,
  moat_depth_score NUMERIC(5,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.data_moat_growth_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage data_moat_growth" ON public.data_moat_growth_index FOR ALL USING (true);

-- Competitor Threat Index
CREATE TABLE public.competitor_threat_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_name TEXT NOT NULL,
  category TEXT NOT NULL,
  feature_imitation_score NUMERIC(5,2) DEFAULT 0,
  funding_threat_level TEXT DEFAULT 'low',
  enterprise_client_risk NUMERIC(5,2) DEFAULT 0,
  market_narrative_shift NUMERIC(5,2) DEFAULT 0,
  ai_positioning_threat NUMERIC(5,2) DEFAULT 0,
  overall_threat_level TEXT DEFAULT 'low',
  notes TEXT,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.competitor_threat_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage competitor_threat" ON public.competitor_threat_index FOR ALL USING (true);

-- AI Data Depth Index
CREATE TABLE public.ai_data_depth_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period TEXT NOT NULL,
  escrow_transaction_depth INTEGER DEFAULT 0,
  milestone_completion_depth INTEGER DEFAULT 0,
  arbitration_verdict_patterns INTEGER DEFAULT 0,
  startup_lifecycle_duration_avg NUMERIC(8,2) DEFAULT 0,
  founder_trust_evolution_points INTEGER DEFAULT 0,
  corporate_funding_cycles INTEGER DEFAULT 0,
  government_capital_patterns INTEGER DEFAULT 0,
  cross_node_allocation_variance NUMERIC(8,4) DEFAULT 0,
  employment_outcome_depth INTEGER DEFAULT 0,
  overall_depth_score NUMERIC(5,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_data_depth_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage ai_data_depth" ON public.ai_data_depth_index FOR ALL USING (true);

-- AI Decision Audit Logs
CREATE TABLE public.ai_decision_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_type TEXT NOT NULL,
  model_version TEXT,
  top_weighted_features JSONB DEFAULT '[]',
  confidence_interval NUMERIC(5,2),
  risk_factors JSONB DEFAULT '[]',
  alternative_scenarios JSONB DEFAULT '[]',
  historical_comparison JSONB,
  bias_audit_score NUMERIC(5,2),
  outcome_entity_type TEXT,
  outcome_entity_id UUID,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_decision_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage ai_decision_audit" ON public.ai_decision_audit_logs FOR ALL USING (true);

-- Displacement Pillars
CREATE TABLE public.displacement_pillars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pillar_name TEXT NOT NULL,
  rcollab_score NUMERIC(5,2) DEFAULT 0,
  competitor_avg_score NUMERIC(5,2) DEFAULT 0,
  advantage_multiplier NUMERIC(5,2) DEFAULT 1,
  description TEXT,
  last_assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.displacement_pillars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage displacement_pillars" ON public.displacement_pillars FOR ALL USING (true);
