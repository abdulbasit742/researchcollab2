
-- =====================================================
-- FEATURE 14: GLOBAL COLLABORATION & RESEARCH MOBILITY
-- =====================================================

-- Research mobility requests
CREATE TABLE public.research_mobility_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  host_institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  home_institution_id UUID REFERENCES public.organizations(id),
  mobility_type TEXT NOT NULL CHECK (mobility_type IN ('visiting_scholar', 'short_term_visit', 'joint_supervision', 'sabbatical', 'exchange', 'research_stay')),
  research_timeline_id UUID REFERENCES public.research_timelines(id),
  proposed_start_date DATE NOT NULL,
  proposed_end_date DATE NOT NULL,
  purpose_statement TEXT,
  funding_source TEXT CHECK (funding_source IN ('self', 'grant', 'host', 'home', 'third_party', 'mixed')),
  funding_details JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mobility agreements
CREATE TABLE public.mobility_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobility_request_id UUID NOT NULL REFERENCES public.research_mobility_requests(id) ON DELETE CASCADE,
  agreement_type TEXT NOT NULL CHECK (agreement_type IN ('mou', 'loa', 'visiting_contract', 'joint_supervision', 'exchange_agreement', 'custom')),
  agreement_summary TEXT NOT NULL,
  obligations_home TEXT,
  obligations_host TEXT,
  scholar_rights TEXT,
  ip_terms TEXT,
  confidentiality_terms TEXT,
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'active', 'expired', 'terminated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Multi-party approvals
CREATE TABLE public.mobility_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobility_request_id UUID NOT NULL REFERENCES public.research_mobility_requests(id) ON DELETE CASCADE,
  approver_type TEXT NOT NULL CHECK (approver_type IN ('home_institution', 'host_institution', 'funder', 'ethics_board', 'admin')),
  approver_user_id UUID REFERENCES public.profiles(id),
  approver_org_id UUID REFERENCES public.organizations(id),
  decision TEXT CHECK (decision IN ('pending', 'approved', 'conditional', 'rejected')),
  conditions TEXT,
  notes TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance flags for mobility
CREATE TABLE public.mobility_compliance_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobility_request_id UUID NOT NULL REFERENCES public.research_mobility_requests(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('visa_required', 'ethics_pending', 'funding_unconfirmed', 'export_control', 'security_clearance', 'insurance_required', 'health_check')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'waived')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Active visiting scholar records
CREATE TABLE public.visiting_scholar_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  host_institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  mobility_request_id UUID REFERENCES public.research_mobility_requests(id),
  active_from DATE NOT NULL,
  active_until DATE NOT NULL,
  access_scope TEXT NOT NULL DEFAULT 'research_only' CHECK (access_scope IN ('research_only', 'teaching', 'supervision', 'full_faculty', 'limited')),
  office_location TEXT,
  local_contact_id UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- FEATURE 15: IP, LICENSING & COMMERCIALIZATION
-- =====================================================

-- IP ownership records
CREATE TABLE public.ip_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('research_timeline', 'publication', 'dataset', 'software', 'method', 'invention')),
  target_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  ip_regime TEXT NOT NULL CHECK (ip_regime IN ('institution_owned', 'joint_ownership', 'scholar_owned', 'open', 'mixed', 'undeclared')),
  declared_by UUID NOT NULL REFERENCES public.profiles(id),
  institution_policy_id UUID REFERENCES public.organizations(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'disputed', 'revised', 'transferred')),
  declared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- IP contributors/owners
CREATE TABLE public.ip_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_record_id UUID NOT NULL REFERENCES public.ip_records(id) ON DELETE CASCADE,
  scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  contribution_record_id UUID REFERENCES public.contribution_records(id),
  ownership_percentage DECIMAL(5,2) CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  role TEXT NOT NULL CHECK (role IN ('inventor', 'author', 'contributor', 'technical_lead', 'advisor')),
  rights_description TEXT,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- IP licensing agreements
