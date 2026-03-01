
-- Milestone Certifications (append-only)
CREATE TABLE IF NOT EXISTS public.milestone_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL,
  certified_by UUID NOT NULL REFERENCES auth.users(id),
  institution_id UUID,
  certification_type TEXT NOT NULL DEFAULT 'completion',
  certification_score NUMERIC(5,2) DEFAULT 0,
  certification_notes TEXT,
  verification_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.milestone_certifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read milestone certs" ON public.milestone_certifications FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth insert milestone certs" ON public.milestone_certifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_ms_certs_milestone ON public.milestone_certifications(milestone_id);
CREATE INDEX IF NOT EXISTS idx_ms_certs_hash ON public.milestone_certifications(verification_hash);

-- Project Execution Certificates
CREATE TABLE IF NOT EXISTS public.project_execution_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  institution_id UUID,
  completion_score NUMERIC(5,2) DEFAULT 0,
  review_quality_score NUMERIC(5,2) DEFAULT 0,
  dispute_ratio NUMERIC(5,2) DEFAULT 0,
  execution_stability_score NUMERIC(5,2) DEFAULT 0,
  issued_by UUID NOT NULL REFERENCES auth.users(id),
  certificate_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_execution_certificates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read project certs" ON public.project_execution_certificates FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth insert project certs" ON public.project_execution_certificates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_proj_certs_project ON public.project_execution_certificates(project_id);
CREATE INDEX IF NOT EXISTS idx_proj_certs_hash ON public.project_execution_certificates(certificate_hash);

-- Institution Accreditation Levels
CREATE TABLE IF NOT EXISTS public.institution_accreditation_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  accreditation_tier TEXT NOT NULL DEFAULT 'Bronze',
  completion_rate NUMERIC(5,2) DEFAULT 0,
  governance_score NUMERIC(5,2) DEFAULT 0,
  compliance_score NUMERIC(5,2) DEFAULT 0,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE public.institution_accreditation_levels ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read accreditation levels" ON public.institution_accreditation_levels FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_accred_levels_inst ON public.institution_accreditation_levels(institution_id, issued_at DESC);

-- User Execution Credentials
CREATE TABLE IF NOT EXISTS public.user_execution_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  institution_id UUID,
  credential_type TEXT NOT NULL,
  milestones_completed INT DEFAULT 0,
  review_score_average NUMERIC(5,2) DEFAULT 0,
  on_time_completion_rate NUMERIC(5,2) DEFAULT 0,
  credential_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_execution_credentials ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read user credentials" ON public.user_execution_credentials FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth insert user credentials" ON public.user_execution_credentials FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_user_creds_user ON public.user_execution_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_creds_hash ON public.user_execution_credentials(credential_hash);

-- Certification Audit Log (append-only, no UPDATE/DELETE)
CREATE TABLE IF NOT EXISTS public.certification_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT,
  institution_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certification_audit_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read cert audit" ON public.certification_audit_log FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth insert cert audit" ON public.certification_audit_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_cert_audit_entity ON public.certification_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_cert_audit_inst ON public.certification_audit_log(institution_id, created_at DESC);
