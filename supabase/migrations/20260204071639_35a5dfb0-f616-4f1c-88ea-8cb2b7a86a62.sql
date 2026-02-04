-- =============================================
-- DEAL ROOMS TABLE (foundation for deal health)
-- =============================================
CREATE TABLE public.deal_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'negotiating', -- negotiating, agreed, in_progress, completed, cancelled, disputed
  agreed_amount NUMERIC,
  escrow_amount NUMERIC DEFAULT 0,
  escrow_status TEXT DEFAULT 'none', -- none, locked, partial_release, released, refunded
  terms JSONB DEFAULT '{}'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.deal_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deal participants can view their deals" ON public.deal_rooms
  FOR SELECT TO authenticated USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create deals" ON public.deal_rooms
  FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Participants can update their deals" ON public.deal_rooms
  FOR UPDATE TO authenticated USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE INDEX idx_deal_rooms_buyer ON public.deal_rooms(buyer_id);
CREATE INDEX idx_deal_rooms_seller ON public.deal_rooms(seller_id);
CREATE INDEX idx_deal_rooms_status ON public.deal_rooms(status);

-- =============================================
-- COLLECTIVE INTELLIGENCE NETWORKS
-- =============================================

-- Swarm Decision Types
CREATE TYPE public.swarm_decision_status AS ENUM ('open', 'voting', 'closed', 'executed');
CREATE TYPE public.prediction_market_status AS ENUM ('active', 'resolved', 'cancelled');
CREATE TYPE public.due_diligence_status AS ENUM ('pending', 'in_progress', 'completed', 'flagged');

-- Swarm Decisions (collective decision-making)
CREATE TABLE public.swarm_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  decision_type TEXT NOT NULL DEFAULT 'general',
  context_type TEXT,
  context_id UUID,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  voting_method TEXT NOT NULL DEFAULT 'weighted',
  min_participants INTEGER DEFAULT 3,
  quorum_percentage INTEGER DEFAULT 50,
  status swarm_decision_status NOT NULL DEFAULT 'open',
  opens_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closes_at TIMESTAMPTZ NOT NULL,
  result JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Swarm Votes
CREATE TABLE public.swarm_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id UUID NOT NULL REFERENCES public.swarm_decisions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  weight NUMERIC DEFAULT 1,
  confidence NUMERIC DEFAULT 1 CHECK (confidence >= 0 AND confidence <= 1),
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(decision_id, voter_id)
);

-- Prediction Markets for Projects
CREATE TABLE public.prediction_markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  description TEXT,
  market_type TEXT NOT NULL DEFAULT 'binary',
  outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  initial_liquidity NUMERIC DEFAULT 1000,
  current_liquidity NUMERIC DEFAULT 1000,
  status prediction_market_status NOT NULL DEFAULT 'active',
  resolution_criteria TEXT,
  resolution_date TIMESTAMPTZ,
  resolved_outcome TEXT,
  resolver_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Prediction Market Positions
CREATE TABLE public.prediction_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES public.prediction_markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  outcome_id TEXT NOT NULL,
  shares NUMERIC NOT NULL DEFAULT 0,
  average_price NUMERIC NOT NULL,
  realized_pnl NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(market_id, user_id, outcome_id)
);

-- Prediction Market Trades
CREATE TABLE public.prediction_trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES public.prediction_markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  outcome_id TEXT NOT NULL,
  trade_type TEXT NOT NULL,
  shares NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Distributed Due Diligence
CREATE TABLE public.due_diligence_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  title TEXT NOT NULL,
  scope TEXT NOT NULL,
  required_checks JSONB NOT NULL DEFAULT '[]'::jsonb,
  reward_amount NUMERIC DEFAULT 0,
  max_investigators INTEGER DEFAULT 5,
  status due_diligence_status NOT NULL DEFAULT 'pending',
  deadline TIMESTAMPTZ,
  final_report JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Due Diligence Contributions
CREATE TABLE public.due_diligence_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.due_diligence_requests(id) ON DELETE CASCADE,
  investigator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  findings TEXT NOT NULL,
  evidence_urls TEXT[],
  risk_level TEXT DEFAULT 'low',
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  reward_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- AMBIENT PROFESSIONAL INTELLIGENCE
-- =============================================

