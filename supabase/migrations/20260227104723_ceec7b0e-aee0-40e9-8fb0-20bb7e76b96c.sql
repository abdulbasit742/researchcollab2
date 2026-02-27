
-- =====================================================
-- PROFESSIONAL CIVILIZATION NETWORK ARCHITECTURE (PCNA)
-- =====================================================

-- 1. Five Core System Pillars (Section 1)
CREATE TABLE IF NOT EXISTS public.pcna_system_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_name TEXT NOT NULL,
  pillar_category TEXT NOT NULL,
  health_score NUMERIC DEFAULT 0,
  subsystem_count INTEGER DEFAULT 0,
  integration_density NUMERIC DEFAULT 0,
  last_assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pillar_name)
);

-- 2. Unified Professional Graph (Section 2)
CREATE TABLE IF NOT EXISTS public.professional_graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  label TEXT,
  metadata JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS public.professional_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  relationship TEXT NOT NULL,
  weight NUMERIC DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Multi-Dimensional Professional Scoring (Section 3)
CREATE TABLE IF NOT EXISTS public.professional_dimension_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dimension TEXT NOT NULL,
  score NUMERIC DEFAULT 0,
  breakdown JSONB DEFAULT '{}',
  domain_context TEXT,
  decay_applied BOOLEAN DEFAULT false,
  appealable BOOLEAN DEFAULT true,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Professional Discovery Index (Section 5)
CREATE TABLE IF NOT EXISTS public.professional_discovery_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  capability_score NUMERIC DEFAULT 0,
  depth_score NUMERIC DEFAULT 0,
  emerging_excellence NUMERIC DEFAULT 0,
  cross_domain_synergy NUMERIC DEFAULT 0,
  innovation_cluster_membership JSONB DEFAULT '[]',
  trust_weighted_exposure NUMERIC DEFAULT 0,
  discovery_explanation JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. Integrity & Anti-Manipulation (Section 8)
CREATE TABLE IF NOT EXISTS public.pcna_integrity_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID,
  target_entity_id UUID,
  signal_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  description TEXT,
  evidence JSONB DEFAULT '{}',
  reviewable BOOLEAN DEFAULT true,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Anti-Addiction UX Metrics (Section 13)
CREATE TABLE IF NOT EXISTS public.pcna_session_wellness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_session_minutes INTEGER DEFAULT 0,
  intentional_sessions INTEGER DEFAULT 0,
  deep_interactions INTEGER DEFAULT 0,
  reflection_prompted BOOLEAN DEFAULT false,
  focus_mode_minutes INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Platform Health & Strategic Metrics (Section 15)
CREATE TABLE IF NOT EXISTS public.pcna_platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_period TEXT NOT NULL,
  funding_efficiency NUMERIC DEFAULT 0,
  execution_reliability NUMERIC DEFAULT 0,
  innovation_output NUMERIC DEFAULT 0,
  trust_density NUMERIC DEFAULT 0,
  career_compounding NUMERIC DEFAULT 0,
  institutional_stability NUMERIC DEFAULT 0,
  cross_border_collaboration NUMERIC DEFAULT 0,
  economic_impact NUMERIC DEFAULT 0,
  composite_civilization_score NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(metric_period)
);

-- 8. Long-Term Memory & Archival (Section 12)
CREATE TABLE IF NOT EXISTS public.pcna_archival_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  snapshot_data JSONB DEFAULT '{}',
  retention_years INTEGER DEFAULT 50,
  export_format TEXT DEFAULT 'json',
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pcna_system_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_dimension_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_discovery_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcna_integrity_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcna_session_wellness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcna_platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcna_archival_records ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Auth read pcna_pillars" ON public.pcna_system_pillars FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read pg_nodes" ON public.professional_graph_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read pg_edges" ON public.professional_graph_edges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read dim_scores" ON public.professional_dimension_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read disc_index" ON public.professional_discovery_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read integrity_sig" ON public.pcna_integrity_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read session_well" ON public.pcna_session_wellness FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read plat_metrics" ON public.pcna_platform_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read archival" ON public.pcna_archival_records FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "Auth insert pcna_pillars" ON public.pcna_system_pillars FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert pg_nodes" ON public.professional_graph_nodes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert pg_edges" ON public.professional_graph_edges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert dim_scores" ON public.professional_dimension_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert disc_index" ON public.professional_discovery_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert integrity_sig" ON public.pcna_integrity_signals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert session_well" ON public.pcna_session_wellness FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert plat_metrics" ON public.pcna_platform_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert archival" ON public.pcna_archival_records FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "Auth update pcna_pillars" ON public.pcna_system_pillars FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update disc_index" ON public.professional_discovery_index FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update plat_metrics" ON public.pcna_platform_metrics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update integrity_sig" ON public.pcna_integrity_signals FOR UPDATE TO authenticated USING (true);
