/**
 * Global Research Infrastructure & Interoperability Engine (GRIIE)
 * API registry, integrations, event bus, data standardization, identity federation, cross-border compliance.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const API_TYPES = [
  "research_data", "grant_lifecycle", "funding_flow", "compliance",
  "patent_commercialization", "collaboration_graph", "reputation_integrity",
  "institutional_ranking", "open_science", "innovation_economy",
] as const;
export type ApiType = typeof API_TYPES[number];

export const EVENT_TYPES = [
  "grant_approval", "milestone_completion", "escrow_release", "patent_filing",
  "publication_update", "compliance_flag", "reputation_change", "audit_result",
  "startup_formation", "funding_renewal",
] as const;
export type InfraEventType = typeof EVENT_TYPES[number];

export const INTEGRATION_TYPES = [
  "university_erp", "government_grant", "journal_publisher", "patent_office",
  "venture_capital", "identity_provider", "compliance_regulator", "open_science_repo",
] as const;
export type IntegrationType = typeof INTEGRATION_TYPES[number];

export const EXPORT_FORMATS = ["json", "csv", "api_feed", "government_template", "institutional_dashboard", "public_transparency"] as const;

export const EXTENSION_TYPES = [
  "analytics", "visualization", "domain_tool", "government_dashboard",
  "institutional_module", "plugin",
] as const;

export const GRIIE_TRANSPARENCY = {
  philosophy: "Global research infrastructure backbone — not a search engine",
  security: "Escrow invariants never bypassed via API. All external calls auditable",
  interoperability: "Standards-based, modular, no vendor lock-in",
  privacy: "Cross-border data transfers require jurisdiction approval",
  extensions: "All plugins pass security review, integrity audit, and permission enforcement",
};

// =====================================================
// TYPES
// =====================================================

export interface ApiRegistryInput {
  api_name: string;
  api_version?: string;
  api_type: string;
  description?: string;
  base_path: string;
  auth_method?: string;
  rate_limit_per_minute?: number;
  supports_webhooks?: boolean;
  supports_events?: boolean;
}

export interface ApiAccessGrantInput {
  api_id: string;
  grantee_type: string;
  grantee_id: string;
  permission_level: string;
  scopes?: string[];
  api_key_hash?: string;
  expires_at?: string;
  granted_by?: string;
}

export interface IntegrationConfigInput {
  integration_name: string;
  integration_type: string;
  provider: string;
  config?: Record<string, unknown>;
  auth_config?: Record<string, unknown>;
  sync_frequency?: string;
  institution_id?: string;
  sandbox_mode?: boolean;
}

export interface WebhookSubscriptionInput {
  subscriber_type: string;
  subscriber_id: string;
  event_types: string[];
  callback_url: string;
  secret_hash?: string;
}

export interface EventEmission {
  event_type: string;
  event_source: string;
  entity_type?: string;
  entity_id?: string;
  payload?: Record<string, unknown>;
}

export interface DataExportInput {
  exporter_type: string;
  exporter_id: string;
  export_format: string;
  export_scope: string;
  record_count: number;
  destination?: string;
  jurisdiction?: string;
  is_aggregated?: boolean;
}

export interface CrossBorderTransferInput {
  source_jurisdiction: string;
  destination_jurisdiction: string;
  data_category: string;
  data_classification?: string;
  requester_type: string;
  requester_id: string;
}

export interface ExtensionInput {
  extension_name: string;
  extension_type: string;
  developer_id: string;
  description?: string;
  version?: string;
  permission_scopes?: string[];
}

export interface IdentityFederationInput {
  user_id: string;
  provider: string;
  external_id: string;
  display_name?: string;
  institution_id?: string;
}

export interface StandardizationMappingInput {
  schema_type: string;
  source_system: string;
  source_field: string;
  target_field: string;
  transformation_rule?: string;
}

// =====================================================
// API REGISTRY
// =====================================================

export async function registerApi(input: ApiRegistryInput): Promise<string> {
  const { data, error } = await supabase.from("api_registry" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getApis(type?: string) {
  let query = supabase.from("api_registry" as any).select("*").eq("is_active", true);
  if (type) query = query.eq("api_type", type);
  const { data, error } = await query.order("api_name");
  if (error) throw error;
  return data ?? [];
}

export async function grantApiAccess(input: ApiAccessGrantInput): Promise<void> {
  const { error } = await supabase.from("api_access_grants" as any).insert(input);
  if (error) throw error;
}

export async function getApiAccessGrants(apiId?: string, granteeId?: string) {
  let query = supabase.from("api_access_grants" as any).select("*").eq("is_active", true);
  if (apiId) query = query.eq("api_id", apiId);
  if (granteeId) query = query.eq("grantee_id", granteeId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// API AUDIT
// =====================================================

export async function logApiCall(entry: {
  api_id: string; caller_type: string; caller_id: string;
  endpoint: string; method: string; status_code: number;
  request_metadata?: Record<string, unknown>; response_summary?: Record<string, unknown>;
  ip_address?: string; jurisdiction?: string;
}): Promise<void> {
  const { error } = await supabase.from("api_audit_logs" as any).insert(entry);
  if (error) throw error;
}

export async function getApiAuditLogs(apiId?: string, callerId?: string, limit = 100) {
  let query = supabase.from("api_audit_logs" as any).select("*");
  if (apiId) query = query.eq("api_id", apiId);
  if (callerId) query = query.eq("caller_id", callerId);
  const { data, error } = await query.order("called_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// EXTERNAL INTEGRATIONS
// =====================================================

export async function saveIntegrationConfig(input: IntegrationConfigInput): Promise<string> {
  const { data, error } = await supabase.from("external_integration_configs" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getIntegrationConfigs(type?: string, institutionId?: string) {
  let query = supabase.from("external_integration_configs" as any).select("*");
  if (type) query = query.eq("integration_type", type);
  if (institutionId) query = query.eq("institution_id", institutionId);
  const { data, error } = await query.order("integration_name");
  if (error) throw error;
  return data ?? [];
}

export async function updateIntegrationSync(configId: string, status: string, errorLog?: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from("external_integration_configs" as any).update({
    sync_status: status, last_sync_at: new Date().toISOString(), error_log: errorLog ?? {},
  }).eq("id", configId);
  if (error) throw error;
}

// =====================================================
// WEBHOOKS
// =====================================================

export async function subscribeWebhook(input: WebhookSubscriptionInput): Promise<string> {
  const { data, error } = await supabase.from("webhook_subscriptions" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getWebhookSubscriptions(subscriberId?: string) {
  let query = supabase.from("webhook_subscriptions" as any).select("*").eq("is_active", true);
  if (subscriberId) query = query.eq("subscriber_id", subscriberId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// EVENT BUS
// =====================================================

export async function emitEvent(event: EventEmission): Promise<string> {
  const { data, error } = await supabase.from("event_bus_log" as any).insert(event).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getEvents(eventType?: string, entityType?: string, limit = 100) {
  let query = supabase.from("event_bus_log" as any).select("*");
  if (eventType) query = query.eq("event_type", eventType);
  if (entityType) query = query.eq("entity_type", entityType);
  const { data, error } = await query.order("emitted_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// DATA EXPORT
// =====================================================

export async function logDataExport(input: DataExportInput): Promise<void> {
  const { error } = await supabase.from("data_export_logs" as any).insert(input);
  if (error) throw error;
}

export async function getDataExportLogs(exporterId?: string, format?: string) {
  let query = supabase.from("data_export_logs" as any).select("*");
  if (exporterId) query = query.eq("exporter_id", exporterId);
  if (format) query = query.eq("export_format", format);
  const { data, error } = await query.order("exported_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// CROSS-BORDER DATA COMPLIANCE
// =====================================================

export async function requestCrossBorderTransfer(input: CrossBorderTransferInput): Promise<string> {
  const { data, error } = await supabase.from("cross_border_data_transfers" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function approveCrossBorderTransfer(transferId: string, approvedBy: string): Promise<void> {
  const { error } = await supabase.from("cross_border_data_transfers" as any).update({
    approval_status: "approved", approved_by: approvedBy, approved_at: new Date().toISOString(),
  }).eq("id", transferId);
  if (error) throw error;
}

export async function getCrossBorderTransfers(status?: string, jurisdiction?: string) {
  let query = supabase.from("cross_border_data_transfers" as any).select("*");
  if (status) query = query.eq("approval_status", status);
  if (jurisdiction) query = query.or(`source_jurisdiction.eq.${jurisdiction},destination_jurisdiction.eq.${jurisdiction}`);
  const { data, error } = await query.order("requested_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// EXTENSION MARKETPLACE
// =====================================================

export async function registerExtension(input: ExtensionInput): Promise<string> {
  const { data, error } = await supabase.from("extension_marketplace" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getExtensions(type?: string, verifiedOnly = true) {
  let query = supabase.from("extension_marketplace" as any).select("*").eq("is_active", true);
  if (verifiedOnly) query = query.eq("is_verified", true);
  if (type) query = query.eq("extension_type", type);
  const { data, error } = await query.order("install_count", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateExtensionReview(extensionId: string, updates: {
  security_review_status?: string; integrity_audit_status?: string;
  is_verified?: boolean; is_active?: boolean;
}): Promise<void> {
  const { error } = await supabase.from("extension_marketplace" as any).update(updates).eq("id", extensionId);
  if (error) throw error;
}

// =====================================================
// DATA STANDARDIZATION
// =====================================================

export async function saveStandardizationMapping(input: StandardizationMappingInput): Promise<void> {
  const { error } = await supabase.from("data_standardization_mappings" as any).insert(input);
  if (error) throw error;
}

export async function getStandardizationMappings(schemaType?: string, sourceSystem?: string) {
  let query = supabase.from("data_standardization_mappings" as any).select("*").eq("is_active", true);
  if (schemaType) query = query.eq("schema_type", schemaType);
  if (sourceSystem) query = query.eq("source_system", sourceSystem);
  const { data, error } = await query.order("schema_type");
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// IDENTITY FEDERATION
// =====================================================

export async function linkIdentity(input: IdentityFederationInput): Promise<void> {
  const { error } = await supabase.from("identity_federation_links" as any).insert(input);
  if (error) throw error;
}

export async function getLinkedIdentities(userId: string) {
  const { data, error } = await supabase.from("identity_federation_links" as any).select("*").eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function verifyIdentityLink(linkId: string): Promise<void> {
  const { error } = await supabase.from("identity_federation_links" as any).update({
    verified: true, verified_at: new Date().toISOString(),
  }).eq("id", linkId);
  if (error) throw error;
}

// =====================================================
// ESCROW INVARIANT PROTECTION (API LAYER)
// =====================================================

export function validateApiEscrowInvariant(operation: string): { allowed: boolean; reason: string } {
  const blockedOps = ["escrow_modify", "escrow_override", "ledger_write", "balance_adjust", "fund_transfer"];
  if (blockedOps.includes(operation)) {
    return { allowed: false, reason: `Operation '${operation}' is blocked at API layer. Escrow invariants cannot be bypassed via external API.` };
  }
  return { allowed: true, reason: "Operation permitted" };
}
