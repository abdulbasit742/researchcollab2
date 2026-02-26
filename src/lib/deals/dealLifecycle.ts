/**
 * Deal Lifecycle State Machine — strict state transitions with validation.
 * No state can be skipped. No invalid transition allowed.
 */

import { supabase } from "@/integrations/supabase/client";
import { ConflictError, NotFoundError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("dealLifecycle");

export type DealStatus =
  | "draft"
  | "submitted"
  | "accepted"
  | "escrow_funded"
  | "in_progress"
  | "milestone_submitted"
  | "milestone_approved"
  | "completed"
  | "disputed"
  | "cancelled";

/**
 * Strict transition map — only listed transitions are allowed.
 */
const VALID_DEAL_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  draft:                ["submitted", "cancelled"],
  submitted:            ["accepted", "cancelled"],
  accepted:             ["escrow_funded", "cancelled"],
  escrow_funded:        ["in_progress", "disputed", "cancelled"],
  in_progress:          ["milestone_submitted", "disputed", "cancelled"],
  milestone_submitted:  ["milestone_approved", "in_progress", "disputed"],
  milestone_approved:   ["in_progress", "completed", "disputed"],
  completed:            [],
  disputed:             ["in_progress", "cancelled"],
  cancelled:            [],
};

/**
 * Validate a deal state transition — throws if invalid.
 */
export function validateDealTransition(currentState: string, nextState: string): void {
  const current = currentState as DealStatus;
  const next = nextState as DealStatus;

  const allowed = VALID_DEAL_TRANSITIONS[current];
  if (!allowed) {
    throw new ConflictError(`Unknown deal state: "${currentState}"`);
  }
  if (!allowed.includes(next)) {
    throw new ConflictError(
      `Invalid deal transition: "${currentState}" → "${nextState}". Allowed: ${allowed.join(", ") || "none (terminal state)"}`
    );
  }
}

/**
 * Check if a transition is valid without throwing.
 */
export function isValidTransition(currentState: string, nextState: string): boolean {
  const allowed = VALID_DEAL_TRANSITIONS[currentState as DealStatus];
  if (!allowed) return false;
  return allowed.includes(nextState as DealStatus);
}

/**
 * Get allowed next states for a given deal state.
 */
export function getAllowedTransitions(currentState: string): DealStatus[] {
  return VALID_DEAL_TRANSITIONS[currentState as DealStatus] ?? [];
}

/**
 * Check if a state is terminal (no further transitions possible).
 */
export function isTerminalState(state: string): boolean {
  const allowed = VALID_DEAL_TRANSITIONS[state as DealStatus];
  return allowed !== undefined && allowed.length === 0;
}

/**
 * Transition a deal to a new state — validates, updates DB, logs.
 */
export async function transitionDealState(
  dealId: string,
  nextState: DealStatus,
  actorId: string
): Promise<{ success: boolean; previousState: string; newState: string }> {
  // Fetch current state
  const { data: deal, error } = await supabase
    .from("deal_rooms")
    .select("id, status, buyer_id, seller_id, title")
    .eq("id", dealId)
    .single();

  if (error || !deal) throw new NotFoundError("Deal", dealId);

  const currentState = deal.status;

  // Validate actor is participant
  if (deal.buyer_id !== actorId && deal.seller_id !== actorId) {
    throw new ConflictError("Only deal participants can transition deal state");
  }

  // Validate transition
  validateDealTransition(currentState, nextState);

  // Apply transition
  const updatePayload: Record<string, unknown> = {
    status: nextState,
    updated_at: new Date().toISOString(),
  };
  if (nextState === "completed") {
    updatePayload.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("deal_rooms")
    .update(updatePayload)
    .eq("id", dealId);

  if (updateError) throw updateError;

  // Audit log via state_transition_logs
  await (supabase as any).from("state_transition_logs").insert({
    entity_type: "deal",
    entity_id: dealId,
    from_state: currentState,
    to_state: nextState,
    triggered_by: actorId,
    created_at: new Date().toISOString(),
  }).catch(() => { /* non-critical logging */ });

  log.info("Deal state transitioned", { dealId, from: currentState, to: nextState, actor: actorId });

  return { success: true, previousState: currentState, newState: nextState };
}
