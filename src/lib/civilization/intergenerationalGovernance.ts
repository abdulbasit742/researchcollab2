/**
 * Intergenerational Governance Model — succession, voting decay, institutional memory.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("intergenerationalGovernance");

export interface GovernanceEpoch {
  id: string;
  epochNumber: number;
  startDate: string;
  endDate: string | null;
  majorPolicyChanges: unknown[];
  systemicRiskLevel: number;
  trustShiftIndex: number;
  governanceModel: string;
}

export interface GovernanceContinuityReport {
  currentEpoch: GovernanceEpoch | null;
  totalEpochs: number;
  successionReadiness: number;
  policyArchiveDepth: number;
  votingWeightDistribution: Record<string, number>;
  institutionalMemoryScore: number;
  continuityIndex: number;
}

export async function getCurrentEpoch(): Promise<GovernanceEpoch | null> {
  const { data } = await (supabase as any).from("governance_epochs")
    .select("*").is("end_date", null).order("epoch_number", { ascending: false }).limit(1).maybeSingle();
  if (!data) return null;
  return {
    id: data.id, epochNumber: data.epoch_number, startDate: data.start_date,
    endDate: data.end_date, majorPolicyChanges: data.major_policy_changes ?? [],
    systemicRiskLevel: data.systemic_risk_level, trustShiftIndex: data.trust_shift_index,
    governanceModel: data.governance_model,
  };
}

export async function calculateGovernanceContinuity(): Promise<GovernanceContinuityReport> {
  const currentEpoch = await getCurrentEpoch();

  const { data: epochs } = await (supabase as any).from("governance_epochs").select("id");
  const totalEpochs = epochs?.length ?? 0;

  // Policy archive depth
  const { data: versions } = await (supabase as any).from("policy_versions").select("id");
  const archiveDepth = versions?.length ?? 0;

  // Council voting weight distribution
  const { data: council } = await (supabase as any).from("network_council_members")
    .select("tenant_id, voting_weight").eq("active", true);
  const distribution: Record<string, number> = {};
  const totalWeight = (council ?? []).reduce((s: number, c: any) => s + (c.voting_weight ?? 1), 0);
  for (const c of council ?? []) {
    distribution[c.tenant_id] = totalWeight > 0 ? Math.round(((c.voting_weight ?? 1) / totalWeight) * 100) : 0;
  }

  // Succession readiness: no single entity >25%
  const maxWeight = Math.max(0, ...Object.values(distribution));
  const successionReadiness = maxWeight <= 25 ? 100 : Math.max(0, 100 - (maxWeight - 25) * 4);

  // Institutional memory score
  const memoryScore = Math.min(100, archiveDepth * 5 + totalEpochs * 10);

  const continuityIndex = Math.round(
    successionReadiness * 0.3 + memoryScore * 0.3 + Math.min(100, (council?.length ?? 0) * 15) * 0.2 +
    (currentEpoch ? 80 : 30) * 0.2
  );

  log.info("Governance continuity calculated", { continuityIndex });

  return {
    currentEpoch, totalEpochs, successionReadiness, policyArchiveDepth: archiveDepth,
    votingWeightDistribution: distribution, institutionalMemoryScore: memoryScore, continuityIndex,
  };
}
