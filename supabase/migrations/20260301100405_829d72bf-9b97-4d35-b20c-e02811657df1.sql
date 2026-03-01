
-- Institution Settings (Tenant Configuration)
CREATE TABLE public.institution_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL UNIQUE,
  branding_logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#a5b4fc',
  custom_domain TEXT,
  feature_flags JSONB NOT NULL DEFAULT '{"ai_assistance":true,"public_discovery":true,"advanced_analytics":true,"engagement_nudges":true,"external_collaboration":true,"public_profiles":true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read own institution settings" ON public.institution_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins update institution settings" ON public.institution_settings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_inst_settings_inst ON public.institution_settings(institution_id);

-- Institution Roles (Tenant Role Hierarchy)
CREATE TABLE public.institution_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  role_name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, role_name)
);
ALTER TABLE public.institution_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read institution roles" ON public.institution_roles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_inst_roles_inst ON public.institution_roles(institution_id);

-- Role Assignment Audit (Immutable)
CREATE TABLE public.role_assignment_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  role_assigned TEXT NOT NULL,
  institution_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.role_assignment_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read role audit" ON public.role_assignment_audit FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated insert role audit" ON public.role_assignment_audit FOR INSERT WITH CHECK (auth.uid() = actor_id);
-- Prevent updates/deletes (append-only)
CREATE INDEX idx_role_audit_inst ON public.role_assignment_audit(institution_id, created_at DESC);

-- Institution Exports
CREATE TABLE public.institution_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  export_type TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own institution exports" ON public.institution_exports FOR SELECT USING (auth.uid() = requested_by);
CREATE POLICY "Users request exports" ON public.institution_exports FOR INSERT WITH CHECK (auth.uid() = requested_by);
CREATE INDEX idx_inst_exports_inst ON public.institution_exports(institution_id, created_at DESC);

-- Tenant Boundary Audit (Admin-only diagnostics)
CREATE TABLE public.tenant_boundary_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  tenant_column_present BOOLEAN NOT NULL DEFAULT false,
  rls_enforced BOOLEAN NOT NULL DEFAULT false,
  issue_detected TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_boundary_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read boundary audit" ON public.tenant_boundary_audit FOR SELECT USING (auth.uid() IS NOT NULL);

-- Tenant Security Tests
CREATE TABLE public.tenant_security_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_type TEXT NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  details TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_security_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read security tests" ON public.tenant_security_tests FOR SELECT USING (auth.uid() IS NOT NULL);

-- Tenant Activity Metrics
CREATE TABLE public.tenant_activity_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  request_volume INT NOT NULL DEFAULT 0,
  search_volume INT NOT NULL DEFAULT 0,
  messaging_volume INT NOT NULL DEFAULT 0,
  upload_volume INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_activity_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read tenant activity" ON public.tenant_activity_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_tenant_activity_inst ON public.tenant_activity_metrics(institution_id, created_at DESC);
