/**
 * Milestone Controller — thin layer for milestone operations.
 */

import { milestoneService } from "@/services/milestoneService";
import { errorToSafeResponse } from "@/api/middleware/errorHandler";

export const milestoneController = {
  async getMilestones(dealId: string) {
    try {
      const milestones = await milestoneService.getMilestonesByDeal(dealId);
      return { success: true, data: milestones };
    } catch (error) {
      return errorToSafeResponse(error);
    }
  },

  async approveAndRelease(milestoneId: string, sponsorId: string, idempotencyKey: string) {
    try {
      const result = await milestoneService.approveAndRelease(milestoneId, sponsorId, idempotencyKey);
      return { success: true, data: result };
    } catch (error) {
      return errorToSafeResponse(error);
    }
  },
};
