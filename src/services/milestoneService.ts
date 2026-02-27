/**
 * Milestone Service — orchestrates milestone approval + release flow.
 * Uses server-side atomic DB function for the release transaction.
 */

import { supabase } from "@/integrations/supabase/client";
import { milestoneRepo, type MilestoneRecord } from "@/repositories/milestoneRepo";
import { financialMonitor } from "@/monitoring/financialMonitor";
import { NotFoundError, ConflictError, FinancialInvariantError } from "@/lib/core/errors";
import { validateUUID } from "@/lib/core/productionHardening";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("milestoneService");

export const milestoneService = {
  async getMilestonesByDeal(dealId: string): Promise<MilestoneRecord[]> {
    validateUUID(dealId, "dealId");
    return milestoneRepo.findByDealId(dealId);
  },

  /**
   * Approve a milestone and release escrow funds — single atomic DB transaction.
   * Handles: escrow update, wallet transfers, ledger entries, milestone status, audit log.
   */
  async approveAndRelease(
    milestoneId: string,
    sponsorId: string,
    idempotencyKey: string
  ): Promise<{ milestone: MilestoneRecord; escrowId: string }> {
    validateUUID(milestoneId, "milestoneId");
    validateUUID(sponsorId, "sponsorId");

    log.info("Approving and releasing milestone", { milestoneId, sponsorId });

    const { data, error } = await supabase.rpc("release_milestone_atomic" as any, {
      p_milestone_id: milestoneId,
      p_sponsor_id: sponsorId,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      log.error("Milestone approve+release failed", error);
      const msg = error.message || "";
      if (msg.includes("already released")) throw new ConflictError(msg);
      if (msg.includes("must be in submitted")) throw new ConflictError(msg);
      if (msg.includes("exceeds")) throw new FinancialInvariantError(msg);
      if (msg.includes("Only sponsor")) throw new ConflictError(msg);
      if (msg.includes("not found")) throw new NotFoundError("Milestone", milestoneId);
      throw new Error(msg);
    }

    const result = data as any;
    financialMonitor.emit("milestone.released", {
      milestoneId,
      escrowId: result.escrow_id,
      amount: result.amount,
    });

    // Fetch updated milestone
    const milestone = await milestoneRepo.findById(milestoneId);
    if (!milestone) throw new NotFoundError("Milestone", milestoneId);

    return { milestone, escrowId: result.escrow_id };
  },
};
