-- =============================================
-- PHASE 5: GOVERNMENT INTEGRATION & INFRASTRUCTURE
-- =============================================

-- 1. Government Integration Tables
-- -----------------------------------------

-- Government bodies that can integrate with the platform
CREATE TABLE public.government_bodies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  body_type TEXT NOT NULL, -- 'education_ministry', 'research_council', 'accreditation', 'ethics_board', 'grant_authority'
  integration_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'revoked'
  api_access_level TEXT NOT NULL DEFAULT 'read_only', -- 'read_only', 'read_write', 'full'
  contact_email TEXT,
  contact_name TEXT,
  data_sharing_agreement_id UUID,
  agreement_signed_at TIMESTAMPTZ,
  mou_document_url TEXT,
  access_restrictions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Government users with specific access roles
CREATE TABLE public.government_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  government_body_id UUID NOT NULL REFERENCES public.government_bodies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer', -- 'viewer', 'analyst', 'auditor', 'admin'
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_access_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Government reports - scheduled or on-demand
CREATE TABLE public.government_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  government_body_id UUID NOT NULL REFERENCES public.government_bodies(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'academic_output', 'financial_summary', 'compliance_audit', 'research_metrics', 'integrity_report'
  report_name TEXT NOT NULL,
  description TEXT,
  parameters JSONB DEFAULT '{}',
  schedule TEXT, -- cron expression or 'manual'
  last_generated_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,
  format TEXT NOT NULL DEFAULT 'pdf', -- 'pdf', 'csv', 'json', 'xlsx'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Government report executions
CREATE TABLE public.government_report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.government_reports(id) ON DELETE CASCADE,
  requested_by UUID,
  execution_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  file_url TEXT,
  file_size_bytes BIGINT,
  error_message TEXT,
  parameters_snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Academic Records & Digital Credentials
-- -----------------------------------------

-- Persistent academic contribution ledger
CREATE TABLE public.academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  record_type TEXT NOT NULL, -- 'project_completion', 'milestone_delivery', 'review_received', 'supervision', 'collaboration', 'publication'
  title TEXT NOT NULL,
  description TEXT,
  entity_type TEXT, -- 'offer', 'earning_project', 'milestone', 'review'
  entity_id UUID,
  institution_id UUID REFERENCES public.organizations(id),
  supervisor_id UUID,
  start_date DATE,
  end_date DATE,
  skills_demonstrated TEXT[],
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'disputed', 'revoked'
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  verification_hash TEXT, -- tamper-resistant hash
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Digital credentials/certificates
CREATE TABLE public.digital_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credential_type TEXT NOT NULL, -- 'completion_certificate', 'skill_badge', 'trust_tier_badge', 'institution_endorsement', 'excellence_award'
  title TEXT NOT NULL,
  description TEXT,
  issuer_type TEXT NOT NULL, -- 'platform', 'institution', 'supervisor', 'government'
  issuer_id UUID,
  issuer_name TEXT NOT NULL,
  related_record_id UUID REFERENCES public.academic_records(id),
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_data JSONB DEFAULT '{}',
  verification_code TEXT UNIQUE NOT NULL,
  verification_url TEXT,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Credential verification requests
CREATE TABLE public.credential_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES public.digital_credentials(id) ON DELETE CASCADE,
  verifier_email TEXT,
  verifier_organization TEXT,
  verification_method TEXT NOT NULL, -- 'code', 'url', 'api'
  verification_result BOOLEAN,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Cross-Border Academic Interoperability
-- -----------------------------------------

-- Country-specific policy configurations
CREATE TABLE public.country_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-2
  country_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  payment_enabled BOOLEAN NOT NULL DEFAULT true,
  min_age_requirement INTEGER DEFAULT 18,
  data_residency_required BOOLEAN NOT NULL DEFAULT false,
  tax_compliance_required BOOLEAN NOT NULL DEFAULT false,
  tax_rate_percentage NUMERIC(5,2),
  identity_verification_required BOOLEAN NOT NULL DEFAULT false,
  government_integration_enabled BOOLEAN NOT NULL DEFAULT false,
  special_restrictions JSONB DEFAULT '{}',
  compliance_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- International institution registry
CREATE TABLE public.international_institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  city TEXT,
  institution_type TEXT NOT NULL, -- 'university', 'research_institute', 'college', 'government_lab'
  accreditation_status TEXT, -- 'accredited', 'pending', 'not_accredited'
  ranking_tier TEXT, -- 'tier1', 'tier2', 'tier3', 'unranked'
  website_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  local_org_id UUID REFERENCES public.organizations(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Institution partnership links
CREATE TABLE public.institution_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_a_id UUID NOT NULL REFERENCES public.international_institutions(id) ON DELETE CASCADE,
  institution_b_id UUID NOT NULL REFERENCES public.international_institutions(id) ON DELETE CASCADE,
  partnership_type TEXT NOT NULL, -- 'collaboration', 'exchange', 'joint_program', 'research_alliance'
  agreement_start_date DATE,
  agreement_end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  terms JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT different_institutions CHECK (institution_a_id != institution_b_id)
);

-- 4. Governance Succession & Institutional Permanence
-- -----------------------------------------

-- Platform governance roles (beyond admin)
CREATE TABLE public.governance_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL UNIQUE,
  role_level INTEGER NOT NULL, -- hierarchy level (1=highest)
  permissions JSONB NOT NULL DEFAULT '[]',
  succession_order INTEGER,
  requires_mfa BOOLEAN NOT NULL DEFAULT true,
  max_holders INTEGER DEFAULT 3,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Governance role assignments
CREATE TABLE public.governance_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  governance_role_id UUID NOT NULL REFERENCES public.governance_roles(id) ON DELETE CASCADE,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  succession_priority INTEGER,
  emergency_contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, governance_role_id)
);

