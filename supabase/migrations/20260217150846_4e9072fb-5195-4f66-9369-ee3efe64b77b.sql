
-- Layer 10: Professional Capital & Credit Infrastructure

-- Professional Credit Profiles
CREATE TABLE public.professional_credit_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credit_band TEXT NOT NULL DEFAULT 'C1' CHECK (credit_band IN ('C1','C2','B1','B2','A1','A2')),
  credit_score NUMERIC(5,2) DEFAULT 0,
  deal_completion_reliability NUMERIC(5,2) DEFAULT 0,
  revenue_volatility NUMERIC(5,2) DEFAULT 0,
  escrow_dispute_rate NUMERIC(5,2) DEFAULT 0,
  avg_milestone_size NUMERIC(12,2) DEFAULT 0,
  income_diversification_index NUMERIC(5,2) DEFAULT 0,
  institutional_backing_score NUMERIC(5,2) DEFAULT 0,
  historical_liquidity_tier TEXT DEFAULT 'none',
  probability_of_default NUMERIC(5,4) DEFAULT 0,
  last_computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Capital Advances
CREATE TABLE public.capital_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID,
  milestone_id UUID,
  requested_amount NUMERIC(14,2) NOT NULL,
  approved_amount NUMERIC(14,2),
  discount_rate NUMERIC(5,4),
  net_disbursed NUMERIC(14,2),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','under_review','approved','disbursed','repaying','repaid','defaulted','rejected')),
  credit_band_at_request TEXT,
  risk_score_at_request NUMERIC(5,2),
  repaid_amount NUMERIC(14,2) DEFAULT 0,
  auto_repayment_enabled BOOLEAN DEFAULT true,
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  repaid_at TIMESTAMPTZ,
  defaulted_at TIMESTAMPTZ,
  currency TEXT DEFAULT 'PKR',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Funding Pools
CREATE TABLE public.funding_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pool_type TEXT NOT NULL CHECK (pool_type IN ('university_innovation','corporate_acceleration','regional_growth','custom')),
  institution_id UUID,
  total_capital NUMERIC(16,2) DEFAULT 0,
  deployed_capital NUMERIC(16,2) DEFAULT 0,
  available_capital NUMERIC(16,2) DEFAULT 0,
  total_yield NUMERIC(16,2) DEFAULT 0,
  default_rate NUMERIC(5,4) DEFAULT 0,
  risk_tier TEXT DEFAULT 'moderate' CHECK (risk_tier IN ('conservative','moderate','aggressive')),
  max_exposure_per_advance NUMERIC(5,2) DEFAULT 10,
  currency TEXT DEFAULT 'PKR',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','closed','liquidating')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pool Allocations
