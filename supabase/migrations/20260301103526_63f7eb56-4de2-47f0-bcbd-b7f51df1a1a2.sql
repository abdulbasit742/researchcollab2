
-- Governance Anomaly Detection
CREATE TABLE IF NOT EXISTS public.governance_anomaly_detection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  institution_id UUID,
  anomaly_type TEXT NOT NULL,
  anomaly_score NUMERIC(5,2) DEFAULT 0,
  severity_level TEXT DEFAULT 'low',
  explanation TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_anomaly_detection ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read gov anomalies" ON public.governance_anomaly_detection FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_gov_anomaly_entity ON public.governance_anomaly_detection(entity_type, entity_id, detected_at DESC);

-- Review Integrity Metrics
CREATE TABLE IF NOT EXISTS public.review_integrity_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  institution_id UUID,
  approval_rate NUMERIC(5,2) DEFAULT 0,
  rejection_rate NUMERIC(5,2) DEFAULT 0,
  average_review_time NUMERIC(10,2) DEFAULT 0,
  variance_score NUMERIC(5,2) DEFAULT 0,
  bias_risk_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.review_integrity_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read review integrity" ON public.review_integrity_metrics FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_review_integrity_reviewer ON public.review_integrity_metrics(reviewer_id, generated_at DESC);

-- Approval Pattern Analysis
CREATE TABLE IF NOT EXISTS public.approval_pattern_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID,
  institution_id UUID,
  approval_frequency INT DEFAULT 0,
  approval_time_distribution JSONB DEFAULT '{}',
  anomaly_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.approval_pattern_analysis ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read approval patterns" ON public.approval_pattern_analysis FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Dispute Pattern Intelligence
CREATE TABLE IF NOT EXISTS public.dispute_pattern_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  dispute_rate_trend NUMERIC(5,2) DEFAULT 0,
  clustering_score NUMERIC(5,2) DEFAULT 0,
  repeat_dispute_pairs JSONB DEFAULT '[]',
  escalation_pattern_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dispute_pattern_intelligence ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read dispute patterns" ON public.dispute_pattern_intelligence FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Endorsement Integrity Analysis
CREATE TABLE IF NOT EXISTS public.endorsement_integrity_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  institution_id UUID,
  endorsement_density NUMERIC(5,2) DEFAULT 0,
  circular_endorsement_score NUMERIC(5,2) DEFAULT 0,
  anomaly_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.endorsement_integrity_analysis ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read endorsement integrity" ON public.endorsement_integrity_analysis FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Governance Stability Index
CREATE TABLE IF NOT EXISTS public.governance_stability_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  anomaly_density NUMERIC(5,2) DEFAULT 0,
  review_integrity_score NUMERIC(5,2) DEFAULT 0,
  dispute_stability_score NUMERIC(5,2) DEFAULT 0,
  role_integrity_score NUMERIC(5,2) DEFAULT 0,
  overall_governance_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_stability_index ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read gov stability" ON public.governance_stability_index FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_gov_stability_inst ON public.governance_stability_index(institution_id, generated_at DESC);

-- Governance Transparency Reports
CREATE TABLE IF NOT EXISTS public.governance_transparency_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  anomaly_summary JSONB DEFAULT '{}',
  integrity_metrics JSONB DEFAULT '{}',
  review_patterns JSONB DEFAULT '{}',
  dispute_patterns JSONB DEFAULT '{}',
  file_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_transparency_reports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read gov reports" ON public.governance_transparency_reports FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Behavioral Drift Monitor
CREATE TABLE IF NOT EXISTS public.behavioral_drift_monitor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  institution_id UUID,
  baseline_behavior_score NUMERIC(5,2) DEFAULT 0,
  current_behavior_score NUMERIC(5,2) DEFAULT 0,
  drift_percentage NUMERIC(5,2) DEFAULT 0,
  risk_flag TEXT DEFAULT 'none',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.behavioral_drift_monitor ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read behavioral drift" ON public.behavioral_drift_monitor FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_behavioral_drift_entity ON public.behavioral_drift_monitor(entity_type, entity_id, generated_at DESC);
