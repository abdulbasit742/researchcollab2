
-- =====================================================
-- PROFESSIONAL ASSET & EXECUTION MARKET ENGINE (PAEME)
-- =====================================================

-- 1. Marketplace Listings (Section 1)
CREATE TABLE IF NOT EXISTS public.marketplace_listings_paeme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  category TEXT NOT NULL,
  domain TEXT,
  title TEXT NOT NULL,
  description TEXT,
  deliverables TEXT[] DEFAULT '{}',
  timeline_days INTEGER,
  funding_linkage UUID,
  ip_ownership_terms TEXT,
  compliance_requirements TEXT[] DEFAULT '{}',
  escrow_milestone_breakdown JSONB DEFAULT '[]',
  pricing_amount NUMERIC DEFAULT 0,
  pricing_currency TEXT DEFAULT 'USD',
  credibility_score NUMERIC DEFAULT 0,
  verification_status TEXT DEFAULT 'unverified',
  privacy_level TEXT DEFAULT 'public',
  status TEXT DEFAULT 'active',
  view_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Listing Credibility (Section 2)
CREATE TABLE IF NOT EXISTS public.listing_credibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings_paeme(id) ON DELETE CASCADE,
  seller_trust_index NUMERIC DEFAULT 0,
  execution_reliability NUMERIC DEFAULT 0,
  dispute_history_score NUMERIC DEFAULT 0,
  funding_compliance NUMERIC DEFAULT 0,
  institutional_verification NUMERIC DEFAULT 0,
  repeat_buyer_rate NUMERIC DEFAULT 0,
  long_term_stability NUMERIC DEFAULT 0,
  domain_authority NUMERIC DEFAULT 0,
  composite_credibility NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(listing_id)
);

-- 3. Marketplace Transactions (Section 3)
CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings_paeme(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  escrow_id UUID,
  milestones JSONB DEFAULT '[]',
  deliverable_validation JSONB DEFAULT '{}',
  compliance_reviewed BOOLEAN DEFAULT false,
  dispute_status TEXT,
  status TEXT DEFAULT 'initiated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 4. Asset Verification (Section 4)
CREATE TABLE IF NOT EXISTS public.asset_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings_paeme(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL,
  proof_data JSONB DEFAULT '{}',
  institutional_endorsement UUID,
  ip_registration_ref TEXT,
  compliance_clearance BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Cross-Border Compliance (Section 5)
CREATE TABLE IF NOT EXISTS public.marketplace_cross_border (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.marketplace_transactions(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.marketplace_listings_paeme(id) ON DELETE CASCADE,
  jurisdiction_compatibility NUMERIC DEFAULT 0,
  export_control_clear BOOLEAN DEFAULT false,
  ip_ownership_compatible BOOLEAN DEFAULT false,
  currency_compliance BOOLEAN DEFAULT false,
  data_transfer_compliant BOOLEAN DEFAULT false,
  funding_restriction_clear BOOLEAN DEFAULT false,
  flags TEXT[] DEFAULT '{}',
  overall_viability NUMERIC DEFAULT 0,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Fraud Detection (Section 8)
CREATE TABLE IF NOT EXISTS public.marketplace_fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.marketplace_listings_paeme(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.marketplace_transactions(id) ON DELETE CASCADE,
  flagged_user_id UUID,
  flag_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  description TEXT,
  evidence JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Market Liquidity Metrics (Section 9)
CREATE TABLE IF NOT EXISTS public.market_liquidity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  domain TEXT,
  demand_trend NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  skill_saturation NUMERIC DEFAULT 0,
  buyer_geo_distribution JSONB DEFAULT '{}',
  funding_linked_demand NUMERIC DEFAULT 0,
  domain_growth_signal NUMERIC DEFAULT 0,
  pricing_competitiveness NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Institutional Procurement (Section 11)
CREATE TABLE IF NOT EXISTS public.institutional_procurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rfp_requirements JSONB DEFAULT '{}',
  compliance_checks TEXT[] DEFAULT '{}',
  escrow_terms JSONB DEFAULT '{}',
  domain_authority_threshold NUMERIC DEFAULT 0,
  trust_density_filter NUMERIC DEFAULT 0,
  category TEXT,
  domain TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closes_at TIMESTAMPTZ
);

-- 9. Asset Performance Tracking (Section 14)
CREATE TABLE IF NOT EXISTS public.asset_performance_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings_paeme(id) ON DELETE CASCADE,
  deliverable_reuse_count INTEGER DEFAULT 0,
  tool_adoption_rate NUMERIC DEFAULT 0,
  dataset_citation_rate NUMERIC DEFAULT 0,
  patent_commercialization_success NUMERIC DEFAULT 0,
  service_repeat_rate NUMERIC DEFAULT 0,
  long_term_satisfaction NUMERIC DEFAULT 0,
  revenue_compounding NUMERIC DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(listing_id)
);

-- Enable RLS
ALTER TABLE public.marketplace_listings_paeme ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_credibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_cross_border ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_liquidity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_procurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_performance_tracking ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Auth read mkt_listings" ON public.marketplace_listings_paeme FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read list_cred" ON public.listing_credibility FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read mkt_txn" ON public.marketplace_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read asset_ver" ON public.asset_verifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read mkt_xborder" ON public.marketplace_cross_border FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read mkt_fraud" ON public.marketplace_fraud_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read mkt_liquidity" ON public.market_liquidity_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read inst_procure" ON public.institutional_procurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read asset_perf" ON public.asset_performance_tracking FOR SELECT TO authenticated USING (true);

-- Insert policies
CREATE POLICY "Auth insert mkt_listings" ON public.marketplace_listings_paeme FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert list_cred" ON public.listing_credibility FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert mkt_txn" ON public.marketplace_transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert asset_ver" ON public.asset_verifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert mkt_xborder" ON public.marketplace_cross_border FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert mkt_fraud" ON public.marketplace_fraud_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert mkt_liquidity" ON public.market_liquidity_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert inst_procure" ON public.institutional_procurements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert asset_perf" ON public.asset_performance_tracking FOR INSERT TO authenticated WITH CHECK (true);

-- Update policies
CREATE POLICY "Auth update mkt_listings" ON public.marketplace_listings_paeme FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update mkt_txn" ON public.marketplace_transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update asset_ver" ON public.asset_verifications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update mkt_fraud" ON public.marketplace_fraud_flags FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update list_cred" ON public.listing_credibility FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update asset_perf" ON public.asset_performance_tracking FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth update inst_procure" ON public.institutional_procurements FOR UPDATE TO authenticated USING (true);
