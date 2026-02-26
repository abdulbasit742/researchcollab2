/**
 * Sovereignty Maturity Model — graduated institutional sovereignty levels.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("sovereigntyMaturity");

export enum MaturityLevel {
  CENTRALIZED_FOUNDER = 0,
  REGIONAL_ADVISORY = 1,
  WEIGHTED_INSTITUTIONAL = 2,
  DISTRIBUTED_SOVEREIGN = 3,
  CONSTITUTIONAL_DISTRIBUTED = 4,
}

export const MATURITY_LABELS: Record<MaturityLevel, string> = {
  [MaturityLevel.CENTRALIZED_FOUNDER]: "Centralized Founder Governance",
  [MaturityLevel.REGIONAL_ADVISORY]: "Regional Advisory Governance",
  [MaturityLevel.WEIGHTED_INSTITUTIONAL]: "Weighted Institutional Governance",
  [MaturityLevel.DISTRIBUTED_SOVEREIGN]: "Distributed Sovereign Governance",
  [MaturityLevel.CONSTITUTIONAL_DISTRIBUTED]: "Constitutional Distributed Governance (Hard Core Locked)",
};

export interface SovereigntyProfile {
  tenantId: string;
  maturityLevel: MaturityLevel;
  trustScore: number;
  capitalContributionScore: number;
  complianceScore: number;
  longevityScore: number;
  governanceParticipationScore: number;
  lastEvaluatedAt: string;
}

const MATURITY_THRESHOLDS: { trust: number; compliance: number; longevity: number; capital: number; governance: number }[] = [
  { trust: 0, compliance: 0, longevity: 0, capital: 0, governance: 0 },
  { trust: 40, compliance: 50, longevity: 20, capital: 20, governance: 10 },
  { trust: 60, compliance: 70, longevity: 40, capital: 40, governance: 30 },
  { trust: 75, compliance: 85, longevity: 60, capital: 60, governance: 50 },
  { trust: 90, compliance: 95, longevity: 80, capital: 80, governance: 70 },
];

export async function calculateSovereigntyMaturity(tenantId: string): Promise<SovereigntyProfile> {
  // Gather trust from nodes
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("node_trust_score, total_network_capital_contributed").eq("tenant_id", tenantId);
  const avgTrust = (nodes ?? []).length > 0 ? (nodes ?? []).reduce((s: number, n: any) => s + (n.node_trust_score ?? 0), 0) / nodes.length : 0;
  const totalCapital = (nodes ?? []).reduce((s: number, n: any) => s + (n.total_network_capital_contributed ?? 0), 0);

  // Compliance
  const { data: alerts } = await (supabase as any).from("compliance_alerts").select("resolved").eq("tenant_id", tenantId);
  const totalAlerts = (alerts ?? []).length;
  const resolved = (alerts ?? []).filter((a: any) => a.resolved).length;
  const complianceScore = totalAlerts > 0 ? Math.round((resolved / totalAlerts) * 100) : 80;

  // Longevity
  const { data: tenant } = await (supabase as any).from("tenants").select("created_at").eq("id", tenantId).maybeSingle();
  const ageYears = tenant ? (Date.now() - new Date(tenant.created_at).getTime()) / (365.25 * 24 * 3600 * 1000) : 0;
  const longevityScore = Math.min(100, Math.round(ageYears * 20));

  // Governance participation
  const { data: votes } = await (supabase as any).from("agp_votes").select("id");
  const govScore = Math.min(100, (votes?.length ?? 0) * 5);

  // Capital contribution score
  const capitalScore = Math.min(100, Math.round(totalCapital / 100));

  // Determine maturity level
  let maturityLevel = MaturityLevel.CENTRALIZED_FOUNDER;
  for (let level = 4; level >= 1; level--) {
    const t = MATURITY_THRESHOLDS[level];
    if (avgTrust >= t.trust && complianceScore >= t.compliance && longevityScore >= t.longevity && capitalScore >= t.capital && govScore >= t.governance) {
      maturityLevel = level as MaturityLevel;
      break;
    }
  }

  // Upsert
  await (supabase as any).from("sovereignty_profiles").upsert({
    tenant_id: tenantId, maturity_level: maturityLevel, trust_score: avgTrust,
    capital_contribution_score: capitalScore, compliance_score: complianceScore,
    longevity_score: longevityScore, governance_participation_score: govScore,
    last_evaluated_at: new Date().toISOString(),
  }, { onConflict: "tenant_id" });

  log.info("Sovereignty maturity calculated", { tenantId, maturityLevel });

  return {
    tenantId, maturityLevel, trustScore: avgTrust, capitalContributionScore: capitalScore,
    complianceScore, longevityScore, governanceParticipationScore: govScore,
    lastEvaluatedAt: new Date().toISOString(),
  };
}

export async function getSovereigntyProfile(tenantId: string): Promise<SovereigntyProfile | null> {
  const { data } = await (supabase as any).from("sovereignty_profiles").select("*").eq("tenant_id", tenantId).maybeSingle();
  if (!data) return null;
  return {
    tenantId: data.tenant_id, maturityLevel: data.maturity_level, trustScore: data.trust_score,
    capitalContributionScore: data.capital_contribution_score, complianceScore: data.compliance_score,
    longevityScore: data.longevity_score, governanceParticipationScore: data.governance_participation_score,
    lastEvaluatedAt: data.last_evaluated_at,
  };
}

export async function getNetworkMaturityLevel(): Promise<MaturityLevel> {
  const { data } = await (supabase as any).from("sovereignty_profiles").select("maturity_level");
  if (!data || data.length === 0) return MaturityLevel.CENTRALIZED_FOUNDER;
  const avg = data.reduce((s: number, p: any) => s + p.maturity_level, 0) / data.length;
  return Math.floor(avg) as MaturityLevel;
}
