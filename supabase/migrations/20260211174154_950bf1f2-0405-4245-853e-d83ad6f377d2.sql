
-- =============================================
-- Global Talent Risk Index (GTRI) Schema
-- =============================================

-- risk_metrics: Core risk scores per entity
CREATE TABLE public.risk_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  trust_volatility NUMERIC DEFAULT 0,
  dispute_spike_rate NUMERIC DEFAULT 0,
  liquidity_distortion NUMERIC DEFAULT 0,
  capital_concentration_index NUMERIC DEFAULT 0,
  pricing_anomaly_score NUMERIC DEFAULT 0,
  centralization_risk NUMERIC DEFAULT 0,
  composite_risk_score NUMERIC DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'stable',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_metrics_entity_type ON public.risk_metrics (entity_type);
CREATE INDEX idx_risk_metrics_entity_id ON public.risk_metrics (entity_id);
CREATE INDEX idx_risk_metrics_composite ON public.risk_metrics (entity_type, entity_id);

ALTER TABLE public.risk_metrics ENABLE ROW LEVEL SECURITY;

-- Admins read all
CREATE POLICY "Admins can read all risk_metrics"
  ON public.risk_metrics FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Authenticated users can read public macro data (skill/region/platform)
CREATE POLICY "Authenticated read public risk_metrics"
  ON public.risk_metrics FOR SELECT TO authenticated
  USING (entity_type IN ('skill', 'region', 'platform'));

-- Admins can insert/update
CREATE POLICY "Admins can insert risk_metrics"
  ON public.risk_metrics FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update risk_metrics"
  ON public.risk_metrics FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- systemic_alerts: Triggered warnings
CREATE TABLE public.systemic_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  description TEXT,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.systemic_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read systemic_alerts"
  ON public.systemic_alerts FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert systemic_alerts"
  ON public.systemic_alerts FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update systemic_alerts"
  ON public.systemic_alerts FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- risk_trends: Historical snapshots
CREATE TABLE public.risk_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  risk_score NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_trends_lookup ON public.risk_trends (entity_type, entity_id, recorded_at);

ALTER TABLE public.risk_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all risk_trends"
  ON public.risk_trends FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated read public risk_trends"
  ON public.risk_trends FOR SELECT TO authenticated
  USING (entity_type IN ('skill', 'region', 'platform'));

CREATE POLICY "Admins can insert risk_trends"
  ON public.risk_trends FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));
