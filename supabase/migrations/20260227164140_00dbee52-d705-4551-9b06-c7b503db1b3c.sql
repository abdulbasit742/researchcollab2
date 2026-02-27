
-- CARC: AI Reasoning Logs table
CREATE TABLE public.ai_reasoning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID,
  workspace_id UUID,
  user_id UUID,
  retrieved_chunk_ids TEXT[] DEFAULT '{}',
  reasoning_steps JSONB DEFAULT '[]',
  evidence_points JSONB DEFAULT '[]',
  inference_points JSONB DEFAULT '[]',
  assumption_points JSONB DEFAULT '[]',
  unknown_points JSONB DEFAULT '[]',
  hypotheses JSONB DEFAULT '[]',
  counter_arguments JSONB DEFAULT '[]',
  fallacy_flags JSONB DEFAULT '[]',
  compliance_flags JSONB DEFAULT '[]',
  uncertainty_score NUMERIC DEFAULT 0,
  data_completeness NUMERIC DEFAULT 0,
  evidence_density NUMERIC DEFAULT 0,
  contradiction_risk NUMERIC DEFAULT 0,
  consensus_stability NUMERIC DEFAULT 0,
  risk_level TEXT DEFAULT 'moderate',
  hallucination_check_passed BOOLEAN DEFAULT true,
  model_used TEXT,
  token_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_reasoning_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reasoning logs" ON public.ai_reasoning_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service inserts reasoning logs" ON public.ai_reasoning_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_reasoning_logs_query ON public.ai_reasoning_logs(query_id);
CREATE INDEX idx_reasoning_logs_workspace ON public.ai_reasoning_logs(workspace_id);
