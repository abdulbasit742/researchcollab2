/**
 * AI Intelligence & 20-Year Domination Engine
 * Execution risk prediction, capital allocation intelligence, talent development,
 * fraud detection, smart matching, escrow health AI, and innovation intelligence.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("intelligenceEngine");

// ─── Execution Risk Prediction ───

export interface ExecutionRiskPrediction {
  milestoneDelayProbability: number;
  disputeLikelihood: number;
  budgetOverrunRisk: number;
  communicationBreakdownRisk: number;
  sponsorDissatisfactionProbability: number;
  oversightGapScore: number;
  overallRiskScore: number;
  riskExplanation: string;
  suggestedActions: string[];
}

export async function predictExecutionRisk(projectId: string): Promise<ExecutionRiskPrediction> {
  const { data: records } = await supabase
    .from("accountability_records")
    .select("*")
    .eq("project_id", projectId);

  const all = records ?? [];
  const completed = all.filter((r) => r.outcome_status === "completed");
  const disputed = all.filter((r) => r.outcome_status === "disputed");
  const totalEscrow = all.reduce((s, r) => s + (r.escrow_amount ?? 0), 0);
  const totalPaid = completed.reduce((s, r) => s + (r.total_paid ?? 0), 0);

  const completionRate = all.length > 0 ? completed.length / all.length : 0.5;
  const disputeRate = all.length > 0 ? disputed.length / all.length : 0;
  const budgetUtilization = totalEscrow > 0 ? totalPaid / totalEscrow : 0.5;

  const milestoneDelayProbability = Math.min(100, Math.round((1 - completionRate) * 70 + disputeRate * 30));
  const disputeLikelihood = Math.min(100, Math.round(disputeRate * 100));
  const budgetOverrunRisk = Math.min(100, Math.round((1 - budgetUtilization) * 50));
  const communicationBreakdownRisk = Math.min(100, Math.round(disputeRate * 60));
  const sponsorDissatisfactionProbability = Math.min(100, Math.round((1 - completionRate) * 50 + disputeRate * 50));
  const oversightGapScore = Math.min(100, Math.round((1 - completionRate) * 40));

  const overallRiskScore = Math.round(
    milestoneDelayProbability * 0.25 +
    disputeLikelihood * 0.20 +
    budgetOverrunRisk * 0.15 +
    communicationBreakdownRisk * 0.15 +
    sponsorDissatisfactionProbability * 0.15 +
    oversightGapScore * 0.10
  );

  const suggestedActions: string[] = [];
  if (milestoneDelayProbability > 50) suggestedActions.push("Add milestone checkpoints with shorter intervals");
  if (disputeLikelihood > 30) suggestedActions.push("Establish clear deliverable criteria before next milestone");
  if (budgetOverrunRisk > 40) suggestedActions.push("Review budget allocation and add contingency buffer");
  if (communicationBreakdownRisk > 40) suggestedActions.push("Schedule regular status updates between parties");
  if (sponsorDissatisfactionProbability > 50) suggestedActions.push("Proactively share progress reports with sponsor");

  const riskExplanation = `Overall risk ${overallRiskScore}% based on ${all.length} historical records. ` +
    `Completion rate: ${Math.round(completionRate * 100)}%, Dispute rate: ${Math.round(disputeRate * 100)}%.`;

  log.info("Execution risk predicted", { projectId, overallRiskScore });

  return {
    milestoneDelayProbability, disputeLikelihood, budgetOverrunRisk,
    communicationBreakdownRisk, sponsorDissatisfactionProbability,
    oversightGapScore, overallRiskScore, riskExplanation, suggestedActions,
  };
}

// ─── Capital Allocation Intelligence ───

export interface CapitalRecommendation {
  entityId: string;
  entityType: string;
  reason: string;
  reliabilityScore: number;
  disputeFreeRate: number;
  domainMatchScore: number;
  budgetEfficiencyScore: number;
  overallScore: number;
  explanationFactors: string[];
}

export async function getCapitalAllocationRecommendations(sponsorId?: string): Promise<CapitalRecommendation[]> {
  const { data } = await supabase
    .from("capital_allocation_ai")
    .select("*")
    .order("overall_recommendation_score", { ascending: false })
    .limit(20);

  return (data ?? []).map((d) => ({
    entityId: d.recommended_entity_id ?? "",
    entityType: d.recommended_entity_type,
    reason: d.recommendation_reason ?? "",
    reliabilityScore: d.reliability_score ?? 0,
    disputeFreeRate: d.dispute_free_rate ?? 0,
    domainMatchScore: d.domain_match_score ?? 0,
    budgetEfficiencyScore: d.budget_efficiency_score ?? 0,
    overallScore: d.overall_recommendation_score ?? 0,
    explanationFactors: (d.explanation_factors as string[]) ?? [],
  }));
}

// ─── Talent Development Insights ───

export interface TalentDevelopmentInsight {
  skillGaps: string[];
  careerTrajectoryTrend: string;
  growthRecommendations: string[];
  suggestedProjectTypes: string[];
  careerMaturityScore: number;
  leadershipReadiness: number;
  longTermPotential: Record<string, unknown>;
}

export async function getTalentDevelopmentInsights(userId: string): Promise<TalentDevelopmentInsight | null> {
  const { data } = await supabase
    .from("talent_development_insights")
    .select("*")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    skillGaps: (data.skill_gaps as string[]) ?? [],
    careerTrajectoryTrend: data.career_trajectory_trend ?? "stable",
    growthRecommendations: (data.growth_recommendations as string[]) ?? [],
    suggestedProjectTypes: data.suggested_project_types ?? [],
    careerMaturityScore: data.career_maturity_score ?? 0,
    leadershipReadiness: data.leadership_readiness ?? 0,
    longTermPotential: (data.long_term_potential_indicators as Record<string, unknown>) ?? {},
  };
}

// ─── Institutional Performance Forecasting ───

export interface InstitutionalForecast {
  completionRateTrend: string;
  disputeProbabilityTrend: string;
  sponsorRetentionForecast: number;
  fundingGrowthTrajectory: string;
  innovationGrowthPotential: number;
  forwardStabilityIndicators: Record<string, unknown>;
}

export async function getInstitutionalForecast(institutionId: string): Promise<InstitutionalForecast | null> {
  const { data } = await supabase
    .from("institutional_performance_forecasts")
    .select("*")
    .eq("institution_id", institutionId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    completionRateTrend: data.completion_rate_trend ?? "stable",
    disputeProbabilityTrend: data.dispute_probability_trend ?? "stable",
    sponsorRetentionForecast: data.sponsor_retention_forecast ?? 0,
    fundingGrowthTrajectory: data.funding_growth_trajectory ?? "flat",
    innovationGrowthPotential: data.innovation_growth_potential ?? 0,
    forwardStabilityIndicators: (data.forward_stability_indicators as Record<string, unknown>) ?? {},
  };
}

// ─── Fraud & Collusion Detection ───

export type FraudSignalType =
  | "artificial_reputation_loop"
  | "micro_escrow_inflation"
  | "sponsor_student_collusion"
  | "unusual_funding_spike"
  | "escrow_wash_cycle"
  | "identity_manipulation";

export interface FraudSignal {
  signalType: FraudSignalType;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  affectedUsers: string[];
  evidence: Record<string, unknown>;
  humanReviewRequired: boolean;
}

export async function detectFraudSignals(): Promise<FraudSignal[]> {
  const { data } = await supabase
    .from("fraud_collusion_signals")
    .select("*")
    .eq("reviewed", false)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((d) => ({
    signalType: d.signal_type as FraudSignalType,
    severity: (d.severity ?? "medium") as FraudSignal["severity"],
    description: d.description ?? "",
    affectedUsers: (d.affected_users ?? []) as string[],
    evidence: (d.evidence as Record<string, unknown>) ?? {},
    humanReviewRequired: d.human_review_required ?? true,
  }));
}

// ─── Smart Matching (Explainable) ───

export interface SmartMatch {
  matchType: string;
  entityAId: string;
  entityBId: string;
  executionHistoryOverlap: number;
  domainCompatibility: number;
  reliabilityMatch: number;
  budgetAlignment: number;
  disputeCompatibility: number;
  overallMatchScore: number;
  explanationFactors: string[];
}

export async function getSmartMatches(userId: string): Promise<SmartMatch[]> {
  const { data } = await supabase
    .from("smart_match_results")
    .select("*")
    .or(`entity_a_id.eq.${userId},entity_b_id.eq.${userId}`)
    .order("overall_match_score", { ascending: false })
    .limit(20);

  return (data ?? []).map((d) => ({
    matchType: d.match_type,
    entityAId: d.entity_a_id,
    entityBId: d.entity_b_id,
    executionHistoryOverlap: d.execution_history_overlap ?? 0,
    domainCompatibility: d.domain_compatibility ?? 0,
    reliabilityMatch: d.reliability_match ?? 0,
    budgetAlignment: d.budget_alignment ?? 0,
    disputeCompatibility: d.dispute_compatibility ?? 0,
    overallMatchScore: d.overall_match_score ?? 0,
    explanationFactors: (d.explanation_factors as string[]) ?? [],
  }));
}

// ─── Escrow Health AI ───

export interface EscrowHealthAlert {
  alertType: string;
  severity: string;
  description: string;
  anomalyDetails: Record<string, unknown>;
  recommendedAction: string;
}

export async function getEscrowHealthAlerts(): Promise<EscrowHealthAlert[]> {
  const { data } = await supabase
    .from("escrow_health_ai_alerts")
    .select("*")
    .eq("auto_resolved", false)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((d) => ({
    alertType: d.alert_type,
    severity: d.severity ?? "medium",
    description: d.description ?? "",
    anomalyDetails: (d.anomaly_details as Record<string, unknown>) ?? {},
    recommendedAction: d.recommended_action ?? "",
  }));
}

// ─── Innovation Intelligence ───

export async function getInnovationIntelligence(domain?: string, region?: string) {
  let query = supabase
    .from("innovation_intelligence")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  if (domain) query = query.eq("domain", domain);
  if (region) query = query.eq("region", region);

  const { data } = await query;
  return data ?? [];
}

// ─── Transparency Constants ───

export const AI_INTELLIGENCE_TRANSPARENCY = {
  philosophy: "AI optimizes professional execution economy, not attention economy",
  humanOversightRequired: [
    "Escrow release",
    "Dispute resolution",
    "Ledger mutation",
    "Reputation penalty",
    "Institutional sanctions",
  ],
  aiAssists: [
    "Risk flagging",
    "Match suggestion",
    "Trend analysis",
    "Forecasting",
    "Fraud detection",
    "Escrow health monitoring",
  ],
  explainabilityRequirements: [
    "All AI decisions show influencing factors",
    "Transparent scoring breakdown provided",
    "Manual override always available",
    "Decision path logged in audit trail",
    "No opaque AI ranking",
  ],
  executionRiskFormula: "OverallRisk = MilestoneDelay(25%) + DisputeLikelihood(20%) + BudgetOverrun(15%) + CommBreakdown(15%) + SponsorDissatisfaction(15%) + OversightGap(10%)",
  smartMatchCriteria: [
    "Execution history overlap",
    "Domain compatibility",
    "Reliability match",
    "Budget alignment",
    "Dispute compatibility profile",
  ],
  fraudDetectionTargets: [
    "Artificial reputation loops",
    "Micro-escrow inflation",
    "Sponsor-student collusion",
    "Unusual funding spikes",
    "Escrow wash cycles",
    "Identity manipulation",
  ],
  longTermMoat: "After 10+ years: multi-year escrow data, institutional patterns, sponsor behaviors, milestone analytics — irreplaceable dataset",
  futureProofing: "Every 5 years: re-evaluate models, re-train, update fairness metrics, audit bias, validate explainability",
} as const;
