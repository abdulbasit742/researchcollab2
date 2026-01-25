-- Create affiliates table for affiliate program management
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate NUMERIC DEFAULT 15,
  custom_commission_rate NUMERIC,
  total_clicks INTEGER DEFAULT 0,
  total_signups INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  pending_earnings NUMERIC DEFAULT 0,
  available_earnings NUMERIC DEFAULT 0,
  lifetime_earnings NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'blocked')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create organizations table for B2B enterprise management
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('university', 'enterprise', 'research_lab', 'department')),
  admin_contact_email TEXT,
  admin_contact_name TEXT,
  city TEXT,
  country TEXT,
  member_limit INTEGER DEFAULT 10,
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'professional', 'enterprise', 'custom')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create organization members table
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  tool_access TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create organization bulk licenses table
CREATE TABLE public.org_bulk_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  total_seats INTEGER NOT NULL,
  used_seats INTEGER DEFAULT 0,
  monthly_cost NUMERIC NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create affiliate conversions table
CREATE TABLE public.affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID,
  transaction_type TEXT NOT NULL,
  transaction_amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'released', 'reversed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_bulk_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Affiliates RLS policies (admin only)
CREATE POLICY "Admins can manage affiliates"
  ON public.affiliates FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own affiliate profile"
  ON public.affiliates FOR SELECT
  USING (auth.uid() = user_id);

-- Organizations RLS policies
CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Org members can view their org"
  ON public.organizations FOR SELECT
  USING (id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- Organization members RLS policies
CREATE POLICY "Admins can manage org members"
  ON public.organization_members FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their membership"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid());

-- Bulk licenses RLS policies
CREATE POLICY "Admins can manage bulk licenses"
  ON public.org_bulk_licenses FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Org members can view their licenses"
  ON public.org_bulk_licenses FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- Affiliate conversions RLS policies
CREATE POLICY "Admins can manage conversions"
  ON public.affiliate_conversions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Affiliates can view their conversions"
  ON public.affiliate_conversions FOR SELECT
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Update triggers for updated_at
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();