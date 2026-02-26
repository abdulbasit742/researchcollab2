/**
 * World Transparency Snapshot — anonymized public metrics, zero sensitive data.
 */

import { supabase } from "@/integrations/supabase/client";
import { calculateWorldHealthIndex } from "./globalHealthIndex";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("worldTransparency");

export interface WorldTransparencySnapshot {
  totalGlobalInstitutions: number;
  totalGlobalCapitalDeployed: number;
  crossBorderFundingPercent: number;
  innovationGrowthPercent: number;
  globalCompletionRate: number;
  riskIndexBand: string;
  trustIndexBand: string;
  worldHealthIndex: number;
  activeRegions: number;
  sovereignNodes: number;
  timestamp: string;
}

export async function generateWorldTransparencySnapshot(): Promise<WorldTransparencySnapshot> {
  const health = await calculateWorldHealthIndex();

  const { data: tenants } = await (supabase as any).from("tenants").select("id");
  const { data: regions } = await (supabase as any).from("regions").select("id").eq("status", "active");
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id").eq("sovereign_status", true);

  // Capital
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_allocated");
  const { data: grants } = await (supabase as any).from("public_grant_pools").select("total_allocated");
  const totalCapital = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0)
    + (grants ?? []).reduce((s: number, g: any) => s + (g.total_allocated ?? 0), 0);

  // Cross-border
  const { data: routes } = await (supabase as any).from("network_capital_routes").select("amount, cross_border_agreement_id").eq("status", "completed");
  const totalRouted = (routes ?? []).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorder = (routes ?? []).filter((r: any) => r.cross_border_agreement_id != null).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const crossBorderPercent = totalRouted > 0 ? Math.round((crossBorder / totalRouted) * 100) : 0;

  // Completion rate
  const { data: deals } = await supabase.from("deal_rooms").select("status");
  const allDeals = deals ?? [];
  const completed = allDeals.filter((d) => d.status === "completed").length;
  const completionRate = allDeals.length > 0 ? Math.round((completed / allDeals.length) * 100) : 0;

  // Bands
  const riskBand = health.riskScore < 30 ? "low" : health.riskScore < 60 ? "moderate" : "elevated";
  const trustBand = health.trustIndex > 70 ? "high" : health.trustIndex > 40 ? "moderate" : "developing";

  log.info("World transparency snapshot generated");

  return {
    totalGlobalInstitutions: tenants?.length ?? 0,
    totalGlobalCapitalDeployed: totalCapital,
    crossBorderFundingPercent: crossBorderPercent,
    innovationGrowthPercent: health.innovationGrowth,
    globalCompletionRate: completionRate,
    riskIndexBand: riskBand, trustIndexBand: trustBand,
    worldHealthIndex: health.worldNetworkHealthIndex,
    activeRegions: regions?.length ?? 0,
    sovereignNodes: nodes?.length ?? 0,
    timestamp: new Date().toISOString(),
  };
}
