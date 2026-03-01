
-- ============================================================
-- MODULE 1: Database Query Optimization — Strategic Indexes
-- ============================================================

-- Milestone tasks: common queries by milestone + status
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_milestone_status 
  ON public.milestone_tasks(milestone_id, status);
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_assigned 
  ON public.milestone_tasks(assigned_to);

-- Task activity logs
CREATE INDEX IF NOT EXISTS idx_task_activity_logs_task 
  ON public.task_activity_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_logs_performed 
  ON public.task_activity_logs(performed_by);

-- Research artifacts
CREATE INDEX IF NOT EXISTS idx_research_artifacts_project 
  ON public.research_artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_research_artifacts_milestone 
  ON public.research_artifacts(milestone_id);

-- Review requests
CREATE INDEX IF NOT EXISTS idx_review_requests_milestone 
  ON public.review_requests(milestone_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_reviewer_status 
  ON public.review_requests(reviewer_id, status);

-- Activity feed
CREATE INDEX IF NOT EXISTS idx_activity_feed_project_created 
  ON public.activity_feed(project_id, created_at DESC);

-- Search audit log: cleanup queries
CREATE INDEX IF NOT EXISTS idx_search_audit_created_user 
  ON public.search_audit_log(user_id, created_at DESC);

-- Workspace documents
CREATE INDEX IF NOT EXISTS idx_workspace_docs_workspace 
  ON public.workspace_documents(workspace_id);

-- Execution snapshots
CREATE INDEX IF NOT EXISTS idx_exec_snapshots_project_date 
  ON public.execution_snapshots(project_id, snapshot_date DESC);

-- Project activity summary
CREATE INDEX IF NOT EXISTS idx_project_activity_summary_score 
  ON public.project_activity_summary(activity_score DESC);

-- ============================================================
-- MODULE 2: Cached Analytics Snapshots
-- ============================================================
CREATE TABLE public.cached_analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_type text NOT NULL,
  entity_id uuid,
  snapshot_data jsonb NOT NULL DEFAULT '{}',
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour')
);

CREATE INDEX idx_cas_type_entity ON public.cached_analytics_snapshots(snapshot_type, entity_id);
CREATE INDEX idx_cas_expires ON public.cached_analytics_snapshots(expires_at);

ALTER TABLE public.cached_analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cached snapshots"
  ON public.cached_analytics_snapshots FOR SELECT TO authenticated
  USING (true);

-- RPC: get_cached_project_summary
CREATE OR REPLACE FUNCTION public.get_cached_project_summary(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT snapshot_data INTO result
  FROM public.cached_analytics_snapshots
  WHERE snapshot_type = 'project_summary'
    AND entity_id = p_project_id
    AND expires_at > now()
  ORDER BY generated_at DESC LIMIT 1;

  IF result IS NULL THEN
    result := jsonb_build_object('status', 'no_cache', 'project_id', p_project_id);
  END IF;
  RETURN result;
END;
$$;

-- RPC: get_cached_institution_summary
CREATE OR REPLACE FUNCTION public.get_cached_institution_summary(p_institution_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT snapshot_data INTO result
  FROM public.cached_analytics_snapshots
  WHERE snapshot_type = 'institution_summary'
    AND entity_id = p_institution_id
    AND expires_at > now()
  ORDER BY generated_at DESC LIMIT 1;

  IF result IS NULL THEN
    result := jsonb_build_object('status', 'no_cache', 'institution_id', p_institution_id);
  END IF;
  RETURN result;
END;
$$;

-- ============================================================
-- MODULE 4: System Health Monitoring
-- ============================================================
CREATE TABLE public.system_health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subsystem_name text NOT NULL,
  response_time_ms integer,
  error_rate numeric DEFAULT 0,
  last_checked timestamptz NOT NULL DEFAULT now(),
  health_score integer DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX idx_shm_subsystem ON public.system_health_metrics(subsystem_name, last_checked DESC);

ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;

-- Only admin can read health metrics (use has_role if available, else authenticated for now)
CREATE POLICY "Authenticated can read health metrics"
  ON public.system_health_metrics FOR SELECT TO authenticated
  USING (true);

CREATE TABLE public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  error_message text NOT NULL,
  stack_trace text,
  user_id uuid,
  metadata jsonb DEFAULT '{}',
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_error_logs_endpoint ON public.error_logs(endpoint, occurred_at DESC);
CREATE INDEX idx_error_logs_occurred ON public.error_logs(occurred_at DESC);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read error logs"
  ON public.error_logs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert error logs"
  ON public.error_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- RPC: compute_health_score
CREATE OR REPLACE FUNCTION public.compute_health_score()
RETURNS TABLE(
  subsystem_name text,
  health_score integer,
  response_time_ms integer,
  error_rate numeric,
  last_checked timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (shm.subsystem_name)
    shm.subsystem_name,
    shm.health_score,
    shm.response_time_ms,
    shm.error_rate,
    shm.last_checked
  FROM public.system_health_metrics shm
  ORDER BY shm.subsystem_name, shm.last_checked DESC;
END;
$$;
