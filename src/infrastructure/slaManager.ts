/**
 * SLA Manager — uptime tracking, response time monitoring,
 * SLO compliance, and monthly report generation.
 */

import { supabase } from "@/integrations/supabase/client";

export interface SLOTarget {
  metric: string;
  target: number;
  unit: string;
  current: number;
  compliant: boolean;
}

export interface SLAReport {
  period: string;
  generatedAt: string;
  uptimePercent: number;
  avgResponseTimeMs: number;
  escrowReliabilityRate: number;
  financialConsistencyRate: number;
  sloTargets: SLOTarget[];
  overallCompliant: boolean;
}

// ─── Health Ping Tracking ───
const healthPings: Array<{ timestamp: string; healthy: boolean; latencyMs: number }> = [];

export function recordHealthPing(healthy: boolean, latencyMs: number) {
  healthPings.push({ timestamp: new Date().toISOString(), healthy, latencyMs });
  if (healthPings.length > 10000) healthPings.shift();
}

// ─── SLO Computation ───
export async function computeSLOs(): Promise<SLOTarget[]> {
  // Uptime
  const recentPings = healthPings.slice(-1000);
  const uptimePercent = recentPings.length > 0
    ? Math.round((recentPings.filter(p => p.healthy).length / recentPings.length) * 10000) / 100
    : 99.9;

  // Average response time
  const avgResponseTime = recentPings.length > 0
    ? Math.round(recentPings.reduce((s, p) => s + p.latencyMs, 0) / recentPings.length)
    : 150;

  // Escrow reliability — completed vs disputed deals
  const { data: deals } = await supabase
    .from("deal_rooms")
    .select("status")
    .in("status", ["completed", "disputed", "cancelled"]);

  const dealList = deals ?? [];
  const completed = dealList.filter(d => d.status === "completed").length;
  const escrowReliability = dealList.length > 0 ? Math.round((completed / dealList.length) * 10000) / 100 : 100;

  // Financial consistency — check wallet reconciliation proxy
  const { data: wallets } = await supabase
    .from("wallets")
    .select("available_balance")
    .lt("available_balance", 0);

  const negativeBalances = wallets?.length ?? 0;
  const financialConsistency = negativeBalances === 0 ? 100 : Math.max(0, 100 - negativeBalances * 10);

  return [
    { metric: "Uptime", target: 99.9, unit: "%", current: uptimePercent, compliant: uptimePercent >= 99.9 },
    { metric: "Avg Response Time", target: 500, unit: "ms", current: avgResponseTime, compliant: avgResponseTime <= 500 },
    { metric: "Escrow Reliability", target: 95, unit: "%", current: escrowReliability, compliant: escrowReliability >= 95 },
    { metric: "Financial Consistency", target: 100, unit: "%", current: financialConsistency, compliant: financialConsistency >= 99 },
  ];
}

// ─── Monthly Report ───
export async function generateSLAReport(period?: string): Promise<SLAReport> {
  const sloTargets = await computeSLOs();

  const uptimeSlo = sloTargets.find(s => s.metric === "Uptime");
  const responseSlo = sloTargets.find(s => s.metric === "Avg Response Time");
  const escrowSlo = sloTargets.find(s => s.metric === "Escrow Reliability");
  const financialSlo = sloTargets.find(s => s.metric === "Financial Consistency");

  return {
    period: period ?? new Date().toISOString().slice(0, 7),
    generatedAt: new Date().toISOString(),
    uptimePercent: uptimeSlo?.current ?? 99.9,
    avgResponseTimeMs: responseSlo?.current ?? 150,
    escrowReliabilityRate: escrowSlo?.current ?? 100,
    financialConsistencyRate: financialSlo?.current ?? 100,
    sloTargets,
    overallCompliant: sloTargets.every(s => s.compliant),
  };
}
