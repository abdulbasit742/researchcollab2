
-- Institution Departments
CREATE TABLE IF NOT EXISTS public.institution_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  department_name TEXT NOT NULL,
  department_code TEXT,
  head_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_departments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read departments" ON public.institution_departments FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth insert departments" ON public.institution_departments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_departments_inst ON public.institution_departments(institution_id);

-- Bulk User Import Jobs
CREATE TABLE IF NOT EXISTS public.bulk_user_import_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  file_url TEXT,
  total_rows INT DEFAULT 0,
  processed_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  error_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.bulk_user_import_jobs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read import jobs" ON public.bulk_user_import_jobs FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth insert import jobs" ON public.bulk_user_import_jobs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Institution Onboarding Status
CREATE TABLE IF NOT EXISTS public.institution_onboarding_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL UNIQUE,
  setup_stage TEXT NOT NULL DEFAULT 'initial',
  departments_configured BOOLEAN DEFAULT false,
  roles_assigned BOOLEAN DEFAULT false,
  projects_created BOOLEAN DEFAULT false,
  first_milestone_completed BOOLEAN DEFAULT false,
  first_certification_issued BOOLEAN DEFAULT false,
  first_analytics_reviewed BOOLEAN DEFAULT false,
  adoption_rate NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_onboarding_status ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read onboarding status" ON public.institution_onboarding_status FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth upsert onboarding status" ON public.institution_onboarding_status FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth update onboarding status" ON public.institution_onboarding_status FOR UPDATE USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Institution Adoption Metrics
CREATE TABLE IF NOT EXISTS public.institution_adoption_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  active_users_7d INT DEFAULT 0,
  active_projects_7d INT DEFAULT 0,
  milestone_creation_rate NUMERIC(5,2) DEFAULT 0,
  review_completion_rate NUMERIC(5,2) DEFAULT 0,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_adoption_metrics ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read adoption metrics" ON public.institution_adoption_metrics FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_adoption_metrics_inst ON public.institution_adoption_metrics(institution_id, generated_at DESC);

-- Institution Rollout Phases
CREATE TABLE IF NOT EXISTS public.institution_rollout_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  phase_name TEXT NOT NULL,
  phase_status TEXT NOT NULL DEFAULT 'pending',
  start_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_rollout_phases ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read rollout phases" ON public.institution_rollout_phases FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth insert rollout phases" ON public.institution_rollout_phases FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Auth update rollout phases" ON public.institution_rollout_phases FOR UPDATE USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Institution Expansion Health
CREATE TABLE IF NOT EXISTS public.institution_expansion_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  adoption_score NUMERIC(5,2) DEFAULT 0,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  execution_score NUMERIC(5,2) DEFAULT 0,
  governance_score NUMERIC(5,2) DEFAULT 0,
  overall_expansion_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_expansion_health ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read expansion health" ON public.institution_expansion_health FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_expansion_health_inst ON public.institution_expansion_health(institution_id, generated_at DESC);

-- Institution Growth Forecast
CREATE TABLE IF NOT EXISTS public.institution_growth_forecast (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  predicted_active_users_30d INT DEFAULT 0,
  predicted_project_growth NUMERIC(5,2) DEFAULT 0,
  predicted_completion_trend NUMERIC(5,2) DEFAULT 0,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_growth_forecast ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Auth read growth forecast" ON public.institution_growth_forecast FOR SELECT USING (auth.uid() IS NOT NULL); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_growth_forecast_inst ON public.institution_growth_forecast(institution_id, generated_at DESC);
