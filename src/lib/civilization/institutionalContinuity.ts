/**
 * Institutional Continuity Framework — node exit, capital settlement, emergency protocols.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("institutionalContinuity");

export interface ContinuityAssessment {
  orphanedCapitalRisk: number;
  escrowIntegrity: number;
  trustCorruptionRisk: number;
  fallbackPartnerCoverage: number;
  emergencyLiquidityAvailable: number;
  continuityScore: number;
}

export async function assessInstitutionalContinuity(): Promise<ContinuityAssessment> {
  // Check for capital that could be orphaned (nodes with low trust)
  const { data: nodes } = await (supabase as any).from("sovereign_nodes")
    .select("id, node_trust_score, total_network_capital_contributed");
  const atRiskNodes = (nodes ?? []).filter((n: any) => (n.node_trust_score ?? 50) < 30);
  const atRiskCapital = atRiskNodes.reduce((s: number, n: any) => s + (n.total_network_capital_contributed ?? 0), 0);
  const totalCapital = (nodes ?? []).reduce((s: number, n: any) => s + (n.total_network_capital_contributed ?? 0), 0);
  const orphanRisk = totalCapital > 0 ? Math.round((atRiskCapital / totalCapital) * 100) : 0;

  // Escrow integrity: check active deals have proper escrow
  const { data: deals } = await supabase.from("deal_rooms").select("status, escrow_amount, escrow_status");
  const activeDeals = (deals ?? []).filter((d) => ["active", "in_progress"].includes(d.status ?? ""));
  const properEscrow = activeDeals.filter((d) => d.escrow_amount && d.escrow_amount > 0).length;
  const escrowIntegrity = activeDeals.length > 0 ? Math.round((properEscrow / activeDeals.length) * 100) : 100;

  // Fallback partner coverage (cross-border agreements)
  const { data: agreements } = await (supabase as any).from("cross_border_agreements").select("id").eq("active", true);
  const { data: interGov } = await (supabase as any).from("intergovernmental_agreements").select("id").eq("active", true);
  const fallbackCoverage = Math.min(100, ((agreements?.length ?? 0) + (interGov?.length ?? 0)) * 10);

  // Emergency liquidity
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const reserves = (pools ?? []).reduce((s: number, p: any) => s + ((p.total_committed ?? 0) - (p.total_allocated ?? 0)), 0);
  const emergencyLiquidity = Math.min(100, reserves > 0 ? Math.round(Math.log10(reserves + 1) * 20) : 0);

  const trustCorruption = Math.round(orphanRisk * 0.5 + (100 - escrowIntegrity) * 0.5);

  const continuityScore = Math.round(
    (100 - orphanRisk) * 0.25 + escrowIntegrity * 0.25 + (100 - trustCorruption) * 0.15 +
    fallbackCoverage * 0.2 + emergencyLiquidity * 0.15
  );

  log.info("Institutional continuity assessed", { continuityScore });

  return {
    orphanedCapitalRisk: orphanRisk, escrowIntegrity, trustCorruptionRisk: trustCorruption,
    fallbackPartnerCoverage: fallbackCoverage, emergencyLiquidityAvailable: emergencyLiquidity,
    continuityScore,
  };
}
