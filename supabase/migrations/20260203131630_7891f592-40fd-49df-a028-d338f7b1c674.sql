-- =====================================================
-- SOVEREIGN DEPLOYMENT INFRASTRUCTURE
-- Nation-state grade isolation & data residency
-- =====================================================

-- Deployment instance types enum
CREATE TYPE deployment_type AS ENUM ('saas', 'dedicated', 'sovereign');
CREATE TYPE governance_mode AS ENUM ('platform', 'delegated', 'autonomous');
CREATE TYPE isolation_level AS ENUM ('shared', 'logical', 'physical');

-- =====================================================
-- CORE DEPLOYMENT INSTANCES
-- =====================================================
CREATE TABLE public.deployment_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name TEXT NOT NULL,
  instance_code TEXT UNIQUE NOT NULL, -- e.g., "pk-nat-research-01"
  instance_type deployment_type NOT NULL DEFAULT 'saas',
  
  -- Owner entity
  owner_entity_type TEXT NOT NULL DEFAULT 'platform', -- platform, organization, government
  owner_entity_id UUID,
  owner_contact_email TEXT,
  
  -- Data residency & region
  region TEXT NOT NULL DEFAULT 'global',
  data_residency_country TEXT, -- ISO country code
  data_residency_certified BOOLEAN DEFAULT false,
  data_residency_certificate_url TEXT,
  
  -- Isolation settings
  isolation_level isolation_level NOT NULL DEFAULT 'shared',
  database_cluster_id TEXT, -- separate DB cluster for sovereign
  storage_bucket_prefix TEXT,
  auth_tenant_id TEXT,
  
  -- Payment isolation
  stripe_account_id TEXT, -- separate Stripe account
  payment_provider TEXT DEFAULT 'stripe', -- stripe, local, none
  local_payment_config JSONB,
  
  -- Governance
  governance_mode governance_mode NOT NULL DEFAULT 'platform',
  governance_authority_name TEXT,
  governance_authority_contact TEXT,
  
  -- Network & dependencies
  network_mode TEXT DEFAULT 'connected', -- connected, restricted, air-gapped
  allowed_outbound_domains TEXT[],
  local_services_config JSONB, -- email, SMS, AI inference
  
  -- Status
  status TEXT DEFAULT 'provisioning', -- provisioning, active, suspended, decommissioned
  provisioned_at TIMESTAMPTZ,
  last_health_check TIMESTAMPTZ,
  health_status TEXT DEFAULT 'unknown',
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- =====================================================
-- DEPLOYMENT CONFIGURATIONS
-- Per-instance overrides for all platform settings
-- =====================================================
CREATE TABLE public.deployment_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_instance_id UUID NOT NULL REFERENCES deployment_instances(id) ON DELETE CASCADE,
  
  config_key TEXT NOT NULL, -- e.g., "feature_flags.ai_enabled"
  config_value JSONB NOT NULL,
  config_type TEXT NOT NULL, -- feature, policy, retention, integration, governance
  
  -- Override tracking
  overrides_default BOOLEAN DEFAULT true,
  default_value JSONB,
  
  -- Governance
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(deployment_instance_id, config_key)
);

-- =====================================================
-- DATA RESIDENCY PROOFS
-- Cryptographic proofs of data location
-- =====================================================
CREATE TABLE public.data_residency_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_instance_id UUID NOT NULL REFERENCES deployment_instances(id) ON DELETE CASCADE,
  
  proof_type TEXT NOT NULL, -- storage_audit, database_audit, backup_audit, access_audit
  proof_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Proof data
  data_location_verified TEXT NOT NULL, -- region/datacenter
  verification_method TEXT NOT NULL, -- automated, manual, third_party
  verifier_entity TEXT,
  
  -- Cryptographic proof
  proof_hash TEXT NOT NULL, -- SHA-256 of proof data
  proof_signature TEXT, -- signed by verification authority
  proof_certificate_chain TEXT,
  
  -- Evidence
  evidence_urls TEXT[],
  evidence_metadata JSONB,
  
  -- Validity
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- DEPLOYMENT ISOLATION AUDIT
-- Track all cross-tenant access attempts
-- =====================================================
CREATE TABLE public.deployment_isolation_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source_instance_id UUID REFERENCES deployment_instances(id),
  target_instance_id UUID REFERENCES deployment_instances(id),
  
  access_type TEXT NOT NULL, -- query, api_call, admin_access
  access_path TEXT, -- endpoint or query pattern
  accessor_user_id UUID,
  
  -- Result
  was_blocked BOOLEAN NOT NULL DEFAULT true,
  block_reason TEXT,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- DEPLOYMENT UPDATE SCHEDULE
