
-- Research Portfolios
CREATE TABLE public.research_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL DEFAULT 'institution',
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_budget NUMERIC DEFAULT 0,
  strategy_profile JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.research_portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own portfolios" ON public.research_portfolios
  FOR ALL USING (auth.uid() = owner_id);

-- Portfolio Allocations
CREATE TABLE public.portfolio_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.research_portfolios(id) ON DELETE CASCADE NOT NULL,
  project_title TEXT NOT NULL,
  project_reference_id UUID,
  workspace_id UUID,
  allocated_budget NUMERIC DEFAULT 0,
  risk_score NUMERIC DEFAULT 50,
  expected_impact_score NUMERIC DEFAULT 50,
  trust_score NUMERIC DEFAULT 50,
  knowledge_stability_score NUMERIC DEFAULT 50,
  policy_alignment_score NUMERIC DEFAULT 50,
  diversification_score NUMERIC DEFAULT 50,
  capital_efficiency_score NUMERIC DEFAULT 50,
  cross_border_index NUMERIC DEFAULT 0,
  innovation_novelty_index NUMERIC DEFAULT 50,
  institutional_capacity_load NUMERIC DEFAULT 50,
  impact_per_capital NUMERIC DEFAULT 0,
  is_underfunded_high_potential BOOLEAN DEFAULT false,
  region TEXT,
  sector TEXT,
  stage TEXT DEFAULT 'early',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage allocations via portfolio" ON public.portfolio_allocations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.research_portfolios rp WHERE rp.id = portfolio_id AND rp.owner_id = auth.uid())
  );

-- Portfolio Snapshots
CREATE TABLE public.portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.research_portfolios(id) ON DELETE CASCADE NOT NULL,
  snapshot_type TEXT DEFAULT 'optimization',
  snapshot_data JSONB DEFAULT '{}',
  optimization_inputs JSONB,
  weights_used JSONB,
  alternatives_rejected JSONB,
  confidence_score NUMERIC DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view snapshots via portfolio" ON public.portfolio_snapshots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.research_portfolios rp WHERE rp.id = portfolio_id AND rp.owner_id = auth.uid())
  );
