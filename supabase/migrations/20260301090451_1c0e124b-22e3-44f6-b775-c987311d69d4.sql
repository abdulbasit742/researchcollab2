
-- MODULE 1: Milestone Task Breakdown
CREATE TABLE public.milestone_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID,
  due_date DATE,
  sort_order INT DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.task_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.milestone_tasks(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  performed_by UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MODULE 2: Artifact Versions (research_artifacts already exists)
CREATE TABLE public.artifact_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL REFERENCES public.research_artifacts(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MODULE 3: Structured Review Workflow
CREATE TABLE public.review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL,
  project_id UUID NOT NULL,
  requested_by UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.review_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_request_id UUID NOT NULL REFERENCES public.review_requests(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  rating_score INT NOT NULL DEFAULT 3,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MODULE 4: Project Activity Intelligence
CREATE TABLE public.project_activity_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE,
  total_tasks INT DEFAULT 0,
  completed_tasks INT DEFAULT 0,
  artifact_count INT DEFAULT 0,
  review_count INT DEFAULT 0,
  activity_score NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MODULE 5: Activity Feed
CREATE TABLE public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID NOT NULL,
  project_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_milestone_tasks_milestone ON public.milestone_tasks(milestone_id);
CREATE INDEX idx_milestone_tasks_assigned ON public.milestone_tasks(assigned_to);
CREATE INDEX idx_milestone_tasks_status ON public.milestone_tasks(status);
CREATE INDEX idx_task_activity_logs_task ON public.task_activity_logs(task_id);
CREATE INDEX idx_artifact_versions_artifact ON public.artifact_versions(artifact_id);
CREATE INDEX idx_review_requests_milestone ON public.review_requests(milestone_id);
CREATE INDEX idx_review_requests_reviewer ON public.review_requests(reviewer_id);
CREATE INDEX idx_review_feedback_request ON public.review_feedback(review_request_id);
CREATE INDEX idx_project_activity_project ON public.project_activity_summary(project_id);
CREATE INDEX idx_activity_feed_project ON public.activity_feed(project_id);
CREATE INDEX idx_activity_feed_performed ON public.activity_feed(performed_by);
CREATE INDEX idx_activity_feed_created ON public.activity_feed(created_at DESC);

-- RLS
ALTER TABLE public.milestone_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifact_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activity_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Milestone Tasks
CREATE POLICY "Auth read tasks" ON public.milestone_tasks
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Creator inserts tasks" ON public.milestone_tasks
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Assigned or creator updates" ON public.milestone_tasks
  FOR UPDATE USING (created_by = auth.uid() OR assigned_to = auth.uid());
CREATE POLICY "Creator deletes tasks" ON public.milestone_tasks
  FOR DELETE USING (created_by = auth.uid());

-- Task Activity Logs (append-only)
CREATE POLICY "Auth read task logs" ON public.task_activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Performer inserts logs" ON public.task_activity_logs
  FOR INSERT WITH CHECK (performed_by = auth.uid());

-- Artifact Versions (append-only)
CREATE POLICY "Auth read versions" ON public.artifact_versions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Uploader inserts versions" ON public.artifact_versions
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Review Requests
CREATE POLICY "Auth read reviews" ON public.review_requests
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Requester creates reviews" ON public.review_requests
  FOR INSERT WITH CHECK (requested_by = auth.uid());
CREATE POLICY "Participants update reviews" ON public.review_requests
  FOR UPDATE USING (requested_by = auth.uid() OR reviewer_id = auth.uid());

-- Review Feedback
CREATE POLICY "Auth read feedback" ON public.review_feedback
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Creator inserts feedback" ON public.review_feedback
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Project Activity Summary (read-only for users)
CREATE POLICY "Auth read summary" ON public.project_activity_summary
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "System upsert summary" ON public.project_activity_summary
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "System update summary" ON public.project_activity_summary
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Activity Feed (append-only)
CREATE POLICY "Auth read feed" ON public.activity_feed
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Performer inserts feed" ON public.activity_feed
  FOR INSERT WITH CHECK (performed_by = auth.uid());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestone_tasks;
