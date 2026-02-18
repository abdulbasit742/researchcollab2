
-- SIP Foundation Board Members
CREATE TABLE public.sip_foundation_board (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name TEXT NOT NULL,
  member_type TEXT NOT NULL CHECK (member_type IN ('university','corporate','capital','technical','observer')),
  organization TEXT,
  influence_weight NUMERIC DEFAULT 1 CHECK (influence_weight >= 0),
  appointed_at TIMESTAMPTZ DEFAULT now(),
  term_ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sip_foundation_board ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read foundation board" ON public.sip_foundation_board FOR SELECT USING (true);
CREATE POLICY "Admins manage foundation board" ON public.sip_foundation_board FOR ALL USING (public.is_admin(auth.uid()));

-- SIP Amendment Logs
CREATE TABLE public.sip_amendment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amendment_title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_by TEXT,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed','review','voting','approved','rejected','activated')),
  review_window_ends TIMESTAMPTZ,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  target_version TEXT,
  activation_date TIMESTAMPTZ,
  technical_review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sip_amendment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read amendments" ON public.sip_amendment_logs FOR SELECT USING (true);
CREATE POLICY "Admins manage amendments" ON public.sip_amendment_logs FOR ALL USING (public.is_admin(auth.uid()));

-- SIP Certified Nodes
CREATE TABLE public.sip_certified_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_name TEXT NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('country','university','corporate','research_institute')),
  jurisdiction TEXT,
  certification_level TEXT DEFAULT 'pending' CHECK (certification_level IN ('pending','basic','standard','advanced')),
  data_compliance BOOLEAN DEFAULT false,
  arbitration_compliance BOOLEAN DEFAULT false,
  escrow_integrity BOOLEAN DEFAULT false,
  trust_transparency BOOLEAN DEFAULT false,
  certified_at TIMESTAMPTZ,
  last_audit_at TIMESTAMPTZ,
  next_audit_due TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sip_certified_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read certified nodes" ON public.sip_certified_nodes FOR SELECT USING (true);
CREATE POLICY "Admins manage certified nodes" ON public.sip_certified_nodes FOR ALL USING (public.is_admin(auth.uid()));

-- SIP Neutrality Charter
CREATE TABLE public.sip_neutrality_charter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  principle_name TEXT NOT NULL,
  principle_text TEXT NOT NULL,
  category TEXT CHECK (category IN ('governance','data','capital','ai','dispute','sovereignty')),
  is_immutable BOOLEAN DEFAULT false,
  enacted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sip_neutrality_charter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read neutrality charter" ON public.sip_neutrality_charter FOR SELECT USING (true);
CREATE POLICY "Admins manage neutrality charter" ON public.sip_neutrality_charter FOR ALL USING (public.is_admin(auth.uid()));

-- Foundation Governance Decisions
CREATE TABLE public.sip_governance_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_title TEXT NOT NULL,
  decision_type TEXT CHECK (decision_type IN ('protocol_update','board_change','certification','emergency','policy')),
  description TEXT,
  decided_by TEXT,
  outcome TEXT CHECK (outcome IN ('approved','rejected','deferred','emergency_override')),
  quorum_met BOOLEAN DEFAULT false,
  vote_summary JSONB DEFAULT '{}'::jsonb,
  effective_from TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sip_governance_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read governance decisions" ON public.sip_governance_decisions FOR SELECT USING (true);
CREATE POLICY "Admins manage governance decisions" ON public.sip_governance_decisions FOR ALL USING (public.is_admin(auth.uid()));
