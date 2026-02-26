
-- Sovereignty Profiles
CREATE TABLE public.sovereignty_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  maturity_level INT NOT NULL DEFAULT 0 CHECK (maturity_level BETWEEN 0 AND 4),
  trust_score NUMERIC NOT NULL DEFAULT 0,
  capital_contribution_score NUMERIC NOT NULL DEFAULT 0,
  compliance_score NUMERIC NOT NULL DEFAULT 0,
  longevity_score NUMERIC NOT NULL DEFAULT 0,
  governance_participation_score NUMERIC NOT NULL DEFAULT 0,
  last_evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Constitutional Lock Status
CREATE TABLE public.constitutional_lock_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lock_name TEXT NOT NULL UNIQUE,
  lock_level TEXT NOT NULL DEFAULT 'immutable' CHECK (lock_level IN ('immutable', 'supermajority', 'founder_only')),
  override_requirements TEXT NOT NULL DEFAULT 'none',
  description TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT true,
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_by TEXT
);

-- Indexes
CREATE INDEX idx_sovereignty_profiles_tenant ON public.sovereignty_profiles(tenant_id);
CREATE INDEX idx_sovereignty_profiles_maturity ON public.sovereignty_profiles(maturity_level);
CREATE INDEX idx_constitutional_lock_name ON public.constitutional_lock_status(lock_name);

-- RLS
ALTER TABLE public.sovereignty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constitutional_lock_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read sovereignty_profiles" ON public.sovereignty_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read constitutional_lock_status" ON public.constitutional_lock_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service manage sovereignty_profiles" ON public.sovereignty_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage constitutional_lock_status" ON public.constitutional_lock_status FOR ALL TO service_role USING (true) WITH CHECK (true);
