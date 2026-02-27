/**
 * Sovereign Trust Identity & Global Ledger (STIGL)
 * Portable, verifiable, execution-based global professional identity.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Constants ──────────────────────────────────────────────
export const LEDGER_ENTRY_TYPES = ["milestone_completion", "funding_release", "dispute_initiation", "dispute_resolution", "compliance_certification", "institutional_verification", "patent_registration", "startup_formation", "policy_advisory", "knowledge_citation"] as const;

export const VERIFICATION_TYPES = ["employment", "research_participation", "grant_role", "startup_cofounding", "patent_contribution", "compliance_certification", "policy_advisory"] as const;

export const EXPORT_FORMATS = ["api_integration", "institutional", "enterprise_procurement", "government_compliance"] as const;

export const FRAUD_FLAG_TYPES = ["duplicate_identity", "coordinated_trust_inflation", "institutional_forgery", "fake_milestone", "escrow_bypass", "synthetic_identity", "dispute_manipulation", "policy_impersonation"] as const;

export const AI_ANALYSIS_TYPES = ["trust_shift_explanation", "anomaly_detection", "trajectory_forecast", "risk_zone_identification", "recovery_strategy", "diversification_suggestion", "concentration_risk", "cross_border_forecast"] as const;

export const ACCESS_KEY_TYPES = ["higher_tier_funding", "enterprise_procurement", "institutional_collaboration", "startup_cofounder_trust", "policy_advisory", "cross_border_corridor", "governance_participation"] as const;

export const STIGL_PHILOSOPHY = {
  category: "Sovereign Trust Identity & Global Ledger",
  principle: "Identity is ledger-backed execution history, not self-declared summary",
  contrast: "LinkedIn profile = self-declared; SEID = ledger-backed execution identity",
} as const;

// ─── Input Types ────────────────────────────────────────────
export interface SEIDInput {
  user_id: string;
  seid_hash: string;
  skill_registry?: unknown[];
  project_history?: unknown[];
  milestone_completion_log?: unknown[];
  escrow_compliance_history?: Record<string, unknown>;
  dispute_resolution_history?: unknown[];
  funding_participation?: unknown[];
  institutional_endorsements?: unknown[];
  patent_participation?: unknown[];
  startup_involvement?: unknown[];
  knowledge_publications?: unknown[];
  cross_border_collaboration_index?: number;
  governance_participation?: unknown[];
}

export interface TrustLedgerEntry {
  user_id: string;
  entry_type: string;
  linked_entity_id?: string;
  linked_entity_type?: string;
  verification_authority?: string;
  trust_impact_delta?: number;
  jurisdiction_tag?: string;
  evidence_reference?: Record<string, unknown>;
  appeal_record?: Record<string, unknown>;
}

export interface ECSV2Input {
  user_id: string;
  milestone_punctuality?: number;
  deliverable_quality?: number;
  funding_compliance_rate?: number;
  dispute_fairness?: number;
  cross_border_reliability?: number;
  institutional_endorsement_strength?: number;
  knowledge_impact?: number;
  startup_survival_contribution?: number;
  policy_alignment_integrity?: number;
  governance_participation_fairness?: number;
}

export interface InstitutionalVerificationInput {
  user_id: string;
  institution_id?: string;
  verification_type: string;
  verification_details?: Record<string, unknown>;
  signed_ledger_entry_id?: string;
  trust_delta_applied?: number;
  verified_by?: string;
}

export interface CrossBorderCompatibilityInput {
  user_id: string;
  jurisdiction_execution_history?: unknown[];
  regulatory_compliance_history?: unknown[];
  export_control_alignment?: number;
  currency_handling_compliance?: number;
  international_collaboration_record?: unknown[];
  dispute_cross_border_stability?: number;
}

export interface IdentityExportInput {
  user_id: string;
  export_format: string;
  export_scope?: unknown[];
  recipient_type?: string;
  recipient_id?: string;
  export_hash?: string;
}

export interface PrivacySettingsInput {
  user_id: string;
  default_visibility?: string;
  enterprise_access_granted?: unknown[];
  institutional_access_granted?: unknown[];
  funding_disclosure_level?: string;
  anonymous_participation_enabled?: boolean;
  redacted_summary_enabled?: boolean;
}

export interface FraudFlagInput {
  flag_type: string;
  target_user_id?: string;
  description?: string;
  evidence?: Record<string, unknown>;
  severity?: string;
}

export interface TrustRecoveryInput {
  user_id: string;
  trigger_event: string;
  trust_decrease?: number;
  recovery_plan?: Record<string, unknown>;
  appeal_submitted?: boolean;
  institutional_mediation?: boolean;
}

export interface AITrustAnalysisInput {
  user_id: string;
  analysis_type: string;
  analysis_summary: string;
  reasoning?: string;
  trust_trajectory?: Record<string, unknown>;
  anomaly_detected?: boolean;
  risk_zones?: unknown[];
  recovery_suggestions?: unknown[];
  diversification_suggestions?: unknown[];
  concentration_risk?: number;
  cross_border_compatibility_forecast?: Record<string, unknown>;
  confidence?: number;
}

export interface ExternalIntegrationInput {
  requester_type: string;
  requester_id?: string;
  requester_name?: string;
  target_user_id: string;
  integration_type: string;
  verification_result?: Record<string, unknown>;
  linked_contract_id?: string;
  performance_validation?: Record<string, unknown>;
}

export interface TrustGraphEdgeInput {
  source_user_id: string;
  target_user_id: string;
  edge_type: string;
  trust_weight?: number;
  collaboration_density?: number;
  dispute_count?: number;
  funding_flow_impact?: number;
  corridor_tag?: string;
  region?: string;
}

export interface GenerationalContinuityInput {
  user_id: string;
  career_arc_years?: number;
  institutional_successions?: unknown[];
  startup_exit_history?: unknown[];
  policy_cycle_participation?: unknown[];
  cross_border_evolution?: unknown[];
  skill_reinvention_history?: unknown[];
  longitudinal_execution_memory?: Record<string, unknown>;
}

export interface AccessKeyInput {
  user_id: string;
  access_type: string;
  access_level?: string;
  ecs_threshold_met?: boolean;
  trust_threshold_met?: boolean;
  expires_at?: string;
}

// ─── ECS 2.0 Computation ───────────────────────────────────
export function computeECSV2(input: ECSV2Input): { composite: number; decomposition: Record<string, number> } {
  const weights = {
    milestone_punctuality: 0.15,
    deliverable_quality: 0.15,
    funding_compliance_rate: 0.12,
    dispute_fairness: 0.1,
    cross_border_reliability: 0.1,
    institutional_endorsement_strength: 0.1,
    knowledge_impact: 0.08,
    startup_survival_contribution: 0.08,
    policy_alignment_integrity: 0.06,
    governance_participation_fairness: 0.06,
  };
  const decomposition: Record<string, number> = {};
  let composite = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const val = (input as any)[key] ?? 0;
    const weighted = val * weight;
    decomposition[key] = Math.round(weighted * 100) / 100;
    composite += weighted;
  }
  return { composite: Math.round(composite * 100) / 100, decomposition };
}

export function computeCrossBorderCompatibility(input: CrossBorderCompatibilityInput): number {
  return Math.round((
    (input.export_control_alignment ?? 0) * 0.25 +
    (input.currency_handling_compliance ?? 0) * 0.25 +
    (input.dispute_cross_border_stability ?? 0) * 0.25 +
    ((input.international_collaboration_record?.length ?? 0) > 0 ? 0.25 : 0)
  ) * 100) / 100;
}

// ─── SEID ───────────────────────────────────────────────────
export async function createSEID(input: SEIDInput) {
  const { data, error } = await (supabase as any).from("stigl_sovereign_ids").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getSEID(userId: string) {
  const { data, error } = await (supabase as any).from("stigl_sovereign_ids").select("*").eq("user_id", userId).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

export async function updateSEID(userId: string, updates: Partial<SEIDInput>) {
  const { data, error } = await (supabase as any).from("stigl_sovereign_ids").update({ ...updates, updated_at: new Date().toISOString() }).eq("user_id", userId).select().single();
  if (error) throw error;
  return data;
}

// ─── Trust Ledger ───────────────────────────────────────────
export async function appendTrustLedger(entry: TrustLedgerEntry) {
  const { data, error } = await (supabase as any).from("stigl_trust_ledger").insert(entry).select().single();
  if (error) throw error;
  return data;
}

export async function getUserTrustLedger(userId: string, limit = 50) {
  const { data, error } = await (supabase as any).from("stigl_trust_ledger").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ─── ECS v2 ─────────────────────────────────────────────────
export async function saveECSV2(input: ECSV2Input) {
  const { composite, decomposition } = computeECSV2(input);
  const { data, error } = await (supabase as any).from("stigl_ecs_v2").insert({ ...input, composite_ecs: composite, decomposition }).select().single();
  if (error) throw error;
  return data;
}

export async function getECSV2(userId: string) {
  const { data, error } = await (supabase as any).from("stigl_ecs_v2").select("*").eq("user_id", userId).order("computed_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Institutional Verification ─────────────────────────────
export async function addInstitutionalVerification(input: InstitutionalVerificationInput) {
  const { data, error } = await (supabase as any).from("stigl_institutional_verifications").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getUserVerifications(userId: string) {
  const { data, error } = await (supabase as any).from("stigl_institutional_verifications").select("*").eq("user_id", userId).order("verified_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Cross-Border Compatibility ─────────────────────────────
export async function saveCrossBorderCompatibility(input: CrossBorderCompatibilityInput) {
  const composite = computeCrossBorderCompatibility(input);
  const { data, error } = await (supabase as any).from("stigl_cross_border_compatibility").insert({ ...input, composite_compatibility: composite }).select().single();
  if (error) throw error;
  return data;
}

export async function getCrossBorderCompatibility(userId: string) {
  const { data, error } = await (supabase as any).from("stigl_cross_border_compatibility").select("*").eq("user_id", userId).order("computed_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Identity Export ────────────────────────────────────────
export async function logIdentityExport(input: IdentityExportInput) {
  const { data, error } = await (supabase as any).from("stigl_identity_exports").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getIdentityExports(userId: string) {
  const { data, error } = await (supabase as any).from("stigl_identity_exports").select("*").eq("user_id", userId).order("exported_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Privacy Settings ───────────────────────────────────────
export async function savePrivacySettings(input: PrivacySettingsInput) {
  const { data: existing } = await (supabase as any).from("stigl_privacy_settings").select("id").eq("user_id", input.user_id).limit(1);
  if (existing && existing.length > 0) {
    const { data, error } = await (supabase as any).from("stigl_privacy_settings").update({ ...input, updated_at: new Date().toISOString() }).eq("user_id", input.user_id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await (supabase as any).from("stigl_privacy_settings").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getPrivacySettings(userId: string) {
  const { data, error } = await (supabase as any).from("stigl_privacy_settings").select("*").eq("user_id", userId).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Fraud Flags ────────────────────────────────────────────
export async function flagFraud(input: FraudFlagInput) {
  const { data, error } = await (supabase as any).from("stigl_fraud_flags").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getFraudFlags(status?: string) {
  let q = (supabase as any).from("stigl_fraud_flags").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  q = q.limit(50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function reviewFraudFlag(flagId: string, reviewedBy: string) {
  const { data, error } = await (supabase as any).from("stigl_fraud_flags").update({ status: "reviewed", reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() }).eq("id", flagId).select().single();
  if (error) throw error;
  return data;
}

// ─── Trust Recovery ─────────────────────────────────────────
export async function initiateTrustRecovery(input: TrustRecoveryInput) {
  const { data, error } = await (supabase as any).from("stigl_trust_recovery").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getUserTrustRecovery(userId: string) {
  const { data, error } = await (supabase as any).from("stigl_trust_recovery").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateTrustRecovery(id: string, updates: Partial<TrustRecoveryInput> & Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("stigl_trust_recovery").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ─── AI Trust Analysis ─────────────────────────────────────
export async function saveAITrustAnalysis(input: AITrustAnalysisInput) {
  const { data, error } = await (supabase as any).from("stigl_ai_trust_analysis").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getAITrustAnalysis(userId: string) {
  const { data, error } = await (supabase as any).from("stigl_ai_trust_analysis").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
  if (error) throw error;
  return data ?? [];
}

// ─── External Integrations ──────────────────────────────────
export async function requestExternalIntegration(input: ExternalIntegrationInput) {
  const { data, error } = await (supabase as any).from("stigl_external_integrations").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getExternalIntegrations(targetUserId: string) {
  const { data, error } = await (supabase as any).from("stigl_external_integrations").select("*").eq("target_user_id", targetUserId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Trust Graph ────────────────────────────────────────────
export async function saveTrustGraphEdge(input: TrustGraphEdgeInput) {
  const { data, error } = await (supabase as any).from("stigl_trust_graph").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getUserTrustGraph(userId: string) {
  const { data, error } = await (supabase as any).from("stigl_trust_graph").select("*").or(`source_user_id.eq.${userId},target_user_id.eq.${userId}`).order("trust_weight", { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

// ─── Generational Continuity ────────────────────────────────
export async function saveGenerationalContinuity(input: GenerationalContinuityInput) {
  const { data, error } = await (supabase as any).from("stigl_generational_continuity").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getGenerationalContinuity(userId: string) {
  const { data, error } = await (supabase as any).from("stigl_generational_continuity").select("*").eq("user_id", userId).order("computed_at", { ascending: false }).limit(1);
  if (error) throw error;
  return (data ?? [])[0] ?? null;
}

// ─── Access Keys ────────────────────────────────────────────
export async function createAccessKey(input: AccessKeyInput) {
  const { data, error } = await (supabase as any).from("stigl_access_keys").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getUserAccessKeys(userId: string) {
  const { data, error } = await (supabase as any).from("stigl_access_keys").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function unlockAccessKey(keyId: string) {
  const { data, error } = await (supabase as any).from("stigl_access_keys").update({ status: "unlocked", unlocked_at: new Date().toISOString() }).eq("id", keyId).select().single();
  if (error) throw error;
  return data;
}
