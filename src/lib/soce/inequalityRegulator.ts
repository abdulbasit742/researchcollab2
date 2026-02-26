/**
 * Institutional Inequality Regulator — INEQUALITY_BALANCE_INDEX.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("inequalityRegulator");

export interface InequalityReport {
  capitalConcentrationGini: number;
  trustDisparity: number;
  innovationAccessImbalance: number;
  crossRegionFundingGap: number;
  inequalityBalanceIndex: number;
  recommendations: string[];
  timestamp: string;
}

function giniCoefficient(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((s, v) => s + v, 0) / n;
  if (mean === 0) return 0;
  let sumDiff = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sumDiff += Math.abs(sorted[i] - sorted[j]);
    }
  }
  return Math.round((sumDiff / (2 * n * n * mean)) * 100);
}

export async function assessInequality(): Promise<InequalityReport> {
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id, node_trust_score, total_network_capital_contributed, region_id");

  const capitalValues = (nodes ?? []).map((n: any) => n.total_network_capital_contributed ?? 0);
  const trustValues = (nodes ?? []).map((n: any) => n.node_trust_score ?? 0);
  const capitalGini = giniCoefficient(capitalValues);

  // Trust disparity
  const maxTrust = trustValues.length > 0 ? Math.max(...trustValues) : 0;
  const minTrust = trustValues.length > 0 ? Math.min(...trustValues) : 0;
  const trustDisparity = maxTrust - minTrust;

  // Cross-region funding gap
  const regionCapital: Record<string, number> = {};
  for (const n of nodes ?? []) {
    const r = n.region_id ?? "unknown";
    regionCapital[r] = (regionCapital[r] ?? 0) + (n.total_network_capital_contributed ?? 0);
  }
  const regionValues = Object.values(regionCapital);
  const maxRegion = regionValues.length > 0 ? Math.max(...regionValues) : 0;
  const minRegion = regionValues.length > 0 ? Math.min(...regionValues) : 0;
  const fundingGap = maxRegion > 0 ? Math.round(((maxRegion - minRegion) / maxRegion) * 100) : 0;

  // Innovation access: deal distribution
  const { data: deals } = await supabase.from("deal_rooms").select("tenant_id");
  const tenantDeals: Record<string, number> = {};
  for (const d of deals ?? []) {
    tenantDeals[d.tenant_id ?? "unknown"] = (tenantDeals[d.tenant_id ?? "unknown"] ?? 0) + 1;
  }
  const dealCounts = Object.values(tenantDeals);
  const innovationImbalance = giniCoefficient(dealCounts);

  // Balance index: lower inequality = higher index
  const balanceIndex = Math.max(0, Math.min(100, Math.round(
    (100 - capitalGini) * 0.3 + (100 - trustDisparity) * 0.2 +
    (100 - fundingGap) * 0.25 + (100 - innovationImbalance) * 0.25
  )));

  const recommendations: string[] = [];
  if (capitalGini > 50) recommendations.push("Implement capital contribution caps for dominant nodes");
  if (trustDisparity > 40) recommendations.push("Strengthen outcome-based trust building for underperforming nodes");
  if (fundingGap > 60) recommendations.push("Create cross-region funding equalization incentives");
  if (innovationImbalance > 50) recommendations.push("Open innovation access channels for underserved institutions");

  log.info("Inequality assessed", { balanceIndex, capitalGini });

  return {
    capitalConcentrationGini: capitalGini, trustDisparity, innovationAccessImbalance: innovationImbalance,
    crossRegionFundingGap: fundingGap, inequalityBalanceIndex: balanceIndex,
    recommendations, timestamp: new Date().toISOString(),
  };
}
