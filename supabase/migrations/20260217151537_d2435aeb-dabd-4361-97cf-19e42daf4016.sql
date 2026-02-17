
-- Layers 11-15: All tables with IF NOT EXISTS

-- Layer 11
CREATE TABLE IF NOT EXISTS public.governance_influence_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  giu_balance NUMERIC(12,2) DEFAULT 0,
  lifetime_earned NUMERIC(12,2) DEFAULT 0,
  last_decay_at TIMESTAMPTZ DEFAULT now(),
  decay_rate NUMERIC(5,4) DEFAULT 0.02,
  earned_from_trust NUMERIC(12,2) DEFAULT 0,
  earned_from_disputes NUMERIC(12,2) DEFAULT 0,
  earned_from_capital NUMERIC(12,2) DEFAULT 0,
  earned_from_research NUMERIC(12,2) DEFAULT 0,
  earned_from_proposals NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- governance_proposals already exists, add missing columns
ALTER TABLE public.governance_proposals
  ADD COLUMN IF NOT EXISTS impact_forecast JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS liquidity_analysis JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS capital_risk_sim JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS constitutional_compliance JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_bias_audit JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS votes_for NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS votes_against NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quorum_required NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS activation_delay_hours INTEGER DEFAULT 720,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.proposal_simulation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL,
  simulation_type TEXT NOT NULL CHECK (simulation_type IN ('liquidity_30d','capital_60d','trust_90d','institutional_dominance')),
  input_parameters JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  risk_score NUMERIC(5,2) DEFAULT 0,
  confidence NUMERIC(3,2) DEFAULT 0,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.constitutional_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL CHECK (audit_type IN ('proposal_review','drift_detection','bias_scan','power_concentration','incentive_shift','model_drift')),
  target_id TEXT,
  target_type TEXT,
  risk_classification TEXT DEFAULT 'low' CHECK (risk_classification IN ('low','moderate','high','critical')),
  bias_score NUMERIC(5,2) DEFAULT 0,
  power_concentration_index NUMERIC(5,2) DEFAULT 0,
  violation_probability NUMERIC(5,4) DEFAULT 0,
  ai_reasoning TEXT,
  ai_model_version TEXT,
  reviewed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.power_concentration_metrics_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('institutional_voting','capital_dominance','trust_clustering','proposal_approval','geographic_influence')),
  entity_type TEXT,
  entity_id TEXT,
  concentration_score NUMERIC(5,2) DEFAULT 0,
  threshold NUMERIC(5,2) DEFAULT 0,
  breached BOOLEAN DEFAULT false,
  auto_action_taken TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crisis_type TEXT NOT NULL CHECK (crisis_type IN ('liquidity_collapse','capital_default_wave','trust_shock','coordinated_manipulation','systemic_failure')),
  severity TEXT DEFAULT 'moderate' CHECK (severity IN ('moderate','severe','critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','contained','resolved','post_mortem')),
  triggered_by TEXT,
  actions_taken JSONB DEFAULT '[]',
  capital_freeze_active BOOLEAN DEFAULT false,
  proposal_moratorium BOOLEAN DEFAULT false,
  auto_expires_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  post_mortem JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.governance_participation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  proposals_submitted INTEGER DEFAULT 0,
  votes_cast INTEGER DEFAULT 0,
  debates_contributed INTEGER DEFAULT 0,
  high_impact_proposals INTEGER DEFAULT 0,
  governance_bonus_earned NUMERIC(12,2) DEFAULT 0,
  visibility_boost NUMERIC(5,2) DEFAULT 0,
  trust_multiplier NUMERIC(3,2) DEFAULT 1.0,
  badges JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.amendment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID,
  section_amended TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  amendment_type TEXT CHECK (amendment_type IN ('economic_parameter','exposure_cap','liquidity_threshold','governance_reward','other')),
  supermajority_achieved BOOLEAN DEFAULT false,
  institutional_quorum_met BOOLEAN DEFAULT false,
  ai_guardian_cleared BOOLEAN DEFAULT false,
  activation_delay_end TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Layer 12
