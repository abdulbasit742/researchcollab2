/**
 * Job Queue — background task processing with retry, scheduling, and worker isolation.
 *
 * Used for: metric recompute, macro aggregation, notification batching, email dispatch.
 */

export type JobType =
  | "metric_recompute"
  | "macro_aggregation"
  | "email_dispatch"
  | "notification_batch"
  | "trust_decay"
  | "escrow_reconciliation"
  | "snapshot_capture"
  | "cleanup";

interface Job {
  id: string;
  type: JobType;
  payload: Record<string, any>;
  status: "queued" | "processing" | "completed" | "failed" | "dead";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
  scheduledFor?: string;
  priority: number;
}

const MAX_QUEUE_SIZE = 10000;
const DEFAULT_MAX_RETRIES = 3;
const queue: Job[] = [];
const completedJobs: Job[] = [];
let isProcessing = false;

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function enqueue(
  type: JobType,
  payload: Record<string, any> = {},
  options: { maxRetries?: number; scheduledFor?: string; priority?: number } = {}
): Job {
  if (queue.length >= MAX_QUEUE_SIZE) {
    throw new Error("Job queue is full");
  }

  const job: Job = {
    id: generateJobId(),
    type,
    payload,
    status: "queued",
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: options.maxRetries ?? DEFAULT_MAX_RETRIES,
    scheduledFor: options.scheduledFor,
    priority: options.priority ?? 5,
  };

  queue.push(job);
  queue.sort((a, b) => a.priority - b.priority);

  // Auto-start processing
  if (!isProcessing) processNext();

  return job;
}

async function processNext(): Promise<void> {
  if (isProcessing) return;

  const now = new Date().toISOString();
  const jobIndex = queue.findIndex(
    j => j.status === "queued" && (!j.scheduledFor || j.scheduledFor <= now)
  );

  if (jobIndex === -1) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const job = queue[jobIndex];
  job.status = "processing";
  job.startedAt = new Date().toISOString();

  try {
    await executeJob(job);
    job.status = "completed";
    job.completedAt = new Date().toISOString();
  } catch (err) {
    job.retryCount++;
    if (job.retryCount >= job.maxRetries) {
      job.status = "dead";
      job.error = err instanceof Error ? err.message : String(err);
    } else {
      job.status = "queued";
      job.error = err instanceof Error ? err.message : String(err);
    }
  }

  // Move completed/dead jobs
  if (job.status === "completed" || job.status === "dead") {
    queue.splice(jobIndex, 1);
    completedJobs.push(job);
    if (completedJobs.length > 500) completedJobs.shift();
  }

  isProcessing = false;

  // Continue processing
  if (queue.some(j => j.status === "queued")) {
    setTimeout(() => processNext(), 100);
  }
}

async function executeJob(job: Job): Promise<void> {
  // Job execution is a no-op placeholder in client-side context.
  // In production, these would dispatch to edge functions or server workers.
  const delay = Math.min(job.retryCount * 1000, 5000);
  await new Promise(r => setTimeout(r, delay));
}

export function getQueueStatus() {
  return {
    queued: queue.filter(j => j.status === "queued").length,
    processing: queue.filter(j => j.status === "processing").length,
    total: queue.length,
    completed: completedJobs.filter(j => j.status === "completed").length,
    dead: completedJobs.filter(j => j.status === "dead").length,
  };
}

export function getJob(jobId: string): Job | undefined {
  return queue.find(j => j.id === jobId) ?? completedJobs.find(j => j.id === jobId);
}

export function getDeadJobs(): Job[] {
  return completedJobs.filter(j => j.status === "dead");
}

export function retryDeadJob(jobId: string): boolean {
  const idx = completedJobs.findIndex(j => j.id === jobId && j.status === "dead");
  if (idx === -1) return false;

  const job = completedJobs.splice(idx, 1)[0];
  job.status = "queued";
  job.retryCount = 0;
  job.error = undefined;
  queue.push(job);
  if (!isProcessing) processNext();
  return true;
}
