
-- =====================================================
-- GLOBAL CAPABILITY DISCOVERY & NETWORK INTELLIGENCE ENGINE
-- =====================================================

-- 1. Discovery Modes & Sessions (Section 1)
CREATE TABLE IF NOT EXISTS public.discovery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  discovery_mode TEXT NOT NULL,
  intent_declaration TEXT,
  results_surfaced INTEGER DEFAULT 0,
  session_duration_sec INTEGER DEFAULT 0,
  reflection_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Emerging Talent Signals (Section 2)
CREATE TABLE IF NOT EXISTS public.emerging_talent_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_improvement_rate NUMERIC DEFAULT 0,
  execution_reliability NUMERIC DEFAULT 0,
  project_quality NUMERIC DEFAULT 0,
  domain_emergence NUMERIC DEFAULT 0,
  innovation_depth NUMERIC DEFAULT 0,
  integrity_stability NUMERIC DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  capability_score NUMERIC DEFAULT 0,
  composite_emerging NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Innovation Clusters (Section 3)
CREATE TABLE IF NOT EXISTS public.innovation_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  region TEXT,
  grant_acceleration NUMERIC DEFAULT 0,
  patent_activity NUMERIC DEFAULT 0,
  startup_formation NUMERIC DEFAULT 0,
  industry_adoption NUMERIC DEFAULT 0,
  collaboration_density NUMERIC DEFAULT 0,
  research_to_market NUMERIC DEFAULT 0,
  composite_intensity NUMERIC DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Capability Search Index (Section 4)
CREATE TABLE IF NOT EXISTS public.capability_search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skills TEXT[] DEFAULT '{}',
  domains TEXT[] DEFAULT '{}',
  execution_depth NUMERIC DEFAULT 0,
  funding_experience NUMERIC DEFAULT 0,
  patent_involvement INTEGER DEFAULT 0,
  startup_experience INTEGER DEFAULT 0,
  compliance_reliability NUMERIC DEFAULT 0,
  collaboration_strength NUMERIC DEFAULT 0,
  geographic_presence TEXT[] DEFAULT '{}',
  institutional_affiliation TEXT,
  composite_capability NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. Discovery Fairness Engine (Section 7)
CREATE TABLE IF NOT EXISTS public.discovery_fairness_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key TEXT NOT NULL UNIQUE,
  rule_name TEXT NOT NULL,
  rule_value NUMERIC NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Discovery Integrity Flags (Section 8)
CREATE TABLE IF NOT EXISTS public.discovery_integrity_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL,
  description TEXT,
  evidence JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'low',
  resolved BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Capability Growth Feed (Section 9)
CREATE TABLE IF NOT EXISTS public.capability_growth_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feed_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  relevance_score NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Discovery Explainability (Section 14)
CREATE TABLE IF NOT EXISTS public.discovery_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discovery_session_id UUID,
  surfaced_user_id UUID,
  viewer_user_id UUID NOT NULL,
  domain_overlap_pct NUMERIC DEFAULT 0,
  skill_alignment_pct NUMERIC DEFAULT 0,
  funding_relevance_pct NUMERIC DEFAULT 0,
  collaboration_probability_pct NUMERIC DEFAULT 0,
  innovation_signal_pct NUMERIC DEFAULT 0,
  geographic_proximity_pct NUMERIC DEFAULT 0,
  explanation_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emerging_talent_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capability_search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_fairness_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_integrity_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capability_growth_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_explanations ENABLE ROW LEVEL SECURITY;

-- RLS: Read
CREATE POLICY "Own read disc_sessions" ON public.discovery_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth read emerging" ON public.emerging_talent_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read clusters" ON public.innovation_clusters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read cap_index" ON public.capability_search_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read fairness" ON public.discovery_fairness_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own read integrity" ON public.discovery_integrity_flags FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own read growth_feed" ON public.capability_growth_feed FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own read explanations" ON public.discovery_explanations FOR SELECT TO authenticated USING (auth.uid() = viewer_user_id);

-- RLS: Insert
CREATE POLICY "Own insert disc_sessions" ON public.discovery_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own insert emerging" ON public.emerging_talent_signals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update emerging" ON public.emerging_talent_signals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert clusters" ON public.innovation_clusters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Own insert cap_index" ON public.capability_search_index FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own update cap_index" ON public.capability_search_index FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Auth insert integrity" ON public.discovery_integrity_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Own insert growth_feed" ON public.capability_growth_feed FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth insert explanations" ON public.discovery_explanations FOR INSERT TO authenticated WITH CHECK (true);

-- Seed fairness config (Section 7)
INSERT INTO public.discovery_fairness_config (rule_key, rule_name, rule_value, description) VALUES
  ('top_account_exposure_cap', 'Top Account Exposure Cap', 15, 'Max % of discovery feed from top-tier accounts'),
  ('newcomer_boost_pct', 'Credible Newcomer Boost', 20, 'Boost % for credible newcomers in discovery'),
  ('domain_diversity_min', 'Domain Diversity Minimum', 3, 'Minimum distinct domains in discovery results'),
  ('geographic_representation_min', 'Geographic Representation', 2, 'Min distinct regions in discovery'),
  ('underfunded_domain_boost', 'Underfunded Domain Boost', 25, 'Boost % for underfunded domain innovation'),
  ('elite_cluster_cap', 'Elite Cluster Dominance Cap', 20, 'Max % from any single institutional cluster')
ON CONFLICT (rule_key) DO NOTHING;
