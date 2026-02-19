
-- Sponsor Acquisition Pipeline
CREATE TABLE public.sponsor_pipeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_name TEXT NOT NULL,
  contact_email TEXT,
  contact_person TEXT,
  organization TEXT,
  stage TEXT NOT NULL DEFAULT 'contacted' CHECK (stage IN ('contacted','meeting_scheduled','proposal_sent','onboarded','funded','repeat_funder','churned')),
  meeting_date TIMESTAMPTZ,
  proposal_sent_at TIMESTAMPTZ,
  onboarded_at TIMESTAMPTZ,
  first_deposit_at TIMESTAMPTZ,
  total_funded NUMERIC DEFAULT 0,
  funding_count INT DEFAULT 0,
  avg_funding_size NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sponsor_pipeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on sponsor_pipeline" ON public.sponsor_pipeline FOR ALL USING (true) WITH CHECK (true);

-- Hiring Conversions (the memory mentions it but table doesn't exist)
CREATE TABLE public.hiring_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID,
  student_id UUID,
  fyp_id UUID,
  deal_id UUID,
  offer_made BOOLEAN DEFAULT false,
  offer_date TIMESTAMPTZ,
  salary_band TEXT,
  role_title TEXT,
  hired BOOLEAN DEFAULT false,
  hired_date TIMESTAMPTZ,
  retention_months INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hiring_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on hiring_conversions" ON public.hiring_conversions FOR ALL USING (true) WITH CHECK (true);

-- Re-funding Recommendations
CREATE TABLE public.refunding_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID NOT NULL,
  recommended_fyp_id UUID,
  recommended_fyp_title TEXT,
  reason TEXT,
  match_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','accepted','declined','expired')),
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.refunding_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on refunding_recommendations" ON public.refunding_recommendations FOR ALL USING (true) WITH CHECK (true);

-- Capital Flow Snapshots (daily aggregates)
CREATE TABLE public.capital_flow_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL UNIQUE,
  monthly_escrow_volume NUMERIC DEFAULT 0,
  weekly_funding_velocity NUMERIC DEFAULT 0,
  sponsor_retention_pct NUMERIC DEFAULT 0,
  avg_deal_cycle_days NUMERIC DEFAULT 0,
  completion_rate NUMERIC DEFAULT 0,
  hiring_conversion_pct NUMERIC DEFAULT 0,
  active_sponsors INT DEFAULT 0,
  total_funded_fyps INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_flow_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on capital_flow_snapshots" ON public.capital_flow_snapshots FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_sponsor_pipeline_updated_at BEFORE UPDATE ON public.sponsor_pipeline FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hiring_conversions_updated_at BEFORE UPDATE ON public.hiring_conversions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
