/**
 * Enterprise Operating Ecosystem Engine (EOEE)
 * Beyond Facebook Pages — operational innovation ecosystems.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Constants ──────────────────────────────────────────────
export const PIPELINE_STAGES = ["idea_intake", "prototype", "pilot_deployment", "commercial_rollout", "startup_incubation", "patent_filing", "industry_scaling", "market_expansion"] as const;
export type PipelineStage = typeof PIPELINE_STAGES[number];

export const COLLABORATION_CALL_TYPES = ["rd_collaboration", "skills_sourcing", "funding_partnership", "institutional_bridge", "startup_scouting", "procurement", "policy_advisory"] as const;
export const PARTNERSHIP_TYPES = ["scouting", "equity_collaboration", "joint_venture", "pilot_funding", "milestone_capital", "post_pilot"] as const;
export const MEMORY_TYPES = ["innovation_wave", "strategic_pivot", "funding_evolution", "institutional_alliance", "startup_exit", "regulatory_change", "market_expansion", "economic_contribution"] as const;
export const CLUSTER_TYPES = ["collaboration", "innovation_network", "startup_web", "institutional_bridge", "funding_corridor", "patent_co_development"] as const;

export const EOEE_PHILOSOPHY = {
  category: "Enterprise Operating Ecosystem",
  contrast: "Facebook Pages are brand marketing channels; EOEE profiles are operational infrastructure",
  principle: "Execution and economic impact determine credibility, not followers",
} as const;

// ─── Input Types ────────────────────────────────────────────
export interface EnterpriseProfileInput {
  organization_id?: string;
  name: string;
  core_domains?: string[];
  rd_investment?: number;
  active_innovation_projects?: number;
  funding_participation?: number;
  startup_partnerships?: number;
  institutional_collaborations?: number;
  patent_portfolio?: number;
  industry_pilots?: number;
  created_by?: string;
}

export interface InnovationPipelineInput {
  enterprise_id: string;
  title: string;
  description?: string;
  stage?: string;
  domain?: string;
  funding_allocated?: number;
  linked_startup_id?: string;
  linked_institution_id?: string;
  patent_filed?: boolean;
  market_expansion_target?: string;
}

export interface CollaborationCallInput {
  enterprise_id: string;
  title: string;
  description?: string;
  call_type?: string;
  required_skills?: string[];
  funding_terms?: Record<string, unknown>;
  escrow_milestones?: unknown[];
  invited_institutions?: unknown[];
  invited_startups?: unknown[];
}

export interface CrossBorderInput {
  enterprise_id: string;
  target_region: string;
  regulatory_exposure?: Record<string, unknown>;
  funding_jurisdiction_compatibility?: number;
  institutional_partnership_density?: number;
  talent_mobility_readiness?: number;
  compliance_alignment?: number;
  innovation_export_capacity?: number;
  trust_corridor_strength?: number;
}

export interface ProcurementInput {
  enterprise_id: string;
  rfp_title: string;
  description?: string;
  vendor_trust_threshold?: number;
  escrow_milestones?: unknown[];
  compliance_requirements?: unknown[];
  institutional_linkage?: string;
}

export interface StartupPartnershipInput {
  enterprise_id: string;
  startup_name: string;
  partnership_type?: string;
  equity_terms?: Record<string, unknown>;
  joint_venture_proposal?: Record<string, unknown>;
  pilot_funding?: number;
  founder_trust_score?: number;
}

export interface ComplianceInput {
  enterprise_id: string;
  regulatory_certifications?: unknown[];
  audit_history?: unknown[];
  funding_compliance_rate?: number;
  data_governance_maturity?: number;
  ip_protection_compliance?: number;
  esg_metrics?: Record<string, unknown>;
  dispute_resolution_efficiency?: number;
  policy_alignment_score?: number;
}

export interface TalentPipelineInput {
  enterprise_id: string;
  skill_demand_gaps?: unknown[];
  recruitment_success_rate?: number;
  institutional_partnerships?: unknown[];
  internship_pipeline?: number;
  alumni_startup_collaborations?: number;
  cross_border_hiring?: Record<string, unknown>;
  skill_diversification?: Record<string, unknown>;
}

export interface TrustIndexInput {
  enterprise_id: string;
  contract_fulfillment_rate?: number;
  milestone_punctuality?: number;
  funding_compliance?: number;
  dispute_frequency?: number;
  institutional_endorsements?: number;
  startup_success_rate?: number;
  cross_border_reliability?: number;
  longitudinal_stability?: number;
}

export interface ImpactIndexInput {
  enterprise_id: string;
  innovation_output?: number;
  startup_incubation_success?: number;
  funding_efficiency?: number;
  cross_border_expansion?: number;
  trust_density?: number;
  institutional_collaboration_strength?: number;
  compliance_stability?: number;
  economic_multiplier?: number;
}

export interface IndustryClusterInput {
  enterprise_id: string;
  cluster_name: string;
  cluster_type?: string;
  connected_enterprises?: unknown[];
  startup_partnerships?: unknown[];
  institutional_bridges?: unknown[];
  funding_corridors?: unknown[];
  patent_co_development?: unknown[];
}

export interface EnterpriseMemoryInput {
  enterprise_id: string;
  memory_type: string;
  title: string;
  description?: string;
  period_start?: string;
  period_end?: string;
  impact_data?: Record<string, unknown>;
}

export interface EnterpriseSearchFilters {
  status?: string;
  domain?: string;
  limit?: number;
}

// ─── Enterprise Profiles ────────────────────────────────────
export async function createEnterpriseProfile(input: EnterpriseProfileInput) {
  const { data, error } = await (supabase as any).from("eoee_enterprise_profiles").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getEnterpriseProfiles(filters: EnterpriseSearchFilters = {}) {
  let q = (supabase as any).from("eoee_enterprise_profiles").select("*").order("created_at", { ascending: false });
  if (filters.status) q = q.eq("status", filters.status);
  q = q.limit(filters.limit ?? 50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getEnterpriseProfile(id: string) {
  const { data, error } = await (supabase as any).from("eoee_enterprise_profiles").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function updateEnterpriseProfile(id: string, updates: Partial<EnterpriseProfileInput> & Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("eoee_enterprise_profiles").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ─── Innovation Pipeline ────────────────────────────────────
export async function addPipelineItem(input: InnovationPipelineInput) {
  const { data, error } = await (supabase as any).from("eoee_innovation_pipeline").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getPipeline(enterpriseId: string) {
  const { data, error } = await (supabase as any).from("eoee_innovation_pipeline").select("*").eq("enterprise_id", enterpriseId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updatePipelineItem(id: string, updates: Partial<InnovationPipelineInput>) {
  const { data, error } = await (supabase as any).from("eoee_innovation_pipeline").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ─── Trust Index ────────────────────────────────────────────
export async function saveTrustIndex(input: TrustIndexInput) {
  const composite = (input.contract_fulfillment_rate ?? 0) * 0.2 + (input.milestone_punctuality ?? 0) * 0.15 + (input.funding_compliance ?? 0) * 0.15 + (1 - (input.dispute_frequency ?? 0)) * 0.1 + (input.startup_success_rate ?? 0) * 0.15 + (input.cross_border_reliability ?? 0) * 0.1 + (input.longitudinal_stability ?? 0) * 0.1 + Math.min((input.institutional_endorsements ?? 0) / 10, 1) * 0.05;
  const { data, error } = await (supabase as any).from("eoee_trust_index").insert({ ...input, composite_trust: Math.round(composite * 100) / 100 }).select().single();
  if (error) throw error;
  return data;
}

export async function getTrustIndex(enterpriseId: string) {
  const { data, error } = await (supabase as any).from("eoee_trust_index").select("*").eq("enterprise_id", enterpriseId).order("computed_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Collaboration Calls ────────────────────────────────────
export async function createCollaborationCall(input: CollaborationCallInput) {
  const { data, error } = await (supabase as any).from("eoee_collaboration_calls").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getCollaborationCalls(enterpriseId: string) {
  const { data, error } = await (supabase as any).from("eoee_collaboration_calls").select("*").eq("enterprise_id", enterpriseId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Cross-Border ───────────────────────────────────────────
export async function addCrossBorderEntry(input: CrossBorderInput) {
  const { data, error } = await (supabase as any).from("eoee_cross_border").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getCrossBorderEntries(enterpriseId: string) {
  const { data, error } = await (supabase as any).from("eoee_cross_border").select("*").eq("enterprise_id", enterpriseId);
  if (error) throw error;
  return data ?? [];
}

// ─── Procurement ────────────────────────────────────────────
export async function createProcurement(input: ProcurementInput) {
  const { data, error } = await (supabase as any).from("eoee_procurement").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getProcurements(enterpriseId: string) {
  const { data, error } = await (supabase as any).from("eoee_procurement").select("*").eq("enterprise_id", enterpriseId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Startup Partnerships ───────────────────────────────────
export async function addStartupPartnership(input: StartupPartnershipInput) {
  const { data, error } = await (supabase as any).from("eoee_startup_partnerships").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getStartupPartnerships(enterpriseId: string) {
  const { data, error } = await (supabase as any).from("eoee_startup_partnerships").select("*").eq("enterprise_id", enterpriseId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Compliance ─────────────────────────────────────────────
export async function saveCompliance(input: ComplianceInput) {
  const { data, error } = await (supabase as any).from("eoee_compliance").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getCompliance(enterpriseId: string) {
  const { data, error } = await (supabase as any).from("eoee_compliance").select("*").eq("enterprise_id", enterpriseId).order("computed_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Talent Pipeline ────────────────────────────────────────
export async function saveTalentPipeline(input: TalentPipelineInput) {
  const { data, error } = await (supabase as any).from("eoee_talent_pipeline").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getTalentPipeline(enterpriseId: string) {
  const { data, error } = await (supabase as any).from("eoee_talent_pipeline").select("*").eq("enterprise_id", enterpriseId).order("computed_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Impact Index ───────────────────────────────────────────
export async function saveImpactIndex(input: ImpactIndexInput) {
  const composite = (input.innovation_output ?? 0) * 0.2 + (input.startup_incubation_success ?? 0) * 0.15 + (input.funding_efficiency ?? 0) * 0.15 + (input.cross_border_expansion ?? 0) * 0.1 + (input.trust_density ?? 0) * 0.15 + (input.institutional_collaboration_strength ?? 0) * 0.1 + (input.compliance_stability ?? 0) * 0.05 + (input.economic_multiplier ?? 0) * 0.1;
  const { data, error } = await (supabase as any).from("eoee_impact_index").insert({ ...input, composite_impact: Math.round(composite * 100) / 100 }).select().single();
  if (error) throw error;
  return data;
}

export async function getImpactIndex(enterpriseId: string) {
  const { data, error } = await (supabase as any).from("eoee_impact_index").select("*").eq("enterprise_id", enterpriseId).order("computed_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Industry Clusters ──────────────────────────────────────
export async function addIndustryCluster(input: IndustryClusterInput) {
  const { data, error } = await (supabase as any).from("eoee_industry_clusters").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getIndustryClusters(enterpriseId: string) {
  const { data, error } = await (supabase as any).from("eoee_industry_clusters").select("*").eq("enterprise_id", enterpriseId);
  if (error) throw error;
  return data ?? [];
}

// ─── Enterprise Memory ──────────────────────────────────────
export async function addEnterpriseMemory(input: EnterpriseMemoryInput) {
  const { data, error } = await (supabase as any).from("eoee_enterprise_memory").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getEnterpriseMemory(enterpriseId: string) {
  const { data, error } = await (supabase as any).from("eoee_enterprise_memory").select("*").eq("enterprise_id", enterpriseId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Composite Scoring ─────────────────────────────────────
export function computeEnterpriseTrust(metrics: {
  contract_fulfillment_rate: number;
  milestone_punctuality: number;
  funding_compliance: number;
  dispute_frequency: number;
  institutional_endorsements: number;
  startup_success_rate: number;
  cross_border_reliability: number;
  longitudinal_stability: number;
}): number {
  return Math.round((
    metrics.contract_fulfillment_rate * 0.2 +
    metrics.milestone_punctuality * 0.15 +
    metrics.funding_compliance * 0.15 +
    (1 - metrics.dispute_frequency) * 0.1 +
    metrics.startup_success_rate * 0.15 +
    metrics.cross_border_reliability * 0.1 +
    metrics.longitudinal_stability * 0.1 +
    Math.min(metrics.institutional_endorsements / 10, 1) * 0.05
  ) * 100) / 100;
}

export function computeEnterpriseImpact(metrics: {
  innovation_output: number;
  startup_incubation_success: number;
  funding_efficiency: number;
  cross_border_expansion: number;
  trust_density: number;
  institutional_collaboration_strength: number;
  compliance_stability: number;
  economic_multiplier: number;
}): number {
  return Math.round((
    metrics.innovation_output * 0.2 +
    metrics.startup_incubation_success * 0.15 +
    metrics.funding_efficiency * 0.15 +
    metrics.cross_border_expansion * 0.1 +
    metrics.trust_density * 0.15 +
    metrics.institutional_collaboration_strength * 0.1 +
    metrics.compliance_stability * 0.05 +
    metrics.economic_multiplier * 0.1
  ) * 100) / 100;
}
