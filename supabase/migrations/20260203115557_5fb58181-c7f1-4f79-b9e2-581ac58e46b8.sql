
-- =============================================
-- FEATURE 26: Crisis Response & Scientific Integrity
-- =============================================

-- Crisis modes for platform-wide safety states
CREATE TABLE public.crisis_modes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crisis_type TEXT NOT NULL CHECK (crisis_type IN ('public_health', 'climate', 'conflict', 'political', 'misinformation_surge')),
  scope TEXT NOT NULL CHECK (scope IN ('global', 'regional', 'institutional')),
  scope_id UUID,
  activated_by UUID REFERENCES public.profiles(id),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at TIMESTAMPTZ,
  deactivated_by UUID REFERENCES public.profiles(id),
  ruleset_applied JSONB DEFAULT '{}',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Integrity flags for content risk markers
CREATE TABLE public.integrity_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('publication', 'dataset', 'post', 'impact_record', 'knowledge_node')),
  entity_id UUID NOT NULL,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('preliminary', 'contested', 'high_uncertainty', 'misuse_risk', 'retracted')),
  flag_reason TEXT NOT NULL,
  applied_by UUID REFERENCES public.profiles(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'confirmed', 'removed')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Misuse reports for coordinated misuse detection
CREATE TABLE public.misuse_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_entity_type TEXT NOT NULL,
  reported_entity_id UUID NOT NULL,
  misuse_type TEXT NOT NULL CHECK (misuse_type IN ('misrepresentation', 'politicization', 'out_of_context_use', 'fabrication', 'harassment')),
  description TEXT,
  evidence_urls TEXT[],
  reported_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Researcher protection events for scholar safety
CREATE TABLE public.researcher_protection_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scholar_passport_id UUID REFERENCES public.scholar_passports(id),
  threat_type TEXT NOT NULL CHECK (threat_type IN ('harassment', 'doxxing', 'pressure', 'legal_threat', 'institutional_retaliation')),
  source_context TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  response_action TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved', 'escalated')),
  logged_by UUID REFERENCES public.profiles(id),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Crisis communications for responsible messaging
CREATE TABLE public.crisis_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crisis_mode_id UUID REFERENCES public.crisis_modes(id),
  message_type TEXT NOT NULL CHECK (message_type IN ('disclaimer', 'public_guidance', 'internal_notice', 'researcher_alert')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'researchers', 'institutions', 'public')),
  approved_by UUID REFERENCES public.profiles(id),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- FEATURE 27: Economic Sustainability & Monetization
-- =============================================

-- Revenue streams for explicit monetization channels
CREATE TABLE public.revenue_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('institutional_subscription', 'tool_license', 'enterprise_services', 'archival_storage', 'analytics_reports', 'priority_support')),
  name TEXT NOT NULL,
  description TEXT,
  governed_by UUID REFERENCES public.governance_councils(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pricing models for transparent pricing logic
CREATE TABLE public.pricing_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  revenue_stream_id UUID REFERENCES public.revenue_streams(id),
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('flat', 'tiered', 'usage_based', 'subsidized', 'free')),
  pricing_rules JSONB NOT NULL DEFAULT '{}',
  currency TEXT DEFAULT 'USD',
  review_cycle_months INTEGER DEFAULT 12,
  last_reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contribution rewards for non-financial incentives
CREATE TABLE public.contribution_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scholar_passport_id UUID REFERENCES public.scholar_passports(id),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('fee_waiver', 'priority_access', 'recognition_credit', 'archival_support', 'analytics_access', 'premium_features')),
  reason TEXT NOT NULL,
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Subsidy programs for equity-based support
CREATE TABLE public.subsidy_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  eligible_group TEXT NOT NULL CHECK (eligible_group IN ('low_resource_institutions', 'early_career', 'global_south', 'students', 'independent_researchers')),
  subsidy_scope TEXT NOT NULL CHECK (subsidy_scope IN ('fees', 'storage', 'analytics', 'tools', 'full_access')),
  subsidy_percentage INTEGER DEFAULT 100 CHECK (subsidy_percentage BETWEEN 0 AND 100),
  funding_source TEXT,
  eligibility_criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Financial transparency reports
