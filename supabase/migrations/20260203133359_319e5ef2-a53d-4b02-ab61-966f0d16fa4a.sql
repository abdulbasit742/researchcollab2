
-- =============================================
-- GLOBAL RESEARCH COMMONS & KNOWLEDGE LONGEVITY
-- =============================================

-- Canonical Knowledge Records
CREATE TABLE public.canonical_knowledge_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('theory', 'dataset', 'method', 'finding', 'protocol', 'framework')),
  canonical_version TEXT NOT NULL DEFAULT '1.0',
  checksum TEXT NOT NULL,
  declared_scope TEXT NOT NULL CHECK (declared_scope IN ('disciplinary', 'interdisciplinary', 'global')),
  governance_body UUID,
  title TEXT NOT NULL,
  abstract TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge Version Evolution (immutable history)
CREATE TABLE public.knowledge_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_record_id UUID NOT NULL REFERENCES public.canonical_knowledge_records(id),
  version_label TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('correction', 'extension', 'reinterpretation', 'supersession', 'retraction')),
  supersedes_version_id UUID REFERENCES public.knowledge_versions(id),
  justification TEXT NOT NULL,
  evidence_links JSONB DEFAULT '[]',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  context_snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge Governance Bodies
CREATE TABLE public.knowledge_governance_bodies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('disciplinary', 'regional', 'national', 'global')),
  mandate TEXT NOT NULL,
  decision_process TEXT NOT NULL,
  quorum_rules JSONB NOT NULL DEFAULT '{"minimum_members": 3, "approval_threshold": 0.67}',
  members JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dissent & Alternative Views Preservation
CREATE TABLE public.knowledge_dissent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_record_id UUID NOT NULL REFERENCES public.canonical_knowledge_records(id),
  dissenting_claim TEXT NOT NULL,
  supporting_evidence JSONB DEFAULT '[]',
  submitted_by UUID,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'academic', 'restricted')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'incorporated', 'rejected_with_reason')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge Interpretability Layers
CREATE TABLE public.knowledge_context_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_record_id UUID NOT NULL REFERENCES public.canonical_knowledge_records(id),
  layer_type TEXT NOT NULL CHECK (layer_type IN ('historical_context', 'methodological_assumptions', 'known_limitations', 'competing_interpretations', 'confidence_evolution')),
  content TEXT NOT NULL,
  authored_by UUID,
  version_applicable TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- HUMAN-AI CO-EXISTENCE & DECISION GOVERNANCE
-- =============================================

-- Decision Classification System
CREATE TABLE public.decision_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL CHECK (domain IN ('science', 'policy', 'ethics', 'education', 'governance', 'finance', 'research')),
  impact_level TEXT NOT NULL CHECK (impact_level IN ('individual', 'local', 'institutional', 'national', 'civilizational')),
  ai_allowed_role TEXT NOT NULL CHECK (ai_allowed_role IN ('advisory', 'simulation', 'recommendation', 'prohibited')),
  human_override_required BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  examples JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Advisory Records (full traceability)
CREATE TABLE public.ai_advisory_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_context TEXT NOT NULL,
  decision_class_id UUID REFERENCES public.decision_classes(id),
  ai_model_id UUID,
  recommendation_summary TEXT NOT NULL,
  full_reasoning JSONB,
  uncertainty_level TEXT NOT NULL CHECK (uncertainty_level IN ('low', 'medium', 'high', 'very_high', 'unknown')),
  human_decision TEXT,
  divergence_reason TEXT,
  was_followed BOOLEAN,
  decided_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Civilizational Principles (immutable anchors)
CREATE TABLE public.civilizational_principles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  principle_name TEXT NOT NULL,
  description TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('global', 'regional', 'disciplinary', 'institutional')),
  change_requirements JSONB NOT NULL DEFAULT '{"supermajority": 0.75, "cooling_period_days": 90, "public_comment_required": true}',
  is_active BOOLEAN DEFAULT true,
  ratified_at TIMESTAMPTZ,
  ratified_by JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Intergenerational Safeguards
