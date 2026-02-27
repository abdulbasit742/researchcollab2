/**
 * Global Open Science & Living Knowledge Infrastructure (GOSLKI)
 * Superior to Google Scholar + arXiv + Zenodo + OSF combined.
 * Living papers, dataset governance, reproducibility scoring, replication tracking.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const OPENNESS_LEVELS = [
  "fully_public", "institutional_only", "sponsor_only", "delayed_release",
  "embargo", "ip_sensitive_partial", "anonymized_dataset", "restricted_sandbox",
] as const;

export type OpennessLevel = typeof OPENNESS_LEVELS[number];

export const LRO_CHANGE_TYPES = [
  "initial_publication", "dataset_update", "code_refactor", "correction_notice",
  "extended_experiment", "cross_institution_validation", "patent_filing",
  "commercial_licensing", "policy_adoption", "methodology_update",
] as const;

export type LROChangeType = typeof LRO_CHANGE_TYPES[number];

export const REPRODUCIBILITY_ELEMENTS = [
  "code_available", "dataset_accessible", "environment_specified", "dependencies_documented",
  "containerized", "experiment_logged", "hyperparameters_documented", "benchmarked",
] as const;

export const GOSLKI_TRANSPARENCY = {
  philosophy: "Living research infrastructure — not static archive",
  lro: "Living Research Objects evolve with versioned, time-stamped, auditable updates",
  reproducibility: "8-dimension Reproducibility Reliability Index (RRI) — fully explainable",
  replication: "Community verification with structured replication reports",
  openness: "8-level configurable openness balancing transparency and IP protection",
};

export const RRI_WEIGHTS = {
  code_availability: 0.15,
  dataset_accessibility: 0.15,
  environment_reproducibility: 0.15,
  replication_success_rate: 0.15,
  documentation_completeness: 0.12,
  version_transparency: 0.10,
  dependency_clarity: 0.10,
  third_party_replications: 0.08,
};

export const OPEN_SCIENCE_IMPACT_WEIGHTS = {
  dataset_reuse: 0.15,
  code_forks: 0.12,
  replication_attempts: 0.12,
  replication_success: 0.15,
  derivative_citations: 0.12,
  cross_domain_reuse: 0.12,
  community_validation: 0.12,
  industry_adoption: 0.10,
};

// =====================================================
// TYPES
// =====================================================

export interface LROInput {
  title: string;
  abstract?: string;
  researcher_id?: string;
  institution_id?: string;
  grant_id?: string;
  patent_id?: string;
  openness_level?: OpennessLevel;
  metadata?: Record<string, unknown>;
  funding_breakdown?: Record<string, unknown>;
  dataset_links?: string[];
  code_repository_url?: string;
  industry_application_note?: string;
  ethical_approval_doc?: string;
}

export interface LROVersionInput {
  lro_id: string;
  version_number: number;
  change_summary: string;
  change_type: LROChangeType;
  content_snapshot?: Record<string, unknown>;
  updated_by?: string;
}

export interface DatasetInput {
  lro_id?: string;
  grant_id?: string;
  institution_id?: string;
  title: string;
  description?: string;
  data_schema?: Record<string, unknown>;
  metadata_standard?: string;
  access_level?: string;
  license_type?: string;
  privacy_compliance_tags?: string[];
  anonymization_verified?: boolean;
  encryption_verified?: boolean;
  retention_policy?: string;
}

export interface ReproducibilityInput {
  lro_id?: string;
  repository_url?: string;
  environment_spec?: Record<string, unknown>;
  dependency_manifest?: Record<string, unknown>;
  container_image?: string;
  experiment_logs?: unknown[];
  hyperparameters?: Record<string, unknown>;
  benchmark_results?: Record<string, unknown>;
  documentation_completeness?: number;
}

export interface RRIInput {
  code_availability: number;
  dataset_accessibility: number;
  environment_reproducibility: number;
  third_party_replications: number;
  replication_success_rate: number;
  documentation_completeness: number;
  version_transparency: number;
  dependency_clarity: number;
}

export interface ReplicationAttemptInput {
  lro_id: string;
  replicator_id?: string;
  institution_id?: string;
  report_summary?: string;
  inconsistencies?: string[];
  corrections_suggested?: string[];
  extension_proposals?: string[];
}

export interface OpenScienceImpactInput {
  dataset_reuse_frequency: number;
  code_fork_count: number;
  replication_attempts: number;
  replication_success_rate: number;
  derivative_citations: number;
  cross_domain_reuse: number;
  community_validation_depth: number;
  industry_dataset_adoption: number;
}

export interface MissingReproducibilityElement {
  element: string;
  suggestion: string;
  severity: string;
}

// =====================================================
// LIVING RESEARCH OBJECTS
// =====================================================

export async function createLRO(input: LROInput): Promise<string> {
  const { data, error } = await supabase
    .from("living_research_objects" as any)
    .insert({ ...input, status: "draft", current_version: 1 })
    .select("id")
    .single();
  if (error) throw error;
  return (data as any).id;
}

export async function getLRO(lroId: string) {
  const { data, error } = await supabase
    .from("living_research_objects" as any)
    .select("*")
    .eq("id", lroId)
    .single();
  if (error) throw error;
  return data;
}

export async function searchLROs(filters: { openness_level?: string; status?: string; institution_id?: string; grant_id?: string }) {
  let query = supabase.from("living_research_objects" as any).select("*");
  if (filters.openness_level) query = query.eq("openness_level", filters.openness_level);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.institution_id) query = query.eq("institution_id", filters.institution_id);
  if (filters.grant_id) query = query.eq("grant_id", filters.grant_id);
  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateLROVersion(input: LROVersionInput): Promise<void> {
  const { error: vErr } = await supabase.from("lro_versions" as any).insert(input);
  if (vErr) throw vErr;
  const { error: uErr } = await supabase
    .from("living_research_objects" as any)
    .update({ current_version: input.version_number, updated_at: new Date().toISOString() })
    .eq("id", input.lro_id);
  if (uErr) throw uErr;
}

export async function getLROVersionHistory(lroId: string) {
  const { data, error } = await supabase
    .from("lro_versions" as any)
    .select("*")
    .eq("lro_id", lroId)
    .order("version_number", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// DATASETS
// =====================================================

export async function createDataset(input: DatasetInput): Promise<string> {
  const { data, error } = await supabase
    .from("research_datasets" as any)
    .insert(input)
    .select("id")
    .single();
  if (error) throw error;
  return (data as any).id;
}

export async function getDatasets(lroId?: string, institutionId?: string) {
  let query = supabase.from("research_datasets" as any).select("*");
  if (lroId) query = query.eq("lro_id", lroId);
  if (institutionId) query = query.eq("institution_id", institutionId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function logDatasetAccess(datasetId: string, accessedBy: string, accessType: string, granted: boolean, denialReason?: string): Promise<void> {
  const { error } = await supabase.from("dataset_access_audit" as any).insert({
    dataset_id: datasetId, accessed_by: accessedBy, access_type: accessType,
    access_granted: granted, denial_reason: denialReason,
  });
  if (error) throw error;
}

// =====================================================
// CODE REPRODUCIBILITY
// =====================================================

export async function saveReproducibilityRecord(input: ReproducibilityInput): Promise<void> {
  const { error } = await supabase.from("code_reproducibility_records" as any).insert(input);
  if (error) throw error;
}

export async function getReproducibilityRecords(lroId: string) {
  const { data, error } = await supabase
    .from("code_reproducibility_records" as any)
    .select("*")
    .eq("lro_id", lroId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// REPRODUCIBILITY RELIABILITY INDEX (RRI)
// =====================================================

export function computeRRI(input: RRIInput): number {
  const replicationNorm = Math.min(1, input.third_party_replications / 10);
  const score =
    input.code_availability * RRI_WEIGHTS.code_availability +
    input.dataset_accessibility * RRI_WEIGHTS.dataset_accessibility +
    input.environment_reproducibility * RRI_WEIGHTS.environment_reproducibility +
    input.replication_success_rate * RRI_WEIGHTS.replication_success_rate +
    input.documentation_completeness * RRI_WEIGHTS.documentation_completeness +
    input.version_transparency * RRI_WEIGHTS.version_transparency +
    input.dependency_clarity * RRI_WEIGHTS.dependency_clarity +
    replicationNorm * RRI_WEIGHTS.third_party_replications;
  return Math.round(score * 100) / 100;
}

export async function saveRRI(lroId: string, input: RRIInput): Promise<number> {
  const overall = computeRRI(input);
  const { error } = await supabase.from("reproducibility_scores" as any).insert({
    lro_id: lroId, ...input, overall_rri: overall,
  });
  if (error) throw error;
  return overall;
}

export async function getRRI(lroId: string) {
  const { data, error } = await supabase
    .from("reproducibility_scores" as any)
    .select("*")
    .eq("lro_id", lroId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// REPLICATION SYSTEM
// =====================================================

export async function submitReplicationAttempt(input: ReplicationAttemptInput): Promise<string> {
  const { data, error } = await supabase
    .from("replication_attempts" as any)
    .insert({ ...input, status: "in_progress" })
    .select("id")
    .single();
  if (error) throw error;
  return (data as any).id;
}

export async function completeReplication(attemptId: string, success: boolean, report: string): Promise<void> {
  const { error } = await supabase
    .from("replication_attempts" as any)
    .update({ status: success ? "successful" : "failed", success, report_summary: report, completed_at: new Date().toISOString() })
    .eq("id", attemptId);
  if (error) throw error;
}

export async function getReplicationAttempts(lroId: string) {
  const { data, error } = await supabase
    .from("replication_attempts" as any)
    .select("*")
    .eq("lro_id", lroId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// OPEN SCIENCE IMPACT SCORE
// =====================================================

export function computeOpenScienceImpact(input: OpenScienceImpactInput): number {
  const norm = (v: number, max: number) => Math.min(1, v / max);
  const score =
    norm(input.dataset_reuse_frequency, 100) * OPEN_SCIENCE_IMPACT_WEIGHTS.dataset_reuse +
    norm(input.code_fork_count, 50) * OPEN_SCIENCE_IMPACT_WEIGHTS.code_forks +
    norm(input.replication_attempts, 20) * OPEN_SCIENCE_IMPACT_WEIGHTS.replication_attempts +
    input.replication_success_rate * OPEN_SCIENCE_IMPACT_WEIGHTS.replication_success +
    norm(input.derivative_citations, 50) * OPEN_SCIENCE_IMPACT_WEIGHTS.derivative_citations +
    norm(input.cross_domain_reuse, 10) * OPEN_SCIENCE_IMPACT_WEIGHTS.cross_domain_reuse +
    input.community_validation_depth * OPEN_SCIENCE_IMPACT_WEIGHTS.community_validation +
    norm(input.industry_dataset_adoption, 10) * OPEN_SCIENCE_IMPACT_WEIGHTS.industry_adoption;
  return Math.round(score * 100) / 100;
}

export async function saveOpenScienceImpact(entityType: string, entityId: string, input: OpenScienceImpactInput): Promise<number> {
  const overall = computeOpenScienceImpact(input);
  const { error } = await supabase.from("open_science_impact_scores" as any).insert({
    entity_type: entityType, entity_id: entityId, ...input, overall_score: overall,
  });
  if (error) throw error;
  return overall;
}

// =====================================================
// AI REPRODUCIBILITY ASSISTANT
// =====================================================

export function detectMissingReproducibility(record: {
  repository_url?: string;
  environment_spec?: Record<string, unknown>;
  dependency_manifest?: Record<string, unknown>;
  container_image?: string;
  experiment_logs?: unknown[];
  hyperparameters?: Record<string, unknown>;
  benchmark_results?: Record<string, unknown>;
  documentation_completeness?: number;
}): MissingReproducibilityElement[] {
  const missing: MissingReproducibilityElement[] = [];

  if (!record.repository_url) missing.push({ element: "code_repository", suggestion: "Add a public or institutional Git repository URL", severity: "critical" });
  if (!record.environment_spec || Object.keys(record.environment_spec).length === 0) missing.push({ element: "environment_spec", suggestion: "Specify runtime, OS, and hardware requirements", severity: "high" });
  if (!record.dependency_manifest || Object.keys(record.dependency_manifest).length === 0) missing.push({ element: "dependencies", suggestion: "Add a dependency manifest (requirements.txt, package.json, etc.)", severity: "high" });
  if (!record.container_image) missing.push({ element: "containerization", suggestion: "Provide a Docker image or Dockerfile for environment reproducibility", severity: "medium" });
  if (!record.experiment_logs || record.experiment_logs.length === 0) missing.push({ element: "experiment_logs", suggestion: "Log experiment runs with timestamps and parameters", severity: "medium" });
  if (!record.hyperparameters || Object.keys(record.hyperparameters).length === 0) missing.push({ element: "hyperparameters", suggestion: "Document all configurable parameters used in experiments", severity: "high" });
  if (!record.benchmark_results || Object.keys(record.benchmark_results).length === 0) missing.push({ element: "benchmarks", suggestion: "Include baseline benchmark results for comparison", severity: "medium" });
  if ((record.documentation_completeness ?? 0) < 0.7) missing.push({ element: "documentation", suggestion: "Improve documentation coverage to at least 70%", severity: "high" });

  return missing;
}
