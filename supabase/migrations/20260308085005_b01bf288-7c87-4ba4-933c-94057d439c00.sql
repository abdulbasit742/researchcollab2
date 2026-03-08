
-- =====================================================
-- GLOBAL PROBLEM → FUNDING → EXECUTION OPERATING LAYER
-- Additive-only tables. No core system mutations.
-- =====================================================

-- 1. Problem Registry (enhanced structured problems)
CREATE TABLE public.gpe_problem_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  problem_title TEXT NOT NULL,
  problem_summary TEXT,
  full_problem_brief TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  sub_category TEXT,
  domain_tags TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'medium',
  urgency_level TEXT DEFAULT 'normal',
  affected_population TEXT,
  geographic_scope TEXT DEFAULT 'global',
  required_capabilities TEXT[] DEFAULT '{}',
  desired_outcomes TEXT[] DEFAULT '{}',
  expected_deliverables TEXT[] DEFAULT '{}',
  evidence_required TEXT[] DEFAULT '{}',
  timeline_expectation TEXT,
  budget_range_min NUMERIC DEFAULT 0,
  budget_range_max NUMERIC DEFAULT 0,
  funding_model TEXT DEFAULT 'milestone_based',
  sponsor_type TEXT,
  institution_eligibility TEXT[] DEFAULT '{}',
  country_constraints TEXT[] DEFAULT '{}',
  compliance_constraints TEXT[] DEFAULT '{}',
  proposal_deadline TIMESTAMPTZ,
  execution_deadline TIMESTAMPTZ,
  visibility_mode TEXT DEFAULT 'public',
  trust_requirements JSONB DEFAULT '{}',
  review_requirements JSONB DEFAULT '{}',
  linked_funding_pool_id UUID,
  linked_campaign_id UUID,
  created_by UUID,
  status TEXT DEFAULT 'draft',
  total_proposals INTEGER DEFAULT 0,
  total_funding_committed NUMERIC DEFAULT 0,
  ai_triage_score NUMERIC,
  ai_clarity_score NUMERIC,
  ai_fundability_score NUMERIC,
  ai_commercialization_score NUMERIC,
  audit_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gpe_problem_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published problems" ON public.gpe_problem_registry FOR SELECT USING (status IN ('published','funding_open','proposal_review','execution_active','matched','completed') OR created_by = auth.uid());
CREATE POLICY "Authenticated users can create problems" ON public.gpe_problem_registry FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Owners can update their problems" ON public.gpe_problem_registry FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- 2. Problem Briefs (detailed documents attached to problems)
CREATE TABLE public.gpe_problem_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES public.gpe_problem_registry(id) ON DELETE CASCADE NOT NULL,
  brief_type TEXT DEFAULT 'sponsor_brief',
  title TEXT NOT NULL,
  content TEXT,
  document_url TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_problem_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Briefs follow problem visibility" ON public.gpe_problem_briefs FOR SELECT USING (true);
CREATE POLICY "Auth users can add briefs" ON public.gpe_problem_briefs FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());

-- 3. Proposals
CREATE TABLE public.gpe_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES public.gpe_problem_registry(id) ON DELETE CASCADE NOT NULL,
  lead_institution_id UUID,
  lead_user_id UUID NOT NULL,
  team_member_ids UUID[] DEFAULT '{}',
  capability_summary TEXT,
  execution_strategy TEXT,
  proposed_milestones JSONB DEFAULT '[]',
  timeline TEXT,
  budget_request NUMERIC DEFAULT 0,
  evidence_of_readiness TEXT,
  prior_execution_examples JSONB DEFAULT '[]',
  research_methodology TEXT,
  commercialization_potential TEXT,
  risk_mitigation_plan TEXT,
  reviewer_needs TEXT,
  cross_border_dependencies TEXT[] DEFAULT '{}',
  expected_outputs TEXT[] DEFAULT '{}',
  expected_impact TEXT,
  dataset_requirements TEXT,
  tool_requirements TEXT,
  governance_requirements TEXT,
  ai_clarity_score NUMERIC,
  ai_sponsor_fit_score NUMERIC,
  status TEXT DEFAULT 'draft',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View proposals" ON public.gpe_proposals FOR SELECT USING (true);
CREATE POLICY "Create proposals" ON public.gpe_proposals FOR INSERT TO authenticated WITH CHECK (lead_user_id = auth.uid());
CREATE POLICY "Update own proposals" ON public.gpe_proposals FOR UPDATE TO authenticated USING (lead_user_id = auth.uid());

