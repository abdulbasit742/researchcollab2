/**
 * Professional Asset & Execution Market Engine (PAEME)
 * Escrow-protected, trust-weighted, compliance-aware marketplace.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const MARKETPLACE_CATEGORIES = [
  "professional_services", "micro_execution_tasks", "grant_support_modules",
  "tool_licenses", "dataset_access", "research_prototypes", "patent_licensing",
  "startup_collaboration", "industry_consulting", "compliance_advisory",
  "code_modules", "hardware_components", "innovation_blueprints",
  "institutional_partnerships", "cross_border_services",
] as const;
export type MarketplaceCategory = typeof MARKETPLACE_CATEGORIES[number];

export const FRAUD_FLAG_TYPES_PAEME = [
  "fake_deliverable", "duplicate_listing", "ip_infringement",
  "escrow_bypass", "unrealistic_milestones", "collusion_rating",
  "compliance_evasion",
] as const;

export const VERIFICATION_TYPES = [
  "ownership_proof", "institutional_endorsement", "ip_registration",
  "dataset_validation", "prototype_demo", "industry_deployment",
  "patent_linkage", "compliance_clearance",
] as const;

export const PAEME_PHILOSOPHY = {
  facebookSells: "Goods",
  rcollabCirculates: "Skills, IP, innovation, and execution",
  facebookOptimizes: "Peer-to-peer selling",
  rcollabOptimizes: "Capability exchange",
} as const;

// =====================================================
// TYPES
// =====================================================

export interface ListingInput {
  seller_id: string;
  category: string;
  domain?: string;
  title: string;
  description?: string;
  deliverables?: string[];
  timeline_days?: number;
  funding_linkage?: string;
  ip_ownership_terms?: string;
  compliance_requirements?: string[];
  escrow_milestone_breakdown?: Record<string, unknown>[];
  pricing_amount?: number;
  pricing_currency?: string;
  privacy_level?: string;
}

export interface ListingCredibilityInput {
  listing_id: string;
  seller_trust_index: number;
  execution_reliability: number;
  dispute_history_score: number;
  funding_compliance: number;
  institutional_verification: number;
  repeat_buyer_rate: number;
  long_term_stability: number;
  domain_authority: number;
}

export interface TransactionInput {
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency?: string;
  escrow_id?: string;
  milestones?: Record<string, unknown>[];
}

export interface AssetVerificationInput {
  listing_id: string;
  verification_type: string;
  proof_data?: Record<string, unknown>;
  institutional_endorsement?: string;
  ip_registration_ref?: string;
}

export interface CrossBorderCheckInput {
  transaction_id?: string;
  listing_id?: string;
  jurisdiction_compatibility: number;
  export_control_clear: boolean;
  ip_ownership_compatible: boolean;
  currency_compliance: boolean;
  data_transfer_compliant: boolean;
  funding_restriction_clear: boolean;
  flags?: string[];
}

export interface FraudFlagInput {
  listing_id?: string;
  transaction_id?: string;
  flagged_user_id?: string;
  flag_type: string;
  severity?: string;
  description?: string;
  evidence?: Record<string, unknown>;
}

export interface ProcurementInput {
  institution_id: string;
  title: string;
  description?: string;
  rfp_requirements?: Record<string, unknown>;
  compliance_checks?: string[];
  escrow_terms?: Record<string, unknown>;
  domain_authority_threshold?: number;
  trust_density_filter?: number;
  category?: string;
  domain?: string;
  closes_at?: string;
}

export interface AssetPerformanceInput {
  listing_id: string;
  deliverable_reuse_count?: number;
  tool_adoption_rate?: number;
  dataset_citation_rate?: number;
  patent_commercialization_success?: number;
  service_repeat_rate?: number;
  long_term_satisfaction?: number;
  revenue_compounding?: number;
}

export interface ListingSearchFilters {
  category?: string;
  domain?: string;
  min_credibility?: number;
  max_price?: number;
  seller_id?: string;
  status?: string;
  privacy_level?: string;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

export function computeListingCredibility(input: Omit<ListingCredibilityInput, "listing_id">): number {
  return Math.round(
    input.seller_trust_index * 0.20 +
    input.execution_reliability * 0.20 +
    input.dispute_history_score * 0.10 +
    input.funding_compliance * 0.10 +
    input.institutional_verification * 0.10 +
    input.repeat_buyer_rate * 0.10 +
    input.long_term_stability * 0.10 +
    input.domain_authority * 0.10
  );
}

export function computeCrossBorderViabilityPAEME(input: Omit<CrossBorderCheckInput, "transaction_id" | "listing_id" | "flags">): number {
  let score = input.jurisdiction_compatibility * 0.25;
  if (input.export_control_clear) score += 15;
  if (input.ip_ownership_compatible) score += 15;
  if (input.currency_compliance) score += 15;
  if (input.data_transfer_compliant) score += 15;
  if (input.funding_restriction_clear) score += 15;
  return Math.round(score);
}

// =====================================================
// DATA ACCESS
// =====================================================

// --- Listings (Section 1) ---
export async function createListing(input: ListingInput): Promise<string> {
  const { data, error } = await supabase.from("marketplace_listings_paeme" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getListings(filters?: ListingSearchFilters) {
  let query = supabase.from("marketplace_listings_paeme" as any).select("*");
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.domain) query = query.eq("domain", filters.domain);
  if (filters?.seller_id) query = query.eq("seller_id", filters.seller_id);
  if (filters?.status) query = query.eq("status", filters.status);
  else query = query.eq("status", "active");
  if (filters?.privacy_level) query = query.eq("privacy_level", filters.privacy_level);
  if (filters?.max_price) query = query.lte("pricing_amount", filters.max_price);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function getListing(id: string) {
  const { data, error } = await supabase.from("marketplace_listings_paeme" as any).select("*")
    .eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateListing(id: string, updates: Partial<ListingInput>): Promise<void> {
  const { error } = await supabase.from("marketplace_listings_paeme" as any)
    .update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// --- Credibility (Section 2) ---
export async function saveListingCredibility(input: ListingCredibilityInput): Promise<void> {
  const composite = computeListingCredibility(input);
  const { error } = await supabase.from("listing_credibility" as any)
    .upsert({ ...input, composite_credibility: composite, computed_at: new Date().toISOString() }, { onConflict: "listing_id" });
  if (error) throw error;
}

export async function getListingCredibility(listingId: string) {
  const { data, error } = await supabase.from("listing_credibility" as any).select("*")
    .eq("listing_id", listingId).maybeSingle();
  if (error) throw error;
  return data;
}

// --- Transactions (Section 3) ---
export async function createTransaction(input: TransactionInput): Promise<string> {
  const { data, error } = await supabase.from("marketplace_transactions" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getTransactions(listingId?: string, buyerId?: string) {
  let query = supabase.from("marketplace_transactions" as any).select("*");
  if (listingId) query = query.eq("listing_id", listingId);
  if (buyerId) query = query.eq("buyer_id", buyerId);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function updateTransactionStatus(id: string, status: string): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (status === "completed") updates.completed_at = new Date().toISOString();
  const { error } = await supabase.from("marketplace_transactions" as any).update(updates).eq("id", id);
  if (error) throw error;
}

// --- Asset Verification (Section 4) ---
export async function requestVerification(input: AssetVerificationInput): Promise<string> {
  const { data, error } = await supabase.from("asset_verifications" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getVerifications(listingId: string) {
  const { data, error } = await supabase.from("asset_verifications" as any).select("*")
    .eq("listing_id", listingId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function approveVerification(id: string, verifierId: string): Promise<void> {
  const { error } = await supabase.from("asset_verifications" as any)
    .update({ status: "verified", verified_by: verifierId, verified_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// --- Cross-Border (Section 5) ---
export async function saveCrossBorderCheck(input: CrossBorderCheckInput): Promise<void> {
  const viability = computeCrossBorderViabilityPAEME(input);
  const { error } = await supabase.from("marketplace_cross_border" as any)
    .insert({ ...input, overall_viability: viability });
  if (error) throw error;
}

export async function getCrossBorderChecks(listingId?: string, transactionId?: string) {
  let query = supabase.from("marketplace_cross_border" as any).select("*");
  if (listingId) query = query.eq("listing_id", listingId);
  if (transactionId) query = query.eq("transaction_id", transactionId);
  const { data, error } = await query.order("checked_at", { ascending: false }).limit(10);
  if (error) throw error;
  return data ?? [];
}

// --- Fraud Flags (Section 8) ---
export async function flagMarketplaceFraud(input: FraudFlagInput): Promise<string> {
  const { data, error } = await supabase.from("marketplace_fraud_flags" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getMarketplaceFraudFlags(listingId?: string) {
  let query = supabase.from("marketplace_fraud_flags" as any).select("*");
  if (listingId) query = query.eq("listing_id", listingId);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function resolveMarketplaceFraud(id: string, reviewerId: string): Promise<void> {
  const { error } = await supabase.from("marketplace_fraud_flags" as any)
    .update({ status: "resolved", reviewed_by: reviewerId, reviewed_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// --- Liquidity Metrics (Section 9) ---
export async function saveLiquidityMetrics(input: { category: string; domain?: string; demand_trend: number; conversion_rate: number; skill_saturation: number; buyer_geo_distribution?: Record<string, unknown>; funding_linked_demand: number; domain_growth_signal: number; pricing_competitiveness: number }): Promise<void> {
  const { error } = await supabase.from("market_liquidity_metrics" as any).insert(input);
  if (error) throw error;
}

export async function getLiquidityMetrics(category?: string) {
  let query = supabase.from("market_liquidity_metrics" as any).select("*");
  if (category) query = query.eq("category", category);
  const { data, error } = await query.order("computed_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

// --- Institutional Procurement (Section 11) ---
export async function createProcurement(input: ProcurementInput): Promise<string> {
  const { data, error } = await supabase.from("institutional_procurements" as any)
    .insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getProcurements(institutionId?: string) {
  let query = supabase.from("institutional_procurements" as any).select("*");
  if (institutionId) query = query.eq("institution_id", institutionId);
  const { data, error } = await query.eq("status", "open").order("created_at", { ascending: false }).limit(30);
  if (error) throw error;
  return data ?? [];
}

// --- Asset Performance (Section 14) ---
export async function saveAssetPerformance(input: AssetPerformanceInput): Promise<void> {
  const { error } = await supabase.from("asset_performance_tracking" as any)
    .upsert({ ...input, computed_at: new Date().toISOString() }, { onConflict: "listing_id" });
  if (error) throw error;
}

export async function getAssetPerformance(listingId: string) {
  const { data, error } = await supabase.from("asset_performance_tracking" as any).select("*")
    .eq("listing_id", listingId).maybeSingle();
  if (error) throw error;
  return data;
}
