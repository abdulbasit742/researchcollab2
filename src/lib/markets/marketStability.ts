/**
 * Capital Market Stability Engine — ACADEMIC_CAPITAL_MARKET_STABILITY_INDEX (0–100).
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("marketStability");

export interface MarketStabilityAssessment {
  capitalConcentration: number;
  liquidityFragmentation: number;
  creditRatingClustering: number;
  bondIssuanceVolume: number;
  crossBorderExposure: number;
  defaultClusteringProbability: number;
  academicCapitalMarketStabilityIndex: number;
  risks: string[];
}

export async function calculateMarketStability(): Promise<MarketStabilityAssessment> {
  const risks: string[] = [];

  // Capital concentration
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, tenant_id");
  const totalCapital = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const tenantCapitals: Record<string, number> = {};
  for (const p of pools ?? []) {
    tenantCapitals[p.tenant_id ?? "unknown"] = (tenantCapitals[p.tenant_id ?? "unknown"] ?? 0) + (p.total_committed ?? 0);
  }
  const maxShare = totalCapital > 0 ? Math.max(...Object.values(tenantCapitals)) / totalCapital : 0;
  const capitalConcentration = Math.round(maxShare * 100);
  if (capitalConcentration > 40) risks.push("Capital concentration exceeds 40%");

  // Liquidity fragmentation
  const poolCount = (pools ?? []).length;
  const fragmentation = poolCount > 0 ? Math.max(0, 100 - poolCount * 8) : 100;
  if (fragmentation > 60) risks.push("Liquidity fragmentation is high");

  // Credit rating clustering
  const { data: credits } = await (supabase as any).from("institution_credit_profiles").select("rating_band");
  const bands: Record<string, number> = {};
  for (const c of credits ?? []) { bands[c.rating_band] = (bands[c.rating_band] ?? 0) + 1; }
  const uniqueBands = Object.keys(bands).length;
  const clustering = uniqueBands > 0 ? Math.max(0, 100 - uniqueBands * 15) : 50;

  // Bond issuance
  const { data: bonds } = await (supabase as any).from("research_bonds").select("total_principal, default_probability, status").eq("status", "active");
  const bondVolume = (bonds ?? []).reduce((s: number, b: any) => s + (b.total_principal ?? 0), 0);
  const bondVolumeRatio = totalCapital > 0 ? Math.min(100, Math.round((bondVolume / totalCapital) * 100)) : 0;

  // Cross-border exposure
  const { data: assets } = await (supabase as any).from("research_capital_assets").select("backing_type, total_value").eq("is_active", true);
  const crossBorderVal = (assets ?? []).filter((a: any) => a.backing_type === "cross_border_research").reduce((s: number, a: any) => s + (a.total_value ?? 0), 0);
  const crossBorderPct = totalCapital > 0 ? Math.min(100, Math.round((crossBorderVal / totalCapital) * 100)) : 0;

  // Default clustering
  const avgDefault = (bonds ?? []).length > 0 ? (bonds ?? []).reduce((s: number, b: any) => s + (b.default_probability ?? 0), 0) / bonds.length : 0;
  const defaultClustering = Math.round(avgDefault * 1.5);

  // Composite
  const score = Math.max(0, Math.min(100, Math.round(
    (100 - capitalConcentration) * 0.2 +
    (100 - fragmentation) * 0.15 +
    (100 - clustering) * 0.15 +
    (100 - Math.min(80, bondVolumeRatio)) * 0.15 +
    crossBorderPct * 0.15 +
    (100 - defaultClustering) * 0.2
  )));

  log.info("Market stability calculated", { score });

  return {
    capitalConcentration, liquidityFragmentation: fragmentation, creditRatingClustering: clustering,
    bondIssuanceVolume: bondVolumeRatio, crossBorderExposure: crossBorderPct,
    defaultClusteringProbability: defaultClustering, academicCapitalMarketStabilityIndex: score, risks,
  };
}
