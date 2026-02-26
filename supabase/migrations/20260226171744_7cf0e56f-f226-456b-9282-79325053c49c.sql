
-- Constitutional Principles
CREATE TABLE public.constitutional_principles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  principle_name TEXT NOT NULL UNIQUE,
  invariant_definition TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  version INT NOT NULL DEFAULT 1,
  immutable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Governance Epochs
CREATE TABLE public.governance_epochs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  epoch_number INT NOT NULL UNIQUE,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  major_policy_changes JSONB DEFAULT '[]',
  systemic_risk_level NUMERIC NOT NULL DEFAULT 0,
  trust_shift_index NUMERIC NOT NULL DEFAULT 0,
  governance_model TEXT NOT NULL DEFAULT 'centralized',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Regulatory Profiles
CREATE TABLE public.regulatory_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID REFERENCES public.regions(id),
  version INT NOT NULL DEFAULT 1,
  compliance_rules JSONB NOT NULL DEFAULT '{}',
  compliance_rules_hash TEXT,
  sanction_zones TEXT[] DEFAULT '{}',
  regulatory_divergence_score NUMERIC NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(region_id, version)
);

-- Indexes
CREATE INDEX idx_constitutional_principles_category ON public.constitutional_principles(category);
CREATE INDEX idx_governance_epochs_number ON public.governance_epochs(epoch_number);
CREATE INDEX idx_regulatory_profiles_region ON public.regulatory_profiles(region_id);

-- RLS
ALTER TABLE public.constitutional_principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_epochs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read constitutional_principles" ON public.constitutional_principles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read governance_epochs" ON public.governance_epochs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read regulatory_profiles" ON public.regulatory_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service manage constitutional_principles" ON public.constitutional_principles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage governance_epochs" ON public.governance_epochs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage regulatory_profiles" ON public.regulatory_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
