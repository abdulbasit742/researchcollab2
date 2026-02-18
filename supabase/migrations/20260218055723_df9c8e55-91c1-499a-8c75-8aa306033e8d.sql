
-- Corporate Alliances
CREATE TABLE public.corporate_alliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  hq_country TEXT NOT NULL,
  participating_nodes UUID[] DEFAULT '{}',
  annual_rnd_commitment NUMERIC DEFAULT 0,
  alliance_tier TEXT NOT NULL DEFAULT 'emerging_corporate' CHECK (alliance_tier IN ('strategic_anchor','innovation_partner','sector_specialist','emerging_corporate')),
  intelligence_subscription_level TEXT DEFAULT 'basic' CHECK (intelligence_subscription_level IN ('basic','professional','enterprise','government')),
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending','verified','suspended')),
  sector_focus TEXT[],
  contact_email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.corporate_alliances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read corporate_alliances" ON public.corporate_alliances FOR SELECT USING (true);

-- Corporate R&D Allocations across nodes
CREATE TABLE public.corporate_rnd_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alliance_id UUID REFERENCES public.corporate_alliances(id) ON DELETE CASCADE NOT NULL,
  node_id UUID REFERENCES public.country_nodes(id),
  sector TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  allocation_period TEXT,
  university_tier_filter TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.corporate_rnd_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rnd_allocations" ON public.corporate_rnd_allocations FOR SELECT USING (true);

-- Corporate Talent Pipeline
CREATE TABLE public.corporate_talent_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alliance_id UUID REFERENCES public.corporate_alliances(id) ON DELETE CASCADE NOT NULL,
  node_id UUID REFERENCES public.country_nodes(id),
  pipeline_type TEXT NOT NULL CHECK (pipeline_type IN ('hiring','internship','scouting','alumni_tracking')),
  sector TEXT,
  positions_available INTEGER DEFAULT 0,
  positions_filled INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.corporate_talent_pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read talent_pipelines" ON public.corporate_talent_pipelines FOR SELECT USING (true);

-- Sector Innovation Tracks (challenges, incubation, capital pools)
CREATE TABLE public.sector_innovation_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alliance_id UUID REFERENCES public.corporate_alliances(id) ON DELETE CASCADE NOT NULL,
  track_type TEXT NOT NULL CHECK (track_type IN ('innovation_challenge','capital_pool','incubation','employment_guarantee')),
  sector TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget NUMERIC DEFAULT 0,
  participating_node_ids UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('draft','active','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sector_innovation_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read innovation_tracks" ON public.sector_innovation_tracks FOR SELECT USING (true);

-- Alliance Performance Metrics
CREATE TABLE public.alliance_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alliance_id UUID REFERENCES public.corporate_alliances(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL,
  capital_deployed NUMERIC DEFAULT 0,
  projects_funded INTEGER DEFAULT 0,
  employment_hires INTEGER DEFAULT 0,
  startup_investments INTEGER DEFAULT 0,
  sector_success_rate NUMERIC,
  risk_exposure NUMERIC,
  roi_proxy NUMERIC,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alliance_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read alliance_perf" ON public.alliance_performance_metrics FOR SELECT USING (true);

-- Alliance Risk Alerts
CREATE TABLE public.alliance_risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alliance_id UUID REFERENCES public.corporate_alliances(id) ON DELETE CASCADE NOT NULL,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('capital_concentration','over_influence','node_dependency','sector_distortion','governance_pressure')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alliance_risk_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read alliance_risk" ON public.alliance_risk_alerts FOR SELECT USING (true);
