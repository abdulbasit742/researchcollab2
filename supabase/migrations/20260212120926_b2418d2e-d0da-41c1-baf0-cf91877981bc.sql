
-- PHASE 1: FYP Milestone Template Library
CREATE TABLE public.fyp_milestone_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.organizations(id),
  domain TEXT NOT NULL,
  template_name TEXT NOT NULL,
  milestone_structure JSONB NOT NULL DEFAULT '[]',
  estimated_duration TEXT,
  trust_weight NUMERIC DEFAULT 1.0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fyp_milestone_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view templates" ON public.fyp_milestone_templates FOR SELECT USING (true);
CREATE POLICY "Auth users can create templates" ON public.fyp_milestone_templates FOR INSERT WITH CHECK (auth.uid() = created_by);

-- PHASE 2: Supervisor Reviews
CREATE TABLE public.supervisor_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  review_type TEXT NOT NULL CHECK (review_type IN ('milestone', 'final', 'revision')),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'revision_needed', 'pending')),
  comments TEXT,
  trust_adjustment NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.supervisor_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviewers can manage their reviews" ON public.supervisor_reviews FOR ALL USING (auth.uid() = reviewer_id);
CREATE POLICY "Anyone can view reviews" ON public.supervisor_reviews FOR SELECT USING (true);

-- PHASE 3: Student Performance Metrics
CREATE TABLE public.student_performance_metrics (
  student_id UUID PRIMARY KEY REFERENCES auth.users(id),
  milestone_timeliness NUMERIC DEFAULT 0,
  revision_rate NUMERIC DEFAULT 0,
  supervisor_rating NUMERIC DEFAULT 0,
  trust_growth NUMERIC DEFAULT 0,
  economic_output NUMERIC DEFAULT 0,
  consistency_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own metrics" ON public.student_performance_metrics FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Anyone can view metrics" ON public.student_performance_metrics FOR SELECT USING (true);

-- PHASE 4: Research Validations
CREATE TABLE public.research_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  validator_id UUID NOT NULL REFERENCES auth.users(id),
  validation_score NUMERIC DEFAULT 0 CHECK (validation_score >= 0 AND validation_score <= 100),
  originality_score NUMERIC DEFAULT 0 CHECK (originality_score >= 0 AND originality_score <= 100),
  impact_score NUMERIC DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 100),
  comments TEXT,
  is_blind_review BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_validations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Validators can manage" ON public.research_validations FOR ALL USING (auth.uid() = validator_id);
CREATE POLICY "Anyone can view" ON public.research_validations FOR SELECT USING (true);

-- PHASE 5: Micro Academic Tasks
CREATE TABLE public.micro_academic_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.organizations(id),
  posted_by UUID NOT NULL REFERENCES auth.users(id),
  task_title TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('literature_review', 'data_cleaning', 'survey_analysis', 'coding', 'writing', 'other')),
  description TEXT,
  reward_amount NUMERIC DEFAULT 0,
  trust_weight NUMERIC DEFAULT 1.0,
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.micro_academic_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tasks" ON public.micro_academic_tasks FOR SELECT USING (true);
CREATE POLICY "Posters can manage" ON public.micro_academic_tasks FOR ALL USING (auth.uid() = posted_by);
CREATE POLICY "Assigned can update" ON public.micro_academic_tasks FOR UPDATE USING (auth.uid() = assigned_to);

-- PHASE 6: Supervisor Performance Metrics
CREATE TABLE public.supervisor_performance_metrics (
  supervisor_id UUID PRIMARY KEY REFERENCES auth.users(id),
  student_completion_rate NUMERIC DEFAULT 0,
  avg_trust_growth NUMERIC DEFAULT 0,
  revision_ratio NUMERIC DEFAULT 0,
  dispute_rate NUMERIC DEFAULT 0,
  institutional_rating NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.supervisor_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view" ON public.supervisor_performance_metrics FOR SELECT USING (true);

-- PHASE 7: FYP Risk Flags
CREATE TABLE public.fyp_risk_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('milestone_delay', 'revision_loop', 'low_engagement', 'dropout_risk', 'quality_concern')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  recommended_action TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fyp_risk_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view flags" ON public.fyp_risk_flags FOR SELECT USING (true);

-- PHASE 8: Employability Reports
CREATE TABLE public.employability_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  trust_score INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  validation_score NUMERIC DEFAULT 0,
  economic_output NUMERIC DEFAULT 0,
  skills_summary JSONB DEFAULT '[]',
  public_link_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employability_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reports" ON public.employability_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public link access" ON public.employability_reports FOR SELECT USING (true);
