/**
 * Trust Drift Detection Engine — detect gradual trust centralization, erosion, manipulation.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("trustDrift");

export interface TrustDriftAlert {
  type: "centralization" | "erosion" | "manipulation" | "cross_border_imbalance" | "governance_decline";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  metric: number;
  threshold: number;
}

export interface TrustDriftReport {
  alerts: TrustDriftAlert[];
  overallDriftScore: number;
  timestamp: string;
}

export async function detectTrustDrift(): Promise<TrustDriftReport> {
  const { data: nodes } = await (supabase as any).from("sovereign_nodes").select("id, node_trust_score, region_id");
  const alerts: TrustDriftAlert[] = [];
  const scores = (nodes ?? []).map((n: any) => n.node_trust_score ?? 0);

  if (scores.length === 0) {
    return { alerts: [], overallDriftScore: 0, timestamp: new Date().toISOString() };
  }

  const avg = scores.reduce((s: number, v: number) => s + v, 0) / scores.length;
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const variance = scores.reduce((s: number, v: number) => s + Math.pow(v - avg, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Centralization: top node has disproportionate trust
  if (max > avg * 1.8 && scores.length > 2) {
    alerts.push({ type: "centralization", severity: max > avg * 2.5 ? "critical" : "high", description: `Top node trust (${max.toFixed(0)}) is ${(max / avg).toFixed(1)}x the average (${avg.toFixed(0)})`, metric: max, threshold: avg * 1.8 });
  }

  // Erosion: average trust below healthy threshold
  if (avg < 40) {
    alerts.push({ type: "erosion", severity: avg < 25 ? "critical" : "high", description: `Average network trust (${avg.toFixed(0)}) below healthy threshold (40)`, metric: avg, threshold: 40 });
  }

  // Manipulation: suspiciously low variance with many nodes
  if (stdDev < 3 && scores.length > 5) {
    alerts.push({ type: "manipulation", severity: "high", description: `Trust scores suspiciously uniform (σ=${stdDev.toFixed(1)}) across ${scores.length} nodes`, metric: stdDev, threshold: 3 });
  }

  // Cross-border imbalance
  const regionScores: Record<string, number[]> = {};
  for (const n of nodes ?? []) {
    const r = n.region_id ?? "unknown";
    if (!regionScores[r]) regionScores[r] = [];
    regionScores[r].push(n.node_trust_score ?? 0);
  }
  const regionAvgs = Object.values(regionScores).map((s) => s.reduce((a, b) => a + b, 0) / s.length);
  if (regionAvgs.length > 1) {
    const maxRegion = Math.max(...regionAvgs);
    const minRegion = Math.min(...regionAvgs);
    if (maxRegion - minRegion > 30) {
      alerts.push({ type: "cross_border_imbalance", severity: "medium", description: `Regional trust gap of ${(maxRegion - minRegion).toFixed(0)} between highest and lowest regions`, metric: maxRegion - minRegion, threshold: 30 });
    }
  }

  // Governance trust decline
  const { data: profiles } = await (supabase as any).from("sovereignty_profiles").select("governance_participation_score");
  const avgGov = (profiles ?? []).length > 0 ? (profiles ?? []).reduce((s: number, p: any) => s + (p.governance_participation_score ?? 0), 0) / profiles.length : 50;
  if (avgGov < 30) {
    alerts.push({ type: "governance_decline", severity: "medium", description: `Governance participation (${avgGov.toFixed(0)}) below healthy threshold`, metric: avgGov, threshold: 30 });
  }

  const driftScore = Math.min(100, alerts.reduce((s, a) => s + (a.severity === "critical" ? 30 : a.severity === "high" ? 20 : 10), 0));

  log.info("Trust drift detection complete", { alerts: alerts.length, driftScore });
  return { alerts, overallDriftScore: driftScore, timestamp: new Date().toISOString() };
}
