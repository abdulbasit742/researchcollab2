
-- Reserve Units
CREATE TABLE public.reserve_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backing_capital_amount NUMERIC NOT NULL CHECK (backing_capital_amount > 0),
  backing_pool_id UUID,
  region_scope TEXT[] NOT NULL DEFAULT '{}',
  trust_weight NUMERIC NOT NULL DEFAULT 1.0,
  risk_weight NUMERIC NOT NULL DEFAULT 1.0,
  compliance_status TEXT NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('pending','approved','active','redeemed','frozen')),
  issuing_institution UUID,
  unit_value NUMERIC NOT NULL DEFAULT 0,
  is_redeemed BOOLEAN NOT NULL DEFAULT false,
  redeemed_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reserve Settlement Log
CREATE TABLE public.reserve_settlement_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_region TEXT NOT NULL,
  target_region TEXT NOT NULL,
  unit_count INT NOT NULL,
  settlement_value NUMERIC NOT NULL,
  compliance_validated BOOLEAN NOT NULL DEFAULT false,
  sovereignty_cleared BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','frozen')),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_reserve_units_institution ON public.reserve_units(issuing_institution);
CREATE INDEX idx_reserve_units_status ON public.reserve_units(compliance_status);
CREATE INDEX idx_reserve_units_redeemed ON public.reserve_units(is_redeemed);
CREATE INDEX idx_reserve_settlement_log_status ON public.reserve_settlement_log(status);

-- RLS
ALTER TABLE public.reserve_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserve_settlement_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read reserve_units" ON public.reserve_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read reserve_settlement_log" ON public.reserve_settlement_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service manage reserve_units" ON public.reserve_units FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service manage reserve_settlement_log" ON public.reserve_settlement_log FOR ALL TO service_role USING (true) WITH CHECK (true);
