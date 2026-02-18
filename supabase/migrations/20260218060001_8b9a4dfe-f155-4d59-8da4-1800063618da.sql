
-- Intelligence Products catalog
CREATE TABLE IF NOT EXISTS public.intelligence_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  description TEXT,
  data_scope TEXT DEFAULT 'global',
  aggregation_level TEXT DEFAULT 'country',
  subscription_tier TEXT DEFAULT 'standard',
  pricing_model TEXT DEFAULT 'subscription',
  price_monthly NUMERIC DEFAULT 0,
  price_annual NUMERIC DEFAULT 0,
  update_frequency TEXT DEFAULT 'monthly',
  compliance_status TEXT DEFAULT 'pending',
  sample_preview JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.intelligence_products ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'intelligence_products' AND policyname = 'Intelligence products publicly readable') THEN
    CREATE POLICY "Intelligence products publicly readable" ON public.intelligence_products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'intelligence_products' AND policyname = 'Admins manage intelligence products') THEN
    CREATE POLICY "Admins manage intelligence products" ON public.intelligence_products FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Add columns to existing intelligence_subscriptions if missing
ALTER TABLE public.intelligence_subscriptions ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE public.intelligence_subscriptions ADD COLUMN IF NOT EXISTS access_scope TEXT DEFAULT 'read';
ALTER TABLE public.intelligence_subscriptions ADD COLUMN IF NOT EXISTS api_access_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.intelligence_subscriptions ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';
ALTER TABLE public.intelligence_subscriptions ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMPTZ;

-- Custom Intelligence Requests
CREATE TABLE IF NOT EXISTS public.custom_intelligence_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  request_type TEXT NOT NULL,
  scope_description TEXT NOT NULL,
  sectors TEXT[],
  regions TEXT[],
  budget_range TEXT,
  status TEXT DEFAULT 'submitted',
  deliverable_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.custom_intelligence_requests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_intelligence_requests' AND policyname = 'Users manage own requests') THEN
    CREATE POLICY "Users manage own requests" ON public.custom_intelligence_requests FOR ALL USING (auth.uid() = requester_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_intelligence_requests' AND policyname = 'Admins manage all ci requests') THEN
    CREATE POLICY "Admins manage all ci requests" ON public.custom_intelligence_requests FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Intelligence Revenue Logs
CREATE TABLE IF NOT EXISTS public.intelligence_revenue_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID,
  subscription_id UUID,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  commercial_share NUMERIC,
  foundation_share NUMERIC,
  node_reserve_share NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.intelligence_revenue_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'intelligence_revenue_logs' AND policyname = 'Admins view revenue logs') THEN
    CREATE POLICY "Admins view revenue logs" ON public.intelligence_revenue_logs FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- Sovereign Data Protection Audits
CREATE TABLE IF NOT EXISTS public.intelligence_publication_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID,
  no_identifiable_data BOOLEAN DEFAULT false,
  node_consent_obtained BOOLEAN DEFAULT false,
  compliance_active BOOLEAN DEFAULT false,
  aggregation_threshold_met BOOLEAN DEFAULT false,
  bias_impact_checked BOOLEAN DEFAULT false,
  audit_passed BOOLEAN DEFAULT false,
  audited_at TIMESTAMPTZ DEFAULT now(),
  audited_by UUID
);
ALTER TABLE public.intelligence_publication_audits ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'intelligence_publication_audits' AND policyname = 'Admins manage pub audits') THEN
    CREATE POLICY "Admins manage pub audits" ON public.intelligence_publication_audits FOR ALL USING (public.is_admin(auth.uid()));
  END IF;
END $$;
