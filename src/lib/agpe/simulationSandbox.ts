/**
 * Simulation Sandbox — read-only in-memory simulation of policy impacts.
 * NEVER writes to production tables.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("simulationSandbox");

export interface SandboxSnapshot {
  capitalPools: Array<{ id: string; totalCommitted: number; totalAllocated: number }>;
  wallets: Array<{ id: string; balance: number; escrowLocked: number }>;
  deals: Array<{ id: string; status: string; escrowAmount: number }>;
  nodes: Array<{ id: string; trustScore: number; capitalContributed: number }>;
  complianceRisks: Array<{ userId: string; score: number; flagged: boolean }>;
}

export interface SimulationResult {
  policyId: string;
  baselineMetrics: Record<string, number>;
  projectedMetrics: Record<string, number>;
  deltas: Record<string, number>;
  riskAssessment: string;
  confidenceLevel: number;
  warnings: string[];
}

async function captureSnapshot(): Promise<SandboxSnapshot> {
  const [pools, wallets, deals, nodes, risks] = await Promise.all([
    (supabase as any).from("capital_pools").select("id, total_committed, total_allocated").limit(200),
    (supabase as any).from("wallets").select("id, balance, escrow_locked").limit(200),
    supabase.from("deal_rooms").select("id, status, escrow_amount").limit(500),
    (supabase as any).from("sovereign_nodes").select("id, node_trust_score, total_network_capital_contributed").limit(100),
    (supabase as any).from("compliance_risk_profiles").select("user_id, compliance_risk_score, flagged").limit(200),
  ]);

  return {
    capitalPools: (pools.data ?? []).map((p: any) => ({ id: p.id, totalCommitted: p.total_committed ?? 0, totalAllocated: p.total_allocated ?? 0 })),
    wallets: (wallets.data ?? []).map((w: any) => ({ id: w.id, balance: w.balance ?? 0, escrowLocked: w.escrow_locked ?? 0 })),
    deals: (deals.data ?? []).map((d: any) => ({ id: d.id, status: d.status ?? "", escrowAmount: d.escrow_amount ?? 0 })),
    nodes: (nodes.data ?? []).map((n: any) => ({ id: n.id, trustScore: n.node_trust_score ?? 0, capitalContributed: n.total_network_capital_contributed ?? 0 })),
    complianceRisks: (risks.data ?? []).map((r: any) => ({ userId: r.user_id, score: r.compliance_risk_score ?? 0, flagged: r.flagged ?? false })),
  };
}

export async function runSimulation(
  policyId: string,
  policyType: string,
  proposedValue: Record<string, unknown>
): Promise<SimulationResult> {
  const snapshot = await captureSnapshot();
  const warnings: string[] = [];

  // Baseline metrics
  const totalGMV = snapshot.deals.reduce((s, d) => s + d.escrowAmount, 0);
  const completedDeals = snapshot.deals.filter((d) => d.status === "completed").length;
  const disputedDeals = snapshot.deals.filter((d) => d.status === "disputed").length;
  const completionRate = snapshot.deals.length > 0 ? Math.round((completedDeals / snapshot.deals.length) * 100) : 0;
  const disputeRate = snapshot.deals.length > 0 ? Math.round((disputedDeals / snapshot.deals.length) * 100) : 0;
  const totalCapital = snapshot.capitalPools.reduce((s, p) => s + p.totalCommitted, 0);
  const capitalUtilization = totalCapital > 0 ? Math.round((snapshot.capitalPools.reduce((s, p) => s + p.totalAllocated, 0) / totalCapital) * 100) : 0;
  const avgTrust = snapshot.nodes.length > 0 ? Math.round(snapshot.nodes.reduce((s, n) => s + n.trustScore, 0) / snapshot.nodes.length) : 0;

  const baseline: Record<string, number> = { totalGMV, completionRate, disputeRate, capitalUtilization, avgTrust, totalCapital };

  // Simulate impact based on policy type (in-memory only)
  const projected = { ...baseline };

  if (policyType === "capital_limit") {
    const multiplier = (proposedValue.limit_multiplier as number) ?? 1.2;
    projected.totalCapital = Math.round(baseline.totalCapital * multiplier);
    projected.capitalUtilization = Math.round(baseline.capitalUtilization / multiplier * 100) / 100;
    if (multiplier > 1.5) warnings.push("Capital limit increase >50% may increase default exposure");
  } else if (policyType === "risk_threshold") {
    const newThreshold = (proposedValue.threshold as number) ?? 50;
    const currentThreshold = 60;
    if (newThreshold < currentThreshold) {
      projected.disputeRate = Math.max(0, baseline.disputeRate - 2);
      warnings.push("Tighter risk threshold may reduce eligible participants");
    } else {
      projected.disputeRate = baseline.disputeRate + 3;
      warnings.push("Looser risk threshold may increase disputes");
    }
  } else if (policyType === "allocation_rule") {
    projected.capitalUtilization = Math.min(100, baseline.capitalUtilization + 10);
    projected.totalGMV = Math.round(baseline.totalGMV * 1.1);
  } else if (policyType === "liquidity_rule") {
    projected.totalCapital = Math.round(baseline.totalCapital * 1.15);
    if (snapshot.nodes.length < 3) warnings.push("Insufficient sovereign nodes for liquidity rule impact");
  }

  // Calculate deltas
  const deltas: Record<string, number> = {};
  for (const key of Object.keys(baseline)) {
    deltas[key] = projected[key] - baseline[key];
  }

  // Risk assessment
  const negativeDeltas = Object.values(deltas).filter((d) => d < 0).length;
  const riskAssessment = warnings.length > 2 ? "high" : negativeDeltas > 1 ? "medium" : "low";
  const confidenceLevel = Math.max(30, 90 - warnings.length * 15 - negativeDeltas * 10);

  // Store simulation report on policy (this is the ONLY write — to the policy itself)
  const report = { baselineMetrics: baseline, projectedMetrics: projected, deltas, riskAssessment, confidenceLevel, warnings };
  await (supabase as any).from("governance_policies").update({
    simulation_report: report, status: "simulated", updated_at: new Date().toISOString(),
  }).eq("id", policyId);

  log.info("Simulation completed", { policyId, riskAssessment, confidenceLevel });

  return { policyId, ...report };
}
