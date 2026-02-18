
-- War plan execution phases
CREATE TABLE public.war_plan_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_number INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  month_start INTEGER NOT NULL,
  month_end INTEGER NOT NULL,
  objective TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  targets JSONB DEFAULT '[]'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  kpi_targets JSONB DEFAULT '{}'::jsonb,
  progress_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.war_plan_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage war plan phases" ON public.war_plan_phases FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth users view war plan phases" ON public.war_plan_phases FOR SELECT USING (auth.uid() IS NOT NULL);

-- Weekly war room KPI snapshots
CREATE TABLE public.war_room_kpi_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL,
  phase_id UUID REFERENCES public.war_plan_phases(id),
  sponsor_acquisition_rate NUMERIC DEFAULT 0,
  fyp_onboarding_rate NUMERIC DEFAULT 0,
  escrow_funding_volume NUMERIC DEFAULT 0,
  capital_cycle_time_days NUMERIC DEFAULT 0,
  user_retention_pct NUMERIC DEFAULT 0,
  system_uptime_pct NUMERIC DEFAULT 99.9,
  arbitration_backlog INTEGER DEFAULT 0,
  ai_allocation_accuracy_pct NUMERIC DEFAULT 0,
  startup_survival_pct NUMERIC DEFAULT 0,
  gmv_processed NUMERIC DEFAULT 0,
  deal_completion_rate NUMERIC DEFAULT 0,
  dispute_rate_pct NUMERIC DEFAULT 0,
  employment_conversion_pct NUMERIC DEFAULT 0,
  intelligence_arr NUMERIC DEFAULT 0,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.war_room_kpi_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage kpi snapshots" ON public.war_room_kpi_snapshots FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth users view kpi snapshots" ON public.war_room_kpi_snapshots FOR SELECT USING (auth.uid() IS NOT NULL);

-- Service boundary health tracking
CREATE TABLE public.service_boundary_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  service_domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  latency_ms NUMERIC DEFAULT 0,
  error_rate_pct NUMERIC DEFAULT 0,
  last_health_check TIMESTAMPTZ DEFAULT now(),
  isolation_verified BOOLEAN DEFAULT false,
  scaling_ready BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_boundary_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage service health" ON public.service_boundary_health FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth users view service health" ON public.service_boundary_health FOR SELECT USING (auth.uid() IS NOT NULL);

-- Dominance condition checklist
CREATE TABLE public.dominance_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condition_name TEXT NOT NULL,
  category TEXT NOT NULL,
  target_description TEXT,
  is_met BOOLEAN DEFAULT false,
  evidence TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dominance_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage dominance conditions" ON public.dominance_conditions FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Auth users view dominance conditions" ON public.dominance_conditions FOR SELECT USING (auth.uid() IS NOT NULL);