CREATE TABLE public.ip_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_record_id UUID NOT NULL REFERENCES public.ip_records(id) ON DELETE CASCADE,
  license_type TEXT NOT NULL CHECK (license_type IN ('exclusive', 'non_exclusive', 'open_source', 'creative_commons', 'research_only', 'educational', 'custom')),
  licensee_org_id UUID REFERENCES public.organizations(id),
  licensee_name TEXT,
  licensee_type TEXT CHECK (licensee_type IN ('academic', 'commercial', 'government', 'nonprofit', 'individual')),
  scope TEXT NOT NULL CHECK (scope IN ('research_only', 'commercial', 'derivative', 'distribution', 'full')),
  territory TEXT DEFAULT 'worldwide',
  duration_months INTEGER,
  royalty_terms JSONB DEFAULT '{}',
  upfront_fee DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'negotiating', 'active', 'expired', 'terminated', 'disputed')),
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Commercialization requests
CREATE TABLE public.commercialization_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_record_id UUID NOT NULL REFERENCES public.ip_records(id) ON DELETE CASCADE,
  requester_user_id UUID REFERENCES public.profiles(id),
  requester_org_id UUID REFERENCES public.organizations(id),
  intended_use TEXT NOT NULL,
  market_description TEXT,
  proposed_terms JSONB DEFAULT '{}',
  business_plan_summary TEXT,
  expected_revenue_share DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'negotiating', 'approved', 'rejected', 'withdrawn')),
  review_notes TEXT,
  decided_by UUID REFERENCES public.profiles(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- IP disputes
CREATE TABLE public.ip_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_record_id UUID NOT NULL REFERENCES public.ip_records(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES public.profiles(id),
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('ownership', 'contribution_share', 'unauthorized_use', 'license_violation', 'attribution', 'other')),
  description TEXT NOT NULL,
  evidence_summary TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_mediation', 'escalated', 'resolved', 'dismissed')),
  resolution_summary TEXT,
  mediator_id UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- FEATURE 16: REAL-TIME COLLABORATIVE WORKSPACES
-- =====================================================

-- Collaborative workspaces
CREATE TABLE public.collaborative_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_timeline_id UUID REFERENCES public.research_timelines(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  workspace_type TEXT NOT NULL CHECK (workspace_type IN ('drafting', 'analysis', 'methodology', 'synthesis', 'review', 'proposal', 'general')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{"allow_anonymous_suggestions": false, "require_approval_for_edits": false}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workspace members with roles
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.collaborative_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('viewer', 'contributor', 'editor', 'admin')),
  invited_by UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Modular content blocks
CREATE TABLE public.workspace_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.collaborative_workspaces(id) ON DELETE CASCADE,
  parent_block_id UUID REFERENCES public.workspace_blocks(id),
  block_type TEXT NOT NULL CHECK (block_type IN ('text', 'heading', 'equation', 'table', 'code', 'citation', 'image', 'comment', 'question', 'callout', 'divider')),
  content JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  last_edited_by UUID REFERENCES public.profiles(id),
  is_locked BOOLEAN NOT NULL DEFAULT false,
  locked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Block version history
CREATE TABLE public.workspace_block_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES public.workspace_blocks(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content_snapshot JSONB NOT NULL,
  edited_by UUID NOT NULL REFERENCES public.profiles(id),
  change_type TEXT CHECK (change_type IN ('create', 'edit', 'major_rewrite', 'format', 'merge')),
  change_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(block_id, version_number)
);

-- Real-time presence
CREATE TABLE public.workspace_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.collaborative_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_block_id UUID REFERENCES public.workspace_blocks(id),
  cursor_position JSONB,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Scholarly discussions on blocks
CREATE TABLE public.workspace_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.collaborative_workspaces(id) ON DELETE CASCADE,
  related_block_id UUID REFERENCES public.workspace_blocks(id),
  discussion_type TEXT NOT NULL CHECK (discussion_type IN ('clarification', 'disagreement', 'suggestion', 'question', 'praise', 'concern')),
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- FEATURE 17: SEMANTIC SEARCH & DISCOVERY
-- =====================================================

-- Search indexes (metadata, not actual vectors - those would be in a vector DB)
CREATE TABLE public.search_indexes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('scholar', 'publication', 'dataset', 'research_timeline', 'funding_program', 'knowledge_node', 'workspace', 'organization')),
  entity_id UUID NOT NULL,
  searchable_text TEXT NOT NULL,
  keywords TEXT[],
  domains TEXT[],
  visibility_scope TEXT NOT NULL DEFAULT 'public' CHECK (visibility_scope IN ('private', 'collaborators', 'institution', 'public')),
  owner_id UUID,
  embedding_version TEXT,
  last_indexed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

-- Saved semantic queries
CREATE TABLE public.semantic_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query_name TEXT,
  query_text TEXT NOT NULL,
  parsed_structure JSONB,
  entity_types TEXT[],
  filters JSONB DEFAULT '{}',
  scope TEXT NOT NULL DEFAULT 'personal' CHECK (scope IN ('personal', 'institution', 'public')),
  is_alert_enabled BOOLEAN NOT NULL DEFAULT false,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Query execution logs
CREATE TABLE public.query_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID REFERENCES public.semantic_queries(id) ON DELETE SET NULL,
  executed_by UUID NOT NULL REFERENCES public.profiles(id),
  query_text TEXT NOT NULL,
  execution_time_ms INTEGER,
  result_count INTEGER,
  ranking_factors JSONB,
  filters_applied JSONB,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discovery signals for ranking
CREATE TABLE public.discovery_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('relevance', 'recency', 'credibility', 'interdisciplinarity', 'reproducibility', 'citation_quality', 'peer_validation')),
  signal_value DECIMAL(5,4) CHECK (signal_value >= 0 AND signal_value <= 1),
  context JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id, signal_type)
);

