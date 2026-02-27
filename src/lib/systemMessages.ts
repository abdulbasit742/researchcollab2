/**
 * System message generator — creates system messages for execution events.
 * All system messages go through the send_system_message RPC.
 */

import { supabase } from "@/integrations/supabase/client";

type SystemEvent =
  | "milestone_submitted"
  | "milestone_approved"
  | "milestone_rejected"
  | "escrow_funded"
  | "dispute_opened"
  | "dispute_resolved"
  | "trust_updated"
  | "institution_verified"
  | "document_uploaded";

const EVENT_MESSAGES: Record<SystemEvent, (meta?: Record<string, any>) => string> = {
  milestone_submitted: (m) => `📋 Milestone "${m?.title || "Untitled"}" has been submitted for review.`,
  milestone_approved: (m) => `✅ Milestone "${m?.title || "Untitled"}" has been approved. Funds released.`,
  milestone_rejected: (m) => `❌ Milestone "${m?.title || "Untitled"}" has been rejected.`,
  escrow_funded: (m) => `💰 Escrow funded: ${m?.amount ? `$${m.amount}` : "amount confirmed"}. Project is now active.`,
  dispute_opened: () => `⚠️ A dispute has been opened. Escrow funds are frozen until resolution.`,
  dispute_resolved: (m) => `🔓 Dispute resolved: ${m?.resolution || "see details"}.`,
  trust_updated: (m) => `📊 Trust score updated: ${m?.delta > 0 ? "+" : ""}${m?.delta || 0} points.`,
  institution_verified: (m) => `🏛 Institutional verification completed by ${m?.institution || "institution"}.`,
  document_uploaded: (m) => `📎 New document uploaded: "${m?.fileName || "file"}".`,
};

export async function emitSystemMessage(
  threadId: string,
  event: SystemEvent,
  metadata?: Record<string, any>
) {
  const body = EVENT_MESSAGES[event](metadata);
  const { data, error } = await supabase.rpc("send_system_message" as any, {
    p_thread_id: threadId,
    p_body: body,
    p_metadata: { event, ...(metadata || {}) },
  });
  if (error) {
    console.error("System message failed:", error);
  }
  return data;
}