CREATE TABLE public.intergenerational_safeguards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID,
  safeguard_type TEXT NOT NULL CHECK (safeguard_type IN ('time_lock', 'mandatory_review', 'youth_representation', 'impact_simulation')),
  parameters JSONB NOT NULL,
  next_review_at TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SYSTEM CLOSURE & SELF-LIMITS
-- =============================================

-- System Scope Limits
CREATE TABLE public.system_scope_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  explicitly_allowed JSONB NOT NULL DEFAULT '[]',
  explicitly_prohibited JSONB NOT NULL DEFAULT '[]',
  rationale TEXT NOT NULL,
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  next_review_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sunset Policies
CREATE TABLE public.sunset_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL,
  review_interval_years INTEGER NOT NULL DEFAULT 5,
  renewal_requirements JSONB NOT NULL DEFAULT '{"stakeholder_vote": true, "usage_threshold": 100}',
  auto_suspend_on_failure BOOLEAN DEFAULT false,
  last_renewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'under_review', 'suspended', 'deprecated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stewardship Transfers
CREATE TABLE public.stewardship_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_body UUID,
  to_body UUID,
  scope TEXT NOT NULL,
  transition_plan JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'in_progress', 'completed', 'rejected')),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shutdown Modes Registry
CREATE TABLE public.shutdown_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode_name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  preservation_level TEXT NOT NULL CHECK (preservation_level IN ('full', 'read_only', 'archive_only', 'metadata_only')),
  federation_participation BOOLEAN DEFAULT false,
  data_export_enabled BOOLEAN DEFAULT true,
  steps JSONB NOT NULL DEFAULT '[]',
  estimated_duration_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge Escape Hatches (export registry)
CREATE TABLE public.knowledge_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type TEXT NOT NULL CHECK (export_type IN ('full', 'canonical_only', 'user_data', 'institutional', 'federated')),
  format TEXT NOT NULL CHECK (format IN ('json', 'xml', 'rdf', 'csv', 'academic_standard')),
  requested_by UUID,
  scope JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- LINKEDIN-KILLER: OUTCOME-BASED FEED
-- =============================================

-- Activity Feed (outcome-focused, not social)
CREATE TABLE public.outcome_feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('project_posted', 'project_completed', 'grant_opportunity', 'collaboration_request', 'publication', 'dataset_released', 'institution_announcement', 'verification_earned', 'milestone_completed')),
  actor_id UUID,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'organization', 'institution', 'system')),
  target_id UUID,
  target_type TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  proof_reference JSONB,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'network', 'institutional', 'private')),
  relevance_tags TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  engagement_disabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Work Graph Connections (not social)
CREATE TABLE public.work_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connected_user_id UUID NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('worked_with', 'reviewed_by', 'funded_by', 'mentored_by', 'institutionally_verified', 'collaborated_with', 'supervised_by')),
  project_reference UUID,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, connected_user_id, connection_type)
);

-- Proof-Based Profile Metrics (computed from activity)
CREATE TABLE public.profile_proof_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  projects_completed INTEGER DEFAULT 0,
  escrow_success_rate NUMERIC(5,2) DEFAULT 0,
  grants_won INTEGER DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  earnings_visibility TEXT DEFAULT 'private' CHECK (earnings_visibility IN ('public', 'connections', 'private')),
  peer_reviews_received INTEGER DEFAULT 0,
  institutions_worked_with TEXT[] DEFAULT '{}',
  verification_count INTEGER DEFAULT 0,
  dispute_loss_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Institutional Capability Profiles
CREATE TABLE public.institutional_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  capability_type TEXT NOT NULL CHECK (capability_type IN ('can_post_projects', 'can_verify_users', 'can_track_outcomes', 'can_generate_reports', 'can_manage_grants')),
  enabled BOOLEAN DEFAULT true,
  limits JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canonical_knowledge_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_governance_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_dissent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_context_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_advisory_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civilizational_principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intergenerational_safeguards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_scope_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sunset_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shutdown_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcome_feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_proof_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Public can view canonical knowledge" ON public.canonical_knowledge_records FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view knowledge versions" ON public.knowledge_versions FOR SELECT USING (true);
