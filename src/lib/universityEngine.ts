import { supabase } from "@/integrations/supabase/client";

/**
 * University Scoring Engine — computes institutional quality metrics.
 *
 * Metrics:
 *   - Student completion rate (20%)
 *   - Average trust score of students (20%)
 *   - Total funded FYPs (15%)
 *   - Industry collaborations (15%)
 *   - Dispute ratio (inverse, 15%)
 *   - Research output (15%)
 *
 * Returns university_score (0–100), stored in organizations.org_trust_score.
 */

export interface UniversityMetrics {
  university_score: number;
  student_completion_rate: number;
  avg_student_trust: number;
  total_funded_fyps: number;
  industry_collaborations: number;
  dispute_ratio: number;
  research_output: number;
}

export async function computeUniversityScore(orgId: string): Promise<UniversityMetrics> {
  // Get org members
  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("org_id", orgId);

  const memberIds = (members ?? []).map(m => m.user_id);

  if (memberIds.length === 0) {
    return {
      university_score: 0,
      student_completion_rate: 0,
      avg_student_trust: 0,
      total_funded_fyps: 0,
      industry_collaborations: 0,
      dispute_ratio: 0,
      research_output: 0,
    };
  }

  // Batch fetch trust profiles for members
  const { data: trustProfiles } = await supabase
    .from("user_trust_profiles")
    .select("trust_score, successful_rate, dispute_rate, total_projects_completed")
    .in("user_id", memberIds.slice(0, 100));

  const profiles = trustProfiles ?? [];

  // Student completion rate
  const totalCompleted = profiles.reduce((s, p) => s + (p.total_projects_completed ?? 0), 0);
  const avgSuccessRate = profiles.length > 0
    ? profiles.reduce((s, p) => s + (p.successful_rate ?? 0), 0) / profiles.length
    : 0;
  const student_completion_rate = Math.round(avgSuccessRate * 100);

  // Average trust score
  const avg_student_trust = profiles.length > 0
    ? Math.round(profiles.reduce((s, p) => s + (p.trust_score ?? 0), 0) / profiles.length)
    : 0;

  // Dispute ratio
  const avgDisputeRate = profiles.length > 0
    ? profiles.reduce((s, p) => s + (p.dispute_rate ?? 0), 0) / profiles.length
    : 0;
  const dispute_ratio = Math.round(avgDisputeRate * 100);

  // Get academic output metrics
  const { data: outputMetrics } = await supabase
    .from("academic_output_metrics")
    .select("*")
    .eq("institution_id", orgId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const total_funded_fyps = outputMetrics?.active_fyps ?? 0;
  const research_output = outputMetrics?.active_research ?? 0;

  // Industry collaborations — count unique external counterparties
  const { count: industry_collaborations } = await supabase
    .from("deal_rooms")
    .select("id", { count: "exact", head: true })
    .in("buyer_id", memberIds.slice(0, 50))
    .eq("status", "completed");

  // Compute weighted score
  const completionScore = Math.min(100, student_completion_rate);
  const trustNorm = Math.min(100, avg_student_trust);
  const fypNorm = Math.min(100, Math.round((total_funded_fyps / 50) * 100));
  const collabNorm = Math.min(100, Math.round(((industry_collaborations ?? 0) / 30) * 100));
  const disputeInverse = Math.max(0, 100 - dispute_ratio);
  const researchNorm = Math.min(100, Math.round((research_output / 20) * 100));

  const university_score = Math.round(
    completionScore * 0.20 +
    trustNorm * 0.20 +
    fypNorm * 0.15 +
    collabNorm * 0.15 +
    disputeInverse * 0.15 +
    researchNorm * 0.15
  );

  // Persist score
  await supabase
    .from("organizations")
    .update({ org_trust_score: university_score, updated_at: new Date().toISOString() })
    .eq("id", orgId);

  return {
    university_score: Math.min(100, university_score),
    student_completion_rate,
    avg_student_trust,
    total_funded_fyps,
    industry_collaborations: industry_collaborations ?? 0,
    dispute_ratio,
    research_output,
  };
}

export async function getUniversityRankings(limit = 50) {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, type, org_trust_score, country, city, status")
    .in("type", ["university", "academic"])
    .not("org_trust_score", "is", null)
    .order("org_trust_score", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
