-- =====================================================
-- SECURITY AUDIT & PENETRATION TESTING FRAMEWORK
-- Threat modeling, attack surface, pen-tests, incidents
-- =====================================================

-- =====================================================
-- THREAT MODELS (STRIDE-based)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.threat_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL,
  threat_type TEXT NOT NULL,
  threat_category TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  attack_vector TEXT,
  potential_impact TEXT,
  risk_level TEXT NOT NULL DEFAULT 'medium',
  likelihood TEXT DEFAULT 'medium',
  mitigation TEXT,
  mitigation_status TEXT DEFAULT 'pending',
  owner_id UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ATTACK SURFACE MAPPING
-- =====================================================
CREATE TABLE IF NOT EXISTS public.attack_surfaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surface_name TEXT NOT NULL,
  surface_type TEXT NOT NULL,
  component TEXT NOT NULL,
  entry_points TEXT[],
  authentication_required BOOLEAN DEFAULT true,
  authorization_level TEXT,
  data_sensitivity TEXT DEFAULT 'medium',
  exposure_level TEXT DEFAULT 'internal',
  known_vulnerabilities TEXT[],
  last_assessed_at TIMESTAMPTZ,
  risk_score INTEGER DEFAULT 50,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- SECURITY TEST SUITES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.security_test_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_name TEXT NOT NULL,
  suite_type TEXT NOT NULL,
  description TEXT,
  test_cases JSONB NOT NULL DEFAULT '[]',
  is_destructive BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT true,
  schedule TEXT,
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- SECURITY TEST RESULTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.security_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID REFERENCES security_test_suites(id),
  test_type TEXT NOT NULL,
  test_name TEXT NOT NULL,
  component TEXT NOT NULL,
  result TEXT NOT NULL,
  severity TEXT,
  evidence JSONB,
  reproduction_steps TEXT,
  recommendation TEXT,
  tested_at TIMESTAMPTZ DEFAULT now(),
  tested_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT
);

-- =====================================================
-- SECURITY VULNERABILITIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.security_vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  component TEXT NOT NULL,
  vulnerability_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  cvss_score DECIMAL(3,1),
  status TEXT DEFAULT 'open',
  discovered_at TIMESTAMPTZ DEFAULT now(),
  discovered_by TEXT,
  attack_surface_id UUID REFERENCES attack_surfaces(id),
  threat_model_id UUID REFERENCES threat_models(id),
  remediation_plan TEXT,
  remediation_deadline TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- SECURITY INCIDENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT DEFAULT 'detected',
  incident_type TEXT NOT NULL,
  affected_components TEXT[],
  affected_users_count INTEGER DEFAULT 0,
  data_compromised BOOLEAN DEFAULT false,
  data_types_affected TEXT[],
  detection_method TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  contained_at TIMESTAMPTZ,
  eradicated_at TIMESTAMPTZ,
  recovered_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  lead_responder_id UUID REFERENCES profiles(id),
  root_cause TEXT,
  lessons_learned TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INCIDENT RESPONSE ACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.incident_response_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES security_incidents(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  performed_by UUID REFERENCES profiles(id),
  performed_at TIMESTAMPTZ DEFAULT now(),
  outcome TEXT,
  evidence JSONB,
  next_steps TEXT
);

