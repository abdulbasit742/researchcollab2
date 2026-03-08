
-- ═══════════════════════════════════════════════════════════
-- UNIVERSAL INNOVATION GENERATOR: Three New Additive Layers
-- 1. Research Syndication Engine
-- 2. AI Innovation Advisor (uses edge function)
-- 3. Institutional Procurement Exchange
-- ═══════════════════════════════════════════════════════════

-- ── 1. Research Syndication Engine ──

CREATE TABLE public.research_syndicates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicate_name TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  lead_institution_id UUID,
  lead_coordinator_id UUID,
  funding_target NUMERIC DEFAULT 0,
  funding_committed NUMERIC DEFAULT 0,
  member_count INT DEFAULT 1,
  status TEXT DEFAULT 'forming',
  governance_model TEXT DEFAULT 'consensus',
  ip_sharing_policy TEXT DEFAULT 'proportional',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.syndicate_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicate_id UUID REFERENCES public.research_syndicates(id) ON DELETE CASCADE NOT NULL,
  institution_id UUID,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  funding_commitment NUMERIC DEFAULT 0,
  voting_weight NUMERIC DEFAULT 1,
  joined_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active'
);

CREATE TABLE public.syndicate_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicate_id UUID REFERENCES public.research_syndicates(id) ON DELETE CASCADE NOT NULL,
  project_title TEXT NOT NULL,
  description TEXT,
  budget_allocated NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'proposed',
  lead_researcher_id UUID,
  milestone_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. AI Innovation Advisor (data model for proposals) ──

CREATE TABLE public.ai_innovation_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL,
  context_domain TEXT,
  innovation_category TEXT,
  proposal_title TEXT,
  proposal_summary TEXT,
  core_components JSONB DEFAULT '[]',
  revenue_model TEXT,
  estimated_impact TEXT,
  ai_model_used TEXT,
  status TEXT DEFAULT 'generated',
  user_rating INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Institutional Procurement Exchange ──

CREATE TABLE public.procurement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID,
  requester_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'equipment',
  budget_min NUMERIC DEFAULT 0,
  budget_max NUMERIC DEFAULT 0,
  deadline TIMESTAMPTZ,
  required_certifications TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open',
  bid_count INT DEFAULT 0,
  selected_vendor_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.procurement_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.procurement_requests(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID NOT NULL,
  vendor_name TEXT,
  bid_amount NUMERIC NOT NULL,
  delivery_timeline_days INT DEFAULT 30,
  proposal_details TEXT,
  certifications TEXT[] DEFAULT '{}',
  trust_score_snapshot NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── RLS ──

ALTER TABLE public.research_syndicates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndicate_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndicate_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_innovation_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_bids ENABLE ROW LEVEL SECURITY;

-- Syndicates: public read, coordinator creates
CREATE POLICY "syndicates_select" ON public.research_syndicates FOR SELECT USING (true);
CREATE POLICY "syndicates_insert" ON public.research_syndicates FOR INSERT TO authenticated WITH CHECK (lead_coordinator_id = auth.uid());
CREATE POLICY "syndicates_update" ON public.research_syndicates FOR UPDATE TO authenticated USING (lead_coordinator_id = auth.uid());

-- Syndicate members: public read, auth join
CREATE POLICY "syndicate_members_select" ON public.syndicate_members FOR SELECT USING (true);
CREATE POLICY "syndicate_members_insert" ON public.syndicate_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Syndicate projects: public read, auth create
CREATE POLICY "syndicate_projects_select" ON public.syndicate_projects FOR SELECT USING (true);
CREATE POLICY "syndicate_projects_insert" ON public.syndicate_projects FOR INSERT TO authenticated WITH CHECK (lead_researcher_id = auth.uid());

-- AI proposals: own read/write
CREATE POLICY "ai_proposals_select" ON public.ai_innovation_proposals FOR SELECT TO authenticated USING (requested_by = auth.uid());
CREATE POLICY "ai_proposals_insert" ON public.ai_innovation_proposals FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid());
CREATE POLICY "ai_proposals_update" ON public.ai_innovation_proposals FOR UPDATE TO authenticated USING (requested_by = auth.uid());

-- Procurement: public read, auth create own
CREATE POLICY "procurement_requests_select" ON public.procurement_requests FOR SELECT USING (true);
CREATE POLICY "procurement_requests_insert" ON public.procurement_requests FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());
CREATE POLICY "procurement_requests_update" ON public.procurement_requests FOR UPDATE TO authenticated USING (requester_id = auth.uid());

CREATE POLICY "procurement_bids_select" ON public.procurement_bids FOR SELECT USING (true);
CREATE POLICY "procurement_bids_insert" ON public.procurement_bids FOR INSERT TO authenticated WITH CHECK (vendor_id = auth.uid());
