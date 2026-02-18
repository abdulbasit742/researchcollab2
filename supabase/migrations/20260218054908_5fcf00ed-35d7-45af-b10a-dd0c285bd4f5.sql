
-- 1. Country Nodes
CREATE TABLE IF NOT EXISTS public.country_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_name TEXT NOT NULL UNIQUE,
  country_code TEXT,
  legal_entity_reference TEXT,
  foundation_alignment_status TEXT DEFAULT 'pending',
  compliance_status TEXT DEFAULT 'pending',
  data_residency_location TEXT,
  currency_supported TEXT[] DEFAULT '{}',
  node_status TEXT NOT NULL DEFAULT 'pilot',
  node_configuration JSONB DEFAULT '{}',
  launch_date DATE,
  certification_status TEXT DEFAULT 'uncertified',
  certification_expires_at DATE,
  risk_level TEXT DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.country_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read country_nodes" ON public.country_nodes FOR SELECT USING (true);
CREATE POLICY "Admin manage country_nodes" ON public.country_nodes FOR ALL USING (public.is_admin(auth.uid()));

-- 2. Node Onboarding Status
CREATE TABLE IF NOT EXISTS public.node_onboarding_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID NOT NULL REFERENCES public.country_nodes(id),
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.node_onboarding_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read node_onboarding" ON public.node_onboarding_status FOR SELECT USING (true);
CREATE POLICY "Admin manage node_onboarding" ON public.node_onboarding_status FOR ALL USING (public.is_admin(auth.uid()));

-- 3. Node Risk Alerts
CREATE TABLE IF NOT EXISTS public.node_risk_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID NOT NULL REFERENCES public.country_nodes(id),
  risk_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  description TEXT NOT NULL,
  detected_values JSONB,
  review_status TEXT DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.node_risk_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read node_risk_alerts" ON public.node_risk_alerts FOR SELECT USING (true);
CREATE POLICY "Admin manage node_risk_alerts" ON public.node_risk_alerts FOR ALL USING (public.is_admin(auth.uid()));

-- 4. Enterprise Domains
CREATE TABLE IF NOT EXISTS public.enterprise_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_name TEXT NOT NULL UNIQUE,
  domain_director TEXT,
  authority_scope JSONB DEFAULT '{}',
  decision_boundaries JSONB DEFAULT '{}',
  kpi_ownership TEXT[] DEFAULT '{}',
  tier INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.enterprise_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read enterprise_domains" ON public.enterprise_domains FOR SELECT USING (true);
CREATE POLICY "Admin manage enterprise_domains" ON public.enterprise_domains FOR ALL USING (public.is_admin(auth.uid()));

-- 5. Decision Rights Matrix
CREATE TABLE IF NOT EXISTS public.decision_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_type TEXT NOT NULL,
  domain_id UUID REFERENCES public.enterprise_domains(id),
  proposer_role TEXT NOT NULL,
  reviewer_role TEXT NOT NULL,
  approver_role TEXT NOT NULL,
  veto_authority TEXT,
  documentation_required BOOLEAN DEFAULT true,
  escalation_path TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.decision_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read decision_matrix" ON public.decision_matrix FOR SELECT USING (true);
CREATE POLICY "Admin manage decision_matrix" ON public.decision_matrix FOR ALL USING (public.is_admin(auth.uid()));

-- 6. Node Launch Workspaces
CREATE TABLE IF NOT EXISTS public.node_launch_workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID NOT NULL REFERENCES public.country_nodes(id),
  legal_checklist JSONB DEFAULT '[]',
  compliance_tracker JSONB DEFAULT '[]',
  capital_readiness JSONB DEFAULT '{}',
  arbitration_alignment TEXT DEFAULT 'pending',
  data_residency_config JSONB DEFAULT '{}',
  foundation_certification TEXT DEFAULT 'pending',
  overall_progress NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.node_launch_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read node_launch_workspaces" ON public.node_launch_workspaces FOR SELECT USING (true);
CREATE POLICY "Admin manage node_launch_workspaces" ON public.node_launch_workspaces FOR ALL USING (public.is_admin(auth.uid()));

-- 7. Expansion Throttle Rules
CREATE TABLE IF NOT EXISTS public.expansion_throttle_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_description TEXT,
  threshold_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  is_blocking BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expansion_throttle_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read expansion_throttle" ON public.expansion_throttle_rules FOR SELECT USING (true);
CREATE POLICY "Admin manage expansion_throttle" ON public.expansion_throttle_rules FOR ALL USING (public.is_admin(auth.uid()));
