/**
 * Value-Optimized Social Intelligence Engine
 * Replaces engagement-driven ranking with value-driven intelligence.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const ALGORITHM_MODES = [
  "skill_discovery", "collaboration", "funding_opportunity", "innovation",
  "institutional_insights", "learning", "emerging_talent", "stability",
  "industry_deployment", "cross_domain",
] as const;
export type AlgorithmMode = typeof ALGORITHM_MODES[number];

export const MANIPULATION_FLAG_TYPES = [
  "engagement_pod", "coordinated_amplification", "fake_comment_loop",
  "bot_interaction", "artificial_controversy", "clickbait", "emotional_manipulation",
] as const;
export type ManipulationFlagType = typeof MANIPULATION_FLAG_TYPES[number];

export const SOCIAL_INTELLIGENCE_PHILOSOPHY = {
  optimizes: "Professional growth, not addiction",
  maximizes: "Value gained, not time spent",
  rewards: "Execution, innovation, and capability",
  rules: [
    "Do NOT optimize for time spent",
    "Do NOT optimize for engagement rate alone",
    "Do NOT reward controversy",
    "Do NOT amplify emotional spikes",
    "Do NOT prioritize viral growth",
    "Every ranking must be explainable",
    "Users must see why content appears",
  ],
} as const;

// =====================================================
// TYPES
// =====================================================

export interface ValueRankingInput {
  post_id: string;
  execution_depth: number;
  skill_demonstration: number;
  funding_relevance: number;
  collaboration_opportunity: number;
  innovation_impact: number;
  domain_relevance: number;
  long_term_usefulness: number;
  institutional_credibility: number;
  integrity_confidence: number;
  learning_value: number;
  engagement_score?: number;
}

export interface FeedExplainabilityInput {
  user_id: string;
  post_id: string;
  skill_alignment_pct: number;
  domain_match_pct: number;
  collaboration_potential_pct: number;
  funding_overlap_pct: number;
  innovation_relevance_pct: number;
  long_term_utility: number;
  explanation_summary?: string;
}

export interface ValueFeedbackInput {
  user_id: string;
  post_id: string;
  usefulness_rating?: number;
  skill_depth_rating?: number;
  practical_relevance?: number;
  collaboration_potential?: number;
  learning_impact?: number;
}

export interface ViralityCapInput {
  post_id: string;
  engagement_velocity: number;
  dampening_factor?: number;
  exposure_fairness_adj?: number;
  early_creator_boost?: boolean;
  saturation_limited?: boolean;
  diversity_boost?: number;
}

export interface LongTermValueInput {
  post_id: string;
  day_30_retention: number;
  day_90_revisit_freq: number;
  skill_reuse_rate: number;
  collaboration_conversion: number;
  grant_reference_usage: number;
  replication_influence: number;
}

export interface CollabProbabilityInput {
  post_id: string;
  collab_formation_prob: number;
  funding_application_prob: number;
  skill_development_prob: number;
  innovation_extension_prob: number;
  project_iteration_prob: number;
  industry_partnership_prob: number;
}

export interface ManipulationFlagInput {
  target_id: string;
  target_type?: string;
  flag_type: string;
  severity?: string;
  evidence?: Record<string, unknown>;
  dampening_applied?: number;
}

export interface AlgorithmModeInput {
  user_id: string;
  active_mode: string;
  custom_weights?: Record<string, number>;
  entertainment_cap?: number;
  min_depth_threshold?: number;
}

// =====================================================
// VALUE RANKING (Section 1)
// =====================================================

const VALUE_WEIGHTS = {
  execution_depth: 0.14, skill_demonstration: 0.12, funding_relevance: 0.10,
  collaboration_opportunity: 0.10, innovation_impact: 0.12, domain_relevance: 0.08,
  long_term_usefulness: 0.10, institutional_credibility: 0.08,
  integrity_confidence: 0.08, learning_value: 0.08,
};
const ENGAGEMENT_CAP = 0.15; // engagement capped at 15% influence

export function computeCompositeValue(input: Omit<ValueRankingInput, "post_id">): number {
  const baseValue =
    input.execution_depth * VALUE_WEIGHTS.execution_depth +
    input.skill_demonstration * VALUE_WEIGHTS.skill_demonstration +
    input.funding_relevance * VALUE_WEIGHTS.funding_relevance +
    input.collaboration_opportunity * VALUE_WEIGHTS.collaboration_opportunity +
    input.innovation_impact * VALUE_WEIGHTS.innovation_impact +
    input.domain_relevance * VALUE_WEIGHTS.domain_relevance +
    input.long_term_usefulness * VALUE_WEIGHTS.long_term_usefulness +
    input.institutional_credibility * VALUE_WEIGHTS.institutional_credibility +
    input.integrity_confidence * VALUE_WEIGHTS.integrity_confidence +
    input.learning_value * VALUE_WEIGHTS.learning_value;
  const engagementContribution = Math.min((input.engagement_score ?? 0) * ENGAGEMENT_CAP, ENGAGEMENT_CAP * 100);
  return Math.round(baseValue + engagementContribution);
}

export async function saveValueRanking(input: ValueRankingInput): Promise<void> {
  const composite = computeCompositeValue(input);
  const { error } = await supabase.from("feed_value_rankings" as any).insert({ ...input, composite_value: composite });
  if (error) throw error;
}

export async function getValueRanking(postId: string) {
  const { data, error } = await supabase.from("feed_value_rankings" as any).select("*")
    .eq("post_id", postId).order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// LONG-TERM VALUE (Section 6)
// =====================================================

const LTV_WEIGHTS = {
  day_30_retention: 0.20, day_90_revisit_freq: 0.20, skill_reuse_rate: 0.15,
  collaboration_conversion: 0.15, grant_reference_usage: 0.15, replication_influence: 0.15,
};

export function computeLTV(input: Omit<LongTermValueInput, "post_id">): number {
  return Math.round(
    input.day_30_retention * LTV_WEIGHTS.day_30_retention +
    input.day_90_revisit_freq * LTV_WEIGHTS.day_90_revisit_freq +
    input.skill_reuse_rate * LTV_WEIGHTS.skill_reuse_rate +
    input.collaboration_conversion * LTV_WEIGHTS.collaboration_conversion +
    input.grant_reference_usage * LTV_WEIGHTS.grant_reference_usage +
    input.replication_influence * LTV_WEIGHTS.replication_influence
  );
}

export async function saveLongTermValue(input: LongTermValueInput): Promise<void> {
  const composite = computeLTV(input);
  const { error } = await supabase.from("long_term_value_tracking" as any).insert({ ...input, composite_ltv: composite });
  if (error) throw error;
}

export async function getLongTermValue(postId: string) {
  const { data, error } = await supabase.from("long_term_value_tracking" as any).select("*")
    .eq("post_id", postId).order("measured_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// COLLABORATION PROBABILITY (Section 7)
// =====================================================

export function computeCollabProbability(input: Omit<CollabProbabilityInput, "post_id">): number {
  return Math.round(
    (input.collab_formation_prob + input.funding_application_prob +
    input.skill_development_prob + input.innovation_extension_prob +
    input.project_iteration_prob + input.industry_partnership_prob) / 6
  );
}

export async function saveCollabProbability(input: CollabProbabilityInput): Promise<void> {
  const composite = computeCollabProbability(input);
  const { error } = await supabase.from("collaboration_probability_scores" as any).insert({ ...input, composite_outcome_prob: composite });
  if (error) throw error;
}

// =====================================================
// ALGORITHM MODE (Section 2, 14)
// =====================================================

export async function setAlgorithmMode(input: AlgorithmModeInput): Promise<void> {
  const { data: existing } = await supabase.from("user_algorithm_modes" as any).select("id")
    .eq("user_id", input.user_id).maybeSingle();
  if (existing) {
    const { error } = await supabase.from("user_algorithm_modes" as any).update({
      active_mode: input.active_mode, custom_weights: input.custom_weights ?? {},
      entertainment_cap: input.entertainment_cap ?? 0.1,
      min_depth_threshold: input.min_depth_threshold ?? 0,
      updated_at: new Date().toISOString(),
    }).eq("user_id", input.user_id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("user_algorithm_modes" as any).insert(input);
    if (error) throw error;
  }
}

export async function getAlgorithmMode(userId: string) {
  const { data, error } = await supabase.from("user_algorithm_modes" as any).select("*")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// FEED EXPLAINABILITY (Section 3)
// =====================================================

export async function saveFeedExplainability(input: FeedExplainabilityInput): Promise<void> {
  const { error } = await supabase.from("feed_explainability" as any).insert(input);
  if (error) throw error;
}

export async function getFeedExplainability(userId: string, postId: string) {
  const { data, error } = await supabase.from("feed_explainability" as any).select("*")
    .eq("user_id", userId).eq("post_id", postId).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// VALUE FEEDBACK (Section 12)
// =====================================================

export async function submitValueFeedback(input: ValueFeedbackInput): Promise<void> {
  const { error } = await supabase.from("content_value_feedback" as any).upsert(input, { onConflict: "user_id,post_id" });
  if (error) throw error;
}

export async function getPostValueFeedback(postId: string) {
  const { data, error } = await supabase.from("content_value_feedback" as any).select("*").eq("post_id", postId);
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// VIRALITY CAP (Section 4)
// =====================================================

export async function applyViralityCap(input: ViralityCapInput): Promise<void> {
  const { error } = await supabase.from("virality_cap_records" as any).insert(input);
  if (error) throw error;
}

// =====================================================
// MANIPULATION FLAGS (Section 8)
// =====================================================

export async function flagManipulation(input: ManipulationFlagInput): Promise<string> {
  const { data, error } = await supabase.from("algorithm_manipulation_flags" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getManipulationFlags(targetId: string) {
  const { data, error } = await supabase.from("algorithm_manipulation_flags" as any).select("*")
    .eq("target_id", targetId).eq("resolved", false);
  if (error) throw error;
  return data ?? [];
}
