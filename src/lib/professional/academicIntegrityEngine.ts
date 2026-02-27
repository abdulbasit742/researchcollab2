/**
 * Global Academic Integrity & Defense Engine (GAIDE)
 * Anti-fraud, manipulation detection, and integrity scoring.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const CITATION_FLAG_TYPES = [
  "self_citation_loop", "citation_ring", "reciprocal_inflation",
  "cross_institution_mutual", "journal_cartel", "unnatural_spike",
  "coordinated_timing", "low_quality_concentration",
] as const;

export const GRANT_MISUSE_TYPES = [
  "budget_variance_outlier", "repeated_milestone_delay", "deliverable_duplication",
  "overlapping_deliverables", "spending_outside_limits", "escrow_irregularity",
  "sponsor_pi_collusion", "grant_cycling",
] as const;

export const PATENT_INFLATION_TYPES = [
  "stacking_without_licensing", "self_citation_loop", "artificial_fragmentation",
  "low_quality_surge", "no_revenue_evidence", "shell_startup", "inflated_valuation",
  "licensing_inconsistency",
] as const;

export const COLLUSION_TYPES = [
  "closed_collaboration_loop", "citation_funding_cluster", "patent_co_ownership_inflation",
  "grant_team_exclusivity", "sponsor_concentration",
] as const;

export const OPEN_SCIENCE_FRAUD_TYPES = [
  "dataset_reuse_misrepresentation", "code_plagiarism", "fake_replication",
  "reproducibility_fraud", "dataset_fabrication", "artificial_version_updates",
  "derivative_misattribution",
] as const;

export const ICS_WEIGHTS = {
  citation_integrity: 0.20,
  funding_integrity: 0.20,
  compliance_reliability: 0.15,
  commercialization_authenticity: 0.15,
  collaboration_transparency: 0.15,
  open_science_credibility: 0.15,
};

export const IIRI_WEIGHTS = {
  citation_ring: 0.15,
  grant_inflation: 0.15,
  compliance_concealment: 0.10,
  domain_concentration_risk: 0.10,
  funding_concentration_risk: 0.15,
  escrow_breach_frequency: 0.15,
  reputation_inflation: 0.10,
  ranking_gaming: 0.10,
};

export const GAIDE_TRANSPARENCY = {
  philosophy: "Defend credibility — no black-box accusations",
  rules: "No automatic punishment without human review",
  appeals: "Full appeal workflow with evidence submission and committee review",
  flagging: "All flags explainable with metric deviation and historical baseline",
  privacy: "Detection respects privacy laws and minimizes false positives",
};

// =====================================================
// TYPES
// =====================================================

export interface CitationFlagInput {
  researcher_id: string;
  flag_type: string;
  severity: string;
  self_citation_ratio?: number;
  ring_cluster_size?: number;
  reciprocal_inflation_score?: number;
  suspicious_citation_count?: number;
  citation_integrity_adjustment?: number;
  evidence?: Record<string, unknown>;
  explanation?: string;
}

export interface CoauthorFlagInput {
  researcher_id: string;
  flag_type: string;
  severity: string;
  avg_team_size?: number;
  contribution_balance_score?: number;
  honorary_authorship_signals?: number;
  evidence?: Record<string, unknown>;
  explanation?: string;
}

export interface GrantMisuseFlagInput {
  grant_id: string;
  researcher_id?: string;
  institution_id?: string;
  flag_type: string;
  severity: string;
  budget_variance_pct?: number;
  deliverable_overlap_count?: number;
  escrow_irregularity_count?: number;
  evidence?: Record<string, unknown>;
  explanation?: string;
}

export interface PatentInflationFlagInput {
  entity_type: string;
  entity_id: string;
  flag_type: string;
  severity: string;
  patent_without_licensing_count?: number;
  fragmentation_score?: number;
  shell_startup_signals?: number;
  revenue_inconsistency?: number;
  evidence?: Record<string, unknown>;
  explanation?: string;
  patent_quality_adjustment?: number;
}

export interface IIRIInput {
  institution_id: string;
  period?: string;
  citation_ring_score: number;
  grant_inflation_score: number;
  compliance_concealment_score: number;
  domain_concentration_risk: number;
  funding_concentration_risk: number;
  escrow_breach_frequency: number;
  reputation_inflation_score: number;
  ranking_gaming_score: number;
}

export interface JournalRiskInput {
  journal_name: string;
  issn?: string;
  citation_cartel_density: number;
  retraction_frequency: number;
  self_citation_ratio: number;
  author_concentration: number;
  peer_review_anomaly_score: number;
  rapid_acceptance_ratio: number;
  conflict_of_interest_score: number;
}

export interface ICSInput {
  entity_type: string;
  entity_id: string;
  citation_integrity: number;
  funding_integrity: number;
  compliance_reliability: number;
  commercialization_authenticity: number;
  collaboration_transparency: number;
  open_science_credibility: number;
}

export interface AppealInput {
  flag_table: string;
  flag_id: string;
  appellant_type: string;
  appellant_id: string;
  appeal_reason: string;
  evidence_submitted?: Record<string, unknown>;
}

export interface CollusionFlagInput {
  cluster_id: string;
  involved_entities: Array<{ type: string; id: string }>;
  collusion_type: string;
  severity: string;
  graph_evidence?: Record<string, unknown>;
  explanation?: string;
}

export interface OpenScienceFraudInput {
  entity_type: string;
  entity_id: string;
  flag_type: string;
  severity: string;
  evidence?: Record<string, unknown>;
  explanation?: string;
  impact_score_adjustment?: number;
}

export interface VolatilityEventInput {
  entity_type: string;
  entity_id: string;
  event_type: string;
  severity: string;
  metric_name: string;
  previous_value: number;
  current_value: number;
  change_pct: number;
  explanation?: string;
  triggered_review?: boolean;
}

// =====================================================
// CITATION INTEGRITY
// =====================================================

export function detectCitationManipulation(params: {
  selfCitationRatio: number; ringClusterSize: number;
  reciprocalScore: number; citationSpikeRate: number;
  lowQualityRatio: number;
}): CitationFlagInput[] {
  const flags: CitationFlagInput[] = [];
  const rid = ""; // caller supplies

  if (params.selfCitationRatio > 0.3) flags.push({ researcher_id: rid, flag_type: "self_citation_loop", severity: params.selfCitationRatio > 0.5 ? "critical" : "high", self_citation_ratio: params.selfCitationRatio, citation_integrity_adjustment: -(params.selfCitationRatio - 0.3) * 0.5, explanation: `Self-citation ratio ${(params.selfCitationRatio * 100).toFixed(1)}% exceeds 30% threshold` });
  if (params.ringClusterSize > 5) flags.push({ researcher_id: rid, flag_type: "citation_ring", severity: params.ringClusterSize > 10 ? "critical" : "high", ring_cluster_size: params.ringClusterSize, explanation: `Citation ring cluster of ${params.ringClusterSize} detected` });
  if (params.reciprocalScore > 0.4) flags.push({ researcher_id: rid, flag_type: "reciprocal_inflation", severity: "high", reciprocal_inflation_score: params.reciprocalScore, explanation: `Reciprocal citation inflation score ${params.reciprocalScore} exceeds threshold` });
  if (params.citationSpikeRate > 3) flags.push({ researcher_id: rid, flag_type: "unnatural_spike", severity: "medium", suspicious_citation_count: Math.round(params.citationSpikeRate * 10), explanation: `Citation spike rate ${params.citationSpikeRate}x above baseline` });
  if (params.lowQualityRatio > 0.5) flags.push({ researcher_id: rid, flag_type: "low_quality_concentration", severity: "medium", explanation: `${(params.lowQualityRatio * 100).toFixed(0)}% of citations from low-quality sources` });

  return flags;
}

export async function saveCitationFlags(flags: CitationFlagInput[]): Promise<void> {
  if (!flags.length) return;
  const { error } = await supabase.from("citation_integrity_flags" as any).insert(flags);
  if (error) throw error;
}

export async function getCitationFlags(researcherId?: string) {
  let query = supabase.from("citation_integrity_flags" as any).select("*");
  if (researcherId) query = query.eq("researcher_id", researcherId);
  const { data, error } = await query.order("detected_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// CO-AUTHOR INFLATION
// =====================================================

export async function saveCoauthorFlags(flags: CoauthorFlagInput[]): Promise<void> {
  if (!flags.length) return;
  const { error } = await supabase.from("coauthor_inflation_flags" as any).insert(flags);
  if (error) throw error;
}

export async function getCoauthorFlags(researcherId?: string) {
  let query = supabase.from("coauthor_inflation_flags" as any).select("*");
  if (researcherId) query = query.eq("researcher_id", researcherId);
  const { data, error } = await query.order("detected_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// GRANT MISUSE
// =====================================================

export function detectGrantMisuse(params: {
  budgetVariancePct: number; milestoneDelayRate: number;
  deliverableOverlap: number; escrowIrregularities: number;
  grantCyclingSignals: number;
}): GrantMisuseFlagInput[] {
  const flags: GrantMisuseFlagInput[] = [];
  const gid = "";

  if (params.budgetVariancePct > 25) flags.push({ grant_id: gid, flag_type: "budget_variance_outlier", severity: params.budgetVariancePct > 50 ? "critical" : "high", budget_variance_pct: params.budgetVariancePct, explanation: `Budget variance ${params.budgetVariancePct}% exceeds 25% threshold` });
  if (params.milestoneDelayRate > 0.5) flags.push({ grant_id: gid, flag_type: "repeated_milestone_delay", severity: "high", explanation: `${(params.milestoneDelayRate * 100).toFixed(0)}% of milestones delayed` });
  if (params.deliverableOverlap > 2) flags.push({ grant_id: gid, flag_type: "deliverable_duplication", severity: "high", deliverable_overlap_count: params.deliverableOverlap, explanation: `${params.deliverableOverlap} overlapping deliverables across grants` });
  if (params.escrowIrregularities > 0) flags.push({ grant_id: gid, flag_type: "escrow_irregularity", severity: "critical", escrow_irregularity_count: params.escrowIrregularities, explanation: `${params.escrowIrregularities} escrow release irregularities detected` });
  if (params.grantCyclingSignals > 2) flags.push({ grant_id: gid, flag_type: "grant_cycling", severity: "medium", explanation: `Grant cycling behavior detected with ${params.grantCyclingSignals} signals` });

  return flags;
}

export async function saveGrantMisuseFlags(flags: GrantMisuseFlagInput[]): Promise<void> {
  if (!flags.length) return;
  const { error } = await supabase.from("grant_misuse_flags" as any).insert(flags);
  if (error) throw error;
}

export async function getGrantMisuseFlags(grantId?: string, institutionId?: string) {
  let query = supabase.from("grant_misuse_flags" as any).select("*");
  if (grantId) query = query.eq("grant_id", grantId);
  if (institutionId) query = query.eq("institution_id", institutionId);
  const { data, error } = await query.order("detected_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// PATENT INFLATION
// =====================================================

export async function savePatentInflationFlags(flags: PatentInflationFlagInput[]): Promise<void> {
  if (!flags.length) return;
  const { error } = await supabase.from("patent_inflation_flags" as any).insert(flags);
  if (error) throw error;
}

export async function getPatentInflationFlags(entityType?: string, entityId?: string) {
  let query = supabase.from("patent_inflation_flags" as any).select("*");
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  const { data, error } = await query.order("detected_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// INSTITUTIONAL INTEGRITY RISK INDEX (IIRI)
// =====================================================

export function computeIIRI(input: IIRIInput): number {
  let score = 0;
  for (const [key, weight] of Object.entries(IIRI_WEIGHTS)) {
    score += ((input as any)[key === "citation_ring" ? "citation_ring_score" : key === "grant_inflation" ? "grant_inflation_score" : key === "compliance_concealment" ? "compliance_concealment_score" : key + "_score"] ?? (input as any)[key] ?? 0) * weight;
  }
  return Math.round(score * 100) / 100;
}

export async function saveIIRI(input: IIRIInput): Promise<number> {
  const overall = computeIIRI(input);
  const { error } = await supabase.from("institutional_integrity_risk" as any).insert({ ...input, overall_iiri: overall });
  if (error) throw error;
  return overall;
}

export async function getIIRI(institutionId?: string) {
  let query = supabase.from("institutional_integrity_risk" as any).select("*");
  if (institutionId) query = query.eq("institution_id", institutionId);
  const { data, error } = await query.order("computed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// JOURNAL RISK
// =====================================================

export function computeJournalRisk(input: JournalRiskInput): { score: number; tier: string } {
  const score = Math.round((
    input.citation_cartel_density * 0.20 + input.retraction_frequency * 0.15 +
    input.self_citation_ratio * 0.15 + input.author_concentration * 0.10 +
    input.peer_review_anomaly_score * 0.15 + input.rapid_acceptance_ratio * 0.15 +
    input.conflict_of_interest_score * 0.10
  ) * 100) / 100;
  const tier = score > 0.7 ? "critical" : score > 0.4 ? "high" : score > 0.2 ? "medium" : "low";
  return { score, tier };
}

export async function saveJournalRisk(input: JournalRiskInput): Promise<{ score: number; tier: string }> {
  const result = computeJournalRisk(input);
  const { error } = await supabase.from("journal_risk_profiles" as any).insert({ ...input, overall_risk_score: result.score, risk_tier: result.tier });
  if (error) throw error;
  return result;
}

export async function getJournalRisks(tier?: string) {
  let query = supabase.from("journal_risk_profiles" as any).select("*");
  if (tier) query = query.eq("risk_tier", tier);
  const { data, error } = await query.order("overall_risk_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// REPUTATION VOLATILITY
// =====================================================

export function detectReputationVolatility(params: {
  metricName: string; previousValue: number; currentValue: number;
  volatilityThreshold?: number;
}): VolatilityEventInput | null {
  const change = params.previousValue > 0 ? (params.currentValue - params.previousValue) / params.previousValue : 0;
  const threshold = params.volatilityThreshold ?? 0.5;
  if (Math.abs(change) < threshold) return null;

  return {
    entity_type: "", entity_id: "",
    event_type: change > 0 ? "sudden_spike" : "sudden_drop",
    severity: Math.abs(change) > 1 ? "critical" : "high",
    metric_name: params.metricName,
    previous_value: params.previousValue,
    current_value: params.currentValue,
    change_pct: Math.round(change * 10000) / 100,
    explanation: `${params.metricName} changed by ${(change * 100).toFixed(1)}% — exceeds ${(threshold * 100).toFixed(0)}% volatility threshold`,
    triggered_review: Math.abs(change) > 1,
  };
}

export async function saveVolatilityEvents(events: VolatilityEventInput[]): Promise<void> {
  if (!events.length) return;
  const { error } = await supabase.from("reputation_volatility_events" as any).insert(events);
  if (error) throw error;
}

export async function getVolatilityEvents(entityType?: string, entityId?: string) {
  let query = supabase.from("reputation_volatility_events" as any).select("*");
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  const { data, error } = await query.order("detected_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// OPEN SCIENCE FRAUD
// =====================================================

export async function saveOpenScienceFraudFlags(flags: OpenScienceFraudInput[]): Promise<void> {
  if (!flags.length) return;
  const { error } = await supabase.from("open_science_fraud_flags" as any).insert(flags);
  if (error) throw error;
}

export async function getOpenScienceFraudFlags(entityType?: string, entityId?: string) {
  let query = supabase.from("open_science_fraud_flags" as any).select("*");
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  const { data, error } = await query.order("detected_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// NETWORK COLLUSION
// =====================================================

export async function saveCollusionFlags(flags: CollusionFlagInput[]): Promise<void> {
  if (!flags.length) return;
  const { error } = await supabase.from("network_collusion_flags" as any).insert(flags);
  if (error) throw error;
}

export async function getCollusionFlags(collusionType?: string) {
  let query = supabase.from("network_collusion_flags" as any).select("*");
  if (collusionType) query = query.eq("collusion_type", collusionType);
  const { data, error } = await query.order("detected_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// INTEGRITY CONFIDENCE SCORE (ICS)
// =====================================================

export function computeICS(input: ICSInput): number {
  let score = 0;
  for (const [key, weight] of Object.entries(ICS_WEIGHTS)) {
    score += ((input as any)[key] ?? 1) * weight;
  }
  return Math.round(score * 100) / 100;
}

export async function saveICS(input: ICSInput): Promise<number> {
  const overall = computeICS(input);
  const breakdown = Object.fromEntries(Object.entries(ICS_WEIGHTS).map(([k, w]) => [k, { value: (input as any)[k], weight: w, contribution: ((input as any)[k] ?? 1) * w }]));
  const { error } = await supabase.from("integrity_confidence_scores" as any).insert({ ...input, overall_ics: overall, breakdown });
  if (error) throw error;
  return overall;
}

export async function getICS(entityType?: string, entityId?: string) {
  let query = supabase.from("integrity_confidence_scores" as any).select("*");
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  const { data, error } = await query.order("computed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// APPEAL WORKFLOW
// =====================================================

export async function submitAppeal(input: AppealInput): Promise<string> {
  const { data, error } = await supabase.from("integrity_appeals" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function updateAppealStatus(appealId: string, update: {
  status: string; assigned_reviewer?: string; decision?: string;
  decision_reason?: string; transparency_record?: Record<string, unknown>;
}): Promise<void> {
  const payload: any = { ...update };
  if (update.decision) payload.decided_at = new Date().toISOString();
  const { error } = await supabase.from("integrity_appeals" as any).update(payload).eq("id", appealId);
  if (error) throw error;
}

export async function getAppeals(filters?: { appellant_id?: string; status?: string; flag_table?: string }) {
  let query = supabase.from("integrity_appeals" as any).select("*");
  if (filters?.appellant_id) query = query.eq("appellant_id", filters.appellant_id);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.flag_table) query = query.eq("flag_table", filters.flag_table);
  const { data, error } = await query.order("submitted_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
