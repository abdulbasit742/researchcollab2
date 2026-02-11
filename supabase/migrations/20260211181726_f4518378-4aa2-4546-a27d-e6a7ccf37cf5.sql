
-- PHASE 1: Composite indexes for hot tables
CREATE INDEX IF NOT EXISTS idx_earning_projects_status_created 
  ON public.earning_projects(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_earning_bids_project_created 
  ON public.earning_bids(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_earning_bids_bidder 
  ON public.earning_bids(bidder_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deal_rooms_status_created 
  ON public.deal_rooms(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deal_rooms_buyer 
  ON public.deal_rooms(buyer_id);

CREATE INDEX IF NOT EXISTS idx_deal_rooms_seller 
  ON public.deal_rooms(seller_id);

CREATE INDEX IF NOT EXISTS idx_milestones_offer_status 
  ON public.milestones(offer_id, status);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_type 
  ON public.wallet_transactions(wallet_id, type, created_at DESC);

-- PHASE 2: User behavior metrics table
CREATE TABLE public.user_behavior_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  first_bid_at TIMESTAMPTZ,
  first_deal_at TIMESTAMPTZ,
  first_completion_at TIMESTAMPTZ,
  signup_to_bid_hours NUMERIC,
  bid_to_deal_hours NUMERIC,
  total_bids INTEGER NOT NULL DEFAULT 0,
  total_deals INTEGER NOT NULL DEFAULT 0,
  total_completions INTEGER NOT NULL DEFAULT 0,
  total_abandonments INTEGER NOT NULL DEFAULT 0,
  repeat_project_count INTEGER NOT NULL DEFAULT 0,
  deal_completion_rate NUMERIC NOT NULL DEFAULT 0,
  trust_growth_velocity NUMERIC NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_behavior_metrics ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_behavior_user ON public.user_behavior_metrics(user_id);

CREATE POLICY "Users can read own behavior" ON public.user_behavior_metrics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all behavior" ON public.user_behavior_metrics
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "System can upsert behavior" ON public.user_behavior_metrics
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- PHASE 3: Idempotency keys for bids
ALTER TABLE public.earning_bids ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bids_idempotency ON public.earning_bids(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- PHASE 4: Materialized view for operational health dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_operational_health AS
SELECT
  (SELECT COUNT(*) FROM earning_projects WHERE status = 'open') AS open_projects,
  (SELECT COUNT(*) FROM earning_bids) AS total_bids,
  (SELECT COUNT(*) FROM deal_rooms) AS total_deals,
  (SELECT COUNT(*) FROM deal_rooms WHERE status = 'completed') AS completed_deals,
  (SELECT COUNT(*) FROM deal_rooms WHERE status = 'cancelled') AS abandoned_deals,
  (SELECT COUNT(*) FROM disputes WHERE status = 'open') AS open_disputes,
  (SELECT AVG(trust_score) FROM user_trust_profiles) AS avg_trust,
  (SELECT STDDEV(trust_score) FROM user_trust_profiles) AS trust_volatility,
  now() AS refreshed_at;

-- Allow admins to read the materialized view
-- (Materialized views don't support RLS, access is controlled at query level)