-- Control update timing for sovereign instances
-- =====================================================
CREATE TABLE public.deployment_update_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_instance_id UUID NOT NULL REFERENCES deployment_instances(id) ON DELETE CASCADE,
  
  -- Update policy
  auto_update_enabled BOOLEAN DEFAULT false,
  update_window_day TEXT, -- monday, tuesday, etc. or 'any'
  update_window_start_hour INTEGER, -- 0-23
  update_window_end_hour INTEGER,
  update_window_timezone TEXT DEFAULT 'UTC',
  
  -- Approval
  requires_manual_approval BOOLEAN DEFAULT true,
  approval_authority_user_id UUID,
  
  -- Current state
  pending_update_version TEXT,
  pending_update_notes TEXT,
  pending_update_schema_changes JSONB,
  
  last_update_version TEXT,
  last_update_at TIMESTAMPTZ,
  last_update_status TEXT, -- success, failed, rolled_back
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- DEPLOYMENT SCHEMA VERSIONS
-- Track schema compatibility per instance
-- =====================================================
CREATE TABLE public.deployment_schema_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_instance_id UUID NOT NULL REFERENCES deployment_instances(id) ON DELETE CASCADE,
  
  schema_version TEXT NOT NULL,
  migration_hash TEXT NOT NULL,
  
  applied_at TIMESTAMPTZ DEFAULT now(),
  applied_by UUID,
  
  is_compatible_with_platform BOOLEAN DEFAULT true,
  compatibility_notes TEXT,
  
  rollback_available BOOLEAN DEFAULT true,
  rollback_script_url TEXT
);

-- =====================================================
-- DEPLOYMENT COMPLIANCE STATUS
-- Audit readiness per instance
-- =====================================================
CREATE TABLE public.deployment_compliance_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_instance_id UUID NOT NULL REFERENCES deployment_instances(id) ON DELETE CASCADE,
  
  compliance_framework TEXT NOT NULL, -- gdpr, hipaa, iso27001, national_security
  
  status TEXT DEFAULT 'not_assessed', -- not_assessed, in_progress, compliant, non_compliant
  last_assessment_at TIMESTAMPTZ,
  next_assessment_due TIMESTAMPTZ,
  
  -- Findings
  finding_count INTEGER DEFAULT 0,
  critical_findings INTEGER DEFAULT 0,
  remediation_plan_url TEXT,
  
  -- Certification
  is_certified BOOLEAN DEFAULT false,
  certificate_url TEXT,
  certificate_expires_at TIMESTAMPTZ,
  certifying_authority TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(deployment_instance_id, compliance_framework)
);

