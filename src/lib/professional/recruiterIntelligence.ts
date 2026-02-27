/**
 * Recruiter Intelligence Mode
 * Side-by-side candidate comparison using execution analytics, not resumes.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";
import { calculateERS, type ERSBreakdown } from "./executionReputationScore";

const log = createLogger("recruiterIntelligence");

export interface CandidateComparison {
  userId: string;
  displayName: string;
  ers: ERSBreakdown;
  milestoneVelocityDays: number;
  domainSpecializations: string[];
  institutionalBadges: string[];
}

export interface ComparisonReport {
  candidates: CandidateComparison[];
  recommendation: {
    bestOverall: string;
    bestReliability: string;
    bestComplexity: string;
    reasoning: string[];
  };
  generatedAt: string;
}

export async function compareCandidates(userIds: string[]): Promise<ComparisonReport> {
  const candidates: CandidateComparison[] = [];

  for (const userId of userIds.slice(0, 10)) {
    const ers = await calculateERS(userId);

    // Get profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", userId)
      .maybeSingle();

    const name = profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : userId.substring(0, 8);

    // Get academic records for institutional badges
    const { data: records } = await supabase
      .from("academic_records")
      .select("title, record_type")
      .eq("user_id", userId)
      .eq("verification_status", "verified")
      .limit(10);

    // Get deliverables for domain specialization
    const { data: accountability } = await supabase
      .from("accountability_records")
      .select("promised_deliverables, deadline, verified_at")
      .eq("executor_id", userId)
      .eq("outcome_status", "completed")
      .limit(50);

    const domains = [...new Set((accountability ?? []).flatMap((a) => a.promised_deliverables ?? []))];

    // Calculate average milestone velocity
    const velocities = (accountability ?? [])
      .filter((a) => a.deadline && a.verified_at)
      .map((a) => {
        const deadline = new Date(a.deadline!).getTime();
        const verified = new Date(a.verified_at!).getTime();
        return (deadline - verified) / (1000 * 60 * 60 * 24); // days ahead of deadline
      });
    const avgVelocity = velocities.length > 0
      ? Math.round(velocities.reduce((s, v) => s + v, 0) / velocities.length)
      : 0;

    candidates.push({
      userId,
      displayName: name,
      ers,
      milestoneVelocityDays: avgVelocity,
      domainSpecializations: domains.slice(0, 10),
      institutionalBadges: (records ?? []).map((r) => r.title),
    });
  }

  // Generate recommendation
  const sorted = [...candidates].sort((a, b) => b.ers.totalScore - a.ers.totalScore);
  const bestReliability = [...candidates].sort((a, b) => b.ers.disputeFreeCompletionPct - a.ers.disputeFreeCompletionPct)[0];
  const bestComplexity = [...candidates].sort((a, b) => b.ers.projectComplexityFactor - a.ers.projectComplexityFactor)[0];

  const reasoning: string[] = [];
  if (sorted[0]) reasoning.push(`${sorted[0].displayName} has the highest overall ERS (${sorted[0].ers.totalScore})`);
  if (bestReliability) reasoning.push(`${bestReliability.displayName} has the best dispute-free rate (${bestReliability.ers.disputeFreeCompletionPct}%)`);
  if (bestComplexity) reasoning.push(`${bestComplexity.displayName} handled the most complex projects`);

  log.info("Candidate comparison completed", { candidateCount: candidates.length });

  return {
    candidates,
    recommendation: {
      bestOverall: sorted[0]?.userId ?? "",
      bestReliability: bestReliability?.userId ?? "",
      bestComplexity: bestComplexity?.userId ?? "",
      reasoning,
    },
    generatedAt: new Date().toISOString(),
  };
}
