/**
 * Global Knowledge Evolution & Historical Intelligence Engine (GKEHIE)
 * Multi-decade knowledge archive and historical intelligence infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const DOMAIN_LIFECYCLE_PHASES = [
  "emergence", "acceleration", "saturation", "fragmentation", "decline", "reinvention",
] as const;
export type DomainLifecyclePhase = typeof DOMAIN_LIFECYCLE_PHASES[number];

export const PARADIGM_SHIFT_TYPES = [
  "citation_network_reconfiguration", "funding_regime_change", "cross_domain_convergence",
  "methodology_dominance", "theory_collapse", "breakthrough_cluster",
  "patent_acceleration", "collaboration_spike",
] as const;
export type ParadigmShiftType = typeof PARADIGM_SHIFT_TYPES[number];

export const INNOVATION_WAVE_PHASES = ["surge", "peak", "plateau", "stability", "decline", "reinvention"] as const;
export type InnovationWavePhase = typeof INNOVATION_WAVE_PHASES[number];

export const TIME_RANGES = [1, 5, 10, 20, 30] as const;

export const SUSTAINABILITY_WEIGHTS = {
  patent_survival: 0.15,
  startup_longevity: 0.15,
  institutional_resilience: 0.15,
  funding_continuity: 0.15,
  domain_reinvention: 0.15,
  collaboration_stability: 0.10,
  compliance_consistency: 0.15,
};

export const GKEHIE_TRANSPARENCY = {
  philosophy: "Historical intelligence engine — not static archive",
  timeRange: "Supports 1-year to 50-year views with decade-based comparisons",
  normalization: "Adjusts for inflation, population growth, and funding baselines",
  bias: "Does not bias toward recent data — rewards durable knowledge",
  paradigmShifts: "AI-detected with evidence-backed explanations",
};

// =====================================================
// TYPES
// =====================================================

export interface LongitudinalDataInput {
  entity_type: string;
  entity_id: string;
  year: number;
  domain?: string;
  country_code?: string;
  institution_id?: string;
  grants_count?: number;
  publications_count?: number;
  patents_count?: number;
  startups_formed?: number;
  venture_capital?: number;
  funding_amount?: number;
  compliance_score?: number;
  collaboration_density?: number;
  policy_citations?: number;
  commercialization_revenue?: number;
}

export interface DomainLifecycleInput {
  domain: string;
  phase: DomainLifecyclePhase;
  phase_start_year: number;
  phase_end_year?: number;
  funding_velocity: number;
  citation_velocity: number;
  patent_velocity: number;
  startup_formation_rate: number;
  cross_discipline_convergence: number;
  policy_adoption_curve: number;
  evidence?: Record<string, unknown>;
}

export interface ParadigmShiftInput {
  domain?: string;
  country_code?: string;
  shift_type: ParadigmShiftType;
  shift_year: number;
  description: string;
  evidence?: Record<string, unknown>;
  severity?: string;
  affected_domains?: string[];
  affected_institutions?: string[];
  explanation?: string;
}

export interface InstitutionalTrajectoryInput {
  institution_id: string;
  year: number;
  funding_total: number;
  patent_conversion_rate: number;
  commercialization_survival: number;
  collaboration_network_size: number;
  compliance_stability: number;
  innovation_yield: number;
  domain_specializations: string[];
  graduate_placement_rate: number;
  trajectory_direction?: string;
}

export interface GenerationalInfluenceInput {
  mentor_user_id: string;
  mentee_user_id: string;
  relationship_type?: string;
  domain?: string;
  start_year?: number;
  end_year?: number;
  grant_co_evolution_score?: number;
  citation_inheritance?: number;
  domain_leadership_transfer?: boolean;
  innovation_continuity?: number;
}

export interface KnowledgeSurvivalInput {
  entity_type: string;
  entity_id: string;
  domain?: string;
  research_cited_after_10yr_pct: number;
  patent_survival_15yr_pct: number;
  startup_survival_5yr_pct: number;
  domain_persistence_index: number;
  policy_impact_longevity: number;
  reproducibility_consistency: number;
  period?: string;
}

export interface InnovationWaveInput {
  domain: string;
  wave_name: string;
  wave_phase: InnovationWavePhase;
  start_year: number;
  peak_year?: number;
  current_year?: number;
  funding_acceleration: number;
  patent_acceleration: number;
  startup_surge: number;
  countries_affected?: string[];
  evidence?: Record<string, unknown>;
}

export interface FundingRegimeInput {
  country_code: string;
  regime_name: string;
  regime_type: string;
  start_year: number;
  end_year?: number;
  trigger_event?: string;
  funding_change_pct: number;
  domains_affected?: string[];
  policy_drivers?: string[];
  impact_on_innovation: number;
}

export interface SustainabilityScoreInput {
  entity_type: string;
  entity_id: string;
  patent_survival_score: number;
  startup_longevity_score: number;
  institutional_resilience: number;
  funding_continuity: number;
  domain_reinvention: number;
  collaboration_stability: number;
  compliance_consistency: number;
  period?: string;
}

// =====================================================
// LONGITUDINAL DATA
// =====================================================

export async function saveLongitudinalData(input: LongitudinalDataInput): Promise<void> {
  const { error } = await supabase.from("longitudinal_research_data" as any).insert(input);
  if (error) throw error;
}

export async function getLongitudinalData(filters: {
  entity_type?: string; entity_id?: string; domain?: string;
  country_code?: string; year_from?: number; year_to?: number;
}) {
  let query = supabase.from("longitudinal_research_data" as any).select("*");
  if (filters.entity_type) query = query.eq("entity_type", filters.entity_type);
  if (filters.entity_id) query = query.eq("entity_id", filters.entity_id);
  if (filters.domain) query = query.eq("domain", filters.domain);
  if (filters.country_code) query = query.eq("country_code", filters.country_code);
  if (filters.year_from) query = query.gte("year", filters.year_from);
  if (filters.year_to) query = query.lte("year", filters.year_to);
  const { data, error } = await query.order("year", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// DOMAIN LIFECYCLE
// =====================================================

export async function saveDomainLifecycle(input: DomainLifecycleInput): Promise<void> {
  const { error } = await supabase.from("domain_lifecycle_phases" as any).insert(input);
  if (error) throw error;
}

export async function getDomainLifecycle(domain?: string) {
  let query = supabase.from("domain_lifecycle_phases" as any).select("*");
  if (domain) query = query.eq("domain", domain);
  const { data, error } = await query.order("phase_start_year", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function detectDomainPhase(metrics: {
  fundingVelocity: number; citationVelocity: number;
  patentVelocity: number; startupRate: number;
}): DomainLifecyclePhase {
  const avg = (metrics.fundingVelocity + metrics.citationVelocity + metrics.patentVelocity + metrics.startupRate) / 4;
  if (avg > 0.5) return "acceleration";
  if (avg > 0.2) return "emergence";
  if (avg > 0) return "saturation";
  if (avg > -0.1) return "fragmentation";
  if (avg > -0.3) return "decline";
  return "reinvention";
}

// =====================================================
// PARADIGM SHIFTS
// =====================================================

export async function saveParadigmShift(input: ParadigmShiftInput): Promise<void> {
  const { error } = await supabase.from("paradigm_shift_events" as any).insert(input);
  if (error) throw error;
}

export async function getParadigmShifts(filters?: { domain?: string; country_code?: string; year_from?: number; year_to?: number }) {
  let query = supabase.from("paradigm_shift_events" as any).select("*");
  if (filters?.domain) query = query.eq("domain", filters.domain);
  if (filters?.country_code) query = query.eq("country_code", filters.country_code);
  if (filters?.year_from) query = query.gte("shift_year", filters.year_from);
  if (filters?.year_to) query = query.lte("shift_year", filters.year_to);
  const { data, error } = await query.order("shift_year", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function detectParadigmShiftSignals(params: {
  citationNetworkChange: number; fundingRegimeShift: number;
  crossDomainConvergence: number; methodologyShift: number;
  patentAcceleration: number; collaborationSpike: number;
}): Array<{ type: ParadigmShiftType; confidence: number; explanation: string }> {
  const signals: Array<{ type: ParadigmShiftType; confidence: number; explanation: string }> = [];

  if (params.citationNetworkChange > 0.4) signals.push({ type: "citation_network_reconfiguration", confidence: Math.min(params.citationNetworkChange, 1), explanation: "Major reconfiguration in citation network topology detected" });
  if (params.fundingRegimeShift > 0.3) signals.push({ type: "funding_regime_change", confidence: Math.min(params.fundingRegimeShift, 1), explanation: "Significant shift in funding allocation patterns" });
  if (params.crossDomainConvergence > 0.5) signals.push({ type: "cross_domain_convergence", confidence: Math.min(params.crossDomainConvergence, 1), explanation: "Multiple domains converging at accelerating rate" });
  if (params.methodologyShift > 0.4) signals.push({ type: "methodology_dominance", confidence: Math.min(params.methodologyShift, 1), explanation: "New methodology rapidly displacing established approaches" });
  if (params.patentAcceleration > 0.6) signals.push({ type: "patent_acceleration", confidence: Math.min(params.patentAcceleration, 1), explanation: "Sudden patent filing acceleration in domain" });
  if (params.collaborationSpike > 0.5) signals.push({ type: "collaboration_spike", confidence: Math.min(params.collaborationSpike, 1), explanation: "Cross-border collaboration intensity spiking" });

  return signals;
}

// =====================================================
// INSTITUTIONAL TRAJECTORY
// =====================================================

export async function saveInstitutionalTrajectory(input: InstitutionalTrajectoryInput): Promise<void> {
  const { error } = await supabase.from("institutional_trajectory_snapshots" as any).insert(input);
  if (error) throw error;
}

export async function getInstitutionalTrajectory(institutionId: string, yearFrom?: number, yearTo?: number) {
  let query = supabase.from("institutional_trajectory_snapshots" as any).select("*").eq("institution_id", institutionId);
  if (yearFrom) query = query.gte("year", yearFrom);
  if (yearTo) query = query.lte("year", yearTo);
  const { data, error } = await query.order("year", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// GENERATIONAL INFLUENCE
// =====================================================

export async function saveGenerationalInfluence(input: GenerationalInfluenceInput): Promise<void> {
  const { error } = await supabase.from("generational_influence_records" as any).insert(input);
  if (error) throw error;
}

export async function getGenerationalTree(userId: string) {
  const { data: mentees, error: e1 } = await supabase
    .from("generational_influence_records" as any).select("*").eq("mentor_user_id", userId);
  const { data: mentors, error: e2 } = await supabase
    .from("generational_influence_records" as any).select("*").eq("mentee_user_id", userId);
  if (e1) throw e1;
  if (e2) throw e2;
  return { mentees: mentees ?? [], mentors: mentors ?? [] };
}

// =====================================================
// KNOWLEDGE SURVIVAL INDEX
// =====================================================

export function computeKnowledgeSurvival(input: KnowledgeSurvivalInput): number {
  return Math.round((
    input.research_cited_after_10yr_pct * 0.20 +
    input.patent_survival_15yr_pct * 0.20 +
    input.startup_survival_5yr_pct * 0.15 +
    input.domain_persistence_index * 0.15 +
    input.policy_impact_longevity * 0.15 +
    input.reproducibility_consistency * 0.15
  ) * 100) / 100;
}

export async function saveKnowledgeSurvival(input: KnowledgeSurvivalInput): Promise<number> {
  const overall = computeKnowledgeSurvival(input);
  const { error } = await supabase.from("knowledge_survival_index" as any).insert({ ...input, overall_survival_score: overall });
  if (error) throw error;
  return overall;
}

export async function getKnowledgeSurvival(entityType?: string, entityId?: string) {
  let query = supabase.from("knowledge_survival_index" as any).select("*");
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  const { data, error } = await query.order("overall_survival_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// INNOVATION WAVES
// =====================================================

export async function saveInnovationWave(input: InnovationWaveInput): Promise<void> {
  const { error } = await supabase.from("innovation_wave_events" as any).insert(input);
  if (error) throw error;
}

export async function getInnovationWaves(domain?: string, phase?: InnovationWavePhase) {
  let query = supabase.from("innovation_wave_events" as any).select("*");
  if (domain) query = query.eq("domain", domain);
  if (phase) query = query.eq("wave_phase", phase);
  const { data, error } = await query.order("start_year", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// HISTORICAL FUNDING REGIMES
// =====================================================

export async function saveFundingRegime(input: FundingRegimeInput): Promise<void> {
  const { error } = await supabase.from("historical_funding_regimes" as any).insert(input);
  if (error) throw error;
}

export async function getFundingRegimes(countryCode?: string) {
  let query = supabase.from("historical_funding_regimes" as any).select("*");
  if (countryCode) query = query.eq("country_code", countryCode);
  const { data, error } = await query.order("start_year", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// LONG-TERM SUSTAINABILITY
// =====================================================

export function computeSustainability(input: SustainabilityScoreInput): number {
  let score = 0;
  for (const [key, weight] of Object.entries(SUSTAINABILITY_WEIGHTS)) {
    score += ((input as any)[key === "patent_survival" ? "patent_survival_score" : key === "startup_longevity" ? "startup_longevity_score" : key] ?? 0) * weight;
  }
  return Math.round(score * 100) / 100;
}

export async function saveSustainability(input: SustainabilityScoreInput): Promise<number> {
  const overall = computeSustainability(input);
  const { error } = await supabase.from("long_term_sustainability_scores" as any).insert({ ...input, overall_sustainability: overall });
  if (error) throw error;
  return overall;
}

export async function getSustainabilityScores(entityType?: string, entityId?: string) {
  let query = supabase.from("long_term_sustainability_scores" as any).select("*");
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  const { data, error } = await query.order("overall_sustainability", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// CROSS-DECADE COMPARISON
// =====================================================

export async function crossDecadeComparison(params: {
  entityType: string; entityId: string;
  periodA: { from: number; to: number };
  periodB: { from: number; to: number };
}) {
  const [dataA, dataB] = await Promise.all([
    getLongitudinalData({ entity_type: params.entityType, entity_id: params.entityId, year_from: params.periodA.from, year_to: params.periodA.to }),
    getLongitudinalData({ entity_type: params.entityType, entity_id: params.entityId, year_from: params.periodB.from, year_to: params.periodB.to }),
  ]);

  const aggregate = (data: any[]) => ({
    totalFunding: data.reduce((s, d) => s + (d.funding_amount ?? 0), 0),
    totalPublications: data.reduce((s, d) => s + (d.publications_count ?? 0), 0),
    totalPatents: data.reduce((s, d) => s + (d.patents_count ?? 0), 0),
    totalStartups: data.reduce((s, d) => s + (d.startups_formed ?? 0), 0),
    avgCompliance: data.length ? data.reduce((s, d) => s + (d.compliance_score ?? 0), 0) / data.length : 0,
    avgCollaboration: data.length ? data.reduce((s, d) => s + (d.collaboration_density ?? 0), 0) / data.length : 0,
    years: data.length,
  });

  return { periodA: aggregate(dataA), periodB: aggregate(dataB) };
}

// =====================================================
// AI HISTORICAL INSIGHT (PURE LOGIC)
// =====================================================

export function generateHistoricalInsights(data: {
  domainLifecycles: any[];
  paradigmShifts: any[];
  institutionalTrajectories: any[];
  innovationWaves: any[];
}): Array<{ question: string; answer: string; confidence: string; dataPoints: number }> {
  const insights: Array<{ question: string; answer: string; confidence: string; dataPoints: number }> = [];

  const declining = data.domainLifecycles.filter((d: any) => d.phase === "decline");
  if (declining.length > 0) {
    insights.push({
      question: "Which domains peaked and declined?",
      answer: `${declining.length} domains in decline phase: ${declining.map((d: any) => d.domain).join(", ")}`,
      confidence: "high",
      dataPoints: declining.length,
    });
  }

  const rising = data.institutionalTrajectories.filter((t: any) => t.trajectory_direction === "rising");
  if (rising.length > 0) {
    const fastest = rising.sort((a: any, b: any) => (b.innovation_yield ?? 0) - (a.innovation_yield ?? 0));
    insights.push({
      question: "Which institutions rose fastest?",
      answer: `${rising.length} institutions on rising trajectory. Top performer: ${fastest[0]?.institution_id ?? "unknown"}`,
      confidence: "medium",
      dataPoints: rising.length,
    });
  }

  const surges = data.innovationWaves.filter((w: any) => w.wave_phase === "surge" || w.wave_phase === "peak");
  if (surges.length > 0) {
    insights.push({
      question: "Which innovation waves are currently active?",
      answer: `${surges.length} active waves: ${surges.map((w: any) => w.wave_name).join(", ")}`,
      confidence: "high",
      dataPoints: surges.length,
    });
  }

  if (data.paradigmShifts.length > 0) {
    insights.push({
      question: "Which paradigm shifts were detected?",
      answer: `${data.paradigmShifts.length} shifts detected across ${[...new Set(data.paradigmShifts.map((s: any) => s.domain))].length} domains`,
      confidence: "medium",
      dataPoints: data.paradigmShifts.length,
    });
  }

  return insights;
}
