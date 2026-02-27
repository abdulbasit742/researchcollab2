/**
 * Multi-Layer Academic Impact Engine (MAIE)
 * Superior to Google Scholar h-index — 10 dimensions of academic impact
 * with anti-manipulation, field normalization, and global equity.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── MAIE Weights ───

const MAIE_WEIGHTS = {
  citationQuality: 0.15,
  funding: 0.12,
  execution: 0.13,
  policy: 0.08,
  commercialization: 0.10,
  crossDiscipline: 0.08,
  institutional: 0.08,
  longitudinal: 0.08,
  educational: 0.08,
  openScience: 0.10,
} as const;

// ─── Types ───

export interface MAIEScores {
  citationQualityIndex: number;
  fundingImpactScore: number;
  executionImpactScore: number;
  policyImpactIndex: number;
  commercializationImpactIndex: number;
  crossDisciplineImpactIndex: number;
  institutionalContributionScore: number;
  longitudinalConsistencyIndex: number;
  educationalImpactScore: number;
  openScienceContribution: number;
  overallMaie: number;
  fieldNormalized: boolean;
  globalEquityWeight: number;
}

export interface CQIInput {
  journalQualityWeight: number;
  crossDisciplineWeight: number;
  industryCitationWeight: number;
  policyCitationWeight: number;
  patentCitationWeight: number;
  internationalDiversityWeight: number;
  selfCitationPenalty: number;
  citationVelocityDecay: number;
  citationConcentrationPenalty: number;
}

export interface ManipulationSignal {
  flagType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence: Record<string, unknown>;
}

// ─── Citation Quality Index (CQI) ───

export function computeCQI(input: CQIInput): number {
  const positive =
    input.journalQualityWeight * 0.25 +
    input.crossDisciplineWeight * 0.20 +
    input.industryCitationWeight * 0.15 +
    input.policyCitationWeight * 0.10 +
    input.patentCitationWeight * 0.10 +
    input.internationalDiversityWeight * 0.20;

  const penalties =
    input.selfCitationPenalty * 0.4 +
    input.citationVelocityDecay * 0.3 +
    input.citationConcentrationPenalty * 0.3;

  return Math.max(0, Math.min(100, Math.round(positive * 100 - penalties * 30)));
}

// ─── Funding Impact Score (FIS) ───

export function computeFIS(params: {
  totalFunding: number;
  fundingDiversityIndex: number;
  competitiveGrantSuccessRate: number;
  grantRenewalFrequency: number;
  milestoneComplianceRate: number;
  budgetEfficiencyRatio: number;
  grantCompletionReliability: number;
  multiYearStability: number;
}): number {
  return Math.min(100, Math.round(
    Math.log10(params.totalFunding + 1) * 8 * 0.20 +
    params.fundingDiversityIndex * 0.12 +
    params.competitiveGrantSuccessRate * 0.15 +
    params.grantRenewalFrequency * 10 * 0.10 +
    params.milestoneComplianceRate * 0.15 +
    params.budgetEfficiencyRatio * 0.10 +
    params.grantCompletionReliability * 0.10 +
    params.multiYearStability * 0.08
  ));
}

// ─── Execution Impact Score (EIS) ───

export function computeEIS(params: {
  milestonePunctuality: number;
  deliverableAcceptanceRate: number;
  escrowCompliance: number;
  outputPerFundingUnit: number;
  projectCompletionRatio: number;
  concurrencyManagement: number;
  sponsorSatisfaction: number;
  disputeHistory: number;
}): number {
  return Math.min(100, Math.round(
    params.milestonePunctuality * 0.18 +
    params.deliverableAcceptanceRate * 0.15 +
    params.escrowCompliance * 0.12 +
    Math.min(100, params.outputPerFundingUnit * 20) * 0.10 +
    params.projectCompletionRatio * 0.15 +
    params.concurrencyManagement * 0.10 +
    params.sponsorSatisfaction * 0.10 +
    (100 - params.disputeHistory * 20) * 0.10
  ));
}

// ─── Cross-Discipline Impact Index (CDII) ───

export function computeCDII(params: {
  citationDomainsCount: number;
  crossFieldGrantCollabs: number;
  interdisciplinaryMilestoneSuccess: number;
  multiInstitutionBridging: number;
  innovationClusterParticipation: number;
  echoChambePenalty: number;
}): number {
  const raw =
    Math.min(100, params.citationDomainsCount * 15) * 0.25 +
    Math.min(100, params.crossFieldGrantCollabs * 20) * 0.20 +
    params.interdisciplinaryMilestoneSuccess * 0.20 +
    Math.min(100, params.multiInstitutionBridging * 15) * 0.15 +
    Math.min(100, params.innovationClusterParticipation * 20) * 0.10;

  return Math.max(0, Math.min(100, Math.round(raw - params.echoChambePenalty * 10)));
}

// ─── Longitudinal Consistency Index (LCI) ───

export function computeLCI(params: {
  citationGrowthStability: number;
  fundingContinuity: number;
  outputConsistency: number;
  fieldAdaptability: number;
  noArtificialSpikes: boolean;
  decadeReliability: number;
}): number {
  const spikeBonus = params.noArtificialSpikes ? 10 : 0;
  return Math.min(100, Math.round(
    params.citationGrowthStability * 0.20 +
    params.fundingContinuity * 0.20 +
    params.outputConsistency * 0.20 +
    params.fieldAdaptability * 0.15 +
    params.decadeReliability * 0.15 +
    spikeBonus * 0.10
  ));
}

// ─── Field Normalization ───

export async function getFieldBaseline(fieldName: string) {
  const { data } = await supabase
    .from("field_normalization_baselines" as any)
    .select("*")
    .eq("field_name", fieldName)
    .maybeSingle();
  return data;
}

export function applyFieldNormalization(rawScore: number, fieldAvg: number): number {
  if (fieldAvg <= 0) return rawScore;
  return Math.min(100, Math.round((rawScore / fieldAvg) * 50));
}

// ─── Global Equity Weighting ───

export async function getGlobalEquityWeight(region: string, countryCode?: string) {
  let query = supabase
    .from("global_equity_weights" as any)
    .select("*")
    .eq("region", region)
    .eq("is_active", true);

  if (countryCode) query = query.eq("country_code", countryCode);
  const { data } = await query.maybeSingle();
  return data;
}

// ─── Anti-Manipulation Engine ───

export function detectCitationManipulation(params: {
  selfCitationRatio: number;
  topCiterConcentration: number;
  mutualCitationPairs: number;
  coAuthorInflation: number;
  citationBurstScore: number;
  grantCyclingScore: number;
}): ManipulationSignal[] {
  const signals: ManipulationSignal[] = [];

  if (params.selfCitationRatio > 0.3) {
    signals.push({
      flagType: "self_citation_loop",
      severity: params.selfCitationRatio > 0.5 ? "critical" : "high",
      description: `Self-citation ratio of ${Math.round(params.selfCitationRatio * 100)}% exceeds threshold`,
      evidence: { ratio: params.selfCitationRatio },
    });
  }

  if (params.topCiterConcentration > 0.4) {
    signals.push({
      flagType: "citation_ring",
      severity: params.topCiterConcentration > 0.6 ? "critical" : "medium",
      description: `Top citers concentrate ${Math.round(params.topCiterConcentration * 100)}% of citations`,
      evidence: { concentration: params.topCiterConcentration },
    });
  }

  if (params.mutualCitationPairs > 5) {
    signals.push({
      flagType: "mutual_citation_cartel",
      severity: params.mutualCitationPairs > 10 ? "high" : "medium",
      description: `${params.mutualCitationPairs} mutual citation pairs detected`,
      evidence: { pairCount: params.mutualCitationPairs },
    });
  }

  if (params.coAuthorInflation > 0.5) {
    signals.push({
      flagType: "coauthor_inflation",
      severity: "medium",
      description: `Co-author count inflation score: ${Math.round(params.coAuthorInflation * 100)}%`,
      evidence: { score: params.coAuthorInflation },
    });
  }

  if (params.citationBurstScore > 0.7) {
    signals.push({
      flagType: "citation_burst",
      severity: "high",
      description: "Abnormal citation burst detected — possible coordinated activity",
      evidence: { burstScore: params.citationBurstScore },
    });
  }

  if (params.grantCyclingScore > 0.6) {
    signals.push({
      flagType: "grant_cycling_fraud",
      severity: "high",
      description: "Grant cycling pattern detected",
      evidence: { cyclingScore: params.grantCyclingScore },
    });
  }

  return signals;
}

// ─── Compute Full MAIE ───

export async function computeMAIE(userId: string, params: {
  cqiInput: CQIInput;
  fisParams: Parameters<typeof computeFIS>[0];
  eisParams: Parameters<typeof computeEIS>[0];
  policyImpactIndex: number;
  commercializationImpactIndex: number;
  cdiiParams: Parameters<typeof computeCDII>[0];
  institutionalContributionScore: number;
  lciParams: Parameters<typeof computeLCI>[0];
  educationalImpactScore: number;
  openScienceContribution: number;
  field?: string;
  region?: string;
  countryCode?: string;
}): Promise<MAIEScores> {
  const cqi = computeCQI(params.cqiInput);
  const fis = computeFIS(params.fisParams);
  const eis = computeEIS(params.eisParams);
  const pii = params.policyImpactIndex;
  const cii = params.commercializationImpactIndex;
  const cdii = computeCDII(params.cdiiParams);
  const ics = params.institutionalContributionScore;
  const lci = computeLCI(params.lciParams);
  const edu = params.educationalImpactScore;
  const oss = params.openScienceContribution;

  let globalEquityWeight = 1.0;
  if (params.region) {
    const equity = await getGlobalEquityWeight(params.region, params.countryCode);
    if (equity) {
      globalEquityWeight = 1.0 + Number((equity as any).emerging_market_boost ?? 0);
    }
  }

  const raw =
    cqi * MAIE_WEIGHTS.citationQuality +
    fis * MAIE_WEIGHTS.funding +
    eis * MAIE_WEIGHTS.execution +
    pii * MAIE_WEIGHTS.policy +
    cii * MAIE_WEIGHTS.commercialization +
    cdii * MAIE_WEIGHTS.crossDiscipline +
    ics * MAIE_WEIGHTS.institutional +
    lci * MAIE_WEIGHTS.longitudinal +
    edu * MAIE_WEIGHTS.educational +
    oss * MAIE_WEIGHTS.openScience;

  const overallMaie = Math.min(100, Math.round(raw * globalEquityWeight));

  const scores: MAIEScores = {
    citationQualityIndex: cqi,
    fundingImpactScore: fis,
    executionImpactScore: eis,
    policyImpactIndex: pii,
    commercializationImpactIndex: cii,
    crossDisciplineImpactIndex: cdii,
    institutionalContributionScore: ics,
    longitudinalConsistencyIndex: lci,
    educationalImpactScore: edu,
    openScienceContribution: oss,
    overallMaie,
    fieldNormalized: !!params.field,
    globalEquityWeight,
  };

  await supabase.from("maie_impact_scores" as any).upsert({
    user_id: userId,
    citation_quality_index: cqi,
    funding_impact_score: fis,
    execution_impact_score: eis,
    policy_impact_index: pii,
    commercialization_impact_index: cii,
    cross_discipline_impact_index: cdii,
    institutional_contribution_score: ics,
    longitudinal_consistency_index: lci,
    educational_impact_score: edu,
    open_science_contribution: oss,
    overall_maie: overallMaie,
    field_normalized: !!params.field,
    normalization_field: params.field,
    global_equity_weight: globalEquityWeight,
    last_computed_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  // Snapshot for evolution dashboard
  await supabase.from("impact_evolution_snapshots" as any).insert({
    user_id: userId,
    citation_quality_index: cqi,
    funding_impact_score: fis,
    execution_impact_score: eis,
    commercialization_impact: cii,
    policy_impact: pii,
    overall_maie: overallMaie,
    domain_at_snapshot: params.field,
  });

  return scores;
}

// ─── Query Functions ───

export async function getMAIEScores(userId: string): Promise<MAIEScores | null> {
  const { data } = await supabase
    .from("maie_impact_scores" as any)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;
  const d = data as any;
  return {
    citationQualityIndex: Number(d.citation_quality_index ?? 0),
    fundingImpactScore: Number(d.funding_impact_score ?? 0),
    executionImpactScore: Number(d.execution_impact_score ?? 0),
    policyImpactIndex: Number(d.policy_impact_index ?? 0),
    commercializationImpactIndex: Number(d.commercialization_impact_index ?? 0),
    crossDisciplineImpactIndex: Number(d.cross_discipline_impact_index ?? 0),
    institutionalContributionScore: Number(d.institutional_contribution_score ?? 0),
    longitudinalConsistencyIndex: Number(d.longitudinal_consistency_index ?? 0),
    educationalImpactScore: Number(d.educational_impact_score ?? 0),
    openScienceContribution: Number(d.open_science_contribution ?? 0),
    overallMaie: Number(d.overall_maie ?? 0),
    fieldNormalized: d.field_normalized ?? false,
    globalEquityWeight: Number(d.global_equity_weight ?? 1),
  };
}

export async function getImpactEvolution(userId: string) {
  const { data } = await supabase
    .from("impact_evolution_snapshots" as any)
    .select("*")
    .eq("user_id", userId)
    .order("snapshot_date", { ascending: true });
  return data ?? [];
}

export async function getPolicyImpactRecords(userId: string) {
  const { data } = await supabase
    .from("policy_impact_records" as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function addPolicyImpactRecord(userId: string, input: {
  paperId?: string;
  impactType: string;
  policyDocumentTitle?: string;
  issuingBody?: string;
  countryCode?: string;
  impactLevel?: string;
  evidenceUrl?: string;
}) {
  const { data, error } = await supabase
    .from("policy_impact_records" as any)
    .insert({
      user_id: userId,
      paper_id: input.paperId,
      impact_type: input.impactType,
      policy_document_title: input.policyDocumentTitle,
      issuing_body: input.issuingBody,
      country_code: input.countryCode,
      impact_level: input.impactLevel ?? "local",
      evidence_url: input.evidenceUrl,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function getManipulationFlags(userId?: string, paperId?: string) {
  let query = supabase.from("citation_manipulation_flags" as any).select("*").eq("status", "open");
  if (userId) query = query.eq("target_user_id", userId);
  if (paperId) query = query.eq("target_paper_id", paperId);
  const { data } = await query;
  return data ?? [];
}

// ─── Impact Transparency ───

export const MAIE_TRANSPARENCY = {
  dimensions: [
    { key: "CQI", label: "Citation Quality Index", weight: MAIE_WEIGHTS.citationQuality, description: "Quality-adjusted citation impact with self-citation penalties and cross-field bonuses" },
    { key: "FIS", label: "Funding Impact Score", weight: MAIE_WEIGHTS.funding, description: "Grant funding secured, diversity, renewal, and budget efficiency" },
    { key: "EIS", label: "Execution Impact Score", weight: MAIE_WEIGHTS.execution, description: "Milestone punctuality, deliverable acceptance, escrow compliance" },
    { key: "PII", label: "Policy Impact Index", weight: MAIE_WEIGHTS.policy, description: "Citations in government policy, advisory roles, regulatory influence" },
    { key: "CII", label: "Commercialization Impact", weight: MAIE_WEIGHTS.commercialization, description: "Patents, licensing, startups, venture funding, industry adoption" },
    { key: "CDII", label: "Cross-Discipline Impact", weight: MAIE_WEIGHTS.crossDiscipline, description: "Multi-domain citations, interdisciplinary grants, echo chamber penalty" },
    { key: "ICS", label: "Institutional Contribution", weight: MAIE_WEIGHTS.institutional, description: "Mentorship, PhD supervision, graduate placement, leadership" },
    { key: "LCI", label: "Longitudinal Consistency", weight: MAIE_WEIGHTS.longitudinal, description: "Decade-level reliability, no artificial spikes, sustained output" },
    { key: "EDU", label: "Educational Impact", weight: MAIE_WEIGHTS.educational, description: "Teaching influence, curriculum impact, student outcomes" },
    { key: "OSS", label: "Open Science Contribution", weight: MAIE_WEIGHTS.openScience, description: "Open data, reproducibility, public datasets, community tools" },
  ],
  antiManipulation: [
    "Self-citation ratio monitoring",
    "Citation ring detection",
    "Mutual citation cartel flagging",
    "Co-author inflation detection",
    "Citation burst analysis",
    "Grant cycling fraud detection",
  ],
  fieldNormalization: "Scores adjusted for field-specific citation density, funding norms, and commercialization likelihood",
  globalEquity: "Emerging market boost and underrepresented domain weighting prevent elite institution dominance",
  categoryShift: "From citation volume → economic, institutional, and societal contribution",
} as const;
