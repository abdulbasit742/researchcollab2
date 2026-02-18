
-- =============================================
-- INSTITUTIONAL COMPLIANCE: GDPR, Audit Reporting, Data Retention
-- =============================================

-- 1. GDPR/Data Rights Request Tracking
CREATE TABLE public.gdpr_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'erasure', 'rectification', 'restriction', 'portability')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'partially_completed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  completion_deadline TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  export_url TEXT,
  export_expires_at TIMESTAMPTZ,
  scope JSONB DEFAULT '{}',
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own GDPR requests" ON public.gdpr_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own GDPR requests" ON public.gdpr_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage GDPR requests" ON public.gdpr_requests
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_gdpr_requests_user ON gdpr_requests(user_id);
CREATE INDEX idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX idx_gdpr_requests_deadline ON gdpr_requests(completion_deadline) WHERE status = 'pending';

-- 2. Consent Records (audit-grade consent tracking)
CREATE TABLE public.consent_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  consent_type TEXT NOT NULL,
  consent_version TEXT NOT NULL DEFAULT '1.0',
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  consent_text_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent" ON public.consent_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can grant consent" ON public.consent_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_consent_user_type ON consent_records(user_id, consent_type);

-- 3. Data Retention Policies
CREATE TABLE public.data_retention_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL UNIQUE,
  retention_days INTEGER NOT NULL,
  deletion_strategy TEXT NOT NULL DEFAULT 'soft_delete' CHECK (deletion_strategy IN ('soft_delete', 'hard_delete', 'anonymize')),
  legal_basis TEXT,
  is_active BOOLEAN DEFAULT true,
  last_enforced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage retention policies" ON public.data_retention_policies
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Anyone can read retention policies" ON public.data_retention_policies
  FOR SELECT USING (true);

-- Seed essential retention policies
INSERT INTO data_retention_policies (table_name, retention_days, deletion_strategy, legal_basis) VALUES
  ('trust_events', 2555, 'anonymize', 'Legitimate interest - platform integrity'),
  ('wallet_transactions', 3650, 'soft_delete', 'Legal obligation - financial records'),
  ('admin_audit_logs', 3650, 'soft_delete', 'Legal obligation - audit trail'),
  ('state_transition_logs', 1825, 'anonymize', 'Legitimate interest - system integrity'),
  ('messages', 365, 'hard_delete', 'Consent - user communication'),
  ('notifications', 90, 'hard_delete', 'Consent - transient data'),
  ('ai_assistant_sessions', 180, 'anonymize', 'Consent - AI interactions');

-- 4. GDPR Data Export Function
CREATE OR REPLACE FUNCTION public.generate_user_data_export(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_export JSONB := '{}';
  v_profile RECORD;
BEGIN
  -- Profile data
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  IF v_profile IS NOT NULL THEN
    v_export := v_export || jsonb_build_object('profile', row_to_json(v_profile));
  END IF;

  -- Trust profile
  v_export := v_export || jsonb_build_object('trust_profile',
    (SELECT COALESCE(row_to_json(t), '{}') FROM user_trust_profiles t WHERE user_id = p_user_id));

  -- Trust events
  v_export := v_export || jsonb_build_object('trust_events',
    (SELECT COALESCE(json_agg(row_to_json(t)), '[]') FROM trust_events t WHERE user_id = p_user_id));

  -- Wallet & transactions
  v_export := v_export || jsonb_build_object('wallets',
    (SELECT COALESCE(json_agg(row_to_json(w)), '[]') FROM wallets w WHERE user_id = p_user_id));
  v_export := v_export || jsonb_build_object('wallet_transactions',
    (SELECT COALESCE(json_agg(row_to_json(wt)), '[]') FROM wallet_transactions wt WHERE user_id = p_user_id));

  -- Offers (sent & received)
  v_export := v_export || jsonb_build_object('offers',
    (SELECT COALESCE(json_agg(row_to_json(o)), '[]') FROM offers o WHERE sender_id = p_user_id OR recipient_id = p_user_id));

  -- Outcomes
  v_export := v_export || jsonb_build_object('outcomes',
    (SELECT COALESCE(json_agg(row_to_json(o)), '[]') FROM outcomes o WHERE user_id = p_user_id));

  -- Knowledge objects
  v_export := v_export || jsonb_build_object('knowledge_objects',
    (SELECT COALESCE(json_agg(row_to_json(k)), '[]') FROM knowledge_objects k WHERE author_id = p_user_id));

  -- Consent records
  v_export := v_export || jsonb_build_object('consent_records',
    (SELECT COALESCE(json_agg(row_to_json(c)), '[]') FROM consent_records c WHERE user_id = p_user_id));

  -- Academic records
  v_export := v_export || jsonb_build_object('academic_records',
    (SELECT COALESCE(json_agg(row_to_json(a)), '[]') FROM academic_records a WHERE user_id = p_user_id));

  -- Log the export
  INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details) VALUES
    ('00000000-0000-0000-0000-000000000000', 'gdpr_data_export', 'user', p_user_id::TEXT,
     jsonb_build_object('exported_at', now(), 'sections', array['profile','trust','wallet','offers','outcomes','knowledge','consent','academic']));

  RETURN v_export;
