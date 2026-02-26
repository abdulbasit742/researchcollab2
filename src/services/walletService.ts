/**
 * Wallet Service — orchestrates wallet operations with safety.
 */

import { walletRepo, type WalletRecord } from "@/repositories/walletRepo";
import { validateWalletInvariants } from "@/invariants/walletInvariant";
import { financialMonitor } from "@/monitoring/financialMonitor";
import { NotFoundError, ConflictError } from "@/lib/core/errors";
import { validateUUID } from "@/lib/core/productionHardening";

export const walletService = {
  async getWallet(userId: string): Promise<WalletRecord> {
    validateUUID(userId, "userId");
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) throw new NotFoundError("Wallet", userId);
    return wallet;
  },

  async ensureWallet(userId: string): Promise<WalletRecord> {
    validateUUID(userId, "userId");
    return walletRepo.ensureWalletExists(userId);
  },

  async validateBalance(userId: string): Promise<{ valid: boolean; errors: string[] }> {
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) return { valid: false, errors: ["Wallet not found"] };
    return validateWalletInvariants(wallet);
  },

  async checkSufficientBalance(userId: string, amount: number): Promise<boolean> {
    const wallet = await walletRepo.findByUserId(userId);
    if (!wallet) return false;
    if (wallet.is_frozen) return false;
    return wallet.available_balance >= amount;
  },
};
