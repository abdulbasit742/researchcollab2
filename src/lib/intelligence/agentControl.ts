/**
 * AI Agent Control & Orchestration Service
 * Additive layer — does NOT mutate core financial/trust systems.
 */
import { supabase } from "@/integrations/supabase/client";

// ── Agent Registry ──

export async function getAgentRegistry() {
  const { data, error } = await (supabase as any)
    .from("aian_agent_registry")
    .select("*")
    .order("agent_name");
  if (error) throw error;
  return data ?? [];
}

export async function getAgent(agentKey: string) {
  const { data, error } = await (supabase as any)
    .from("aian_agent_registry")
    .select("*")
    .eq("agent_key", agentKey)
    .single();
  if (error) throw error;
  return data;
}

export async function updateAgentStatus(agentKey: string, status: string) {
  const { data, error } = await (supabase as any)
    .from("aian_agent_registry")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("agent_key", agentKey)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAgentConfig(agentKey: string, config: Record<string, unknown>) {
  const { data, error } = await (supabase as any)
    .from("aian_agent_registry")
    .update({ config, updated_at: new Date().toISOString() })
    .eq("agent_key", agentKey)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Task Queue ──

export async function getTaskQueue(filters?: { status?: string; agent_key?: string }) {
  let q = (supabase as any)
    .from("aian_task_queue")
    .select("*")
    .order("created_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.agent_key) q = q.eq("agent_key", filters.agent_key);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function createTask(input: {
  agent_key: string;
  task_type: string;
  priority?: string;
  payload?: Record<string, unknown>;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await (supabase as any)
    .from("aian_task_queue")
    .insert({ ...input, created_by: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Agent Signals ──

export async function getAgentSignals(limit = 50) {
  const { data, error } = await (supabase as any)
    .from("aian_agent_signals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function emitSignal(input: {
  source_agent: string;
  target_agent?: string;
  signal_type: string;
  payload?: Record<string, unknown>;
}) {
  const { data, error } = await (supabase as any)
    .from("aian_agent_signals")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Aggregated Control Analytics ──

export async function getControlAnalytics() {
  const [{ data: registry }, { data: tasks }, { data: signals }] = await Promise.all([
    (supabase as any).from("aian_agent_registry").select("*"),
    (supabase as any).from("aian_task_queue").select("status, agent_key, priority").limit(500),
    (supabase as any).from("aian_agent_signals").select("signal_type, source_agent, acknowledged").limit(500),
  ]);

  const agents = registry ?? [];
  const allTasks = tasks ?? [];
  const allSignals = signals ?? [];

  const tasksByStatus: Record<string, number> = {};
  const tasksByAgent: Record<string, number> = {};
  allTasks.forEach((t: any) => {
    tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
    tasksByAgent[t.agent_key] = (tasksByAgent[t.agent_key] || 0) + 1;
  });

  const signalsByType: Record<string, number> = {};
  allSignals.forEach((s: any) => {
    signalsByType[s.signal_type] = (signalsByType[s.signal_type] || 0) + 1;
  });

  return {
    totalAgents: agents.length,
    activeAgents: agents.filter((a: any) => a.status === "active").length,
    pausedAgents: agents.filter((a: any) => a.status === "paused").length,
    totalTasks: allTasks.length,
    pendingTasks: tasksByStatus["pending"] || 0,
    runningTasks: tasksByStatus["running"] || 0,
    completedTasks: tasksByStatus["completed"] || 0,
    failedTasks: tasksByStatus["failed"] || 0,
    totalSignals: allSignals.length,
    unacknowledgedSignals: allSignals.filter((s: any) => !s.acknowledged).length,
    tasksByAgent: Object.entries(tasksByAgent).map(([agent, count]) => ({ agent, count })),
    signalsByType: Object.entries(signalsByType).map(([type, count]) => ({ type, count })),
    totalTasksCompleted: agents.reduce((s: number, a: any) => s + (a.tasks_completed || 0), 0),
    totalErrors: agents.reduce((s: number, a: any) => s + (a.total_errors || 0), 0),
  };
}

export const AGENT_STATUSES = ["active", "paused", "disabled", "error"] as const;
export const TASK_STATUSES = ["pending", "running", "completed", "failed", "cancelled"] as const;
export const TASK_PRIORITIES = ["critical", "high", "medium", "low"] as const;