-- 4. Proposal Team Members
CREATE TABLE public.gpe_proposal_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.gpe_proposals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  capabilities TEXT[] DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_proposal_team ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View team" ON public.gpe_proposal_team FOR SELECT USING (true);
CREATE POLICY "Add team" ON public.gpe_proposal_team FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Proposal Reviews
CREATE TABLE public.gpe_proposal_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.gpe_proposals(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID NOT NULL,
  reviewer_type TEXT DEFAULT 'faculty',
  quality_score NUMERIC,
  feasibility_score NUMERIC,
  impact_score NUMERIC,
  budget_score NUMERIC,
  overall_score NUMERIC,
  recommendation TEXT DEFAULT 'neutral',
  comments TEXT,
  bias_flags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_proposal_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View reviews" ON public.gpe_proposal_reviews FOR SELECT USING (true);
CREATE POLICY "Create reviews" ON public.gpe_proposal_reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());

-- 6. Sponsor Funding Pools (enhanced)
CREATE TABLE public.gpe_funding_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  pool_type TEXT DEFAULT 'single_problem',
  sponsor_entity_id UUID,
  sponsor_user_id UUID NOT NULL,
  linked_problem_ids UUID[] DEFAULT '{}',
  linked_domains TEXT[] DEFAULT '{}',
  total_committed_capital NUMERIC DEFAULT 0,
  available_capital NUMERIC DEFAULT 0,
  reserved_capital NUMERIC DEFAULT 0,
  allocation_rules JSONB DEFAULT '{}',
  review_rules JSONB DEFAULT '{}',
  institution_eligibility TEXT[] DEFAULT '{}',
  country_constraints TEXT[] DEFAULT '{}',
  risk_tolerance TEXT DEFAULT 'moderate',
  visibility TEXT DEFAULT 'public',
  funding_window_start TIMESTAMPTZ,
  funding_window_end TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  audit_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_funding_pools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View pools" ON public.gpe_funding_pools FOR SELECT USING (true);
CREATE POLICY "Create pools" ON public.gpe_funding_pools FOR INSERT TO authenticated WITH CHECK (sponsor_user_id = auth.uid());
CREATE POLICY "Update own pools" ON public.gpe_funding_pools FOR UPDATE TO authenticated USING (sponsor_user_id = auth.uid());

-- 7. Sponsor Accounts
CREATE TABLE public.gpe_sponsor_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_name TEXT NOT NULL,
  sponsor_type TEXT DEFAULT 'company',
  industry TEXT,
  country TEXT,
  total_capital_deployed NUMERIC DEFAULT 0,
  active_problems INTEGER DEFAULT 0,
  active_pools INTEGER DEFAULT 0,
  total_proposals_received INTEGER DEFAULT 0,
  total_executions_completed INTEGER DEFAULT 0,
  roi_score NUMERIC,
  trust_level TEXT DEFAULT 'standard',
  is_verified BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_sponsor_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View sponsors" ON public.gpe_sponsor_accounts FOR SELECT USING (true);
CREATE POLICY "Create sponsor" ON public.gpe_sponsor_accounts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own sponsor" ON public.gpe_sponsor_accounts FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- 8. AI Triage Runs
CREATE TABLE public.gpe_ai_triage_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES public.gpe_problem_registry(id) ON DELETE CASCADE NOT NULL,
  clarity_score NUMERIC,
  fundability_score NUMERIC,
  research_intensity_score NUMERIC,
  commercialization_potential NUMERIC,
  execution_readiness_score NUMERIC,
  risk_tags TEXT[] DEFAULT '{}',
  capability_extraction JSONB DEFAULT '[]',
  deliverable_extraction JSONB DEFAULT '[]',
  structured_summary TEXT,
  recommendations JSONB DEFAULT '[]',
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_ai_triage_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View triage" ON public.gpe_ai_triage_runs FOR SELECT USING (true);
CREATE POLICY "System insert triage" ON public.gpe_ai_triage_runs FOR INSERT TO authenticated WITH CHECK (true);

-- 9. AI Matching Runs
CREATE TABLE public.gpe_ai_matching_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES public.gpe_problem_registry(id) ON DELETE CASCADE NOT NULL,
  matched_institutions JSONB DEFAULT '[]',
  matched_teams JSONB DEFAULT '[]',
  matched_researchers JSONB DEFAULT '[]',
  confidence_scores JSONB DEFAULT '{}',
  match_explanations JSONB DEFAULT '[]',
  risk_notes TEXT[] DEFAULT '{}',
  team_composition_suggestions JSONB DEFAULT '[]',
  missing_role_suggestions TEXT[] DEFAULT '{}',
  recommended_reviewers JSONB DEFAULT '[]',
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_ai_matching_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View matches" ON public.gpe_ai_matching_runs FOR SELECT USING (true);
CREATE POLICY "Insert matches" ON public.gpe_ai_matching_runs FOR INSERT TO authenticated WITH CHECK (true);