-- =====================================================
-- FEATURE 18: TRUST & ANTI-GAMIFICATION ENGINE
-- =====================================================

-- Trust profiles (extends user_trust_profiles or replaces)
CREATE TABLE public.trust_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  base_trust_level TEXT NOT NULL DEFAULT 'standard' CHECK (base_trust_level IN ('restricted', 'probationary', 'standard', 'trusted', 'institutional', 'steward')),
  trust_score DECIMAL(5,2) DEFAULT 50.00 CHECK (trust_score >= 0 AND trust_score <= 100),
  verification_weight DECIMAL(3,2) DEFAULT 1.00,
  is_manually_set BOOLEAN NOT NULL DEFAULT false,
  manual_set_by UUID REFERENCES public.profiles(id),
  manual_set_reason TEXT,
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atomic trust signals
CREATE TABLE public.trust_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'peer_review_quality', 'contribution_validation', 'dispute_outcome',
    'ethics_compliance', 'reproducibility', 'mentorship_quality',
    'collaboration_success', 'data_sharing', 'response_reliability'
  )),
  signal_value DECIMAL(5,2) NOT NULL CHECK (signal_value >= -100 AND signal_value <= 100),
  weight DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  context_type TEXT CHECK (context_type IN ('domain', 'institution', 'role', 'project')),
  context_id TEXT,
  source_entity_type TEXT,
  source_entity_id UUID,
  decays_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contextual trust views
CREATE TABLE public.trust_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL CHECK (context_type IN ('domain', 'institution', 'role', 'methodology')),
  context_id TEXT NOT NULL,
  trust_state TEXT NOT NULL DEFAULT 'normal' CHECK (trust_state IN ('limited', 'normal', 'elevated', 'expert')),
  context_score DECIMAL(5,2),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, context_type, context_id)
);

-- Trust interventions
CREATE TABLE public.trust_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL CHECK (intervention_type IN (
    'rate_limit', 'review_required', 'feature_restriction',
    'privilege_suspension', 'warning', 'restoration', 'privilege_grant'
  )),
  reason TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  applied_by UUID REFERENCES public.profiles(id),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  lifted_at TIMESTAMPTZ,
  lifted_by UUID REFERENCES public.profiles(id),
  lift_reason TEXT
);

