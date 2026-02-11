
-- ============================================
-- GLOBAL TALENT COMMAND CENTER (GTCC) SCHEMA
-- ============================================

-- Helper function for institution admin check
CREATE OR REPLACE FUNCTION public.is_institution_admin(_user_id uuid, _institution_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE org_id = _institution_id
      AND user_id = _user_id
      AND role IN ('admin', 'owner')
  )
$$;

-- 1. Institutional Talent Snapshots
CREATE TABLE public.institutional_talent_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  total_members INTEGER NOT NULL DEFAULT 0,
  avg_trust_score NUMERIC NOT NULL DEFAULT 0,
  avg_visibility_score NUMERIC NOT NULL DEFAULT 0,
  total_active_deals INTEGER NOT NULL DEFAULT 0,
  total_completed_deals INTEGER NOT NULL DEFAULT 0,
  avg_deal_health NUMERIC NOT NULL DEFAULT 0,
  skill_distribution JSONB NOT NULL DEFAULT '{}',
  income_generated_last_90_days NUMERIC NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_inst_talent_snapshots_inst ON public.institutional_talent_snapshots(institution_id);
CREATE INDEX idx_inst_talent_snapshots_calc ON public.institutional_talent_snapshots(calculated_at DESC);
ALTER TABLE public.institutional_talent_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inst_snapshot_select" ON public.institutional_talent_snapshots FOR SELECT
  USING (public.is_institution_admin(auth.uid(), institution_id) OR public.is_admin(auth.uid()));
CREATE POLICY "inst_snapshot_insert" ON public.institutional_talent_snapshots FOR INSERT
  WITH CHECK (true);

-- 2. Institutional Skill Gaps
CREATE TABLE public.institutional_skill_gaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  demand_index NUMERIC NOT NULL DEFAULT 0,
  supply_index NUMERIC NOT NULL DEFAULT 0,
  gap_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_inst_skill_gaps_inst ON public.institutional_skill_gaps(institution_id);
ALTER TABLE public.institutional_skill_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inst_skill_gaps_select" ON public.institutional_skill_gaps FOR SELECT
  USING (public.is_institution_admin(auth.uid(), institution_id) OR public.is_admin(auth.uid()));
CREATE POLICY "inst_skill_gaps_insert" ON public.institutional_skill_gaps FOR INSERT
  WITH CHECK (true);

-- 3. Talent Forecasts
CREATE TABLE public.talent_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  projected_growth_90_days NUMERIC NOT NULL DEFAULT 0,
  projected_income_90_days NUMERIC NOT NULL DEFAULT 0,
  projected_trust_growth NUMERIC NOT NULL DEFAULT 0,
  risk_alert_level TEXT NOT NULL DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_talent_forecasts_inst ON public.talent_forecasts(institution_id);
CREATE INDEX idx_talent_forecasts_created ON public.talent_forecasts(created_at DESC);
ALTER TABLE public.talent_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "talent_forecasts_select" ON public.talent_forecasts FOR SELECT
  USING (public.is_institution_admin(auth.uid(), institution_id) OR public.is_admin(auth.uid()));
CREATE POLICY "talent_forecasts_insert" ON public.talent_forecasts FOR INSERT
  WITH CHECK (true);

-- 4. Talent Allocation Logs
CREATE TABLE public.talent_allocation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID,
  allocated_user_id UUID,
  allocation_reason TEXT,
  success_outcome BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_talent_alloc_inst ON public.talent_allocation_logs(institution_id);
ALTER TABLE public.talent_allocation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "talent_alloc_select" ON public.talent_allocation_logs FOR SELECT
  USING (public.is_institution_admin(auth.uid(), institution_id) OR public.is_admin(auth.uid()));
CREATE POLICY "talent_alloc_insert" ON public.talent_allocation_logs FOR INSERT
  WITH CHECK (public.is_institution_admin(auth.uid(), institution_id) OR public.is_admin(auth.uid()));

-- 5. Institutional Performance Metrics
CREATE TABLE public.institutional_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  collaboration_score NUMERIC NOT NULL DEFAULT 0,
  reliability_score NUMERIC NOT NULL DEFAULT 0,
  dispute_ratio NUMERIC NOT NULL DEFAULT 0,
  economic_velocity NUMERIC NOT NULL DEFAULT 0,
  knowledge_output_score NUMERIC NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_inst_perf_inst ON public.institutional_performance_metrics(institution_id);
ALTER TABLE public.institutional_performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inst_perf_select" ON public.institutional_performance_metrics FOR SELECT
  USING (public.is_institution_admin(auth.uid(), institution_id) OR public.is_admin(auth.uid()));
CREATE POLICY "inst_perf_insert" ON public.institutional_performance_metrics FOR INSERT
  WITH CHECK (true);
