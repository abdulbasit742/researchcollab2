/**
 * Edge Orchestrator — schedules and manages heavy computations on edge nodes.
 *
 * Tasks: trust recomputation, fraud detection, matching, macro aggregation.
 * Provides failover retry, rate limiting, and task tracking.
 */

import { supabase } from "@/integrations/supabase/client";

export type EdgeTask = "trust_recompute" | "fraud_detection" | "match_generation" | "macro_aggregation" | "metric_snapshot";

interface TaskResult {
  taskId: string;
  task: EdgeTask;
  status: "queued" | "running" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  error?: string;
  retryCount: number;
}

const MAX_RETRIES = 3;
const taskRegistry = new Map<string, TaskResult>();
const rateLimitMap = new Map<EdgeTask, { lastRun: number; minIntervalMs: number }>();

// Rate limits per task type (ms)
const RATE_LIMITS: Record<EdgeTask, number> = {
  trust_recompute: 30000,
  fraud_detection: 60000,
  match_generation: 15000,
  macro_aggregation: 300000,
  metric_snapshot: 60000,
};

function generateTaskId(): string {
  return `edge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function isRateLimited(task: EdgeTask): boolean {
  const entry = rateLimitMap.get(task);
  if (!entry) return false;
  return Date.now() - entry.lastRun < entry.minIntervalMs;
}

export async function scheduleEdgeTask(
  task: EdgeTask,
  payload: Record<string, any> = {},
  options: { skipRateLimit?: boolean } = {}
): Promise<TaskResult> {
  if (!options.skipRateLimit && isRateLimited(task)) {
    return {
      taskId: "",
      task,
      status: "failed",
      error: `Rate limited. Min interval: ${RATE_LIMITS[task]}ms`,
      retryCount: 0,
    };
  }

  const taskId = generateTaskId();
  const result: TaskResult = {
    taskId,
    task,
    status: "queued",
    retryCount: 0,
  };

  taskRegistry.set(taskId, result);
  rateLimitMap.set(task, { lastRun: Date.now(), minIntervalMs: RATE_LIMITS[task] });

  // Execute asynchronously
  executeTask(taskId, task, payload).catch(() => {});

  return result;
}

async function executeTask(taskId: string, task: EdgeTask, payload: Record<string, any>) {
  const result = taskRegistry.get(taskId);
  if (!result) return;

  result.status = "running";
  result.startedAt = new Date().toISOString();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await invokeEdgeFunction(task, payload);
      result.status = "completed";
      result.completedAt = new Date().toISOString();
      result.retryCount = attempt;
      return;
    } catch (err) {
      result.retryCount = attempt;
      if (attempt === MAX_RETRIES) {
        result.status = "failed";
        result.error = err instanceof Error ? err.message : String(err);
      } else {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }
}

async function invokeEdgeFunction(task: EdgeTask, payload: Record<string, any>) {
  const functionMap: Record<EdgeTask, string> = {
    trust_recompute: "compute-intelligence",
    fraud_detection: "compute-intelligence",
    match_generation: "compute-intelligence",
    macro_aggregation: "compute-intelligence",
    metric_snapshot: "execution-health-monitor",
  };

  const { error } = await supabase.functions.invoke(functionMap[task], {
    body: { task, ...payload },
  });

  if (error) throw error;
}

export function getTaskStatus(taskId: string): TaskResult | undefined {
  return taskRegistry.get(taskId);
}

export function getActiveTaskCount(): number {
  let count = 0;
  for (const task of taskRegistry.values()) {
    if (task.status === "queued" || task.status === "running") count++;
  }
  return count;
}
