
-- =====================================================
-- FEATURE 19: ARCHIVAL, PRESERVATION & SCHOLARLY LEGACY
-- =====================================================

-- Archival objects - canonical preservation units
CREATE TABLE public.archival_objects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('publication', 'dataset', 'research_timeline', 'knowledge_node', 'workspace_snapshot')),
  target_id UUID NOT NULL,
  archival_format TEXT NOT NULL CHECK (archival_format IN ('pdfa', 'xml', 'json', 'csv', 'markdown_bundle', 'bagit')),
  checksum TEXT NOT NULL,
  size_mb NUMERIC(12, 2),
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archival_status TEXT NOT NULL DEFAULT 'active' CHECK (archival_status IN ('active', 'migrated', 'deprecated')),
  storage_location TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Archival snapshots - point-in-time captures
CREATE TABLE public.archival_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  archival_object_id UUID NOT NULL REFERENCES public.archival_objects(id) ON DELETE CASCADE,
  snapshot_reason TEXT NOT NULL CHECK (snapshot_reason IN ('publication', 'funding_closeout', 'project_completion', 'periodic', 'manual', 'migration')),
  snapshot_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Format migration records - future-proofing
CREATE TABLE public.format_migration_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  archival_object_id UUID NOT NULL REFERENCES public.archival_objects(id) ON DELETE CASCADE,
  from_format TEXT NOT NULL,
  to_format TEXT NOT NULL,
  migration_reason TEXT NOT NULL,
  migration_notes TEXT,
  migrated_by UUID REFERENCES auth.users(id),
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scholarly legacy profiles
CREATE TABLE public.scholarly_legacy_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id) ON DELETE CASCADE,
  legacy_visibility TEXT NOT NULL DEFAULT 'private' CHECK (legacy_visibility IN ('private', 'public', 'institutional')),
  designated_heirs UUID[] DEFAULT '{}',
  preservation_preferences JSONB DEFAULT '{}',
  legacy_statement TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(scholar_passport_id)
);

-- Preservation audit logs
CREATE TABLE public.preservation_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  archival_object_id UUID NOT NULL REFERENCES public.archival_objects(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('archived', 'verified', 'migrated', 'accessed', 'integrity_check', 'restored')),
  performed_by UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}',
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- FEATURE 20: PLATFORM INTEROPERABILITY & FEDERATION
-- =====================================================

-- API clients - controlled access
CREATE TABLE public.api_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_secret_hash TEXT NOT NULL,
  owner_entity_type TEXT NOT NULL CHECK (owner_entity_type IN ('user', 'organization', 'institution')),
  owner_entity_id UUID NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  rate_limit_per_hour INTEGER DEFAULT 1000,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Federated nodes - trusted external platforms
CREATE TABLE public.federated_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_name TEXT NOT NULL UNIQUE,
  node_type TEXT NOT NULL CHECK (node_type IN ('institutional_repo', 'national_portal', 'publisher', 'funder', 'research_network')),
  base_url TEXT NOT NULL,
  trust_level TEXT NOT NULL DEFAULT 'limited' CHECK (trust_level IN ('limited', 'trusted', 'verified')),
  federation_protocol TEXT NOT NULL DEFAULT 'rest',
  public_key TEXT,
  capabilities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'decommissioned')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMPTZ
);

-- Data exchange logs
CREATE TABLE public.data_exchange_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id UUID REFERENCES public.federated_nodes(id),
  target_node_id UUID REFERENCES public.federated_nodes(id),
  data_type TEXT NOT NULL CHECK (data_type IN ('publication', 'dataset', 'metadata', 'funding_record', 'identity', 'citation')),
  exchange_direction TEXT NOT NULL CHECK (exchange_direction IN ('inbound', 'outbound')),
  consent_reference UUID,
  record_count INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'rejected')),
  exchanged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Export packages - data portability
CREATE TABLE public.export_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  export_scope TEXT NOT NULL CHECK (export_scope IN ('profile', 'research', 'publications', 'datasets', 'full_account')),
  format TEXT NOT NULL CHECK (format IN ('json', 'xml', 'zip', 'bagit')),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'expired', 'failed')),
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Integration mappings - external system alignment
CREATE TABLE public.integration_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_system TEXT NOT NULL CHECK (external_system IN ('orcid', 'crossref', 'datacite', 'institutional_cris', 'pubmed', 'arxiv')),
  internal_entity_type TEXT NOT NULL,
  internal_entity_id UUID NOT NULL,
  external_identifier TEXT NOT NULL,
  mapping_metadata JSONB DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(external_system, internal_entity_type, internal_entity_id)
);