CREATE TABLE IF NOT EXISTS public.financial_rail_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rail_name TEXT NOT NULL,
  rail_type TEXT NOT NULL CHECK (rail_type IN ('bank_transfer','swift','iban','local_payment','mobile_money','crypto_stablecoin')),
  supported_currencies TEXT[] DEFAULT '{}',
  settlement_time_hours INTEGER DEFAULT 24,
  fee_structure JSONB DEFAULT '{}',
  compliance_level TEXT DEFAULT 'standard',
  is_active BOOLEAN DEFAULT true,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settlement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rail_id UUID,
  user_id UUID,
  amount NUMERIC(16,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR',
  fx_rate NUMERIC(12,6),
  destination_currency TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','reversed')),
  compliance_cleared BOOLEAN DEFAULT false,
  reference_type TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.regulatory_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  partner_type TEXT CHECK (partner_type IN ('government','regulator','university','bank','ngo','international_org')),
  jurisdiction TEXT,
  compliance_level TEXT DEFAULT 'standard',
  api_enabled BOOLEAN DEFAULT false,
  treaty_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.treaty_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treaty_name TEXT NOT NULL,
  treaty_type TEXT CHECK (treaty_type IN ('inter_university','government_industry','regional_liquidity','skill_acceleration','labor_mobility')),
  parties JSONB DEFAULT '[]',
  eligibility_rules JSONB DEFAULT '{}',
  funding_pool_id UUID,
  compliance_overlays JSONB DEFAULT '{}',
  risk_exposure_caps JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','negotiating','ratified','active','suspended','expired')),
  ratified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.treaty_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treaty_id UUID,
  action_type TEXT NOT NULL,
  actor_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jurisdiction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  rule_type TEXT CHECK (rule_type IN ('kyc','aml','data_residency','sanctions','labor','tax','export_control')),
  rule_definition JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Layer 13
CREATE TABLE IF NOT EXISTS public.index_calculation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_name TEXT NOT NULL CHECK (index_name IN ('RPI','IEI','PIMI','GSHI','TSI')),
  entity_type TEXT,
  entity_id TEXT,
  score NUMERIC(5,2) DEFAULT 0,
  components JSONB DEFAULT '{}',
  methodology_version TEXT,
  confidence NUMERIC(3,2) DEFAULT 0,
  manipulation_flag BOOLEAN DEFAULT false,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.index_methodology_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_name TEXT NOT NULL,
  version TEXT NOT NULL,
  methodology JSONB NOT NULL,
  normalization_rules JSONB DEFAULT '{}',
  anti_manipulation_logic JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.macro_simulation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_type TEXT NOT NULL CHECK (simulation_type IN ('demand_shock','skill_collapse','capital_withdrawal','institutional_default','currency_devaluation','custom')),
  input_parameters JSONB NOT NULL,
  projected_index_shifts JSONB DEFAULT '{}',
  capital_stress_ripple JSONB DEFAULT '{}',
  trust_volatility_impact JSONB DEFAULT '{}',
  cross_border_effects JSONB DEFAULT '{}',
  time_horizon_days INTEGER DEFAULT 90,
  confidence NUMERIC(3,2) DEFAULT 0,
  run_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Layer 14
CREATE TABLE IF NOT EXISTS public.predictive_region_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code TEXT NOT NULL,
  time_horizon TEXT CHECK (time_horizon IN ('30d','90d','6m','12m','24m')),
  growth_probability NUMERIC(5,2) DEFAULT 0,
  stagnation_risk NUMERIC(5,2) DEFAULT 0,
  collapse_risk NUMERIC(5,2) DEFAULT 0,
  capital_sensitivity NUMERIC(5,2) DEFAULT 0,
  model_version TEXT,
  confidence NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.predictive_skill_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  lifecycle_stage TEXT CHECK (lifecycle_stage IN ('emerging','growth','peak','saturation','decline')),
  saturation_timeline_months INTEGER,
  wage_trend TEXT CHECK (wage_trend IN ('inflation','stable','deflation')),
  obsolescence_risk NUMERIC(5,2) DEFAULT 0,
  institutional_investment_match NUMERIC(5,2) DEFAULT 0,
  model_version TEXT,
  confidence NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.institutional_risk_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID,
  stability_index NUMERIC(5,2) DEFAULT 0,
  revenue_resilience NUMERIC(5,2) DEFAULT 0,
  trust_drift NUMERIC(5,2) DEFAULT 0,
  capital_dependency_risk NUMERIC(5,2) DEFAULT 0,
  talent_outflow_probability NUMERIC(5,2) DEFAULT 0,
  governance_instability NUMERIC(5,2) DEFAULT 0,
  early_warnings JSONB DEFAULT '[]',
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.capital_stress_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario TEXT NOT NULL,
  shock_magnitude NUMERIC(5,2) DEFAULT 0,
  default_probability_spike JSONB DEFAULT '{}',
  institutional_exposure JSONB DEFAULT '{}',
  trust_shock_propagation JSONB DEFAULT '{}',
  recovery_timeline_days INTEGER,
  model_version TEXT,
  run_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.policy_simulation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type TEXT NOT NULL CHECK (policy_type IN ('skill_subsidy','capital_injection','trust_reform','exposure_cap','institutional_merger','treaty_activation','custom')),
  parameters JSONB NOT NULL,
  productivity_shift JSONB DEFAULT '{}',
  income_mobility_delta JSONB DEFAULT '{}',
  capital_yield_change JSONB DEFAULT '{}',
  trust_stability_impact JSONB DEFAULT '{}',
  risk_externalities JSONB DEFAULT '{}',
  advisory_only BOOLEAN DEFAULT true,
  run_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.predictive_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  model_version TEXT,
  input_hash TEXT,
  confidence_interval JSONB DEFAULT '{}',
  political_bias_risk NUMERIC(3,2) DEFAULT 0,
  overfitting_flag BOOLEAN DEFAULT false,
  human_review_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Layer 15
CREATE TABLE IF NOT EXISTS public.structural_friction_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friction_type TEXT NOT NULL CHECK (friction_type IN ('deal_delay','escrow_congestion','skill_oversupply','institutional_stagnation','governance_inactivity','capital_underutilization')),
  severity_score NUMERIC(5,2) DEFAULT 0,
  impact_radius TEXT,
  systemic_risk TEXT DEFAULT 'low' CHECK (systemic_risk IN ('low','moderate','high','critical')),
  details JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.optimization_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inefficiency_id UUID,
  title TEXT NOT NULL,
  root_cause TEXT,
  simulation_results JSONB DEFAULT '{}',
  risk_exposure JSONB DEFAULT '{}',
  constitutional_compliance BOOLEAN DEFAULT false,
  governance_vote_required BOOLEAN DEFAULT true,
  rollback_plan JSONB DEFAULT '{}',
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed','simulating','reviewed','voting','approved','activated','rolled_back','rejected')),
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.complexity_budget_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL,
  layer INTEGER NOT NULL,
  active_modules INTEGER DEFAULT 0,
  redundant_overlap_count INTEGER DEFAULT 0,
  underused_flag BOOLEAN DEFAULT false,
  governance_overhead_score NUMERIC(5,2) DEFAULT 0,
  merge_candidates JSONB DEFAULT '[]',
  removal_candidates JSONB DEFAULT '[]',
  simplification_paths JSONB DEFAULT '[]',
  last_evaluated TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.antifragility_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('shock_recovery','capital_absorption','trust_stabilization','governance_response','liquidity_rebalancing')),
  score NUMERIC(5,2) DEFAULT 0,
  measurement_period_days INTEGER DEFAULT 30,
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('improving','stable','declining')),
  details JSONB DEFAULT '{}',
  measured_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  overall_score NUMERIC(5,2) DEFAULT 0,
  antifragility_score NUMERIC(5,2) DEFAULT 0,
  complexity_score NUMERIC(5,2) DEFAULT 0,
  friction_count INTEGER DEFAULT 0,
  active_optimizations INTEGER DEFAULT 0,
  components JSONB DEFAULT '{}',
  snapshot_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.self_optimization_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  optimization_id UUID,
  action TEXT NOT NULL,
  ai_explanation TEXT,
  uncertainty_band JSONB DEFAULT '{}',
  bias_risk NUMERIC(3,2) DEFAULT 0,
  model_lineage TEXT,
  manual_review_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.governance_influence_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constitutional_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.power_concentration_metrics_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_participation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amendment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_rail_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treaty_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treaty_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurisdiction_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.index_calculation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.index_methodology_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.macro_simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_region_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_skill_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_risk_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_stress_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structural_friction_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complexity_budget_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antifragility_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_optimization_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view own GIU" ON public.governance_influence_registry FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage GIU" ON public.governance_influence_registry FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view sims" ON public.proposal_simulation_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage sims" ON public.proposal_simulation_results FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view const audits" ON public.constitutional_audit_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage const audits" ON public.constitutional_audit_logs FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view power v2" ON public.power_concentration_metrics_v2 FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage power v2" ON public.power_concentration_metrics_v2 FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view crises" ON public.crisis_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage crises" ON public.crisis_events FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Users view own participation" ON public.governance_participation_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage participation" ON public.governance_participation_metrics FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view amendments" ON public.amendment_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage amendments" ON public.amendment_history FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view rails" ON public.financial_rail_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage rails" ON public.financial_rail_registry FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view settlements" ON public.settlement_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage settlements" ON public.settlement_logs FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view reg partners" ON public.regulatory_partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage reg partners" ON public.regulatory_partners FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view treaties" ON public.treaty_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage treaties" ON public.treaty_registry FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view treaty logs" ON public.treaty_execution_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage treaty logs" ON public.treaty_execution_logs FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view jurisdictions" ON public.jurisdiction_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage jurisdictions" ON public.jurisdiction_rules FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view indices" ON public.index_calculation_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage indices" ON public.index_calculation_logs FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view methodologies" ON public.index_methodology_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage methodologies" ON public.index_methodology_versions FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view macro sims" ON public.macro_simulation_results FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage macro sims" ON public.macro_simulation_results FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view region forecasts" ON public.predictive_region_forecasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage region forecasts" ON public.predictive_region_forecasts FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view skill models" ON public.predictive_skill_models FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage skill models" ON public.predictive_skill_models FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view inst forecasts" ON public.institutional_risk_forecasts FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage inst forecasts" ON public.institutional_risk_forecasts FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view cap stress" ON public.capital_stress_results FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage cap stress" ON public.capital_stress_results FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view policy sims" ON public.policy_simulation_runs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage policy sims" ON public.policy_simulation_runs FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view pred audits" ON public.predictive_audit_log FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage pred audits" ON public.predictive_audit_log FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view friction" ON public.structural_friction_log FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage friction" ON public.structural_friction_log FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view opt proposals" ON public.optimization_proposals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage opt proposals" ON public.optimization_proposals FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view complexity" ON public.complexity_budget_registry FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage complexity" ON public.complexity_budget_registry FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view antifragility" ON public.antifragility_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage antifragility" ON public.antifragility_metrics FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth view sys health" ON public.system_health_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage sys health" ON public.system_health_snapshots FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view opt audits" ON public.self_optimization_audit_log FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage opt audits" ON public.self_optimization_audit_log FOR ALL USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_giu_user ON public.governance_influence_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_prop_sims_proposal ON public.proposal_simulation_results(proposal_id);
