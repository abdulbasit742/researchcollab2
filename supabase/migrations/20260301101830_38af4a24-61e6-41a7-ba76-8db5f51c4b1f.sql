
-- Execution History Patterns
CREATE TABLE IF NOT EXISTS public.execution_history_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL DEFAULT '{}',
  sample_size INT NOT NULL DEFAULT 0,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.execution_history_patterns ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read exec patterns" ON public.execution_history_patterns FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_exec_patterns_inst ON public.execution_history_patterns(institution_id, pattern_type, generated_at DESC);

-- Adaptive Risk Models
CREATE TABLE IF NOT EXISTS public.adaptive_risk_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  risk_model_version INT NOT NULL DEFAULT 1,
  delay_weight NUMERIC(5,3) DEFAULT 0.25,
  activity_weight NUMERIC(5,3) DEFAULT 0.25,
  review_weight NUMERIC(5,3) DEFAULT 0.25,
  dispute_weight NUMERIC(5,3) DEFAULT 0.25,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adaptive_risk_models ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read risk models" ON public.adaptive_risk_models FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_risk_models_inst ON public.adaptive_risk_models(institution_id, generated_at DESC);

-- Adaptive Optimization Suggestions
CREATE TABLE IF NOT EXISTS public.adaptive_optimization_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  institution_id UUID,
  suggestion_type TEXT NOT NULL,
  suggestion_reason TEXT NOT NULL,
  impact_estimate TEXT,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adaptive_optimization_suggestions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read opt suggestions" ON public.adaptive_optimization_suggestions FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_opt_sugg_proj ON public.adaptive_optimization_suggestions(project_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_opt_sugg_inst ON public.adaptive_optimization_suggestions(institution_id, generated_at DESC);

-- Engagement Adaptive Models
CREATE TABLE IF NOT EXISTS public.engagement_adaptive_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  engagement_factor_weights JSONB NOT NULL DEFAULT '{}',
  retention_risk_score NUMERIC(5,2) DEFAULT 0,
  predicted_dropoff_rate NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.engagement_adaptive_models ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read engagement models" ON public.engagement_adaptive_models FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_engage_models_inst ON public.engagement_adaptive_models(institution_id, generated_at DESC);

-- Performance Drift Analysis
CREATE TABLE IF NOT EXISTS public.performance_drift_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  institution_id UUID,
  baseline_score NUMERIC(7,2) DEFAULT 0,
  current_score NUMERIC(7,2) DEFAULT 0,
  drift_percentage NUMERIC(7,2) DEFAULT 0,
  drift_direction TEXT NOT NULL DEFAULT 'stable',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.performance_drift_analysis ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read drift analysis" ON public.performance_drift_analysis FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_drift_entity ON public.performance_drift_analysis(entity_type, entity_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_drift_inst ON public.performance_drift_analysis(institution_id, generated_at DESC);

-- Adaptive Model Accuracy
CREATE TABLE IF NOT EXISTS public.adaptive_model_accuracy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_type TEXT NOT NULL,
  prediction_id UUID,
  predicted_value NUMERIC(10,4),
  actual_value NUMERIC(10,4),
  accuracy_score NUMERIC(5,2),
  institution_id UUID,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adaptive_model_accuracy ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read model accuracy" ON public.adaptive_model_accuracy FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_model_acc_type ON public.adaptive_model_accuracy(model_type, evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_acc_inst ON public.adaptive_model_accuracy(institution_id, evaluated_at DESC);

-- Institution Learning Summary
CREATE TABLE IF NOT EXISTS public.institution_learning_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  improvement_trend NUMERIC(5,2) DEFAULT 0,
  stability_trend NUMERIC(5,2) DEFAULT 0,
  governance_trend NUMERIC(5,2) DEFAULT 0,
  engagement_trend NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_learning_summary ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read learning summary" ON public.institution_learning_summary FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_learning_inst ON public.institution_learning_summary(institution_id, generated_at DESC);
