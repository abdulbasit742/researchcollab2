
-- Performance Indexes (only for verified existing tables/columns)

-- Offers
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON public.offers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_sender_status ON public.offers(sender_id, status);

-- Milestones
CREATE INDEX IF NOT EXISTS idx_milestones_offer_id ON public.milestones(offer_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_offer_status ON public.milestones(offer_id, status);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON public.messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- Activity feed
CREATE INDEX IF NOT EXISTS idx_activity_feed_project ON public.activity_feed(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_performed ON public.activity_feed(performed_by, created_at DESC);

-- Trust events
CREATE INDEX IF NOT EXISTS idx_trust_events_user_created ON public.trust_events(user_id, created_at DESC);

-- Wallet transactions
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id, created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

-- Posts
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility, created_at DESC);

-- Analytics Cache Table
CREATE TABLE IF NOT EXISTS public.analytics_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL,
  entity_id text,
  snapshot_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_cache_key ON public.analytics_cache(cache_key, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON public.analytics_cache(expires_at);

ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read analytics cache"
  ON public.analytics_cache FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service insert analytics cache"
  ON public.analytics_cache FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service update analytics cache"
  ON public.analytics_cache FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  avg_response_time numeric,
  p95_response_time numeric,
  p99_response_time numeric,
  request_count integer DEFAULT 0,
  error_rate numeric DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_perf_metrics_endpoint ON public.performance_metrics(endpoint, recorded_at DESC);

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read performance metrics"
  ON public.performance_metrics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Cache refresh RPC
CREATE OR REPLACE FUNCTION public.refresh_expired_caches()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.analytics_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
