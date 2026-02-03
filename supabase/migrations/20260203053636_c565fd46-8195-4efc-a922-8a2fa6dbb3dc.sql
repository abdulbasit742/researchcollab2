-- Phase 6: Civilizational Infrastructure & Exit-Proof Architecture
-- 20-year vision implementation

-- ============================================
-- 1. GOVERNANCE & IMMORTALITY MODEL
-- ============================================

-- Platform constitutional documents
CREATE TABLE public.platform_charters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charter_type TEXT NOT NULL, -- 'platform', 'user_rights', 'data_ethics', 'ai_governance'
  title TEXT NOT NULL,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  rationale TEXT,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  supersedes_id UUID REFERENCES public.platform_charters(id),
  ratified_by UUID[], -- Array of council member IDs who ratified
  ratification_threshold INTEGER DEFAULT 66, -- Percentage needed
  is_active BOOLEAN DEFAULT true,
  amendment_process TEXT, -- How this can be changed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Governance councils (operational, oversight, advisory)
CREATE TABLE public.governance_councils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  council_type TEXT NOT NULL, -- 'operational', 'oversight', 'advisory', 'ethics', 'emergency'
  name TEXT NOT NULL,
  description TEXT,
  authority_scope JSONB DEFAULT '{}', -- What powers this council has
  quorum_requirement INTEGER DEFAULT 50, -- Percentage for valid decisions
  term_length_months INTEGER,
  max_members INTEGER,
  min_members INTEGER DEFAULT 3,
  reporting_to_id UUID REFERENCES public.governance_councils(id),
  can_be_dissolved BOOLEAN DEFAULT false, -- Some councils are permanent
  dissolution_requires TEXT, -- What's needed to dissolve
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Council membership with succession tracking
CREATE TABLE public.council_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  council_id UUID NOT NULL REFERENCES public.governance_councils(id) ON DELETE CASCADE,
  user_id UUID, -- Can be NULL for external members
  external_member_name TEXT,
  external_member_org TEXT,
  role_in_council TEXT NOT NULL, -- 'chair', 'vice_chair', 'member', 'observer'
  voting_power INTEGER DEFAULT 1,
  appointed_by UUID REFERENCES public.council_memberships(id),
  appointment_reason TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  succession_priority INTEGER, -- Order for emergency succession
  is_active BOOLEAN DEFAULT true,
  recusal_topics TEXT[], -- Topics they must recuse from
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Council decisions with full audit trail
CREATE TABLE public.council_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  council_id UUID NOT NULL REFERENCES public.governance_councils(id),
  decision_type TEXT NOT NULL, -- 'policy', 'appointment', 'removal', 'charter_amendment', 'emergency'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT,
  affected_systems TEXT[],
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  quorum_met BOOLEAN,
  decision_outcome TEXT, -- 'approved', 'rejected', 'deferred', 'pending'
  implementation_deadline TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,
  challenged BOOLEAN DEFAULT false,
  challenge_reason TEXT,
  challenge_resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual votes on decisions (immutable record)
CREATE TABLE public.council_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.council_decisions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.council_memberships(id),
  vote TEXT NOT NULL, -- 'for', 'against', 'abstain', 'recused'
  reasoning TEXT,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  vote_hash TEXT, -- Cryptographic proof of vote integrity
  UNIQUE(decision_id, member_id)
);

-- Emergency powers framework
CREATE TABLE public.emergency_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_name TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL, -- What activates this
  severity_level INTEGER NOT NULL, -- 1-5
  powers_granted JSONB NOT NULL, -- What can be done
  time_limit_hours INTEGER, -- How long powers last
  requires_council TEXT[], -- Which councils must approve
  automatic_review_after_hours INTEGER,
  deactivation_conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emergency activations history
CREATE TABLE public.emergency_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID NOT NULL REFERENCES public.emergency_protocols(id),
  activated_by UUID NOT NULL,
  activation_reason TEXT NOT NULL,
  evidence JSONB,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at TIMESTAMPTZ,
  deactivated_by UUID,
  deactivation_reason TEXT,
  actions_taken JSONB DEFAULT '[]',
  reviewed_by_council UUID REFERENCES public.governance_councils(id),
  review_outcome TEXT,
  review_notes TEXT
);

