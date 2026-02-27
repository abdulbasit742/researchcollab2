
-- =====================================================
-- PROFESSIONAL TRUST GRAPH ENGINE (PTGE) — additive migration
-- =====================================================

-- Add new columns to existing trust_edges
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS source_user_id UUID;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS target_user_id UUID;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS joint_projects INTEGER DEFAULT 0;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS grant_collab_history INTEGER DEFAULT 0;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS milestone_punctuality NUMERIC DEFAULT 0;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS budget_compliance NUMERIC DEFAULT 0;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS deliverable_acceptance NUMERIC DEFAULT 0;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS dispute_resolution NUMERIC DEFAULT 0;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS industry_deployment NUMERIC DEFAULT 0;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS cross_border_stability NUMERIC DEFAULT 0;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS peer_validation_overlap NUMERIC DEFAULT 0;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS compliance_alignment NUMERIC DEFAULT 0;
ALTER TABLE public.trust_edges ADD COLUMN IF NOT EXISTS edge_weight NUMERIC DEFAULT 0;

-- Backfill source_user_id/target_user_id from source_id/target_id
UPDATE public.trust_edges SET source_user_id = source_id WHERE source_user_id IS NULL;
UPDATE public.trust_edges SET target_user_id = target_id WHERE target_user_id IS NULL;

-- Domain Trust Index
CREATE TABLE IF NOT EXISTS public.domain_trust_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  domain_trust NUMERIC DEFAULT 0,
  collaboration_stability NUMERIC DEFAULT 0,
  funding_integrity NUMERIC DEFAULT 0,
  execution_reliability NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain)
);

-- Global Trust Index
CREATE TABLE IF NOT EXISTS public.global_trust_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  global_trust NUMERIC DEFAULT 0,
  collaboration_stability NUMERIC DEFAULT 0,
  funding_integrity NUMERIC DEFAULT 0,
  execution_reliability NUMERIC DEFAULT 0,
  trust_breakdown JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Trust Evolution Events
CREATE TABLE IF NOT EXISTS public.trust_evolution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  direction TEXT NOT NULL,
  domain TEXT,
  delta NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  related_entity_id UUID,
  related_entity_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trust Compatibility Checks
CREATE TABLE IF NOT EXISTS public.trust_compatibility_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL,
  user_b_id UUID NOT NULL,
  trust_compat_pct NUMERIC DEFAULT 0,
  domain_overlap_pct NUMERIC DEFAULT 0,
  reliability_alignment_pct NUMERIC DEFAULT 0,
  funding_risk_compat NUMERIC DEFAULT 0,
  collaboration_probability NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trust Manipulation Flags
CREATE TABLE IF NOT EXISTS public.trust_manipulation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL,
  description TEXT,
  evidence JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'low',
  resolved BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team Trust Index
CREATE TABLE IF NOT EXISTS public.team_trust_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  team_name TEXT,
  member_ids UUID[] DEFAULT '{}',
  cohesion_score NUMERIC DEFAULT 0,
  historical_success NUMERIC DEFAULT 0,
  repeat_funding_rate NUMERIC DEFAULT 0,
  milestone_punctuality NUMERIC DEFAULT 0,
  conflict_frequency NUMERIC DEFAULT 0,
  innovation_consistency NUMERIC DEFAULT 0,
  composite_team_trust NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Institutional Trust Scores
CREATE TABLE IF NOT EXISTS public.institutional_trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_a_id UUID NOT NULL,
  institution_b_id UUID,
  grant_reliability NUMERIC DEFAULT 0,
  compliance_alignment NUMERIC DEFAULT 0,
  partnership_stability NUMERIC DEFAULT 0,
  patent_co_ownership NUMERIC DEFAULT 0,
  funding_continuity NUMERIC DEFAULT 0,
  industry_co_deployment NUMERIC DEFAULT 0,
  composite_inst_trust NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.domain_trust_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_trust_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_evolution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_compatibility_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_manipulation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_trust_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_trust_scores ENABLE ROW LEVEL SECURITY;

-- RLS: Read
CREATE POLICY "Auth read domain_trust" ON public.domain_trust_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read global_trust" ON public.global_trust_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own read trust_events" ON public.trust_evolution_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth read compat" ON public.trust_compatibility_checks FOR SELECT TO authenticated USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Own read trust_manip" ON public.trust_manipulation_flags FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth read team_trust" ON public.team_trust_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst_trust" ON public.institutional_trust_scores FOR SELECT TO authenticated USING (true);

-- RLS: Insert/Update
CREATE POLICY "Own insert domain_trust" ON public.domain_trust_index FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update domain_trust" ON public.domain_trust_index FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own insert global_trust" ON public.global_trust_index FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update global_trust" ON public.global_trust_index FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert trust_events" ON public.trust_evolution_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert compat" ON public.trust_compatibility_checks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert trust_manip" ON public.trust_manipulation_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert team_trust" ON public.team_trust_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert inst_trust" ON public.institutional_trust_scores FOR INSERT TO authenticated WITH CHECK (true);
