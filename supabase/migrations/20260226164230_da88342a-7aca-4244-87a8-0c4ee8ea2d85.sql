
-- ============================================================
-- MULTI-TENANT ISOLATION: Core Schema
-- ============================================================

-- 1. Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'university' CHECK (type IN ('university', 'enterprise', 'internal')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  slug TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Create default "global" tenant for existing data
INSERT INTO public.tenants (id, name, type, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Global', 'internal', 'global')
ON CONFLICT (id) DO NOTHING;

-- 3. Add tenant_id to core tables (nullable for backward compat, default to global)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.deal_rooms ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.platform_alerts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.platform_events ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT '00000000-0000-0000-0000-000000000001';

-- 4. Backfill existing rows to global tenant
UPDATE public.profiles SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.offers SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.deal_rooms SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.wallets SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.wallet_transactions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.notifications SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.platform_alerts SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.platform_events SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- 5. Indexes for tenant-scoped queries
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_offers_tenant ON public.offers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deal_rooms_tenant ON public.deal_rooms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wallets_tenant ON public.wallets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_tenant ON public.wallet_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON public.notifications(tenant_id);

-- 6. Tenant membership table (users can belong to multiple tenants)
CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'tenant_admin', 'platform_admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

-- 7. Security definer function: get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

-- 8. Security definer function: check tenant membership
CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = _user_id AND tenant_id = _tenant_id AND is_active = true
  );
$$;

-- 9. Security definer function: check tenant admin
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = _user_id AND tenant_id = _tenant_id AND role IN ('tenant_admin', 'platform_admin') AND is_active = true
  );
$$;

-- 10. RLS policies for tenants table
CREATE POLICY "Authenticated users can view active tenants"
ON public.tenants FOR SELECT TO authenticated
USING (status = 'active');

CREATE POLICY "Platform admins can manage tenants"
ON public.tenants FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));

-- 11. RLS policies for tenant_memberships
CREATE POLICY "Users can view own memberships"
ON public.tenant_memberships FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Tenant admins can manage memberships"
ON public.tenant_memberships FOR ALL TO authenticated
USING (public.is_tenant_admin(auth.uid(), tenant_id));

-- 12. Seed global tenant membership for existing users
INSERT INTO public.tenant_memberships (user_id, tenant_id, role)
SELECT id, '00000000-0000-0000-0000-000000000001', 'member'
FROM auth.users
ON CONFLICT (user_id, tenant_id) DO NOTHING;