-- ============================================
-- 2. TECHNOLOGY EVOLUTION & FUTURE-PROOFING
-- ============================================

-- Service abstraction registry
CREATE TABLE public.service_abstractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_category TEXT NOT NULL, -- 'database', 'auth', 'payments', 'ai', 'storage', 'email'
  current_provider TEXT NOT NULL,
  abstraction_interface TEXT NOT NULL, -- Interface definition
  migration_complexity TEXT, -- 'low', 'medium', 'high', 'critical'
  alternative_providers JSONB DEFAULT '[]',
  last_provider_evaluation TIMESTAMPTZ,
  vendor_lock_in_risk TEXT, -- 'low', 'medium', 'high'
  deprecation_timeline TIMESTAMPTZ,
  migration_plan_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Long-term compatibility guarantees
CREATE TABLE public.compatibility_guarantees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guarantee_type TEXT NOT NULL, -- 'api', 'data_format', 'export', 'integration'
  description TEXT NOT NULL,
  version TEXT NOT NULL,
  guaranteed_until TIMESTAMPTZ NOT NULL,
  affected_users_estimate INTEGER,
  breaking_change_policy TEXT,
  migration_support_commitment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data format evolution tracking
CREATE TABLE public.data_format_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  format_name TEXT NOT NULL, -- 'academic_record', 'credential', 'project'
  version TEXT NOT NULL,
  schema_definition JSONB NOT NULL,
  backward_compatible_with TEXT[], -- Previous versions
  migration_scripts JSONB, -- How to convert from old versions
  sunset_date TIMESTAMPTZ,
  replacement_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. AI CONSTITUTIONAL CONSTRAINTS
-- ============================================

-- AI constitutional rules (immutable principles)
CREATE TABLE public.ai_constitutional_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_category TEXT NOT NULL, -- 'autonomy_limit', 'human_override', 'transparency', 'fairness'
  rule_name TEXT NOT NULL,
  rule_definition TEXT NOT NULL,
  rationale TEXT NOT NULL,
  enforcement_mechanism TEXT NOT NULL,
  violation_consequences TEXT NOT NULL,
  can_be_suspended BOOLEAN DEFAULT false,
  suspension_requires TEXT, -- What authority needed
  created_by_charter UUID REFERENCES public.platform_charters(id),
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Human override registry
CREATE TABLE public.ai_human_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_capability TEXT NOT NULL,
  ai_decision_id TEXT, -- Reference to the AI decision
  ai_recommendation JSONB NOT NULL,
  human_decision JSONB NOT NULL,
  override_reason TEXT NOT NULL,
  overridden_by UUID NOT NULL,
  override_authority TEXT NOT NULL, -- 'user', 'admin', 'council'
  outcome_after_override TEXT,
  was_ai_correct BOOLEAN, -- Retrospective assessment
  learning_incorporated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI model registry with capability tracking