-- Data escrow for institutional permanence
CREATE TABLE public.data_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_type TEXT NOT NULL, -- 'full_backup', 'credentials_backup', 'financial_records', 'user_data'
  escrow_provider TEXT NOT NULL,
  encryption_key_holder TEXT,
  last_sync_at TIMESTAMPTZ,
  sync_frequency_hours INTEGER NOT NULL DEFAULT 24,
  retention_years INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Ethical AI & Transparency
-- -----------------------------------------

-- AI bias monitoring logs
CREATE TABLE public.ai_bias_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_capability TEXT NOT NULL,
  monitoring_period_start TIMESTAMPTZ NOT NULL,
  monitoring_period_end TIMESTAMPTZ NOT NULL,
  total_decisions INTEGER NOT NULL,
  demographic_breakdown JSONB DEFAULT '{}',
  outcome_distribution JSONB DEFAULT '{}',
  bias_indicators JSONB DEFAULT '{}',
  fairness_score NUMERIC(5,2),
  recommendations TEXT[],
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- National-level insights (AI-generated for government)
CREATE TABLE public.national_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL, -- 'research_gap', 'funding_efficiency', 'supervision_load', 'integrity_risk', 'trend_forecast'
  country_code TEXT,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  detailed_analysis TEXT,
  data_sources JSONB DEFAULT '[]',
  confidence_score NUMERIC(3,2),
  recommendations JSONB DEFAULT '[]',
  is_public BOOLEAN NOT NULL DEFAULT false,
  generated_by TEXT NOT NULL DEFAULT 'ai',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Infrastructure Contracts & Pricing
-- -----------------------------------------

-- Institutional/government contracts
CREATE TABLE public.infrastructure_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_type TEXT NOT NULL, -- 'institutional_license', 'government_service', 'data_access', 'compliance_tooling'
  entity_type TEXT NOT NULL, -- 'organization', 'government_body', 'consortium'
  entity_id UUID,
  entity_name TEXT NOT NULL,
  country_code TEXT,
  contract_value NUMERIC(15,2),
  currency TEXT NOT NULL DEFAULT 'PKR',
  billing_cycle TEXT, -- 'monthly', 'quarterly', 'annually', 'one_time'
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  terms_document_url TEXT,
  services_included JSONB DEFAULT '[]',
  usage_limits JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending', 'active', 'expired', 'terminated'
  signed_by UUID,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contract usage tracking
CREATE TABLE public.contract_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.infrastructure_contracts(id) ON DELETE CASCADE,
  usage_period_start DATE NOT NULL,
  usage_period_end DATE NOT NULL,
  api_calls INTEGER DEFAULT 0,
  reports_generated INTEGER DEFAULT 0,
  users_active INTEGER DEFAULT 0,
  storage_used_mb NUMERIC(12,2) DEFAULT 0,
  ai_credits_used INTEGER DEFAULT 0,
  additional_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Consent & Compliance Tracking
-- -----------------------------------------

-- User consent records for GDPR/compliance
CREATE TABLE public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_type TEXT NOT NULL, -- 'terms_of_service', 'privacy_policy', 'data_processing', 'marketing', 'government_sharing'
  version TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data access requests (GDPR Article 15, etc.)
CREATE TABLE public.data_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL, -- 'export', 'delete', 'rectify', 'restrict'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  response_file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.government_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.international_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_bias_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.national_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Government bodies - admin only
CREATE POLICY "Admins can manage government bodies" ON public.government_bodies FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Government users can view their body" ON public.government_bodies FOR SELECT 
  USING (id IN (SELECT government_body_id FROM public.government_users WHERE user_id = auth.uid()));

-- Government users - admin and self
CREATE POLICY "Admins can manage government users" ON public.government_users FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own government access" ON public.government_users FOR SELECT USING (user_id = auth.uid());