CREATE TABLE public.financial_transparency_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  revenue_breakdown JSONB NOT NULL DEFAULT '{}',
  subsidy_allocation JSONB DEFAULT '{}',
  surplus_use JSONB DEFAULT '{}',
  operating_costs JSONB DEFAULT '{}',
  approved_by UUID REFERENCES public.profiles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- FEATURE 28: AI Co-Authorship & Attribution
-- =============================================

-- AI assistance records to track AI usage
CREATE TABLE public.ai_assistance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.collaborative_workspaces(id),
  research_timeline_id UUID REFERENCES public.research_timelines(id),
  ai_tool_name TEXT NOT NULL,
  ai_model_version TEXT,
  assistance_type TEXT NOT NULL CHECK (assistance_type IN ('drafting', 'summarization', 'translation', 'code', 'analysis', 'literature_review', 'editing')),
  initiated_by_user_id UUID REFERENCES public.profiles(id),
  scope_description TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI attribution statements for disclosure text
CREATE TABLE public.ai_attribution_statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('workspace', 'publication', 'dataset', 'proposal', 'research_timeline')),
  target_id UUID NOT NULL,
  disclosure_text TEXT NOT NULL,
  ai_tools_used TEXT[],
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by_user_id UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT false
);

-- AI contribution flags for integrity markers
CREATE TABLE public.ai_contribution_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  ai_involvement_level TEXT NOT NULL CHECK (ai_involvement_level IN ('none', 'assistive', 'substantial', 'prohibited')),
  flag_reason TEXT,
  flagged_by UUID REFERENCES public.profiles(id),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'confirmed', 'cleared'))
);

-- AI policy profiles for contextual AI rules
CREATE TABLE public.ai_policy_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('platform', 'institution', 'journal', 'funding_program', 'research_domain')),
  scope_id UUID,
  policy_name TEXT NOT NULL,
  allowed_uses TEXT[] DEFAULT '{}',
  prohibited_uses TEXT[] DEFAULT '{}',
  disclosure_required BOOLEAN DEFAULT true,
  max_ai_contribution_percentage INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- FEATURE 29: National Research Strategy & Sovereignty
-- =============================================

-- National infrastructure profiles for sovereign deployment
CREATE TABLE public.national_infrastructure_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  deployment_model TEXT NOT NULL CHECK (deployment_model IN ('sovereign_cloud', 'on_prem', 'hybrid', 'federated')),
  governing_body_id UUID REFERENCES public.governance_councils(id),
  data_residency_rules JSONB DEFAULT '{}',
  activated_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- National research strategies for strategic alignment
CREATE TABLE public.national_research_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  strategy_period_start DATE NOT NULL,
  strategy_period_end DATE NOT NULL,
  strategy_name TEXT NOT NULL,
  priority_domains TEXT[] DEFAULT '{}',
  capacity_goals JSONB DEFAULT '{}',
  public_values_statement TEXT,
  adopted_at TIMESTAMPTZ,
  adopted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sovereign data controls for hard data boundaries
CREATE TABLE public.sovereign_data_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  infrastructure_profile_id UUID REFERENCES public.national_infrastructure_profiles(id),
  data_type TEXT NOT NULL CHECK (data_type IN ('identity', 'research', 'funding', 'analytics', 'communications', 'all')),
  residency_requirement TEXT NOT NULL,
  cross_border_rules JSONB DEFAULT '{}',
  encryption_requirements JSONB DEFAULT '{}',
  enforced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public accountability reports for democratic transparency
CREATE TABLE public.public_accountability_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  access_statistics JSONB DEFAULT '{}',
  funding_flow_summary JSONB DEFAULT '{}',
  governance_activity JSONB DEFAULT '{}',
  research_output_summary JSONB DEFAULT '{}',
  approved_by UUID REFERENCES public.profiles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sovereign federation links for country-to-country exchange