CREATE TABLE public.ai_model_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_identifier TEXT NOT NULL,
  provider TEXT NOT NULL,
  capabilities TEXT[] NOT NULL,
  limitations TEXT[],
  bias_assessment JSONB,
  safety_rating TEXT, -- 'approved', 'conditional', 'restricted', 'banned'
  approval_council UUID REFERENCES public.governance_councils(id),
  approved_at TIMESTAMPTZ,
  usage_restrictions JSONB,
  sunset_date TIMESTAMPTZ,
  replacement_model_id UUID REFERENCES public.ai_model_registry(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 4. KNOWLEDGE PRESERVATION & HISTORICAL MEMORY
-- ============================================

-- Research lineage (academic ancestry)
CREATE TABLE public.research_lineage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id UUID NOT NULL,
  mentor_id UUID,
  relationship_type TEXT NOT NULL, -- 'supervisor', 'collaborator', 'advisor', 'reviewer'
  institution_id UUID REFERENCES public.organizations(id),
  field_of_study TEXT,
  started_at DATE,
  ended_at DATE,
  contributions TEXT, -- What the mentor contributed
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idea evolution tracking
CREATE TABLE public.idea_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_identifier TEXT NOT NULL, -- Unique concept ID
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  field TEXT NOT NULL,
  originated_from UUID REFERENCES public.idea_evolution(id),
  evolution_type TEXT, -- 'refinement', 'contradiction', 'synthesis', 'application'
  contributors UUID[],
  related_projects UUID[],
  evidence_links TEXT[],
  impact_assessment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge time capsules
CREATE TABLE public.knowledge_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_type TEXT NOT NULL, -- 'annual', 'milestone', 'crisis', 'transition'
  snapshot_date DATE NOT NULL,
  description TEXT NOT NULL,
  data_scope TEXT[], -- What's included
  storage_location TEXT NOT NULL,
  verification_hash TEXT NOT NULL,
  format_version TEXT NOT NULL,
  accessible_until TIMESTAMPTZ,
  access_restrictions JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Negative results archive (failed research is valuable)
CREATE TABLE public.negative_results_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  researcher_id UUID NOT NULL,
  hypothesis TEXT NOT NULL,
  methodology TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  actual_outcome TEXT NOT NULL,
  why_it_failed TEXT NOT NULL,
  lessons_learned TEXT,
  field TEXT NOT NULL,
  replication_attempts INTEGER DEFAULT 0,
  future_implications TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 5. CULTURAL & GLOBAL ADAPTABILITY
-- ============================================

-- Cultural academic frameworks
CREATE TABLE public.academic_traditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tradition_name TEXT NOT NULL,
  regions TEXT[] NOT NULL,
  description TEXT NOT NULL,
  core_values JSONB NOT NULL,
  collaboration_norms JSONB,
  hierarchy_expectations JSONB,
  publication_preferences JSONB,
  peer_review_customs JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Regional governance autonomy
CREATE TABLE public.regional_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code TEXT NOT NULL,
  region_name TEXT NOT NULL,
  governance_council_id UUID REFERENCES public.governance_councils(id),
  local_policies JSONB DEFAULT '{}',
  language_requirements TEXT[],
  cultural_adaptations JSONB,
  regulatory_compliance JSONB,
  autonomy_level TEXT NOT NULL, -- 'full', 'partial', 'advisory'
  reports_to_global BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 6. CIVILIZATION-LEVEL FAILURE RESILIENCE
-- ============================================

-- Distributed data custody nodes
CREATE TABLE public.data_custody_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_name TEXT NOT NULL,
  node_type TEXT NOT NULL, -- 'primary', 'backup', 'archive', 'escrow', 'offline'
  geographic_location TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  operator_organization TEXT,
  data_categories TEXT[] NOT NULL, -- What data is stored
  sync_frequency TEXT,
  last_sync_at TIMESTAMPTZ,
  encryption_standard TEXT NOT NULL,
  access_protocol TEXT NOT NULL,
  offline_capable BOOLEAN DEFAULT false,
  sovereignty_compliant BOOLEAN DEFAULT true,
  continuity_priority INTEGER, -- Order for recovery
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Continuity checkpoints
CREATE TABLE public.continuity_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'crisis'
  checkpoint_date TIMESTAMPTZ NOT NULL,
  systems_included TEXT[] NOT NULL,
  verification_status TEXT NOT NULL, -- 'verified', 'pending', 'failed'
  recovery_tested BOOLEAN DEFAULT false,
  recovery_test_date TIMESTAMPTZ,
  recovery_time_objective TEXT, -- Target recovery time
  storage_nodes UUID[], -- Where this checkpoint exists
  integrity_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 7. POST-CAPITALIST ECONOMIC RESILIENCE
-- ============================================

-- Funding models and sustainability
CREATE TABLE public.funding_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'commercial', 'nonprofit', 'hybrid', 'endowment', 'public'
  description TEXT NOT NULL,
  revenue_sources JSONB NOT NULL,
  cost_structure JSONB,
  sustainability_metrics JSONB,
  transition_requirements TEXT, -- What's needed to switch to this model
  is_active BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Endowment tracking
CREATE TABLE public.endowment_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  target_amount NUMERIC,
  current_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  custodian TEXT NOT NULL,
  investment_policy TEXT,
  spending_rule TEXT, -- How much can be spent annually
  restricted_uses TEXT[],
  donor_visibility TEXT, -- 'public', 'private', 'anonymous'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 8. ETHICS, LEGITIMACY & MORAL AUTHORITY
-- ============================================

-- Independent ethics reviews
CREATE TABLE public.ethics_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_type TEXT NOT NULL, -- 'system', 'algorithm', 'policy', 'incident', 'periodic'
  subject TEXT NOT NULL,
  reviewer_type TEXT NOT NULL, -- 'internal', 'external', 'council', 'independent'
  reviewer_name TEXT,
  reviewer_organization TEXT,
  review_scope TEXT NOT NULL,
  findings TEXT NOT NULL,
  recommendations TEXT[],
  severity TEXT, -- 'critical', 'major', 'minor', 'observation'
  management_response TEXT,
  remediation_deadline TIMESTAMPTZ,
  remediated_at TIMESTAMPTZ,
  public_summary TEXT, -- What can be shared publicly
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public accountability reports
CREATE TABLE public.accountability_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  report_type TEXT NOT NULL, -- 'annual', 'quarterly', 'incident', 'special'
  title TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  full_report_url TEXT,
  key_metrics JSONB NOT NULL,
  governance_changes JSONB,
  incident_summary JSONB,
  financial_summary JSONB,
  published_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community challenge mechanism
CREATE TABLE public.community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID,
  challenger_type TEXT NOT NULL, -- 'user', 'institution', 'council', 'external'
  challenge_type TEXT NOT NULL, -- 'policy', 'decision', 'system', 'ethics', 'governance'
  target_entity_type TEXT NOT NULL,
  target_entity_id UUID,
  challenge_title TEXT NOT NULL,
  challenge_description TEXT NOT NULL,
  supporting_evidence TEXT,
  urgency TEXT, -- 'routine', 'urgent', 'critical'
  status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'under_review', 'resolved', 'rejected', 'escalated'
  assigned_council UUID REFERENCES public.governance_councils(id),
  resolution TEXT,
  resolution_date TIMESTAMPTZ,
  appeal_available BOOLEAN DEFAULT true,
  appealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_platform_charters_type_active ON public.platform_charters(charter_type, is_active);
CREATE INDEX idx_council_memberships_council ON public.council_memberships(council_id, is_active);
CREATE INDEX idx_council_decisions_council_outcome ON public.council_decisions(council_id, decision_outcome);
CREATE INDEX idx_emergency_activations_active ON public.emergency_activations(protocol_id) WHERE deactivated_at IS NULL;
CREATE INDEX idx_ai_human_overrides_capability ON public.ai_human_overrides(ai_capability, created_at DESC);
CREATE INDEX idx_research_lineage_researcher ON public.research_lineage(researcher_id);
CREATE INDEX idx_research_lineage_mentor ON public.research_lineage(mentor_id);
CREATE INDEX idx_idea_evolution_field ON public.idea_evolution(field);
CREATE INDEX idx_knowledge_snapshots_date ON public.knowledge_snapshots(snapshot_date DESC);
CREATE INDEX idx_negative_results_field ON public.negative_results_archive(field, is_public);
CREATE INDEX idx_data_custody_nodes_type ON public.data_custody_nodes(node_type);
CREATE INDEX idx_ethics_reviews_type ON public.ethics_reviews(review_type, created_at DESC);
CREATE INDEX idx_community_challenges_status ON public.community_challenges(status, urgency);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.platform_charters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_councils ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.council_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.council_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.council_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_abstractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_guarantees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_format_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_constitutional_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_human_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negative_results_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_traditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_governance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_custody_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continuity_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endowment_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ethics_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accountability_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;

-- Public read access for charters (transparency)
CREATE POLICY "Platform charters are publicly readable"
ON public.platform_charters FOR SELECT
TO authenticated
USING (is_active = true);

-- Admin management for governance
CREATE POLICY "Admins can manage platform charters"
ON public.platform_charters FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Governance councils publicly readable"
ON public.governance_councils FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage governance councils"
ON public.governance_councils FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Council memberships publicly readable"
ON public.council_memberships FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage council memberships"
ON public.council_memberships FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Council decisions publicly readable"
ON public.council_decisions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage council decisions"
ON public.council_decisions FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Council votes - members can vote, public can read
CREATE POLICY "Council votes publicly readable"
ON public.council_votes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Council members can vote"
ON public.council_votes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.council_memberships
    WHERE id = member_id AND user_id = auth.uid() AND is_active = true
  )
);

