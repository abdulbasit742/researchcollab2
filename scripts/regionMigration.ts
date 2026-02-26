/**
 * Region Migration Script — assigns existing tenants to default region.
 * Idempotent: safe to run multiple times.
 *
 * Usage: Execute the SQL statements via the database migration tool.
 */

export const REGION_MIGRATION_SQL = `
-- Step 1: Ensure default region exists
INSERT INTO public.regions (name, code, currency_default, data_residency_policy, status)
VALUES ('South Asia', 'ap-south', 'PKR', 'sovereign', 'active')
ON CONFLICT (code) DO NOTHING;

-- Step 2: Assign all tenants without a region to default
UPDATE public.tenants
SET region_id = (SELECT id FROM public.regions WHERE code = 'ap-south' LIMIT 1)
WHERE region_id IS NULL;

-- Step 3: Verify no null region_id remains
-- SELECT count(*) FROM public.tenants WHERE region_id IS NULL;
`;

export const MIGRATION_STEPS = [
  "1. Create default region (ap-south, PKR, sovereign)",
  "2. Assign all unassigned tenants to default region",
  "3. Verify zero null region_id in tenants table",
  "4. Future: add region_id columns to deals, wallets, transactions as needed",
] as const;