-- 10. Commercialization Signals
CREATE TABLE public.gpe_commercialization_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES public.gpe_problem_registry(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES public.gpe_proposals(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  signal_strength NUMERIC DEFAULT 0,
  market_pull_score NUMERIC,
  ip_potential_score NUMERIC,
  startup_potential_score NUMERIC,
  enterprise_fit_score NUMERIC,
  evidence JSONB DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_commercialization_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View signals" ON public.gpe_commercialization_signals FOR SELECT USING (true);
CREATE POLICY "Insert signals" ON public.gpe_commercialization_signals FOR INSERT TO authenticated WITH CHECK (true);

-- 11. Operator Tasks
CREATE TABLE public.gpe_operator_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  assigned_to UUID,
  status TEXT DEFAULT 'open',
  notes TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.gpe_operator_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View tasks" ON public.gpe_operator_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert tasks" ON public.gpe_operator_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update tasks" ON public.gpe_operator_tasks FOR UPDATE TO authenticated USING (true);

-- 12. Opportunity Feed Events
CREATE TABLE public.gpe_opportunity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  target_audience TEXT[] DEFAULT '{}',
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  summary TEXT,
  domain TEXT,
  budget_range TEXT,
  urgency TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_opportunity_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View feed" ON public.gpe_opportunity_feed FOR SELECT USING (true);
CREATE POLICY "Insert feed" ON public.gpe_opportunity_feed FOR INSERT TO authenticated WITH CHECK (true);

-- 13. Problem Saved Items & Followers
CREATE TABLE public.gpe_saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  problem_id UUID REFERENCES public.gpe_problem_registry(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT DEFAULT 'saved',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, problem_id, action_type)
);
ALTER TABLE public.gpe_saved_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own saved" ON public.gpe_saved_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Save items" ON public.gpe_saved_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Remove saved" ON public.gpe_saved_items FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 14. Institution Challenge Portals
CREATE TABLE public.gpe_institution_portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  portal_name TEXT NOT NULL,
  description TEXT,
  branding JSONB DEFAULT '{}',
  visibility TEXT DEFAULT 'public',
  active_problems INTEGER DEFAULT 0,
  total_funding NUMERIC DEFAULT 0,
  total_proposals INTEGER DEFAULT 0,
  departments TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_institution_portals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View portals" ON public.gpe_institution_portals FOR SELECT USING (true);
CREATE POLICY "Create portals" ON public.gpe_institution_portals FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Update portals" ON public.gpe_institution_portals FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- 15. Revenue Events
CREATE TABLE public.gpe_revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source_entity_type TEXT,
  source_entity_id UUID,
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  fee_type TEXT,
  fee_percentage NUMERIC,
  sponsor_id UUID,
  institution_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_revenue_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View revenue" ON public.gpe_revenue_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert revenue" ON public.gpe_revenue_events FOR INSERT TO authenticated WITH CHECK (true);

-- 16. Problem Audit Events
CREATE TABLE public.gpe_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  actor_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View audits" ON public.gpe_audit_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert audits" ON public.gpe_audit_events FOR INSERT TO authenticated WITH CHECK (true);

-- 17. Lead Capture Events
CREATE TABLE public.gpe_lead_capture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL,
  lead_type TEXT DEFAULT 'sponsor',
  contact_name TEXT,
  contact_email TEXT,
  organization TEXT,
  raw_inquiry TEXT,
  structured_intent JSONB DEFAULT '{}',
  funding_intent_score NUMERIC,
  status TEXT DEFAULT 'new',
  assigned_to UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gpe_lead_capture ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View leads" ON public.gpe_lead_capture FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert leads" ON public.gpe_lead_capture FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Update leads" ON public.gpe_lead_capture FOR UPDATE TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX idx_gpe_problems_status ON public.gpe_problem_registry(status);
CREATE INDEX idx_gpe_problems_category ON public.gpe_problem_registry(category);
CREATE INDEX idx_gpe_problems_created_by ON public.gpe_problem_registry(created_by);
CREATE INDEX idx_gpe_proposals_problem ON public.gpe_proposals(problem_id);
CREATE INDEX idx_gpe_proposals_status ON public.gpe_proposals(status);
CREATE INDEX idx_gpe_pools_sponsor ON public.gpe_funding_pools(sponsor_user_id);
CREATE INDEX idx_gpe_feed_event ON public.gpe_opportunity_feed(event_type);
CREATE INDEX idx_gpe_audit_event ON public.gpe_audit_events(event_name);
