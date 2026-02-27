/**
 * Neuro-Responsible UX & Cognitive Wellness Engine
 * Anti-dopamine architecture: finite feeds, time awareness, focus mode,
 * notification tiers, healthy engagement, growth visualization.
 */

import { supabase } from "@/integrations/supabase/client";

// =====================================================
// CONSTANTS
// =====================================================

export const SESSION_INTENTS = [
  "discover_collaborators", "find_funding", "learn_skill", "review_projects",
  "provide_feedback", "explore_innovation", "casual_browsing",
] as const;
export type SessionIntent = typeof SESSION_INTENTS[number];

export const NOTIFICATION_TIERS = {
  tier1: { label: "Critical", examples: ["Grant deadlines", "Escrow releases", "Compliance alerts"] },
  tier2: { label: "High Value", examples: ["Collaboration requests", "Funding invites"] },
  tier3: { label: "Informational", examples: ["Comments", "Mentions"] },
} as const;

export const FINITE_FEED_CONFIG = {
  defaultSessionSize: 20,
  maxSessionSize: 40,
  softStopEnabled: true,
  reflectionPromptEnabled: true,
  sessionTimerVisible: true,
} as const;

export const COGNITIVE_WELLNESS_PHILOSOPHY = {
  category: "Engineered progression, not engineered addiction",
  maximizes: "Professional advancement",
  encourages: "Creation and execution",
  stabilizes: "Cognition",
  banned: [
    "No infinite scroll",
    "No variable reward slot-machine mechanics",
    "No red urgency badges",
    "No hidden ranking unpredictability",
    "No vanity metric emphasis",
    "No artificial scarcity countdown tricks",
    "No streak manipulation loops",
    "No dopamine-engineered push notifications",
  ],
  anxietyMinimization: [
    "No urgent language (Don't miss out!)",
    "No FOMO triggers",
    "No expiring highlight pressure",
    "No social comparison leaderboards by default",
    "No countdown timers for visibility",
    "Calm color palette",
    "Stable layout",
    "Predictable navigation",
    "Clear hierarchy",
    "No surprise UI changes",
  ],
} as const;

// =====================================================
// TYPES
// =====================================================

export interface FeedSessionInput {
  user_id: string;
  session_intent?: string;
}

export interface FeedSessionUpdate {
  items_loaded?: number;
  deep_engagement_count?: number;
  passive_scroll_count?: number;
  duration_seconds?: number;
  reflection_completed?: boolean;
  ended_at?: string;
}

export interface TimeAwarenessInput {
  user_id: string;
  period: string;
  total_time_seconds: number;
  learning_time_seconds: number;
  collaboration_time_seconds: number;
  browsing_time_seconds: number;
  deep_engagement_ratio: number;
  professional_value_score: number;
}

export interface NotificationPrefsInput {
  user_id: string;
  tier1_enabled?: boolean;
  tier2_enabled?: boolean;
  tier3_enabled?: boolean;
  tier3_batched?: boolean;
  batch_delivery_time?: string;
  scheduled_delivery?: boolean;
  schedule_times?: string[];
}

export interface FocusModeInput {
  user_id: string;
  hide_social_feed?: boolean;
  silence_non_critical?: boolean;
  daily_goals?: Record<string, unknown>[];
  active_deliverables?: string[];
  funding_deadlines?: Record<string, unknown>[];
  collaboration_commitments?: Record<string, unknown>[];
}

export interface HealthyEngagementInput {
  user_id: string;
  deep_reading_count: number;
  structured_feedback_count: number;
  collaboration_initiation_count: number;
  funding_application_count: number;
  skill_development_count: number;
  period: string;
}

export interface WeeklyReflectionInput {
  user_id: string;
  week_start: string;
  time_spent_seconds: number;
  projects_progressed: number;
  skills_improved: number;
  collaborations_initiated: number;
  funding_explored: number;
  value_generated: number;
  passive_browsing_pct: number;
  reflection_notes?: string;
}

export interface GrowthSnapshotInput {
  user_id: string;
  skill_mastery_score: number;
  funding_trajectory: number;
  collaboration_network_size: number;
  innovation_impact_cumulative: number;
  reliability_score: number;
  snapshot_date: string;
}

export interface MetricVisibilityInput {
  user_id: string;
  hide_like_counts?: boolean;
  hide_view_counts?: boolean;
  hide_follower_count?: boolean;
  show_engagement_on_expand?: boolean;
  emphasize_qualitative?: boolean;
}

// =====================================================
// HEALTHY ENGAGEMENT SCORING (Section 11)
// =====================================================

const ENGAGEMENT_WEIGHTS = {
  deep_reading: 0.20, structured_feedback: 0.25,
  collaboration_initiation: 0.20, funding_application: 0.15,
  skill_development: 0.20,
};

export function computeHealthyEngagement(input: Omit<HealthyEngagementInput, "user_id" | "period">): number {
  return Math.round(
    input.deep_reading_count * ENGAGEMENT_WEIGHTS.deep_reading +
    input.structured_feedback_count * ENGAGEMENT_WEIGHTS.structured_feedback +
    input.collaboration_initiation_count * ENGAGEMENT_WEIGHTS.collaboration_initiation +
    input.funding_application_count * ENGAGEMENT_WEIGHTS.funding_application +
    input.skill_development_count * ENGAGEMENT_WEIGHTS.skill_development
  );
}