-- Emergency protocols - admin only
CREATE POLICY "Admins view emergency protocols"
ON public.emergency_protocols FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage emergency protocols"
ON public.emergency_protocols FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view emergency activations"
ON public.emergency_activations FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage emergency activations"
ON public.emergency_activations FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Service abstractions - admin only
CREATE POLICY "Admins manage service abstractions"
ON public.service_abstractions FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage compatibility guarantees"
ON public.compatibility_guarantees FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage data format versions"
ON public.data_format_versions FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- AI governance - public read, admin manage
CREATE POLICY "AI constitutional rules publicly readable"
ON public.ai_constitutional_rules FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage AI constitutional rules"
ON public.ai_constitutional_rules FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users view AI human overrides"
ON public.ai_human_overrides FOR SELECT
TO authenticated
USING (overridden_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users create AI human overrides"
ON public.ai_human_overrides FOR INSERT
TO authenticated
WITH CHECK (overridden_by = auth.uid());

CREATE POLICY "AI model registry publicly readable"
ON public.ai_model_registry FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage AI model registry"
ON public.ai_model_registry FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Research lineage - public read, users manage own
CREATE POLICY "Research lineage publicly readable"
ON public.research_lineage FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users manage own research lineage"
ON public.research_lineage FOR INSERT
TO authenticated
WITH CHECK (researcher_id = auth.uid());

CREATE POLICY "Users update own research lineage"
ON public.research_lineage FOR UPDATE
TO authenticated
USING (researcher_id = auth.uid());

-- Idea evolution - public read, authenticated insert
CREATE POLICY "Idea evolution publicly readable"
ON public.idea_evolution FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can contribute ideas"
ON public.idea_evolution FOR INSERT
TO authenticated
WITH CHECK (true);

-- Knowledge snapshots - admin only
CREATE POLICY "Admins manage knowledge snapshots"
ON public.knowledge_snapshots FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Negative results - public read, researchers add own
CREATE POLICY "Public negative results readable"
ON public.negative_results_archive FOR SELECT
TO authenticated
USING (is_public = true OR researcher_id = auth.uid());

CREATE POLICY "Researchers add own negative results"
ON public.negative_results_archive FOR INSERT
TO authenticated
WITH CHECK (researcher_id = auth.uid());

-- Academic traditions - public read
CREATE POLICY "Academic traditions publicly readable"
ON public.academic_traditions FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins manage academic traditions"
ON public.academic_traditions FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Regional governance - public read
CREATE POLICY "Regional governance publicly readable"
ON public.regional_governance FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage regional governance"
ON public.regional_governance FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Data custody - admin only
CREATE POLICY "Admins manage data custody nodes"
ON public.data_custody_nodes FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage continuity checkpoints"
ON public.continuity_checkpoints FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Funding models - admin only
CREATE POLICY "Admins manage funding models"
ON public.funding_models FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage endowment funds"
ON public.endowment_funds FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Ethics reviews - public summaries, admin full access
CREATE POLICY "Public ethics review summaries"
ON public.ethics_reviews FOR SELECT
TO authenticated
USING (public_summary IS NOT NULL OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage ethics reviews"
ON public.ethics_reviews FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Accountability reports - public read
CREATE POLICY "Public accountability reports readable"
ON public.accountability_reports FOR SELECT
TO authenticated
USING (is_public = true AND published_at IS NOT NULL);

CREATE POLICY "Admins manage accountability reports"
ON public.accountability_reports FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Community challenges - users can submit, view own
CREATE POLICY "Users view own challenges"
ON public.community_challenges FOR SELECT
TO authenticated
USING (challenger_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users submit challenges"
ON public.community_challenges FOR INSERT
TO authenticated
WITH CHECK (challenger_id = auth.uid());

CREATE POLICY "Admins manage all challenges"
ON public.community_challenges FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));