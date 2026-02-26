/**
 * Region-Aware Tenant Context — derives region from tenant, never from client.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("tenantRegionContext");

export interface RegionInfo {
  id: string;
  name: string;
  code: string;
  currencyDefault: string;
  stripeAccountId: string | null;
  dataResidencyPolicy: string;
  status: string;
}

export async function getCurrentRegion(tenantId: string): Promise<RegionInfo | null> {
  const { data: tenant } = await (supabase as any)
    .from("tenants")
    .select("region_id")
    .eq("id", tenantId)
    .single();

  if (!tenant?.region_id) return null;

  const { data: region } = await (supabase as any)
    .from("regions")
    .select("id, name, code, currency_default, stripe_account_id, data_residency_policy, status")
    .eq("id", tenant.region_id)
    .single();

  if (!region) return null;

  return {
    id: region.id,
    name: region.name,
    code: region.code,
    currencyDefault: region.currency_default,
    stripeAccountId: region.stripe_account_id,
    dataResidencyPolicy: region.data_residency_policy,
    status: region.status,
  };
}

export function assertRegionMatch(entityRegionId: string, sessionRegionId: string): void {
  if (entityRegionId !== sessionRegionId) {
    log.error("Cross-region access blocked", { entityRegionId, sessionRegionId });
    throw new Error("Cross-region access denied: entity belongs to a different region");
  }
}

export async function getTenantRegionId(tenantId: string): Promise<string | null> {
  const { data } = await (supabase as any)
    .from("tenants")
    .select("region_id")
    .eq("id", tenantId)
    .single();
  return data?.region_id ?? null;
}