CREATE POLICY "Public can view governance bodies" ON public.knowledge_governance_bodies FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view public dissent" ON public.knowledge_dissent_records FOR SELECT USING (visibility = 'public');
CREATE POLICY "Public can view context layers" ON public.knowledge_context_layers FOR SELECT USING (true);
CREATE POLICY "Public can view decision classes" ON public.decision_classes FOR SELECT USING (true);
CREATE POLICY "Users can view own advisory records" ON public.ai_advisory_records FOR SELECT USING (auth.uid() = decided_by);
CREATE POLICY "Public can view principles" ON public.civilizational_principles FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view safeguards" ON public.intergenerational_safeguards FOR SELECT USING (true);
CREATE POLICY "Public can view scope limits" ON public.system_scope_limits FOR SELECT USING (true);
CREATE POLICY "Public can view sunset policies" ON public.sunset_policies FOR SELECT USING (true);
CREATE POLICY "Public can view shutdown modes" ON public.shutdown_modes FOR SELECT USING (true);
CREATE POLICY "Users can view own exports" ON public.knowledge_export_jobs FOR SELECT USING (auth.uid() = requested_by);
CREATE POLICY "Public can view public feed items" ON public.outcome_feed_items FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can view own connections" ON public.work_connections FOR SELECT USING (auth.uid() = user_id OR auth.uid() = connected_user_id);
CREATE POLICY "Users can view own metrics" ON public.profile_proof_metrics FOR SELECT USING (auth.uid() = user_id OR earnings_visibility = 'public');
CREATE POLICY "Public can view institutional capabilities" ON public.institutional_capabilities FOR SELECT USING (enabled = true);

-- Insert default shutdown modes
INSERT INTO public.shutdown_modes (mode_name, description, preservation_level, federation_participation, data_export_enabled, steps) VALUES
('read_only_preservation', 'Platform enters read-only mode, all data preserved and accessible', 'read_only', true, true, '[{"step": 1, "action": "Disable new registrations"}, {"step": 2, "action": "Disable write operations"}, {"step": 3, "action": "Enable archive mode"}]'),
('federation_only', 'Platform participates in federation only, no direct user access', 'metadata_only', true, false, '[{"step": 1, "action": "Migrate users to partner instances"}, {"step": 2, "action": "Enable federation proxy"}, {"step": 3, "action": "Disable direct access"}]'),
('archive_export', 'Full knowledge export to open standards, then decommission', 'archive_only', false, true, '[{"step": 1, "action": "Generate full export"}, {"step": 2, "action": "Distribute to mirrors"}, {"step": 3, "action": "Verify checksums"}, {"step": 4, "action": "Decommission"}]'),
('graceful_decommission', 'Complete shutdown with full data portability', 'full', false, true, '[{"step": 1, "action": "90-day notice"}, {"step": 2, "action": "User data export"}, {"step": 3, "action": "Institutional handoff"}, {"step": 4, "action": "Archive creation"}, {"step": 5, "action": "Final shutdown"}]');

-- Insert default decision classes
INSERT INTO public.decision_classes (domain, impact_level, ai_allowed_role, human_override_required, description) VALUES
('science', 'individual', 'recommendation', true, 'Personal research decisions'),
('science', 'institutional', 'advisory', true, 'Institutional research policy'),
('science', 'civilizational', 'simulation', true, 'Global research direction'),
('policy', 'institutional', 'advisory', true, 'Organizational policy decisions'),
('policy', 'civilizational', 'prohibited', true, 'Civilizational policy - AI prohibited'),
('ethics', 'individual', 'advisory', true, 'Personal ethical decisions'),
('ethics', 'civilizational', 'prohibited', true, 'Civilizational ethics - AI prohibited'),
('governance', 'institutional', 'simulation', true, 'Governance modeling allowed'),
('governance', 'civilizational', 'prohibited', true, 'Global governance - human only'),
('finance', 'individual', 'recommendation', true, 'Personal financial decisions'),
('finance', 'institutional', 'advisory', true, 'Institutional finance');

