
-- Platform Constitution System
CREATE TABLE IF NOT EXISTS public.platform_constitution_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version INTEGER NOT NULL,
  principles JSONB NOT NULL DEFAULT '[]',
  economic_rules JSONB NOT NULL DEFAULT '[]',
  governance_rules JSONB NOT NULL DEFAULT '[]',
  amendment_process TEXT,
  ratified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_constitution_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read constitution" ON public.platform_constitution_versions FOR SELECT USING (true);
CREATE POLICY "Admin insert constitution" ON public.platform_constitution_versions FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.constitution_amendments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposed_by UUID REFERENCES public.profiles(id),
  description TEXT NOT NULL,
  impact_analysis JSONB,
  approval_status TEXT NOT NULL DEFAULT 'proposed',
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.constitution_amendments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read amendments" ON public.constitution_amendments FOR SELECT USING (true);
CREATE POLICY "Auth insert amendments" ON public.constitution_amendments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin update amendments" ON public.constitution_amendments FOR UPDATE USING (public.is_admin(auth.uid()));

-- Governance Decisions Traceability
CREATE TABLE IF NOT EXISTS public.governance_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_type TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_systems TEXT[] DEFAULT '{}',
  economic_impact TEXT,
  trust_impact TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gov decisions" ON public.governance_decisions FOR SELECT USING (true);
CREATE POLICY "Admin insert gov decisions" ON public.governance_decisions FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Power Distribution Monitor
CREATE TABLE IF NOT EXISTS public.power_distribution_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_actions_count INTEGER DEFAULT 0,
  institutional_influence_score NUMERIC DEFAULT 0,
  top_1_percent_revenue_share NUMERIC DEFAULT 0,
  trust_concentration_score NUMERIC DEFAULT 0,
  decision_authority_spread NUMERIC DEFAULT 0,
  alert_triggered BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.power_distribution_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read power metrics" ON public.power_distribution_metrics FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin manage power metrics" ON public.power_distribution_metrics FOR ALL USING (public.is_admin(auth.uid()));

-- Feature Proposals
CREATE TABLE IF NOT EXISTS public.feature_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL,
  description TEXT,
  complexity_score INTEGER DEFAULT 0,
  projected_revenue_impact TEXT,
  projected_trust_impact TEXT,
  approval_status TEXT NOT NULL DEFAULT 'proposed',
  proposed_by UUID REFERENCES public.profiles(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read feature proposals" ON public.feature_proposals FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin manage feature proposals" ON public.feature_proposals FOR ALL USING (public.is_admin(auth.uid()));

-- Economic Fairness Reports
CREATE TABLE IF NOT EXISTS public.economic_fairness_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period TEXT NOT NULL,
  revenue_distribution JSONB DEFAULT '{}',
  fee_distribution JSONB DEFAULT '{}',
  trust_tier_distribution JSONB DEFAULT '{}',
  dispute_rate_by_tier JSONB DEFAULT '{}',
  fairness_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.economic_fairness_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read fairness" ON public.economic_fairness_reports FOR SELECT USING (true);
CREATE POLICY "Admin manage fairness" ON public.economic_fairness_reports FOR ALL USING (public.is_admin(auth.uid()));

-- Trust Calculation Audit
CREATE TABLE IF NOT EXISTS public.trust_calculation_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  input_factors JSONB NOT NULL DEFAULT '{}',
  output_score INTEGER NOT NULL,
  delta INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trust_calculation_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read trust audit" ON public.trust_calculation_audit FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "System insert trust audit" ON public.trust_calculation_audit FOR INSERT WITH CHECK (true);

-- AI Governance Logs
CREATE TABLE IF NOT EXISTS public.ai_governance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_version TEXT,
  request_type TEXT NOT NULL,
  decision_summary TEXT,
  bias_flag BOOLEAN DEFAULT false,
  override_flag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_governance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read ai gov logs" ON public.ai_governance_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "System insert ai gov logs" ON public.ai_governance_logs FOR INSERT WITH CHECK (true);

-- Platform Crisis Modes
CREATE TABLE IF NOT EXISTS public.platform_crisis_modes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type TEXT NOT NULL,
  activated_by UUID REFERENCES public.profiles(id),
  restrictions_applied JSONB DEFAULT '[]',
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);
ALTER TABLE public.platform_crisis_modes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read crisis" ON public.platform_crisis_modes FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin manage crisis" ON public.platform_crisis_modes FOR ALL USING (public.is_admin(auth.uid()));

-- Evolution Scenarios
CREATE TABLE IF NOT EXISTS public.evolution_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposed_change TEXT NOT NULL,
  economic_simulation_result JSONB DEFAULT '{}',
  trust_simulation_result JSONB DEFAULT '{}',
  liquidity_impact TEXT,
  projected_growth_impact TEXT,
  simulated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.evolution_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read scenarios" ON public.evolution_scenarios FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin manage scenarios" ON public.evolution_scenarios FOR ALL USING (public.is_admin(auth.uid()));

-- Platform Stewards
CREATE TABLE IF NOT EXISTS public.platform_stewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  steward_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT NOT NULL,
  authority_scope TEXT,
  term_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  term_end TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_stewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read stewards" ON public.platform_stewards FOR SELECT USING (true);
CREATE POLICY "Admin manage stewards" ON public.platform_stewards FOR ALL USING (public.is_admin(auth.uid()));
