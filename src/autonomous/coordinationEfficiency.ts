/**
 * Coordination Efficiency Index — measures operational speed:
 * time-to-match, time-to-complete, dispute resolution, capital deployment, responsiveness.
 */

import { supabase } from "@/integrations/supabase/client";

export interface CoordinationEfficiencyReport {
  efficiencyIndex: number;
  grade: "A" | "B" | "C" | "D" | "F";
  metrics: Record<string, number>;
  bottlenecks: string[];
  computedAt: string;
}

export async function computeCoordinationEfficiency(): Promise<CoordinationEfficiencyReport> {
  const [trustRes, dealsRes, advancesRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("response_time_hours"),
    supabase.from("deal_rooms").select("created_at, status, completed_at").in("status", ["completed", "active", "in_progress"]),
    supabase.from("capital_advances").select("created_at, status"),
  ]);

  const trusts = trustRes.data ?? [];
  const deals = dealsRes.data ?? [];
  const advances = advancesRes.data ?? [];
  const bottlenecks: string[] = [];

  // 1. Message responsiveness (from avg response time)
  const responseTimes = trusts.map(t => t.response_time_hours ?? 24).filter(t => t > 0);
  const avgResponse = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 24;
  const responseScore = Math.max(0, Math.min(100, 100 - avgResponse * 4));
  if (avgResponse > 12) bottlenecks.push(`Average response time: ${Math.round(avgResponse)}h`);

  // 2. Time-to-complete (deals)
  const completed = deals.filter(d => d.status === "completed" && d.completed_at);
  const completionTimes = completed.map(d => {
    const start = new Date(d.created_at).getTime();
    const end = new Date(d.completed_at!).getTime();
    return (end - start) / 86400000; // days
  }).filter(d => d > 0);
  const avgCompletionDays = completionTimes.length > 0 ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length : 30;
  const completionScore = Math.max(0, Math.min(100, 100 - avgCompletionDays * 2));
  if (avgCompletionDays > 30) bottlenecks.push(`Average deal completion: ${Math.round(avgCompletionDays)} days`);

  // 3. Capital deployment speed
  const approvedAdvances = advances.filter(a => a.status === "disbursed" || a.status === "repaying");
  const deploymentRatio = advances.length > 0 ? approvedAdvances.length / advances.length : 0;
  const deploymentScore = Math.round(deploymentRatio * 100);
  if (deploymentRatio < 0.5) bottlenecks.push("Capital deployment ratio below 50%");

  // 4. Active deal ratio (as proxy for matching efficiency)
  const activeDeals = deals.filter(d => d.status === "active" || d.status === "in_progress").length;
  const matchScore = Math.min(100, activeDeals * 5);

  // Weighted composite
  const efficiencyIndex = Math.round(
    responseScore * 0.25 + completionScore * 0.30 + deploymentScore * 0.25 + matchScore * 0.20
  );

  const grade = efficiencyIndex >= 80 ? "A" : efficiencyIndex >= 65 ? "B" : efficiencyIndex >= 50 ? "C" : efficiencyIndex >= 35 ? "D" : "F";

  return {
    efficiencyIndex,
    grade,
    metrics: {
      avgResponseHours: Math.round(avgResponse * 10) / 10,
      avgCompletionDays: Math.round(avgCompletionDays * 10) / 10,
      capitalDeploymentRate: Math.round(deploymentRatio * 100),
      activeDeals,
    },
    bottlenecks,
    computedAt: new Date().toISOString(),
  };
}
