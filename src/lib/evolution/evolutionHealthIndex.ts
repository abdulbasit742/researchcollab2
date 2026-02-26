/**
 * Evolution Health Index — EVOLUTION_STABILITY_SCORE (0-100).
 */

import { getNetworkMaturityLevel } from "./sovereigntyMaturity";
import { getFounderDependencyRatio } from "./founderSafeguards";
import { assessCaptureRisk } from "./captureProtection";
import { createLogger } from "@/lib/core/logger";
import { supabase } from "@/integrations/supabase/client";

const log = createLogger("evolutionHealth");

export interface EvolutionHealthScore {
  governanceStability: number;
  captureRisk: number;
  trustDistributionBalance: number;
  founderDependencyRatio: number;
  sovereigntyMaturityLevel: number;
  institutionalAutonomyBalance: number;
  evolutionStabilityScore: number;
  timestamp: string;
}

export async function calculateEvolutionHealth(): Promise<EvolutionHealthScore> {
  const [maturity, founderDep, capture] = await Promise.all([
    getNetworkMaturityLevel(),
    getFounderDependencyRatio(),
    assessCaptureRisk(),
  ]);

  // Trust distribution balance
  const { data: profiles } = await (supabase as any).from("sovereignty_profiles").select("trust_score");
  const scores = (profiles ?? []).map((p: any) => p.trust_score ?? 0);
  const avg = scores.length > 0 ? scores.reduce((s: number, v: number) => s + v, 0) / scores.length : 0;
  const variance = scores.length > 0 ? scores.reduce((s: number, v: number) => s + Math.pow(v - avg, 2), 0) / scores.length : 0;
  const trustBalance = Math.max(0, Math.min(100, 100 - Math.round(Math.sqrt(variance))));

  // Governance stability: higher maturity = more stable
  const govStability = Math.min(100, maturity * 25);

  // Institutional autonomy balance
  const autonomyBalance = Math.min(100, Math.round((100 - founderDep) * 0.5 + maturity * 12.5));

  const score = Math.min(100, Math.round(
    govStability * 0.2 + (100 - capture.overallCaptureRisk) * 0.2 + trustBalance * 0.15 +
    (100 - founderDep) * 0.15 + (maturity * 25) * 0.15 + autonomyBalance * 0.15
  ));

  log.info("Evolution health calculated", { score });

  return {
    governanceStability: govStability, captureRisk: capture.overallCaptureRisk,
    trustDistributionBalance: trustBalance, founderDependencyRatio: founderDep,
    sovereigntyMaturityLevel: maturity, institutionalAutonomyBalance: autonomyBalance,
    evolutionStabilityScore: score, timestamp: new Date().toISOString(),
  };
}
