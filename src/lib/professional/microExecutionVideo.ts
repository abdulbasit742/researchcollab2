/**
 * Micro-Execution Video Intelligence System
 * Short-form content without dopamine addiction.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const DEPTH_TIERS = {
  insight_snap: { label: "Insight Snap", minSec: 30, maxSec: 60 },
  demo_clip: { label: "Demo Clip", minSec: 60, maxSec: 120 },
  deep_walkthrough: { label: "Deep Micro Walkthrough", minSec: 120, maxSec: 300 },
} as const;
export type DepthTier = keyof typeof DEPTH_TIERS;

export const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const VIDEO_COMMENT_TYPES = [
  "technical_question", "code_review", "research_critique",
  "funding_advice", "improvement_proposal", "collaboration_offer", "general",
] as const;
export type VideoCommentType = typeof VIDEO_COMMENT_TYPES[number];

export const REFLECTION_CATEGORIES = [
  "learned_new_skill", "found_collaboration_idea", "discovered_funding",
  "gained_industry_insight", "need_to_apply_learning", "want_deeper_exploration",
] as const;
export type ReflectionCategory = typeof REFLECTION_CATEGORIES[number];

export const VIDEO_SESSION_CONFIG = {
  defaultSessionSize: 10,
  maxSessionSize: 20,
  autoPlaySound: false,
  autoPlayTransition: false,
  pauseAfterEach: true,
  showMetadataBeforeNext: true,
} as const;

export const MICRO_VIDEO_PHILOSOPHY = {
  category: "Knowledge-first, execution-driven",
  creates: "Skill acceleration loops",
  rewards: "Original capability demonstration",
  banned: [
    "No auto-looping infinite playback",
    "No emotional manipulation hooks",
    "No trend-based boosting",
    "No algorithmic unpredictability",
    "No sound-first addictive format",
    "No trending audio section",
    "No viral sound cloning",
    "No hashtag trend amplification",
    "No dance challenges",
  ],
} as const;

// =====================================================
// TYPES
// =====================================================

export interface MicroVideoInput {
  creator_id: string;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  domain_tags?: string[];
  skill_tags?: string[];
  execution_phase?: string;
  project_link?: string;
  funding_relevance?: boolean;
  collaboration_opportunity?: boolean;
  innovation_category?: string;
  duration_seconds: number;
  depth_tier?: string;
  difficulty_level?: string;
  related_doc_link?: string;
  linked_entity_type?: string;
  linked_entity_id?: string;
}

export interface VideoQualityInput {
  video_id: string;
  clarity_score: number;
  technical_depth: number;
  innovation_signal: number;
  collaboration_signal: number;
  skill_articulation: number;
  long_term_relevance: number;
}

export interface VideoRankingInput {
  video_id: string;
  skill_demonstration: number;
  execution_originality: number;
  innovation_depth: number;
  collaboration_potential: number;
  long_term_usefulness: number;
  domain_relevance: number;
  funding_alignment: number;
  peer_validation: number;
  replication_reference: number;
}

export interface VideoSessionInput {
  user_id: string;
  session_size?: number;
}

export interface VideoSessionUpdate {
  videos_watched?: number;
  time_spent_seconds?: number;
  reflection_response?: string;
  reflection_category?: string;
  ended_at?: string;
}

export interface VideoCommentInput {
  video_id: string;
  user_id: string;
  comment_type?: string;
  content: string;
  parent_comment_id?: string;
  is_collaboration_offer?: boolean;
}

export interface LearningPlaylistInput {
  creator_id: string;
  title: string;
  description?: string;
  skill_path?: string;
  difficulty_progression?: string[];
  video_ids?: string[];
  practice_assignments?: Record<string, unknown>[];
  milestone_suggestions?: Record<string, unknown>[];
}

export interface InstitutionalChannelInput {
  institution_id: string;
  channel_name: string;
  channel_type?: string;
  description?: string;
  is_verified?: boolean;
}

// =====================================================
// COMPOSITE SCORING
// =====================================================

const QUALITY_WEIGHTS = {
  clarity: 0.20, technical_depth: 0.20, innovation_signal: 0.15,
  collaboration_signal: 0.15, skill_articulation: 0.15, long_term_relevance: 0.15,
};

export function computeVideoQuality(input: Omit<VideoQualityInput, "video_id">): number {
  return Math.round(
    input.clarity_score * QUALITY_WEIGHTS.clarity +
    input.technical_depth * QUALITY_WEIGHTS.technical_depth +
    input.innovation_signal * QUALITY_WEIGHTS.innovation_signal +
    input.collaboration_signal * QUALITY_WEIGHTS.collaboration_signal +
    input.skill_articulation * QUALITY_WEIGHTS.skill_articulation +
    input.long_term_relevance * QUALITY_WEIGHTS.long_term_relevance
  );
}

const RANK_WEIGHTS = {
  skill_demonstration: 0.14, execution_originality: 0.12, innovation_depth: 0.12,
  collaboration_potential: 0.10, long_term_usefulness: 0.12, domain_relevance: 0.10,
  funding_alignment: 0.10, peer_validation: 0.10, replication_reference: 0.10,
};

export function computeVideoRank(input: Omit<VideoRankingInput, "video_id">): number {
  return Math.round(
    input.skill_demonstration * RANK_WEIGHTS.skill_demonstration +
    input.execution_originality * RANK_WEIGHTS.execution_originality +
    input.innovation_depth * RANK_WEIGHTS.innovation_depth +
    input.collaboration_potential * RANK_WEIGHTS.collaboration_potential +
    input.long_term_usefulness * RANK_WEIGHTS.long_term_usefulness +
    input.domain_relevance * RANK_WEIGHTS.domain_relevance +
    input.funding_alignment * RANK_WEIGHTS.funding_alignment +
    input.peer_validation * RANK_WEIGHTS.peer_validation +
    input.replication_reference * RANK_WEIGHTS.replication_reference
  );
}

// =====================================================
// VIDEOS (Section 1)
// =====================================================

export async function createMicroVideo(input: MicroVideoInput): Promise<string> {
  const tier = input.depth_tier ?? (input.duration_seconds <= 60 ? "insight_snap" : input.duration_seconds <= 120 ? "demo_clip" : "deep_walkthrough");
  const { data, error } = await supabase.from("micro_execution_videos" as any)
    .insert({ ...input, depth_tier: tier }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getMicroVideos(filters?: { domain?: string; depth_tier?: string; difficulty?: string }) {
  let query = supabase.from("micro_execution_videos" as any).select("*").eq("status", "published");
  if (filters?.depth_tier) query = query.eq("depth_tier", filters.depth_tier);
  if (filters?.difficulty) query = query.eq("difficulty_level", filters.difficulty);
  if (filters?.domain) query = query.contains("domain_tags", [filters.domain]);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function getUserMicroVideos(creatorId: string) {
  const { data, error } = await supabase.from("micro_execution_videos" as any).select("*")
    .eq("creator_id", creatorId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// VIDEO QUALITY (Section 12)
// =====================================================

export async function saveVideoQuality(input: VideoQualityInput): Promise<void> {
  const composite = computeVideoQuality(input);
  const { error } = await supabase.from("video_quality_index" as any).insert({ ...input, composite_quality: composite });
  if (error) throw error;
}

export async function getVideoQuality(videoId: string) {
  const { data, error } = await supabase.from("video_quality_index" as any).select("*")
    .eq("video_id", videoId).order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// VIDEO RANKING (Section 3)
// =====================================================

export async function saveVideoRanking(input: VideoRankingInput): Promise<void> {
  const composite = computeVideoRank(input);
  const { error } = await supabase.from("video_value_rankings" as any).insert({ ...input, composite_rank: composite });
  if (error) throw error;
}

// =====================================================
// VIDEO SESSIONS (Section 4, 14)
// =====================================================

export async function startVideoSession(input: VideoSessionInput): Promise<string> {
  const { data, error } = await supabase.from("video_viewing_sessions" as any)
    .insert({ ...input, session_size: input.session_size ?? VIDEO_SESSION_CONFIG.defaultSessionSize }).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function updateVideoSession(sessionId: string, updates: VideoSessionUpdate): Promise<void> {
  const { error } = await supabase.from("video_viewing_sessions" as any).update(updates).eq("id", sessionId);
  if (error) throw error;
}

export async function getUserVideoSessions(userId: string, limit = 10) {
  const { data, error } = await supabase.from("video_viewing_sessions" as any).select("*")
    .eq("user_id", userId).order("started_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// COMMENTS (Section 7)
// =====================================================

export async function addVideoComment(input: VideoCommentInput): Promise<string> {
  const { data, error } = await supabase.from("video_structured_comments" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getVideoComments(videoId: string) {
  const { data, error } = await supabase.from("video_structured_comments" as any).select("*")
    .eq("video_id", videoId).order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// LEARNING PLAYLISTS (Section 9)
// =====================================================

export async function createLearningPlaylist(input: LearningPlaylistInput): Promise<string> {
  const { data, error } = await supabase.from("video_learning_playlists" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getLearningPlaylists(filters?: { skill_path?: string }) {
  let query = supabase.from("video_learning_playlists" as any).select("*").eq("is_public", true);
  if (filters?.skill_path) query = query.eq("skill_path", filters.skill_path);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// INSTITUTIONAL CHANNELS (Section 11)
// =====================================================

export async function createInstitutionalChannel(input: InstitutionalChannelInput): Promise<string> {
  const { data, error } = await supabase.from("institutional_video_channels" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function getInstitutionalChannels(institutionId?: string) {
  let query = supabase.from("institutional_video_channels" as any).select("*");
  if (institutionId) query = query.eq("institution_id", institutionId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
