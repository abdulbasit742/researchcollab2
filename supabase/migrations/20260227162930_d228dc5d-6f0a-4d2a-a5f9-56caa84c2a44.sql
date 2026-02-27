
-- Peer Review Cycles
CREATE TABLE public.peer_review_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.research_workspaces(id) ON DELETE CASCADE NOT NULL,
  initiated_by UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Review Cycle',
  review_type TEXT NOT NULL DEFAULT 'open' CHECK (review_type IN ('open', 'blind', 'institutional', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'revision_requested', 'approved', 'rejected')),
  workspace_version_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Reviewers assigned to cycles
CREATE TABLE public.peer_review_reviewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_cycle_id UUID REFERENCES public.peer_review_cycles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID NOT NULL,
  reviewer_role TEXT NOT NULL DEFAULT 'external' CHECK (reviewer_role IN ('external', 'institutional', 'enterprise', 'ai_assisted')),
  review_weight NUMERIC NOT NULL DEFAULT 1.0,
  expertise_tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'declined', 'completed')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Review Comments (claim-bound)
CREATE TABLE public.review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_cycle_id UUID REFERENCES public.peer_review_cycles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID NOT NULL,
  claim_id UUID,
  section_reference TEXT,
  comment_text TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'evidence' CHECK (comment_type IN ('methodology', 'evidence', 'logic', 'clarity', 'compliance', 'bias')),
  severity_level TEXT NOT NULL DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  ai_analysis JSONB,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by_version INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Review Outcomes
CREATE TABLE public.review_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_cycle_id UUID REFERENCES public.peer_review_cycles(id) ON DELETE CASCADE NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approve', 'minor_revision', 'major_revision', 'reject')),
  summary TEXT NOT NULL,
  weighted_score NUMERIC,
  reviewer_scores JSONB DEFAULT '{}',
  trust_impact_applied BOOLEAN NOT NULL DEFAULT false,
  institutional_seal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Debate Threads (structured claim challenges)
CREATE TABLE public.debate_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_cycle_id UUID REFERENCES public.peer_review_cycles(id) ON DELETE CASCADE NOT NULL,
  claim_id UUID,
  initiated_by UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'moderated', 'resolved', 'escalated')),
  moderator_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE public.debate_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.debate_threads(id) ON DELETE CASCADE NOT NULL,
  author_id UUID NOT NULL,
  entry_type TEXT NOT NULL DEFAULT 'argument' CHECK (entry_type IN ('challenge', 'counterclaim', 'evidence', 'defense', 'concession', 'moderator_note')),
  content TEXT NOT NULL,
  cited_claim_ids UUID[] DEFAULT '{}',
  cited_sources JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.peer_review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_review_reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_entries ENABLE ROW LEVEL SECURITY;

-- Policies: workspace members can view, initiator + reviewers can write
CREATE POLICY "Authenticated users view review cycles" ON public.peer_review_cycles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Initiator manages review cycles" ON public.peer_review_cycles
  FOR ALL TO authenticated USING (initiated_by = auth.uid()) WITH CHECK (initiated_by = auth.uid());

CREATE POLICY "Authenticated view reviewers" ON public.peer_review_reviewers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Cycle initiator manages reviewers" ON public.peer_review_reviewers
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.peer_review_cycles WHERE id = review_cycle_id AND initiated_by = auth.uid())
  );

CREATE POLICY "Authenticated view comments" ON public.review_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Reviewers add comments" ON public.review_comments
  FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Authenticated view outcomes" ON public.review_outcomes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Cycle initiator creates outcomes" ON public.review_outcomes
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.peer_review_cycles WHERE id = review_cycle_id AND initiated_by = auth.uid())
  );

CREATE POLICY "Authenticated view debate threads" ON public.debate_threads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated create debate threads" ON public.debate_threads
  FOR INSERT TO authenticated WITH CHECK (initiated_by = auth.uid());

CREATE POLICY "Authenticated view debate entries" ON public.debate_entries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authors add debate entries" ON public.debate_entries
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

-- Indexes
CREATE INDEX idx_peer_review_cycles_workspace ON public.peer_review_cycles(workspace_id);
CREATE INDEX idx_review_comments_cycle ON public.review_comments(review_cycle_id);
CREATE INDEX idx_review_comments_claim ON public.review_comments(claim_id);
CREATE INDEX idx_debate_threads_cycle ON public.debate_threads(review_cycle_id);
CREATE INDEX idx_debate_entries_thread ON public.debate_entries(thread_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.review_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debate_entries;
