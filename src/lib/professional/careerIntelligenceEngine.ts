/**
 * Career Intelligence & Acceleration Engine (CIAE)
 * Replaces social branding with structured career infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const MASTERY_LEVELS = ["beginner", "intermediate", "advanced", "expert", "authority"] as const;
export type MasteryLevel = typeof MASTERY_LEVELS[number];

export const FUNDING_STAGES = [
  "micro_grant", "co_investigator", "lead_investigator", "multi_year_grant",
  "cross_border_grant", "institutional_funding_lead", "venture_funding", "industry_contract_lead",
] as const;
export type FundingStage = typeof FUNDING_STAGES[number];

export const CAREER_RISK_TYPES = [
  "sponsor_over_dependence", "domain_saturation", "skill_obsolescence",
  "collaboration_over_concentration", "funding_cliff", "compliance_vulnerability",
  "innovation_stagnation", "reputation_instability",
] as const;
export type CareerRiskType = typeof CAREER_RISK_TYPES[number];

export const CIAE_PHILOSOPHY = {
  builds: "Professional compounding, not personal brand",
  optimizes: "Career durability, not visibility spikes",
  encourages: "Long-term leverage, not short-term attention",
  rewards: "Execution consistency, not aesthetic consistency",
  shifts: "From attention strategy to capability architecture",
} as const;

// =====================================================
// TYPES
// =====================================================

export interface CareerTrajectoryInput {
  user_id: string;
  skill_evolution?: Record<string, unknown>[];
  funding_progression?: Record<string, unknown>[];
  institutional_mobility?: Record<string, unknown>[];
  domain_specialization_shifts?: Record<string, unknown>[];
  patent_startup_milestones?: Record<string, unknown>[];
  industry_deployment_timeline?: Record<string, unknown>[];
  collaboration_expansion?: Record<string, unknown>[];
  trust_score_evolution?: Record<string, unknown>[];
  innovation_intensity_trend?: Record<string, unknown>[];
  compliance_stability_history?: Record<string, unknown>[];
}

export interface SkillMasteryInput {
  user_id: string;
  skill_name: string;
  mastery_level?: string;
  project_application_count?: number;
  complexity_score?: number;
  cross_domain_integration?: number;
  industry_validation_count?: number;
  grant_utilization_count?: number;
  peer_evaluation_avg?: number;
  reproducibility_evidence?: number;
  retention_score?: number;
}

export interface FundingLadderInput {
  user_id: string;
  funding_stage: string;
  grant_id?: string;
  role?: string;
  amount?: number;
  cross_border?: boolean;
  institution_id?: string;
  success?: boolean;
}

export interface LeverageIndexInput {
  user_id: string;
  skill_uniqueness: number;
  funding_independence: number;
  collaboration_network_strength: number;
  institutional_recognition: number;
  patent_commercialization: number;
  startup_equity: number;
  domain_authority: number;
  industry_deployment: number;
  compliance_reliability: number;
}

export interface MobilityIntelInput {
  user_id: string;
  cross_border_compat: number;
  domain_demand_by_region?: Record<string, unknown>;
  institutional_transfer_prob: number;
  international_collab_readiness: number;
  global_funding_eligibility: number;
  cultural_adaptability: number;
}

export interface CareerStabilityInput {
  user_id: string;
  funding_volatility: number;
  project_completion_consistency: number;
  collaboration_continuity: number;
  skill_focus_stability: number;
  domain_coherence: number;
  integrity_stability: number;
  reputation_volatility: number;
}

export interface CareerRiskSignalInput {
  user_id: string;
  risk_type: string;
  severity?: string;
  description?: string;
  mitigation_suggestion?: string;
  metrics?: Record<string, unknown>;
}

export interface CareerSimulationInput {
  user_id: string;
  scenario: string;
  parameters?: Record<string, unknown>;
  funding_prob_change?: number;
  trust_impact?: number;
  leverage_change?: number;
  risk_impact?: number;
  opportunity_growth?: number;
  explanation?: string;
}

export interface GrowthProjectionInput {
  user_id: string;
  projection_years: number;
  domain_mastery_projection: number;
  funding_progression_curve: number;
  trust_accumulation_curve: number;
  leverage_growth_projection: number;
}

export interface BrandVsCapabilityInput {
  user_id: string;
  brand_visibility_score: number;
  capability_score: number;
  brand_driven_growth_pct: number;
  capability_driven_growth_pct: number;
  recommendation?: string;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

export function computeSkillMastery(input: Omit<SkillMasteryInput, "user_id" | "skill_name" | "mastery_level">): number {
  return Math.round(
    (input.project_application_count ?? 0) * 2 +
    (input.complexity_score ?? 0) * 0.15 +
    (input.cross_domain_integration ?? 0) * 0.15 +
    (input.industry_validation_count ?? 0) * 3 +
    (input.grant_utilization_count ?? 0) * 2 +
    (input.peer_evaluation_avg ?? 0) * 0.20 +
    (input.reproducibility_evidence ?? 0) * 0.15 +
    (input.retention_score ?? 0) * 0.20
  );
}

const LEVERAGE_WEIGHTS = {
  skill_uniqueness: 0.14, funding_independence: 0.12, collab_network: 0.12,
  institutional: 0.10, patent: 0.10, startup: 0.10,
  domain: 0.12, industry: 0.10, compliance: 0.10,
};

export function computeLeverageIndex(input: Omit<LeverageIndexInput, "user_id">): number {
  return Math.round(
    input.skill_uniqueness * LEVERAGE_WEIGHTS.skill_uniqueness +
    input.funding_independence * LEVERAGE_WEIGHTS.funding_independence +
    input.collaboration_network_strength * LEVERAGE_WEIGHTS.collab_network +
    input.institutional_recognition * LEVERAGE_WEIGHTS.institutional +
    input.patent_commercialization * LEVERAGE_WEIGHTS.patent +
    input.startup_equity * LEVERAGE_WEIGHTS.startup +
    input.domain_authority * LEVERAGE_WEIGHTS.domain +
    input.industry_deployment * LEVERAGE_WEIGHTS.industry +
    input.compliance_reliability * LEVERAGE_WEIGHTS.compliance
  );
}

export function computeMobilityScore(input: Omit<MobilityIntelInput, "user_id" | "domain_demand_by_region">): number {
  return Math.round(
    input.cross_border_compat * 0.20 +
    input.institutional_transfer_prob * 0.15 +
    input.international_collab_readiness * 0.20 +
    input.global_funding_eligibility * 0.20 +
    input.cultural_adaptability * 0.25
  );
}

export function computeCareerStability(input: Omit<CareerStabilityInput, "user_id">): number {
  const stabilityAvg = (
    input.project_completion_consistency + input.collaboration_continuity +
    input.skill_focus_stability + input.domain_coherence + input.integrity_stability
  ) / 5;
  const riskAvg = (input.funding_volatility + input.reputation_volatility) / 2;
  return Math.round(stabilityAvg * 0.65 + (100 - riskAvg) * 0.35);
}

export function computeGrowthComposite(input: Omit<GrowthProjectionInput, "user_id" | "projection_years">): number {
  return Math.round(
    input.domain_mastery_projection * 0.30 +
    input.funding_progression_curve * 0.25 +
    input.trust_accumulation_curve * 0.20 +
    input.leverage_growth_projection * 0.25
  );
}

// =====================================================
// DATA ACCESS
// =====================================================

// --- Trajectory Map (Section 1) ---
export async function saveCareerTrajectory(input: CareerTrajectoryInput): Promise<void> {
  const { error } = await supabase.from("career_trajectory_map" as any)
    .upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getCareerTrajectory_CIAE(userId: string) {
  const { data, error } = await supabase.from("career_trajectory_map" as any).select("*")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Skill Mastery (Section 2) ---
export async function saveSkillMastery(input: SkillMasteryInput): Promise<void> {
  const composite = computeSkillMastery(input);
  const { error } = await supabase.from("skill_mastery_records" as any)
    .upsert({ ...input, composite_mastery: composite, updated_at: new Date().toISOString() }, { onConflict: "user_id,skill_name" });
  if (error) throw error;
}

export async function getSkillMastery(userId: string) {
  const { data, error } = await supabase.from("skill_mastery_records" as any).select("*")
    .eq("user_id", userId).order("composite_mastery", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Funding Ladder (Section 3) ---
export async function addFundingLadderRecord(input: FundingLadderInput): Promise<string> {
  const { data, error } = await supabase.from("funding_ladder_records" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getFundingLadder(userId: string) {
  const { data, error } = await supabase.from("funding_ladder_records" as any).select("*")
    .eq("user_id", userId).order("started_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// --- Leverage Index (Section 4) ---
export async function saveLeverageIndex(input: LeverageIndexInput): Promise<void> {
  const composite = computeLeverageIndex(input);
  const { error } = await supabase.from("professional_leverage_index" as any)
    .upsert({ ...input, composite_leverage: composite, computed_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getLeverageIndex(userId: string) {
  const { data, error } = await supabase.from("professional_leverage_index" as any).select("*")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Mobility Intelligence (Section 5) ---
export async function saveMobilityIntel(input: MobilityIntelInput): Promise<void> {
  const composite = computeMobilityScore(input);
  const { error } = await supabase.from("global_mobility_intelligence" as any)
    .upsert({ ...input, composite_mobility: composite, computed_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getMobilityIntel(userId: string) {
  const { data, error } = await supabase.from("global_mobility_intelligence" as any).select("*")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Career Stability (Section 6) ---
export async function saveCareerStabilityIndex(input: CareerStabilityInput): Promise<void> {
  const composite = computeCareerStability(input);
  const { error } = await supabase.from("career_stability_index" as any)
    .upsert({ ...input, composite_stability: composite, computed_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getCareerStabilityIndex(userId: string) {
  const { data, error } = await supabase.from("career_stability_index" as any).select("*")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Career Risk (Section 7) ---
export async function saveCareerRisk(input: CareerRiskSignalInput): Promise<string> {
  const { data, error } = await supabase.from("career_risk_signals" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getCareerRisks(userId: string) {
  const { data, error } = await supabase.from("career_risk_signals" as any).select("*")
    .eq("user_id", userId).eq("resolved", false).order("detected_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Career Simulation (Section 10) ---
export async function saveCareerSimulation(input: CareerSimulationInput): Promise<string> {
  const { data, error } = await supabase.from("career_simulations" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getCareerSimulations(userId: string) {
  const { data, error } = await supabase.from("career_simulations" as any).select("*")
    .eq("user_id", userId).order("simulated_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

// --- Growth Projections (Section 14) ---
export async function saveGrowthProjection(input: GrowthProjectionInput): Promise<string> {
  const composite = computeGrowthComposite(input);
  const { data, error } = await supabase.from("career_growth_projections" as any)
    .insert({ ...input, composite_growth: composite }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getGrowthProjections(userId: string) {
  const { data, error } = await supabase.from("career_growth_projections" as any).select("*")
    .eq("user_id", userId).order("projection_years", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// --- Brand vs Capability (Section 12) ---
export async function saveBrandVsCapability(input: BrandVsCapabilityInput): Promise<void> {
  const { error } = await supabase.from("brand_vs_capability" as any)
    .upsert({ ...input, computed_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getBrandVsCapability(userId: string) {
  const { data, error } = await supabase.from("brand_vs_capability" as any).select("*")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}
