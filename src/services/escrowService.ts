/**
 * Escrow Service — orchestrates escrow lifecycle with full transaction safety.
 * All mutations go through runFinancialOperation for idempotency + audit.
 */

import { escrowRepo, type EscrowRecord } from "@/repositories/escrowRepo";
import { walletRepo } from "@/repositories/walletRepo";
import { ledgerRepo } from "@/repositories/ledgerRepo";
import { dealRepo } from "@/repositories/dealRepo";
import { runFinancialOperation, type TransactionContext } from "@/services/transactionManager";
import { validateEscrowInvariants } from "@/invariants/escrowInvariant";
import { validateWalletInvariants } from "@/invariants/walletInvariant";
import { auditService } from "@/audit/auditService";
import { financialMonitor } from "@/monitoring/financialMonitor";
import { ConflictError, NotFoundError, FinancialInvariantError } from "@/lib/core/errors";
import { validateMonetaryAmount, validateUUID } from "@/lib/core/productionHardening";

export const escrowService = {
  /**
   * Create and fund an escrow for a deal.
   */
  async fundEscrow(dealId: string, sponsorId: string, idempotencyKey: string): Promise<EscrowRecord> {
    validateUUID(dealId, "dealId");
    validateUUID(sponsorId, "sponsorId");

    return runFinancialOperation("escrow.fund", idempotencyKey, async (ctx) => {
      ctx.operations.push("validate_deal");
      const deal = await dealRepo.findById(dealId);
      if (!deal) throw new NotFoundError("Deal", dealId);
      if (deal.buyer_id !== sponsorId) throw new ConflictError("Only the sponsor can fund escrow");
      if (!deal.agreed_amount || deal.agreed_amount <= 0) throw new ConflictError("No agreed amount on deal");

      const amount = validateMonetaryAmount(deal.agreed_amount, "deal amount");

      ctx.operations.push("validate_wallet");
      const wallet = await walletRepo.findByUserId(sponsorId);
      if (!wallet) throw new NotFoundError("Wallet", sponsorId);
      if (wallet.is_frozen) throw new ConflictError("Wallet is frozen");
      if (wallet.available_balance < amount) throw new ConflictError("Insufficient balance");

      // Check existing escrow
      const existing = await escrowRepo.findByDealId(dealId);
      if (existing && existing.status !== "created") throw new ConflictError("Escrow already funded");

      ctx.operations.push("create_escrow");
      const escrow = existing ?? await escrowRepo.create({
        deal_id: dealId,
        sponsor_id: sponsorId,
        recipient_id: deal.seller_id,
        total_amount: amount,
        locked_amount: amount,
        released_amount: 0,
        refunded_amount: 0,
        currency: wallet.currency,
        status: "funded",
      });

      if (existing) {
        await escrowRepo.updateAmounts(escrow.id, { locked_amount: amount, status: "funded" });
      }

      ctx.operations.push("update_wallet");
      await walletRepo.updateBalances(wallet.id, {
        available_balance: wallet.available_balance - amount,
        escrow_balance: wallet.escrow_balance + amount,
      });

      ctx.operations.push("ledger_entry");
      await ledgerRepo.insertDoubleEntry({
        transactionId: ctx.transactionId,
        debitAccountId: wallet.id,
        debitAccountType: "wallet",
        creditAccountId: escrow.id,
        creditAccountType: "escrow",
        amount,
        currency: wallet.currency,
        referenceType: "escrow",
        referenceId: escrow.id,
        description: `Escrow funded for deal ${dealId}`,
      });

      ctx.operations.push("update_deal");
      await dealRepo.updateEscrowState(dealId, "funded", amount);

      ctx.operations.push("validate_invariants");
      const updatedEscrow = await escrowRepo.findById(escrow.id);
      if (updatedEscrow) validateEscrowInvariants(updatedEscrow);

      const updatedWallet = await walletRepo.findByUserId(sponsorId);
      if (updatedWallet) validateWalletInvariants(updatedWallet);

      financialMonitor.emit("escrow.funded", { escrowId: escrow.id, dealId, amount });

      return updatedEscrow ?? escrow;
    });
  },

  /**
   * Release funds from escrow for an approved milestone.
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
    validateUUID(recipientId, "recipientId");
    validateUUID(sponsorId, "sponsorId");
    const releaseAmount = validateMonetaryAmount(amount, "release amount");

    return runFinancialOperation("escrow.releaseMilestone", idempotencyKey, async (ctx) => {
      ctx.operations.push("lock_escrow");
      const escrow = await escrowRepo.findById(escrowId);
      if (!escrow) throw new NotFoundError("Escrow", escrowId);
      if (escrow.sponsor_id !== sponsorId) throw new ConflictError("Only sponsor can release");
      if (!["funded", "locked", "partially_released"].includes(escrow.status)) {
        throw new ConflictError(`Cannot release from status "${escrow.status}"`);
      }
      if (releaseAmount > escrow.locked_amount) {
        throw new FinancialInvariantError("Release amount exceeds locked amount", {
          release: releaseAmount,
          locked: escrow.locked_amount,
        });
      }

      ctx.operations.push("update_escrow");
      const newLocked = escrow.locked_amount - releaseAmount;
      const newReleased = escrow.released_amount + releaseAmount;
      const newStatus = newLocked === 0 ? "completed" : "partially_released";

      await escrowRepo.updateAmounts(escrowId, {
        locked_amount: newLocked,
        released_amount: newReleased,
        status: newStatus,
      });

      ctx.operations.push("update_sponsor_wallet");
      const sponsorWallet = await walletRepo.findByUserId(sponsorId);
      if (!sponsorWallet) throw new NotFoundError("Sponsor wallet");
      await walletRepo.updateBalances(sponsorWallet.id, {
        escrow_balance: sponsorWallet.escrow_balance - releaseAmount,
      });

      ctx.operations.push("update_recipient_wallet");
      const recipientWallet = await walletRepo.ensureWalletExists(recipientId);
      await walletRepo.updateBalances(recipientWallet.id, {
        available_balance: recipientWallet.available_balance + releaseAmount,
      });

      ctx.operations.push("ledger_entry");
      await ledgerRepo.insertDoubleEntry({
        transactionId: ctx.transactionId,
        debitAccountId: escrow.id,
        debitAccountType: "escrow",
        creditAccountId: recipientWallet.id,
        creditAccountType: "wallet",
        amount: releaseAmount,
        currency: escrow.currency,
        referenceType: "milestone",
        referenceId: milestoneId,
        description: `Milestone release ${milestoneId}`,
      });

      ctx.operations.push("validate_invariants");
      const updatedEscrow = await escrowRepo.findById(escrowId);
      if (updatedEscrow) validateEscrowInvariants(updatedEscrow);

      financialMonitor.emit("escrow.released", { escrowId, amount: releaseAmount, milestoneId });

      return updatedEscrow!;
    });
  },

  /**
   * Refund escrow funds back to sponsor.
   */
  async refund(escrowId: string, sponsorId: string, idempotencyKey: string): Promise<EscrowRecord> {
    validateUUID(escrowId, "escrowId");

    return runFinancialOperation("escrow.refund", idempotencyKey, async (ctx) => {
      const escrow = await escrowRepo.findById(escrowId);
      if (!escrow) throw new NotFoundError("Escrow", escrowId);
      if (!["funded", "disputed"].includes(escrow.status)) {
        throw new ConflictError(`Cannot refund from status "${escrow.status}"`);
      }

      const refundAmount = escrow.locked_amount;
      if (refundAmount <= 0) throw new ConflictError("Nothing to refund");

      ctx.operations.push("update_escrow");
      await escrowRepo.updateAmounts(escrowId, {
        locked_amount: 0,
        refunded_amount: escrow.refunded_amount + refundAmount,
        status: "refunded",
      });

      ctx.operations.push("update_wallet");
      const wallet = await walletRepo.findByUserId(escrow.sponsor_id);
      if (!wallet) throw new NotFoundError("Sponsor wallet");
      await walletRepo.updateBalances(wallet.id, {
        escrow_balance: wallet.escrow_balance - refundAmount,
        available_balance: wallet.available_balance + refundAmount,
      });

      ctx.operations.push("ledger_entry");
      await ledgerRepo.insertDoubleEntry({
        transactionId: ctx.transactionId,
        debitAccountId: escrow.id,
        debitAccountType: "escrow",
        creditAccountId: wallet.id,
        creditAccountType: "wallet",
        amount: refundAmount,
        currency: escrow.currency,
        referenceType: "refund",
        referenceId: escrowId,
        description: `Escrow refund for ${escrowId}`,
      });

      ctx.operations.push("validate_invariants");
      const updated = await escrowRepo.findById(escrowId);
      if (updated) validateEscrowInvariants(updated);

      financialMonitor.emit("escrow.refunded", { escrowId, amount: refundAmount });

      return updated!;
    });
  },
};
