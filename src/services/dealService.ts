/**
 * Deal Service — orchestrates deal lifecycle with state machine enforcement.
 */

import { dealRepo, type DealRecord } from "@/repositories/dealRepo";
import { validateDealTransition } from "@/lib/deals/dealLifecycle";
import { financialMonitor } from "@/monitoring/financialMonitor";
import { NotFoundError, ConflictError } from "@/lib/core/errors";
import { validateUUID } from "@/lib/core/productionHardening";

export const dealService = {
  async getDeal(dealId: string): Promise<DealRecord> {
    validateUUID(dealId, "dealId");
    const deal = await dealRepo.findById(dealId);
    if (!deal) throw new NotFoundError("Deal", dealId);
    return deal;
  },

  async transitionState(dealId: string, nextState: string, actorId: string): Promise<DealRecord> {
    validateUUID(dealId, "dealId");
    validateUUID(actorId, "actorId");

    const deal = await dealRepo.findById(dealId);
    if (!deal) throw new NotFoundError("Deal", dealId);

    // Verify actor is participant
    if (deal.buyer_id !== actorId && deal.seller_id !== actorId) {
      throw new ConflictError("Only deal participants can transition state");
    }

    // Validate transition
    validateDealTransition(deal.status, nextState);

    const extra: Record<string, unknown> = {};
    if (nextState === "completed") extra.completed_at = new Date().toISOString();

    const updated = await dealRepo.updateStatus(dealId, nextState, extra);

    financialMonitor.emit("deal.transitioned", { dealId, from: deal.status, to: nextState });

    return updated;
  },

  async getDealsForUser(userId: string): Promise<DealRecord[]> {
    validateUUID(userId, "userId");
    return dealRepo.findByParticipant(userId);
  },
};