CREATE TABLE public.sovereign_federation_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_country TEXT NOT NULL,
  target_country TEXT NOT NULL,
  allowed_data_types TEXT[] DEFAULT '{}',
  treaty_reference TEXT,
  bilateral_agreement_url TEXT,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'terminated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_country, target_country)
);

-- =============================================
-- FEATURE 30: Platform Self-Evolution & Stewardship
-- =============================================

-- Platform mission registry for immutable mission record
CREATE TABLE public.platform_mission_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version_number INTEGER NOT NULL UNIQUE,
  mission_statement TEXT NOT NULL,
  core_principles TEXT[] NOT NULL,
  non_negotiables TEXT[] NOT NULL,
  adopted_by_constitution_version INTEGER,
  adopted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  superseded_by_version INTEGER,
  superseded_at TIMESTAMPTZ
);

-- Stewardship entities for long-term custodians
CREATE TABLE public.stewardship_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('foundation', 'trust', 'consortium', 'public_body', 'academic_council')),
  name TEXT NOT NULL,
  mandate TEXT NOT NULL,
  jurisdiction TEXT,
  legal_registration TEXT,
  contact_info JSONB DEFAULT '{}',
  activated_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'dissolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stewardship roles for authority boundaries
CREATE TABLE public.stewardship_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stewardship_entity_id UUID REFERENCES public.stewardship_entities(id),
  authority_scope TEXT NOT NULL CHECK (authority_scope IN ('mission_guardian', 'constitutional_enforcer', 'asset_custodian', 'crisis_responder', 'succession_manager')),
  limitations TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Platform evolution proposals for deep evolution requests
CREATE TABLE public.platform_evolution_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_type TEXT NOT NULL CHECK (proposal_type IN ('architecture_change', 'governance_reform', 'economic_model_shift', 'mission_amendment', 'stewardship_change')),
  title TEXT NOT NULL,
  proposal_text TEXT NOT NULL,
  impact_assessment TEXT,
  constitutional_implications TEXT,
  proposed_by UUID REFERENCES public.profiles(id),
  stewardship_entity_id UUID REFERENCES public.stewardship_entities(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'deliberation', 'supermajority_vote', 'adopted', 'rejected', 'withdrawn')),
  voting_threshold_percentage INTEGER DEFAULT 75,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  voting_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ
);

