/**
 * Viral Referral & Reputation Loop — Service Layer
 * Additive system: does NOT mutate core financial/escrow/trust tables.
 */
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────
export interface VrlReferral {
  id: string;
  referrer_user_id: string;
  referred_user_id: string | null;
  invitation_channel: string;
  referral_status: string;
  referral_code: string;
  converted_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface VrlInvitation {
  id: string;
  sender_id: string;
  recipient_email: string | null;
  recipient_name: string | null;
  channel: string;
  referral_code: string;
  status: string;
  message: string | null;
  created_at: string;
}

export interface VrlReward {
  id: string;
  user_id: string;
  referral_id: string | null;
  reward_type: string;
  reward_value: number;
  description: string | null;
  status: string;
  created_at: string;
}

export interface VrlInfluenceScore {
  id: string;
  user_id: string;
  referral_score: number;
  collaboration_score: number;
  team_participation_score: number;
  institution_invite_score: number;
  overall_influence: number;
  tier: string;
  computed_at: string;
}

export interface VrlGrowthFeedItem {
  id: string;
  event_type: string;
  actor_name: string | null;
  title: string;
  description: string | null;
  entity_type: string | null;
  created_at: string;
}

// ─── Referral Code Generator ─────────────────────────────────
export function generateReferralCode(userId: string): string {
  const short = userId.slice(0, 6).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RC-${short}-${rand}`;
}

export function buildReferralLink(code: string, channel?: string): string {
  const base = window.location.origin;
  return `${base}/join?ref=${code}${channel ? `&ch=${channel}` : ""}`;
}

// ─── Referral CRUD ───────────────────────────────────────────
export async function getMyReferrals(userId: string) {
  const { data, error } = await (supabase as any)
    .from("vrl_referrals")
    .select("*")
    .eq("referrer_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as VrlReferral[];
}

export async function createReferral(input: {
  referrer_user_id: string;
  referral_code: string;
  invitation_channel?: string;
  referred_user_id?: string;
}) {
  const { data, error } = await (supabase as any)
    .from("vrl_referrals")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as VrlReferral;
}

// ─── Invitations ─────────────────────────────────────────────
export async function getMyInvitations(userId: string) {
  const { data, error } = await (supabase as any)
    .from("vrl_invitations")
    .select("*")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as VrlInvitation[];
}

export async function createInvitation(input: {
  sender_id: string;
  referral_code: string;
  channel: string;
  recipient_email?: string;
  recipient_name?: string;
  message?: string;
}) {
  const { data, error } = await (supabase as any)
    .from("vrl_invitations")
    .insert({ ...input, status: "sent" })
    .select()
    .single();
  if (error) throw error;
  return data as VrlInvitation;
}

// ─── Rewards ─────────────────────────────────────────────────
export async function getMyRewards(userId: string) {
  const { data, error } = await (supabase as any)
    .from("vrl_rewards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as VrlReward[];
}

// ─── Influence Score ─────────────────────────────────────────
export async function getInfluenceScore(userId: string) {
  const { data, error } = await (supabase as any)
    .from("vrl_influence_scores")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as VrlInfluenceScore | null;
}

export async function getInfluenceLeaderboard(limit = 20) {
  const { data, error } = await (supabase as any)
    .from("vrl_influence_scores")
    .select("*")
    .order("overall_influence", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as VrlInfluenceScore[];
}

// ─── Institution Referrals ───────────────────────────────────
export async function getInstitutionReferrals(userId: string) {
  const { data, error } = await (supabase as any)
    .from("vrl_institution_referrals")
    .select("*")
    .eq("referred_by_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createInstitutionReferral(input: {
  referred_by_user_id: string;
  referring_institution_id?: string;
  referred_institution_id?: string;
  partnership_type?: string;
}) {
  const { data, error } = await (supabase as any)
    .from("vrl_institution_referrals")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Growth Feed ─────────────────────────────────────────────
export async function getGrowthFeed(limit = 50) {
  const { data, error } = await (supabase as any)
    .from("vrl_growth_feed")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as VrlGrowthFeedItem[];
}

export async function postGrowthEvent(input: {
  event_type: string;
  actor_id?: string;
  actor_name?: string;
  title: string;
  description?: string;
  entity_type?: string;
  entity_id?: string;
}) {
  const { error } = await (supabase as any)
    .from("vrl_growth_feed")
    .insert({ ...input, is_public: true });
  if (error) throw error;
}

// ─── Analytics Helpers ───────────────────────────────────────
export async function getReferralAnalytics(userId: string) {
  const referrals = await getMyReferrals(userId);
  const total = referrals.length;
  const registered = referrals.filter(r => r.referral_status === "registered" || r.referral_status === "verified" || r.referral_status === "active").length;
  const active = referrals.filter(r => r.referral_status === "active").length;
  const conversionRate = total > 0 ? ((registered / total) * 100).toFixed(1) : "0";

  const channelBreakdown: Record<string, number> = {};
  referrals.forEach(r => {
    channelBreakdown[r.invitation_channel] = (channelBreakdown[r.invitation_channel] || 0) + 1;
  });

  return { total, registered, active, conversionRate, channelBreakdown };
}
