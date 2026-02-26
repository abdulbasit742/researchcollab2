/**
 * Global Civilization Transparency Report — anonymized public metrics.
 */

import { supabase } from "@/integrations/supabase/client";
import { calculatePlanetaryHealth } from "./planetaryHealthIndex";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("planetaryTransparency");

export interface PlanetaryTransparencyReport {
  totalInstitutions: number;
  totalCapitalDeployed: number;
  crossBorderCapitalPercent: number;
  innovationIndex: number;
  riskBand: string;
  liquidityBand: string;
  governanceStabilityBand: string;
  trustIndexBand: string;
  planetaryHealthScore: number;
  activeRegions: number;
  sovereignNodes: number;
  timestamp: string;
}

function toBand(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "strong";
  if (score >= 40) return "moderate";
  if (score >= 20) return "developing";
  return "critical";
}

export async function generatePlanetaryTransparencyReport(): Promise<PlanetaryTransparencyReport> {
  const health = await calculatePlanetaryHealth();

  const { data: tenants } = await (supabase as any).from("tenants").select("id");
  const { data: regions } = await (supabase as any).from("regions").select("id").eq("status", "active");
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id").eq("sovereign_status", true);

  const { data: pools } = await (supabase as any).from("capital_pools").select("total_allocated");
  const totalCapital = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);

  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, cross_border_agreement_id").eq("status", "completed");
  const totalRouted = (routes ?? []).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorder = (routes ?? []).filter((r: any) => r.cross_border_agreement_id).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorderPercent = totalRouted > 0 ? Math.round((crossBorder / totalRouted) * 100) : 0;

  log.info("Planetary transparency report generated");

  return {
    totalInstitutions: tenants?.length ?? 0,
    totalCapitalDeployed: totalCapital,
    crossBorderCapitalPercent: crossBorderPercent,
    innovationIndex: health.innovationGrowth,
    riskBand: toBand(health.riskDistribution),
    liquidityBand: toBand(health.liquidityStability),
    governanceStabilityBand: toBand(health.governanceStability),
    trustIndexBand: toBand(health.trustStrength),
    planetaryHealthScore: health.planetaryInstitutionalHealthScore,
    activeRegions: regions?.length ?? 0,
    sovereignNodes: nodes?.length ?? 0,
    timestamp: new Date().toISOString(),
  };
}