-- Government reports - admin and government users
CREATE POLICY "Admins can manage government reports" ON public.government_reports FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Government users can view their reports" ON public.government_reports FOR SELECT 
  USING (government_body_id IN (SELECT government_body_id FROM public.government_users WHERE user_id = auth.uid()));

-- Report executions
CREATE POLICY "Admins can manage report executions" ON public.government_report_executions FOR ALL USING (is_admin(auth.uid()));

-- Academic records
CREATE POLICY "Users can view own academic records" ON public.academic_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own academic records" ON public.academic_records FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Public records are viewable" ON public.academic_records FOR SELECT USING (is_public = true);
CREATE POLICY "Admins can manage all academic records" ON public.academic_records FOR ALL USING (is_admin(auth.uid()));

-- Digital credentials
CREATE POLICY "Users can view own credentials" ON public.digital_credentials FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage credentials" ON public.digital_credentials FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Verified credentials are publicly viewable" ON public.digital_credentials FOR SELECT 
  USING (is_revoked = false);

-- Credential verifications - anyone can verify
CREATE POLICY "Anyone can create verification requests" ON public.credential_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view verifications" ON public.credential_verifications FOR SELECT USING (is_admin(auth.uid()));

-- Country policies - read by all, manage by admin
CREATE POLICY "Anyone can view enabled country policies" ON public.country_policies FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins can manage country policies" ON public.country_policies FOR ALL USING (is_admin(auth.uid()));

-- International institutions - read by all, manage by admin
CREATE POLICY "Anyone can view verified institutions" ON public.international_institutions FOR SELECT USING (verified = true);
CREATE POLICY "Admins can manage institutions" ON public.international_institutions FOR ALL USING (is_admin(auth.uid()));

-- Institution partnerships
CREATE POLICY "Anyone can view active partnerships" ON public.institution_partnerships FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage partnerships" ON public.institution_partnerships FOR ALL USING (is_admin(auth.uid()));

-- Governance roles - admin only
CREATE POLICY "Admins can manage governance roles" ON public.governance_roles FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Governance members can view roles" ON public.governance_roles FOR SELECT USING (auth.uid() IS NOT NULL);

-- Governance assignments - admin only
CREATE POLICY "Admins can manage governance assignments" ON public.governance_assignments FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own assignments" ON public.governance_assignments FOR SELECT USING (user_id = auth.uid());

-- Data escrow - admin only
CREATE POLICY "Admins can manage data escrow" ON public.data_escrow FOR ALL USING (is_admin(auth.uid()));

-- AI bias monitoring - admin only
CREATE POLICY "Admins can manage AI bias monitoring" ON public.ai_bias_monitoring FOR ALL USING (is_admin(auth.uid()));

-- National insights
CREATE POLICY "Public insights are viewable" ON public.national_insights FOR SELECT USING (is_public = true);
CREATE POLICY "Admins can manage national insights" ON public.national_insights FOR ALL USING (is_admin(auth.uid()));

-- Infrastructure contracts - admin only
CREATE POLICY "Admins can manage infrastructure contracts" ON public.infrastructure_contracts FOR ALL USING (is_admin(auth.uid()));

-- Contract usage - admin only
CREATE POLICY "Admins can manage contract usage" ON public.contract_usage FOR ALL USING (is_admin(auth.uid()));

-- User consents - users own their consents
CREATE POLICY "Users can view own consents" ON public.user_consents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own consents" ON public.user_consents FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own consents" ON public.user_consents FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all consents" ON public.user_consents FOR SELECT USING (is_admin(auth.uid()));

-- Data access requests
CREATE POLICY "Users can view own data requests" ON public.data_access_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create data requests" ON public.data_access_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage data requests" ON public.data_access_requests FOR ALL USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_government_users_body ON public.government_users(government_body_id);
CREATE INDEX idx_government_users_user ON public.government_users(user_id);
CREATE INDEX idx_government_reports_body ON public.government_reports(government_body_id);
CREATE INDEX idx_academic_records_user ON public.academic_records(user_id);
CREATE INDEX idx_academic_records_type ON public.academic_records(record_type);
CREATE INDEX idx_digital_credentials_user ON public.digital_credentials(user_id);
CREATE INDEX idx_digital_credentials_code ON public.digital_credentials(verification_code);
CREATE INDEX idx_country_policies_code ON public.country_policies(country_code);
CREATE INDEX idx_international_institutions_country ON public.international_institutions(country_code);
CREATE INDEX idx_governance_assignments_user ON public.governance_assignments(user_id);
CREATE INDEX idx_national_insights_type ON public.national_insights(insight_type);
CREATE INDEX idx_infrastructure_contracts_entity ON public.infrastructure_contracts(entity_type, entity_id);
CREATE INDEX idx_user_consents_user ON public.user_consents(user_id);
CREATE INDEX idx_data_access_requests_user ON public.data_access_requests(user_id);

