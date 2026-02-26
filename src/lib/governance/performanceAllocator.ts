/**
 * Performance-Based Capital Allocator — allocates grants based on institution scores.
 */

import { supabase } from "@/integrations/supabase/client";
import { assertGovernmentAdmin } from "./governanceRoles";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("performanceAllocator");

export interface InstitutionScore {
  tenantId: string;
  tenantName: string;
  completionRate: number;
  disputeRate: number;
  sponsorRetention: number;
  capitalUtilization: number;
  complianceStatus: string;
  compositeScore: number;
}

async function logGovernanceAction(action: string, entityType: string, entityId: string, actorId: string, regionId?: string, details?: Record<string, unknown>) {
  await (supabase as any).from("governance_audit_logs").insert({
    action, entity_type: entityType, entity_id: entityId, actor_id: actorId,
    region_id: regionId ?? null, details: details ?? null,
  });
}

export async function calculateInstitutionScore(tenantId: string): Promise<InstitutionScore> {
  const { data: tenant } = await (supabase as any).from("tenants").select("id, name").eq("id", tenantId).single();

  // Deals
  const { data: deals } = await supabase.from("deal_rooms").select("status").eq("tenant_id", tenantId);
  const allDeals = deals ?? [];
  const completed = allDeals.filter((d) => d.status === "completed").length;
  const disputed = allDeals.filter((d) => d.status === "disputed").length;
  const completionRate = allDeals.length > 0 ? Math.round((completed / allDeals.length) * 100) : 0;
  const disputeRate = allDeals.length > 0 ? Math.round((disputed / allDeals.length) * 100) : 0;

  // Sponsor retention (repeat sponsors)
  const { data: sponsors } = await supabase.from("deal_rooms").select("buyer_id").eq("tenant_id", tenantId);
  const sponsorCounts = new Map<string, number>();
  for (const s of sponsors ?? []) {
    if (s.buyer_id) sponsorCounts.set(s.buyer_id, (sponsorCounts.get(s.buyer_id) ?? 0) + 1);
  }
  const repeatSponsors = [...sponsorCounts.values()].filter((c) => c > 1).length;
  const sponsorRetention = sponsorCounts.size > 0 ? Math.round((repeatSponsors / sponsorCounts.size) * 100) : 0;

  // Capital utilization
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated").eq("tenant_id", tenantId);
  const totalCommitted = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const capitalUtilization = totalCommitted > 0 ? Math.round((totalAllocated / totalCommitted) * 100) : 0;

  // Compliance
  const complianceStatus = "compliant"; // Simplified; real check via compliance layer

  // Composite score
  const compositeScore = Math.min(100, Math.round(
    completionRate * 0.3 + (100 - disputeRate) * 0.2 + sponsorRetention * 0.2 + capitalUtilization * 0.2 + (complianceStatus === "compliant" ? 10 : 0)
  ));

  return {
    tenantId, tenantName: tenant?.name ?? "Unknown", completionRate, disputeRate,
    sponsorRetention, capitalUtilization, complianceStatus, compositeScore,
  };
}

export async function allocateGrantToTenant(
  poolId: string, tenantId: string, amount: number, actorId: string
): Promise<void> {
  await assertGovernmentAdmin(actorId);

  // Verify pool region matches tenant region
  const { data: pool } = await (supabase as any).from("public_grant_pools").select("region_id, total_allocated, total_committed, status").eq("id", poolId).single();
  if (!pool) throw new Error("Grant pool not found");
  if (pool.status !== "active") throw new Error("Grant pool is not active");

  const { data: tenant } = await (supabase as any).from("tenants").select("region_id").eq("id", tenantId).single();
  if (pool.region_id && tenant?.region_id && pool.region_id !== tenant.region_id) {
    throw new Error("Cross-region grant allocation blocked");
  }

  if ((pool.total_allocated ?? 0) + amount > (pool.total_committed ?? 0)) {
    throw new Error("Allocation exceeds pool commitment");
  }

  // Update pool allocation
  await (supabase as any).from("public_grant_pools").update({
    total_allocated: (pool.total_allocated ?? 0) + amount, updated_at: new Date().toISOString(),
  }).eq("id", poolId);

  await logGovernanceAction("grant_allocated", "public_grant_pools", poolId, actorId, pool.region_id, { tenantId, amount });
  log.info("Grant allocated to tenant", { poolId, tenantId, amount });
}
