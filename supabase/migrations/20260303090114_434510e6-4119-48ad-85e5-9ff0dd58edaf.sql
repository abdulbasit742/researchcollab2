
-- Incident Registry
CREATE TABLE public.incident_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type TEXT NOT NULL DEFAULT 'other',
  severity_level TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT,
  detected_by TEXT NOT NULL DEFAULT 'system',
  institution_id UUID,
  node_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.incident_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read incidents" ON public.incident_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert incidents" ON public.incident_registry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update incidents" ON public.incident_registry FOR UPDATE TO authenticated USING (true);

-- Incident Status History
CREATE TABLE public.incident_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incident_registry(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incident_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read status history" ON public.incident_status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert status history" ON public.incident_status_history FOR INSERT TO authenticated WITH CHECK (true);

-- Incident Metrics
CREATE TABLE public.incident_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incident_registry(id) ON DELETE CASCADE,
  time_to_detection_minutes INT,
  time_to_mitigation_minutes INT,
  time_to_resolution_minutes INT,
  affected_users_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incident_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read incident metrics" ON public.incident_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert incident metrics" ON public.incident_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- Operational Runbooks
CREATE TABLE public.operational_runbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  runbook_name TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity_level TEXT NOT NULL DEFAULT 'medium',
  step_sequence JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.operational_runbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read runbooks" ON public.operational_runbooks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage runbooks" ON public.operational_runbooks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Incident Runbook Links
CREATE TABLE public.incident_runbook_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incident_registry(id) ON DELETE CASCADE,
  runbook_id UUID NOT NULL REFERENCES public.operational_runbooks(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incident_runbook_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read links" ON public.incident_runbook_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert links" ON public.incident_runbook_links FOR INSERT TO authenticated WITH CHECK (true);

-- Incident Acknowledgments
CREATE TABLE public.incident_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incident_registry(id) ON DELETE CASCADE,
  acknowledged_by UUID NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incident_acknowledgments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read acks" ON public.incident_acknowledgments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert acks" ON public.incident_acknowledgments FOR INSERT TO authenticated WITH CHECK (true);

-- Incident Postmortems
CREATE TABLE public.incident_postmortems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incident_registry(id) ON DELETE CASCADE,
  root_cause_summary TEXT,
  contributing_factors TEXT,
  resolution_summary TEXT,
  preventive_actions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incident_postmortems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read postmortems" ON public.incident_postmortems FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage postmortems" ON public.incident_postmortems FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Incident Reports
CREATE TABLE public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incident_registry(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL DEFAULT 'summary',
  file_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read incident reports" ON public.incident_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert incident reports" ON public.incident_reports FOR INSERT TO authenticated WITH CHECK (true);
