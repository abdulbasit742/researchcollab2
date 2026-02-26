import { supabase } from "@/integrations/supabase/client";

/**
 * Trust Score Engine — computes a weighted trust score (0–100).
 *
 * Formula:
 *   25% deal completion rate
 *   20% dispute rate (inverse)
 *   15% response time score
 *   15% profile completeness
 *   10% wallet stability (financial_reliability_score)
 *   10% verification status
 *    5% network endorsements
 */

interface TrustInputs {
  completionRate: number;       // 0–1
  disputeRate: number;          // 0–1
  responseTimeHours: number;    // lower = better
  profileStrength: number;      // 0–100
  financialReliability: number; // 0–100
  verificationLevel: number;    // 0, 1, 2, 3
  endorsementCount: number;
}

function normalizeResponseTime(hours: number): number {
  // <1h → 100, 24h → 50, 72h+ → 0
  if (hours <= 1) return 100;
  if (hours >= 72) return 0;
  return Math.round(100 * (1 - (hours - 1) / 71));
}

function normalizeVerification(level: number): number {
  // none=0, email=30, identity=60, institution=100
  const map: Record<number, number> = { 0: 0, 1: 30, 2: 60, 3: 100 };
  return map[level] ?? 0;
}

function normalizeEndorsements(count: number): number {
  // 0→0, 10→50, 30+→100
  return Math.min(100, Math.round((count / 30) * 100));
}

export function calculateTrustScore(inputs: TrustInputs): number {
  const completionScore = inputs.completionRate * 100;
  const disputeScore = (1 - inputs.disputeRate) * 100;
  const responseScore = normalizeResponseTime(inputs.responseTimeHours);
  const verificationScore = normalizeVerification(inputs.verificationLevel);
  const endorsementScore = normalizeEndorsements(inputs.endorsementCount);

  const raw =
    completionScore * 0.25 +
    disputeScore * 0.20 +
    responseScore * 0.15 +
    inputs.profileStrength * 0.15 +
    inputs.financialReliability * 0.10 +
    verificationScore * 0.10 +
    endorsementScore * 0.05;

  return Math.min(100, Math.max(0, Math.round(raw)));
}

function verificationStringToLevel(v: string): number {
  const map: Record<string, number> = {
    none: 0, unverified: 0,
    email: 1, basic: 1,
    identity: 2, verified: 2,
    institution: 3, full: 3,
  };
  return map[v.toLowerCase()] ?? 0;
}

/**
 * Compute and persist trust score for a user.
 * Reads from user_trust_profiles, profile_proof_metrics, profiles, user_skills, wallets.
 */
export async function computeTrustScore(userId: string): Promise<number> {
  // Parallel data fetch — avoid excessively deep type by splitting
  const trustRes = await supabase.from("user_trust_profiles").select("*").eq("user_id", userId).maybeSingle();
  const proofRes = await supabase.from("profile_proof_metrics").select("*").eq("user_id", userId).maybeSingle();
  const profileRes = await supabase.from("profiles").select("full_name, university, role, audio_bio_transcript").eq("id", userId).maybeSingle();
  const walletRes = await supabase.from("wallets").select("available_balance, escrow_balance, fraud_flags").eq("user_id", userId).maybeSingle();

  // Count endorsements via user_skills join
  const skillsRes = await supabase.from("user_skills").select("endorsement_count").eq("user_id", userId);
  const totalEndorsements = (skillsRes.data ?? []).reduce((sum, s) => sum + (s.endorsement_count ?? 0), 0);

  const trust = trustRes.data;
  const proof = proofRes.data;
  const profile = profileRes.data;

  const { computeProfileStrength } = await import("./profileStrengthEngine");
  const profileStrength = computeProfileStrength({
    hasAvatar: false,
    bioLength: profile?.audio_bio_transcript?.length ?? 0,
    hasSkills: (skillsRes.data?.length ?? 0) > 0,
    hasUniversity: !!profile?.university,
    hasHeadline: !!profile?.role,
    hasFullName: !!profile?.full_name,
    dealsCompleted: proof?.projects_completed ?? 0,
    connectionsCount: 0,
  });

  const completionRate = trust?.successful_rate ?? 0;
  const disputeRate = trust?.dispute_rate ?? 0;
  const responseTimeHours = trust?.response_time_hours ?? 24;
  const financialReliability = trust?.financial_reliability_score ?? 50;
  const verificationLevel = verificationStringToLevel(trust?.verification_level ?? "none");

  const score = calculateTrustScore({
    completionRate,
    disputeRate,
    responseTimeHours,
    profileStrength,
    financialReliability,
    verificationLevel,
    endorsementCount: totalEndorsements,
  });

  // Determine tier (must match trust_tier enum: bronze, silver, gold, platinum)
  const tier = score >= 90 ? "platinum" : score >= 75 ? "gold" : score >= 50 ? "silver" : "bronze";

  // Persist
  const { data: existing } = await supabase
    .from("user_trust_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from("user_trust_profiles")
      .update({ trust_score: score, trust_tier: tier, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  } else {
    await supabase.from("user_trust_profiles")
      .insert({ user_id: userId, trust_score: score, trust_tier: tier });
  }

  return score;
}
