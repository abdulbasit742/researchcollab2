
-- Intelligence scores cache table
CREATE TABLE public.intelligence_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'deal', 'fyp_topic', 'user', 'platform'
  entity_id UUID NOT NULL,
  score_type TEXT NOT NULL, -- 'deal_health', 'funding_likelihood', 'trust_prediction', 'sponsor_match', 'hiring_propensity', 'capital_velocity', 'anomaly'
  health_level TEXT, -- 'green', 'yellow', 'red'
  scores JSONB NOT NULL DEFAULT '{}',
  factors JSONB DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '1 hour',
  UNIQUE(entity_type, entity_id, score_type)
);

-- Enable RLS
ALTER TABLE public.intelligence_scores ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users
CREATE POLICY "Authenticated users can read intelligence scores"
ON public.intelligence_scores FOR SELECT
TO authenticated
USING (true);

-- No client-side writes - only edge function with service_role
CREATE POLICY "Service role can manage intelligence scores"
ON public.intelligence_scores FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Anomaly alerts table
CREATE TABLE public.intelligence_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anomaly_type TEXT NOT NULL, -- 'trust_spike', 'funding_anomaly', 'escrow_inconsistency', 'dispute_pattern', 'multi_account'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  entity_type TEXT NOT NULL,
  entity_id UUID,
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.intelligence_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read anomalies"
ON public.intelligence_anomalies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role manages anomalies"
ON public.intelligence_anomalies FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_intelligence_scores_entity ON public.intelligence_scores(entity_type, entity_id, score_type);
CREATE INDEX idx_intelligence_scores_health ON public.intelligence_scores(score_type, health_level);
CREATE INDEX idx_intelligence_anomalies_unresolved ON public.intelligence_anomalies(resolved, severity) WHERE resolved = false;