-- =====================================================
-- SECURITY AUDIT EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.security_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  action TEXT NOT NULL,
  result TEXT NOT NULL,
  risk_score INTEGER DEFAULT 0,
  anomaly_detected BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- AI GOVERNANCE - MODEL REGISTRY
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_models_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  model_identifier TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  model_version TEXT,
  purpose TEXT NOT NULL,
  capabilities TEXT[],
  risk_level TEXT DEFAULT 'medium',
  enabled BOOLEAN DEFAULT true,
  requires_human_review BOOLEAN DEFAULT false,
  max_tokens_per_request INTEGER,
  cost_per_1k_tokens DECIMAL(10,6),
  data_retention_policy TEXT DEFAULT 'no_retention',
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- AI USAGE LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  model_id UUID REFERENCES ai_models_registry(id),
  feature TEXT NOT NULL,
  session_id TEXT,
  input_hash TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  cost_estimate DECIMAL(10,6),
  latency_ms INTEGER,
  was_reviewed BOOLEAN DEFAULT false,
  was_rejected BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- AI POLICIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name TEXT NOT NULL,
  scope TEXT NOT NULL,
  scope_id TEXT,
  rules JSONB NOT NULL DEFAULT '{}',
  allow_generation BOOLEAN DEFAULT true,
  allow_analysis BOOLEAN DEFAULT true,
  allow_matching BOOLEAN DEFAULT true,
  allow_co_authoring BOOLEAN DEFAULT true,
  allow_training BOOLEAN DEFAULT false,
  human_review_required BOOLEAN DEFAULT false,
  max_tokens_per_day INTEGER,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- AI KILL SWITCHES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_kill_switches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  switch_type TEXT NOT NULL,
  switch_target TEXT,
  is_active BOOLEAN DEFAULT false,
  reason TEXT NOT NULL,
  activated_by UUID REFERENCES profiles(id),
  activated_at TIMESTAMPTZ,
  deactivated_by UUID REFERENCES profiles(id),
  deactivated_at TIMESTAMPTZ,
  auto_deactivate_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(switch_type, switch_target)
);

-- =====================================================
-- ARTIFACT LINEAGE (Provenance Graph)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.artifact_lineage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_artifact_id UUID NOT NULL,
  child_artifact_id UUID NOT NULL,
  relationship TEXT NOT NULL,
  relationship_details TEXT,
  confidence_level TEXT DEFAULT 'high',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_artifact_id, child_artifact_id, relationship)
);

-- =====================================================
-- REPRODUCIBILITY CLAIMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reproducibility_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL,
  claim_type TEXT NOT NULL,
  claim_level TEXT DEFAULT 'self',
  requirements JSONB,
  environment_specification JSONB,
  estimated_reproduction_time TEXT,
  estimated_cost TEXT,
  limitations TEXT,
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_status TEXT DEFAULT 'pending',
  review_notes TEXT
);

-- =====================================================
-- VERIFICATION ATTEMPTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID NOT NULL,
  claim_id UUID REFERENCES reproducibility_claims(id),
  verifier_id UUID NOT NULL REFERENCES profiles(id),
  verifier_institution_id UUID REFERENCES organizations(id),
  outcome TEXT NOT NULL,
  outcome_details TEXT,
  methodology_followed BOOLEAN DEFAULT true,
  deviations_noted TEXT,
  environment_used JSONB,
  time_spent_hours DECIMAL(10,2),
  cost_incurred DECIMAL(10,2),
  evidence_links TEXT[],
  evidence_checksums TEXT[],
  conflict_of_interest_declared BOOLEAN DEFAULT false,
  conflict_details TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT false
);

-- =====================================================
-- FEDERATED INSTANCES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.federated_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name TEXT NOT NULL,
  instance_code TEXT UNIQUE NOT NULL,
  instance_type TEXT NOT NULL,
  public_endpoint TEXT NOT NULL,
  api_version TEXT DEFAULT 'v1',
  public_key TEXT,
  trust_level TEXT DEFAULT 'pending',
  governance_authority TEXT,
  data_residency TEXT,
  supported_features TEXT[],
  federation_agreement_signed BOOLEAN DEFAULT false,
  agreement_signed_at TIMESTAMPTZ,
  last_heartbeat_at TIMESTAMPTZ,
  health_status TEXT DEFAULT 'unknown',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- FEDERATED IDENTITIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.federated_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_user_id UUID NOT NULL REFERENCES profiles(id),
  remote_instance_id UUID NOT NULL REFERENCES federated_instances(id),
  remote_user_hash TEXT NOT NULL,
  verification_level TEXT DEFAULT 'basic',
  trust_score_snapshot INTEGER,
  permissions TEXT[],
  linked_at TIMESTAMPTZ DEFAULT now(),
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(local_user_id, remote_instance_id)
);