-- =====================================================
-- FEATURE 21: GOVERNANCE & PLATFORM DEMOCRACY (ADDITIONS)
-- =====================================================

-- Governance proposals (new)
CREATE TABLE public.governance_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposed_by UUID NOT NULL REFERENCES auth.users(id),
  sponsoring_council_id UUID REFERENCES public.governance_councils(id),
  proposal_type TEXT NOT NULL CHECK (proposal_type IN ('charter_amendment', 'policy_change', 'system_rule', 'council_creation', 'emergency_action')),
  title TEXT NOT NULL,
  proposal_text TEXT NOT NULL,
  rationale TEXT,
  affected_scope TEXT,
  required_majority NUMERIC(3, 2) DEFAULT 0.50,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'deliberation', 'voting', 'adopted', 'rejected', 'withdrawn')),
  voting_opens_at TIMESTAMPTZ,
  voting_closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ
);

-- Governance votes (new)
CREATE TABLE public.governance_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  governance_proposal_id UUID NOT NULL REFERENCES public.governance_proposals(id) ON DELETE CASCADE,
  voter_scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id),
  vote TEXT NOT NULL CHECK (vote IN ('yes', 'no', 'abstain')),
  vote_weight NUMERIC(5, 2) DEFAULT 1.0,
  reasoning TEXT,
  cast_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(governance_proposal_id, voter_scholar_passport_id)
);

-- =====================================================
-- FEATURE 22: ACCESSIBILITY, INCLUSION & GLOBAL EQUITY
-- =====================================================

-- Accessibility preferences
CREATE TABLE public.accessibility_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_contrast TEXT DEFAULT 'standard' CHECK (preferred_contrast IN ('standard', 'high', 'inverted')),
  text_scaling NUMERIC(3, 2) DEFAULT 1.0 CHECK (text_scaling BETWEEN 0.75 AND 2.0),
  reduced_motion BOOLEAN DEFAULT false,
  screen_reader_mode BOOLEAN DEFAULT false,
  keyboard_navigation_enhanced BOOLEAN DEFAULT false,
  audio_descriptions_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Connectivity profiles
CREATE TABLE public.connectivity_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  avg_bandwidth_kbps INTEGER,
  offline_mode_enabled BOOLEAN DEFAULT false,
  low_data_mode BOOLEAN DEFAULT false,
  preferred_media_quality TEXT DEFAULT 'auto' CHECK (preferred_media_quality IN ('auto', 'low', 'medium', 'high')),
  last_detected_at TIMESTAMPTZ DEFAULT now()
);

-- Language support profiles
CREATE TABLE public.language_support_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_language TEXT NOT NULL DEFAULT 'en',
  secondary_languages TEXT[] DEFAULT '{}',
  translation_assist_enabled BOOLEAN DEFAULT false,
  preferred_academic_language TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equity adjustment rules
CREATE TABLE public.equity_adjustment_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('funding_access', 'discovery_weighting', 'review_visibility', 'resource_allocation', 'deadline_extension')),
  target_group TEXT NOT NULL CHECK (target_group IN ('low_resource_institutions', 'early_career', 'underrepresented_regions', 'accessibility_needs', 'language_minority')),
  adjustment_logic JSONB NOT NULL,
  adjustment_bounds JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equity metrics snapshots
CREATE TABLE public.equity_metrics_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('platform', 'institution', 'region', 'domain')),
  scope_id TEXT,
  participation_distribution JSONB DEFAULT '{}',
  funding_access_stats JSONB DEFAULT '{}',
  review_visibility_stats JSONB DEFAULT '{}',
  inclusion_indicators JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- FEATURE 23: EDUCATION-RESEARCH BRIDGE & SUPERVISION
-- =====================================================

-- Academic courses (research-linked)
CREATE TABLE public.academic_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.organizations(id),
  course_code TEXT NOT NULL,
  course_title TEXT NOT NULL,
  course_type TEXT NOT NULL CHECK (course_type IN ('seminar', 'lab', 'capstone', 'thesis_support', 'research_methods', 'independent_study')),
  linked_research_domains TEXT[] DEFAULT '{}',
  description TEXT,
  instructor_id UUID REFERENCES auth.users(id),
  term TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supervision records
