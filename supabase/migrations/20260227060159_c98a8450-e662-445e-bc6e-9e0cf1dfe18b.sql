
-- Sponsor performance feedback after project completion
CREATE TABLE IF NOT EXISTS public.sponsor_performance_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid,
  sponsor_id uuid NOT NULL,
  executor_id uuid NOT NULL,
  communication_clarity integer CHECK (communication_clarity BETWEEN 1 AND 5),
  deliverable_quality integer CHECK (deliverable_quality BETWEEN 1 AND 5),
  professionalism integer CHECK (professionalism BETWEEN 1 AND 5),
  timeliness integer CHECK (timeliness BETWEEN 1 AND 5),
  problem_solving integer CHECK (problem_solving BETWEEN 1 AND 5),
  overall_score numeric GENERATED ALWAYS AS (
    (communication_clarity + deliverable_quality + professionalism + timeliness + problem_solving)::numeric / 5
  ) STORED,
  comments text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.sponsor_performance_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsors can insert feedback"
  ON public.sponsor_performance_feedback FOR INSERT
  TO authenticated
  WITH CHECK (sponsor_id = auth.uid());

CREATE POLICY "Participants can view feedback"
  ON public.sponsor_performance_feedback FOR SELECT
  TO authenticated
  USING (sponsor_id = auth.uid() OR executor_id = auth.uid());

-- Skill evidence blocks (escrow-verified skill validation)
CREATE TABLE IF NOT EXISTS public.skill_evidence_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill_name text NOT NULL,
  project_id uuid,
  accountability_record_id uuid,
  deliverable_url text,
  sponsor_confirmed boolean DEFAULT false,
  faculty_confirmed boolean DEFAULT false,
  confidence_level text DEFAULT 'low',
  evidence_description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.skill_evidence_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own skill evidence"
  ON public.skill_evidence_blocks FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view skill evidence"
  ON public.skill_evidence_blocks FOR SELECT
  TO authenticated
  USING (true);

-- Talent readiness snapshots (periodic TRS calculation)
CREATE TABLE IF NOT EXISTS public.talent_readiness_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  talent_readiness_score numeric DEFAULT 0,
  escrow_volume_score numeric DEFAULT 0,
  complexity_diversity_score numeric DEFAULT 0,
  cross_domain_score numeric DEFAULT 0,
  institutional_validation_score numeric DEFAULT 0,
  sponsor_repeat_score numeric DEFAULT 0,
  punctuality_score numeric DEFAULT 0,
  dispute_free_score numeric DEFAULT 0,
  tier text DEFAULT 'emerging',
  snapshot_at timestamptz DEFAULT now()
);

ALTER TABLE public.talent_readiness_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own TRS"
  ON public.talent_readiness_snapshots FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view TRS for hiring"
  ON public.talent_readiness_snapshots FOR SELECT
  TO authenticated
  USING (true);

-- Faculty talent assessments
CREATE TABLE IF NOT EXISTS public.faculty_talent_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL,
  student_id uuid NOT NULL,
  assessment_type text NOT NULL,
  execution_depth_rating integer CHECK (execution_depth_rating BETWEEN 1 AND 5),
  skill_accuracy_rating integer CHECK (skill_accuracy_rating BETWEEN 1 AND 5),
  recommendation_level text DEFAULT 'neutral',
  notes text,
  flags text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.faculty_talent_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can insert assessments"
  ON public.faculty_talent_assessments FOR INSERT
  TO authenticated
  WITH CHECK (faculty_id = auth.uid());

CREATE POLICY "Faculty and student can view"
  ON public.faculty_talent_assessments FOR SELECT
  TO authenticated
  USING (faculty_id = auth.uid() OR student_id = auth.uid());
