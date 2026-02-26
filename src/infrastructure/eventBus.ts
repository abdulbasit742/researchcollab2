/**
 * Event Bus — publish/subscribe architecture for decoupled system events.
 *
 * Features: async processing, retry with exponential backoff, dead-letter queue.
 */

export type EventName =
  | "DealCompleted"
  | "DisputeFiled"
  | "ProfileUpdated"
  | "CapitalApproved"
  | "EscrowReleased"
  | "EscrowFunded"
  | "MilestoneReleased"
  | "TrustUpdated"
  | "FraudDetected"
  | "MatchGenerated"
  | "AdvanceRequested"
  | "RepaymentProcessed"
  | "SubscriptionChanged"
  | "InstitutionOnboarded";

interface EventPayload {
  eventId: string;
  eventName: EventName;
  timestamp: string;
  data: Record<string, any>;
  retryCount: number;
}

type EventHandler = (payload: EventPayload) => Promise<void>;

interface DeadLetterEntry {
  event: EventPayload;
  error: string;
  failedAt: string;
}

const MAX_RETRIES = 3;
const subscribers = new Map<EventName, EventHandler[]>();
const deadLetterQueue: DeadLetterEntry[] = [];
const eventLog: EventPayload[] = [];

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function subscribe(eventName: EventName, handler: EventHandler): () => void {
  const handlers = subscribers.get(eventName) ?? [];
  handlers.push(handler);
  subscribers.set(eventName, handlers);

  // Return unsubscribe function
  return () => {
    const current = subscribers.get(eventName) ?? [];
    subscribers.set(eventName, current.filter(h => h !== handler));
  };
}

export async function publish(eventName: EventName, data: Record<string, any>): Promise<void> {
  const payload: EventPayload = {
    eventId: generateEventId(),
    eventName,
    timestamp: new Date().toISOString(),
    data,
    retryCount: 0,
  };

  eventLog.push(payload);
  if (eventLog.length > 1000) eventLog.shift();

  const handlers = subscribers.get(eventName) ?? [];

  // Execute all handlers concurrently
  await Promise.allSettled(
    handlers.map(handler => executeWithRetry(handler, payload))
  );
}

async function executeWithRetry(handler: EventHandler, payload: EventPayload): Promise<void> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      payload.retryCount = attempt;
      await handler(payload);
      return;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        deadLetterQueue.push({
          event: payload,
          error: err instanceof Error ? err.message : String(err),
          failedAt: new Date().toISOString(),
        });
        if (deadLetterQueue.length > 500) deadLetterQueue.shift();
      } else {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      }
    }
  }
}

export function getDeadLetterQueue(): DeadLetterEntry[] {
  return [...deadLetterQueue];
}

export function getRecentEvents(limit = 50): EventPayload[] {
  return eventLog.slice(-limit);
}

export function getSubscriberCount(eventName: EventName): number {
  return (subscribers.get(eventName) ?? []).length;
}

export function clearDeadLetterQueue(): number {
  const count = deadLetterQueue.length;
  deadLetterQueue.length = 0;
  return count;
}
