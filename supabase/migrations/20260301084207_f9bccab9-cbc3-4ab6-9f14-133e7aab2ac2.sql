
-- MODULE 1: Verified Research Proof Engine
CREATE TABLE public.research_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID,
  project_id UUID,
  title TEXT NOT NULL,
  execution_hash TEXT NOT NULL,
  environment_snapshot JSONB DEFAULT '{}',
  dataset_signature TEXT,
  reproducibility_hash TEXT,
  status TEXT NOT NULL DEFAULT 'recorded',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.compute_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_execution_id UUID NOT NULL REFERENCES public.research_executions(id) ON DELETE CASCADE,
  compute_metadata JSONB NOT NULL DEFAULT '{}',
  integrity_signature TEXT NOT NULL,
  proof_type TEXT NOT NULL DEFAULT 'sha256',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MODULE 2: Institutional Intelligence Engine
CREATE TABLE public.supervisor_performance_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_score NUMERIC DEFAULT 0,
  dispute_involvement_score NUMERIC DEFAULT 0,
  funding_success_rate NUMERIC DEFAULT 0,
  validation_score NUMERIC DEFAULT 0,
  student_satisfaction_score NUMERIC DEFAULT 0,
  composite_score NUMERIC DEFAULT 0,
  grade TEXT DEFAULT 'B',
  period TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(supervisor_id, period)
);

-- MODULE 3: AI Capital Prediction Layer
CREATE TABLE public.milestone_risk_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL,
  deal_id UUID,
  risk_score NUMERIC NOT NULL DEFAULT 0,
  failure_probability NUMERIC NOT NULL DEFAULT 0,
  dispute_probability NUMERIC NOT NULL DEFAULT 0,
  predicted_delay_days INTEGER DEFAULT 0,
  risk_factors JSONB DEFAULT '[]',
  recommendation TEXT,
  model_version TEXT DEFAULT 'v1.0',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID REFERENCES auth.users(id)
);

-- RLS on all new tables
ALTER TABLE public.research_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compute_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_performance_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_risk_forecasts ENABLE ROW LEVEL SECURITY;

-- research_executions: users see own, authenticated can read all
CREATE POLICY "Users can insert own executions" ON public.research_executions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own executions" ON public.research_executions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can read all executions" ON public.research_executions
  FOR SELECT TO authenticated USING (true);

-- compute_proofs: readable by authenticated, insert through edge function
CREATE POLICY "Authenticated can read proofs" ON public.compute_proofs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert proofs for own executions" ON public.compute_proofs
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.research_executions WHERE id = research_execution_id AND user_id = auth.uid())
  );

-- supervisor_performance_index: readable by authenticated
CREATE POLICY "Authenticated can read supervisor index" ON public.supervisor_performance_index
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Supervisors can read own index" ON public.supervisor_performance_index
  FOR SELECT TO authenticated USING (supervisor_id = auth.uid());

-- milestone_risk_forecasts: readable by authenticated
CREATE POLICY "Authenticated can read forecasts" ON public.milestone_risk_forecasts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert forecasts" ON public.milestone_risk_forecasts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = generated_by);

-- Indexes for performance
CREATE INDEX idx_research_executions_user ON public.research_executions(user_id);
CREATE INDEX idx_research_executions_milestone ON public.research_executions(milestone_id);
CREATE INDEX idx_compute_proofs_execution ON public.compute_proofs(research_execution_id);
CREATE INDEX idx_supervisor_perf_supervisor ON public.supervisor_performance_index(supervisor_id);
CREATE INDEX idx_milestone_risk_milestone ON public.milestone_risk_forecasts(milestone_id);
CREATE INDEX idx_milestone_risk_deal ON public.milestone_risk_forecasts(deal_id);