-- =====================================================
-- FEDERATED DISCOVERY CACHE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.federated_discovery_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_instance_id UUID NOT NULL REFERENCES federated_instances(id),
  resource_type TEXT NOT NULL,
  resource_hash TEXT NOT NULL,
  metadata JSONB NOT NULL,
  visibility TEXT DEFAULT 'public',
  cached_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(source_instance_id, resource_type, resource_hash)
);

-- =====================================================
-- FEDERATED COLLABORATION REQUESTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.federated_collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requesting_instance_id UUID NOT NULL REFERENCES federated_instances(id),
  target_instance_id UUID NOT NULL REFERENCES federated_instances(id),
  requesting_user_hash TEXT,
  artifact_reference TEXT,
  collaboration_type TEXT NOT NULL,
  purpose TEXT NOT NULL,
  scope JSONB,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  response_notes TEXT,
  expires_at TIMESTAMPTZ,
  local_governance_approved BOOLEAN
);

-- =====================================================
-- FEDERATED VERIFICATION ATTESTATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.federated_verification_attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_artifact_id UUID,
  remote_instance_id UUID NOT NULL REFERENCES federated_instances(id),
  remote_artifact_hash TEXT NOT NULL,
  attestation_type TEXT NOT NULL,
  verdict TEXT NOT NULL,
  proof_reference TEXT,
  proof_hash TEXT,
  attested_at TIMESTAMPTZ DEFAULT now(),
  attester_hash TEXT,
  is_valid BOOLEAN DEFAULT true,
  invalidated_at TIMESTAMPTZ,
  invalidation_reason TEXT
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_threat_models_component ON threat_models(component);
CREATE INDEX IF NOT EXISTS idx_threat_models_risk ON threat_models(risk_level);
CREATE INDEX IF NOT EXISTS idx_attack_surfaces_type ON attack_surfaces(surface_type);
CREATE INDEX IF NOT EXISTS idx_security_test_results_suite ON security_test_results(suite_id);
CREATE INDEX IF NOT EXISTS idx_security_test_results_result ON security_test_results(result);
CREATE INDEX IF NOT EXISTS idx_security_vulnerabilities_status ON security_vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_security_vulnerabilities_severity ON security_vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_audit_events_type ON security_audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_events_user ON security_audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_events_time ON security_audit_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_models_registry_enabled ON ai_models_registry(enabled);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_model ON ai_usage_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_feature ON ai_usage_logs(feature);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_time ON ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_policies_scope ON ai_policies(scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_federated_instances_type ON federated_instances(instance_type);
CREATE INDEX IF NOT EXISTS idx_federated_instances_trust ON federated_instances(trust_level);
CREATE INDEX IF NOT EXISTS idx_federated_identities_local ON federated_identities(local_user_id);
CREATE INDEX IF NOT EXISTS idx_federated_identities_remote ON federated_identities(remote_instance_id);
CREATE INDEX IF NOT EXISTS idx_federated_collab_status ON federated_collaboration_requests(status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE threat_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE attack_surfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_response_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_kill_switches ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifact_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproducibility_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE federated_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE federated_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE federated_discovery_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE federated_collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE federated_verification_attestations ENABLE ROW LEVEL SECURITY;

-- Admin-only security tables policies
DO $$ BEGIN
CREATE POLICY "Admins full access to threat_models" ON threat_models FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to attack_surfaces" ON attack_surfaces FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to security_test_suites" ON security_test_suites FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to security_test_results" ON security_test_results FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to security_vulnerabilities" ON security_vulnerabilities FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to security_incidents" ON security_incidents FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to incident_response_actions" ON incident_response_actions FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to security_audit_events" ON security_audit_events FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to ai_models_registry" ON ai_models_registry FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to ai_policies" ON ai_policies FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to ai_kill_switches" ON ai_kill_switches FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Users can view own ai_usage_logs" ON ai_usage_logs FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "System can insert ai_usage_logs" ON ai_usage_logs FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to ai_usage_logs" ON ai_usage_logs FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to artifact_lineage" ON artifact_lineage FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Claims viewable by all" ON reproducibility_claims FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Users can submit claims" ON reproducibility_claims FOR INSERT WITH CHECK (submitted_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to reproducibility_claims" ON reproducibility_claims FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Public verifications viewable" ON verification_attempts FOR SELECT USING (is_public = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Verifiers can manage own attempts" ON verification_attempts FOR ALL USING (verifier_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to verification_attempts" ON verification_attempts FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to federated_instances" ON federated_instances FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Public can view active instances" ON federated_instances FOR SELECT USING (trust_level IN ('verified', 'trusted'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to federated_identities" ON federated_identities FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Users can view own federated identity" ON federated_identities FOR SELECT USING (local_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Public discovery cache viewable" ON federated_discovery_cache FOR SELECT USING (visibility = 'public');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to federated_discovery_cache" ON federated_discovery_cache FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to federated_collaboration_requests" ON federated_collaboration_requests FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY "Admins full access to federated_verification_attestations" ON federated_verification_attestations FOR ALL USING (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if AI feature is enabled
CREATE OR REPLACE FUNCTION is_ai_feature_enabled(p_feature TEXT, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_global_kill BOOLEAN;
  v_feature_kill BOOLEAN;
  v_policy_allows BOOLEAN;
BEGIN
  SELECT is_active INTO v_global_kill
  FROM ai_kill_switches
  WHERE switch_type = 'global' AND is_active = true
  LIMIT 1;
  
  IF v_global_kill THEN RETURN false; END IF;
  
  SELECT is_active INTO v_feature_kill
  FROM ai_kill_switches
  WHERE switch_type = 'feature' AND switch_target = p_feature AND is_active = true
  LIMIT 1;
  
  IF v_feature_kill THEN RETURN false; END IF;
  
  SELECT CASE p_feature
    WHEN 'generation' THEN allow_generation
    WHEN 'analysis' THEN allow_analysis
    WHEN 'matching' THEN allow_matching
    WHEN 'co_authoring' THEN allow_co_authoring
    ELSE true
  END INTO v_policy_allows
  FROM ai_policies
  WHERE scope = 'global' AND is_active = true
  ORDER BY priority DESC
  LIMIT 1;
  
  RETURN COALESCE(v_policy_allows, true);
END;
$$;

-- Insert default AI models
INSERT INTO ai_models_registry (model_name, model_identifier, provider, purpose, risk_level, enabled, cost_per_1k_tokens)
VALUES 
  ('Gemini 2.5 Flash', 'google/gemini-2.5-flash', 'lovable', 'analysis', 'low', true, 0.000075),
  ('Gemini 2.5 Pro', 'google/gemini-2.5-pro', 'lovable', 'generation', 'medium', true, 0.00125),
  ('GPT-5 Mini', 'openai/gpt-5-mini', 'lovable', 'chat', 'low', true, 0.00015),
  ('GPT-5', 'openai/gpt-5', 'lovable', 'generation', 'medium', true, 0.005)
ON CONFLICT (model_identifier) DO NOTHING;

-- Insert default global AI policy
INSERT INTO ai_policies (policy_name, scope, allow_generation, allow_analysis, allow_matching, allow_co_authoring, allow_training, human_review_required, is_active)
SELECT 'Default Global Policy', 'global', true, true, true, true, false, false, true
WHERE NOT EXISTS (SELECT 1 FROM ai_policies WHERE scope = 'global' AND policy_name = 'Default Global Policy');