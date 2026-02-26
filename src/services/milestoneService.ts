/**
 * Milestone Service — orchestrates milestone approval + release flow.
 */

import { milestoneRepo, type MilestoneRecord } from "@/repositories/milestoneRepo";
import { escrowRepo } from "@/repositories/escrowRepo";
import { escrowService } from "@/services/escrowService";
import { financialMonitor } from "@/monitoring/financialMonitor";
import { NotFoundError, ConflictError, FinancialInvariantError } from "@/lib/core/errors";
import { validateUUID, validateMonetaryAmount } from "@/lib/core/productionHardening";

export const milestoneService = {
  async getMilestonesByDeal(dealId: string): Promise<MilestoneRecord[]> {
    validateUUID(dealId, "dealId");
    return milestoneRepo.findByDealId(dealId);
  },

  /**
   * Approve a milestone and release escrow funds.
   * Full flow: validate → approve → release escrow → update milestone.
   */
  async approveAndRelease(
    milestoneId: string,
    sponsorId: string,
    idempotencyKey: string
  ): Promise<{ milestone: MilestoneRecord; escrowId: string }> {
    validateUUID(milestoneId, "milestoneId");
    validateUUID(sponsorId, "sponsorId");

    // 1. Validate milestone
    const milestone = await milestoneRepo.findById(milestoneId);
    if (!milestone) throw new NotFoundError("Milestone", milestoneId);
    if (milestone.status === "released") throw new ConflictError("Milestone already released");
    if (milestone.status !== "submitted") throw new ConflictError(`Cannot approve milestone in "${milestone.status}" status`);

    const amount = validateMonetaryAmount(milestone.amount, "milestone amount");

    // 2. Find escrow
    const escrow = milestone.escrow_id
      ? await escrowRepo.findById(milestone.escrow_id)
      : milestone.deal_id
        ? await escrowRepo.findByDealId(milestone.deal_id)
        : null;

    if (!escrow) throw new NotFoundError("Escrow for milestone");
    if (escrow.sponsor_id !== sponsorId) throw new ConflictError("Only the sponsor can approve releases");

    // 3. Validate escrow has sufficient locked funds
    if (amount > escrow.locked_amount) {
      throw new FinancialInvariantError("Milestone amount exceeds escrow locked funds", {
        milestoneAmount: amount,
        escrowLocked: escrow.locked_amount,
      });
    }

    // 4. Release from escrow (this handles ledger + wallet + invariants)
    await escrowService.releaseMilestone(
      escrow.id,
      amount,
      escrow.recipient_id,
      sponsorId,
      milestoneId,
      idempotencyKey
    );

    // 5. Update milestone status
    const updated = await milestoneRepo.updateStatus(milestoneId, "released", {
      approved_at: new Date().toISOString(),
      approved_by: sponsorId,
      released_at: new Date().toISOString(),
    });

    financialMonitor.emit("milestone.released", { milestoneId, escrowId: escrow.id, amount });

    return { milestone: updated, escrowId: escrow.id };
  },
};
