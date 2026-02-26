
-- Planetary Invariants
CREATE TABLE public.planetary_invariants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invariant_name TEXT NOT NULL UNIQUE,
  invariant_definition TEXT NOT NULL,
  enforcement_level TEXT NOT NULL DEFAULT 'hard' CHECK (enforcement_level IN ('hard', 'soft')),
  category TEXT NOT NULL DEFAULT 'general',
  version INT NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consensus Sessions
CREATE TABLE public.consensus_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participating_regions TEXT[] NOT NULL DEFAULT '{}',
  proposal_id UUID,
  proposal_summary TEXT,
  outcome TEXT DEFAULT 'pending' CHECK (outcome IN ('pending', 'approved', 'rejected', 'deadlocked')),
  trust_weighted_score NUMERIC NOT NULL DEFAULT 0,
  quorum_met BOOLEAN NOT NULL DEFAULT false,
  compliance_cleared BOOLEAN NOT NULL DEFAULT false,
  risk_projection_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Capital Sovereignty Profiles
CREATE TABLE public.capital_sovereignty_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID REFERENCES public.regions(id),
  capital_outflow_limit NUMERIC NOT NULL DEFAULT 0,
  compliance_restriction_level TEXT NOT NULL DEFAULT 'standard',
  cross_border_exposure NUMERIC NOT NULL DEFAULT 0,
  sovereign_override_active BOOLEAN NOT NULL DEFAULT false,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(region_id, version)
);

-- Governance Era Profiles
CREATE TABLE public.governance_era_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  era_number INT NOT NULL UNIQUE,
  era_name TEXT NOT NULL DEFAULT 'unnamed',
  start_year INT NOT NULL,
  end_year INT,
  risk_profile NUMERIC NOT NULL DEFAULT 50,
  trust_shift NUMERIC NOT NULL DEFAULT 0,
  capital_efficiency NUMERIC NOT NULL DEFAULT 50,
  innovation_growth NUMERIC NOT NULL DEFAULT 50,
  governance_model TEXT NOT NULL DEFAULT 'centralized',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_planetary_invariants_category ON public.planetary_invariants(category);
CREATE INDEX idx_consensus_sessions_outcome ON public.consensus_sessions(outcome);
CREATE INDEX idx_capital_sovereignty_region ON public.capital_sovereignty_profiles(region_id);
CREATE INDEX idx_governance_era_number ON public.governance_era_profiles(era_number);

-- RLS
ALTER TABLE public.planetary_invariants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consensus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_sovereignty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_era_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read planetary_invariants" ON public.planetary_invariants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read consensus_sessions" ON public.consensus_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read capital_sovereignty_profiles" ON public.capital_sovereignty_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read governance_era_profiles" ON public.governance_era_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service manage planetary_invariants" ON public.planetary_invariants FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage consensus_sessions" ON public.consensus_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage capital_sovereignty_profiles" ON public.capital_sovereignty_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage governance_era_profiles" ON public.governance_era_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
