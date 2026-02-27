
-- Professional privacy controls
CREATE TABLE IF NOT EXISTS public.professional_privacy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  hide_escrow_amounts boolean DEFAULT true,
  hide_sponsor_names boolean DEFAULT false,
  hide_institutional_relationships boolean DEFAULT false,
  hide_deliverable_artifacts boolean DEFAULT true,
  anonymized_project_mode boolean DEFAULT false,
  restrict_recruiter_access boolean DEFAULT false,
  approve_institutional_reporting boolean DEFAULT false,
  allow_profile_indexing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.professional_privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own privacy" ON public.professional_privacy_settings
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Algorithm transparency registry
CREATE TABLE IF NOT EXISTS public.algorithm_transparency_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_name text NOT NULL UNIQUE,
  algorithm_category text NOT NULL,
  formula_description text NOT NULL,
  influencing_factors jsonb DEFAULT '[]',
  non_influencing_factors jsonb DEFAULT '[]',
  version text DEFAULT '1.0',
  last_updated timestamptz DEFAULT now(),
  is_public boolean DEFAULT true
);

ALTER TABLE public.algorithm_transparency_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Algorithm transparency publicly readable" ON public.algorithm_transparency_registry
  FOR SELECT TO authenticated USING (is_public = true);

-- Security transparency reports
CREATE TABLE IF NOT EXISTS public.security_transparency_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_year integer NOT NULL,
  report_period text NOT NULL,
  security_incident_count integer DEFAULT 0,
  escrow_invariant_breach_count integer DEFAULT 0,
  ledger_reconciliation_success_rate numeric DEFAULT 100,
  dispute_resolution_stats jsonb DEFAULT '{}',
  data_access_violation_attempts integer DEFAULT 0,
  pen_test_summary text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.security_transparency_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Security reports publicly readable" ON public.security_transparency_reports
  FOR SELECT TO authenticated USING (published_at IS NOT NULL);

-- Professional integrity monitoring signals
CREATE TABLE IF NOT EXISTS public.integrity_monitoring_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type text NOT NULL,
  severity text DEFAULT 'medium',
  description text,
  affected_user_id uuid,
  affected_entity_id uuid,
  affected_entity_type text,
  evidence jsonb DEFAULT '{}',
  detection_method text DEFAULT 'automated',
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.integrity_monitoring_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Integrity signals admin only" ON public.integrity_monitoring_signals
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Anti-scraping rate limit logs
CREATE TABLE IF NOT EXISTS public.anti_scraping_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_ip text,
  user_id uuid,
  event_type text NOT NULL,
  endpoint text,
  request_count integer DEFAULT 1,
  blocked boolean DEFAULT false,
  fingerprint_hash text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.anti_scraping_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scraping events admin only" ON public.anti_scraping_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Access control audit trail
CREATE TABLE IF NOT EXISTS public.access_control_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  privilege_level text NOT NULL,
  was_authorized boolean DEFAULT true,
  denial_reason text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.access_control_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access audit admin only" ON public.access_control_audit
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
