
-- FYP Projects
CREATE TABLE public.fyp_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.organizations(id),
  student_id UUID NOT NULL,
  supervisor_id UUID,
  project_title TEXT NOT NULL,
  domain TEXT,
  milestones JSONB DEFAULT '[]'::jsonb,
  trust_weight NUMERIC DEFAULT 1.0,
  final_score NUMERIC,
  economic_value NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'proposal',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.fyp_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own FYP projects" ON public.fyp_projects FOR SELECT USING (
  auth.uid() = student_id OR auth.uid() = supervisor_id OR public.is_admin(auth.uid())
);
CREATE POLICY "Students can create FYP projects" ON public.fyp_projects FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Participants can update FYP projects" ON public.fyp_projects FOR UPDATE USING (
  auth.uid() = student_id OR auth.uid() = supervisor_id OR public.is_admin(auth.uid())
);

-- Research Validation Records
CREATE TABLE public.research_validation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  validation_score NUMERIC,
  outcome_score NUMERIC,
  impact_rating TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.research_validation_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviewers and admins can view validations" ON public.research_validation_records FOR SELECT USING (
  auth.uid() = reviewer_id OR public.is_admin(auth.uid())
);
CREATE POLICY "Reviewers can insert validations" ON public.research_validation_records FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Academic Output Metrics (for analytics)
CREATE TABLE public.academic_output_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.organizations(id),
  period TEXT NOT NULL,
  fyp_completion_rate NUMERIC DEFAULT 0,
  economic_output NUMERIC DEFAULT 0,
  research_velocity NUMERIC DEFAULT 0,
  trust_stability NUMERIC DEFAULT 0,
  active_fyps INTEGER DEFAULT 0,
  completed_fyps INTEGER DEFAULT 0,
  active_research INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.academic_output_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage academic metrics" ON public.academic_output_metrics FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated can view academic metrics" ON public.academic_output_metrics FOR SELECT TO authenticated USING (true);
