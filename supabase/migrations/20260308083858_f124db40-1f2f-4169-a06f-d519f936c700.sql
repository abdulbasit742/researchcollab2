
-- Research Impact Bonds: Outcome-linked funding instruments
CREATE TABLE IF NOT EXISTS public.research_impact_bonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  issuer_id UUID NOT NULL,
  institution_id UUID REFERENCES public.organizations(id),
  research_domain TEXT NOT NULL,
  target_outcome TEXT NOT NULL,
  bond_amount NUMERIC NOT NULL DEFAULT 0,
  funded_amount NUMERIC NOT NULL DEFAULT 0,
  min_investment NUMERIC NOT NULL DEFAULT 100,
  max_return_rate NUMERIC NOT NULL DEFAULT 0.15,
  outcome_metrics JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  maturity_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_impact_bonds ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone can view published bonds" ON public.research_impact_bonds FOR SELECT USING (status = 'published' OR issuer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can create bonds" ON public.research_impact_bonds FOR INSERT TO authenticated WITH CHECK (issuer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Issuers can update own bonds" ON public.research_impact_bonds FOR UPDATE TO authenticated USING (issuer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.bond_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bond_id UUID NOT NULL REFERENCES public.research_impact_bonds(id),
  investor_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  expected_return NUMERIC,
  status TEXT NOT NULL DEFAULT 'active',
  invested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bond_investments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Investors see own investments" ON public.bond_investments FOR SELECT TO authenticated USING (investor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can invest" ON public.bond_investments FOR INSERT TO authenticated WITH CHECK (investor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Knowledge Exchange: Cross-institution protocol marketplace
CREATE TABLE IF NOT EXISTS public.knowledge_exchange_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  institution_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'methodology',
  domain TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'protocol',
  price NUMERIC NOT NULL DEFAULT 0,
  is_open_access BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_exchange_listings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone can view published listings" ON public.knowledge_exchange_listings FOR SELECT USING (status = 'published' OR author_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Authors can create listings" ON public.knowledge_exchange_listings FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Authors can update own listings" ON public.knowledge_exchange_listings FOR UPDATE TO authenticated USING (author_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.knowledge_exchange_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.knowledge_exchange_listings(id),
  buyer_id UUID NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_exchange_purchases ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Buyers see own purchases" ON public.knowledge_exchange_purchases FOR SELECT TO authenticated USING (buyer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can purchase" ON public.knowledge_exchange_purchases FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AI Peer Review Network - add AI pre-review column if not exists
ALTER TABLE public.peer_review_requests ADD COLUMN IF NOT EXISTS ai_pre_review JSONB;
ALTER TABLE public.peer_review_requests ADD COLUMN IF NOT EXISTS reward_amount NUMERIC DEFAULT 0;
ALTER TABLE public.peer_review_requests ADD COLUMN IF NOT EXISTS min_reviewer_trust_score NUMERIC DEFAULT 60;
