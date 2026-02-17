
-- ============================================
-- PRIVATE ECONOMIC INTELLIGENCE PLATFORM
-- ============================================

CREATE TABLE IF NOT EXISTS public.economic_warehouse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id),
  period TEXT NOT NULL,
  sector TEXT,
  region TEXT,
  funding_volume NUMERIC DEFAULT 0,
  employment_count INTEGER DEFAULT 0,
  startup_count INTEGER DEFAULT 0,
  capital_allocated NUMERIC DEFAULT 0,
  sponsor_activity_count INTEGER DEFAULT 0,
  innovation_density_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sector_growth_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id),
  sector TEXT NOT NULL,
  period TEXT NOT NULL,
  funding_growth_pct NUMERIC DEFAULT 0,
  hiring_growth_pct NUMERIC DEFAULT 0,
  startup_growth_pct NUMERIC DEFAULT 0,
  capital_allocation_pct NUMERIC DEFAULT 0,
  momentum_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.intelligence_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL,
  subscriber_type TEXT NOT NULL DEFAULT 'user',
  tier TEXT NOT NULL DEFAULT 'basic',
  country_id UUID REFERENCES public.countries(id),
  is_global BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  price_monthly NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_allocation_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  recommended_action TEXT NOT NULL,
  confidence_score NUMERIC DEFAULT 0,
  success_probability NUMERIC DEFAULT 0,
  risk_score NUMERIC DEFAULT 0,
  rationale_summary TEXT,
  supporting_metrics JSONB DEFAULT '{}',
  top_factors JSONB DEFAULT '[]',
  confidence_band TEXT DEFAULT 'yellow',
  status TEXT DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  override_reason TEXT,
  country_id UUID REFERENCES public.countries(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.allocation_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_name TEXT NOT NULL,
  scenario_type TEXT DEFAULT 'balanced',
  input_params JSONB DEFAULT '{}',
  projected_completion_rate NUMERIC DEFAULT 0,
  projected_employment NUMERIC DEFAULT 0,
  projected_startup_yield NUMERIC DEFAULT 0,
  projected_capital_efficiency NUMERIC DEFAULT 0,
  projected_risk_exposure NUMERIC DEFAULT 0,
  created_by UUID,
  country_id UUID REFERENCES public.countries(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version TEXT NOT NULL,
  prediction_accuracy_pct NUMERIC DEFAULT 0,
  allocation_success_rate NUMERIC DEFAULT 0,
  dispute_reduction_pct NUMERIC DEFAULT 0,
  employment_improvement_pct NUMERIC DEFAULT 0,
  capital_efficiency_gain_pct NUMERIC DEFAULT 0,
  bias_indicators JSONB DEFAULT '{}',
  measured_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_bias_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bias_type TEXT NOT NULL,
  severity TEXT DEFAULT 'low',
  description TEXT,
  affected_entity_type TEXT,
  affected_entity_id UUID,
  mitigation_action TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.ai_approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID REFERENCES public.ai_allocation_recommendations(id),
  approval_level INTEGER DEFAULT 1,
  approver_role TEXT NOT NULL,
  approver_id UUID,
  decision TEXT DEFAULT 'pending',
  decision_reason TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_override_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID REFERENCES public.ai_allocation_recommendations(id),
  override_by UUID NOT NULL,
  original_action TEXT,
  overridden_action TEXT,
  override_reason TEXT NOT NULL,
  decision_delta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns to existing ai_governance_logs if needed
ALTER TABLE public.ai_governance_logs ADD COLUMN IF NOT EXISTS recommendation_ref_id UUID;
ALTER TABLE public.ai_governance_logs ADD COLUMN IF NOT EXISTS human_decision_text TEXT;
ALTER TABLE public.ai_governance_logs ADD COLUMN IF NOT EXISTS outcome_result_text TEXT;
ALTER TABLE public.ai_governance_logs ADD COLUMN IF NOT EXISTS variance_from_prediction NUMERIC;
ALTER TABLE public.ai_governance_logs ADD COLUMN IF NOT EXISTS performance_impact JSONB DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.sector_momentum_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id),
  sector TEXT NOT NULL,
  momentum_score NUMERIC DEFAULT 0,
  funding_growth_rate NUMERIC DEFAULT 0,
  employment_growth_rate NUMERIC DEFAULT 0,
  startup_formation_rate NUMERIC DEFAULT 0,
  capital_inflow_velocity NUMERIC DEFAULT 0,
  repeat_sponsor_activity NUMERIC DEFAULT 0,
  period TEXT NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.capital_efficiency_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  country_id UUID REFERENCES public.countries(id),
  student_earnings NUMERIC DEFAULT 0,
  employment_conversions INTEGER DEFAULT 0,
  startup_conversions INTEGER DEFAULT 0,
  completion_rate NUMERIC DEFAULT 0,
  total_capital_deployed NUMERIC DEFAULT 0,
  efficiency_score NUMERIC DEFAULT 0,
  period TEXT NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.systemic_risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id),
  risk_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  description TEXT,
  affected_sector TEXT,
  affected_region TEXT,
  metrics JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  resolved_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.strategic_briefing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  requester_type TEXT DEFAULT 'corporate',
  topic TEXT NOT NULL,
  data_scope TEXT,
  risk_sensitivity TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'pending',
  report_url TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.national_signal_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id),
  signal_score NUMERIC DEFAULT 0,
  funding_velocity NUMERIC DEFAULT 0,
  employment_conversion NUMERIC DEFAULT 0,
  startup_formation NUMERIC DEFAULT 0,
  capital_efficiency NUMERIC DEFAULT 0,
  period TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.intelligence_access_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'public',
  country_id UUID REFERENCES public.countries(id),
  is_global BOOLEAN DEFAULT false,
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.global_intelligence_warehouse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id),
  period TEXT NOT NULL,
  national_funding_total NUMERIC DEFAULT 0,
  sector_momentum_avg NUMERIC DEFAULT 0,
  employment_conversion_avg NUMERIC DEFAULT 0,
  startup_density_index NUMERIC DEFAULT 0,
  innovation_signal_score NUMERIC DEFAULT 0,
  capital_efficiency_avg NUMERIC DEFAULT 0,
  risk_adjusted_efficiency NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cross_border_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_country_id UUID REFERENCES public.countries(id),
  target_country_id UUID REFERENCES public.countries(id),
  capital_amount NUMERIC DEFAULT 0,
  sector TEXT,
  projected_employment NUMERIC DEFAULT 0,
  projected_completion_rate NUMERIC DEFAULT 0,
  projected_startup_output NUMERIC DEFAULT 0,
  regulatory_risk TEXT DEFAULT 'medium',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.innovation_node_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id),
  protocol_version TEXT DEFAULT '1.0',
  data_schema JSONB DEFAULT '{}',
  compliance_rules JSONB DEFAULT '{}',
  interop_enabled BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.economic_warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_allocation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_bias_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_override_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_momentum_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_efficiency_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systemic_risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_briefing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.national_signal_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_access_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_intelligence_warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_border_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_node_protocols ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read economic warehouse" ON public.economic_warehouse FOR SELECT USING (true);
