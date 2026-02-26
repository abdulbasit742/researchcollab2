
-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'government_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'compliance_officer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sponsor_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tenant_admin';
