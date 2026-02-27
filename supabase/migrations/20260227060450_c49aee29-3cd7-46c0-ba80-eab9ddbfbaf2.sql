
-- Execution-linked content pieces
CREATE TABLE IF NOT EXISTS public.execution_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  content_type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  body text NOT NULL,
  excerpt text,
  linked_project_id uuid,
  linked_milestone_id uuid,
  linked_escrow_amount numeric,
  institution_id uuid,
  sponsor_id uuid,
  tags text[] DEFAULT '{}',
  domain_category text,
  case_study_data jsonb,
  knowledge_credibility_score numeric DEFAULT 0,
  substance_rank_score numeric DEFAULT 0,
  avg_read_time_seconds numeric DEFAULT 0,
  completion_depth_pct numeric DEFAULT 0,
  deliverable_click_count integer DEFAULT 0,
  cross_reference_count integer DEFAULT 0,
  is_peer_reviewed boolean DEFAULT false,
  is_faculty_endorsed boolean DEFAULT false,
  is_sponsor_validated boolean DEFAULT false,
  status text DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.execution_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors manage own content"
  ON public.execution_content FOR ALL
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Published content is public"
  ON public.execution_content FOR SELECT
  TO authenticated
  USING (status = 'published');

-- Knowledge badges
CREATE TABLE IF NOT EXISTS public.knowledge_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.execution_content(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  awarded_by uuid,
  institution_id uuid,
  evidence_reference text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.knowledge_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges publicly visible"
  ON public.knowledge_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can award badges"
  ON public.knowledge_badges FOR INSERT
  TO authenticated
  WITH CHECK (awarded_by = auth.uid());

-- Content read analytics
CREATE TABLE IF NOT EXISTS public.content_read_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.execution_content(id) ON DELETE CASCADE,
  reader_id uuid NOT NULL,
  read_duration_seconds integer DEFAULT 0,
  completion_pct numeric DEFAULT 0,
  deliverable_clicked boolean DEFAULT false,
  cross_references_clicked integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.content_read_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Readers can insert analytics"
  ON public.content_read_analytics FOR INSERT
  TO authenticated
  WITH CHECK (reader_id = auth.uid());

CREATE POLICY "Authors can view analytics"
  ON public.content_read_analytics FOR SELECT
  TO authenticated
  USING (
    reader_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.execution_content WHERE id = content_id AND author_id = auth.uid())
  );

-- Structured debate panels
CREATE TABLE IF NOT EXISTS public.structured_debates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES public.execution_content(id) ON DELETE CASCADE,
  topic text NOT NULL,
  moderator_id uuid,
  is_faculty_moderated boolean DEFAULT false,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.structured_debates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Debates publicly visible"
  ON public.structured_debates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can create debates"
  ON public.structured_debates FOR INSERT
  TO authenticated
  WITH CHECK (moderator_id = auth.uid());

-- Debate responses (evidence-linked only)
CREATE TABLE IF NOT EXISTS public.debate_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id uuid NOT NULL REFERENCES public.structured_debates(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  response_text text NOT NULL,
  evidence_url text,
  escrow_reference_id uuid,
  project_reference_id uuid,
  faculty_endorsed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.debate_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Responses publicly visible"
  ON public.debate_responses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authors can insert responses"
  ON public.debate_responses FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Author knowledge credibility scores
CREATE TABLE IF NOT EXISTS public.author_credibility_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  knowledge_credibility_score numeric DEFAULT 0,
  escrow_depth_factor numeric DEFAULT 0,
  institutional_validation_factor numeric DEFAULT 0,
  deliverable_relevance_factor numeric DEFAULT 0,
  peer_endorsement_factor numeric DEFAULT 0,
  sponsor_acknowledgment_factor numeric DEFAULT 0,
  content_count integer DEFAULT 0,
  avg_substance_rank numeric DEFAULT 0,
  tier text DEFAULT 'emerging',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.author_credibility_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Credibility scores publicly visible"
  ON public.author_credibility_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users manage own credibility"
  ON public.author_credibility_scores FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