CREATE POLICY "Public read sector growth" ON public.sector_growth_metrics FOR SELECT USING (true);
CREATE POLICY "Public read signal index" ON public.national_signal_index FOR SELECT USING (is_public = true);
CREATE POLICY "Public read global warehouse" ON public.global_intelligence_warehouse FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admin manage economic warehouse" ON public.economic_warehouse FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin manage sector growth" ON public.sector_growth_metrics FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin manage signal index" ON public.national_signal_index FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin manage global warehouse" ON public.global_intelligence_warehouse FOR ALL USING (public.is_admin(auth.uid()));

-- Authenticated read + admin write
CREATE POLICY "Auth read ai recs" ON public.ai_allocation_recommendations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage ai recs" ON public.ai_allocation_recommendations FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth read sims" ON public.allocation_simulations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth create sims" ON public.allocation_simulations FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Auth read ai perf" ON public.ai_performance_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage ai perf" ON public.ai_performance_metrics FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin manage bias" ON public.ai_bias_logs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth read bias" ON public.ai_bias_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth read approvals" ON public.ai_approval_workflows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage approvals" ON public.ai_approval_workflows FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin manage overrides" ON public.ai_override_logs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth read overrides" ON public.ai_override_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth read momentum" ON public.sector_momentum_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage momentum" ON public.sector_momentum_index FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth read cap efficiency" ON public.capital_efficiency_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage cap efficiency" ON public.capital_efficiency_index FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth read risk alerts" ON public.systemic_risk_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage risk alerts" ON public.systemic_risk_alerts FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Own briefings" ON public.strategic_briefing_requests FOR SELECT TO authenticated USING (auth.uid() = requester_id);
CREATE POLICY "Create briefings" ON public.strategic_briefing_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Admin manage briefings" ON public.strategic_briefing_requests FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Own intel subs" ON public.intelligence_subscriptions FOR SELECT TO authenticated USING (auth.uid() = subscriber_id);
CREATE POLICY "Create intel subs" ON public.intelligence_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = subscriber_id);
CREATE POLICY "Admin manage intel subs" ON public.intelligence_subscriptions FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Own access levels" ON public.intelligence_access_levels FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin manage access levels" ON public.intelligence_access_levels FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Auth read xborder sims" ON public.cross_border_simulations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth create xborder sims" ON public.cross_border_simulations FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Auth read node protocols" ON public.innovation_node_protocols FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage node protocols" ON public.innovation_node_protocols FOR ALL USING (public.is_admin(auth.uid()));
