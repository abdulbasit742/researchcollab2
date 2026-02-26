/**
 * Government Oversight Dashboard Data Layer — aggregated institution analytics.
 */

import { supabase } from "@/integrations/supabase/client";
import { calculateInstitutionScore, type InstitutionScore } from "./performanceAllocator";
import { getNationalMetrics, type NationalMetrics } from "./nationalMetrics";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("oversightDashboard");

export interface OversightDashboardData {
  nationalMetrics: NationalMetrics;
  institutionRankings: InstitutionScore[];
  performanceBands: { high: number; medium: number; low: number };
  grantUtilizationRate: number;
  complianceDistribution: { compliant: number; nonCompliant: number };
  totalGoverningBodies: number;
  timestamp: string;
}

export async function getOversightDashboardData(regionId: string): Promise<OversightDashboardData> {
  const metrics = await getNationalMetrics(regionId);

  // Get tenants in region
  const { data: tenants } = await (supabase as any).from("tenants").select("id").eq("region_id", regionId).limit(50);
  const tenantIds = (tenants ?? []).map((t: any) => t.id);

  // Score institutions
  const rankings: InstitutionScore[] = [];
  for (const tid of tenantIds.slice(0, 20)) {
    try {
      rankings.push(await calculateInstitutionScore(tid));
    } catch { /* skip */ }
  }
  rankings.sort((a, b) => b.compositeScore - a.compositeScore);

  // Performance bands
  const high = rankings.filter((r) => r.compositeScore >= 70).length;
  const medium = rankings.filter((r) => r.compositeScore >= 40 && r.compositeScore < 70).length;
  const low = rankings.filter((r) => r.compositeScore < 40).length;

  // Grant utilization
  const { data: pools } = await (supabase as any).from("public_grant_pools").select("total_committed, total_allocated").eq("region_id", regionId);
  const totalCommitted = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const grantUtilizationRate = totalCommitted > 0 ? Math.round((totalAllocated / totalCommitted) * 100) : 0;

  // Compliance distribution
  const compliant = rankings.filter((r) => r.complianceStatus === "compliant").length;

  // Governing bodies
  const { data: bodies } = await (supabase as any).from("governing_bodies").select("id").eq("region_id", regionId);

  log.info("Oversight dashboard data loaded", { regionId });

  return {
    nationalMetrics: metrics,
    institutionRankings: rankings,
    performanceBands: { high, medium, low },
    grantUtilizationRate,
    complianceDistribution: { compliant, nonCompliant: rankings.length - compliant },
    totalGoverningBodies: bodies?.length ?? 0,
    timestamp: new Date().toISOString(),
  };
}
