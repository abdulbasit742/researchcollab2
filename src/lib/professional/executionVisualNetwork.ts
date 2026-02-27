/**
 * Execution-First Visual Network Engine — Extensions
 * Collaboration requests, domain discovery, learning modules, AI relevance, innovation map.
 * Extends the existing visualIntelligence.ts engine.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const COLLABORATION_REQUEST_TYPES = [
  "join_project", "offer_funding", "propose_iteration", "join_milestone",
  "suggest_extension", "invite_to_grant", "invite_to_startup",
] as const;
export type CollaborationRequestType = typeof COLLABORATION_REQUEST_TYPES[number];

export const DISCOVERY_CATEGORY_TYPES = [
  "industry", "research_domain", "innovation_cluster", "skill_category",
  "execution_stage", "funding_tier", "institutional_network",
  "collaboration_request_type", "learning_topic",
] as const;
export type DiscoveryCategoryType = typeof DISCOVERY_CATEGORY_TYPES[number];

export const LEARNING_MODULE_TYPES = [
  "micro_learning", "execution_case_study", "grant_strategy_lesson",
  "industry_integration_walkthrough", "skill_building_pathway",
] as const;
export type LearningModuleType = typeof LEARNING_MODULE_TYPES[number];

export const INNOVATION_MAP_POINT_TYPES = [
  "innovation_hotspot", "collaboration_cluster", "industry_deployment",
  "startup_ecosystem", "institutional_network",
] as const;

export const EXECUTION_NETWORK_PHILOSOPHY = {
  category: "Execution network, not attention network",
  rewards: "Capability + reliability + impact",
  optimizes: "Value created, not time spent",
  antiPatterns: [
    "No addictive infinite scroll",
    "No vanity follower obsession",
    "No algorithm manipulation for dopamine",
    "No empty aesthetic posting",
    "No viral trend chasing",
    "Every visual must connect to value",
  ],
  sessionDesign: [
    "Avoid infinite scroll",
    "Encourage session limits",
    "Avoid manipulative notifications",
    "Remove vanity counters prominence",
    "Encourage scheduled browsing",
    "Promote project completion",
    "Reduce comparison anxiety",
    "Highlight progress, not popularity",
  ],
} as const;

// =====================================================
// TYPES
// =====================================================

export interface CollaborationRequestInput {
  requester_id: string;
  target_user_id?: string;
  target_institution_id?: string;
  portfolio_item_id?: string;
  request_type: string;
  title: string;
  description?: string;
  funding_offer?: number;
  skill_requirements?: string[];
}

export interface LearningModuleInput {
  author_id: string;
  title: string;
  module_type: string;
  description?: string;
  source_portfolio_id?: string;
  source_project_id?: string;
  content_blocks?: Record<string, unknown>[];
  skill_tags?: string[];
  difficulty_level?: string;
  estimated_minutes?: number;
}

export interface InnovationMapPointInput {
  point_type: string;
  label: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  institution_id?: string;
  intensity?: number;
  active_projects?: number;
  total_funding?: number;
  collaboration_density?: number;
  metadata?: Record<string, unknown>;
}

// =====================================================
// COLLABORATION REQUESTS (Section 7)
// =====================================================

export async function createCollaborationRequest(input: CollaborationRequestInput): Promise<string> {
  const { data, error } = await supabase.from("visual_collaboration_requests" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getCollaborationRequests(userId?: string, status?: string) {
  let query = supabase.from("visual_collaboration_requests" as any).select("*");
  if (userId) query = query.or(`requester_id.eq.${userId},target_user_id.eq.${userId}`);
  if (status) query = query.eq("status", status);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function respondToCollaborationRequest(requestId: string, status: "accepted" | "declined"): Promise<void> {
  const { error } = await supabase.from("visual_collaboration_requests" as any).update({
    status, responded_at: new Date().toISOString(),
  }).eq("id", requestId);
  if (error) throw error;
}

// =====================================================
// DOMAIN DISCOVERY (Section 5)
// =====================================================

export async function getDiscoveryCategories(categoryType?: string) {
  let query = supabase.from("visual_discovery_categories" as any).select("*").eq("is_active", true);
  if (categoryType) query = query.eq("category_type", categoryType);
  const { data, error } = await query.order("display_order");
  if (error) throw error;
  return data ?? [];
}

export async function createDiscoveryCategory(input: {
  category_type: string; category_name: string; description?: string;
  icon_name?: string; display_order?: number;
}): Promise<string> {
  const { data, error } = await supabase.from("visual_discovery_categories" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

// =====================================================
// LEARNING MODULES (Section 14)
// =====================================================

export async function createLearningModule(input: LearningModuleInput): Promise<string> {
  const { data, error } = await supabase.from("execution_learning_modules" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getLearningModules(moduleType?: string, skillTag?: string, limit = 30) {
  let query = supabase.from("execution_learning_modules" as any).select("*").eq("is_published", true);
  if (moduleType) query = query.eq("module_type", moduleType);
  const { data, error } = await query.order("rating_avg", { ascending: false }).limit(limit);
  if (error) throw error;
  let results = data ?? [];
  if (skillTag) {
    results = results.filter((m: any) => m.skill_tags?.includes(skillTag));
  }
  return results;
}

export async function getUserLearningModules(authorId: string) {
  const { data, error } = await supabase.from("execution_learning_modules" as any).select("*").eq("author_id", authorId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// AI CONTENT RECOMMENDATIONS (Section 10)
// =====================================================

export async function getAIContentRecommendations(userId: string, limit = 20) {
  const { data, error } = await supabase.from("ai_content_recommendations" as any).select("*")
    .eq("user_id", userId)
    .eq("was_interacted", false)
    .order("relevance_score", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function saveAIContentRecommendation(input: {
  user_id: string; recommended_entity_type: string; recommended_entity_id: string;
  relevance_score: number; recommendation_reason?: string;
  domain_match?: boolean; emerging_innovator?: boolean;
}): Promise<void> {
  const { error } = await supabase.from("ai_content_recommendations" as any).insert({
    ...input, suppressed_viral_bias: true,
  });
  if (error) throw error;
}

// =====================================================
// GLOBAL INNOVATION MAP (Section 13)
// =====================================================

export async function getInnovationMapPoints(pointType?: string, countryCode?: string) {
  let query = supabase.from("innovation_map_points" as any).select("*").eq("is_active", true);
  if (pointType) query = query.eq("point_type", pointType);
  if (countryCode) query = query.eq("country_code", countryCode);
  const { data, error } = await query.order("intensity", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addInnovationMapPoint(input: InnovationMapPointInput): Promise<string> {
  const { data, error } = await supabase.from("innovation_map_points" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}
