/**
 * Macro Stability Engine — measures systemic stability including
 * dispute contagion risk, capital overexposure, reputation collapse clusters.
 *
 * Returns system_stability_index (0–100). Triggers governance if below threshold.
 */

import { supabase } from "@/integrations/supabase/client";

export interface StabilityReport {
  stabilityIndex: number;
  status: "stable" | "caution" | "warning" | "critical";
  risks: Array<{ type: string; severity: number; description: string }>;
  shouldTriggerGovernance: boolean;
  computedAt: string;
}

const GOVERNANCE_THRESHOLD = 40;

export async function computeSystemStability(): Promise<StabilityReport> {
  const [trustRes, poolsRes, dealsRes, advancesRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("trust_score, dispute_rate, trust_velocity_24h"),
    supabase.from("funding_pools").select("total_capital, available_capital, deployed_capital"),
    supabase.from("deal_rooms").select("status").in("status", ["disputed", "active", "completed"]),
    supabase.from("capital_advances").select("status, approved_amount, repaid_amount"),
  ]);

  const trusts = trustRes.data ?? [];
  const pools = poolsRes.data ?? [];
  const deals = dealsRes.data ?? [];
  const advances = advancesRes.data ?? [];
  const risks: StabilityReport["risks"] = [];

  // 1. Dispute contagion (0–25)
  const highDisputeUsers = trusts.filter(t => (t.dispute_rate ?? 0) > 0.2).length;
  const contagionRisk = Math.min(25, Math.round((highDisputeUsers / Math.max(1, trusts.length)) * 100));
  if (contagionRisk > 10) risks.push({ type: "dispute_contagion", severity: contagionRisk, description: `${highDisputeUsers} users with >20% dispute rate` });

  // 2. Capital overexposure (0–25)
  const totalCapital = pools.reduce((s, p) => s + (p.total_capital ?? 0), 0);
  const available = pools.reduce((s, p) => s + (p.available_capital ?? 0), 0);
  const exposureRatio = totalCapital > 0 ? 1 - (available / totalCapital) : 0;
  const exposureRisk = Math.min(25, Math.round(exposureRatio * 25));
  if (exposureRisk > 15) risks.push({ type: "capital_overexposure", severity: exposureRisk, description: `${Math.round(exposureRatio * 100)}% capital deployed` });

  // 3. Reputation collapse (0–25)
  const collapsingUsers = trusts.filter(t => (t.trust_velocity_24h ?? 0) < -5).length;
  const collapseRisk = Math.min(25, Math.round((collapsingUsers / Math.max(1, trusts.length)) * 150));
  if (collapseRisk > 5) risks.push({ type: "reputation_collapse", severity: collapseRisk, description: `${collapsingUsers} users with rapid trust decline` });

  // 4. Default clustering (0–25)
  const defaulted = advances.filter(a => a.status === "defaulted").length;
  const totalAdvances = Math.max(1, advances.length);
  const defaultRisk = Math.min(25, Math.round((defaulted / totalAdvances) * 100));
  if (defaultRisk > 5) risks.push({ type: "default_clustering", severity: defaultRisk, description: `${defaulted} capital advances defaulted` });

  const stabilityIndex = Math.max(0, 100 - contagionRisk - exposureRisk - collapseRisk - defaultRisk);
  const status = stabilityIndex >= 75 ? "stable" : stabilityIndex >= 50 ? "caution" : stabilityIndex >= GOVERNANCE_THRESHOLD ? "warning" : "critical";

  return {
    stabilityIndex,
    status,
    risks,
    shouldTriggerGovernance: stabilityIndex < GOVERNANCE_THRESHOLD,
    computedAt: new Date().toISOString(),
  };
}
