/**
 * Escrow Controller — thin request/response layer.
 * No business logic. No financial calculations. No direct DB calls.
 */

import { escrowService } from "@/services/escrowService";
import { escrowRepo } from "@/repositories/escrowRepo";
import { errorToSafeResponse } from "@/api/middleware/errorHandler";
import { validateUUID } from "@/lib/core/productionHardening";

export const escrowController = {
  async fundEscrow(dealId: string, sponsorId: string, idempotencyKey: string) {
    try {
      validateUUID(dealId, "dealId");
      validateUUID(sponsorId, "sponsorId");
      const escrow = await escrowService.fundEscrow(dealId, sponsorId, idempotencyKey);
      return { success: true, data: escrow };
    } catch (error) {
      return errorToSafeResponse(error);
    }
  },

  async releaseMilestone(params: {
    escrowId: string;
    amount: number;
    recipientId: string;
    sponsorId: string;
    milestoneId: string;
    idempotencyKey: string;
  }) {
    try {
      const escrow = await escrowService.releaseMilestone(
        params.escrowId,
        params.amount,
        params.recipientId,
        params.sponsorId,
        params.milestoneId,
        params.idempotencyKey
      );
      return { success: true, data: escrow };
    } catch (error) {
      return errorToSafeResponse(error);
    }
  },

  async refundEscrow(escrowId: string, sponsorId: string, idempotencyKey: string) {
    try {
      const escrow = await escrowService.refund(escrowId, sponsorId, idempotencyKey);
      return { success: true, data: escrow };
    } catch (error) {
      return errorToSafeResponse(error);
    }
  },

  async getEscrow(escrowId: string) {
    try {
      validateUUID(escrowId, "escrowId");
      const escrow = await escrowRepo.findById(escrowId);
      if (!escrow) return { success: false, error: "Escrow not found" };
      return { success: true, data: escrow };
    } catch (error) {
      return errorToSafeResponse(error);
    }
  },
};