-- Continuity triggers for emergency succession logic
CREATE TABLE public.continuity_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('operator_exit', 'bankruptcy', 'acquisition_attempt', 'legal_shutdown', 'governance_failure', 'force_majeure')),
  trigger_conditions JSONB NOT NULL,
  predefined_response TEXT NOT NULL,
  response_steps JSONB DEFAULT '[]',
  responsible_steward_id UUID REFERENCES public.stewardship_entities(id),
  activated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'dormant' CHECK (status IN ('dormant', 'activated', 'resolved', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fork and exit protocols for ethical separation paths
CREATE TABLE public.fork_exit_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_type TEXT NOT NULL CHECK (protocol_type IN ('code_fork', 'governance_fork', 'national_exit', 'institutional_exit', 'emergency_shutdown')),
  protocol_name TEXT NOT NULL,
  conditions TEXT NOT NULL,
  asset_distribution_rules JSONB DEFAULT '{}',
  data_preservation_rules JSONB DEFAULT '{}',
  user_rights_during_exit JSONB DEFAULT '{}',
  approved_by UUID REFERENCES public.stewardship_entities(id),
  approved_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_crisis_modes_active ON public.crisis_modes(activated_at) WHERE deactivated_at IS NULL;
CREATE INDEX idx_integrity_flags_entity ON public.integrity_flags(entity_type, entity_id);
CREATE INDEX idx_misuse_reports_status ON public.misuse_reports(status);
CREATE INDEX idx_researcher_protection_scholar ON public.researcher_protection_events(scholar_passport_id);
CREATE INDEX idx_ai_assistance_workspace ON public.ai_assistance_records(workspace_id);
CREATE INDEX idx_ai_assistance_user ON public.ai_assistance_records(initiated_by_user_id);
CREATE INDEX idx_national_infra_country ON public.national_infrastructure_profiles(country_code);
CREATE INDEX idx_evolution_proposals_status ON public.platform_evolution_proposals(status);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.crisis_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.misuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researcher_protection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsidy_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transparency_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_attribution_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_contribution_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_policy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.national_infrastructure_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.national_research_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sovereign_data_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_accountability_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sovereign_federation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_mission_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_evolution_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continuity_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fork_exit_protocols ENABLE ROW LEVEL SECURITY;

-- Crisis modes policies
CREATE POLICY "Admins can manage crisis modes" ON public.crisis_modes FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view active crisis modes" ON public.crisis_modes FOR SELECT USING (deactivated_at IS NULL);

-- Integrity flags policies
CREATE POLICY "Admins can manage integrity flags" ON public.integrity_flags FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view confirmed flags" ON public.integrity_flags FOR SELECT USING (review_status = 'confirmed');

-- Misuse reports policies
CREATE POLICY "Users can create misuse reports" ON public.misuse_reports FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Users can view own reports" ON public.misuse_reports FOR SELECT USING (auth.uid() = reported_by OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage reports" ON public.misuse_reports FOR ALL USING (public.is_admin(auth.uid()));

-- Researcher protection policies
CREATE POLICY "Admins can manage protection events" ON public.researcher_protection_events FOR ALL USING (public.is_admin(auth.uid()));

-- Crisis communications policies
CREATE POLICY "Admins can manage communications" ON public.crisis_communications FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view published communications" ON public.crisis_communications FOR SELECT USING (published_at IS NOT NULL);

-- Revenue streams policies
CREATE POLICY "Anyone can view active revenue streams" ON public.revenue_streams FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage revenue streams" ON public.revenue_streams FOR ALL USING (public.is_admin(auth.uid()));

-- Pricing models policies
CREATE POLICY "Anyone can view pricing" ON public.pricing_models FOR SELECT USING (true);
CREATE POLICY "Admins can manage pricing" ON public.pricing_models FOR ALL USING (public.is_admin(auth.uid()));

-- Contribution rewards policies
CREATE POLICY "Users can view own rewards" ON public.contribution_rewards FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scholar_passports sp WHERE sp.id = scholar_passport_id AND sp.user_id = auth.uid())
);
CREATE POLICY "Admins can manage rewards" ON public.contribution_rewards FOR ALL USING (public.is_admin(auth.uid()));

-- Subsidy programs policies
CREATE POLICY "Anyone can view active subsidies" ON public.subsidy_programs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage subsidies" ON public.subsidy_programs FOR ALL USING (public.is_admin(auth.uid()));

-- Financial transparency policies
CREATE POLICY "Anyone can view published reports" ON public.financial_transparency_reports FOR SELECT USING (published_at IS NOT NULL);
CREATE POLICY "Admins can manage reports" ON public.financial_transparency_reports FOR ALL USING (public.is_admin(auth.uid()));

-- AI assistance policies
CREATE POLICY "Users can log own AI usage" ON public.ai_assistance_records FOR INSERT WITH CHECK (auth.uid() = initiated_by_user_id);
CREATE POLICY "Users can view own AI usage" ON public.ai_assistance_records FOR SELECT USING (auth.uid() = initiated_by_user_id OR public.is_admin(auth.uid()));

