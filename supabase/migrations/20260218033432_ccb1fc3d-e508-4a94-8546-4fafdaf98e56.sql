
-- Vesting Schedules
CREATE TABLE public.vesting_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id UUID NOT NULL,
  startup_id UUID NOT NULL,
  total_shares BIGINT NOT NULL,
  cliff_period INTEGER NOT NULL DEFAULT 12,
  vesting_duration INTEGER NOT NULL DEFAULT 48,
  vesting_interval TEXT DEFAULT 'monthly',
  shares_vested BIGINT DEFAULT 0,
  start_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.vesting_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view vesting" ON public.vesting_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create vesting" ON public.vesting_schedules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update vesting" ON public.vesting_schedules FOR UPDATE TO authenticated USING (true);

-- Equity Allocations
CREATE TABLE public.equity_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL,
  holder_id UUID NOT NULL,
  holder_type TEXT NOT NULL CHECK (holder_type IN ('founder','university','platform','investor','employee')),
  shares BIGINT NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  vesting_schedule_id UUID REFERENCES public.vesting_schedules(id),
  role TEXT,
  linked_contract_id UUID,
  cap_table_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.equity_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view allocations" ON public.equity_allocations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create allocations" ON public.equity_allocations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update allocations" ON public.equity_allocations FOR UPDATE TO authenticated USING (true);

-- Funding Rounds
CREATE TABLE public.funding_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL,
  round_type TEXT NOT NULL CHECK (round_type IN ('pre-seed','seed','series_a','series_b','internal','grant')),
  valuation NUMERIC DEFAULT 0,
  investment_amount NUMERIC DEFAULT 0,
  post_money_valuation NUMERIC DEFAULT 0,
  equity_issued BIGINT DEFAULT 0,
  lead_investor_id UUID,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.funding_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view rounds" ON public.funding_rounds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create rounds" ON public.funding_rounds FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update rounds" ON public.funding_rounds FOR UPDATE TO authenticated USING (true);

-- Equity Transaction Logs (immutable)
CREATE TABLE public.equity_transaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('allocation','transfer','buyback','cancellation','dilution','vesting_release')),
  from_holder_id UUID,
  to_holder_id UUID,
  shares BIGINT NOT NULL,
  linked_contract_id UUID,
  linked_funding_round_id UUID REFERENCES public.funding_rounds(id),
  reason TEXT,
  performed_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.equity_transaction_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view equity logs" ON public.equity_transaction_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create equity logs" ON public.equity_transaction_logs FOR INSERT TO authenticated WITH CHECK (true);
