
-- Phase 1: SLA Definition Table
CREATE TABLE IF NOT EXISTS public.institution_sla_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sla_type TEXT NOT NULL CHECK (sla_type IN ('review_turnaround', 'milestone_completion', 'dispute_resolution', 'response_time')),
  target_hours NUMERIC NOT NULL DEFAULT 24,
  warning_threshold_percent NUMERIC NOT NULL DEFAULT 80,
  breach_threshold_percent NUMERIC NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, sla_type)
);

ALTER TABLE public.institution_sla_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution admins manage SLA definitions"
  ON public.institution_sla_definitions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Phase 2: SLA Performance Metrics
CREATE TABLE IF NOT EXISTS public.sla_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sla_type TEXT NOT NULL,
  avg_actual_hours NUMERIC DEFAULT 0,
  compliance_rate_percent NUMERIC DEFAULT 100,
  warning_rate_percent NUMERIC DEFAULT 0,
  breach_rate_percent NUMERIC DEFAULT 0,
  measured_period TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sla_performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read SLA metrics"
  ON public.sla_performance_metrics FOR SELECT TO authenticated
  USING (true);

-- Phase 3: SLA Breach Events
CREATE TABLE IF NOT EXISTS public.sla_breach_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  sla_type TEXT NOT NULL,
  breach_level TEXT NOT NULL CHECK (breach_level IN ('warning', 'breach')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.sla_breach_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read breach events"
  ON public.sla_breach_events FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "System inserts breach events"
  ON public.sla_breach_events FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Phase 6: SLA Escalation Flags
CREATE TABLE IF NOT EXISTS public.sla_escalation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID,
  severity_level TEXT NOT NULL DEFAULT 'medium',
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.sla_escalation_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read escalation flags"
  ON public.sla_escalation_flags FOR SELECT TO authenticated
  USING (true);

-- Phase 8: SLA Reports
CREATE TABLE IF NOT EXISTS public.sla_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  report_period TEXT NOT NULL,
  file_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sla_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read SLA reports"
  ON public.sla_reports FOR SELECT TO authenticated
  USING (true);

-- Indexes
CREATE INDEX idx_sla_defs_institution ON public.institution_sla_definitions(institution_id);
CREATE INDEX idx_sla_metrics_institution ON public.sla_performance_metrics(institution_id, measured_period);
CREATE INDEX idx_sla_breaches_institution ON public.sla_breach_events(institution_id, detected_at DESC);
CREATE INDEX idx_sla_escalations_institution ON public.sla_escalation_flags(institution_id);
