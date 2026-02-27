
-- =====================================================
-- PROMPT 15: GLOBAL RESEARCH CIVILIZATION OPERATING SYSTEM (GRCOS)
-- =====================================================

-- 1. Unified Knowledge Graph Nodes
CREATE TABLE IF NOT EXISTS public.knowledge_graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  label TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Knowledge Graph Edges (bidirectional links)
CREATE TABLE IF NOT EXISTS public.knowledge_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID REFERENCES public.knowledge_graph_nodes(id),
  target_node_id UUID REFERENCES public.knowledge_graph_nodes(id),
  edge_type TEXT NOT NULL,
  weight NUMERIC DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Multi-Dimensional Scoring Framework
CREATE TABLE IF NOT EXISTS public.grcos_scoring_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  citation_quality NUMERIC DEFAULT 0,
  funding_impact NUMERIC DEFAULT 0,
  execution_reliability NUMERIC DEFAULT 0,
  commercialization_yield NUMERIC DEFAULT 0,
  collaboration_trust NUMERIC DEFAULT 0,
  compliance_integrity NUMERIC DEFAULT 0,
  open_science_contribution NUMERIC DEFAULT 0,
  innovation_efficiency NUMERIC DEFAULT 0,
  institutional_stability NUMERIC DEFAULT 0,
  longitudinal_consistency NUMERIC DEFAULT 0,
  composite_score NUMERIC DEFAULT 0,
  weight_profile JSONB DEFAULT '{}',
  explanation TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Governance Boards & Committees
CREATE TABLE IF NOT EXISTS public.governance_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_name TEXT NOT NULL,
  board_type TEXT NOT NULL,
  description TEXT,
  charter TEXT,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  established_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Governance Board Members
CREATE TABLE IF NOT EXISTS public.governance_board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES public.governance_boards(id),
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  institution_id TEXT,
  appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  term_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- 6. AI Decision Audit Trail
CREATE TABLE IF NOT EXISTS public.ai_decision_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type TEXT NOT NULL,
  model_id TEXT,
  input_summary JSONB DEFAULT '{}',
  output_summary JSONB DEFAULT '{}',
  confidence_score NUMERIC,
  bias_check_result JSONB DEFAULT '{}',
  explanation TEXT,
  human_reviewed BOOLEAN DEFAULT false,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  entity_type TEXT,
  entity_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Archival Governance Records
CREATE TABLE IF NOT EXISTS public.archival_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type TEXT NOT NULL,
  policy_name TEXT NOT NULL,
  description TEXT,
  retention_years INTEGER DEFAULT 50,
  export_format TEXT DEFAULT 'json',
  data_portability_enabled BOOLEAN DEFAULT true,
  continuity_guarantee TEXT,
  last_reviewed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. National Intelligence Queries
CREATE TABLE IF NOT EXISTS public.national_intelligence_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id TEXT NOT NULL,
  query_type TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  result_summary JSONB DEFAULT '{}',
  insights TEXT[] DEFAULT '{}',
  simulation_mode BOOLEAN DEFAULT false,
  queried_by TEXT,
  queried_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Platform Health Metrics (civilizational KPIs)
CREATE TABLE IF NOT EXISTS public.platform_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  value NUMERIC NOT NULL,
  target_value NUMERIC,
  unit TEXT,
  period TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grcos_scoring_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_decision_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archival_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.national_intelligence_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_health_metrics ENABLE ROW LEVEL SECURITY;

-- RLS: Auth read
CREATE POLICY "Auth read kg_nodes" ON public.knowledge_graph_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read kg_edges" ON public.knowledge_graph_edges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read grcos_scores" ON public.grcos_scoring_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gov_boards" ON public.governance_boards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read gov_members" ON public.governance_board_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read ai_audit" ON public.ai_decision_audit FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read archival" ON public.archival_governance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read natl_intel" ON public.national_intelligence_queries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read health" ON public.platform_health_metrics FOR SELECT TO authenticated USING (true);

-- RLS: Auth insert
CREATE POLICY "Auth insert kg_nodes" ON public.knowledge_graph_nodes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert kg_edges" ON public.knowledge_graph_edges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert grcos_scores" ON public.grcos_scoring_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert gov_boards" ON public.governance_boards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert gov_members" ON public.governance_board_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert ai_audit" ON public.ai_decision_audit FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert archival" ON public.archival_governance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert natl_intel" ON public.national_intelligence_queries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert health" ON public.platform_health_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- RLS: Auth update for select tables
CREATE POLICY "Auth update kg_nodes" ON public.knowledge_graph_nodes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth update grcos_scores" ON public.grcos_scoring_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth update gov_boards" ON public.governance_boards FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth update ai_audit" ON public.ai_decision_audit FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Anon read for public governance
CREATE POLICY "Anon read gov_boards" ON public.governance_boards FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Anon read archival" ON public.archival_governance FOR SELECT TO anon USING (is_active = true);
