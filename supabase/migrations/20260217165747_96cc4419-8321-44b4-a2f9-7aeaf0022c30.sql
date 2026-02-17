
-- Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linked_document_id UUID REFERENCES public.documents(id),
  contract_type TEXT NOT NULL DEFAULT 'general',
  linked_entity_type TEXT,
  linked_entity_id UUID,
  status TEXT NOT NULL DEFAULT 'draft',
  content_hash TEXT,
  created_by UUID,
  activated_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  signatory_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'party',
  signature_hash TEXT,
  signed_at TIMESTAMPTZ,
  ip_address TEXT,
  device_metadata JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contracts' AND policyname='View own contracts') THEN
    CREATE POLICY "View own contracts" ON public.contracts FOR SELECT TO authenticated USING (
      created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.contract_signatures cs WHERE cs.contract_id = contracts.id AND cs.signatory_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contracts' AND policyname='Create contracts') THEN
    CREATE POLICY "Create contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contracts' AND policyname='Update own contracts') THEN
    CREATE POLICY "Update own contracts" ON public.contracts FOR UPDATE TO authenticated USING (created_by = auth.uid());
  END IF;
END $$;

ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contract_signatures' AND policyname='View signatures') THEN
    CREATE POLICY "View signatures" ON public.contract_signatures FOR SELECT TO authenticated USING (signatory_id = auth.uid() OR EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_id AND c.created_by = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contract_signatures' AND policyname='Add signatories') THEN
    CREATE POLICY "Add signatories" ON public.contract_signatures FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_id AND c.created_by = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contract_signatures' AND policyname='Sign contracts') THEN
    CREATE POLICY "Sign contracts" ON public.contract_signatures FOR UPDATE TO authenticated USING (signatory_id = auth.uid());
  END IF;
END $$;

-- Escrow Wallets
CREATE TABLE IF NOT EXISTS public.escrow_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linked_entity_type TEXT NOT NULL,
  linked_entity_id UUID NOT NULL,
  total_funded NUMERIC NOT NULL DEFAULT 0,
  total_locked NUMERIC NOT NULL DEFAULT 0,
  total_released NUMERIC NOT NULL DEFAULT 0,
  total_refunded NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.escrow_wallets ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='escrow_wallets' AND policyname='View escrow wallets') THEN
    CREATE POLICY "View escrow wallets" ON public.escrow_wallets FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Escrow Transactions
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_wallet_id UUID NOT NULL REFERENCES public.escrow_wallets(id),
  transaction_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payer_id UUID,
  beneficiary_id UUID,
  linked_contract_id UUID REFERENCES public.contracts(id),
  linked_milestone_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_reference TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='escrow_transactions' AND policyname='View own escrow txns') THEN
    CREATE POLICY "View own escrow txns" ON public.escrow_transactions FOR SELECT TO authenticated USING (payer_id = auth.uid() OR beneficiary_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='escrow_transactions' AND policyname='Create escrow txns') THEN
    CREATE POLICY "Create escrow txns" ON public.escrow_transactions FOR INSERT TO authenticated WITH CHECK (payer_id = auth.uid());
  END IF;
END $$;

-- Arbitration Cases
CREATE TABLE IF NOT EXISTS public.arbitration_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linked_contract_id UUID REFERENCES public.contracts(id),
  linked_escrow_id UUID REFERENCES public.escrow_wallets(id),
  initiated_by UUID NOT NULL,
  against_party UUID NOT NULL,
  dispute_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'initiated',
  risk_level TEXT DEFAULT 'medium',
  verdict_type TEXT,
  verdict_summary TEXT,
  arbitrator_id UUID,
  escrow_frozen BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.arbitration_cases ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='arbitration_cases' AND policyname='View own arbitration') THEN
    CREATE POLICY "View own arbitration" ON public.arbitration_cases FOR SELECT TO authenticated USING (initiated_by = auth.uid() OR against_party = auth.uid() OR arbitrator_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='arbitration_cases' AND policyname='Create arbitration') THEN
    CREATE POLICY "Create arbitration" ON public.arbitration_cases FOR INSERT TO authenticated WITH CHECK (initiated_by = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='arbitration_cases' AND policyname='Update arbitration') THEN
    CREATE POLICY "Update arbitration" ON public.arbitration_cases FOR UPDATE TO authenticated USING (initiated_by = auth.uid() OR arbitrator_id = auth.uid());
  END IF;
END $$;

-- Dispute Evidence (already exists, add columns if needed)
-- Skip creating dispute_evidence since it already exists

-- Financial Compliance Logs
CREATE TABLE IF NOT EXISTS public.financial_compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_compliance_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='financial_compliance_logs' AND policyname='View own compliance') THEN
    CREATE POLICY "View own compliance" ON public.financial_compliance_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- Platform Revenue Logs
CREATE TABLE IF NOT EXISTS public.platform_revenue_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC,
  tier TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  payer_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_revenue_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='platform_revenue_logs' AND policyname='Admins view revenue') THEN
    CREATE POLICY "Admins view revenue" ON public.platform_revenue_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
  END IF;
END $$;
