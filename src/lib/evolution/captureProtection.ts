/**
 * Anti-Governance Capture Framework — detect and mitigate capture attempts.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("captureProtection");

export interface CaptureRiskAssessment {
  votingConcentrationRisk: number;
  coordinatedClusterRisk: number;
  capitalDominanceRisk: number;
  trustManipulationRisk: number;
  crossRegionCollusionRisk: number;
  overallCaptureRisk: number;
  captureDetected: boolean;
  recommendedActions: string[];
}

export async function assessCaptureRisk(): Promise<CaptureRiskAssessment> {
  // Voting concentration
  const { data: profiles } = await (supabase as any).from("sovereignty_profiles").select("tenant_id, trust_score, capital_contribution_score, governance_participation_score");
  const totalGov = (profiles ?? []).reduce((s: number, p: any) => s + (p.governance_participation_score ?? 0), 0);
  const maxGov = (profiles ?? []).reduce((m: number, p: any) => Math.max(m, p.governance_participation_score ?? 0), 0);
  const votingConcentration = totalGov > 0 ? Math.round((maxGov / totalGov) * 100) : 0;

  // Capital dominance
  const totalCap = (profiles ?? []).reduce((s: number, p: any) => s + (p.capital_contribution_score ?? 0), 0);
  const maxCap = (profiles ?? []).reduce((m: number, p: any) => Math.max(m, p.capital_contribution_score ?? 0), 0);
  const capitalDominance = totalCap > 0 ? Math.round((maxCap / totalCap) * 100) : 0;

  // Trust manipulation: look for suspicious uniformity
  const trustScores = (profiles ?? []).map((p: any) => p.trust_score ?? 0);
  const avgTrust = trustScores.length > 0 ? trustScores.reduce((s: number, t: number) => s + t, 0) / trustScores.length : 0;
  const trustVariance = trustScores.length > 0 ? trustScores.reduce((s: number, t: number) => s + Math.pow(t - avgTrust, 2), 0) / trustScores.length : 0;
  const trustManipulation = trustVariance < 5 && trustScores.length > 3 ? 70 : Math.max(0, 30 - Math.round(Math.sqrt(trustVariance)));

  // Coordinated clusters (simplified: top-2 entities > 50%)
  const sorted = (profiles ?? []).map((p: any) => p.governance_participation_score ?? 0).sort((a: number, b: number) => b - a);
  const top2 = sorted.slice(0, 2).reduce((s: number, v: number) => s + v, 0);
  const clusterRisk = totalGov > 0 ? Math.round((top2 / totalGov) * 100) : 0;

  // Cross-region collusion
  const collusionRisk = Math.max(0, clusterRisk - 20);

  // Overall
  const overall = Math.min(100, Math.round(
    votingConcentration * 0.25 + clusterRisk * 0.2 + capitalDominance * 0.25 +
    trustManipulation * 0.15 + collusionRisk * 0.15
  ));
  const detected = overall > 60;

  const actions: string[] = [];
  if (detected) {
    if (votingConcentration > 40) actions.push("Reduce max voting weight cap");
    if (capitalDominance > 40) actions.push("Enforce capital contribution diversification");
    if (clusterRisk > 50) actions.push("Freeze proposals pending review");
    if (trustManipulation > 50) actions.push("Trigger trust audit");
    if (collusionRisk > 40) actions.push("Activate cross-region vote isolation");
    log.error("Governance capture risk detected", { overall });
  }

  return {
    votingConcentrationRisk: votingConcentration, coordinatedClusterRisk: clusterRisk,
    capitalDominanceRisk: capitalDominance, trustManipulationRisk: trustManipulation,
    crossRegionCollusionRisk: collusionRisk, overallCaptureRisk: overall,
    captureDetected: detected, recommendedActions: actions,
  };
}