CREATE TABLE public.supervision_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supervisor_scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id),
  supervisee_scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id),
  supervision_type TEXT NOT NULL CHECK (supervision_type IN ('undergraduate_project', 'masters_thesis', 'phd', 'postdoc', 'research_assistant')),
  research_timeline_id UUID REFERENCES public.research_timelines(id),
  formal_agreement TEXT,
  start_date DATE NOT NULL,
  expected_end_date DATE,
  actual_end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated', 'on_hold')),
  termination_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student research links
CREATE TABLE public.student_research_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scholar_passport_id UUID NOT NULL REFERENCES public.scholar_passports(id),
  research_timeline_id UUID NOT NULL REFERENCES public.research_timelines(id),
  contribution_scope TEXT NOT NULL CHECK (contribution_scope IN ('data_collection', 'analysis', 'literature', 'implementation', 'writing', 'methodology')),
  hours_contributed INTEGER,
  credited BOOLEAN DEFAULT true,
  credit_visibility TEXT DEFAULT 'public' CHECK (credit_visibility IN ('public', 'collaborators', 'private')),
  supervisor_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(scholar_passport_id, research_timeline_id, contribution_scope)
);

-- Teaching research outputs
CREATE TABLE public.teaching_research_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.academic_courses(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL CHECK (output_type IN ('dataset', 'literature_review', 'prototype', 'pilot_study', 'analysis', 'report')),
  title TEXT NOT NULL,
  description TEXT,
  linked_research_timeline_id UUID REFERENCES public.research_timelines(id),
  student_contributors UUID[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- FEATURE 24: REAL-WORLD IMPACT & POLICY TRANSLATION
-- =====================================================

-- Impact pathways
CREATE TABLE public.impact_pathways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_timeline_id UUID NOT NULL REFERENCES public.research_timelines(id) ON DELETE CASCADE,
  impact_domain TEXT NOT NULL CHECK (impact_domain IN ('policy', 'healthcare', 'education', 'environment', 'industry', 'community', 'technology', 'social_justice')),
  intended_outcome TEXT NOT NULL,
  theory_of_change TEXT,
  status TEXT NOT NULL DEFAULT 'hypothesized' CHECK (status IN ('hypothesized', 'in_progress', 'observed', 'validated', 'refuted')),
  primary_contact_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Policy translation records
CREATE TABLE public.policy_translation_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  impact_pathway_id UUID NOT NULL REFERENCES public.impact_pathways(id) ON DELETE CASCADE,
  policy_area TEXT NOT NULL,
  translation_summary TEXT NOT NULL,
  evidence_strength TEXT NOT NULL CHECK (evidence_strength IN ('exploratory', 'moderate', 'strong', 'conclusive')),
  limitations TEXT,
  target_audience TEXT,
  plain_language_summary TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Impact adoptions
CREATE TABLE public.impact_adoptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  impact_pathway_id UUID NOT NULL REFERENCES public.impact_pathways(id) ON DELETE CASCADE,
  adopting_entity_type TEXT NOT NULL CHECK (adopting_entity_type IN ('government', 'ngo', 'industry', 'community', 'healthcare', 'education_system')),
  adopting_entity_name TEXT NOT NULL,
  adopting_entity_id UUID,
  adoption_description TEXT NOT NULL,
  adoption_date DATE NOT NULL,
  adoption_evidence_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'self_reported' CHECK (verification_status IN ('self_reported', 'externally_confirmed', 'disputed', 'verified')),
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Impact evaluations
CREATE TABLE public.impact_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  impact_pathway_id UUID NOT NULL REFERENCES public.impact_pathways(id) ON DELETE CASCADE,
  evaluation_method TEXT NOT NULL CHECK (evaluation_method IN ('qualitative', 'quantitative', 'mixed', 'case_study', 'systematic_review')),
  findings_summary TEXT NOT NULL,
  success_indicators JSONB DEFAULT '{}',
  unintended_effects TEXT,
  lessons_learned TEXT,
  data_sources TEXT[],
  evaluated_by UUID NOT NULL REFERENCES auth.users(id),
  external_evaluator TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Impact disclaimers
CREATE TABLE public.impact_disclaimers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  impact_pathway_id UUID NOT NULL REFERENCES public.impact_pathways(id) ON DELETE CASCADE,
  disclaimer_text TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'institutional', 'internal')),
  required_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- FEATURE 25: FORESIGHT & TREND PREDICTION ENGINE
-- =====================================================