CREATE TABLE public.pool_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.funding_pools(id) ON DELETE CASCADE,
  advance_id UUID REFERENCES public.capital_advances(id),
  user_id UUID NOT NULL,
  allocated_amount NUMERIC(14,2) NOT NULL,
  expected_yield NUMERIC(14,2) DEFAULT 0,
  actual_yield NUMERIC(14,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','matured','defaulted','recovered')),
  maturity_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Professional Bonds
CREATE TABLE public.professional_bonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID,
  face_value NUMERIC(14,2) NOT NULL,
  yield_rate NUMERIC(5,4),
  backed_by_escrow BOOLEAN DEFAULT true,
  milestone_performance_score NUMERIC(5,2),
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued','active','matured','defaulted','cancelled')),
  holder_institution_id UUID,
  maturity_date TIMESTAMPTZ,
  currency TEXT DEFAULT 'PKR',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Risk Exposure Log
CREATE TABLE public.risk_exposure_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user','institution','pool','sector','currency')),
  entity_id TEXT NOT NULL,
  exposure_amount NUMERIC(16,2) DEFAULT 0,
  risk_level TEXT DEFAULT 'moderate' CHECK (risk_level IN ('low','moderate','high','critical')),
  risk_factors JSONB DEFAULT '{}',
  leverage_ratio NUMERIC(5,2) DEFAULT 0,
  concentration_risk NUMERIC(5,2) DEFAULT 0,
  cross_currency_exposure NUMERIC(5,2) DEFAULT 0,
  ai_risk_summary TEXT,
  ai_confidence NUMERIC(3,2),
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Capital Recovery Registry
CREATE TABLE public.capital_recovery_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_id UUID REFERENCES public.capital_advances(id),
  user_id UUID NOT NULL,
  original_amount NUMERIC(14,2) NOT NULL,
  recovered_amount NUMERIC(14,2) DEFAULT 0,
  recovery_method TEXT CHECK (recovery_method IN ('structured_repayment','institutional_guarantee','skill_reallocation','governance_mediation')),
  status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated','in_progress','completed','failed','escalated')),
  governance_pod_notified BOOLEAN DEFAULT false,
  trust_impact_applied BOOLEAN DEFAULT false,
  notes TEXT,
  initiated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Yield Tracking
CREATE TABLE public.yield_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES public.funding_pools(id),
  bond_id UUID REFERENCES public.professional_bonds(id),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  gross_yield NUMERIC(14,2) DEFAULT 0,
  net_yield NUMERIC(14,2) DEFAULT 0,
  default_losses NUMERIC(14,2) DEFAULT 0,
  platform_fee NUMERIC(14,2) DEFAULT 0,
  annualized_return NUMERIC(5,4),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Repayment Flows
CREATE TABLE public.repayment_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_id UUID NOT NULL REFERENCES public.capital_advances(id),
  milestone_id UUID,
  amount NUMERIC(14,2) NOT NULL,
  source TEXT CHECK (source IN ('milestone_release','manual','institutional_guarantee','wallet_debit')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.professional_credit_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_exposure_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_recovery_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repayment_flows ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Credit Profiles (users see own, admins see all)
CREATE POLICY "Users view own credit profile" ON public.professional_credit_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all credit profiles" ON public.professional_credit_profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "System manages credit profiles" ON public.professional_credit_profiles FOR ALL USING (public.is_admin(auth.uid()));

-- RLS: Capital Advances
CREATE POLICY "Users view own advances" ON public.capital_advances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users request advances" ON public.capital_advances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage advances" ON public.capital_advances FOR ALL USING (public.is_admin(auth.uid()));

-- RLS: Funding Pools (visible to authenticated)
CREATE POLICY "Authenticated view pools" ON public.funding_pools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage pools" ON public.funding_pools FOR ALL USING (public.is_admin(auth.uid()));

-- RLS: Pool Allocations
CREATE POLICY "Users view own allocations" ON public.pool_allocations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage allocations" ON public.pool_allocations FOR ALL USING (public.is_admin(auth.uid()));

-- RLS: Professional Bonds
CREATE POLICY "Users view own bonds" ON public.professional_bonds FOR SELECT USING (auth.uid() = issuer_id);
CREATE POLICY "Admins manage bonds" ON public.professional_bonds FOR ALL USING (public.is_admin(auth.uid()));

-- RLS: Risk Exposure Log (admin only)
CREATE POLICY "Admins view risk exposure" ON public.risk_exposure_log FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage risk exposure" ON public.risk_exposure_log FOR ALL USING (public.is_admin(auth.uid()));

-- RLS: Capital Recovery
CREATE POLICY "Users view own recovery" ON public.capital_recovery_registry FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage recovery" ON public.capital_recovery_registry FOR ALL USING (public.is_admin(auth.uid()));

-- RLS: Yield Tracking (admin + pool viewers)
CREATE POLICY "Admins view yield" ON public.yield_tracking FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage yield" ON public.yield_tracking FOR ALL USING (public.is_admin(auth.uid()));

-- RLS: Repayment Flows
CREATE POLICY "Admins manage repayments" ON public.repayment_flows FOR ALL USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_credit_profiles_user ON public.professional_credit_profiles(user_id);
CREATE INDEX idx_credit_profiles_band ON public.professional_credit_profiles(credit_band);
CREATE INDEX idx_advances_user ON public.capital_advances(user_id);
CREATE INDEX idx_advances_status ON public.capital_advances(status);
CREATE INDEX idx_advances_milestone ON public.capital_advances(milestone_id);
CREATE INDEX idx_pool_allocations_pool ON public.pool_allocations(pool_id);
CREATE INDEX idx_bonds_issuer ON public.professional_bonds(issuer_id);
CREATE INDEX idx_risk_exposure_entity ON public.risk_exposure_log(entity_type, entity_id);
CREATE INDEX idx_risk_exposure_level ON public.risk_exposure_log(risk_level);
CREATE INDEX idx_recovery_user ON public.capital_recovery_registry(user_id);
CREATE INDEX idx_recovery_advance ON public.capital_recovery_registry(advance_id);
CREATE INDEX idx_yield_pool ON public.yield_tracking(pool_id);
CREATE INDEX idx_repayment_advance ON public.repayment_flows(advance_id);
