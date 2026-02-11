
-- =============================================
-- Autonomous Governance Pods (AGP) Schema
-- =============================================

-- governance_pods: Pod definitions
CREATE TABLE public.agp_pods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_type TEXT NOT NULL,
  formation_method TEXT NOT NULL DEFAULT 'trust-weighted',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agp_pods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read agp_pods"
  ON public.agp_pods FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage agp_pods"
  ON public.agp_pods FOR ALL USING (public.is_admin(auth.uid()));

-- agp_members: Pod membership
CREATE TABLE public.agp_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID NOT NULL REFERENCES public.agp_pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  trust_snapshot NUMERIC DEFAULT 0,
  voting_weight NUMERIC DEFAULT 1,
  institution_id UUID,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agp_members_pod ON public.agp_members(pod_id);
CREATE INDEX idx_agp_members_user ON public.agp_members(user_id);

ALTER TABLE public.agp_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read agp_members"
  ON public.agp_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage agp_members"
  ON public.agp_members FOR ALL USING (public.is_admin(auth.uid()));

-- agp_votes: Immutable vote records
CREATE TABLE public.agp_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID NOT NULL REFERENCES public.agp_pods(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL,
  issue_type TEXT NOT NULL,
  issue_reference_id UUID,
  vote_decision TEXT NOT NULL,
  weighted_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agp_votes_pod ON public.agp_votes(pod_id);
CREATE INDEX idx_agp_votes_issue ON public.agp_votes(issue_reference_id);

ALTER TABLE public.agp_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read agp_votes"
  ON public.agp_votes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Members can cast agp_votes"
  ON public.agp_votes FOR INSERT TO authenticated
  WITH CHECK (
    voter_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.agp_members WHERE pod_id = agp_votes.pod_id AND user_id = auth.uid())
  );

-- agp_decisions: Outcomes
CREATE TABLE public.agp_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID NOT NULL REFERENCES public.agp_pods(id) ON DELETE CASCADE,
  issue_reference_id UUID,
  decision_summary TEXT NOT NULL,
  execution_required BOOLEAN DEFAULT false,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agp_decisions_pod ON public.agp_decisions(pod_id);

ALTER TABLE public.agp_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read agp_decisions"
  ON public.agp_decisions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage agp_decisions"
  ON public.agp_decisions FOR ALL USING (public.is_admin(auth.uid()));

-- agp_audit_logs: Immutable audit trail
CREATE TABLE public.agp_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID NOT NULL REFERENCES public.agp_pods(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  actor_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agp_audit_pod ON public.agp_audit_logs(pod_id);

ALTER TABLE public.agp_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read agp_audit_logs"
  ON public.agp_audit_logs FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert agp_audit_logs"
  ON public.agp_audit_logs FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- platform_constitution: Core rules
CREATE TABLE public.platform_constitution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_category TEXT NOT NULL,
  rule_key TEXT NOT NULL UNIQUE,
  rule_value JSONB NOT NULL,
  rationale TEXT,
  enacted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  enacted_by_pod_id UUID REFERENCES public.agp_pods(id),
  superseded_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.platform_constitution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform_constitution"
  ON public.platform_constitution FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert platform_constitution"
  ON public.platform_constitution FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update platform_constitution"
  ON public.platform_constitution FOR UPDATE USING (public.is_admin(auth.uid()));
