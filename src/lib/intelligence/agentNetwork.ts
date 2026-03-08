/**
 * Autonomous AI Agent Network — Service layer.
 * Strictly additive. Does NOT mutate core systems.
 */
import { supabase } from "@/integrations/supabase/client";

// ── Events ──

export async function logPlatformEvent(input: {
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  actor_id?: string;
  institution_id?: string;
  payload?: Record<string, unknown>;
}) {
  const { error } = await (supabase as any).from("aian_events").insert(input);
  if (error) throw error;
}

export async function getRecentEvents(limit = 50) {
  const { data, error } = await (supabase as any).from("aian_events")
    .select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── Agent Runs ──

export async function getAgentRuns(agentType?: string) {
  let q = (supabase as any).from("aian_agent_runs").select("*").order("started_at", { ascending: false });
  if (agentType) q = q.eq("agent_type", agentType);
  const { data, error } = await q.limit(50);
  if (error) throw error;
  return data ?? [];
}

// ── Insights ──

export async function getInsights(filters?: { agentType?: string; priority?: string; isRead?: boolean }) {
  let q = (supabase as any).from("aian_insights").select("*").order("created_at", { ascending: false });
  if (filters?.agentType) q = q.eq("agent_type", filters.agentType);
  if (filters?.priority) q = q.eq("priority", filters.priority);
  if (filters?.isRead !== undefined) q = q.eq("is_read", filters.isRead);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function markInsightRead(id: string) {
  const { error } = await (supabase as any).from("aian_insights").update({ is_read: true }).eq("id", id);
  if (error) throw error;
}

export async function dismissInsight(id: string) {
  const { error } = await (supabase as any).from("aian_insights").update({ is_dismissed: true }).eq("id", id);
  if (error) throw error;
}

// ── Feed Items ──

export async function getMyFeed(userId: string) {
  const { data, error } = await (supabase as any).from("aian_feed_items")
    .select("*").eq("user_id", userId).eq("is_seen", false)
    .order("relevance_score", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function markFeedSeen(id: string) {
  const { error } = await (supabase as any).from("aian_feed_items").update({ is_seen: true }).eq("id", id);
  if (error) throw error;
}

// ── Knowledge Reports ──

export async function getKnowledgeReports(domain?: string) {
  let q = (supabase as any).from("aian_knowledge_reports").select("*").order("created_at", { ascending: false });
  if (domain) q = q.eq("domain", domain);
  const { data, error } = await q.limit(50);
  if (error) throw error;
  return data ?? [];
}

// ── Run Agent ──

export async function runAgent(agentType: string, context?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("aian-orchestrator", {
    body: { agentType, context },
  });
  if (error) throw error;
  return data;
}

// ── Analytics ──

export async function getAIANAnalytics() {
  const [{ data: runs }, { data: insights }, { data: events }] = await Promise.all([
    (supabase as any).from("aian_agent_runs").select("*").limit(500),
    (supabase as any).from("aian_insights").select("*").limit(500),
    (supabase as any).from("aian_events").select("*").limit(500),
  ]);

  const allRuns = runs ?? [];
  const allInsights = insights ?? [];

  const agentMap: Record<string, number> = {};
  allRuns.forEach((r: any) => { agentMap[r.agent_type] = (agentMap[r.agent_type] || 0) + 1; });

  const typeMap: Record<string, number> = {};
  allInsights.forEach((i: any) => { typeMap[i.insight_type] = (typeMap[i.insight_type] || 0) + 1; });

  const priorityMap: Record<string, number> = {};
  allInsights.forEach((i: any) => { priorityMap[i.priority] = (priorityMap[i.priority] || 0) + 1; });

  return {
    totalRuns: allRuns.length,
    totalInsights: allInsights.length,
    totalEvents: (events ?? []).length,
    avgConfidence: allInsights.length > 0 ? Math.round(allInsights.reduce((s: number, i: any) => s + (i.confidence_score || 0), 0) / allInsights.length) : 0,
    unreadInsights: allInsights.filter((i: any) => !i.is_read).length,
    byAgent: Object.entries(agentMap).map(([agent, count]) => ({ agent, count })),
    byType: Object.entries(typeMap).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count })),
    byPriority: Object.entries(priorityMap).map(([priority, count]) => ({ priority, count })),
  };
}

export const AGENT_TYPES = [
  { value: "opportunity_discovery", label: "Opportunity Discovery", icon: "🔍" },
  { value: "talent_matching", label: "Talent Matching", icon: "👥" },
  { value: "growth", label: "Growth Agent", icon: "📈" },
  { value: "sponsor_discovery", label: "Sponsor Discovery", icon: "💰" },
  { value: "market_intelligence", label: "Market Intelligence", icon: "📊" },
  { value: "knowledge_synthesis", label: "Knowledge Synthesis", icon: "🧠" },
  { value: "operator_assistant", label: "Operator Assistant", icon: "🤖" },
];

export const INSIGHT_TYPES = ["opportunity", "collaboration", "talent_match", "growth_action", "sponsor_lead", "market_trend", "knowledge_summary", "anomaly", "recommendation"];
