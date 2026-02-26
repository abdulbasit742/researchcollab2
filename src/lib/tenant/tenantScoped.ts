/**
 * Tenant-Scoped Escrow Helpers — ensures all escrow operations are tenant-bound.
 */

import { supabase } from "@/integrations/supabase/client";
import { getCurrentTenantId } from "./tenantContext";
import { guardDealTenant, guardWalletTenant } from "./tenantGuards";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("tenantEscrow");

/**
 * Validate that a deal and wallet belong to the current tenant before escrow ops.
 */
export async function validateEscrowTenancy(dealId: string, userId: string): Promise<void> {
  const tenantId = await getCurrentTenantId();

  const { data: deal } = await supabase
    .from("deal_rooms")
    .select("tenant_id")
    .eq("id", dealId)
    .maybeSingle();

  guardDealTenant(deal?.tenant_id ?? null, tenantId);

  const { data: wallet } = await supabase
    .from("wallets")
    .select("tenant_id")
    .eq("user_id", userId)
    .maybeSingle();

  guardWalletTenant(wallet?.tenant_id ?? null, tenantId);

  log.debug("Escrow tenancy validated", { dealId, userId, tenantId });
}

/**
 * Get tenant-scoped wallet for a user.
 */
export async function getTenantWallet(userId: string) {
  const tenantId = await getCurrentTenantId();

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Get tenant-scoped deals for a user.
 */
export async function getTenantDeals(userId: string, page = 1, limit = 20) {
  const tenantId = await getCurrentTenantId();
  const from = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("deal_rooms")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw error;
  return { data: data ?? [], total: count ?? 0, page, limit };
}
