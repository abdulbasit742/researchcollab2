
-- Stripe event deduplication table (prevents webhook replay attacks)
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  deal_id UUID,
  amount NUMERIC,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- Only service_role can insert/read stripe events (edge function)
CREATE POLICY "Service role only for stripe_events"
  ON public.stripe_events
  FOR ALL
  USING (false);

-- User activity flags for suspicious activity detection
CREATE TABLE IF NOT EXISTS public.user_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  details JSONB,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_flags ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage user flags
CREATE POLICY "Admins can manage user_flags"
  ON public.user_flags
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Rate limit tracking table
CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own rate limit entries
CREATE POLICY "Users insert own rate_limit_entries"
  ON public.rate_limit_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own entries (for client-side checks)
CREATE POLICY "Users read own rate_limit_entries"
  ON public.rate_limit_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index for fast rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_action
  ON public.rate_limit_entries (user_id, action_type, created_at DESC);

-- Index for fast flag lookups
CREATE INDEX IF NOT EXISTS idx_user_flags_user
  ON public.user_flags (user_id, resolved, created_at DESC);

-- Cleanup old rate limit entries (older than 24h) via a function
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limit_entries
  WHERE created_at < now() - interval '24 hours';
END;
$$;
