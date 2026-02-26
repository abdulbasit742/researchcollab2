/**
 * Deal Controller — thin layer for deal operations.
 */

import { dealService } from "@/services/dealService";
import { errorToSafeResponse } from "@/api/middleware/errorHandler";

export const dealController = {
  async getDeal(dealId: string) {
    try {
      const deal = await dealService.getDeal(dealId);
      return { success: true, data: deal };
    } catch (error) {
      return errorToSafeResponse(error);
    }
  },

  async transitionState(dealId: string, nextState: string, actorId: string) {
    try {
      const deal = await dealService.transitionState(dealId, nextState, actorId);
      return { success: true, data: deal };
    } catch (error) {
      return errorToSafeResponse(error);
    }
  },

  async getUserDeals(userId: string) {
    try {
      const deals = await dealService.getDealsForUser(userId);
      return { success: true, data: deals };
    } catch (error) {
      return errorToSafeResponse(error);
    }
  },
};
