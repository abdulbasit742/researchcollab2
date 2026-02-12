
-- Platform Fees: Transaction-level fee ledger
CREATE TABLE public.platform_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID,
  milestone_id UUID,
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  platform_fee_percentage NUMERIC NOT NULL DEFAULT 10,
  platform_fee_amount NUMERIC NOT NULL DEFAULT 0,
  net_payout NUMERIC NOT NULL DEFAULT 0,
  payer_id UUID REFERENCES auth.users(id),
  payee_id UUID REFERENCES auth.users(id),
  trust_tier TEXT,
  is_institutional BOOLEAN DEFAULT false,
  institution_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own fees" ON public.platform_fees
  FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);

CREATE POLICY "Admins see all fees" ON public.platform_fees
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System inserts fees" ON public.platform_fees
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_platform_fees_deal ON public.platform_fees(deal_id);
CREATE INDEX idx_platform_fees_payer ON public.platform_fees(payer_id);
CREATE INDEX idx_platform_fees_created ON public.platform_fees(created_at);

-- Institutional Contracts
CREATE TABLE public.institutional_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'subscription' CHECK (contract_type IN ('subscription', 'revenue_share', 'hybrid')),
  base_fee NUMERIC NOT NULL DEFAULT 0,
  revenue_share_percentage NUMERIC DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'expired', 'cancelled')),
  total_revenue_generated NUMERIC DEFAULT 0,
  total_fees_collected NUMERIC DEFAULT 0,
  trust_average NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.institutional_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution admins see own contracts" ON public.institutional_contracts
  FOR SELECT USING (public.is_institution_admin(auth.uid(), institution_id) OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage contracts" ON public.institutional_contracts
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE INDEX idx_inst_contracts_institution ON public.institutional_contracts(institution_id);

-- Fee Evasion Detection Logs
CREATE TABLE public.fee_evasion_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  detection_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fee_evasion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see evasion logs" ON public.fee_evasion_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System inserts evasion logs" ON public.fee_evasion_logs
  FOR INSERT WITH CHECK (true);

-- Trust-Tier Fee Schedule (configurable by admin)
CREATE TABLE public.trust_tier_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier TEXT NOT NULL UNIQUE,
  fee_percentage NUMERIC NOT NULL,
  visibility_boost NUMERIC DEFAULT 0,
  bid_priority_weight NUMERIC DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trust_tier_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads tier fees" ON public.trust_tier_fees
  FOR SELECT USING (true);

CREATE POLICY "Admins manage tier fees" ON public.trust_tier_fees
  FOR ALL USING (public.is_admin(auth.uid()));

-- Seed default trust tier fees
INSERT INTO public.trust_tier_fees (tier, fee_percentage, visibility_boost, bid_priority_weight) VALUES
  ('bronze', 12, 0, 1),
  ('silver', 10, 10, 1.2),
  ('gold', 8, 20, 1.5),
  ('platinum', 6, 30, 2);