CREATE INDEX IF NOT EXISTS idx_const_audit_type ON public.constitutional_audit_logs(audit_type);
CREATE INDEX IF NOT EXISTS idx_power_conc_v2_type ON public.power_concentration_metrics_v2(metric_type);
CREATE INDEX IF NOT EXISTS idx_crisis_status ON public.crisis_events(status);
CREATE INDEX IF NOT EXISTS idx_gov_part_user ON public.governance_participation_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_settlement_user ON public.settlement_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_treaty_status ON public.treaty_registry(status);
CREATE INDEX IF NOT EXISTS idx_treaty_logs_treaty ON public.treaty_execution_logs(treaty_id);
CREATE INDEX IF NOT EXISTS idx_jurisdiction_country ON public.jurisdiction_rules(country_code);
CREATE INDEX IF NOT EXISTS idx_index_calc_name ON public.index_calculation_logs(index_name);
CREATE INDEX IF NOT EXISTS idx_macro_sim_type ON public.macro_simulation_results(simulation_type);
CREATE INDEX IF NOT EXISTS idx_pred_region ON public.predictive_region_forecasts(region_code);
CREATE INDEX IF NOT EXISTS idx_pred_skill ON public.predictive_skill_models(skill_name);
CREATE INDEX IF NOT EXISTS idx_pred_inst ON public.institutional_risk_forecasts(institution_id);
CREATE INDEX IF NOT EXISTS idx_capital_stress_scenario ON public.capital_stress_results(scenario);
CREATE INDEX IF NOT EXISTS idx_policy_sim_type ON public.policy_simulation_runs(policy_type);
CREATE INDEX IF NOT EXISTS idx_friction_type ON public.structural_friction_log(friction_type);
CREATE INDEX IF NOT EXISTS idx_opt_proposal_status ON public.optimization_proposals(status);
CREATE INDEX IF NOT EXISTS idx_complexity_layer ON public.complexity_budget_registry(layer);
CREATE INDEX IF NOT EXISTS idx_antifragility_type ON public.antifragility_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_health_snapshot_at ON public.system_health_snapshots(snapshot_at);