-- Gaming detection events
CREATE TABLE public.gaming_detection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  detection_type TEXT NOT NULL CHECK (detection_type IN (
    'reciprocal_endorsements', 'review_ring', 'citation_manipulation',
    'fake_contributions', 'coordinated_activity', 'metric_inflation'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  evidence_summary TEXT,
  related_users UUID[],
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'confirmed', 'dismissed', 'actioned')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_mobility_requests_applicant ON public.research_mobility_requests(applicant_scholar_passport_id);
CREATE INDEX idx_mobility_requests_host ON public.research_mobility_requests(host_institution_id);
CREATE INDEX idx_mobility_requests_status ON public.research_mobility_requests(status);
CREATE INDEX idx_visiting_scholars_host ON public.visiting_scholar_records(host_institution_id);
CREATE INDEX idx_visiting_scholars_active ON public.visiting_scholar_records(is_active) WHERE is_active = true;

CREATE INDEX idx_ip_records_target ON public.ip_records(target_type, target_id);
CREATE INDEX idx_ip_contributors_scholar ON public.ip_contributors(scholar_passport_id);
CREATE INDEX idx_ip_licenses_status ON public.ip_licenses(status);
CREATE INDEX idx_commercialization_status ON public.commercialization_requests(status);

CREATE INDEX idx_workspaces_timeline ON public.collaborative_workspaces(research_timeline_id);
CREATE INDEX idx_workspace_blocks_workspace ON public.workspace_blocks(workspace_id);
CREATE INDEX idx_workspace_blocks_position ON public.workspace_blocks(workspace_id, position);
CREATE INDEX idx_workspace_presence_workspace ON public.workspace_presence(workspace_id);

CREATE INDEX idx_search_indexes_entity ON public.search_indexes(entity_type, entity_id);
CREATE INDEX idx_search_indexes_visibility ON public.search_indexes(visibility_scope);
CREATE INDEX idx_search_indexes_text ON public.search_indexes USING gin(to_tsvector('english', searchable_text));
CREATE INDEX idx_discovery_signals_entity ON public.discovery_signals(entity_type, entity_id);

CREATE INDEX idx_trust_profiles_level ON public.trust_profiles(base_trust_level);
CREATE INDEX idx_trust_signals_user ON public.trust_signals(user_id);
CREATE INDEX idx_trust_signals_type ON public.trust_signals(signal_type);
CREATE INDEX idx_trust_contexts_user ON public.trust_contexts(user_id);
CREATE INDEX idx_trust_interventions_user ON public.trust_interventions(user_id);
CREATE INDEX idx_gaming_detection_user ON public.gaming_detection_events(user_id);

-- =====================================================
-- ENABLE REALTIME FOR COLLABORATIVE FEATURES
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_discussions;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_mobility_requests_updated_at
  BEFORE UPDATE ON public.research_mobility_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ip_records_updated_at
  BEFORE UPDATE ON public.ip_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ip_licenses_updated_at
  BEFORE UPDATE ON public.ip_licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.collaborative_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_blocks_updated_at
  BEFORE UPDATE ON public.workspace_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-version blocks on update
CREATE OR REPLACE FUNCTION public.auto_version_workspace_block()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.workspace_block_versions (
      block_id, version_number, content_snapshot, edited_by, change_type
    )
    SELECT 
      NEW.id,
      COALESCE((SELECT MAX(version_number) FROM public.workspace_block_versions WHERE block_id = NEW.id), 0) + 1,
      OLD.content,
      NEW.last_edited_by,
      'edit';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER version_workspace_block
  AFTER UPDATE ON public.workspace_blocks
  FOR EACH ROW EXECUTE FUNCTION public.auto_version_workspace_block();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.research_mobility_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobility_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobility_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobility_compliance_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visiting_scholar_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercialization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_block_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_indexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semantic_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaming_detection_events ENABLE ROW LEVEL SECURITY;

-- Mobility policies
CREATE POLICY "Users can view their own mobility requests" ON public.research_mobility_requests
  FOR SELECT USING (
    applicant_scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create mobility requests" ON public.research_mobility_requests
  FOR INSERT WITH CHECK (
    applicant_scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own mobility requests" ON public.research_mobility_requests
  FOR UPDATE USING (
    applicant_scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid())
  );

-- IP policies
CREATE POLICY "Users can view IP they're involved in" ON public.ip_records
  FOR SELECT USING (
    declared_by = auth.uid()
    OR id IN (SELECT ip_record_id FROM public.ip_contributors WHERE scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create IP records" ON public.ip_records
  FOR INSERT WITH CHECK (declared_by = auth.uid());

CREATE POLICY "IP contributors can view their records" ON public.ip_contributors
  FOR SELECT USING (
    scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid())
    OR ip_record_id IN (SELECT id FROM public.ip_records WHERE declared_by = auth.uid())
  );

-- Workspace policies
CREATE POLICY "Workspace members can view workspaces" ON public.collaborative_workspaces
  FOR SELECT USING (
    created_by = auth.uid()
    OR id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create workspaces" ON public.collaborative_workspaces
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update workspaces" ON public.collaborative_workspaces
  FOR UPDATE USING (
    created_by = auth.uid()
    OR id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Members can view workspace blocks" ON public.workspace_blocks
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    OR workspace_id IN (SELECT id FROM public.collaborative_workspaces WHERE created_by = auth.uid())
  );

CREATE POLICY "Contributors can create blocks" ON public.workspace_blocks
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('contributor', 'editor', 'admin'))
    OR workspace_id IN (SELECT id FROM public.collaborative_workspaces WHERE created_by = auth.uid())
  );

CREATE POLICY "Editors can update blocks" ON public.workspace_blocks
  FOR UPDATE USING (
    created_by = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('editor', 'admin'))
  );

CREATE POLICY "Members can view presence" ON public.workspace_presence
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own presence" ON public.workspace_presence
  FOR ALL USING (user_id = auth.uid());

-- Search policies
CREATE POLICY "Users can view public search indexes" ON public.search_indexes
  FOR SELECT USING (visibility_scope = 'public' OR owner_id = auth.uid());

CREATE POLICY "Users can manage own queries" ON public.semantic_queries
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own query logs" ON public.query_execution_logs
  FOR SELECT USING (executed_by = auth.uid());

CREATE POLICY "Public discovery signals" ON public.discovery_signals
  FOR SELECT USING (true);

-- Trust policies
CREATE POLICY "Users can view own trust profile" ON public.trust_profiles
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view own trust signals" ON public.trust_signals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own trust contexts" ON public.trust_contexts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own interventions" ON public.trust_interventions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage trust" ON public.trust_profiles
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage gaming detection" ON public.gaming_detection_events
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
