-- ============================================
-- ABUSE RESISTANCE & ANTI-GAMING INFRASTRUCTURE
-- System 35 Enhanced: Economic Safety & Abuse Dampening
-- ============================================

-- Table: Track detected abuse patterns and responses
CREATE TABLE IF NOT EXISTS public.abuse_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('warning', 'moderate', 'severe')),
    detection_source TEXT NOT NULL,
    evidence JSONB DEFAULT '{}',
    auto_action_taken TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Rate limiting and throttle tracking
CREATE TABLE IF NOT EXISTS public.user_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    window_hours INTEGER NOT NULL DEFAULT 24,
    action_count INTEGER NOT NULL DEFAULT 0,
    max_allowed INTEGER NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, action_type)
);

-- Table: Trust event velocity tracking (anti-farming)
CREATE TABLE IF NOT EXISTS public.trust_velocity_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    positive_events INTEGER DEFAULT 0,
    negative_events INTEGER DEFAULT 0,
    total_delta NUMERIC DEFAULT 0,
    reciprocal_events INTEGER DEFAULT 0,
    unique_counterparties INTEGER DEFAULT 0,
    velocity_score NUMERIC DEFAULT 0,
    is_suspicious BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Economic transaction velocity
CREATE TABLE IF NOT EXISTS public.economic_velocity_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    total_volume NUMERIC DEFAULT 0,
    avg_transaction_size NUMERIC DEFAULT 0,
    unique_counterparties INTEGER DEFAULT 0,
    circular_flow_score NUMERIC DEFAULT 0,
    micro_transaction_count INTEGER DEFAULT 0,
    is_suspicious BOOLEAN DEFAULT FALSE,
    flags JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Reciprocal relationship tracking (detect trust rings)
CREATE TABLE IF NOT EXISTS public.reciprocal_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mutual_trust_events INTEGER DEFAULT 0,
    mutual_transactions INTEGER DEFAULT 0,
    mutual_collaborations INTEGER DEFAULT 0,
    first_interaction_at TIMESTAMPTZ,
    last_interaction_at TIMESTAMPTZ,
    relationship_score NUMERIC DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_a_id, user_b_id)
);

-- Table: System-wide abuse thresholds (configurable)
CREATE TABLE IF NOT EXISTS public.abuse_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    threshold_key TEXT UNIQUE NOT NULL,
    threshold_value NUMERIC NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID
);

-- Insert default thresholds
INSERT INTO public.abuse_thresholds (threshold_key, threshold_value, description) VALUES
    ('trust_velocity_cap_daily', 15, 'Maximum trust points gain per day'),
    ('trust_velocity_cap_weekly', 40, 'Maximum trust points gain per week'),
    ('reciprocal_trust_dampening', 0.5, 'Multiplier for trust from mutual endorsements'),
    ('min_outcome_entropy', 3, 'Minimum unique counterparties for trust farming detection'),
    ('economic_micro_threshold', 500, 'Transactions below this are flagged as micro'),
    ('economic_velocity_cap_hourly', 10, 'Maximum transactions per hour'),
    ('economic_velocity_cap_daily', 50, 'Maximum transactions per day'),
    ('circular_flow_threshold', 0.3, 'Circular flow score threshold for flagging'),
    ('min_deal_amount', 1000, 'Minimum deal amount in PKR'),
    ('dispute_rate_threshold', 0.25, 'Dispute rate above this triggers review'),
    ('opportunity_post_rate_daily', 5, 'Maximum opportunities posted per day'),
    ('opportunity_post_rate_weekly', 15, 'Maximum opportunities posted per week'),
    ('dormant_resurrection_cooldown_days', 7, 'Days before dormant account can earn trust'),
    ('ai_recommendation_rate_hourly', 20, 'Maximum AI recommendations per hour')
ON CONFLICT (threshold_key) DO NOTHING;

-- Add anti-gaming columns to user_trust_profiles
ALTER TABLE public.user_trust_profiles 
    ADD COLUMN IF NOT EXISTS trust_velocity_24h NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS trust_velocity_7d NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS reciprocal_ratio NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS unique_counterparties_30d INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_under_review BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS review_reason TEXT,
    ADD COLUMN IF NOT EXISTS last_dormant_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS resurrection_cooldown_until TIMESTAMPTZ;

-- Add anti-gaming columns to wallets
ALTER TABLE public.wallets 
    ADD COLUMN IF NOT EXISTS transaction_velocity_1h INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS transaction_velocity_24h INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS circular_flow_score NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS micro_transaction_count_24h INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_under_review BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS review_reason TEXT;

-- Add anti-abuse columns to offers
ALTER TABLE public.offers 
    ADD COLUMN IF NOT EXISTS spam_score NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_rate_limited BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS visibility_penalty NUMERIC DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS proof_of_work_required BOOLEAN DEFAULT FALSE;

-- Enable RLS on new tables
ALTER TABLE public.abuse_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_velocity_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economic_velocity_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reciprocal_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abuse_thresholds ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin and system access only for abuse tables)
CREATE POLICY "Service role full access to abuse_detections"
ON public.abuse_detections FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own abuse detections"
ON public.abuse_detections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to user_rate_limits"
ON public.user_rate_limits FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access to trust_velocity_tracking"
ON public.trust_velocity_tracking FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access to economic_velocity_tracking"
ON public.economic_velocity_tracking FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access to reciprocal_relationships"
ON public.reciprocal_relationships FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can read abuse thresholds"
ON public.abuse_thresholds FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_abuse_detections_user_id ON public.abuse_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_abuse_detections_pattern_type ON public.abuse_detections(pattern_type);
CREATE INDEX IF NOT EXISTS idx_user_rate_limits_user_action ON public.user_rate_limits(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_trust_velocity_user_period ON public.trust_velocity_tracking(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_economic_velocity_user_period ON public.economic_velocity_tracking(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_reciprocal_relationships_users ON public.reciprocal_relationships(user_a_id, user_b_id);