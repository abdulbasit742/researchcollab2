
-- ============================================================
-- AI Workflow Intelligence Tables
-- ============================================================

-- AI Milestone Suggestions
CREATE TABLE IF NOT EXISTS public.ai_milestone_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid,
  user_id uuid NOT NULL,
  suggestion_text text NOT NULL,
  task_breakdown jsonb,
  estimated_timeline text,
  risk_factors text[],
  review_points text[],
  accepted boolean DEFAULT false,
  generated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_milestone_suggestions_user ON public.ai_milestone_suggestions(user_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_milestone_suggestions_milestone ON public.ai_milestone_suggestions(milestone_id);
ALTER TABLE public.ai_milestone_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own milestone suggestions" ON public.ai_milestone_suggestions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own milestone suggestions" ON public.ai_milestone_suggestions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own milestone suggestions" ON public.ai_milestone_suggestions FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- AI Project Insights
CREATE TABLE IF NOT EXISTS public.ai_project_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  insight_type text NOT NULL,
  insight_message text NOT NULL,
  confidence_score numeric DEFAULT 0,
  generated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_project_insights_project ON public.ai_project_insights(project_id, generated_at DESC);
ALTER TABLE public.ai_project_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read project insights" ON public.ai_project_insights FOR SELECT TO authenticated USING (true);

-- AI Task Recommendations
CREATE TABLE IF NOT EXISTS public.ai_task_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL,
  user_id uuid NOT NULL,
  recommendation_text text NOT NULL,
  priority text,
  generated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_task_recs_milestone ON public.ai_task_recommendations(milestone_id, generated_at DESC);
ALTER TABLE public.ai_task_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own task recommendations" ON public.ai_task_recommendations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own task recommendations" ON public.ai_task_recommendations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- AI Collaboration Metrics
CREATE TABLE IF NOT EXISTS public.ai_collaboration_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  response_time_score numeric DEFAULT 0,
  engagement_score numeric DEFAULT 0,
  workload_balance_score numeric DEFAULT 0,
  overall_quality_score numeric DEFAULT 0,
  generated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_collab_metrics_project ON public.ai_collaboration_metrics(project_id, generated_at DESC);
ALTER TABLE public.ai_collaboration_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read collab metrics" ON public.ai_collaboration_metrics FOR SELECT TO authenticated USING (true);

-- AI Deadline Predictions
CREATE TABLE IF NOT EXISTS public.ai_deadline_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL,
  predicted_completion_date date,
  confidence_score numeric DEFAULT 0,
  factors jsonb,
  generated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_deadline_preds_milestone ON public.ai_deadline_predictions(milestone_id, generated_at DESC);
ALTER TABLE public.ai_deadline_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read deadline predictions" ON public.ai_deadline_predictions FOR SELECT TO authenticated USING (true);

-- AI Nudges
CREATE TABLE IF NOT EXISTS public.ai_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nudge_type text NOT NULL,
  message text NOT NULL,
  dismissed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_nudges_user ON public.ai_nudges(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_nudges_active ON public.ai_nudges(user_id, dismissed) WHERE dismissed = false;
ALTER TABLE public.ai_nudges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own nudges" ON public.ai_nudges FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own nudges" ON public.ai_nudges FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System insert nudges" ON public.ai_nudges FOR INSERT TO authenticated WITH CHECK (true);

-- AI Activity Logs (transparency)
CREATE TABLE IF NOT EXISTS public.ai_workflow_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  context_type text NOT NULL,
  feature_used text NOT NULL,
  input_summary text,
  output_hash text,
  tokens_used integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_workflow_logs_user ON public.ai_workflow_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_workflow_logs_feature ON public.ai_workflow_logs(feature_used, created_at DESC);
ALTER TABLE public.ai_workflow_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own ai logs" ON public.ai_workflow_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin read all ai logs" ON public.ai_workflow_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own ai logs" ON public.ai_workflow_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
