
-- Research Capital Assets
CREATE TABLE public.research_capital_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  underlying_project_id UUID,
  backing_type TEXT NOT NULL CHECK (backing_type IN ('project_backed','milestone_backed','institution_backed','sovereign_grant','cross_border_research')),
  risk_score NUMERIC NOT NULL DEFAULT 50,
  expected_return NUMERIC NOT NULL DEFAULT 0,
  maturity_period INT NOT NULL DEFAULT 365,
  compliance_status TEXT NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('pending','approved','rejected','expired')),
  region_scope TEXT[] NOT NULL DEFAULT '{}',
  tenant_id UUID,
  total_value NUMERIC NOT NULL DEFAULT 0,
  escrow_backing_amount NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Institution Credit Profiles
CREATE TABLE public.institution_credit_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  credit_score NUMERIC NOT NULL DEFAULT 50,
  rating_band TEXT NOT NULL DEFAULT 'BBB',
  volatility_index NUMERIC NOT NULL DEFAULT 0,
  completion_rate NUMERIC NOT NULL DEFAULT 0,
  dispute_rate NUMERIC NOT NULL DEFAULT 0,
  capital_return_consistency NUMERIC NOT NULL DEFAULT 0,
  governance_participation NUMERIC NOT NULL DEFAULT 0,
  compliance_health NUMERIC NOT NULL DEFAULT 0,
  trust_stability NUMERIC NOT NULL DEFAULT 0,
  liquidity_discipline NUMERIC NOT NULL DEFAULT 0,
  capital_access_limit NUMERIC NOT NULL DEFAULT 100000,
  bond_issuance_limit NUMERIC NOT NULL DEFAULT 50000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Research Bonds
CREATE TABLE public.research_bonds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issuing_institution UUID NOT NULL,
  bond_name TEXT NOT NULL,
  total_principal NUMERIC NOT NULL,
  maturity_date TIMESTAMPTZ NOT NULL,
  risk_score NUMERIC NOT NULL DEFAULT 50,
  escrow_locked_amount NUMERIC NOT NULL DEFAULT 0,
  default_probability NUMERIC NOT NULL DEFAULT 0,
  coupon_rate NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','active','matured','defaulted','cancelled')),
  backing_asset_ids UUID[] NOT NULL DEFAULT '{}',
  compliance_approved BOOLEAN NOT NULL DEFAULT false,
  governance_approved BOOLEAN NOT NULL DEFAULT false,
  region_scope TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_research_capital_assets_type ON public.research_capital_assets(backing_type);
CREATE INDEX idx_research_capital_assets_tenant ON public.research_capital_assets(tenant_id);
CREATE INDEX idx_institution_credit_profiles_tenant ON public.institution_credit_profiles(tenant_id);
CREATE INDEX idx_research_bonds_institution ON public.research_bonds(issuing_institution);
CREATE INDEX idx_research_bonds_status ON public.research_bonds(status);

-- RLS
ALTER TABLE public.research_capital_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_credit_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_bonds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read research_capital_assets" ON public.research_capital_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read institution_credit_profiles" ON public.institution_credit_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read research_bonds" ON public.research_bonds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service manage research_capital_assets" ON public.research_capital_assets FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage institution_credit_profiles" ON public.institution_credit_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage research_bonds" ON public.research_bonds FOR ALL TO service_role USING (true) WITH CHECK (true);
