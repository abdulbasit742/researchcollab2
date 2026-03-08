
-- AI Marketing Engine & Growth Engine tables

CREATE TABLE public.omni_marketing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],
  target_audience TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  engagement_metrics JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.omni_content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.omni_marketing_content(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  channel TEXT NOT NULL,
  slot_time TEXT,
  status TEXT DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.omni_growth_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  channel TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  value NUMERIC DEFAULT 0,
  previous_value NUMERIC DEFAULT 0,
  change_pct NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.omni_growth_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name TEXT NOT NULL,
  hypothesis TEXT,
  channel TEXT,
  variant_a TEXT,
  variant_b TEXT,
  status TEXT DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  results JSONB DEFAULT '{}',
  winner TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.omni_marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omni_growth_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_marketing" ON public.omni_marketing_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_marketing" ON public.omni_marketing_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_marketing" ON public.omni_marketing_content FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_read_calendar" ON public.omni_content_calendar FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_calendar" ON public.omni_content_calendar FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_read_growth_metrics" ON public.omni_growth_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_growth_metrics" ON public.omni_growth_metrics FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_read_experiments" ON public.omni_growth_experiments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_experiments" ON public.omni_growth_experiments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_experiments" ON public.omni_growth_experiments FOR UPDATE TO authenticated USING (true);

CREATE INDEX idx_marketing_status ON public.omni_marketing_content(status);
CREATE INDEX idx_calendar_date ON public.omni_content_calendar(scheduled_date);
CREATE INDEX idx_growth_metrics_type ON public.omni_growth_metrics(metric_type, period_start);