-- Trend models
CREATE TABLE public.trend_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('emergence', 'saturation', 'collaboration_density', 'funding_efficiency', 'impact_velocity', 'interdisciplinary_flow')),
  model_scope TEXT NOT NULL CHECK (model_scope IN ('global', 'national', 'institutional', 'domain')),
  scope_id TEXT,
  parameters JSONB NOT NULL DEFAULT '{}',
  version_number INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trend outputs
CREATE TABLE public.trend_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_model_id UUID NOT NULL REFERENCES public.trend_models(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  signal_direction TEXT NOT NULL CHECK (signal_direction IN ('emerging', 'stable', 'declining', 'volatile', 'uncertain')),
  confidence_band TEXT NOT NULL CHECK (confidence_band IN ('low', 'medium', 'high')),
  signal_strength NUMERIC(5, 2),
  explanation TEXT NOT NULL,
  supporting_data JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foresight scenarios
CREATE TABLE public.foresight_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_name TEXT NOT NULL,
  scenario_scope TEXT NOT NULL CHECK (scenario_scope IN ('global', 'national', 'institutional', 'domain')),
  scope_id TEXT,
  assumptions JSONB NOT NULL,
  projected_outcomes JSONB NOT NULL,
  time_horizon_months INTEGER DEFAULT 24,
  probability_assessment TEXT,
  risk_factors TEXT[],
  opportunity_factors TEXT[],
  created_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics guardrails
CREATE TABLE public.analytics_guardrails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guardrail_type TEXT NOT NULL CHECK (guardrail_type IN ('bias_detection', 'misuse_prevention', 'overconfidence_flag', 'privacy_risk', 'determinism_warning')),
  trigger_condition JSONB NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT
);

-- Research trend alerts
CREATE TABLE public.research_trend_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_output_id UUID REFERENCES public.trend_outputs(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('emergence', 'decline', 'funding_gap', 'talent_mismatch', 'opportunity')),
  target_audience TEXT NOT NULL CHECK (target_audience IN ('institution', 'funder', 'governance', 'domain_leaders')),
  target_id UUID,
  alert_summary TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high')),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_archival_objects_target ON public.archival_objects(target_type, target_id);
CREATE INDEX idx_archival_objects_status ON public.archival_objects(archival_status);
CREATE INDEX idx_preservation_audit_logs_object ON public.preservation_audit_logs(archival_object_id);

CREATE INDEX idx_api_clients_owner ON public.api_clients(owner_entity_type, owner_entity_id);
CREATE INDEX idx_federated_nodes_type ON public.federated_nodes(node_type);
CREATE INDEX idx_data_exchange_logs_date ON public.data_exchange_logs(exchanged_at);
CREATE INDEX idx_export_packages_user ON public.export_packages(requested_by);

CREATE INDEX idx_governance_proposals_status ON public.governance_proposals(status);
CREATE INDEX idx_governance_votes_proposal ON public.governance_votes(governance_proposal_id);

CREATE INDEX idx_supervision_records_supervisor ON public.supervision_records(supervisor_scholar_passport_id);
CREATE INDEX idx_supervision_records_supervisee ON public.supervision_records(supervisee_scholar_passport_id);
CREATE INDEX idx_student_research_links_student ON public.student_research_links(scholar_passport_id);
CREATE INDEX idx_academic_courses_institution ON public.academic_courses(institution_id);

CREATE INDEX idx_impact_pathways_research ON public.impact_pathways(research_timeline_id);
CREATE INDEX idx_impact_pathways_domain ON public.impact_pathways(impact_domain);
CREATE INDEX idx_impact_adoptions_pathway ON public.impact_adoptions(impact_pathway_id);

CREATE INDEX idx_trend_models_type ON public.trend_models(model_type, model_scope);
CREATE INDEX idx_trend_outputs_model ON public.trend_outputs(trend_model_id);
CREATE INDEX idx_foresight_scenarios_scope ON public.foresight_scenarios(scenario_scope);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.archival_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archival_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.format_migration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarly_legacy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preservation_audit_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.api_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.federated_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exchange_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_mappings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_votes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.accessibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connectivity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_support_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_adjustment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_metrics_snapshots ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.academic_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervision_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_research_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_research_outputs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.impact_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_translation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_disclaimers ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.trend_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foresight_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_guardrails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_trend_alerts ENABLE ROW LEVEL SECURITY;

-- Archival policies (read-only for authenticated, admin-managed)
CREATE POLICY "Authenticated can view archived objects" ON public.archival_objects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view snapshots" ON public.archival_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view migrations" ON public.format_migration_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own legacy profile" ON public.scholarly_legacy_profiles FOR ALL TO authenticated USING (scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated can view audit logs" ON public.preservation_audit_logs FOR SELECT TO authenticated USING (true);

