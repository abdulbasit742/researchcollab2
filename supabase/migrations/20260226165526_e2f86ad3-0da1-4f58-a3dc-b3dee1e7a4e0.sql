
-- Add tenant_id to capital_pools if missing
ALTER TABLE public.capital_pools ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.capital_pools ADD COLUMN IF NOT EXISTS total_returned NUMERIC NOT NULL DEFAULT 0;

-- Add deal_id to pool_allocations if missing
ALTER TABLE public.pool_allocations ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES public.deal_rooms(id);
ALTER TABLE public.pool_allocations ADD COLUMN IF NOT EXISTS amount NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.pool_allocations ADD COLUMN IF NOT EXISTS allocated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.pool_allocations ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;
ALTER TABLE public.pool_allocations ADD COLUMN IF NOT EXISTS return_amount NUMERIC;

-- Create missing tables
CREATE TABLE IF NOT EXISTS public.pool_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES public.capital_pools(id),
  contributor_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'committed',
  committed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pool_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES public.capital_pools(id) UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  locked_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pool_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES public.capital_pools(id),
  roi NUMERIC DEFAULT 0,
  default_rate NUMERIC DEFAULT 0,
  avg_deployment_time_hours NUMERIC DEFAULT 0,
  total_deployed NUMERIC DEFAULT 0,
  total_returned NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.department_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES public.capital_pools(id),
  department_id TEXT NOT NULL,
  department_name TEXT,
  allocation_limit NUMERIC NOT NULL DEFAULT 0,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_capital_pools_tenant ON public.capital_pools(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pool_contributions_pool ON public.pool_contributions(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_allocations_deal ON public.pool_allocations(deal_id);
CREATE INDEX IF NOT EXISTS idx_pool_metrics_pool ON public.pool_metrics(pool_id);
CREATE INDEX IF NOT EXISTS idx_department_allocations_pool ON public.department_allocations(pool_id);

-- RLS
ALTER TABLE public.pool_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_allocations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated read pool_contributions" ON public.pool_contributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read pool_wallets" ON public.pool_wallets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read pool_metrics" ON public.pool_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read department_allocations" ON public.department_allocations FOR SELECT TO authenticated USING (true);
