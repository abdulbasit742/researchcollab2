/**
 * Policy Transparency Report — anonymized public governance metrics.
 */

import { supabase } from "@/integrations/supabase/client";
import { calculateSystemHealth } from "./systemHealthModel";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("policyTransparencyReport");

export interface PolicyTransparencyReport {
  activePolicies: number;
  recentProposals: number;
  passedPolicies: number;
  rejectedPolicies: number;
  pendingRecommendations: number;
  networkHealthIndex: number;
  innovationIndex: number;
  riskSimulationsSummary: { total: number; highRisk: number; lowRisk: number };
  timestamp: string;
}

export async function generatePolicyTransparencyReport(): Promise<PolicyTransparencyReport> {
  const { data: policies } = await (supabase as any).from("governance_policies").select("status, simulation_report");
  const all = policies ?? [];

  const active = all.filter((p: any) => p.status === "active").length;
  const proposed = all.filter((p: any) => p.status === "proposed" || p.status === "simulated").length;
  const passed = active; // active = passed
  const rejected = all.filter((p: any) => p.status === "rejected").length;

  // Simulation risk summary
  const simulated = all.filter((p: any) => p.simulation_report != null);
  const highRisk = simulated.filter((p: any) => (p.simulation_report as any)?.riskAssessment === "high").length;
  const lowRisk = simulated.filter((p: any) => (p.simulation_report as any)?.riskAssessment === "low").length;

  // Pending recommendations
  const { data: recs } = await (supabase as any).from("optimizer_recommendations").select("id").eq("status", "pending");

  // System health
  const health = await calculateSystemHealth();

  log.info("Policy transparency report generated");

  return {
    activePolicies: active, recentProposals: proposed,
    passedPolicies: passed, rejectedPolicies: rejected,
    pendingRecommendations: recs?.length ?? 0,
    networkHealthIndex: health.globalNetworkHealthIndex,
    innovationIndex: health.innovationGrowth,
    riskSimulationsSummary: { total: simulated.length, highRisk, lowRisk },
    timestamp: new Date().toISOString(),
  };
}
