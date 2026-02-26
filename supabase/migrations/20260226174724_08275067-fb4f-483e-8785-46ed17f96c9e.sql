
-- Platform Phases
CREATE TABLE public.platform_phases (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  phase_order INT NOT NULL DEFAULT 0,
  activated_at TIMESTAMPTZ,
  stability_score NUMERIC DEFAULT 0,
  regulatory_risk_score NUMERIC DEFAULT 0,
  public_exposure_level TEXT NOT NULL DEFAULT 'none' CHECK (public_exposure_level IN ('none','internal','limited','public')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  prerequisites JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Institutional Adoption Ladder
CREATE TABLE public.institution_adoption_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  tier_level INT NOT NULL DEFAULT 1 CHECK (tier_level BETWEEN 1 AND 7),
  tier_name TEXT NOT NULL,
  promoted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stability_score NUMERIC DEFAULT 0,
  credit_maturity NUMERIC DEFAULT 0,
  governance_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_platform_phases_order ON public.platform_phases(phase_order);
CREATE INDEX idx_institution_adoption_tiers_inst ON public.institution_adoption_tiers(institution_id);
CREATE INDEX idx_institution_adoption_tiers_tier ON public.institution_adoption_tiers(tier_level);

-- RLS
ALTER TABLE public.platform_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_adoption_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read platform_phases" ON public.platform_phases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service manage platform_phases" ON public.platform_phases FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Auth read institution_adoption_tiers" ON public.institution_adoption_tiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service manage institution_adoption_tiers" ON public.institution_adoption_tiers FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed phases
INSERT INTO public.platform_phases (name, description, phase_order, public_exposure_level) VALUES
  ('Phase 0 — Core Escrow + Wallet Stability', 'Foundation: escrow engine, wallet ledger, basic deals', 0, 'public'),
  ('Phase 1 — Institutional Deals + Workrooms', 'Collaborative execution infrastructure', 1, 'public'),
  ('Phase 2 — Credit Scoring + Capital Pools', 'Institutional credit ratings and structured pools', 2, 'limited'),
  ('Phase 3 — Research Bonds (Closed Beta)', 'Bond issuance for credit-rated institutions', 3, 'internal'),
  ('Phase 4 — Innovation Allocation Brain (Silent)', 'GIAB in silent advisory mode', 4, 'internal'),
  ('Phase 5 — Liquidity Pools + Market Index', 'Cross-institution liquidity and stability index', 5, 'limited'),
  ('Phase 6 — Interoperability Gateway', 'Limited region federation and settlement', 6, 'limited'),
  ('Phase 7 — Reserve Layer (Restricted Pilot)', 'SERL institutional pilot', 7, 'internal'),
  ('Phase 8 — Cross-Border Settlement Scaling', 'Multi-region RERU settlement', 8, 'limited'),
  ('Phase 9 — Global Capital Index Public', 'Full public transparency of capital index', 9, 'public');
