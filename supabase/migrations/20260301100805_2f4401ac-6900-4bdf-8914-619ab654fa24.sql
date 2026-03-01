
-- Compliance Audit Log (Immutable, append-only)
CREATE TABLE IF NOT EXISTS public.compliance_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id),
  actor_role TEXT,
  institution_id UUID,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  previous_state_hash TEXT,
  new_state_hash TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance_audit_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated read compliance log" ON public.compliance_audit_log FOR SELECT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated insert compliance log" ON public.compliance_audit_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_compliance_log_actor ON public.compliance_audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_log_inst ON public.compliance_audit_log(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_log_entity ON public.compliance_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_log_action ON public.compliance_audit_log(action_type);

-- Regulatory Reports
CREATE TABLE IF NOT EXISTS public.regulatory_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.regulatory_reports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users read own regulatory reports" ON public.regulatory_reports FOR SELECT USING (auth.uid() = generated_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users insert regulatory reports" ON public.regulatory_reports FOR INSERT WITH CHECK (auth.uid() = generated_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_reg_reports_inst ON public.regulatory_reports(institution_id, created_at DESC);

-- Data Access Log
CREATE TABLE IF NOT EXISTS public.data_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  institution_id UUID,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  access_type TEXT NOT NULL DEFAULT 'read',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.data_access_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated read data access log" ON public.data_access_log FOR SELECT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated insert data access log" ON public.data_access_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_data_access_user ON public.data_access_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_access_inst ON public.data_access_log(institution_id, created_at DESC);

-- Archived Entities
CREATE TABLE IF NOT EXISTS public.archived_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  archived_by UUID REFERENCES auth.users(id),
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);
ALTER TABLE public.archived_entities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated read archived" ON public.archived_entities FOR SELECT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated insert archived" ON public.archived_entities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Compliance Health Metrics
CREATE TABLE IF NOT EXISTS public.compliance_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  audit_completeness_score NUMERIC(5,2) DEFAULT 0,
  dispute_transparency_score NUMERIC(5,2) DEFAULT 0,
  review_accountability_score NUMERIC(5,2) DEFAULT 0,
  role_integrity_score NUMERIC(5,2) DEFAULT 0,
  data_access_traceability_score NUMERIC(5,2) DEFAULT 0,
  overall_compliance_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance_health_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated read compliance health" ON public.compliance_health_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_compliance_health_inst ON public.compliance_health_metrics(institution_id, generated_at DESC);

-- Policy Acknowledgments
CREATE TABLE IF NOT EXISTS public.policy_acknowledgments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID,
  policy_version TEXT NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, policy_version)
);
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users read own acknowledgments" ON public.policy_acknowledgments FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users insert own acknowledgments" ON public.policy_acknowledgments FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_policy_ack_user ON public.policy_acknowledgments(user_id);

-- Compliance Flags
CREATE TABLE IF NOT EXISTS public.compliance_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  description TEXT,
  institution_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance_flags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated read compliance flags" ON public.compliance_flags FOR SELECT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_compliance_flags_entity ON public.compliance_flags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_flags_inst ON public.compliance_flags(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_flags_severity ON public.compliance_flags(severity);
