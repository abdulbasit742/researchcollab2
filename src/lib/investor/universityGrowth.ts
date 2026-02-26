/**
 * University Growth Metrics — per-tenant institutional performance analytics.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("universityGrowth");

export interface TenantGrowthMetrics {
  tenantId: string;
  tenantName: string;
  activeStudents: number;
  activeSponsors: number;
  dealCount: number;
  gmv: number;
  gmvGrowthRate: number;
}

export interface UniversityGrowthReport {
  tenants: TenantGrowthMetrics[];
  top5: TenantGrowthMetrics[];
  totalActiveTenants: number;
}

export async function generateUniversityGrowthReport(): Promise<UniversityGrowthReport> {
  // Get tenants
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name, status")
    .eq("status", "active");

  if (!tenants || tenants.length === 0) {
    return { tenants: [], top5: [], totalActiveTenants: 0 };
  }

  // Get all deals grouped by tenant
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("tenant_id, buyer_id, seller_id, escrow_amount, created_at, escrow_status")
    .in("escrow_status", ["funded", "released"])
    .limit(2000);

  // Get member counts by tenant
  const { data: memberships } = await supabase
    .from("tenant_memberships")
    .select("tenant_id, user_id, role")
    .eq("is_active", true);

  const tenantMetrics: TenantGrowthMetrics[] = tenants.map((t) => {
    const tenantDeals = (deals ?? []).filter((d) => d.tenant_id === t.id);
    const tenantMembers = (memberships ?? []).filter((m) => m.tenant_id === t.id);
    const gmv = tenantDeals.reduce((s, d) => s + (d.escrow_amount ?? 0), 0);

    const uniqueSponsors = new Set(tenantDeals.map((d) => d.buyer_id).filter(Boolean)).size;
    const uniqueStudents = new Set(tenantDeals.map((d) => d.seller_id).filter(Boolean)).size;

    // GMV growth: last 30d vs previous 30d
    const now = Date.now();
    const d30 = new Date(now - 30 * 86400_000).toISOString();
    const d60 = new Date(now - 60 * 86400_000).toISOString();
    const recent = tenantDeals.filter((d) => d.created_at >= d30).reduce((s, d) => s + (d.escrow_amount ?? 0), 0);
    const previous = tenantDeals.filter((d) => d.created_at >= d60 && d.created_at < d30).reduce((s, d) => s + (d.escrow_amount ?? 0), 0);
    const gmvGrowthRate = previous > 0 ? Math.round(((recent - previous) / previous) * 100) : 0;

    return {
      tenantId: t.id,
      tenantName: t.name,
      activeStudents: uniqueStudents || tenantMembers.length,
      activeSponsors: uniqueSponsors,
      dealCount: tenantDeals.length,
      gmv,
      gmvGrowthRate,
    };
  });

  const top5 = [...tenantMetrics].sort((a, b) => b.gmv - a.gmv).slice(0, 5);

  log.info("University growth report generated", { tenantCount: tenantMetrics.length });
  return { tenants: tenantMetrics, top5, totalActiveTenants: tenants.length };
}
