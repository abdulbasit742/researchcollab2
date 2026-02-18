
-- Financial Reporting Dashboard
CREATE TABLE public.financial_reporting_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type TEXT NOT NULL DEFAULT 'quarterly',
  period_label TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  revenue_by_segment JSONB DEFAULT '{}',
  cost_of_revenue NUMERIC DEFAULT 0,
  gross_margin NUMERIC DEFAULT 0,
  operating_margin NUMERIC DEFAULT 0,
  ebitda NUMERIC DEFAULT 0,
  net_income NUMERIC DEFAULT 0,
  cash_flow NUMERIC DEFAULT 0,
  runway_months NUMERIC DEFAULT 0,
  burn_multiple NUMERIC DEFAULT 0,
  contribution_margin_per_segment JSONB DEFAULT '{}',
  deferred_revenue NUMERIC DEFAULT 0,
  escrow_liability NUMERIC DEFAULT 0,
  multi_currency_normalized BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.financial_reporting_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage financial reports" ON public.financial_reporting_periods FOR ALL USING (public.is_admin(auth.uid()));

-- Internal Controls Log
CREATE TABLE public.internal_controls_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  actor_id UUID,
  severity TEXT DEFAULT 'info',
  override_detected BOOLEAN DEFAULT false,
  reconciliation_status TEXT,
  details JSONB DEFAULT '{}',
  logged_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.internal_controls_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage controls log" ON public.internal_controls_log FOR ALL USING (public.is_admin(auth.uid()));

-- Board Governance Matrix
CREATE TABLE public.board_governance_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_title TEXT NOT NULL,
  seat_type TEXT NOT NULL,
  holder_name TEXT,
  committee_memberships TEXT[] DEFAULT '{}',
  decision_authority JSONB DEFAULT '{}',
  appointed_at TIMESTAMPTZ,
  term_expires_at TIMESTAMPTZ,
  is_independent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.board_governance_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage board" ON public.board_governance_matrix FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth read board" ON public.board_governance_matrix FOR SELECT TO authenticated USING (true);

-- Audit Preparation Module
CREATE TABLE public.audit_preparation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  documentation_url TEXT,
  last_reviewed TIMESTAMPTZ,
  reviewer_id UUID,
  notes TEXT,
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.audit_preparation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage audit items" ON public.audit_preparation_items FOR ALL USING (public.is_admin(auth.uid()));

-- Public Market KPI Standards
CREATE TABLE public.ipo_kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  gmv NUMERIC DEFAULT 0,
  net_revenue NUMERIC DEFAULT 0,
  take_rate NUMERIC DEFAULT 0,
  gross_margin NUMERIC DEFAULT 0,
  intelligence_arr NUMERIC DEFAULT 0,
  net_revenue_retention NUMERIC DEFAULT 0,
  churn_rate NUMERIC DEFAULT 0,
  cac NUMERIC DEFAULT 0,
  ltv NUMERIC DEFAULT 0,
  dispute_rate NUMERIC DEFAULT 0,
  startup_survival_rate NUMERIC DEFAULT 0,
  employment_conversion_rate NUMERIC DEFAULT 0,
  node_expansion_rate NUMERIC DEFAULT 0,
  data_moat_growth_index NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ipo_kpi_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage kpi snapshots" ON public.ipo_kpi_snapshots FOR ALL USING (public.is_admin(auth.uid()));