-- Deal Health Metrics (silent monitoring)
CREATE TABLE public.deal_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deal_rooms(id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 100),
  milestone_velocity NUMERIC,
  sentiment_trend TEXT,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  last_activity_at TIMESTAMPTZ,
  days_since_activity INTEGER,
  predicted_outcome TEXT,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Relationship Entropy Tracking
CREATE TABLE public.relationship_entropy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entropy_score NUMERIC NOT NULL CHECK (entropy_score >= 0 AND entropy_score <= 100),
  interaction_frequency NUMERIC,
  last_interaction_at TIMESTAMPTZ,
  days_since_interaction INTEGER,
  interaction_trend TEXT,
  relationship_value NUMERIC,
  suggested_action TEXT,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, connection_id)
);

-- Opportunity Proximity Alerts
CREATE TABLE public.opportunity_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  match_score NUMERIC NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  alert_type TEXT NOT NULL,
  match_reasons JSONB DEFAULT '[]'::jsonb,
  deadline_distance_days INTEGER,
  is_notified BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, opportunity_id)
);

-- Enable RLS on all tables
ALTER TABLE public.swarm_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swarm_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.due_diligence_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.due_diligence_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_entropy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view open swarm decisions" ON public.swarm_decisions
  FOR SELECT USING (status IN ('open', 'voting', 'closed'));

CREATE POLICY "Users can create swarm decisions" ON public.swarm_decisions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their decisions" ON public.swarm_decisions
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Users can view votes" ON public.swarm_votes
  FOR SELECT TO authenticated USING (
    voter_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.swarm_decisions WHERE id = decision_id AND created_by = auth.uid())
  );

CREATE POLICY "Users can cast votes" ON public.swarm_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Anyone can view active markets" ON public.prediction_markets
  FOR SELECT USING (status IN ('active', 'resolved'));

CREATE POLICY "Users can create markets" ON public.prediction_markets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their positions" ON public.prediction_positions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can manage their positions" ON public.prediction_positions
  FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can view their trades" ON public.prediction_trades
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create trades" ON public.prediction_trades
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view due diligence requests" ON public.due_diligence_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create due diligence requests" ON public.due_diligence_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requesters can update their requests" ON public.due_diligence_requests
  FOR UPDATE TO authenticated USING (auth.uid() = requester_id);

CREATE POLICY "Users can view contributions" ON public.due_diligence_contributions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can contribute" ON public.due_diligence_contributions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = investigator_id);

CREATE POLICY "Investigators can update their contributions" ON public.due_diligence_contributions
  FOR UPDATE TO authenticated USING (auth.uid() = investigator_id);

CREATE POLICY "Deal participants can view health" ON public.deal_health_metrics
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.deal_rooms dr WHERE dr.id = deal_id AND (dr.buyer_id = auth.uid() OR dr.seller_id = auth.uid()))
  );

CREATE POLICY "Users can view their entropy" ON public.relationship_entropy
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can manage entropy" ON public.relationship_entropy
  FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can view their alerts" ON public.opportunity_alerts
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can manage their alerts" ON public.opportunity_alerts
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_swarm_decisions_status ON public.swarm_decisions(status);
CREATE INDEX idx_swarm_votes_decision ON public.swarm_votes(decision_id);
CREATE INDEX idx_prediction_markets_project ON public.prediction_markets(project_id);
CREATE INDEX idx_prediction_markets_status ON public.prediction_markets(status);
CREATE INDEX idx_deal_health_deal ON public.deal_health_metrics(deal_id);
CREATE INDEX idx_relationship_entropy_user ON public.relationship_entropy(user_id);
CREATE INDEX idx_opportunity_alerts_user ON public.opportunity_alerts(user_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_collective_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_swarm_decisions_updated_at BEFORE UPDATE ON public.swarm_decisions FOR EACH ROW EXECUTE FUNCTION public.update_collective_updated_at();
CREATE TRIGGER update_prediction_positions_updated_at BEFORE UPDATE ON public.prediction_positions FOR EACH ROW EXECUTE FUNCTION public.update_collective_updated_at();
CREATE TRIGGER update_due_diligence_contributions_updated_at BEFORE UPDATE ON public.due_diligence_contributions FOR EACH ROW EXECUTE FUNCTION public.update_collective_updated_at();
CREATE TRIGGER update_deal_rooms_updated_at BEFORE UPDATE ON public.deal_rooms FOR EACH ROW EXECUTE FUNCTION public.update_collective_updated_at();