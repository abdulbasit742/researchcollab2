
-- Investor Metrics: canonical KPIs for institutional reporting
CREATE TABLE public.investor_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gmv NUMERIC DEFAULT 0,
  escrow_volume NUMERIC DEFAULT 0,
  capital_velocity NUMERIC DEFAULT 0,
  net_platform_revenue NUMERIC DEFAULT 0,
  take_rate_percent NUMERIC DEFAULT 0,
  cac NUMERIC DEFAULT 0,
  ltv NUMERIC DEFAULT 0,
  retention_rate NUMERIC DEFAULT 0,
  churn_rate NUMERIC DEFAULT 0,
  dispute_rate_percent NUMERIC DEFAULT 0,
  startup_survival_rate NUMERIC DEFAULT 0,
  employment_conversion_rate NUMERIC DEFAULT 0,
  node_growth_rate NUMERIC DEFAULT 0,
  intelligence_subscription_growth NUMERIC DEFAULT 0,
  corporate_alliance_count INTEGER DEFAULT 0,
  government_participation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(metric_date)
);
ALTER TABLE public.investor_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage investor metrics" ON public.investor_metrics FOR ALL USING (public.is_admin(auth.uid()));

-- Unit Economics per segment
CREATE TABLE public.unit_economics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period DATE NOT NULL DEFAULT CURRENT_DATE,
  segment TEXT NOT NULL CHECK (segment IN ('student','founder','corporate','capital_pool','government','intelligence_subscriber')),
  revenue NUMERIC DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  infrastructure_load NUMERIC DEFAULT 0,
  retention NUMERIC DEFAULT 0,
  upsell_probability NUMERIC DEFAULT 0,
  cross_sell_probability NUMERIC DEFAULT 0,
  user_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(period, segment)
);
ALTER TABLE public.unit_economics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage unit economics" ON public.unit_economics FOR ALL USING (public.is_admin(auth.uid()));

-- Revenue Projection Scenarios
CREATE TABLE public.revenue_projections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_name TEXT NOT NULL,
  user_count_tier TEXT NOT NULL,
  node_count INTEGER DEFAULT 1,
  escrow_commission NUMERIC DEFAULT 0,
  intelligence_subscriptions NUMERIC DEFAULT 0,
  enterprise_contracts NUMERIC DEFAULT 0,
  government_contracts NUMERIC DEFAULT 0,
  ecosystem_commissions NUMERIC DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  infrastructure_cost NUMERIC DEFAULT 0,
  gross_margin NUMERIC DEFAULT 0,
  operating_margin NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage revenue projections" ON public.revenue_projections FOR ALL USING (public.is_admin(auth.uid()));

-- Defensibility / Moat Mapping
CREATE TABLE public.moat_pillars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pillar_name TEXT NOT NULL,
  description TEXT,
  replicability_risk NUMERIC DEFAULT 50,
  data_advantage_depth NUMERIC DEFAULT 50,
  switching_cost NUMERIC DEFAULT 50,
  time_to_replicate_months INTEGER DEFAULT 24,
  composite_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.moat_pillars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage moat pillars" ON public.moat_pillars FOR ALL USING (public.is_admin(auth.uid()));

-- Competitor Comparison
CREATE TABLE public.competitor_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_name TEXT NOT NULL,
  competitor_type TEXT NOT NULL,
  trust_verifiability NUMERIC DEFAULT 0,
  escrow_integrity NUMERIC DEFAULT 0,
  capital_integration NUMERIC DEFAULT 0,
  arbitration_structure NUMERIC DEFAULT 0,
  intelligence_forecasting NUMERIC DEFAULT 0,
  governance_neutrality NUMERIC DEFAULT 0,
  cross_border_capability NUMERIC DEFAULT 0,
  institutional_scalability NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage competitor analysis" ON public.competitor_analysis FOR ALL USING (public.is_admin(auth.uid()));

-- Valuation Model
CREATE TABLE public.valuation_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gmv_growth NUMERIC DEFAULT 0,
  revenue_growth NUMERIC DEFAULT 0,
  take_rate NUMERIC DEFAULT 0,
  intelligence_arr NUMERIC DEFAULT 0,
  node_velocity NUMERIC DEFAULT 0,
  alliance_density NUMERIC DEFAULT 0,
  government_contracts_count INTEGER DEFAULT 0,
  retention NUMERIC DEFAULT 0,
  data_moat_score NUMERIC DEFAULT 0,
  saas_multiple NUMERIC DEFAULT 0,
  infra_multiple NUMERIC DEFAULT 0,
  fintech_multiple NUMERIC DEFAULT 0,
  intelligence_multiple NUMERIC DEFAULT 0,
  valuation_low NUMERIC DEFAULT 0,
  valuation_mid NUMERIC DEFAULT 0,
  valuation_high NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.valuation_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage valuation models" ON public.valuation_models FOR ALL USING (public.is_admin(auth.uid()));

-- Risk Disclosure
CREATE TABLE public.risk_disclosures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_category TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low','medium','high','critical')),
  description TEXT NOT NULL,
  probability NUMERIC DEFAULT 0,
  impact_score NUMERIC DEFAULT 0,
  mitigation_strategy TEXT,
  residual_risk NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risk_disclosures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage risk disclosures" ON public.risk_disclosures FOR ALL USING (public.is_admin(auth.uid()));

-- Board Reports
CREATE TABLE public.board_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_quarter TEXT NOT NULL,
  report_year INTEGER NOT NULL,
  kpi_summary JSONB DEFAULT '{}',
  capital_efficiency JSONB DEFAULT '{}',
  risk_dashboard JSONB DEFAULT '{}',
  node_expansion JSONB DEFAULT '{}',
  alliance_growth JSONB DEFAULT '{}',
  intelligence_revenue JSONB DEFAULT '{}',
  compliance_status JSONB DEFAULT '{}',
  arbitration_metrics JSONB DEFAULT '{}',
  security_overview JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_published BOOLEAN DEFAULT false
);
ALTER TABLE public.board_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage board reports" ON public.board_reports FOR ALL USING (public.is_admin(auth.uid()));
