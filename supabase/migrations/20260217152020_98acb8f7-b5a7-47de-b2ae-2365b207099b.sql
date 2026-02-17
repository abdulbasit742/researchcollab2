
-- ============================================================
-- LAYER 16: Interoperable Multi-Civilization Economic Network
-- ============================================================

CREATE TABLE public.federation_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID REFERENCES public.federated_nodes(id),
  partner_node_id UUID REFERENCES public.federated_nodes(id),
  federation_id TEXT NOT NULL,
  handshake_status TEXT NOT NULL DEFAULT 'pending' CHECK (handshake_status IN ('pending','active','suspended','terminated')),
  trust_schema_hash TEXT,
  escrow_guarantee_hash TEXT,
  governance_framework_hash TEXT,
  constitutional_fingerprint TEXT,
  compatibility_score NUMERIC DEFAULT 0,
  established_at TIMESTAMPTZ DEFAULT now(),
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);
ALTER TABLE public.federation_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage federation registry" ON public.federation_registry FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated read federation registry" ON public.federation_registry FOR SELECT USING (auth.role() = 'authenticated');
CREATE INDEX idx_federation_registry_nodes ON public.federation_registry(node_id, partner_node_id);
CREATE INDEX idx_federation_registry_status ON public.federation_registry(handshake_status);

CREATE TABLE public.trust_translation_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id UUID REFERENCES public.federated_nodes(id),
  target_node_id UUID REFERENCES public.federated_nodes(id),
  source_trust_band TEXT NOT NULL,
  target_risk_band TEXT NOT NULL,
  confidence_score NUMERIC DEFAULT 0,
  validation_method TEXT DEFAULT 'historical_cross_validation',
  sample_size INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.trust_translation_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage trust translation" ON public.trust_translation_matrix FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated read trust translation" ON public.trust_translation_matrix FOR SELECT USING (auth.role() = 'authenticated');

CREATE TABLE public.cross_node_capital_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id UUID REFERENCES public.federated_nodes(id),
  target_node_id UUID REFERENCES public.federated_nodes(id),
  flow_type TEXT NOT NULL CHECK (flow_type IN ('funding_pool','milestone_financing','liquidity_sharing','stabilization')),
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  exposure_cap NUMERIC,
  risk_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed','rejected','frozen')),
  escrow_reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.cross_node_capital_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage capital flows" ON public.cross_node_capital_flows FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated read capital flows" ON public.cross_node_capital_flows FOR SELECT USING (auth.role() = 'authenticated');
CREATE INDEX idx_cross_node_capital_status ON public.cross_node_capital_flows(status);

CREATE TABLE public.credential_federation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id UUID REFERENCES public.federated_nodes(id),
  target_node_id UUID REFERENCES public.federated_nodes(id),
  credential_type TEXT NOT NULL,
  credential_hash TEXT NOT NULL,
  verification_result TEXT CHECK (verification_result IN ('valid','invalid','expired','revoked','pending')),
  cross_signature_valid BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);
ALTER TABLE public.credential_federation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage credential federation" ON public.credential_federation_logs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated read credential federation" ON public.credential_federation_logs FOR SELECT USING (auth.role() = 'authenticated');

CREATE TABLE public.federation_arbitration_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disputing_node_a UUID REFERENCES public.federated_nodes(id),
  disputing_node_b UUID REFERENCES public.federated_nodes(id),
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('trust_mismatch','capital_exposure','credential_validity','protocol_violation')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','arbitrating','resolved','escalated')),
  ai_fault_probability NUMERIC,
  resolution_summary TEXT,
  escrow_frozen BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.federation_arbitration_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage arbitration" ON public.federation_arbitration_registry FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated read arbitration" ON public.federation_arbitration_registry FOR SELECT USING (auth.role() = 'authenticated');

CREATE TABLE public.multi_node_index_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID REFERENCES public.federated_nodes(id),
  index_type TEXT NOT NULL CHECK (index_type IN ('productivity','skill_density','capital_efficiency','trust_stability','governance_responsiveness')),
  index_value NUMERIC NOT NULL DEFAULT 0,
  period TEXT NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  methodology_version TEXT DEFAULT 'v1.0'
);
ALTER TABLE public.multi_node_index_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read multi node index" ON public.multi_node_index_data FOR SELECT USING (true);
CREATE POLICY "Admins manage multi node index" ON public.multi_node_index_data FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.node_reputation_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID REFERENCES public.federated_nodes(id) UNIQUE,
  overall_score NUMERIC DEFAULT 50,
  trust_reliability NUMERIC DEFAULT 50,
  capital_compliance NUMERIC DEFAULT 50,
  governance_integrity NUMERIC DEFAULT 50,
  protocol_adherence NUMERIC DEFAULT 50,
  isolation_risk TEXT DEFAULT 'none' CHECK (isolation_risk IN ('none','low','medium','high','isolated')),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.node_reputation_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read node reputation" ON public.node_reputation_scores FOR SELECT USING (true);
