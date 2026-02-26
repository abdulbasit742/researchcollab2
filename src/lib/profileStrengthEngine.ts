import { supabase } from "@/integrations/supabase/client";

/**
 * Profile Strength Calculator — returns 0–100 based on completeness.
 *
 * Criteria (weight):
 *   Avatar uploaded       (15)
 *   Bio > 150 chars       (15)
 *   Full name set         (10)
 *   Skills added          (15)
 *   University filled     (10)
 *   Headline filled       (10)
 *   ≥1 deal completed     (15)
 *   ≥3 connections        (10)
 */

export interface ProfileStrengthInputs {
  hasAvatar: boolean;
  bioLength: number;
  hasSkills: boolean;
  hasUniversity: boolean;
  hasHeadline: boolean;
  hasFullName: boolean;
  dealsCompleted: number;
  connectionsCount: number;
}

export function computeProfileStrength(inputs: ProfileStrengthInputs): number {
  let score = 0;

  if (inputs.hasAvatar) score += 15;
  if (inputs.bioLength >= 150) score += 15;
  else if (inputs.bioLength >= 50) score += 8;
  if (inputs.hasFullName) score += 10;
  if (inputs.hasSkills) score += 15;
  if (inputs.hasUniversity) score += 10;
  if (inputs.hasHeadline) score += 10;
  if (inputs.dealsCompleted >= 1) score += 15;
  if (inputs.connectionsCount >= 3) score += 10;
  else if (inputs.connectionsCount >= 1) score += 5;

  return Math.min(100, score);
}

/**
 * Fetch all data and compute profile strength for a user.
 */
export async function computeProfileStrengthForUser(userId: string): Promise<number> {
  const [profileRes, skillsRes, proofRes, connectionsRes] = await Promise.all([
    supabase.from("profiles").select("full_name, university, role, audio_bio_transcript").eq("id", userId).maybeSingle(),
    supabase.from("user_skills").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("profile_proof_metrics").select("projects_completed").eq("user_id", userId).maybeSingle(),
    supabase.from("connection_requests")
      .select("id", { count: "exact", head: true })
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq("status", "accepted"),
  ]);

  const p = profileRes.data;

  return computeProfileStrength({
    hasAvatar: false, // no avatar_url column in profiles
    bioLength: p?.audio_bio_transcript?.length ?? 0,
    hasFullName: !!p?.full_name,
    hasSkills: (skillsRes.count ?? 0) > 0,
    hasUniversity: !!p?.university,
    hasHeadline: !!p?.role,
    dealsCompleted: proofRes.data?.projects_completed ?? 0,
    connectionsCount: connectionsRes.count ?? 0,
  });
}
