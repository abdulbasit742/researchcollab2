/**
 * Global Talent Liquidity & Skill Market Engine (GTL-SME)
 * Replaces influencer sponsorships with professional opportunity infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const SIGNAL_TYPES = [
  "grant_call", "industry_rfp", "startup_hiring", "research_gap",
  "emerging_domain", "patent_trend", "funding_shift", "policy_expansion",
] as const;
export type SignalType = typeof SIGNAL_TYPES[number];

export const MICRO_TASK_TYPES = [
  "micro_milestone", "short_contract", "skill_task", "research_assist",
  "technical_review", "code_validation", "prototype_refinement", "grant_draft",
] as const;
export type MicroTaskType = typeof MICRO_TASK_TYPES[number];

export const FRAUD_FLAG_TYPES = [
  "fake_listing", "funding_misrepresentation", "unrealistic_deliverable",
  "exploitative_contract", "payment_bypass", "ip_manipulation", "sponsor_collusion",
] as const;

export const GTL_PHILOSOPHY = {
  monetizes: "Skill through execution",
  creates: "Talent liquidity",
  promotes: "Capability alignment",
  identity: "Professional opportunity infrastructure",
  rules: [
    "No opportunity based on follower count",
    "No paid exposure for hiring priority",
    "No engagement-based visibility",
    "Skill match must be data-driven",
    "Trust & reliability must influence opportunity ranking",
    "All economic transactions must use escrow",
    "Cross-border compliance must be enforced",
  ],
} as const;

// =====================================================
// TYPES
// =====================================================

export interface TalentLiquidityInput {
  user_id: string;
  skill_strength: number;
  execution_reliability: number;
  collaboration_trust: number;
  funding_experience: number;
  industry_integration: number;
  cross_domain_adaptability: number;
  compliance_integrity: number;
  response_reliability: number;
  time_to_deliver_efficiency: number;
}

export interface OpportunityMatchInput {
  user_id: string;
  opportunity_id?: string;
  opportunity_type: string;
  title: string;
  skill_overlap_pct: number;
  domain_match: number;
  execution_threshold: number;
  geographic_compat: number;
  funding_eligibility: number;
  industry_alignment: number;
  collab_compat: number;
  historical_similarity: number;
  risk_alignment: number;
  match_explanation?: string;
  selection_probability?: number;
  expected_earnings?: number;
}

export interface MicroTaskInput {
  parent_opportunity_id?: string;
  title: string;
  description?: string;
  task_type: string;
  skill_tags?: string[];
  domain?: string;
  estimated_hours?: number;
  budget?: number;
  currency?: string;
  escrow_required?: boolean;
  posted_by: string;
}

export interface CrossBorderContractInput {
  initiator_id: string;
  contractor_id?: string;
  source_country: string;
  target_country: string;
  currency_from: string;
  currency_to: string;
  jurisdiction_compliant?: boolean;
  ip_ownership_clarity?: boolean;
  contract_template?: string;
  tax_guidance_notes?: string;
}

export interface StabilityInput {
  user_id: string;
  income_volatility: number;
  sponsor_dependency: number;
  domain_concentration_risk: number;
  collaboration_overexposure: number;
  funding_instability: number;
  execution_overload_risk: number;
}

export interface ExecutionResumeInput {
  user_id: string;
  completed_milestones: number;
  delivered_projects: number;
  funding_managed: number;
  patents_filed: number;
  startups_launched: number;
  industry_deployments: number;
  compliance_record_score: number;
  collaboration_trust_score: number;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

const TLS_WEIGHTS = {
  skill_strength: 0.15, execution_reliability: 0.15, collaboration_trust: 0.12,
  funding_experience: 0.10, industry_integration: 0.10, cross_domain_adaptability: 0.10,
  compliance_integrity: 0.10, response_reliability: 0.10, time_to_deliver_efficiency: 0.08,
};

export function computeTalentLiquidity(input: Omit<TalentLiquidityInput, "user_id">): number {
  return Math.round(
    input.skill_strength * TLS_WEIGHTS.skill_strength +
    input.execution_reliability * TLS_WEIGHTS.execution_reliability +
    input.collaboration_trust * TLS_WEIGHTS.collaboration_trust +
    input.funding_experience * TLS_WEIGHTS.funding_experience +
    input.industry_integration * TLS_WEIGHTS.industry_integration +
    input.cross_domain_adaptability * TLS_WEIGHTS.cross_domain_adaptability +
    input.compliance_integrity * TLS_WEIGHTS.compliance_integrity +
    input.response_reliability * TLS_WEIGHTS.response_reliability +
    input.time_to_deliver_efficiency * TLS_WEIGHTS.time_to_deliver_efficiency
  );
}

const MATCH_WEIGHTS = {
  skill_overlap: 0.18, domain_match: 0.14, execution: 0.14, geographic: 0.08,
  funding: 0.10, industry: 0.10, collab: 0.10, historical: 0.08, risk: 0.08,
};

export function computeOpportunityMatch(input: Omit<OpportunityMatchInput, "user_id" | "opportunity_id" | "opportunity_type" | "title" | "match_explanation" | "selection_probability" | "expected_earnings">): number {
  return Math.round(
    input.skill_overlap_pct * MATCH_WEIGHTS.skill_overlap +
    input.domain_match * MATCH_WEIGHTS.domain_match +
    input.execution_threshold * MATCH_WEIGHTS.execution +
    input.geographic_compat * MATCH_WEIGHTS.geographic +
    input.funding_eligibility * MATCH_WEIGHTS.funding +
    input.industry_alignment * MATCH_WEIGHTS.industry +
    input.collab_compat * MATCH_WEIGHTS.collab +
    input.historical_similarity * MATCH_WEIGHTS.historical +
    input.risk_alignment * MATCH_WEIGHTS.risk
  );
}

export function computeStabilityScore(input: Omit<StabilityInput, "user_id">): number {
  // Higher stability = lower risk factors. Invert risk metrics.
  const riskAvg = (
    input.income_volatility + input.sponsor_dependency +
    input.domain_concentration_risk + input.collaboration_overexposure +
    input.funding_instability + input.execution_overload_risk
  ) / 6;
  return Math.round(100 - riskAvg);
}

// =====================================================
// DATA ACCESS
// =====================================================

export async function saveTalentLiquidity(input: TalentLiquidityInput): Promise<void> {
  const composite = computeTalentLiquidity(input);
  const { error } = await supabase.from("talent_liquidity_scores" as any)
    .upsert({ ...input, composite_tls: composite, computed_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getTalentLiquidity(userId: string) {
  const { data, error } = await supabase.from("talent_liquidity_scores" as any).select("*")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getTopTalent(limit = 20) {
  const { data, error } = await supabase.from("talent_liquidity_scores" as any).select("*")
    .order("composite_tls", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function saveOpportunityMatch(input: OpportunityMatchInput): Promise<string> {
  const composite = computeOpportunityMatch(input);
  const { data, error } = await supabase.from("talent_opportunity_matches" as any)
    .insert({ ...input, composite_match: composite }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getOpportunityMatches(userId: string) {
  const { data, error } = await supabase.from("talent_opportunity_matches" as any).select("*")
    .eq("user_id", userId).order("composite_match", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function createMicroTask(input: MicroTaskInput): Promise<string> {
  const { data, error } = await supabase.from("micro_talent_tasks" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getMicroTasks(filters?: { domain?: string; task_type?: string; status?: string }) {
  let query = supabase.from("micro_talent_tasks" as any).select("*").order("created_at", { ascending: false });
  if (filters?.domain) query = query.eq("domain", filters.domain);
  if (filters?.task_type) query = query.eq("task_type", filters.task_type);
  if (filters?.status) query = query.eq("status", filters.status ?? "open");
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function createCrossBorderContract(input: CrossBorderContractInput): Promise<string> {
  const { data, error } = await supabase.from("cross_border_contracts" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getSkillSupplyDemand(skillName?: string) {
  let query = supabase.from("skill_supply_demand" as any).select("*").order("supply_demand_ratio", { ascending: true });
  if (skillName) query = query.eq("skill_name", skillName);
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function getSkillDemandSignals(domain?: string) {
  let query = supabase.from("skill_demand_signals" as any).select("*").order("demand_intensity", { ascending: false });
  if (domain) query = query.eq("domain", domain);
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function flagOpportunityFraud(input: { opportunity_id?: string; flag_type: string; description?: string; evidence?: Record<string, unknown>; severity?: string; flagged_by?: string }): Promise<string> {
  const { data, error } = await supabase.from("opportunity_fraud_flags" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function saveStabilityMonitor(input: StabilityInput): Promise<void> {
  const stability = computeStabilityScore(input);
  const { error } = await supabase.from("liquidity_stability_monitor" as any)
    .upsert({ ...input, stability_score: stability, computed_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getStabilityMonitor(userId: string) {
  const { data, error } = await supabase.from("liquidity_stability_monitor" as any).select("*")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveExecutionResume(input: ExecutionResumeInput): Promise<void> {
  const { error } = await supabase.from("execution_resume" as any)
    .upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getExecutionResume(userId: string) {
  const { data, error } = await supabase.from("execution_resume" as any).select("*")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}
