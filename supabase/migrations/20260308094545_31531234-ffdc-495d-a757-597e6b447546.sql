
-- Ecosystem Orchestration Layer tables

-- 1. Centralized ecosystem event stream
CREATE TABLE public.eco_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source_system TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  actor_id UUID,
  payload JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'normal',
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_eco_events_type ON public.eco_events(event_type);
CREATE INDEX idx_eco_events_created ON public.eco_events(created_at DESC);
CREATE INDEX idx_eco_events_source ON public.eco_events(source_system);

ALTER TABLE public.eco_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read eco events" ON public.eco_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert eco events" ON public.eco_events FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Opportunity signals detected by orchestration engine
CREATE TABLE public.eco_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  confidence_score NUMERIC DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  source_events UUID[] DEFAULT '{}',
  target_entity_type TEXT,
  target_entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_eco_signals_type ON public.eco_signals(signal_type);
CREATE INDEX idx_eco_signals_status ON public.eco_signals(status);

ALTER TABLE public.eco_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read eco signals" ON public.eco_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert eco signals" ON public.eco_signals FOR INSERT TO authenticated WITH CHECK (true);

-- 3. Collaboration recommendations
CREATE TABLE public.eco_collaboration_recs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rec_type TEXT NOT NULL,
  entity_a_type TEXT NOT NULL,
  entity_a_id TEXT NOT NULL,
  entity_b_type TEXT NOT NULL,
  entity_b_id TEXT NOT NULL,
  match_score NUMERIC DEFAULT 0,
  reasoning TEXT,
  status TEXT DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.eco_collaboration_recs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read eco collab recs" ON public.eco_collaboration_recs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert eco collab recs" ON public.eco_collaboration_recs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update eco collab recs" ON public.eco_collaboration_recs FOR UPDATE TO authenticated USING (true);

-- 4. Ecosystem health snapshots
CREATE TABLE public.eco_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  total_active_projects INTEGER DEFAULT 0,
  total_funding_volume NUMERIC DEFAULT 0,
  institution_participation INTEGER DEFAULT 0,
  project_success_rate NUMERIC DEFAULT 0,
  talent_matches INTEGER DEFAULT 0,
  datasets_published INTEGER DEFAULT 0,
  startups_created INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  overall_health_score NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.eco_health_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read eco health" ON public.eco_health_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert eco health" ON public.eco_health_snapshots FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Ecosystem revenue tracking
CREATE TABLE public.eco_revenue_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL,
  revenue_source TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  growth_rate NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.eco_revenue_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read eco revenue" ON public.eco_revenue_analytics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert eco revenue" ON public.eco_revenue_analytics FOR INSERT TO authenticated WITH CHECK (true);

-- 6. Strategic insight reports
CREATE TABLE public.eco_strategic_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  insights JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  data_sources TEXT[] DEFAULT '{}',
  generated_by TEXT DEFAULT 'ai',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.eco_strategic_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read eco reports" ON public.eco_strategic_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert eco reports" ON public.eco_strategic_reports FOR INSERT TO authenticated WITH CHECK (true);
