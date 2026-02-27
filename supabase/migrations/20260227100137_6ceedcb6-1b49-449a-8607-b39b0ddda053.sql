
-- =====================================================
-- PROMPT 13: GLOBAL ACADEMIC INTEGRITY & DEFENSE ENGINE (GAIDE)
-- =====================================================

-- 1. Citation Integrity Flags
CREATE TABLE IF NOT EXISTS public.citation_integrity_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  self_citation_ratio NUMERIC DEFAULT 0,
  ring_cluster_size INTEGER DEFAULT 0,
  reciprocal_inflation_score NUMERIC DEFAULT 0,
  suspicious_citation_count INTEGER DEFAULT 0,
  citation_integrity_adjustment NUMERIC DEFAULT 0,
  evidence JSONB DEFAULT '{}',
  explanation TEXT,
  reviewed BOOLEAN DEFAULT false,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  appeal_status TEXT DEFAULT 'none',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Co-Author Inflation Flags
CREATE TABLE IF NOT EXISTS public.coauthor_inflation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  avg_team_size NUMERIC DEFAULT 0,
  contribution_balance_score NUMERIC DEFAULT 0,
  honorary_authorship_signals INTEGER DEFAULT 0,
  evidence JSONB DEFAULT '{}',
  explanation TEXT,
  reviewed BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Grant Misuse Flags
CREATE TABLE IF NOT EXISTS public.grant_misuse_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id TEXT NOT NULL,
  researcher_id TEXT,
  institution_id TEXT,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  budget_variance_pct NUMERIC DEFAULT 0,
  deliverable_overlap_count INTEGER DEFAULT 0,
  escrow_irregularity_count INTEGER DEFAULT 0,
  evidence JSONB DEFAULT '{}',
  explanation TEXT,
  reviewed BOOLEAN DEFAULT false,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Patent Inflation Flags
CREATE TABLE IF NOT EXISTS public.patent_inflation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  patent_without_licensing_count INTEGER DEFAULT 0,
  fragmentation_score NUMERIC DEFAULT 0,
  shell_startup_signals INTEGER DEFAULT 0,
  revenue_inconsistency NUMERIC DEFAULT 0,
  evidence JSONB DEFAULT '{}',
  explanation TEXT,
  patent_quality_adjustment NUMERIC DEFAULT 0,
  reviewed BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Institutional Integrity Risk Index
CREATE TABLE IF NOT EXISTS public.institutional_integrity_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id TEXT NOT NULL,
  period TEXT,
  citation_ring_score NUMERIC DEFAULT 0,
  grant_inflation_score NUMERIC DEFAULT 0,
  compliance_concealment_score NUMERIC DEFAULT 0,
  domain_concentration_risk NUMERIC DEFAULT 0,
  funding_concentration_risk NUMERIC DEFAULT 0,
  escrow_breach_frequency NUMERIC DEFAULT 0,
  reputation_inflation_score NUMERIC DEFAULT 0,
  ranking_gaming_score NUMERIC DEFAULT 0,
  overall_iiri NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Journal Risk Profiles
CREATE TABLE IF NOT EXISTS public.journal_risk_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_name TEXT NOT NULL,
  issn TEXT,
  citation_cartel_density NUMERIC DEFAULT 0,
  retraction_frequency NUMERIC DEFAULT 0,
  self_citation_ratio NUMERIC DEFAULT 0,
  author_concentration NUMERIC DEFAULT 0,
  peer_review_anomaly_score NUMERIC DEFAULT 0,
  rapid_acceptance_ratio NUMERIC DEFAULT 0,
  conflict_of_interest_score NUMERIC DEFAULT 0,
  overall_risk_score NUMERIC DEFAULT 0,
  risk_tier TEXT DEFAULT 'low',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Reputation Volatility Events
CREATE TABLE IF NOT EXISTS public.reputation_volatility_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  metric_name TEXT NOT NULL,
  previous_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  change_pct NUMERIC DEFAULT 0,
  explanation TEXT,
  triggered_review BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Open Science Fraud Flags
CREATE TABLE IF NOT EXISTS public.open_science_fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  evidence JSONB DEFAULT '{}',
  explanation TEXT,
  impact_score_adjustment NUMERIC DEFAULT 0,
  reviewed BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Integrity Appeal Workflows
CREATE TABLE IF NOT EXISTS public.integrity_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_table TEXT NOT NULL,
  flag_id UUID NOT NULL,
  appellant_type TEXT NOT NULL,
  appellant_id TEXT NOT NULL,
  appeal_reason TEXT NOT NULL,
  evidence_submitted JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted',
  assigned_reviewer TEXT,
  review_committee JSONB DEFAULT '{}',
  decision TEXT,
  decision_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ,
  transparency_record JSONB DEFAULT '{}'
);

-- 10. Integrity Confidence Scores
CREATE TABLE IF NOT EXISTS public.integrity_confidence_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  citation_integrity NUMERIC DEFAULT 1,
  funding_integrity NUMERIC DEFAULT 1,
  compliance_reliability NUMERIC DEFAULT 1,
  commercialization_authenticity NUMERIC DEFAULT 1,
  collaboration_transparency NUMERIC DEFAULT 1,
  open_science_credibility NUMERIC DEFAULT 1,
  overall_ics NUMERIC DEFAULT 1,
  breakdown JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Network Collusion Flags
CREATE TABLE IF NOT EXISTS public.network_collusion_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id TEXT NOT NULL,
  involved_entities JSONB NOT NULL DEFAULT '[]',
  collusion_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  graph_evidence JSONB DEFAULT '{}',
  explanation TEXT,
  reviewed BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.citation_integrity_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coauthor_inflation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_misuse_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patent_inflation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_integrity_risk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_volatility_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_science_fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_confidence_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_collusion_flags ENABLE ROW LEVEL SECURITY;

-- RLS: Auth read
CREATE POLICY "Auth read citation_integrity" ON public.citation_integrity_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read coauthor_inflation" ON public.coauthor_inflation_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read grant_misuse" ON public.grant_misuse_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read patent_inflation" ON public.patent_inflation_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read institutional_integrity" ON public.institutional_integrity_risk FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read journal_risk" ON public.journal_risk_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read reputation_volatility" ON public.reputation_volatility_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read open_science_fraud" ON public.open_science_fraud_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read integrity_appeals" ON public.integrity_appeals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read integrity_scores" ON public.integrity_confidence_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read network_collusion" ON public.network_collusion_flags FOR SELECT TO authenticated USING (true);

-- RLS: Auth insert
CREATE POLICY "Auth insert citation_integrity" ON public.citation_integrity_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert coauthor_inflation" ON public.coauthor_inflation_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert grant_misuse" ON public.grant_misuse_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert patent_inflation" ON public.patent_inflation_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert institutional_integrity" ON public.institutional_integrity_risk FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert journal_risk" ON public.journal_risk_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert reputation_volatility" ON public.reputation_volatility_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert open_science_fraud" ON public.open_science_fraud_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert integrity_appeals" ON public.integrity_appeals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert integrity_scores" ON public.integrity_confidence_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert network_collusion" ON public.network_collusion_flags FOR INSERT TO authenticated WITH CHECK (true);

-- Auth update for appeals
CREATE POLICY "Auth update integrity_appeals" ON public.integrity_appeals FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