-- AI attribution policies
CREATE POLICY "Users can manage own attributions" ON public.ai_attribution_statements FOR ALL USING (auth.uid() = approved_by_user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Anyone can view public attributions" ON public.ai_attribution_statements FOR SELECT USING (is_public = true);

-- AI contribution flags policies
CREATE POLICY "Users can view flags" ON public.ai_contribution_flags FOR SELECT USING (true);
CREATE POLICY "Admins can manage flags" ON public.ai_contribution_flags FOR ALL USING (public.is_admin(auth.uid()));

-- AI policy profiles policies
CREATE POLICY "Anyone can view active policies" ON public.ai_policy_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage policies" ON public.ai_policy_profiles FOR ALL USING (public.is_admin(auth.uid()));

-- National infrastructure policies
CREATE POLICY "Anyone can view active profiles" ON public.national_infrastructure_profiles FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage profiles" ON public.national_infrastructure_profiles FOR ALL USING (public.is_admin(auth.uid()));

-- National research strategies policies
CREATE POLICY "Anyone can view strategies" ON public.national_research_strategies FOR SELECT USING (adopted_at IS NOT NULL);
CREATE POLICY "Admins can manage strategies" ON public.national_research_strategies FOR ALL USING (public.is_admin(auth.uid()));

-- Sovereign data controls policies
CREATE POLICY "Anyone can view controls" ON public.sovereign_data_controls FOR SELECT USING (true);
CREATE POLICY "Admins can manage controls" ON public.sovereign_data_controls FOR ALL USING (public.is_admin(auth.uid()));

-- Public accountability reports policies
CREATE POLICY "Anyone can view published reports" ON public.public_accountability_reports FOR SELECT USING (published_at IS NOT NULL);
CREATE POLICY "Admins can manage reports" ON public.public_accountability_reports FOR ALL USING (public.is_admin(auth.uid()));

-- Federation links policies
CREATE POLICY "Anyone can view active links" ON public.sovereign_federation_links FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage links" ON public.sovereign_federation_links FOR ALL USING (public.is_admin(auth.uid()));

-- Mission registry policies
CREATE POLICY "Anyone can view mission" ON public.platform_mission_registry FOR SELECT USING (true);
CREATE POLICY "Stewardship can manage mission" ON public.platform_mission_registry FOR ALL USING (public.is_admin(auth.uid()));

-- Stewardship entities policies
CREATE POLICY "Anyone can view active stewards" ON public.stewardship_entities FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage stewards" ON public.stewardship_entities FOR ALL USING (public.is_admin(auth.uid()));

-- Stewardship roles policies
CREATE POLICY "Anyone can view roles" ON public.stewardship_roles FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage roles" ON public.stewardship_roles FOR ALL USING (public.is_admin(auth.uid()));

-- Evolution proposals policies
CREATE POLICY "Anyone can view proposals" ON public.platform_evolution_proposals FOR SELECT USING (status != 'draft');
CREATE POLICY "Users can create proposals" ON public.platform_evolution_proposals FOR INSERT WITH CHECK (auth.uid() = proposed_by);
CREATE POLICY "Admins can manage proposals" ON public.platform_evolution_proposals FOR UPDATE USING (public.is_admin(auth.uid()));

-- Continuity triggers policies
CREATE POLICY "Admins can manage triggers" ON public.continuity_triggers FOR ALL USING (public.is_admin(auth.uid()));

-- Fork exit protocols policies
CREATE POLICY "Anyone can view approved protocols" ON public.fork_exit_protocols FOR SELECT USING (approved_at IS NOT NULL);
CREATE POLICY "Admins can manage protocols" ON public.fork_exit_protocols FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_revenue_streams_updated_at BEFORE UPDATE ON public.revenue_streams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_policy_profiles_updated_at BEFORE UPDATE ON public.ai_policy_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED INITIAL MISSION
-- =============================================

INSERT INTO public.platform_mission_registry (version_number, mission_statement, core_principles, non_negotiables, adopted_by_constitution_version)
VALUES (
  1,
  'To advance human knowledge through ethical, transparent, and collaborative research infrastructure that serves scholars, institutions, and society.',
  ARRAY[
    'Academic freedom and intellectual autonomy',
    'Transparency and accountability in all operations',
    'Equity and accessibility for all researchers',
    'Long-term preservation of scholarly knowledge',
    'Democratic governance and community participation'
  ],
  ARRAY[
    'Never compromise research integrity for profit',
    'Never enable surveillance of individual researchers',
    'Never allow political or commercial capture of governance',
    'Always preserve user data ownership and portability',
    'Always maintain open standards and interoperability'
  ],
  1
);
