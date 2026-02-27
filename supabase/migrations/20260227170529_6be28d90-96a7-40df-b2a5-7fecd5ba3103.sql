
-- ============================================================
-- GREI: Global Research Economy Index Engine
-- ============================================================

-- Impact Entities (multi-scale: individual, institution, region, nation, corridor)
CREATE TABLE public.impact_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('individual','team','institution','region','nation','corridor','global_cluster')),
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  parent_entity_id UUID REFERENCES public.impact_entities(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

ALTER TABLE public.impact_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read impact_entities" ON public.impact_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert impact_entities" ON public.impact_entities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update impact_entities" ON public.impact_entities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Impact Metrics (9 dimensions + composite)
CREATE TABLE public.impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impact_entity_id UUID REFERENCES public.impact_entities(id) NOT NULL,
  knowledge_output_score NUMERIC DEFAULT 0,
  claim_influence_score NUMERIC DEFAULT 0,
  funding_efficiency_score NUMERIC DEFAULT 0,
  execution_reliability_score NUMERIC DEFAULT 0,
  policy_adoption_score NUMERIC DEFAULT 0,
  cross_border_diffusion_score NUMERIC DEFAULT 0,
  trust_density_score NUMERIC DEFAULT 0,
  knowledge_stability_score NUMERIC DEFAULT 0,
  innovation_velocity_score NUMERIC DEFAULT 0,
  composite_index_score NUMERIC DEFAULT 0,
  weights_used JSONB DEFAULT '{"kos":0.15,"cis":0.12,"fes":0.13,"ers":0.13,"pas":0.10,"cbds":0.08,"tds":0.12,"kss":0.09,"ivs":0.08}'::jsonb,
  formula_explanation TEXT,
  anti_gaming_flags JSONB DEFAULT '[]'::jsonb,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(impact_entity_id)
);

ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read impact_metrics" ON public.impact_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert impact_metrics" ON public.impact_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update impact_metrics" ON public.impact_metrics FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Impact History (snapshots for trend tracking)
CREATE TABLE public.impact_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impact_entity_id UUID REFERENCES public.impact_entities(id) NOT NULL,
  snapshot_data JSONB NOT NULL,
  composite_score_at_snapshot NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.impact_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read impact_history" ON public.impact_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert impact_history" ON public.impact_history FOR INSERT TO authenticated WITH CHECK (true);

-- Gaming Detection Log
CREATE TABLE public.impact_gaming_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impact_entity_id UUID REFERENCES public.impact_entities(id) NOT NULL,
  flag_type TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  evidence JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.impact_gaming_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read gaming_flags" ON public.impact_gaming_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert gaming_flags" ON public.impact_gaming_flags FOR INSERT TO authenticated WITH CHECK (true);