-- Insert foundational civilizational principles
INSERT INTO public.civilizational_principles (principle_name, description, scope, is_active, ratified_at) VALUES
('Human Agency Primacy', 'All critical decisions affecting human welfare must ultimately be made by humans, not delegated to AI systems', 'global', true, now()),
('Knowledge Preservation', 'Verified knowledge must be preserved and accessible across generations, never silently erased', 'global', true, now()),
('Dissent Preservation', 'Minority scientific views and dissenting opinions must be preserved alongside canonical knowledge', 'global', true, now()),
('Reversibility Requirement', 'Irreversible decisions require higher scrutiny and explicit human ratification', 'global', true, now()),
('Transparency Mandate', 'All governance decisions, AI recommendations, and value changes must be traceable and explainable', 'global', true, now());

-- Function to compute proof-based metrics
CREATE OR REPLACE FUNCTION compute_profile_proof_metrics(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_projects_completed INTEGER;
  v_escrow_success NUMERIC;
  v_grants INTEGER;
  v_earnings NUMERIC;
  v_reviews INTEGER;
  v_institutions TEXT[];
  v_verifications INTEGER;
  v_disputes INTEGER;
BEGIN
  -- Count completed projects
  SELECT COUNT(*) INTO v_projects_completed
  FROM projects
  WHERE created_by = p_user_id AND status = 'completed';
  
  -- Calculate escrow success rate
  SELECT COALESCE(
    (COUNT(*) FILTER (WHERE status = 'released') * 100.0 / NULLIF(COUNT(*), 0)),
    0
  ) INTO v_escrow_success
  FROM escrow_transactions
  WHERE provider_id = p_user_id OR client_id = p_user_id;
  
  -- Count grants
  SELECT COUNT(*) INTO v_grants
  FROM user_grants
  WHERE user_id = p_user_id AND status = 'awarded';
  
  -- Sum earnings
  SELECT COALESCE(SUM(amount), 0) INTO v_earnings
  FROM wallet_transactions
  WHERE user_id = p_user_id AND transaction_type = 'credit';
  
  -- Count peer reviews
  SELECT COUNT(*) INTO v_reviews
  FROM peer_reviews
  WHERE reviewed_user_id = p_user_id;
  
  -- Get institutions
  SELECT ARRAY_AGG(DISTINCT o.name) INTO v_institutions
  FROM organization_members om
  JOIN organizations o ON o.id = om.organization_id
  WHERE om.user_id = p_user_id;
  
  -- Count verifications
  SELECT COUNT(*) INTO v_verifications
  FROM verification_submissions
  WHERE user_id = p_user_id AND status = 'approved';
  
  -- Count dispute losses
  SELECT COUNT(*) INTO v_disputes
  FROM disputes
  WHERE (initiator_id = p_user_id OR respondent_id = p_user_id)
    AND status = 'resolved'
    AND resolution_outcome = 'against_' || p_user_id::text;
  
  -- Upsert metrics
  INSERT INTO profile_proof_metrics (
    user_id, projects_completed, escrow_success_rate, grants_won,
    total_earnings, peer_reviews_received, institutions_worked_with,
    verification_count, dispute_loss_count, last_activity_at, computed_at
  ) VALUES (
    p_user_id, COALESCE(v_projects_completed, 0), COALESCE(v_escrow_success, 0),
    COALESCE(v_grants, 0), COALESCE(v_earnings, 0), COALESCE(v_reviews, 0),
    COALESCE(v_institutions, '{}'), COALESCE(v_verifications, 0),
    COALESCE(v_disputes, 0), now(), now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    projects_completed = EXCLUDED.projects_completed,
    escrow_success_rate = EXCLUDED.escrow_success_rate,
    grants_won = EXCLUDED.grants_won,
    total_earnings = EXCLUDED.total_earnings,
    peer_reviews_received = EXCLUDED.peer_reviews_received,
    institutions_worked_with = EXCLUDED.institutions_worked_with,
    verification_count = EXCLUDED.verification_count,
    dispute_loss_count = EXCLUDED.dispute_loss_count,
    last_activity_at = now(),
    computed_at = now();
END;
$$;
