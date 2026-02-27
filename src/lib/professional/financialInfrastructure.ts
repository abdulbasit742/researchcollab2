/**
 * Escrow-Centric Financial Infrastructure Engine
 * Replaces LinkedIn's ad-based monetization with execution-backed,
 * escrow-verified financial intelligence infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("financialInfrastructure");

// ─── Economic Health Index ───

export interface EconomicHealthIndex {
  escrowReliabilityPct: number;
  disputeFrequencyPct: number;
  completionRatePct: number;
  reconciliationConsistencyPct: number;
  sponsorRepeatPct: number;
  institutionalRetentionPct: number;
  overallEHI: number;
  totalEscrowVolume: number;
  totalMilestoneReleases: number;
  totalRefunds: number;
  ledgerIntegrityStatus: "healthy" | "warning" | "critical";
}

const EHI_WEIGHTS = {
  escrowReliability: 0.20,
  disputeFrequency: -0.15,
  completionRate: 0.20,
  reconciliationConsistency: 0.15,
  sponsorRepeat: 0.15,
  institutionalRetention: 0.15,
} as const;

export async function calculateEconomicHealthIndex(
  scopeType: "platform" | "institution" = "platform",
  scopeId?: string
): Promise<EconomicHealthIndex> {
  let recordsQuery = supabase.from("accountability_records").select("*");
  if (scopeType === "institution" && scopeId) {
    // Filter by institution's users via academic_records
    const { data: userIds } = await supabase
      .from("academic_records")
      .select("user_id")
      .eq("institution_id", scopeId);
    const ids = [...new Set((userIds ?? []).map((u) => u.user_id))];
    if (ids.length > 0) {
      recordsQuery = recordsQuery.in("executor_id", ids.slice(0, 100));
    }
  }

  const { data: records } = await recordsQuery;
  const all = records ?? [];
  const completed = all.filter((r) => r.outcome_status === "completed");
  const disputed = all.filter((r) => r.outcome_status === "disputed");
  const totalEscrow = all.reduce((s, r) => s + (r.escrow_amount ?? 0), 0);
  const totalReleased = completed.reduce((s, r) => s + (r.total_paid ?? 0), 0);

  const escrowReliabilityPct = all.length > 0 ? Math.round((completed.length / all.length) * 100) : 0;
  const disputeFrequencyPct = all.length > 0 ? Math.round((disputed.length / all.length) * 100) : 0;
  const completionRatePct = escrowReliabilityPct;
  const reconciliationConsistencyPct = totalEscrow > 0 ? Math.min(100, Math.round((totalReleased / totalEscrow) * 100)) : 100;

  // Sponsor repeat
  const sponsors = all.map((r) => r.funder_id).filter(Boolean);
  const uniqueSponsors = new Set(sponsors);
  const repeatSponsors = sponsors.length - uniqueSponsors.size;
  const sponsorRepeatPct = uniqueSponsors.size > 0 ? Math.round((repeatSponsors / uniqueSponsors.size) * 100) : 0;

  const institutionalRetentionPct = 80; // Simplified baseline

  const overallEHI = Math.min(100, Math.max(0, Math.round(
    escrowReliabilityPct * EHI_WEIGHTS.escrowReliability +
    disputeFrequencyPct * EHI_WEIGHTS.disputeFrequency +
    completionRatePct * EHI_WEIGHTS.completionRate +
    reconciliationConsistencyPct * EHI_WEIGHTS.reconciliationConsistency +
    sponsorRepeatPct * EHI_WEIGHTS.sponsorRepeat +
    institutionalRetentionPct * EHI_WEIGHTS.institutionalRetention
  )));

  const ledgerIntegrityStatus: EconomicHealthIndex["ledgerIntegrityStatus"] =
    reconciliationConsistencyPct >= 95 ? "healthy" :
    reconciliationConsistencyPct >= 80 ? "warning" : "critical";

  log.info("EHI calculated", { scopeType, overallEHI, ledgerIntegrityStatus });

  return {
    escrowReliabilityPct,
    disputeFrequencyPct,
    completionRatePct,
    reconciliationConsistencyPct,
    sponsorRepeatPct,
    institutionalRetentionPct,
    overallEHI,
    totalEscrowVolume: totalEscrow,
    totalMilestoneReleases: totalReleased,
    totalRefunds: 0,
    ledgerIntegrityStatus,
  };
}

// ─── Sponsor Capital Intelligence ───

export interface SponsorCapitalIntelligence {
  totalFunded: number;
  totalReleased: number;
  totalDisputed: number;
  milestoneAdherencePct: number;
  avgRoiScore: number;
  fundingVelocityTrend: "accelerating" | "stable" | "decelerating";
  crossProjectEfficiency: number;
  disputeRiskScore: number;
  projectCount: number;
  repeatFundingCount: number;
}

export async function calculateSponsorCapitalIntelligence(sponsorId: string): Promise<SponsorCapitalIntelligence> {
  const { data: records } = await supabase
    .from("accountability_records")
    .select("*")
    .eq("funder_id", sponsorId)
    .order("created_at", { ascending: true });

  const all = records ?? [];
  const completed = all.filter((r) => r.outcome_status === "completed");
  const disputed = all.filter((r) => r.outcome_status === "disputed");
  const totalFunded = all.reduce((s, r) => s + (r.escrow_amount ?? 0), 0);
  const totalReleased = completed.reduce((s, r) => s + (r.total_paid ?? 0), 0);
  const totalDisputed = disputed.reduce((s, r) => s + (r.escrow_amount ?? 0), 0);

  const milestoneAdherencePct = all.length > 0 ? Math.round((completed.length / all.length) * 100) : 0;

  // ROI: simplified as completion-to-funding ratio
  const avgRoiScore = totalFunded > 0 ? Math.round((totalReleased / totalFunded) * 100) : 0;

  // Velocity trend: compare first half vs second half funding
  const mid = Math.floor(all.length / 2);
  const firstHalf = all.slice(0, mid).reduce((s, r) => s + (r.escrow_amount ?? 0), 0);
  const secondHalf = all.slice(mid).reduce((s, r) => s + (r.escrow_amount ?? 0), 0);
  const fundingVelocityTrend: SponsorCapitalIntelligence["fundingVelocityTrend"] =
    secondHalf > firstHalf * 1.2 ? "accelerating" :
    secondHalf < firstHalf * 0.8 ? "decelerating" : "stable";

  const crossProjectEfficiency = all.length > 0
    ? Math.round((completed.length / all.length) * 100)
    : 0;

  const disputeRiskScore = all.length > 0 ? Math.round((disputed.length / all.length) * 100) : 0;

  // Repeat funding: same executor funded more than once
  const executors = all.map((r) => r.executor_id);
  const repeatFundingCount = executors.length - new Set(executors).size;

  return {
    totalFunded,
    totalReleased,
    totalDisputed,
    milestoneAdherencePct,
    avgRoiScore,
    fundingVelocityTrend,
    crossProjectEfficiency,
    disputeRiskScore,
    projectCount: all.length,
    repeatFundingCount,
  };
}

// ─── Financial Risk Monitoring ───

export interface FinancialRiskSignal {
  riskType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  metrics: Record<string, number>;
}

export async function detectFinancialRisks(scopeType: "platform" | "institution" = "platform", scopeId?: string): Promise<FinancialRiskSignal[]> {
  const ehi = await calculateEconomicHealthIndex(scopeType, scopeId);
  const risks: FinancialRiskSignal[] = [];

  if (ehi.disputeFrequencyPct > 15) {
    risks.push({
      riskType: "high_dispute_rate",
      severity: ehi.disputeFrequencyPct > 30 ? "critical" : "high",
      description: `Dispute rate at ${ehi.disputeFrequencyPct}% exceeds safe threshold`,
      metrics: { disputeRate: ehi.disputeFrequencyPct },
    });
  }

  if (ehi.reconciliationConsistencyPct < 90) {
    risks.push({
      riskType: "reconciliation_drift",
      severity: ehi.reconciliationConsistencyPct < 75 ? "critical" : "medium",
      description: `Escrow reconciliation at ${ehi.reconciliationConsistencyPct}% — potential leakage`,
      metrics: { reconciliation: ehi.reconciliationConsistencyPct },
    });
  }

  if (ehi.completionRatePct < 60) {
    risks.push({
      riskType: "low_completion_rate",
      severity: "high",
      description: `Completion rate at ${ehi.completionRatePct}% — project failure risk`,
      metrics: { completionRate: ehi.completionRatePct },
    });
  }

  if (ehi.sponsorRepeatPct < 10 && ehi.totalEscrowVolume > 10000) {
    risks.push({
      riskType: "low_sponsor_retention",
      severity: "medium",
      description: "Low sponsor repeat rate — retention risk",
      metrics: { sponsorRepeat: ehi.sponsorRepeatPct },
    });
  }

  log.info("Financial risks detected", { count: risks.length, scopeType });
  return risks;
}

// ─── Capital Flow Analytics ───

export async function getCapitalFlowSummary(periodDays = 30) {
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: events } = await supabase
    .from("capital_flow_events")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const all = events ?? [];
  const inflow = all.filter((e) => e.event_type === "escrow_funded").reduce((s, e) => s + (e.amount ?? 0), 0);
  const released = all.filter((e) => e.event_type === "milestone_released").reduce((s, e) => s + (e.amount ?? 0), 0);
  const refunded = all.filter((e) => e.event_type === "refund").reduce((s, e) => s + (e.amount ?? 0), 0);

  return {
    totalInflow: inflow,
    totalReleased: released,
    totalRefunded: refunded,
    netFlow: inflow - released - refunded,
    eventCount: all.length,
    events: all,
  };
}

// ─── Institutional Financial Dashboard ───

export async function getInstitutionalFinancialDashboard(institutionId: string) {
  const [ehi, risks] = await Promise.all([
    calculateEconomicHealthIndex("institution", institutionId),
    detectFinancialRisks("institution", institutionId),
  ]);

  return { ehi, risks };
}

// ─── Transparency ───

export const FINANCIAL_TRANSPARENCY = {
  feeModel: {
    description: "Small percentage per escrow transaction + institutional subscriptions",
    principles: [
      "Clear fee breakdown on every transaction",
      "No hidden charges",
      "No ranking boost purchases",
      "No engagement-based monetization",
      "Trust alignment over aggressive extraction",
    ],
  },
  ehiFormula: "EHI = EscrowReliability(20%) - DisputeFrequency(15%) + CompletionRate(20%) + ReconciliationConsistency(15%) + SponsorRepeat(15%) + InstitutionalRetention(15%)",
  publishedMetrics: [
    "Total escrow volume",
    "Total milestone releases",
    "Dispute rate %",
    "Refund rate %",
    "Completion reliability %",
    "Escrow invariant stability %",
    "Ledger integrity status",
  ],
  monetizationPhilosophy: {
    monetizes: ["Verified execution", "Escrow transactions", "Institutional infrastructure", "Funding reliability"],
    neverMonetizes: ["Attention", "Addiction", "Vanity metrics", "Paid ranking", "Engagement farming"],
  },
} as const;
