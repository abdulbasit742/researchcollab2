
-- Node Configuration: per-node jurisdiction settings
CREATE TABLE public.node_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES public.country_nodes(id) ON DELETE CASCADE NOT NULL,
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(node_id, config_key)
);
ALTER TABLE public.node_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage node configs" ON public.node_configurations FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth read node configs" ON public.node_configurations FOR SELECT TO authenticated USING (true);

-- Node Certification
CREATE TABLE public.node_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES public.country_nodes(id) ON DELETE CASCADE NOT NULL,
  certification_type TEXT NOT NULL DEFAULT 'sip_certified',
  escrow_integrity BOOLEAN DEFAULT false,
  arbitration_independence BOOLEAN DEFAULT false,
  trust_transparency BOOLEAN DEFAULT false,
  compliance_audit BOOLEAN DEFAULT false,
  ai_bias_audit BOOLEAN DEFAULT false,
  is_certified BOOLEAN DEFAULT false,
  certified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  renewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.node_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage node certs" ON public.node_certifications FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth read node certs" ON public.node_certifications FOR SELECT TO authenticated USING (true);

-- Node Political Risk Score
CREATE TABLE public.node_political_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES public.country_nodes(id) ON DELETE CASCADE NOT NULL,
  political_instability_score NUMERIC DEFAULT 0,
  government_turnover_risk NUMERIC DEFAULT 0,
  capital_control_risk NUMERIC DEFAULT 0,
  currency_volatility NUMERIC DEFAULT 0,
  regulatory_unpredictability NUMERIC DEFAULT 0,
  overall_risk_score NUMERIC DEFAULT 0,
  risk_level TEXT DEFAULT 'low',
  assessed_at TIMESTAMPTZ DEFAULT now(),
  next_review TIMESTAMPTZ
);
ALTER TABLE public.node_political_risk ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage node risk" ON public.node_political_risk FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth read node risk" ON public.node_political_risk FOR SELECT TO authenticated USING (true);

-- Regulatory Alerts
CREATE TABLE public.regulatory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES public.country_nodes(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  action_taken TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.regulatory_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage reg alerts" ON public.regulatory_alerts FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth read reg alerts" ON public.regulatory_alerts FOR SELECT TO authenticated USING (true);

-- Capital Influence Risk Index
CREATE TABLE public.capital_influence_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_seat_clustering NUMERIC DEFAULT 0,
  share_concentration NUMERIC DEFAULT 0,
  voting_imbalance NUMERIC DEFAULT 0,
  governance_pressure_score NUMERIC DEFAULT 0,
  overall_risk_score NUMERIC DEFAULT 0,
  assessed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);
ALTER TABLE public.capital_influence_risk ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage capital risk" ON public.capital_influence_risk FOR ALL USING (public.is_admin(auth.uid()));

-- Data Access Audit Logs
CREATE TABLE public.data_access_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_type TEXT NOT NULL,
  source_node_id UUID REFERENCES public.country_nodes(id),
  target_node_id UUID REFERENCES public.country_nodes(id),
  queried_by UUID,
  query_summary TEXT,
  data_scope TEXT DEFAULT 'aggregated',
  approved BOOLEAN DEFAULT false,
  logged_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.data_access_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage data audit" ON public.data_access_audit_logs FOR ALL USING (public.is_admin(auth.uid()));
