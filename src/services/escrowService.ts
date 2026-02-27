/**
 * Escrow Service — orchestrates escrow lifecycle with full transaction safety.
 * Uses server-side atomic DB functions for financial mutations.
 */

import { supabase } from "@/integrations/supabase/client";
import { escrowRepo, type EscrowRecord } from "@/repositories/escrowRepo";
import { financialMonitor } from "@/monitoring/financialMonitor";
import { ConflictError, NotFoundError, FinancialInvariantError } from "@/lib/core/errors";
import { validateUUID } from "@/lib/core/productionHardening";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("escrowService");

export const escrowService = {
  /**
   * Create and fund an escrow for a deal — runs as single atomic DB transaction.
   */
  async fundEscrow(dealId: string, sponsorId: string, idempotencyKey: string): Promise<EscrowRecord> {
    validateUUID(dealId, "dealId");
    validateUUID(sponsorId, "sponsorId");

    log.info("Funding escrow", { dealId, sponsorId });

    const { data, error } = await supabase.rpc("fund_escrow_atomic" as any, {
      p_deal_id: dealId,
      p_sponsor_id: sponsorId,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      log.error("Escrow funding failed", error);
      const msg = error.message || "";
      if (msg.includes("Insufficient balance")) throw new ConflictError(msg);
      if (msg.includes("already funded")) throw new ConflictError(msg);
      if (msg.includes("not found")) throw new NotFoundError("Deal", dealId);
      if (msg.includes("frozen")) throw new ConflictError(msg);
      if (msg.includes("invariant")) throw new FinancialInvariantError(msg);
      throw new Error(msg);
    }

    const result = data as any;
    financialMonitor.emit("escrow.funded", { escrowId: result.escrow_id, dealId, amount: result.amount });

    // Return full escrow record
    const escrow = await escrowRepo.findById(result.escrow_id);
    if (!escrow) throw new NotFoundError("Escrow", result.escrow_id);
    return escrow;
  },

  /**
   * Release funds from escrow for an approved milestone — atomic DB transaction.
   */
  async releaseMilestone(
    escrowId: string,
    amount: number,
    recipientId: string,
    sponsorId: string,
    milestoneId: string,
    idempotencyKey: string
  ): Promise<EscrowRecord> {
    validateUUID(escrowId, "escrowId");
    validateUUID(sponsorId, "sponsorId");

    log.info("Releasing milestone", { escrowId, milestoneId, amount });

    const { data, error } = await supabase.rpc("release_milestone_atomic" as any, {
      p_milestone_id: milestoneId,
      p_sponsor_id: sponsorId,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      log.error("Milestone release failed", error);
      const msg = error.message || "";
      if (msg.includes("already released")) throw new ConflictError(msg);
      if (msg.includes("exceeds")) throw new FinancialInvariantError(msg);
      if (msg.includes("Only sponsor")) throw new ConflictError(msg);
      throw new Error(msg);
    }

    const result = data as any;
    financialMonitor.emit("escrow.released", { escrowId: result.escrow_id, amount: result.amount, milestoneId });

    const escrow = await escrowRepo.findById(result.escrow_id);
    if (!escrow) throw new NotFoundError("Escrow", result.escrow_id);
    return escrow;
  },

  /**
   * Refund escrow funds back to sponsor — atomic DB transaction.
   */
  async refund(escrowId: string, sponsorId: string, idempotencyKey: string): Promise<EscrowRecord> {
    validateUUID(escrowId, "escrowId");

    log.info("Refunding escrow", { escrowId });

    const { data, error } = await supabase.rpc("refund_escrow_atomic" as any, {
      p_escrow_id: escrowId,
      p_sponsor_id: sponsorId,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      log.error("Escrow refund failed", error);
      const msg = error.message || "";
      if (msg.includes("Cannot refund")) throw new ConflictError(msg);
      if (msg.includes("Nothing to refund")) throw new ConflictError(msg);
      throw new Error(msg);
    }

    const result = data as any;
    financialMonitor.emit("escrow.refunded", { escrowId, amount: result.refunded_amount });

    const escrow = await escrowRepo.findById(escrowId);
    if (!escrow) throw new NotFoundError("Escrow", escrowId);
    return escrow;
  },
};
