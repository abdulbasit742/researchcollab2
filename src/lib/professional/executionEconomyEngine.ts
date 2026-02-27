/**
 * Execution Economy Creator System
 * Replaces influencer culture with skill-based earning infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const EARNING_CHANNEL_TYPES = [
  "project_execution", "grant_participation", "milestone_completion",
  "consulting", "peer_review", "research_collaboration", "startup_creation",
  "industry_advisory", "skill_mentorship", "tool_creation", "data_contribution",
  "reproducibility_validation",
] as const;
export type EarningChannelType = typeof EARNING_CHANNEL_TYPES[number];

export const MARKETPLACE_LISTING_TYPES = [
  "funded_collaboration", "micro_milestone_gig", "institutional_contract",
  "research_assistant", "technical_consulting", "industry_pilot",
  "code_validation", "data_cleaning", "literature_review", "grant_drafting",
  "prototype_review", "short_sprint",
] as const;
export type MarketplaceListingType = typeof MARKETPLACE_LISTING_TYPES[number];

export const SUBSCRIPTION_TYPES = [
  "skill_mentorship", "domain_learning", "research_walkthrough",
  "technical_workshop", "grant_strategy", "execution_breakdown",
] as const;
export type SubscriptionType = typeof SUBSCRIPTION_TYPES[number];

export const EXECUTION_ECONOMY_PHILOSOPHY = {
  category: "Capability monetization, not attention monetization",
  rewards: "Deliverability over visibility",
  pays: "Professionals, not influencers",
  antiRules: [
    "No monetization based solely on followers",
    "No pay-for-visibility system",
    "No engagement-driven payouts",
    "No algorithmic favoritism",
    "All earnings tie to real execution",
  ],
  influenceRedefined: [
    "Execution impact", "Team reliability", "Skill trust",
    "Industry respect", "Innovation contribution",
    "Knowledge dissemination", "Funding success",
  ],
} as const;

// =====================================================
// TYPES
// =====================================================

export interface EarningChannelInput {
  user_id: string;
  channel_type: string;
  channel_name: string;
  description?: string;
  skill_tags?: string[];
  trust_requirement?: number;
}

export interface MarketplaceListingInput {
  creator_id: string;
  listing_type: string;
  title: string;
  description?: string;
  deliverables?: Record<string, unknown>[];
  budget?: number;
  currency?: string;
  timeline_days?: number;
  skill_requirements?: string[];
  trust_requirement?: number;
  institution_id?: string;
}

export interface MarketplaceApplicationInput {
  listing_id: string;
  applicant_id: string;
  cover_note?: string;
  proposed_budget?: number;
  proposed_timeline_days?: number;
  skill_evidence?: Record<string, unknown>;
}

export interface RevenueShareInput {
  project_id?: string;
  user_id: string;
  share_percentage: number;
  earned_amount?: number;
  consistency_bonus?: number;
  innovation_bonus?: number;
  period?: string;
}

export interface RevenueSplitInput {
  project_id: string;
  milestone_id?: string;
  user_id: string;
  contribution_weight: number;
  split_amount?: number;
}

export interface IncomeStabilityInput {
  user_id: string;
  total_earnings: number;
  funding_source_diversity: number;
  income_volatility_index: number;
  growth_trend: number;
  risk_exposure: number;
  sponsor_retention_rate: number;
  skill_monetization_distribution?: Record<string, number>;
}

export interface SkillLiquidityInput {
  skill_name: string;
  region_code?: string;
  demand_score?: number;
  supply_score?: number;
  funding_hotspot?: boolean;
  emerging_demand?: boolean;
  cross_border_potential?: number;
  avg_earning_rate?: number;
}

export interface ProfessionalSubscriptionInput {
  creator_id: string;
  subscriber_id: string;
  subscription_type: string;
  price: number;
  currency?: string;
  expires_at?: string;
}

// =====================================================
// DISCOVERY RANKING (Section 4)
// =====================================================

const DISCOVERY_WEIGHTS = {
  execution_completion: 0.18,
  repeat_sponsor_rate: 0.14,
  on_time_milestone: 0.14,
  budget_adherence: 0.10,
  deliverable_quality: 0.14,
  industry_validation: 0.10,
  skill_depth: 0.10,
  innovation_contribution: 0.10,
};

export interface ExecutionDiscoveryScore {
  execution_completion: number;
  repeat_sponsor_rate: number;
  on_time_milestone: number;
  budget_adherence: number;
  deliverable_quality: number;
  industry_validation: number;
  skill_depth: number;
  innovation_contribution: number;
}

export function computeDiscoveryRank(input: ExecutionDiscoveryScore): number {
  return Math.round(
    input.execution_completion * DISCOVERY_WEIGHTS.execution_completion +
    input.repeat_sponsor_rate * DISCOVERY_WEIGHTS.repeat_sponsor_rate +
    input.on_time_milestone * DISCOVERY_WEIGHTS.on_time_milestone +
    input.budget_adherence * DISCOVERY_WEIGHTS.budget_adherence +
    input.deliverable_quality * DISCOVERY_WEIGHTS.deliverable_quality +
    input.industry_validation * DISCOVERY_WEIGHTS.industry_validation +
    input.skill_depth * DISCOVERY_WEIGHTS.skill_depth +
    input.innovation_contribution * DISCOVERY_WEIGHTS.innovation_contribution
  );
}

// =====================================================
// EARNING CHANNELS (Section 1)
// =====================================================

export async function createEarningChannel(input: EarningChannelInput): Promise<string> {
  const { data, error } = await supabase.from("earning_channels" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getUserEarningChannels(userId: string) {
  const { data, error } = await supabase.from("earning_channels" as any).select("*")
    .eq("user_id", userId).eq("is_active", true).order("total_earned", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// MARKETPLACE (Sections 2, 12)
// =====================================================

export async function createMarketplaceListing(input: MarketplaceListingInput): Promise<string> {
  const { data, error } = await supabase.from("execution_marketplace_listings" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function browseMarketplaceListings(filters?: { listing_type?: string; status?: string; min_budget?: number }) {
  let query = supabase.from("execution_marketplace_listings" as any).select("*").eq("status", filters?.status ?? "open");
  if (filters?.listing_type) query = query.eq("listing_type", filters.listing_type);
  if (filters?.min_budget) query = query.gte("budget", filters.min_budget);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function applyToMarketplaceListing(input: MarketplaceApplicationInput): Promise<string> {
  const { data, error } = await supabase.from("marketplace_applications" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getListingApplications(listingId: string) {
  const { data, error } = await supabase.from("marketplace_applications" as any).select("*")
    .eq("listing_id", listingId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// REVENUE SHARE (Section 6)
// =====================================================

export async function saveRevenueShare(input: RevenueShareInput): Promise<void> {
  const { error } = await supabase.from("execution_revenue_shares" as any).insert(input);
  if (error) throw error;
}

export async function getUserRevenueShares(userId: string) {
  const { data, error } = await supabase.from("execution_revenue_shares" as any).select("*")
    .eq("user_id", userId).order("computed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// COLLABORATION SPLITS (Section 7)
// =====================================================

export async function saveRevenueSplit(input: RevenueSplitInput): Promise<void> {
  const { error } = await supabase.from("collaboration_revenue_splits" as any).insert(input);
  if (error) throw error;
}

export async function getProjectRevenueSplits(projectId: string) {
  const { data, error } = await supabase.from("collaboration_revenue_splits" as any).select("*")
    .eq("project_id", projectId).order("contribution_weight", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// INCOME STABILITY (Section 9)
// =====================================================

export async function saveIncomeStability(input: IncomeStabilityInput): Promise<void> {
  const { error } = await supabase.from("income_stability_metrics" as any).insert(input);
  if (error) throw error;
}

export async function getIncomeStability(userId: string) {
  const { data, error } = await supabase.from("income_stability_metrics" as any).select("*")
    .eq("user_id", userId).order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// SKILL LIQUIDITY MAP (Section 13)
// =====================================================

export async function addSkillLiquidity(input: SkillLiquidityInput): Promise<string> {
  const { data, error } = await supabase.from("skill_liquidity_map" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getSkillLiquidityMap(regionCode?: string) {
  let query = supabase.from("skill_liquidity_map" as any).select("*");
  if (regionCode) query = query.eq("region_code", regionCode);
  const { data, error } = await query.order("demand_score", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// PROFESSIONAL SUBSCRIPTIONS (Section 5)
// =====================================================

export async function createProfessionalSubscription(input: ProfessionalSubscriptionInput): Promise<string> {
  const { data, error } = await supabase.from("professional_subscriptions" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getCreatorSubscribers(creatorId: string) {
  const { data, error } = await supabase.from("professional_subscriptions" as any).select("*")
    .eq("creator_id", creatorId).eq("is_active", true);
  if (error) throw error;
  return data ?? [];
}

export async function getUserSubscriptions(subscriberId: string) {
  const { data, error } = await supabase.from("professional_subscriptions" as any).select("*")
    .eq("subscriber_id", subscriberId).eq("is_active", true);
  if (error) throw error;
  return data ?? [];
}
