/**
 * Institutional Longevity Protocol — multi-decade survival modeling.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("institutionLongevity");

export interface InstitutionalLongevityProfile {
  survivalProbability: number;
  trustDecayProjection: number;
  capitalEfficiencyDegradation: number;
  governanceContinuityScore: number;
  successionReadiness: number;
  reputationPersistence: number;
  institutionalLongevityScore: number;
}

export async function calculateInstitutionalLongevity(): Promise<InstitutionalLongevityProfile> {
  // Trust decay: based on current trust distribution
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("node_trust_score, total_network_capital_contributed");
  const avgTrust = (nodes ?? []).length > 0
    ? (nodes ?? []).reduce((s: number, n: any) => s + (n.node_trust_score ?? 50), 0) / nodes.length : 50;
  const trustDecay = Math.max(0, Math.round(100 - avgTrust * 1.2));

  // Capital efficiency: utilization trend
  const { data: pools } = await (supabase as any).from("capital_pools").select("total_committed, total_allocated");
  const totalCommitted = (pools ?? []).reduce((s: number, p: any) => s + (p.total_committed ?? 0), 0);
  const totalAllocated = (pools ?? []).reduce((s: number, p: any) => s + (p.total_allocated ?? 0), 0);
  const utilization = totalCommitted > 0 ? (totalAllocated / totalCommitted) * 100 : 50;
  const efficiencyDegradation = Math.max(0, Math.round(100 - utilization * 1.3));

  // Governance continuity
  const { data: epochs } = await (supabase as any).from("governance_epochs").select("id");
  const { data: council } = await (supabase as any).from("network_council_members").select("voting_weight").eq("active", true);
  const totalWeight = (council ?? []).reduce((s: number, c: any) => s + (c.voting_weight ?? 1), 0);
  const maxWeight = (council ?? []).reduce((m: number, c: any) => Math.max(m, c.voting_weight ?? 1), 0);
  const successionReady = totalWeight > 0 ? Math.max(0, 100 - Math.round((maxWeight / totalWeight) * 100)) : 30;

  const govContinuity = Math.min(100, (epochs?.length ?? 0) * 15 + (council?.length ?? 0) * 10);

  // Reputation persistence
  const { data: deals } = await supabase.from("deal_rooms").select("status");
  const completed = (deals ?? []).filter((d) => d.status === "completed").length;
  const reputationPersistence = Math.min(100, completed * 2 + avgTrust * 0.5);

  // Survival probability
  const survivalProb = Math.min(100, Math.round(
    (100 - trustDecay) * 0.2 + (100 - efficiencyDegradation) * 0.15 + govContinuity * 0.2 +
    successionReady * 0.2 + reputationPersistence * 0.15 + utilization * 0.1
  ));

  const longevityScore = Math.round(survivalProb * 0.4 + (100 - trustDecay) * 0.2 + govContinuity * 0.2 + successionReady * 0.2);

  log.info("Institutional longevity calculated", { longevityScore });

  return {
    survivalProbability: survivalProb, trustDecayProjection: trustDecay,
    capitalEfficiencyDegradation: efficiencyDegradation, governanceContinuityScore: govContinuity,
    successionReadiness: successionReady, reputationPersistence: Math.round(reputationPersistence),
    institutionalLongevityScore: longevityScore,
  };
}
