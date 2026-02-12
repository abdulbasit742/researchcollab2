
-- PHASE 1: Portable Reputation Exports
CREATE TABLE public.portable_reputation_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  export_hash TEXT NOT NULL,
  trust_score_snapshot INTEGER NOT NULL DEFAULT 0,
  deal_history_snapshot JSONB DEFAULT '[]'::jsonb,
  skills_snapshot JSONB DEFAULT '[]'::jsonb,
  verification_signature TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.portable_reputation_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own rep exports" ON public.portable_reputation_exports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own rep exports" ON public.portable_reputation_exports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_portable_rep_user ON public.portable_reputation_exports(user_id);

-- PHASE 2: Currency Profiles
CREATE TABLE public.currency_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id),
  preferred_currency TEXT NOT NULL DEFAULT 'PKR',
  settlement_currency TEXT NOT NULL DEFAULT 'PKR',
  region TEXT DEFAULT 'PK',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.currency_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own currency" ON public.currency_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own currency" ON public.currency_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own currency" ON public.currency_profiles FOR UPDATE USING (auth.uid() = user_id);

-- PHASE 3: Data Residency Profiles
CREATE TABLE public.data_residency_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id),
  preferred_data_region TEXT NOT NULL DEFAULT 'global',
  legal_compliance_zone TEXT DEFAULT 'default',
  consent_version TEXT DEFAULT '1.0',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.data_residency_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own residency" ON public.data_residency_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own residency" ON public.data_residency_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own residency" ON public.data_residency_profiles FOR UPDATE USING (auth.uid() = user_id);

-- PHASE 4: Federated Institution Nodes
CREATE TABLE public.federated_institution_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.organizations(id),
  region TEXT NOT NULL DEFAULT 'PK',
  verification_level TEXT NOT NULL DEFAULT 'basic',
  trust_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.federated_institution_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View active fed nodes" ON public.federated_institution_nodes FOR SELECT USING (status = 'active');
CREATE POLICY "Admins manage fed nodes" ON public.federated_institution_nodes FOR ALL USING (public.is_admin(auth.uid()));

-- PHASE 5: Global Liquidity Metrics
CREATE TABLE public.global_liquidity_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL UNIQUE,
  active_deals INTEGER NOT NULL DEFAULT 0,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  avg_trust_score NUMERIC NOT NULL DEFAULT 0,
  deal_velocity NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.global_liquidity_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View global liquidity" ON public.global_liquidity_metrics FOR SELECT USING (true);
CREATE POLICY "Admins manage global liquidity" ON public.global_liquidity_metrics FOR ALL USING (public.is_admin(auth.uid()));

-- PHASE 7: Capital Partnerships
CREATE TABLE public.capital_partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.organizations(id),
  funding_pool_size NUMERIC NOT NULL DEFAULT 0,
  allocation_rules JSONB DEFAULT '{}'::jsonb,
  trust_requirements JSONB DEFAULT '{"min_trust_score": 50}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_partnerships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View active capital" ON public.capital_partnerships FOR SELECT USING (status = 'active');
CREATE POLICY "Admins manage capital" ON public.capital_partnerships FOR ALL USING (public.is_admin(auth.uid()));

-- PHASE 8: Global Trust Rankings
CREATE TABLE public.global_trust_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id),
  global_rank INTEGER,
  regional_rank INTEGER,
  category_rank INTEGER,
  region TEXT DEFAULT 'PK',
  category TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.global_trust_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View rankings" ON public.global_trust_rankings FOR SELECT USING (true);
CREATE POLICY "Admins manage rankings" ON public.global_trust_rankings FOR ALL USING (public.is_admin(auth.uid()));
CREATE INDEX idx_global_rank ON public.global_trust_rankings(global_rank);