// =====================================================
// FEED SESSIONS (Section 1)
// =====================================================

export async function startFeedSession(input: FeedSessionInput): Promise<string> {
  const { data, error } = await supabase.from("user_feed_sessions" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function updateFeedSession(sessionId: string, updates: FeedSessionUpdate): Promise<void> {
  const { error } = await supabase.from("user_feed_sessions" as any).update(updates).eq("id", sessionId);
  if (error) throw error;
}

export async function getUserFeedSessions(userId: string, limit = 10) {
  const { data, error } = await supabase.from("user_feed_sessions" as any).select("*")
    .eq("user_id", userId).order("started_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// TIME AWARENESS (Section 2)
// =====================================================

export async function saveTimeAwareness(input: TimeAwarenessInput): Promise<void> {
  const { error } = await supabase.from("time_awareness_metrics" as any).insert(input);
  if (error) throw error;
}

export async function getTimeAwareness(userId: string, period?: string) {
  let query = supabase.from("time_awareness_metrics" as any).select("*").eq("user_id", userId);
  if (period) query = query.eq("period", period);
  const { data, error } = await query.order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// NOTIFICATION PREFERENCES (Section 3)
// =====================================================

export async function saveNotificationPrefs(input: NotificationPrefsInput): Promise<void> {
  const { data: existing } = await supabase.from("notification_tier_preferences" as any)
    .select("id").eq("user_id", input.user_id).maybeSingle();
  if (existing) {
    const { error } = await supabase.from("notification_tier_preferences" as any)
      .update({ ...input, updated_at: new Date().toISOString() }).eq("user_id", input.user_id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("notification_tier_preferences" as any).insert(input);
    if (error) throw error;
  }
}

export async function getNotificationPrefs(userId: string) {
  const { data, error } = await supabase.from("notification_tier_preferences" as any)
    .select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// FOCUS MODE (Section 9)
// =====================================================

export async function startFocusMode(input: FocusModeInput): Promise<string> {
  const { data, error } = await supabase.from("focus_mode_sessions" as any).insert(input).select("id").single();
  if (error) throw error;
  return (data as any).id;
}

export async function endFocusMode(sessionId: string): Promise<void> {
  const { error } = await supabase.from("focus_mode_sessions" as any)
    .update({ is_active: false, ended_at: new Date().toISOString() }).eq("id", sessionId);
  if (error) throw error;
}

export async function getActiveFocusMode(userId: string) {
  const { data, error } = await supabase.from("focus_mode_sessions" as any).select("*")
    .eq("user_id", userId).eq("is_active", true).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// HEALTHY ENGAGEMENT (Section 11)
// =====================================================

export async function saveHealthyEngagement(input: HealthyEngagementInput): Promise<void> {
  const composite = computeHealthyEngagement(input);
  const { error } = await supabase.from("healthy_engagement_scores" as any)
    .insert({ ...input, composite_health_score: composite });
  if (error) throw error;
}

export async function getHealthyEngagement(userId: string, period?: string) {
  let query = supabase.from("healthy_engagement_scores" as any).select("*").eq("user_id", userId);
  if (period) query = query.eq("period", period);
  const { data, error } = await query.order("computed_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// WEEKLY REFLECTION (Section 12)
// =====================================================

export async function saveWeeklyReflection(input: WeeklyReflectionInput): Promise<void> {
  const { error } = await supabase.from("weekly_reflection_reports" as any).insert(input);
  if (error) throw error;
}

export async function getWeeklyReflections(userId: string, limit = 4) {
  const { data, error } = await supabase.from("weekly_reflection_reports" as any).select("*")
    .eq("user_id", userId).order("week_start", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// GROWTH SNAPSHOTS (Section 14)
// =====================================================

export async function saveGrowthSnapshot(input: GrowthSnapshotInput): Promise<void> {
  const { error } = await supabase.from("long_term_growth_snapshots" as any).insert(input);
  if (error) throw error;
}

export async function getGrowthSnapshots(userId: string, limit = 12) {
  const { data, error } = await supabase.from("long_term_growth_snapshots" as any).select("*")
    .eq("user_id", userId).order("snapshot_date", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// =====================================================
// METRIC VISIBILITY (Section 7)
// =====================================================

export async function saveMetricVisibility(input: MetricVisibilityInput): Promise<void> {
  const { data: existing } = await supabase.from("metric_visibility_preferences" as any)
    .select("id").eq("user_id", input.user_id).maybeSingle();
  if (existing) {
    const { error } = await supabase.from("metric_visibility_preferences" as any)
      .update({ ...input, updated_at: new Date().toISOString() }).eq("user_id", input.user_id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("metric_visibility_preferences" as any).insert(input);
    if (error) throw error;
  }
}

export async function getMetricVisibility(userId: string) {
  const { data, error } = await supabase.from("metric_visibility_preferences" as any)
    .select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}