END;
$$;

-- 5. GDPR Right to Erasure (anonymization, not deletion of financial records)
CREATE OR REPLACE FUNCTION public.process_user_erasure(p_user_id UUID, p_admin_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_results JSONB := '{}';
  v_anon_name TEXT := 'Deleted User ' || LEFT(p_user_id::TEXT, 8);
BEGIN
  -- Verify admin
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Anonymize profile (keep structure for referential integrity)
  UPDATE profiles SET
    full_name = v_anon_name,
    bio = NULL,
    avatar_url = NULL,
    skills = '{}',
    location = NULL,
    phone = NULL,
    university = NULL,
    field_of_study = NULL,
    linkedin_url = NULL,
    github_url = NULL,
    portfolio_url = NULL,
    updated_at = now()
  WHERE id = p_user_id;
  v_results := v_results || jsonb_build_object('profile_anonymized', true);

  -- Anonymize trust events (keep for system integrity, remove PII)
  UPDATE trust_events SET
    evidence_summary = '[REDACTED]',
    evidence_links = NULL
  WHERE user_id = p_user_id;
  v_results := v_results || jsonb_build_object('trust_events_redacted', true);

  -- Delete consent records
  DELETE FROM consent_records WHERE user_id = p_user_id;
  v_results := v_results || jsonb_build_object('consent_deleted', true);

  -- Delete AI sessions
  DELETE FROM ai_assistant_outputs WHERE session_id IN (
    SELECT id FROM ai_assistant_sessions WHERE user_id = p_user_id
  );
  DELETE FROM ai_assistant_sessions WHERE user_id = p_user_id;
  v_results := v_results || jsonb_build_object('ai_sessions_deleted', true);

  -- Mark GDPR request as completed
  UPDATE gdpr_requests SET status = 'completed', processed_at = now(), processed_by = p_admin_id
  WHERE user_id = p_user_id AND request_type = 'erasure' AND status = 'pending';

  -- Freeze trust profile
  UPDATE user_trust_profiles SET is_frozen = true, frozen_reason = 'GDPR erasure', frozen_at = now(), frozen_by = p_admin_id
  WHERE user_id = p_user_id;

  -- Audit log
  INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, details) VALUES
    (p_admin_id, 'gdpr_erasure_processed', 'user', p_user_id::TEXT, v_results);

  RETURN v_results;
END;
$$;

-- 6. Compliance Summary View (for admin reporting)
CREATE OR REPLACE FUNCTION public.get_compliance_summary()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_summary JSONB;
BEGIN
  SELECT jsonb_build_object(
    'gdpr_requests', jsonb_build_object(
      'pending', (SELECT COUNT(*) FROM gdpr_requests WHERE status = 'pending'),
      'overdue', (SELECT COUNT(*) FROM gdpr_requests WHERE status = 'pending' AND completion_deadline < now()),
      'completed_30d', (SELECT COUNT(*) FROM gdpr_requests WHERE status = 'completed' AND processed_at > now() - INTERVAL '30 days'),
      'total', (SELECT COUNT(*) FROM gdpr_requests)
    ),
    'consent_coverage', jsonb_build_object(
      'users_with_consent', (SELECT COUNT(DISTINCT user_id) FROM consent_records WHERE granted = true AND revoked_at IS NULL),
      'total_active_users', (SELECT COUNT(*) FROM profiles WHERE updated_at > now() - INTERVAL '90 days')
    ),
    'audit_trail', jsonb_build_object(
      'total_audit_entries', (SELECT COUNT(*) FROM admin_audit_logs),
      'entries_30d', (SELECT COUNT(*) FROM admin_audit_logs WHERE created_at > now() - INTERVAL '30 days'),
      'unique_admins_30d', (SELECT COUNT(DISTINCT admin_id) FROM admin_audit_logs WHERE created_at > now() - INTERVAL '30 days' AND admin_id != '00000000-0000-0000-0000-000000000000')
    ),
    'data_retention', jsonb_build_object(
      'policies_active', (SELECT COUNT(*) FROM data_retention_policies WHERE is_active = true),
      'tables_covered', (SELECT COUNT(*) FROM data_retention_policies)
    ),
    'trust_integrity', jsonb_build_object(
      'frozen_profiles', (SELECT COUNT(*) FROM user_trust_profiles WHERE is_frozen = true),
      'under_review', (SELECT COUNT(*) FROM user_trust_profiles WHERE is_under_review = true)
    ),
    'generated_at', now()
  ) INTO v_summary;

  RETURN v_summary;
END;
$$;
