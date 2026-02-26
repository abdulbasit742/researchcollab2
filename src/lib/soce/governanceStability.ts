/**
 * Governance Stability Optimizer — GOVERNANCE_STABILITY_SCORE.
 */

import { supabase } from "@/integrations/supabase/client";
import { assessCaptureRisk } from "@/lib/evolution/captureProtection";
import { getNetworkMaturityLevel } from "@/lib/evolution/sovereigntyMaturity";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("governanceStability");

export interface GovernanceStabilityResult {
  votingFragmentation: number;
  powerConcentration: number;
  captureRisk: number;
  policyChurnFrequency: number;
  participationHealth: number;
  governanceStabilityScore: number;
  recommendations: string[];
  timestamp: string;
}

export async function analyzeGovernanceStability(): Promise<GovernanceStabilityResult> {
  const capture = await assessCaptureRisk();
  const maturity = await getNetworkMaturityLevel();

  const { data: profiles } = await (supabase as any).from("sovereignty_profiles").select("governance_participation_score, trust_score");
  const govScores = (profiles ?? []).map((p: any) => p.governance_participation_score ?? 0);
  const avgParticipation = govScores.length > 0 ? govScores.reduce((s: number, v: number) => s + v, 0) / govScores.length : 0;

  // Voting fragmentation: high when many low-participation entities
  const lowParticipation = govScores.filter((s: number) => s < 20).length;
  const fragmentation = govScores.length > 0 ? Math.round((lowParticipation / govScores.length) * 100) : 0;

  // Policy churn (simplified: based on governance audit log volume)
  const { data: logs } = await (supabase as any).from("governance_audit_logs").select("id").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());
  const churn = Math.min(100, (logs?.length ?? 0) * 2);

  const stabilityScore = Math.max(0, Math.min(100, Math.round(
    (100 - capture.overallCaptureRisk) * 0.25 + (100 - fragmentation) * 0.2 +
    avgParticipation * 0.2 + (maturity * 25) * 0.2 + (100 - churn) * 0.15
  )));

  const recommendations: string[] = [];
  if (fragmentation > 50) recommendations.push("Incentivize governance participation for inactive institutions");
  if (capture.overallCaptureRisk > 40) recommendations.push("Strengthen voting caps and concentration limits");
  if (churn > 60) recommendations.push("Stabilize policy change cadence to reduce governance fatigue");

  log.info("Governance stability analyzed", { stabilityScore });

  return {
    votingFragmentation: fragmentation, powerConcentration: capture.votingConcentrationRisk,
    captureRisk: capture.overallCaptureRisk, policyChurnFrequency: churn,
    participationHealth: Math.round(avgParticipation), governanceStabilityScore: stabilityScore,
    recommendations, timestamp: new Date().toISOString(),
  };
}