-- =====================================================
-- DEPLOYMENT ADMIN ASSIGNMENTS
-- Who can admin each deployment
-- =====================================================
CREATE TABLE public.deployment_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_instance_id UUID NOT NULL REFERENCES deployment_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  admin_role TEXT NOT NULL DEFAULT 'operator', -- owner, operator, auditor
  
  -- Permissions
  can_modify_config BOOLEAN DEFAULT false,
  can_approve_updates BOOLEAN DEFAULT false,
  can_access_data BOOLEAN DEFAULT false,
  can_manage_admins BOOLEAN DEFAULT false,
  
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(deployment_instance_id, user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_deployment_instances_type ON deployment_instances(instance_type);
CREATE INDEX idx_deployment_instances_owner ON deployment_instances(owner_entity_type, owner_entity_id);
CREATE INDEX idx_deployment_instances_region ON deployment_instances(region, data_residency_country);
CREATE INDEX idx_deployment_instances_status ON deployment_instances(status);

CREATE INDEX idx_deployment_configurations_instance ON deployment_configurations(deployment_instance_id);
CREATE INDEX idx_deployment_configurations_key ON deployment_configurations(config_key);

CREATE INDEX idx_data_residency_proofs_instance ON data_residency_proofs(deployment_instance_id);
CREATE INDEX idx_data_residency_proofs_current ON data_residency_proofs(is_current) WHERE is_current = true;

CREATE INDEX idx_deployment_isolation_audit_source ON deployment_isolation_audit(source_instance_id);
CREATE INDEX idx_deployment_isolation_audit_target ON deployment_isolation_audit(target_instance_id);
CREATE INDEX idx_deployment_isolation_audit_time ON deployment_isolation_audit(created_at);

CREATE INDEX idx_deployment_admins_user ON deployment_admins(user_id);
CREATE INDEX idx_deployment_admins_instance ON deployment_admins(deployment_instance_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE deployment_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_residency_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_isolation_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_update_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_schema_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_compliance_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_admins ENABLE ROW LEVEL SECURITY;

-- Platform admins can see all
CREATE POLICY "Platform admins full access to deployment_instances"
  ON deployment_instances FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Platform admins full access to deployment_configurations"
  ON deployment_configurations FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Platform admins full access to data_residency_proofs"
  ON data_residency_proofs FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Platform admins full access to deployment_isolation_audit"
  ON deployment_isolation_audit FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Platform admins full access to deployment_update_schedule"
  ON deployment_update_schedule FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Platform admins full access to deployment_schema_versions"
  ON deployment_schema_versions FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Platform admins full access to deployment_compliance_status"
  ON deployment_compliance_status FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Platform admins full access to deployment_admins"
  ON deployment_admins FOR ALL
  USING (is_admin(auth.uid()));

-- Deployment admins can see their deployments
CREATE POLICY "Deployment admins can view their instances"
  ON deployment_instances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deployment_admins
      WHERE deployment_instance_id = id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Deployment admins can view their configurations"
  ON deployment_configurations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deployment_admins
      WHERE deployment_admins.deployment_instance_id = deployment_configurations.deployment_instance_id
      AND user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Check if user is deployment admin
CREATE OR REPLACE FUNCTION is_deployment_admin(p_user_id UUID, p_deployment_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM deployment_admins
    WHERE deployment_instance_id = p_deployment_id
    AND user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Get current deployment instance for request (based on tenant)
CREATE OR REPLACE FUNCTION get_current_deployment_instance()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- In SaaS mode, return the default SaaS instance
  -- In sovereign mode, this would be determined by auth tenant or domain
  SELECT id FROM deployment_instances
  WHERE instance_type = 'saas' AND status = 'active'
  LIMIT 1
$$;

-- Verify isolation between deployments
CREATE OR REPLACE FUNCTION verify_deployment_isolation(
  p_source_deployment_id UUID,
  p_target_deployment_id UUID,
  p_access_type TEXT,
  p_accessor_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_source deployment_instances%ROWTYPE;
  v_target deployment_instances%ROWTYPE;
  v_allowed BOOLEAN := false;
BEGIN
  SELECT * INTO v_source FROM deployment_instances WHERE id = p_source_deployment_id;
  SELECT * INTO v_target FROM deployment_instances WHERE id = p_target_deployment_id;
  
  -- Same deployment = allowed
  IF p_source_deployment_id = p_target_deployment_id THEN
    RETURN true;
  END IF;
  
  -- Sovereign deployments = never cross-access
  IF v_source.instance_type = 'sovereign' OR v_target.instance_type = 'sovereign' THEN
    v_allowed := false;
  -- Dedicated deployments = only with explicit grant
  ELSIF v_source.instance_type = 'dedicated' OR v_target.instance_type = 'dedicated' THEN
    v_allowed := false; -- Could check explicit grants here
  -- SaaS to SaaS = check if same tenant
  ELSE
    v_allowed := v_source.owner_entity_id = v_target.owner_entity_id;
  END IF;
  
  -- Log the access attempt
  INSERT INTO deployment_isolation_audit (
    source_instance_id, target_instance_id, access_type, accessor_user_id, was_blocked, block_reason
  )
  VALUES (
    p_source_deployment_id, p_target_deployment_id, p_access_type, p_accessor_user_id,
    NOT v_allowed,
    CASE WHEN NOT v_allowed THEN 'Cross-deployment access blocked by isolation policy' ELSE NULL END
  );
  
  RETURN v_allowed;
END;
$$;

-- Generate data residency proof
CREATE OR REPLACE FUNCTION generate_residency_proof(
  p_deployment_id UUID,
  p_proof_type TEXT,
  p_data_location TEXT,
  p_verification_method TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_proof_id UUID;
  v_proof_data TEXT;
  v_proof_hash TEXT;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can generate residency proofs';
  END IF;
  
  -- Mark previous proofs as not current
  UPDATE data_residency_proofs
  SET is_current = false
  WHERE deployment_instance_id = p_deployment_id
  AND proof_type = p_proof_type
  AND is_current = true;
  
  -- Generate proof hash
  v_proof_data := p_deployment_id::text || p_proof_type || p_data_location || now()::text;
  v_proof_hash := encode(sha256(v_proof_data::bytea), 'hex');
  
  -- Create new proof
  INSERT INTO data_residency_proofs (
    deployment_instance_id, proof_type, data_location_verified,
    verification_method, proof_hash, valid_until
  )
  VALUES (
    p_deployment_id, p_proof_type, p_data_location,
    p_verification_method, v_proof_hash, now() + INTERVAL '90 days'
  )
  RETURNING id INTO v_proof_id;
  
  -- Log the action
  INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(), 'generate_residency_proof', 'deployment', p_deployment_id,
    jsonb_build_object('proof_id', v_proof_id, 'proof_type', p_proof_type, 'location', p_data_location)
  );
  
  RETURN v_proof_id;
END;
$$;

-- Create default SaaS deployment instance
INSERT INTO deployment_instances (
  instance_name, instance_code, instance_type, owner_entity_type,
  region, isolation_level, governance_mode, network_mode, status, provisioned_at
)
VALUES (
  'Academic Forge Flow - Global SaaS', 'aff-global-saas-01', 'saas', 'platform',
  'global', 'shared', 'platform', 'connected', 'active', now()
)
ON CONFLICT DO NOTHING;