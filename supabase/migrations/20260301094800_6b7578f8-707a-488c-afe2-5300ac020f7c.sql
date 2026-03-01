
-- ============================================================
-- Security Infrastructure Tables
-- ============================================================

-- Rate Limit Logs
CREATE TABLE IF NOT EXISTS public.rate_limit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  endpoint text NOT NULL,
  blocked boolean NOT NULL DEFAULT false,
  request_count integer DEFAULT 1,
  window_start timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_user ON public.rate_limit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_endpoint ON public.rate_limit_logs(endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_blocked ON public.rate_limit_logs(blocked) WHERE blocked = true;

ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read rate limit logs"
  ON public.rate_limit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own rate limit logs"
  ON public.rate_limit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Session Audit Logs
CREATE TABLE IF NOT EXISTS public.session_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  login_time timestamptz NOT NULL DEFAULT now(),
  logout_time timestamptz,
  ip_address text,
  device_info text,
  user_agent text,
  suspicious_flag boolean NOT NULL DEFAULT false,
  suspicious_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_audit_user ON public.session_audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_audit_suspicious ON public.session_audit_logs(suspicious_flag) WHERE suspicious_flag = true;

ALTER TABLE public.session_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read session audit"
  ON public.session_audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own session audit"
  ON public.session_audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Security Audit Logs (append-only)
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action_type text NOT NULL,
  entity_type text,
  entity_id text,
  ip_address text,
  user_agent text,
  metadata jsonb,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_actor ON public.security_audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_action ON public.security_audit_logs(action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_severity ON public.security_audit_logs(severity) WHERE severity IN ('warning', 'critical');

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read security audit"
  ON public.security_audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own security audit"
  ON public.security_audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- Prevent UPDATE/DELETE on security audit logs (append-only)
CREATE POLICY "No update security audit"
  ON public.security_audit_logs FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "No delete security audit"
  ON public.security_audit_logs FOR DELETE TO authenticated
  USING (false);

-- Storage Security Logs
CREATE TABLE IF NOT EXISTS public.storage_security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id uuid,
  file_name text,
  mime_verified boolean NOT NULL DEFAULT false,
  size_valid boolean NOT NULL DEFAULT false,
  signature_valid boolean NOT NULL DEFAULT false,
  rejection_reason text,
  checked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_storage_security_artifact ON public.storage_security_logs(artifact_id);
CREATE INDEX IF NOT EXISTS idx_storage_security_invalid ON public.storage_security_logs(mime_verified, size_valid) 
  WHERE mime_verified = false OR size_valid = false;

ALTER TABLE public.storage_security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read storage security"
  ON public.storage_security_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert storage security"
  ON public.storage_security_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- RLS Audit History
CREATE TABLE IF NOT EXISTS public.rls_audit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  issue_detected text,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  checked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rls_audit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read rls audit history"
  ON public.rls_audit_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
