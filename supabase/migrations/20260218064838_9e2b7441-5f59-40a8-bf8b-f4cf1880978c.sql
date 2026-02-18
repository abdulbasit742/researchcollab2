
-- Strategic expansion phases
CREATE TABLE public.strategic_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_number INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  objectives JSONB DEFAULT '[]'::jsonb,
  targets JSONB DEFAULT '[]'::jsonb,
  focus_statement TEXT,
  progress_pct NUMERIC DEFAULT 0,
  capital_strategy TEXT,
  organizational_model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.strategic_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage strategic phases" ON public.strategic_phases FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view phases" ON public.strategic_phases FOR SELECT USING (auth.uid() IS NOT NULL);

-- Moat pillars tracking over time
CREATE TABLE public.strategic_moat_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pillar_name TEXT NOT NULL,
  pillar_category TEXT NOT NULL,
  current_depth_score NUMERIC DEFAULT 0,
  replicability_risk TEXT DEFAULT 'medium',
  time_to_replicate_years NUMERIC DEFAULT 0,
  data_points_accumulated BIGINT DEFAULT 0,
  switching_cost_index NUMERIC DEFAULT 0,
  phase_id UUID REFERENCES public.strategic_phases(id),
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.strategic_moat_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage moat tracking" ON public.strategic_moat_tracking FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view moat tracking" ON public.strategic_moat_tracking FOR SELECT USING (auth.uid() IS NOT NULL);

-- Strategic risk registry
CREATE TABLE public.strategic_risk_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_category TEXT NOT NULL,
  risk_name TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  likelihood TEXT NOT NULL DEFAULT 'medium',
  mitigation_strategy TEXT,
  monitoring_metric TEXT,
  last_audit_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  phase_id UUID REFERENCES public.strategic_phases(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.strategic_risk_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage risk registry" ON public.strategic_risk_registry FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view risk registry" ON public.strategic_risk_registry FOR SELECT USING (auth.uid() IS NOT NULL);

-- Phase milestones / KPI targets
CREATE TABLE public.strategic_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_id UUID NOT NULL REFERENCES public.strategic_phases(id),
  milestone_name TEXT NOT NULL,
  target_value TEXT,
  current_value TEXT,
  metric_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.strategic_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage milestones" ON public.strategic_milestones FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Authenticated users can view milestones" ON public.strategic_milestones FOR SELECT USING (auth.uid() IS NOT NULL);
