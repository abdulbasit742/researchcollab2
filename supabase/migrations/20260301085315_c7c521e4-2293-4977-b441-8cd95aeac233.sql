
-- MODULE 9: Execution Drift Detection
CREATE TABLE public.execution_drift_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  milestone_velocity_score NUMERIC DEFAULT 0,
  delay_trend_score NUMERIC DEFAULT 0,
  completion_pattern_variance NUMERIC DEFAULT 0,
  anomaly_flag BOOLEAN DEFAULT false,
  drift_severity TEXT DEFAULT 'normal',
  recommendation TEXT,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MODULE 10: Systemic Risk Monitor
CREATE TABLE public.systemic_risk_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  capital_concentration_risk NUMERIC DEFAULT 0,
  dispute_cluster_risk NUMERIC DEFAULT 0,
  execution_instability_score NUMERIC DEFAULT 0,
  governance_pressure_score NUMERIC DEFAULT 0,
  overall_risk_score NUMERIC DEFAULT 0,
  risk_grade TEXT DEFAULT 'B',
  period TEXT,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, period)
);

-- MODULE 11: Capital Allocation Optimizer
CREATE TABLE public.capital_optimization_advice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  recommended_funding_adjustment NUMERIC DEFAULT 0,
  risk_adjusted_score NUMERIC DEFAULT 0,
  execution_confidence_index NUMERIC DEFAULT 0,
  rationale TEXT,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MODULE 12: Institutional Drift Monitor
CREATE TABLE public.institutional_drift_monitor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  trust_score_trend NUMERIC DEFAULT 0,
  execution_quality_trend NUMERIC DEFAULT 0,
  endorsement_integrity_trend NUMERIC DEFAULT 0,
  anomaly_score NUMERIC DEFAULT 0,
  drift_direction TEXT DEFAULT 'stable',
  period TEXT,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id, period)
);

-- RLS
ALTER TABLE public.execution_drift_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systemic_risk_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_optimization_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_drift_monitor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read execution_drift" ON public.execution_drift_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert execution_drift" ON public.execution_drift_analysis FOR INSERT TO authenticated WITH CHECK (auth.uid() = generated_by);
CREATE POLICY "Authenticated read systemic_risk" ON public.systemic_risk_index FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert systemic_risk" ON public.systemic_risk_index FOR INSERT TO authenticated WITH CHECK (auth.uid() = generated_by);
CREATE POLICY "Authenticated read capital_optimization" ON public.capital_optimization_advice FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert capital_optimization" ON public.capital_optimization_advice FOR INSERT TO authenticated WITH CHECK (auth.uid() = generated_by);
CREATE POLICY "Authenticated read institutional_drift" ON public.institutional_drift_monitor FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert institutional_drift" ON public.institutional_drift_monitor FOR INSERT TO authenticated WITH CHECK (auth.uid() = generated_by);

-- Indexes
CREATE INDEX idx_exec_drift_project ON public.execution_drift_analysis(project_id);
CREATE INDEX idx_systemic_risk_inst ON public.systemic_risk_index(institution_id);
CREATE INDEX idx_capital_opt_project ON public.capital_optimization_advice(project_id);
CREATE INDEX idx_inst_drift_inst ON public.institutional_drift_monitor(institution_id);
