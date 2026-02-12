
-- =====================================================
-- Professional Opportunity Operating System Migration
-- =====================================================

-- 1. Opportunity Graph table
CREATE TABLE public.opportunity_graph (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('project','job','grant','collaboration','advisory','cofounder','institutional_funding')),
  title TEXT NOT NULL,
  description TEXT,
  source_entity_type TEXT,
  source_entity_id UUID,
  relevance_score NUMERIC DEFAULT 0,
  skill_match_score NUMERIC DEFAULT 0,
  trust_match_score NUMERIC DEFAULT 0,
  outcome_match_score NUMERIC DEFAULT 0,
  network_proximity_score NUMERIC DEFAULT 0,
  readiness_score NUMERIC DEFAULT 0,
  composite_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','applied','matched','expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunity_graph ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own opportunities" ON public.opportunity_graph
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own opportunities" ON public.opportunity_graph
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own opportunities" ON public.opportunity_graph
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_opportunity_graph_user_id ON public.opportunity_graph(user_id);
CREATE INDEX idx_opportunity_graph_composite_score ON public.opportunity_graph(composite_score DESC);
CREATE INDEX idx_opportunity_graph_type ON public.opportunity_graph(opportunity_type);

-- 2. Opportunity Edges table
CREATE TABLE public.opportunity_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  opportunity_id UUID NOT NULL REFERENCES public.opportunity_graph(id) ON DELETE CASCADE,
  edge_type TEXT NOT NULL CHECK (edge_type IN ('skill_match','trust_fit','network_link','outcome_history','readiness_match')),
  weight NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunity_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own edges" ON public.opportunity_edges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own edges" ON public.opportunity_edges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_opportunity_edges_user ON public.opportunity_edges(user_id);
CREATE INDEX idx_opportunity_edges_opportunity ON public.opportunity_edges(opportunity_id);

-- 3. Opportunity visibility multiplier on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS opportunity_visibility_multiplier NUMERIC DEFAULT 1.0;

-- 4. Opportunity Multiplier Log table
CREATE TABLE public.opportunity_multiplier_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  previous_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  new_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  trigger_type TEXT NOT NULL,
  trigger_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunity_multiplier_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own multiplier logs" ON public.opportunity_multiplier_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all multiplier logs" ON public.opportunity_multiplier_log
  FOR SELECT USING (public.is_admin(auth.uid()));

-- 5. Institutional Metrics table
CREATE TABLE public.institutional_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  talent_count INTEGER DEFAULT 0,
  avg_trust_score NUMERIC DEFAULT 0,
  skill_distribution JSONB DEFAULT '{}',
  economic_contribution NUMERIC DEFAULT 0,
  deal_volume INTEGER DEFAULT 0,
  active_risk_signals INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.institutional_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution admins can view metrics" ON public.institutional_metrics
  FOR SELECT USING (public.is_institution_admin(auth.uid(), institution_id));
CREATE POLICY "Admins can view all institutional metrics" ON public.institutional_metrics
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE INDEX idx_institutional_metrics_inst_period ON public.institutional_metrics(institution_id, period_start);
