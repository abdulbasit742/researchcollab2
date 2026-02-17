
-- FYP Subscription Plans (configurable by admin)
CREATE TABLE public.fyp_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- trial, basic, pro, enterprise
  display_name TEXT NOT NULL,
  monthly_price NUMERIC NOT NULL DEFAULT 0,
  annual_price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  platform_commission_percentage NUMERIC NOT NULL DEFAULT 8,
  escrow_fee_percentage NUMERIC NOT NULL DEFAULT 2,
  max_fyp_limit INTEGER,
  max_funded_projects INTEGER,
  max_funding_volume NUMERIC,
  advanced_analytics_enabled BOOLEAN NOT NULL DEFAULT false,
  accreditation_export_enabled BOOLEAN NOT NULL DEFAULT false,
  custom_branding_enabled BOOLEAN NOT NULL DEFAULT false,
  api_access_enabled BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default plans
INSERT INTO public.fyp_subscription_plans (name, display_name, monthly_price, annual_price, platform_commission_percentage, escrow_fee_percentage, max_fyp_limit, max_funded_projects, max_funding_volume, advanced_analytics_enabled, accreditation_export_enabled, custom_branding_enabled, api_access_enabled) VALUES
  ('trial', 'Free Trial', 0, 0, 8, 2, 50, 10, 20000, false, false, false, false),
  ('basic', 'Basic', 499, 4990, 8, 2, 100, 30, 100000, false, false, false, false),
  ('pro', 'Professional', 1999, 19990, 6, 2, NULL, NULL, NULL, true, true, false, false),
  ('enterprise', 'Enterprise', 0, 0, 5, 1.5, NULL, NULL, NULL, true, true, true, true);

-- Institution Trial Plans
CREATE TABLE public.institution_trial_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.fyp_subscription_plans(id),
  trial_start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_end_date TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  trial_status TEXT NOT NULL DEFAULT 'active' CHECK (trial_status IN ('active', 'expired', 'converted', 'cancelled')),
  max_fyp_limit INTEGER NOT NULL DEFAULT 50,
  max_sponsor_limit INTEGER NOT NULL DEFAULT 10,
  max_funding_volume NUMERIC NOT NULL DEFAULT 20000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(institution_id)
);

-- Institution Subscriptions
CREATE TABLE public.institution_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.fyp_subscription_plans(id),
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'expired', 'cancelled', 'suspended')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  total_revenue_generated NUMERIC NOT NULL DEFAULT 0,
  commission_paid NUMERIC NOT NULL DEFAULT 0,
  escrow_fees_paid NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FYP Revenue Transactions
CREATE TABLE public.fyp_revenue_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.organizations(id),
  sponsor_id UUID REFERENCES public.profiles(id),
  gross_amount NUMERIC NOT NULL,
  platform_commission NUMERIC NOT NULL DEFAULT 0,
  escrow_fee NUMERIC NOT NULL DEFAULT 0,
  net_amount_distributed NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FYP Problem Brief Submissions (public intake)
CREATE TABLE public.fyp_problem_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  website TEXT,
  problem_description TEXT NOT NULL,
  budget_range TEXT,
  prototype_tier TEXT CHECK (prototype_tier IN ('prototype', 'mvp', 'extended')),
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'matched', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Testimonials
CREATE TABLE public.fyp_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL, -- sponsor, faculty, student
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fyp_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_trial_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyp_revenue_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyp_problem_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fyp_testimonials ENABLE ROW LEVEL SECURITY;

-- Subscription plans: readable by all authenticated
CREATE POLICY "Anyone can view active plans" ON public.fyp_subscription_plans FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage plans" ON public.fyp_subscription_plans FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Trial plans: institution admins + platform admins
CREATE POLICY "Institution admins view own trials" ON public.institution_trial_plans FOR SELECT TO authenticated USING (public.is_admin(auth.uid()) OR public.is_institution_admin(auth.uid(), institution_id));
CREATE POLICY "Admins manage trials" ON public.institution_trial_plans FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Subscriptions: institution admins + platform admins
CREATE POLICY "Institution admins view own subscriptions" ON public.institution_subscriptions FOR SELECT TO authenticated USING (public.is_admin(auth.uid()) OR public.is_institution_admin(auth.uid(), institution_id));
CREATE POLICY "Admins manage subscriptions" ON public.institution_subscriptions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Revenue transactions: admins only
CREATE POLICY "Admins view revenue" ON public.fyp_revenue_transactions FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage revenue" ON public.fyp_revenue_transactions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Problem briefs: anyone can insert (public form), admins can manage
CREATE POLICY "Anyone can submit problem brief" ON public.fyp_problem_briefs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins manage briefs" ON public.fyp_problem_briefs FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Testimonials: public ones readable by all, admins manage
CREATE POLICY "Public testimonials visible" ON public.fyp_testimonials FOR SELECT USING (is_public = true);
CREATE POLICY "Admins manage testimonials" ON public.fyp_testimonials FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
