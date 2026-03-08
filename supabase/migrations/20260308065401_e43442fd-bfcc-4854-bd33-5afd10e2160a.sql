
-- System 13: AI Research Discovery Engine
CREATE TABLE public.omni_research_discoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  discovery_type TEXT NOT NULL DEFAULT 'trend',
  source_type TEXT NOT NULL DEFAULT 'paper',
  source_url TEXT,
  summary TEXT,
  relevance_score NUMERIC DEFAULT 0,
  research_domain TEXT,
  keywords TEXT[],
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.omni_research_discoveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read on omni_research_discoveries" ON public.omni_research_discoveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on omni_research_discoveries" ON public.omni_research_discoveries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on omni_research_discoveries" ON public.omni_research_discoveries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_omni_research_disc_type ON public.omni_research_discoveries(discovery_type);
CREATE INDEX idx_omni_research_disc_domain ON public.omni_research_discoveries(research_domain);

-- System 14: AI Revenue Engine
CREATE TABLE public.omni_revenue_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_name TEXT NOT NULL,
  stream_type TEXT NOT NULL DEFAULT 'subscription',
  channel TEXT,
  contact_id UUID REFERENCES public.omni_contacts(id),
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  status TEXT NOT NULL DEFAULT 'prospect',
  conversion_source TEXT,
  ai_recommendation TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.omni_revenue_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read on omni_revenue_streams" ON public.omni_revenue_streams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on omni_revenue_streams" ON public.omni_revenue_streams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on omni_revenue_streams" ON public.omni_revenue_streams FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_omni_revenue_type ON public.omni_revenue_streams(stream_type);
CREATE INDEX idx_omni_revenue_status ON public.omni_revenue_streams(status);

-- Revenue forecasts
CREATE TABLE public.omni_revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_period TEXT NOT NULL,
  stream_type TEXT NOT NULL,
  predicted_amount NUMERIC DEFAULT 0,
  actual_amount NUMERIC,
  confidence NUMERIC DEFAULT 0,
  factors JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.omni_revenue_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read on omni_revenue_forecasts" ON public.omni_revenue_forecasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on omni_revenue_forecasts" ON public.omni_revenue_forecasts FOR INSERT TO authenticated WITH CHECK (true);