CREATE POLICY "Admins manage node reputation" ON public.node_reputation_scores FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.federation_risk_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_type TEXT NOT NULL,
  affected_nodes UUID[] DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'medium',
  ai_confidence NUMERIC DEFAULT 0,
  simulation_summary JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.federation_risk_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage federation risk" ON public.federation_risk_audit_log FOR ALL USING (public.is_admin(auth.uid()));

-- ============================================================
-- LAYER 17: Global Infrastructure Synchronization
-- ============================================================

CREATE TABLE public.infrastructure_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  infrastructure_type TEXT NOT NULL CHECK (infrastructure_type IN ('energy','manufacturing','logistics','research_center','development_project','public_program')),
  region_code TEXT NOT NULL,
  sovereign_node_id UUID REFERENCES public.federated_nodes(id),
  capacity_metrics JSONB DEFAULT '{}',
  talent_demand_forecast JSONB DEFAULT '{}',
  capital_requirement NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  completion_timeline TEXT,
  regulatory_jurisdiction TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('planned','active','completed','suspended','decommissioned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.infrastructure_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read infrastructure" ON public.infrastructure_registry FOR SELECT USING (true);
CREATE POLICY "Admins manage infrastructure" ON public.infrastructure_registry FOR ALL USING (public.is_admin(auth.uid()));
CREATE INDEX idx_infra_region ON public.infrastructure_registry(region_code);
CREATE INDEX idx_infra_type ON public.infrastructure_registry(infrastructure_type);

CREATE TABLE public.infrastructure_capital_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  infrastructure_id UUID REFERENCES public.infrastructure_registry(id),
  source_type TEXT NOT NULL CHECK (source_type IN ('development_bank','sovereign_pool','institutional','private')),
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  fx_risk_adjustment NUMERIC DEFAULT 0,
  political_risk_overlay NUMERIC DEFAULT 0,
  yield_projection NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','committed','disbursed','completed','frozen')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.infrastructure_capital_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage infra capital" ON public.infrastructure_capital_flows FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated read infra capital" ON public.infrastructure_capital_flows FOR SELECT USING (auth.role() = 'authenticated');

CREATE TABLE public.talent_infrastructure_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  infrastructure_id UUID REFERENCES public.infrastructure_registry(id),
  trust_band TEXT,
  credit_band TEXT,
  mobility_eligible BOOLEAN DEFAULT false,
  match_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested','applied','accepted','rejected','completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.talent_infrastructure_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own matches" ON public.talent_infrastructure_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage talent matches" ON public.talent_infrastructure_matches FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.production_capacity_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  infrastructure_id UUID REFERENCES public.infrastructure_registry(id),
  production_efficiency_score NUMERIC DEFAULT 0,
  capacity_utilization_pct NUMERIC DEFAULT 0,
  infrastructure_strain_risk TEXT DEFAULT 'low' CHECK (infrastructure_strain_risk IN ('low','moderate','high','critical')),
  talent_absorption_capacity INTEGER DEFAULT 0,
  capital_to_output_ratio NUMERIC DEFAULT 0,
  measured_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.production_capacity_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read production metrics" ON public.production_capacity_metrics FOR SELECT USING (true);
CREATE POLICY "Admins manage production metrics" ON public.production_capacity_metrics FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.development_transparency_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  infrastructure_id UUID REFERENCES public.infrastructure_registry(id),
  milestone_title TEXT NOT NULL,
  milestone_status TEXT DEFAULT 'pending' CHECK (milestone_status IN ('pending','in_progress','completed','delayed','failed')),
  capital_deployed NUMERIC DEFAULT 0,
  workforce_verified INTEGER DEFAULT 0,
  delay_days INTEGER DEFAULT 0,
  trust_movement NUMERIC DEFAULT 0,
  logged_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.development_transparency_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read dev ledger" ON public.development_transparency_ledger FOR SELECT USING (true);
CREATE POLICY "Admins manage dev ledger" ON public.development_transparency_ledger FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.infrastructure_risk_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  infrastructure_id UUID REFERENCES public.infrastructure_registry(id),
  signal_type TEXT NOT NULL CHECK (signal_type IN ('supply_chain','capital_freeze','political','talent_bottleneck','natural_disaster')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  ai_confidence NUMERIC DEFAULT 0,
  recommended_action TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.infrastructure_risk_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage infra risk" ON public.infrastructure_risk_signals FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated read infra risk" ON public.infrastructure_risk_signals FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- LAYER 18: Planetary & Interplanetary Economic Coordination
-- ============================================================

CREATE TABLE public.planetary_node_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_name TEXT NOT NULL,
  celestial_body TEXT NOT NULL DEFAULT 'earth' CHECK (celestial_body IN ('earth','orbital','lunar','mars','deep_sea','habitat')),
  governance_framework_hash TEXT,
  trust_schema_metadata JSONB DEFAULT '{}',
  communication_latency_band TEXT DEFAULT 'realtime' CHECK (communication_latency_band IN ('realtime','minutes','hours','extended_blackout')),
  resource_production_profile JSONB DEFAULT '{}',
  capital_liquidity_class TEXT DEFAULT 'standard',
  survival_dependency_index NUMERIC DEFAULT 0,
  population_estimate INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','establishing','suspended','lost_contact')),
  registered_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.planetary_node_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read planetary nodes" ON public.planetary_node_registry FOR SELECT USING (true);
CREATE POLICY "Admins manage planetary nodes" ON public.planetary_node_registry FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.latency_governance_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planetary_node_id UUID REFERENCES public.planetary_node_registry(id),
  governance_action TEXT NOT NULL,
  vote_window_hours INTEGER DEFAULT 24,
  quorum_model TEXT DEFAULT 'predictive',
  consensus_method TEXT DEFAULT 'async_aggregation',
  latency_band TEXT,
  emergency_autonomy_triggered BOOLEAN DEFAULT false,
  initiated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.latency_governance_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage latency governance" ON public.latency_governance_log FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated read latency governance" ON public.latency_governance_log FOR SELECT USING (auth.role() = 'authenticated');

CREATE TABLE public.interplanetary_capital_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id UUID REFERENCES public.planetary_node_registry(id),
  target_node_id UUID REFERENCES public.planetary_node_registry(id),
  flow_type TEXT NOT NULL CHECK (flow_type IN ('resource_backed','energy_credit','delayed_settlement','conditional_milestone')),
  amount NUMERIC NOT NULL DEFAULT 0,
  settlement_delay_hours INTEGER DEFAULT 0,
  resource_backing_type TEXT,
  risk_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_transit','settled','failed','frozen')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.interplanetary_capital_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage interplanetary capital" ON public.interplanetary_capital_flows FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated read interplanetary capital" ON public.interplanetary_capital_flows FOR SELECT USING (auth.role() = 'authenticated');

CREATE TABLE public.resource_productivity_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planetary_node_id UUID REFERENCES public.planetary_node_registry(id),
  energy_productivity_ratio NUMERIC DEFAULT 0,
  habitat_capacity_utilization NUMERIC DEFAULT 0,
  resource_extraction_efficiency NUMERIC DEFAULT 0,
  sustainability_index NUMERIC DEFAULT 50,
  colony_viability_score NUMERIC DEFAULT 0,
  capital_sustainability_horizon_years NUMERIC DEFAULT 0,
  measured_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.resource_productivity_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read resource metrics" ON public.resource_productivity_metrics FOR SELECT USING (true);
CREATE POLICY "Admins manage resource metrics" ON public.resource_productivity_metrics FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.interplanetary_treaty_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treaty_name TEXT NOT NULL,
  participating_nodes UUID[] DEFAULT '{}',
  treaty_type TEXT NOT NULL CHECK (treaty_type IN ('resource_sharing','talent_mobility','capital_support','emergency_stabilization','dispute_arbitration')),
  terms JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','ratified','active','suspended','expired')),
  ratified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.interplanetary_treaty_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read interplanetary treaties" ON public.interplanetary_treaty_registry FOR SELECT USING (true);
CREATE POLICY "Admins manage interplanetary treaties" ON public.interplanetary_treaty_registry FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.colony_viability_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planetary_node_id UUID REFERENCES public.planetary_node_registry(id) UNIQUE,
  capital_independence_pct NUMERIC DEFAULT 0,
  resource_earth_reliance_pct NUMERIC DEFAULT 100,
  talent_retention_probability NUMERIC DEFAULT 50,
  governance_fragmentation_risk TEXT DEFAULT 'low' CHECK (governance_fragmentation_risk IN ('low','moderate','high','critical')),
  trust_volatility NUMERIC DEFAULT 0,
  overall_viability NUMERIC DEFAULT 0,
  assessed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.colony_viability_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read colony viability" ON public.colony_viability_scores FOR SELECT USING (true);
CREATE POLICY "Admins manage colony viability" ON public.colony_viability_scores FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.colony_simulation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planetary_node_id UUID REFERENCES public.planetary_node_registry(id),
  simulation_type TEXT NOT NULL CHECK (simulation_type IN ('capital_independence','resource_scarcity','governance_fragmentation','survival_horizon','talent_exodus')),
  time_horizon_years INTEGER DEFAULT 5,
  input_parameters JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  ai_confidence NUMERIC DEFAULT 0,
  run_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.colony_simulation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage colony simulations" ON public.colony_simulation_runs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated read colony simulations" ON public.colony_simulation_runs FOR SELECT USING (auth.role() = 'authenticated');

CREATE TABLE public.planetary_risk_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_type TEXT NOT NULL,
  affected_nodes UUID[] DEFAULT '{}',
  celestial_scope TEXT DEFAULT 'earth',
  severity TEXT DEFAULT 'medium',
  ai_confidence NUMERIC DEFAULT 0,
  containment_model JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.planetary_risk_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage planetary risk" ON public.planetary_risk_audit_log FOR ALL USING (public.is_admin(auth.uid()));
