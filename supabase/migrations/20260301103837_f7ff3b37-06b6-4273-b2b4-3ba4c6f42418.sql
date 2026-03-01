
-- Workflow Sequence Recommendations
CREATE TABLE IF NOT EXISTS public.workflow_sequence_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  institution_id UUID,
  current_state TEXT,
  recommended_next_actions JSONB DEFAULT '[]',
  reasoning TEXT,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_sequence_recommendations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read workflow recs" ON public.workflow_sequence_recommendations FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_workflow_recs_proj ON public.workflow_sequence_recommendations(project_id, created_at DESC);

-- Role Coordination Suggestions
CREATE TABLE IF NOT EXISTS public.role_coordination_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  institution_id UUID,
  role_type TEXT NOT NULL,
  coordination_gap_type TEXT NOT NULL,
  suggestion_text TEXT NOT NULL,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.role_coordination_suggestions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read role coord" ON public.role_coordination_suggestions FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_role_coord_proj ON public.role_coordination_suggestions(project_id, created_at DESC);

-- Execution Bottlenecks
CREATE TABLE IF NOT EXISTS public.execution_bottlenecks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  institution_id UUID,
  bottleneck_type TEXT NOT NULL,
  bottleneck_score NUMERIC(5,2) DEFAULT 0,
  affected_entity TEXT,
  suggested_resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.execution_bottlenecks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read bottlenecks" ON public.execution_bottlenecks FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_bottlenecks_proj ON public.execution_bottlenecks(project_id, created_at DESC);

-- Orchestrated Timeline Models
CREATE TABLE IF NOT EXISTS public.orchestrated_timeline_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  institution_id UUID,
  optimized_milestone_sequence JSONB DEFAULT '[]',
  optimized_review_windows JSONB DEFAULT '[]',
  predicted_efficiency_gain NUMERIC(5,2) DEFAULT 0,
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orchestrated_timeline_models ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read timeline models" ON public.orchestrated_timeline_models FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Cross-Project Orchestration Insights
CREATE TABLE IF NOT EXISTS public.cross_project_orchestration_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  coordination_overlap_score NUMERIC(5,2) DEFAULT 0,
  reviewer_overload_clusters JSONB DEFAULT '[]',
  multi_project_delay_risk NUMERIC(5,2) DEFAULT 0,
  suggested_rebalancing JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cross_project_orchestration_insights ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read cross proj orch" ON public.cross_project_orchestration_insights FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_cross_proj_orch_inst ON public.cross_project_orchestration_insights(institution_id, created_at DESC);

-- Orchestration Feedback
CREATE TABLE IF NOT EXISTS public.orchestration_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recommendation_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  accepted BOOLEAN DEFAULT false,
  outcome_improvement_score NUMERIC(5,2),
  user_id UUID REFERENCES auth.users(id),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orchestration_feedback ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read orch feedback" ON public.orchestration_feedback FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth insert orch feedback" ON public.orchestration_feedback FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
