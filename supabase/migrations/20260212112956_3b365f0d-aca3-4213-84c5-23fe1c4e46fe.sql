
-- Platform Profit Metrics
CREATE TABLE public.platform_profit_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  gross_revenue numeric DEFAULT 0,
  platform_fee_revenue numeric DEFAULT 0,
  subscription_revenue numeric DEFAULT 0,
  intelligence_revenue numeric DEFAULT 0,
  infrastructure_cost_estimate numeric DEFAULT 0,
  net_margin numeric DEFAULT 0,
  active_users integer DEFAULT 0,
  revenue_per_user numeric DEFAULT 0,
  revenue_per_institution numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.platform_profit_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage profit metrics" ON public.platform_profit_metrics FOR ALL USING (public.is_admin(auth.uid()));

-- Deal Efficiency Metrics
CREATE TABLE public.deal_efficiency_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL,
  time_to_accept interval,
  time_to_first_milestone interval,
  total_duration interval,
  milestone_delay_ratio numeric DEFAULT 0,
  dispute_probability_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.deal_efficiency_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage deal efficiency" ON public.deal_efficiency_metrics FOR ALL USING (public.is_admin(auth.uid()));

-- Dynamic Fee Rules
CREATE TABLE public.dynamic_fee_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_type text NOT NULL,
  condition_label text,
  threshold numeric DEFAULT 0,
  fee_adjustment numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.dynamic_fee_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage fee rules" ON public.dynamic_fee_rules FOR ALL USING (public.is_admin(auth.uid()));

-- User LTV Metrics
CREATE TABLE public.user_ltv_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_revenue_generated numeric DEFAULT 0,
  total_fees_paid numeric DEFAULT 0,
  subscription_spend numeric DEFAULT 0,
  deal_completion_count integer DEFAULT 0,
  churn_risk_score numeric DEFAULT 0,
  projected_lifetime_value numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_ltv_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage LTV" ON public.user_ltv_metrics FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view own LTV" ON public.user_ltv_metrics FOR SELECT USING (auth.uid() = user_id);

-- Dispute Risk Model
CREATE TABLE public.dispute_risk_model (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  risk_score numeric DEFAULT 0,
  contributing_factors jsonb DEFAULT '{}',
  last_updated timestamptz DEFAULT now()
);
ALTER TABLE public.dispute_risk_model ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage dispute risk" ON public.dispute_risk_model FOR ALL USING (public.is_admin(auth.uid()));

-- Revenue Distribution Metrics
CREATE TABLE public.revenue_distribution_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  top_1_percent_revenue numeric DEFAULT 0,
  top_10_percent_revenue numeric DEFAULT 0,
  institutional_share numeric DEFAULT 0,
  freelancer_share numeric DEFAULT 0,
  risk_flag boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.revenue_distribution_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage revenue distribution" ON public.revenue_distribution_metrics FOR ALL USING (public.is_admin(auth.uid()));

-- Feature Complexity Registry
CREATE TABLE public.feature_complexity_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name text NOT NULL,
  complexity_score integer DEFAULT 1,
  usage_rate numeric DEFAULT 0,
  revenue_impact numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.feature_complexity_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage complexity registry" ON public.feature_complexity_registry FOR ALL USING (public.is_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_profit_metrics_date ON public.platform_profit_metrics(date);
CREATE INDEX idx_deal_efficiency_deal ON public.deal_efficiency_metrics(deal_id);
CREATE INDEX idx_user_ltv_user ON public.user_ltv_metrics(user_id);
CREATE INDEX idx_dispute_risk_user ON public.dispute_risk_model(user_id);
CREATE INDEX idx_revenue_dist_date ON public.revenue_distribution_metrics(date);
