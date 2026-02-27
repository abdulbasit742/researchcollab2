
-- Policy Models
CREATE TABLE public.policy_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.research_workspaces(id) ON DELETE CASCADE NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  region_scope TEXT,
  policy_type TEXT NOT NULL DEFAULT 'economic',
  status TEXT NOT NULL DEFAULT 'draft',
  execution_feasibility_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.policy_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own policy models" ON public.policy_models
  FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Users can view workspace policy models" ON public.policy_models
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.research_workspaces w WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR w.visibility = 'public'))
  );

-- Policy Assumptions
CREATE TABLE public.policy_assumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_model_id UUID REFERENCES public.policy_models(id) ON DELETE CASCADE NOT NULL,
  assumption_text TEXT NOT NULL,
  source_claim_ids UUID[] DEFAULT '{}',
  assumption_type TEXT NOT NULL DEFAULT 'economic',
  confidence_score NUMERIC DEFAULT 0.5,
  parameter_key TEXT,
  parameter_value NUMERIC,
  editable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.policy_assumptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage assumptions via policy model" ON public.policy_assumptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.policy_models pm WHERE pm.id = policy_model_id AND pm.created_by = auth.uid())
  );

-- Policy Scenarios
CREATE TABLE public.policy_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_model_id UUID REFERENCES public.policy_models(id) ON DELETE CASCADE NOT NULL,
  scenario_name TEXT NOT NULL DEFAULT 'baseline',
  parameter_set JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.policy_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage scenarios via policy model" ON public.policy_scenarios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.policy_models pm WHERE pm.id = policy_model_id AND pm.created_by = auth.uid())
  );

-- Policy Simulation Results
CREATE TABLE public.policy_simulation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES public.policy_scenarios(id) ON DELETE CASCADE NOT NULL,
  projected_outcomes JSONB DEFAULT '{}',
  uncertainty_interval JSONB DEFAULT '{}',
  impact_dimensions JSONB DEFAULT '{}',
  feasibility_score NUMERIC DEFAULT 0,
  sensitivity_analysis JSONB,
  reasoning_trace JSONB,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.policy_simulation_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view results via scenario" ON public.policy_simulation_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.policy_scenarios ps
      JOIN public.policy_models pm ON pm.id = ps.policy_model_id
      WHERE ps.id = scenario_id AND pm.created_by = auth.uid()
    )
  );

-- Policy trajectory tracking
CREATE TABLE public.policy_trajectory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_model_id UUID REFERENCES public.policy_models(id) ON DELETE CASCADE NOT NULL,
  measurement_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  adoption_status TEXT,
  milestone_progress NUMERIC DEFAULT 0,
  deviation_from_projection NUMERIC DEFAULT 0,
  trust_shift NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.policy_trajectory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage trajectory via policy model" ON public.policy_trajectory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.policy_models pm WHERE pm.id = policy_model_id AND pm.created_by = auth.uid())
  );