-- API & Federation policies
CREATE POLICY "Owners can manage API clients" ON public.api_clients FOR ALL TO authenticated USING (owner_entity_id = auth.uid() OR owner_entity_type = 'organization');
CREATE POLICY "Authenticated can view federated nodes" ON public.federated_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view exchange logs" ON public.data_exchange_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own exports" ON public.export_packages FOR ALL TO authenticated USING (requested_by = auth.uid());
CREATE POLICY "Authenticated can view integration mappings" ON public.integration_mappings FOR SELECT TO authenticated USING (true);

-- Governance policies
CREATE POLICY "Authenticated can view proposals" ON public.governance_proposals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create proposals" ON public.governance_proposals FOR INSERT TO authenticated WITH CHECK (proposed_by = auth.uid());
CREATE POLICY "Users can manage own proposals" ON public.governance_proposals FOR UPDATE TO authenticated USING (proposed_by = auth.uid());
CREATE POLICY "Verified scholars can vote" ON public.governance_votes FOR INSERT TO authenticated WITH CHECK (voter_scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid()));
CREATE POLICY "Users can view all votes" ON public.governance_votes FOR SELECT TO authenticated USING (true);

-- Accessibility policies
CREATE POLICY "Users manage own accessibility" ON public.accessibility_preferences FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users manage own connectivity" ON public.connectivity_profiles FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users manage own language" ON public.language_support_profiles FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated can view equity rules" ON public.equity_adjustment_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view equity metrics" ON public.equity_metrics_snapshots FOR SELECT TO authenticated USING (true);

-- Education-Research policies
CREATE POLICY "Authenticated can view courses" ON public.academic_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Instructors can manage courses" ON public.academic_courses FOR ALL TO authenticated USING (instructor_id = auth.uid());
CREATE POLICY "Participants view supervision" ON public.supervision_records FOR SELECT TO authenticated USING (supervisor_scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid()) OR supervisee_scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid()));
CREATE POLICY "Supervisors create supervision" ON public.supervision_records FOR INSERT TO authenticated WITH CHECK (supervisor_scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid()));
CREATE POLICY "Students view own research links" ON public.student_research_links FOR SELECT TO authenticated USING (scholar_passport_id IN (SELECT id FROM public.scholar_passports WHERE user_id = auth.uid()) OR credited = true);
CREATE POLICY "Authenticated can view teaching outputs" ON public.teaching_research_outputs FOR SELECT TO authenticated USING (true);

-- Impact policies
CREATE POLICY "Authenticated can view impact pathways" ON public.impact_pathways FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create impact pathways" ON public.impact_pathways FOR INSERT TO authenticated WITH CHECK (primary_contact_id = auth.uid());
CREATE POLICY "Contacts can update pathways" ON public.impact_pathways FOR UPDATE TO authenticated USING (primary_contact_id = auth.uid());
CREATE POLICY "Authenticated can view policy translations" ON public.policy_translation_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create translations" ON public.policy_translation_records FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Authenticated can view adoptions" ON public.impact_adoptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view evaluations" ON public.impact_evaluations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Evaluators can create evaluations" ON public.impact_evaluations FOR INSERT TO authenticated WITH CHECK (evaluated_by = auth.uid());
CREATE POLICY "Authenticated can view disclaimers" ON public.impact_disclaimers FOR SELECT TO authenticated USING (true);

-- Foresight policies
CREATE POLICY "Authenticated can view trend models" ON public.trend_models FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view trend outputs" ON public.trend_outputs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view scenarios" ON public.foresight_scenarios FOR SELECT TO authenticated USING (status = 'published' OR created_by = auth.uid());
CREATE POLICY "Users can create scenarios" ON public.foresight_scenarios FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own scenarios" ON public.foresight_scenarios FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Authenticated can view guardrails" ON public.analytics_guardrails FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view trend alerts" ON public.research_trend_alerts FOR SELECT TO authenticated USING (true);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_scholarly_legacy_profiles_updated_at BEFORE UPDATE ON public.scholarly_legacy_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supervision_records_updated_at BEFORE UPDATE ON public.supervision_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_impact_pathways_updated_at BEFORE UPDATE ON public.impact_pathways FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_foresight_scenarios_updated_at BEFORE UPDATE ON public.foresight_scenarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
