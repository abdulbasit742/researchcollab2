
-- MODULE 5: Sovereign Node Metrics (sovereign_nodes already exists)
CREATE TABLE public.sovereign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL,
  research_output_index NUMERIC DEFAULT 0,
  execution_efficiency_index NUMERIC DEFAULT 0,
  national_trust_score NUMERIC DEFAULT 0,
  funding_velocity NUMERIC DEFAULT 0,
  talent_retention_rate NUMERIC DEFAULT 0,
  period TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(node_id, period)
);

-- MODULE 6: Cross-Border Collaboration Engine
CREATE TABLE public.cross_border_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  origin_country TEXT NOT NULL,
  partner_country TEXT NOT NULL,
  cross_border_trust_score NUMERIC DEFAULT 50,
  regulatory_flag TEXT DEFAULT 'clear',
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.regulatory_compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  cross_border_project_id UUID REFERENCES public.cross_border_projects(id),
  compliance_status TEXT NOT NULL DEFAULT 'pending',
  audit_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MODULE 7: Governance Intelligence Engine
CREATE TABLE public.governance_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  anomaly_score NUMERIC NOT NULL DEFAULT 0,
  anomaly_type TEXT NOT NULL,
  flagged_reason TEXT,
  severity TEXT DEFAULT 'low',
  status TEXT DEFAULT 'open',
  detected_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.governance_health_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'institution',
  manipulation_risk_score NUMERIC DEFAULT 0,
  endorsement_irregularity_score NUMERIC DEFAULT 0,
  dispute_pattern_score NUMERIC DEFAULT 0,
  governance_composite_score NUMERIC DEFAULT 0,
  grade TEXT DEFAULT 'B',
  period TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_id, period)
);

-- MODULE 8: Human Capital Intelligence Layer
CREATE TABLE public.human_capital_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  skill_growth_rate NUMERIC DEFAULT 0,
  execution_maturity_score NUMERIC DEFAULT 0,
  research_commercialization_index NUMERIC DEFAULT 0,
  graduate_employability_index NUMERIC DEFAULT 0,
  talent_retention_score NUMERIC DEFAULT 0,
  composite_hci NUMERIC DEFAULT 0,
  period TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, period)
);

-- RLS on all new tables
ALTER TABLE public.sovereign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_border_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_health_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.human_capital_index ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated read access
CREATE POLICY "Authenticated read sovereign_metrics" ON public.sovereign_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read cross_border_projects" ON public.cross_border_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own cross_border_projects" ON public.cross_border_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated read compliance_logs" ON public.regulatory_compliance_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert compliance_logs" ON public.regulatory_compliance_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = verified_by);
CREATE POLICY "Authenticated read governance_anomalies" ON public.governance_anomalies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert governance_anomalies" ON public.governance_anomalies FOR INSERT TO authenticated WITH CHECK (auth.uid() = detected_by);
CREATE POLICY "Authenticated read governance_health_index" ON public.governance_health_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read human_capital_index" ON public.human_capital_index FOR SELECT TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_sovereign_metrics_node ON public.sovereign_metrics(node_id);
CREATE INDEX idx_cross_border_origin ON public.cross_border_projects(origin_country);
CREATE INDEX idx_cross_border_partner ON public.cross_border_projects(partner_country);
CREATE INDEX idx_governance_anomalies_entity ON public.governance_anomalies(entity_id);
CREATE INDEX idx_governance_health_entity ON public.governance_health_index(entity_id);
CREATE INDEX idx_human_capital_institution ON public.human_capital_index(institution_id);
