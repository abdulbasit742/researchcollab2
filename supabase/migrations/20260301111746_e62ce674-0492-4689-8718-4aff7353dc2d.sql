
-- Milestone lifecycle events (derived read-only view of transitions)
CREATE TABLE IF NOT EXISTS public.milestone_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  actor_id UUID,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  previous_state TEXT,
  new_state TEXT,
  duration_from_previous_ms BIGINT,
  event_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.milestone_lifecycle_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users read lifecycle events"
  ON public.milestone_lifecycle_events FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins insert lifecycle events"
  ON public.milestone_lifecycle_events FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX idx_mle_milestone ON public.milestone_lifecycle_events(milestone_id, event_timestamp);

-- Audit visual exports
CREATE TABLE IF NOT EXISTS public.audit_visual_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID,
  project_id UUID,
  export_type TEXT NOT NULL DEFAULT 'pdf',
  file_url TEXT,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_visual_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own audit exports"
  ON public.audit_visual_exports FOR SELECT TO authenticated
  USING (generated_by = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users create audit exports"
  ON public.audit_visual_exports FOR INSERT TO authenticated
  WITH CHECK (generated_by = auth.uid());

CREATE INDEX idx_ave_project ON public.audit_visual_exports(project_id);
