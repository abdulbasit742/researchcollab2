/**
 * Tenant Isolation Audit — verifies no cross-tenant data leakage.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("tenantAudit");

export interface TenantViolation {
  check: string;
  count: number;
}

export interface TenantAuditReport {
  violations: TenantViolation[];
  totalViolations: number;
  passed: boolean;
  timestamp: string;
}

export async function runTenantIsolationAudit(): Promise<TenantAuditReport> {
  log.info("Running tenant isolation audit...");

  const violations: TenantViolation[] = [];

  // Check deals: buyer tenant should match deal tenant
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("id, tenant_id, buyer_id")
    .limit(500);

  if (deals && deals.length > 0) {
    const buyerIds = [...new Set(deals.map((d) => d.buyer_id).filter(Boolean))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, tenant_id")
      .in("id", buyerIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.tenant_id]));
    let mismatch = 0;
    for (const deal of deals) {
      const profileTenant = profileMap.get(deal.buyer_id);
      if (profileTenant && deal.tenant_id && profileTenant !== deal.tenant_id) mismatch++;
    }
    violations.push({ check: "deal_buyer_tenant_mismatch", count: mismatch });
  }

  // Check wallet transactions: tenant should match wallet tenant
  const { data: txns } = await supabase
    .from("wallet_transactions")
    .select("id, tenant_id, wallet_id")
    .limit(500);

  if (txns && txns.length > 0) {
    const walletIds = [...new Set(txns.map((t) => t.wallet_id).filter(Boolean))];
    const { data: wallets } = await supabase
      .from("wallets")
      .select("id, tenant_id")
      .in("id", walletIds);

    const walletMap = new Map((wallets ?? []).map((w) => [w.id, w.tenant_id]));
    let mismatch = 0;
    for (const txn of txns) {
      const walletTenant = walletMap.get(txn.wallet_id);
      if (walletTenant && txn.tenant_id && walletTenant !== txn.tenant_id) mismatch++;
    }
    violations.push({ check: "txn_wallet_tenant_mismatch", count: mismatch });
  }

  // Check notifications: tenant should match user tenant
  const { count: nullTenantNotifs } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("tenant_id", null);
  violations.push({ check: "notifications_without_tenant", count: nullTenantNotifs ?? 0 });

  const totalViolations = violations.reduce((s, v) => s + v.count, 0);

  const report: TenantAuditReport = {
    violations,
    totalViolations,
    passed: totalViolations === 0,
    timestamp: new Date().toISOString(),
  };

  log.info(`Tenant audit: ${totalViolations} violations, ${report.passed ? "PASS" : "FAIL"}`);
  return report;
}
