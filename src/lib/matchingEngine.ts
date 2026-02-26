import { supabase } from "@/integrations/supabase/client";

/**
 * Matching Engine v1 — skill-weighted compatibility scoring for offers.
 *
 * Algorithm:
 *   1. Fetch offer required skills
 *   2. Fetch users with overlapping skills
 *   3. Compute skill overlap score (40%)
 *   4. Multiply by trust score weight (30%)
 *   5. Penalize high dispute rate (15%)
 *   6. Boost verified users (15%)
 *   7. Sort by compatibility_score, return top 20
 */

export interface MatchResult {
  user_id: string;
  offer_id: string;
  compatibility_score: number;
  skill_score: number;
  trust_weight: number;
  full_name: string | null;
  university: string | null;
}

export async function generateMatchesForOffer(offerId: string): Promise<MatchResult[]> {
  // Get offer
  const { data: offer, error: offerErr } = await supabase
    .from("offers")
    .select("id, sender_id, required_skills")
    .eq("id", offerId)
    .single();

  if (offerErr || !offer) throw offerErr ?? new Error("Offer not found");

  const requiredSkills: string[] = Array.isArray(offer.required_skills)
    ? offer.required_skills.map((s: any) => (typeof s === "string" ? s : s.name || "").toLowerCase())
    : [];

  if (requiredSkills.length === 0) return [];

  // Fetch users with matching skills (exclude offer owner)
  const { data: skillUsers } = await supabase
    .from("user_skills")
    .select("user_id, skill_name")
    .neq("user_id", offer.sender_id);

  if (!skillUsers || skillUsers.length === 0) return [];

  // Group skills by user
  const userSkillMap = new Map<string, string[]>();
  for (const s of skillUsers) {
    const existing = userSkillMap.get(s.user_id) || [];
    existing.push(s.skill_name.toLowerCase());
    userSkillMap.set(s.user_id, existing);
  }

  // Filter to users with at least 1 overlap
  const candidateIds: string[] = [];
  const skillScores = new Map<string, number>();

  for (const [uid, skills] of userSkillMap) {
    const overlap = requiredSkills.filter(rs => skills.includes(rs)).length;
    if (overlap > 0) {
      candidateIds.push(uid);
      skillScores.set(uid, overlap / requiredSkills.length); // 0–1
    }
  }

  if (candidateIds.length === 0) return [];

  // Batch fetch trust profiles + profile names
  const [trustRes, profileRes] = await Promise.all([
    supabase
      .from("user_trust_profiles")
      .select("user_id, trust_score, dispute_rate, verification_level, is_frozen")
      .in("user_id", candidateIds.slice(0, 100))
      .eq("is_frozen", false),
    supabase
      .from("profiles")
      .select("id, full_name, university")
      .in("id", candidateIds.slice(0, 100)),
  ]);

  const trustMap = new Map((trustRes.data ?? []).map(t => [t.user_id, t]));
  const profileMap = new Map((profileRes.data ?? []).map(p => [p.id, p]));

  // Score each candidate
  const scored: MatchResult[] = candidateIds
    .filter(uid => {
      const t = trustMap.get(uid);
      return !t?.is_frozen;
    })
    .map(uid => {
      const skillScore = skillScores.get(uid) ?? 0;
      const trust = trustMap.get(uid);
      const profile = profileMap.get(uid);

      const trustScore = (trust?.trust_score ?? 50) / 100; // normalize to 0–1
      const disputePenalty = 1 - (trust?.dispute_rate ?? 0); // inverse
      const verificationBonus = trust?.verification_level === "full" ? 1 :
                                 trust?.verification_level === "verified" ? 0.7 : 0.3;

      const compatibility =
        skillScore * 40 +
        trustScore * 30 +
        disputePenalty * 15 +
        verificationBonus * 15;

      return {
        user_id: uid,
        offer_id: offerId,
        compatibility_score: Math.min(100, Math.round(compatibility)),
        skill_score: Math.round(skillScore * 100),
        trust_weight: Math.round(trustScore * 100),
        full_name: profile?.full_name ?? null,
        university: profile?.university ?? null,
      };
    })
    .sort((a, b) => b.compatibility_score - a.compatibility_score)
    .slice(0, 20);

  // Cache results in ai_match_results
  if (scored.length > 0) {
    // We can reuse ai_match_results or a dedicated table
    // For now, return in-memory results
  }

  return scored;
}

export async function getMatchesForOffer(offerId: string): Promise<MatchResult[]> {
  return generateMatchesForOffer(offerId);
}
