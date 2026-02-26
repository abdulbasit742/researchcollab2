/**
 * Cross-Tenant Leak Detector — scans for data integrity violations across tenant boundaries.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";
import { createAdminAlert } from "@/lib/observability/adminAlerts";

const log = createLogger("leakDetector");

export interface LeakResult {
  check: string;
  leaked: boolean;
  count: number;
  details?: string;
}

/**
 * Detect deals where tenant_id doesn't match the buyer's profile tenant_id.
 */
async function checkDealBuyerTenantMismatch(): Promise<LeakResult> {
  const { data } = await supabase.rpc("detect_deal_tenant_mismatch" as any);
  // Fallback: manual check
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("id, tenant_id, buyer_id")
    .limit(500);

  if (!deals || deals.length === 0) return { check: "deal_buyer_tenant", leaked: false, count: 0 };

  const buyerIds = [...new Set(deals.map((d) => d.buyer_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, tenant_id")
    .in("id", buyerIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.tenant_id]));
  let mismatchCount = 0;

  for (const deal of deals) {
    const profileTenant = profileMap.get(deal.buyer_id);
    if (profileTenant && deal.tenant_id && profileTenant !== deal.tenant_id) {
      mismatchCount++;
    }
  }

  return {
    check: "deal_buyer_tenant",
    leaked: mismatchCount > 0,
    count: mismatchCount,
    details: mismatchCount > 0 ? `${mismatchCount} deals have buyer tenant mismatch` : undefined,
  };
}

/**
 * Detect wallet transactions where tenant_id doesn't match wallet's tenant_id.
 */
async function checkTransactionWalletMismatch(): Promise<LeakResult> {
  const { data: txns } = await supabase
    .from("wallet_transactions")
    .select("id, tenant_id, wallet_id")
    .limit(500);

  if (!txns || txns.length === 0) return { check: "txn_wallet_tenant", leaked: false, count: 0 };

  const walletIds = [...new Set(txns.map((t) => t.wallet_id).filter(Boolean))];
  const { data: wallets } = await supabase
    .from("wallets")
    .select("id, tenant_id")
    .in("id", walletIds);

  const walletMap = new Map((wallets ?? []).map((w) => [w.id, w.tenant_id]));
  let mismatchCount = 0;

  for (const txn of txns) {
    const walletTenant = walletMap.get(txn.wallet_id);
    if (walletTenant && txn.tenant_id && walletTenant !== txn.tenant_id) {
      mismatchCount++;
    }
  }

  return {
    check: "txn_wallet_tenant",
    leaked: mismatchCount > 0,
    count: mismatchCount,
  };
}

/**
 * Run all cross-tenant leak checks.
 */
export async function runLeakDetection(): Promise<LeakResult[]> {
  log.info("Running cross-tenant leak detection...");

  const results = await Promise.all([
    checkDealBuyerTenantMismatch(),
    checkTransactionWalletMismatch(),
  ]);

  const leaks = results.filter((r) => r.leaked);
  if (leaks.length > 0) {
    log.error("CROSS-TENANT LEAKS DETECTED", { leaks });
    for (const leak of leaks) {
      await createAdminAlert(
        "Cross-Tenant Leak",
        `${leak.check}: ${leak.count} mismatches detected`,
        "critical",
        { check: leak.check, count: leak.count }
      );
    }
  } else {
    log.info("No cross-tenant leaks detected");
  }

  return results;
}
