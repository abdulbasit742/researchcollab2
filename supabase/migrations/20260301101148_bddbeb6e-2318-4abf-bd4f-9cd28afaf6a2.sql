
-- Executive Capital Metrics (derived, read-only)
CREATE TABLE IF NOT EXISTS public.executive_capital_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  total_milestones_funded INT DEFAULT 0,
  total_milestones_completed INT DEFAULT 0,
  funding_velocity_index NUMERIC(5,2) DEFAULT 0,
  release_efficiency_ratio NUMERIC(5,2) DEFAULT 0,
  dispute_financial_ratio NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.executive_capital_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated read executive capital" ON public.executive_capital_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_exec_capital_inst ON public.executive_capital_metrics(institution_id, generated_at DESC);

-- Governance Stability Metrics
CREATE TABLE IF NOT EXISTS public.governance_stability_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  dispute_resolution_speed NUMERIC(5,2) DEFAULT 0,
  review_accountability_score NUMERIC(5,2) DEFAULT 0,
  role_integrity_score NUMERIC(5,2) DEFAULT 0,
  anomaly_rate NUMERIC(5,2) DEFAULT 0,
  audit_log_completeness NUMERIC(5,2) DEFAULT 0,
  overall_stability_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_stability_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated read governance stability" ON public.governance_stability_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_gov_stability_inst ON public.governance_stability_metrics(institution_id, generated_at DESC);

-- Board Report Exports
CREATE TABLE IF NOT EXISTS public.board_report_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  report_type TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.board_report_exports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users read own board exports" ON public.board_report_exports FOR SELECT USING (auth.uid() = generated_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users insert board exports" ON public.board_report_exports FOR INSERT WITH CHECK (auth.uid() = generated_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_board_exports_inst ON public.board_report_exports(institution_id, created_at DESC);

-- Department Performance Metrics
CREATE TABLE IF NOT EXISTS public.department_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  department_id UUID NOT NULL,
  department_name TEXT,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  review_turnaround NUMERIC(8,2) DEFAULT 0,
  dispute_ratio NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.department_performance_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated read dept metrics" ON public.department_performance_metrics FOR SELECT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_dept_perf_inst ON public.department_performance_metrics(institution_id, generated_at DESC);

-- Executive Predictions (Advisory)
CREATE TABLE IF NOT EXISTS public.executive_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  predicted_completion_rate_next_quarter NUMERIC(5,2),
  predicted_dispute_risk NUMERIC(5,2),
  predicted_engagement_trend NUMERIC(5,2),
  confidence_score NUMERIC(5,2),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.executive_predictions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated read predictions" ON public.executive_predictions FOR SELECT USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_exec_predictions_inst ON public.executive_predictions(institution_id, generated_at DESC);
