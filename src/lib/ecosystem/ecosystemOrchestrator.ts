/**
 * Ecosystem Orchestration Service — coordinates all RCollab additive systems.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Event Stream ───
export async function logEcosystemEvent(params: {
  event_type: string;
  source_system: string;
  entity_type?: string;
  entity_id?: string;
  actor_id?: string;
  payload?: Record<string, any>;
  priority?: string;
}) {
  const { error } = await supabase.from("eco_events").insert([params]);
  if (error) throw error;
}

export async function getEcosystemEvents(filters?: {
  source_system?: string;
  event_type?: string;
  limit?: number;
}) {
  let q = supabase.from("eco_events").select("*").order("created_at", { ascending: false });
  if (filters?.source_system) q = q.eq("source_system", filters.source_system);
  if (filters?.event_type) q = q.eq("event_type", filters.event_type);
  q = q.limit(filters?.limit ?? 50);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Signals ───
export async function getOpportunitySignals(filters?: { signal_type?: string; status?: string }) {
  let q = supabase.from("eco_signals").select("*").order("created_at", { ascending: false }).limit(50);
  if (filters?.signal_type) q = q.eq("signal_type", filters.signal_type);
  if (filters?.status) q = q.eq("status", filters.status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createSignal(params: {
  signal_type: string;
  title: string;
  description?: string;
  confidence_score?: number;
  priority?: string;
  metadata?: Record<string, any>;
}) {
  const { error } = await supabase.from("eco_signals").insert([params]);
  if (error) throw error;
}

// ─── Collaboration Recommendations ───
export async function getCollaborationRecs(status?: string) {
  let q = supabase.from("eco_collaboration_recs").select("*").order("match_score", { ascending: false }).limit(30);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function updateCollaborationRec(id: string, action: "accept" | "dismiss") {
  const update = action === "accept" ? { status: "accepted", accepted_at: new Date().toISOString() } : { status: "dismissed", dismissed_at: new Date().toISOString() };
  const { error } = await supabase.from("eco_collaboration_recs").update(update).eq("id", id);
  if (error) throw error;
}

// ─── Health Snapshots ───
export async function getHealthSnapshots(limit = 30) {
  const { data, error } = await supabase.from("eco_health_snapshots").select("*").order("snapshot_date", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ─── Revenue Analytics ───
export async function getRevenueAnalytics(period?: string) {
  let q = supabase.from("eco_revenue_analytics").select("*").order("created_at", { ascending: false }).limit(50);
  if (period) q = q.eq("period", period);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Strategic Reports ───
export async function getStrategicReports(limit = 10) {
  const { data, error } = await supabase.from("eco_strategic_reports").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ─── AI Orchestration ───
export async function invokeOrchestrator(action: string, payload: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke("eco-orchestrator", {
    body: { action, payload },
  });
  if (error) throw error;
  return data?.result ?? data;
}

// ─── Dashboard Aggregation ───
export async function getEcosystemDashboard() {
  const [events, signals, recs, health, revenue, reports] = await Promise.all([
    getEcosystemEvents({ limit: 20 }),
    getOpportunitySignals({ status: "active" }),
    getCollaborationRecs("pending"),
    getHealthSnapshots(7),
    getRevenueAnalytics(),
    getStrategicReports(3),
  ]);

  const eventsBySource: Record<string, number> = {};
  events.forEach((e: any) => { eventsBySource[e.source_system] = (eventsBySource[e.source_system] ?? 0) + 1; });

  const signalsByType: Record<string, number> = {};
  signals.forEach((s: any) => { signalsByType[s.signal_type] = (signalsByType[s.signal_type] ?? 0) + 1; });

  const totalRevenue = revenue.reduce((s: number, r: any) => s + (r.amount ?? 0), 0);

  return {
    recentEvents: events,
    activeSignals: signals,
    pendingCollaborations: recs,
    healthTrend: health,
    revenueBreakdown: revenue,
    strategicReports: reports,
    summary: {
      eventsBySource,
      signalsByType,
      totalRevenue,
      latestHealthScore: health[0]?.overall_health_score ?? 0,
      pendingCollabCount: recs.length,
    },
  };
}
