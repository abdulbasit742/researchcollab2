
-- ============================================================
-- ARCE: Autonomous Research Civilization Engine
-- ============================================================

-- Civilization Cycles (measurable phases of ecosystem evolution)
CREATE TABLE public.civilization_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_version INTEGER NOT NULL DEFAULT 1,
  start_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_timestamp TIMESTAMPTZ,
  knowledge_growth_index NUMERIC DEFAULT 0,
  trust_growth_index NUMERIC DEFAULT 0,
  capital_efficiency_index NUMERIC DEFAULT 0,
  policy_impact_index NUMERIC DEFAULT 0,
  governance_stability_index NUMERIC DEFAULT 0,
  composite_civilization_score NUMERIC DEFAULT 0,
  feedback_loops JSONB DEFAULT '{}'::jsonb,
  optimization_suggestions JSONB DEFAULT '[]'::jsonb,
  shock_resilience_score NUMERIC DEFAULT 0,
  cycle_metadata JSONB DEFAULT '{}'::jsonb,
  computed_by TEXT DEFAULT 'ai_system',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.civilization_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read civilization_cycles" ON public.civilization_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert civilization_cycles" ON public.civilization_cycles FOR INSERT TO authenticated WITH CHECK (true);

-- Civilization Loop Events (traceable feedback loop entries)
CREATE TABLE public.civilization_loop_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES public.civilization_cycles(id),
  loop_type TEXT NOT NULL CHECK (loop_type IN ('knowledge_to_trust','trust_to_capital','capital_to_execution','execution_to_policy','policy_to_knowledge','governance_correction','drift_correction','shock_response')),
  source_entity_type TEXT,
  source_entity_id TEXT,
  target_entity_type TEXT,
  target_entity_id TEXT,
  impact_delta NUMERIC DEFAULT 0,
  description TEXT,
  evidence JSONB DEFAULT '{}'::jsonb,
  is_automated BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.civilization_loop_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read loop_events" ON public.civilization_loop_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert loop_events" ON public.civilization_loop_events FOR INSERT TO authenticated WITH CHECK (true);

-- Civilization Shock Simulations
CREATE TABLE public.civilization_shock_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES public.civilization_cycles(id),
  shock_type TEXT NOT NULL,
  shock_magnitude NUMERIC DEFAULT 0.5,
  pre_shock_score NUMERIC DEFAULT 0,
  post_shock_score NUMERIC DEFAULT 0,
  resilience_index NUMERIC DEFAULT 0,
  capital_loss_projection NUMERIC DEFAULT 0,
  impact_loss_projection NUMERIC DEFAULT 0,
  recovery_timeline_days INTEGER DEFAULT 0,
  corrective_measures JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.civilization_shock_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read shock_sims" ON public.civilization_shock_simulations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert shock_sims" ON public.civilization_shock_simulations FOR INSERT TO authenticated WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.civilization_cycles;
