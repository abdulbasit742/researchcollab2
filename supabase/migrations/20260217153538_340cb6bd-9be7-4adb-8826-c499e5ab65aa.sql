
-- 4. Industry Research Partnerships
CREATE TABLE public.industry_research_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_user_id UUID,
  research_id UUID,
  institution_id UUID,
  partnership_type TEXT DEFAULT 'co-development',
  funding_pledged NUMERIC DEFAULT 0,
  funding_released NUMERIC DEFAULT 0,
  milestone_count INTEGER DEFAULT 0,
  milestones_completed INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  roi_pct NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  nda_signed BOOLEAN DEFAULT false,
  ip_ownership TEXT DEFAULT 'shared',
  revenue_split JSONB DEFAULT '{"institution": 40, "researcher": 30, "student": 20, "platform": 10}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_irp_rlcma_research ON industry_research_partnerships(research_id);
CREATE INDEX idx_irp_rlcma_institution ON industry_research_partnerships(institution_id);
CREATE INDEX idx_irp_rlcma_status ON industry_research_partnerships(status);
ALTER TABLE industry_research_partnerships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view partnerships" ON industry_research_partnerships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage partnerships" ON industry_research_partnerships FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 5. Royalty Contracts
CREATE TABLE public.royalty_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID,
  institution_id UUID,
  researcher_id UUID,
  contract_type TEXT DEFAULT 'revenue_share',
  institution_share_pct NUMERIC DEFAULT 40,
  researcher_share_pct NUMERIC DEFAULT 30,
  student_share_pct NUMERIC DEFAULT 20,
  platform_share_pct NUMERIC DEFAULT 10,
  total_revenue NUMERIC DEFAULT 0,
  total_distributed NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'PKR',
  status TEXT DEFAULT 'active',
  effective_from TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_rc_rlcma_research ON royalty_contracts(research_id);
CREATE INDEX idx_rc_rlcma_institution ON royalty_contracts(institution_id);
ALTER TABLE royalty_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view royalty contracts" ON royalty_contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage royalty contracts" ON royalty_contracts FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 6. Research Revenue Streams
CREATE TABLE public.research_revenue_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID,
  track_id UUID,
  institution_id UUID,
  revenue_type TEXT DEFAULT 'milestone_release',
  gross_amount NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  net_amount NUMERIC DEFAULT 0,
  institution_share NUMERIC DEFAULT 0,
  researcher_share NUMERIC DEFAULT 0,
  student_share NUMERIC DEFAULT 0,
  royalty_contract_id UUID REFERENCES royalty_contracts(id),
  currency TEXT DEFAULT 'PKR',
  period TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_rrs_rlcma_research ON research_revenue_streams(research_id);
CREATE INDEX idx_rrs_rlcma_institution ON research_revenue_streams(institution_id);
ALTER TABLE research_revenue_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view revenue streams" ON research_revenue_streams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage revenue streams" ON research_revenue_streams FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 7. Research Funding Pledges
CREATE TABLE public.research_funding_pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID,
  pledger_id UUID,
  pledger_type TEXT DEFAULT 'individual',
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'PKR',
  is_conditional BOOLEAN DEFAULT false,
  condition_threshold_pct NUMERIC DEFAULT 0,
  auto_escrow BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pledged',
  converted_to_escrow_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_rfp_rlcma_research ON research_funding_pledges(research_id);
CREATE INDEX idx_rfp_rlcma_pledger ON research_funding_pledges(pledger_id);
ALTER TABLE research_funding_pledges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view pledges" ON research_funding_pledges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create pledges" ON research_funding_pledges FOR INSERT TO authenticated WITH CHECK (auth.uid() = pledger_id);
CREATE POLICY "Admins can manage pledges" ON research_funding_pledges FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 8. Institution Research Earnings
CREATE TABLE public.institution_research_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  research_id UUID,
  earning_type TEXT DEFAULT 'royalty',
  gross_amount NUMERIC DEFAULT 0,
  net_amount NUMERIC DEFAULT 0,
  student_payout NUMERIC DEFAULT 0,
  researcher_payout NUMERIC DEFAULT 0,
  institution_payout NUMERIC DEFAULT 0,
  period TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_ire_rlcma_institution ON institution_research_earnings(institution_id);
ALTER TABLE institution_research_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view earnings" ON institution_research_earnings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage earnings" ON institution_research_earnings FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 9. Institution Switching Cost Metrics
CREATE TABLE public.institution_switching_cost_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  historical_execution_data_points INTEGER DEFAULT 0,
  revenue_performance_records INTEGER DEFAULT 0,
  trust_capital_accumulated NUMERIC DEFAULT 0,
  productivity_trajectory_months INTEGER DEFAULT 0,
  active_commercialization_contracts INTEGER DEFAULT 0,
  total_data_value_estimate NUMERIC DEFAULT 0,
  switching_cost_score NUMERIC DEFAULT 0,
  lock_in_grade TEXT DEFAULT 'low',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_iscm_rlcma_institution ON institution_switching_cost_metrics(institution_id);
ALTER TABLE institution_switching_cost_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view switching metrics" ON institution_switching_cost_metrics FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage switching metrics" ON institution_switching_cost_metrics FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
