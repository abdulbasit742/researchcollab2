/**
 * Global Execution Economy Layer (GEEL)
 * Infrastructure for civilization-scale execution economy.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Constants ──────────────────────────────────────────────
export const ECS_COMPONENTS = ["milestone_punctuality", "escrow_compliance", "dispute_resolution_efficiency", "knowledge_contribution_impact", "institutional_endorsement", "cross_border_reliability", "startup_survival_contribution", "funding_transparency", "policy_alignment", "long_term_consistency"] as const;

export const FUNDING_TYPES = ["milestone_locked", "conditional_disbursement", "performance_linked", "compliance_triggered", "cross_border_filtered", "risk_tiered"] as const;

export const TRUST_SOURCES = ["successful_collaboration", "verified_delivery", "dispute_fairness", "knowledge_citation", "institutional_validation", "cross_border_stability"] as const;

export const EXECUTION_LEVELS = ["emerging", "developing", "established", "advanced", "elite"] as const;

export const CORRIDOR_ENTITY_TYPES = ["university", "corporation", "startup", "government", "enterprise", "regional_hub", "policy_body", "investor", "research_lab"] as const;

export const INTEGRATION_TYPES = ["grant_system", "procurement", "funding_portal", "startup_tracking", "data_repository"] as const;

export const MEMORY_TYPES = ["innovation_wave", "funding_cycle", "enterprise_evolution", "institutional_transformation", "regional_pattern", "corridor_history", "trust_ecosystem_shift"] as const;

export const AI_INSIGHT_TYPES = ["skill_shortage", "funding_inefficiency", "corridor_suggestion", "startup_survival_forecast", "policy_friction", "trust_erosion", "economic_acceleration", "institutional_alignment"] as const;

export const REVENUE_STREAM_TYPES = ["escrow_fee", "institutional_subscription", "enterprise_licensing", "funding_oversight", "intelligence_analytics", "api_integration", "compliance_audit", "ai_orchestration_premium"] as const;

export const THREAT_TYPES = ["financial_crisis", "institutional_collapse", "regulatory_shift", "geopolitical_instability", "trust_collapse", "startup_crash", "funding_contraction", "misinformation_wave"] as const;

export const GEEL_PHILOSOPHY = {
  category: "Global Execution Economy Infrastructure",
  principle: "Execution replaces engagement. Milestones replace metrics. Trust replaces followers.",
  noAds: true,
  revenueModel: "Execution-aligned, not attention-based",
} as const;

// ─── Input Types ────────────────────────────────────────────
export interface ECSInput {
  user_id: string;
  milestone_punctuality?: number;
  escrow_compliance?: number;
  dispute_resolution_efficiency?: number;
  knowledge_contribution_impact?: number;
  institutional_endorsement?: number;
  cross_border_reliability?: number;
  startup_survival_contribution?: number;
  funding_transparency?: number;
  policy_alignment?: number;
  long_term_consistency?: number;
}

export interface ProgrammableFundingInput {
  title: string;
  funding_type?: string;
  total_amount?: number;
  milestone_conditions?: unknown[];
  performance_unlock_rules?: unknown[];
  compliance_triggers?: unknown[];
  cross_border_filters?: unknown[];
  risk_tier?: string;
  escrow_structure?: Record<string, unknown>;
  institutional_reporting?: Record<string, unknown>;
  ai_oversight_enabled?: boolean;
  created_by?: string;
}

export interface TrustNetworkInput {
  user_id: string;
  trust_source: string;
  trust_value?: number;
  funding_eligibility_impact?: number;
  opportunity_visibility_impact?: number;
  institutional_partnership_impact?: number;
  enterprise_contract_impact?: number;
  policy_advisory_impact?: number;
  startup_equity_impact?: number;
  is_transferable?: boolean;
}

export interface SkillEconomyInput {
  user_id: string;
  domain: string;
  execution_level?: string;
  milestone_consistency?: number;
  institutional_reliability?: number;
  cross_border_readiness?: number;
  funding_handling_capacity?: number;
  dispute_recovery_strength?: number;
  linked_outcomes?: unknown[];
  escrow_history_summary?: Record<string, unknown>;
  patent_involvement?: number;
  startup_contributions?: number;
}

export interface ExecutionCorridorInput {
  corridor_name: string;
  source_type: string;
  target_type: string;
  source_region?: string;
  target_region?: string;
  regulatory_compatibility?: Record<string, unknown>;
  funding_eligibility?: Record<string, unknown>;
  ip_alignment?: Record<string, unknown>;
  trust_compatibility_score?: number;
  cultural_integration_index?: number;
  execution_success_history?: unknown[];
}

export interface InstitutionalIntegrationInput {
  institution_id?: string;
  institution_type: string;
  integration_type: string;
  integration_config?: Record<string, unknown>;
  api_endpoint?: string;
}

export interface CapitalFormationInput {
  user_id: string;
  lifetime_funding_secured?: number;
  milestones_delivered?: number;
  startups_formed?: number;
  patents_filed?: number;
  cross_border_projects?: number;
  institutional_partnerships?: number;
  knowledge_published?: number;
  policy_contributions?: number;
  regional_economic_impact?: number;
}

export interface GovernanceMonitorInput {
  metric_type: string;
  metric_value?: number;
  trust_concentration_gini?: number;
  funding_monopolization_risk?: number;
  regional_imbalance_index?: number;
  institutional_dominance_score?: number;
  cross_border_exclusion_pct?: number;
  opportunity_fairness_index?: number;
  dispute_bias_score?: number;
  alerts?: unknown[];
}

export interface MacroIntelligenceInput {
  region?: string;
  funding_flow_data?: Record<string, unknown>;
  startup_formation_density?: number;
  trust_concentration?: number;
  skill_migration_flows?: unknown[];
  innovation_pipeline_velocity?: number;
  policy_adoption_rate?: number;
  cross_border_density?: number;
  economic_output_multiplier?: number;
}

export interface AIOrchestatorInput {
  insight_type: string;
  insight_summary: string;
  reasoning?: string;
  affected_region?: string;
  affected_domain?: string;
  confidence?: number;
  recommended_action?: string;
}

export interface IntergenerationalMemoryInput {
  memory_type: string;
  title: string;
  description?: string;
  period_start?: string;
  period_end?: string;
  data_snapshot?: Record<string, unknown>;
  linked_entities?: unknown[];
  significance_score?: number;
}

export interface RevenueStreamInput {
  stream_type: string;
  description?: string;
  amount?: number;
  currency?: string;
  source_entity_id?: string;
  source_entity_type?: string;
  period?: string;
}

export interface APIRegistryInput {
  api_name: string;
  api_type: string;
  version?: string;
  endpoint_pattern?: string;
  rate_limit?: number;
  requires_auth?: boolean;
  tier?: string;
  documentation_url?: string;
}

export interface ResilienceSafeguardInput {
  threat_type: string;
  severity?: string;
  detection_rules?: unknown[];
  mitigation_actions?: unknown[];
}

// ─── Execution Credit Score ─────────────────────────────────
export function computeECS(input: ECSInput): number {
  return Math.round((
    (input.milestone_punctuality ?? 0) * 0.15 +
    (input.escrow_compliance ?? 0) * 0.15 +
    (input.dispute_resolution_efficiency ?? 0) * 0.1 +
    (input.knowledge_contribution_impact ?? 0) * 0.1 +
    (input.institutional_endorsement ?? 0) * 0.1 +
    (input.cross_border_reliability ?? 0) * 0.1 +
    (input.startup_survival_contribution ?? 0) * 0.08 +
    (input.funding_transparency ?? 0) * 0.08 +
    (input.policy_alignment ?? 0) * 0.07 +
    (input.long_term_consistency ?? 0) * 0.07
  ) * 100) / 100;
}

export async function saveECS(input: ECSInput) {
  const composite = computeECS(input);
  const { data, error } = await (supabase as any).from("geel_execution_credit_scores").insert({ ...input, composite_ecs: composite }).select().single();
  if (error) throw error;
  return data;
}

export async function getECS(userId: string) {
  const { data, error } = await (supabase as any).from("geel_execution_credit_scores").select("*").eq("user_id", userId).order("computed_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Programmable Funding ───────────────────────────────────
export async function createProgrammableFunding(input: ProgrammableFundingInput) {
  const { data, error } = await (supabase as any).from("geel_programmable_funding").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getProgrammableFunding(filters: { status?: string; funding_type?: string } = {}) {
  let q = (supabase as any).from("geel_programmable_funding").select("*").order("created_at", { ascending: false });
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.funding_type) q = q.eq("funding_type", filters.funding_type);
  q = q.limit(50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Trust Network ──────────────────────────────────────────
export async function saveTrustNetwork(input: TrustNetworkInput) {
  const { data, error } = await (supabase as any).from("geel_trust_network").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getUserTrustNetwork(userId: string) {
  const { data, error } = await (supabase as any).from("geel_trust_network").select("*").eq("user_id", userId).order("computed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Skill Economy ──────────────────────────────────────────
export async function saveSkillEconomy(input: SkillEconomyInput) {
  const { data, error } = await (supabase as any).from("geel_skill_economy").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getUserSkillEconomy(userId: string) {
  const { data, error } = await (supabase as any).from("geel_skill_economy").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Execution Corridors ────────────────────────────────────
export async function createExecutionCorridor(input: ExecutionCorridorInput) {
  const { data, error } = await (supabase as any).from("geel_execution_corridors").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getExecutionCorridors(status?: string) {
  let q = (supabase as any).from("geel_execution_corridors").select("*").order("trust_compatibility_score", { ascending: false });
  if (status) q = q.eq("status", status);
  q = q.limit(50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Institutional Integrations ─────────────────────────────
export async function registerInstitutionalIntegration(input: InstitutionalIntegrationInput) {
  const { data, error } = await (supabase as any).from("geel_institutional_integrations").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getInstitutionalIntegrations(institutionType?: string) {
  let q = (supabase as any).from("geel_institutional_integrations").select("*").order("created_at", { ascending: false });
  if (institutionType) q = q.eq("institution_type", institutionType);
  q = q.limit(50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Capital Formation ──────────────────────────────────────
export function computeExecutionCapital(input: CapitalFormationInput): number {
  return Math.round((
    (input.lifetime_funding_secured ?? 0) * 0.001 +
    (input.milestones_delivered ?? 0) * 2 +
    (input.startups_formed ?? 0) * 10 +
    (input.patents_filed ?? 0) * 5 +
    (input.cross_border_projects ?? 0) * 3 +
    (input.institutional_partnerships ?? 0) * 4 +
    (input.knowledge_published ?? 0) * 1 +
    (input.policy_contributions ?? 0) * 2 +
    (input.regional_economic_impact ?? 0) * 0.5
  ) * 100) / 100;
}

export async function saveCapitalFormation(input: CapitalFormationInput) {
  const score = computeExecutionCapital(input);
  const { data, error } = await (supabase as any).from("geel_capital_formation").insert({ ...input, execution_capital_score: score }).select().single();
  if (error) throw error;
  return data;
}

export async function getCapitalFormation(userId: string) {
  const { data, error } = await (supabase as any).from("geel_capital_formation").select("*").eq("user_id", userId).order("computed_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Governance Monitor ─────────────────────────────────────
export async function saveGovernanceMetric(input: GovernanceMonitorInput) {
  const { data, error } = await (supabase as any).from("geel_governance_monitor").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getGovernanceMetrics() {
  const { data, error } = await (supabase as any).from("geel_governance_monitor").select("*").order("computed_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

// ─── Macro Intelligence ─────────────────────────────────────
export async function saveMacroIntelligence(input: MacroIntelligenceInput) {
  const { data, error } = await (supabase as any).from("geel_macro_intelligence").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getMacroIntelligence(region?: string) {
  let q = (supabase as any).from("geel_macro_intelligence").select("*").order("computed_at", { ascending: false });
  if (region) q = q.eq("region", region);
  q = q.limit(50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── AI Orchestrator ────────────────────────────────────────
export async function saveAIOrchestration(input: AIOrchestatorInput) {
  const { data, error } = await (supabase as any).from("geel_ai_orchestrator").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getAIOrchestrations(insightType?: string) {
  let q = (supabase as any).from("geel_ai_orchestrator").select("*").order("created_at", { ascending: false });
  if (insightType) q = q.eq("insight_type", insightType);
  q = q.limit(50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function reviewAIOrchestration(id: string, reviewedBy: string) {
  const { data, error } = await (supabase as any).from("geel_ai_orchestrator").update({ status: "reviewed", reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ─── Intergenerational Memory ───────────────────────────────
export async function saveIntergenerationalMemory(input: IntergenerationalMemoryInput) {
  const { data, error } = await (supabase as any).from("geel_intergenerational_memory").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getIntergenerationalMemory(memoryType?: string) {
  let q = (supabase as any).from("geel_intergenerational_memory").select("*").order("significance_score", { ascending: false });
  if (memoryType) q = q.eq("memory_type", memoryType);
  q = q.limit(50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Revenue Streams ────────────────────────────────────────
export async function saveRevenueStream(input: RevenueStreamInput) {
  const { data, error } = await (supabase as any).from("geel_revenue_streams").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getRevenueStreams(streamType?: string) {
  let q = (supabase as any).from("geel_revenue_streams").select("*").order("created_at", { ascending: false });
  if (streamType) q = q.eq("stream_type", streamType);
  q = q.limit(100);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── API Registry ───────────────────────────────────────────
export async function registerAPI(input: APIRegistryInput) {
  const { data, error } = await (supabase as any).from("geel_api_registry").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getAPIRegistry() {
  const { data, error } = await (supabase as any).from("geel_api_registry").select("*").eq("is_active", true).order("api_name");
  if (error) throw error;
  return data ?? [];
}

// ─── Resilience Safeguards ──────────────────────────────────
export async function saveSafeguard(input: ResilienceSafeguardInput) {
  const { data, error } = await (supabase as any).from("geel_resilience_safeguards").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getSafeguards(threatType?: string) {
  let q = (supabase as any).from("geel_resilience_safeguards").select("*").eq("is_active", true);
  if (threatType) q = q.eq("threat_type", threatType);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
