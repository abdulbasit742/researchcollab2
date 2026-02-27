/**
 * Execution Communication Engine
 * Context-first messaging, priority signaling, anti-spam, and communication analytics.
 * Replaces LinkedIn's cold-spam DM model with execution-linked collaboration infrastructure.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("executionCommunication");

// ─── Context Types ───

export type ThreadContextType = "deal" | "opportunity" | "institutional" | "verified_introduction" | "general";
export type ThreadPriority = "financial_action" | "milestone_pending" | "document_review" | "institutional_escalation" | "informational";
export type IntroductionReason = "collaboration_interest" | "hiring_inquiry" | "institutional_inquiry" | "funding_discussion";

export interface ContextualThreadRequest {
  targetUserId: string;
  contextType: ThreadContextType;
  contextEntityId?: string;
  contextEntityType?: string;
  introductionReason?: IntroductionReason;
  initialMessage: string;
}

export interface CommunicationAnalytics {
  userId: string;
  avgResponseTimeMinutes: number;
  milestoneFeedbackLatencyMinutes: number;
  approvalDelayMinutes: number;
  communicationConsistencyScore: number;
  responsivenessTier: "exceptional" | "responsive" | "standard" | "slow";
}

export interface CommunicationBadge {
  badgeType: string;
  label: string;
  description: string;
  icon: string;
}

// ─── Badge Definitions ───

export const COMMUNICATION_BADGES: CommunicationBadge[] = [
  { badgeType: "high_responsiveness", label: "High Responsiveness", description: "Avg response time under 30 minutes", icon: "⚡" },
  { badgeType: "clear_communicator", label: "Clear Communicator", description: "High communication consistency score", icon: "💬" },
  { badgeType: "milestone_clarity", label: "Milestone Clarity", description: "Fast milestone feedback with clear direction", icon: "🎯" },
  { badgeType: "sponsor_satisfaction", label: "Sponsor Satisfaction", description: "Positive sponsor communication ratings", icon: "⭐" },
];

// ─── Anti-Spam Validation ───

const SPAM_PATTERNS = [
  /^hi\s*(sir|ma'?am|dear)/i,
  /i\s+saw\s+your\s+profile/i,
  /please\s+accept\s+my\s+(connection|request)/i,
  /kindly\s+revert/i,
  /do\s+the\s+needful/i,
];

export function validateMessageContext(request: ContextualThreadRequest): { valid: boolean; reason?: string } {
  // Require context type
  if (request.contextType === "general") {
    return { valid: false, reason: "Messages must have a specific context (deal, opportunity, institutional, or verified introduction)" };
  }

  // Verified introductions need a reason
  if (request.contextType === "verified_introduction" && !request.introductionReason) {
    return { valid: false, reason: "Introductions require a reason: collaboration, hiring, institutional, or funding" };
  }

  // Deal/opportunity context needs entity ID
  if ((request.contextType === "deal" || request.contextType === "opportunity") && !request.contextEntityId) {
    return { valid: false, reason: "Deal and opportunity conversations must reference a specific project" };
  }

  // Check for spam patterns
  if (SPAM_PATTERNS.some((p) => p.test(request.initialMessage))) {
    return { valid: false, reason: "Message content does not meet professional communication standards" };
  }

  // Minimum message quality
  if (request.initialMessage.trim().length < 20) {
    return { valid: false, reason: "Initial message must be substantive (minimum 20 characters)" };
  }

  return { valid: true };
}

// ─── Contextual Thread Creation ───

export async function createContextualThread(
  userId: string,
  request: ContextualThreadRequest
): Promise<{ threadId: string } | { error: string }> {
  const validation = validateMessageContext(request);
  if (!validation.valid) {
    return { error: validation.reason! };
  }

  // Check rate limit: max 10 new threads per day
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("message_threads")
    .select("id", { count: "exact", head: true })
    .eq("user_a", userId)
    .gte("created_at", dayAgo);

  if ((count ?? 0) >= 10) {
    return { error: "Daily conversation limit reached (10 per day). This prevents spam and ensures quality communication." };
  }

  // Check existing thread
  const { data: existing } = await supabase
    .from("message_threads")
    .select("id")
    .or(`and(user_a.eq.${userId},user_b.eq.${request.targetUserId}),and(user_a.eq.${request.targetUserId},user_b.eq.${userId})`)
    .maybeSingle();

  if (existing) {
    return { threadId: existing.id };
  }

  // Create thread with context
  const { data: thread, error } = await supabase
    .from("message_threads")
    .insert({
      user_a: userId,
      user_b: request.targetUserId,
      context_type: request.contextType,
      context_entity_id: request.contextEntityId,
      context_entity_type: request.contextEntityType,
      introduction_reason: request.introductionReason,
      priority: determinePriority(request.contextType),
    } as any)
    .select("id")
    .single();

  if (error) {
    log.warn("Failed to create contextual thread", { error: error.message });
    return { error: "Failed to create conversation" };
  }

  // Send initial message
  await supabase.from("messages").insert({
    thread_id: thread.id,
    sender_id: userId,
    body: request.initialMessage,
    type: "contextual",
    metadata: {
      context_type: request.contextType,
      introduction_reason: request.introductionReason,
      context_entity_id: request.contextEntityId,
    },
  });

  await supabase.from("message_threads").update({
    last_message_at: new Date().toISOString(),
    last_message_text: request.initialMessage.substring(0, 100),
  } as any).eq("id", thread.id);

  log.info("Contextual thread created", { contextType: request.contextType, threadId: thread.id });

  return { threadId: thread.id };
}

function determinePriority(contextType: ThreadContextType): ThreadPriority {
  switch (contextType) {
    case "deal": return "milestone_pending";
    case "opportunity": return "informational";
    case "institutional": return "institutional_escalation";
    case "verified_introduction": return "informational";
    default: return "informational";
  }
}

// ─── Thread Priority Update ───

export async function updateThreadPriority(threadId: string, priority: ThreadPriority): Promise<void> {
  await supabase.from("message_threads").update({ priority } as any).eq("id", threadId);
  log.info("Thread priority updated", { threadId, priority });
}

// ─── Communication Analytics ───

export async function calculateCommunicationAnalytics(userId: string): Promise<CommunicationAnalytics> {
  // Get threads where user is participant
  const { data: threads } = await supabase
    .from("message_threads")
    .select("id")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);

  const threadIds = (threads ?? []).map((t) => t.id);

  if (threadIds.length === 0) {
    return {
      userId,
      avgResponseTimeMinutes: 0,
      milestoneFeedbackLatencyMinutes: 0,
      approvalDelayMinutes: 0,
      communicationConsistencyScore: 50,
      responsivenessTier: "standard",
    };
  }

  // Get messages to calculate response times
  const { data: messages } = await supabase
    .from("messages")
    .select("sender_id, created_at, thread_id")
    .in("thread_id", threadIds.slice(0, 50))
    .order("created_at", { ascending: true })
    .limit(500);

  // Calculate average response time
  let totalResponseTime = 0;
  let responseCount = 0;

  const groupedByThread = new Map<string, typeof messages>();
  for (const msg of messages ?? []) {
    const list = groupedByThread.get(msg.thread_id) ?? [];
    list.push(msg);
    groupedByThread.set(msg.thread_id, list);
  }

  for (const [, threadMsgs] of groupedByThread) {
    if (!threadMsgs) continue;
    for (let i = 1; i < threadMsgs.length; i++) {
      const prev = threadMsgs[i - 1];
      const curr = threadMsgs[i];
      if (prev.sender_id !== userId && curr.sender_id === userId) {
        const diff = (new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime()) / 60000;
        if (diff < 1440) { // only count if within 24 hours
          totalResponseTime += diff;
          responseCount++;
        }
      }
    }
  }

  const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

  const consistencyScore = Math.min(100, Math.round(
    (avgResponseTime <= 30 ? 90 : avgResponseTime <= 120 ? 70 : avgResponseTime <= 480 ? 50 : 30) +
    Math.min(10, threadIds.length)
  ));

  const tier = avgResponseTime <= 30 ? "exceptional" as const :
    avgResponseTime <= 120 ? "responsive" as const :
    avgResponseTime <= 480 ? "standard" as const : "slow" as const;

  log.info("Communication analytics calculated", { userId, avgResponseTime, tier });

  return {
    userId,
    avgResponseTimeMinutes: avgResponseTime,
    milestoneFeedbackLatencyMinutes: 0, // requires milestone-specific tracking
    approvalDelayMinutes: 0,
    communicationConsistencyScore: consistencyScore,
    responsivenessTier: tier,
  };
}

// ─── Dispute Prevention ───

export interface DisputePreventionSignal {
  threadId: string;
  signalType: "delayed_response" | "budget_renegotiation" | "document_rejection" | "tone_conflict";
  severity: "low" | "medium" | "high";
}

export async function detectDisputeSignals(threadId: string): Promise<DisputePreventionSignal[]> {
  const signals: DisputePreventionSignal[] = [];

  // Check for delayed responses (no reply in 72+ hours)
  const { data: messages } = await supabase
    .from("messages")
    .select("sender_id, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (messages && messages.length >= 2) {
    const latest = messages[0];
    const previous = messages[1];
    if (latest.sender_id === previous.sender_id) {
      const gap = (new Date(latest.created_at).getTime() - new Date(previous.created_at).getTime()) / (1000 * 60 * 60);
      if (gap > 72) {
        signals.push({
          threadId,
          signalType: "delayed_response",
          severity: gap > 168 ? "high" : "medium",
        });
      }
    }
  }

  // Log detected signals
  for (const signal of signals) {
    await supabase.from("dispute_prevention_signals").insert({
      thread_id: signal.threadId,
      signal_type: signal.signalType,
      severity: signal.severity,
    } as any);
  }

  if (signals.length > 0) {
    log.warn("Dispute prevention signals detected", { threadId, count: signals.length });
  }

  return signals;
}

// ─── Structured Negotiation ───

export interface NegotiationProposal {
  threadId: string;
  scopeSummary: string;
  budgetProposed: number;
  timelineProposed: string;
  riskDisclosures: string[];
}

export async function createNegotiationRecord(
  userId: string,
  targetUserId: string,
  proposal: NegotiationProposal
): Promise<string> {
  const { data, error } = await supabase
    .from("negotiation_records")
    .insert({
      thread_id: proposal.threadId,
      initiator_id: userId,
      respondent_id: targetUserId,
      scope_summary: proposal.scopeSummary,
      budget_proposed: proposal.budgetProposed,
      timeline_proposed: proposal.timelineProposed,
      risk_disclosures: proposal.riskDisclosures,
    })
    .select("id")
    .single();

  if (error) throw error;

  log.info("Negotiation record created", { threadId: proposal.threadId, id: data.id });

  return data.id;
}