-- Insert default governance roles
INSERT INTO public.governance_roles (role_name, role_level, permissions, succession_order, description) VALUES
('Platform Director', 1, '["all"]', 1, 'Highest authority with full platform control'),
('Chief Compliance Officer', 2, '["compliance", "audit", "data_access", "reports"]', 2, 'Regulatory and compliance oversight'),
('Chief Technology Officer', 2, '["technical", "infrastructure", "security"]', 3, 'Technical infrastructure control'),
('Operations Director', 3, '["operations", "support", "moderation"]', 4, 'Day-to-day operations management'),
('Government Liaison', 3, '["government", "reports", "compliance"]', 5, 'Government relations and reporting');

-- Insert default country policies for initial countries
INSERT INTO public.country_policies (country_code, country_name, payment_enabled, government_integration_enabled) VALUES
('PK', 'Pakistan', true, true),
('US', 'United States', true, false),
('GB', 'United Kingdom', true, false),
('CA', 'Canada', true, false),
('AU', 'Australia', true, false),
('DE', 'Germany', true, false),
('FR', 'France', true, false),
('AE', 'United Arab Emirates', true, false),
('SA', 'Saudi Arabia', true, false),
('MY', 'Malaysia', true, false),
('SG', 'Singapore', true, false),
('IN', 'India', true, false);

-- Function to generate verification code for credentials
CREATE OR REPLACE FUNCTION public.generate_credential_verification_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  v_code := upper(substring(md5(random()::text || now()::text) from 1 for 12));
  RETURN 'AFF-' || substring(v_code from 1 for 4) || '-' || substring(v_code from 5 for 4) || '-' || substring(v_code from 9 for 4);
END;
$$;

-- Function to create academic record from completed offer
CREATE OR REPLACE FUNCTION public.create_academic_record_from_offer(p_offer_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offer offers%ROWTYPE;
  v_record_id UUID;
BEGIN
  SELECT * INTO v_offer FROM offers WHERE id = p_offer_id AND status = 'completed';
  
  IF v_offer.id IS NULL THEN
    RAISE EXCEPTION 'Offer not found or not completed';
  END IF;
  
  -- Create record for recipient (service provider)
  INSERT INTO academic_records (
    user_id, record_type, title, description, entity_type, entity_id,
    start_date, end_date, verification_status, verification_hash
  )
  VALUES (
    v_offer.recipient_id, 'project_completion', v_offer.title, v_offer.description,
    'offer', v_offer.id, v_offer.created_at::date, now()::date,
    'verified', md5(v_offer.id::text || now()::text)
  )
  RETURNING id INTO v_record_id;
  
  RETURN v_record_id;
END;
$$;

-- Function to issue digital credential
CREATE OR REPLACE FUNCTION public.issue_digital_credential(
  p_user_id UUID,
  p_credential_type TEXT,
  p_title TEXT,
  p_issuer_type TEXT,
  p_issuer_name TEXT,
  p_related_record_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credential_id UUID;
  v_verification_code TEXT;
BEGIN
  v_verification_code := generate_credential_verification_code();
  
  INSERT INTO digital_credentials (
    user_id, credential_type, title, issuer_type, issuer_name,
    related_record_id, issue_date, verification_code
  )
  VALUES (
    p_user_id, p_credential_type, p_title, p_issuer_type, p_issuer_name,
    p_related_record_id, CURRENT_DATE, v_verification_code
  )
  RETURNING id INTO v_credential_id;
  
  -- Notify user
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    p_user_id, 'credential_issued', 'New Credential Issued',
    'You have received a new credential: ' || p_title,
    jsonb_build_object('credential_id', v_credential_id, 'verification_code', v_verification_code)
  );
  
  RETURN v_credential_id;
END;
$$;

-- Trigger to update timestamps
CREATE TRIGGER update_government_bodies_updated_at BEFORE UPDATE ON public.government_bodies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_government_users_updated_at BEFORE UPDATE ON public.government_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_government_reports_updated_at BEFORE UPDATE ON public.government_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_academic_records_updated_at BEFORE UPDATE ON public.academic_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_digital_credentials_updated_at BEFORE UPDATE ON public.digital_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_country_policies_updated_at BEFORE UPDATE ON public.country_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_international_institutions_updated_at BEFORE UPDATE ON public.international_institutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_governance_roles_updated_at BEFORE UPDATE ON public.governance_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_governance_assignments_updated_at BEFORE UPDATE ON public.governance_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_data_escrow_updated_at BEFORE UPDATE ON public.data_escrow
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_national_insights_updated_at BEFORE UPDATE ON public.national_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_infrastructure_contracts_updated_at BEFORE UPDATE ON public.infrastructure_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_data_access_requests_updated_at BEFORE UPDATE ON public.data_access_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();