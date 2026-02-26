/**
 * Ledger Service — read-only queries + integrity verification.
 * Writes are handled exclusively through escrowService/transactionManager.
 */

import { ledgerRepo, type LedgerEntryRecord } from "@/repositories/ledgerRepo";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("ledgerService");

export const ledgerService = {
  async getEntriesByReference(referenceType: string, referenceId: string): Promise<LedgerEntryRecord[]> {
    return ledgerRepo.findByReference(referenceType, referenceId);
  },

  async getRecentEntries(limit = 50): Promise<LedgerEntryRecord[]> {
    return ledgerRepo.getRecentEntries(limit);
  },

  /**
   * Verify ledger hash chain integrity via DB function.
   */
  async verifyChainIntegrity(): Promise<{ valid: boolean; total_entries: number; broken_links: number }> {
    const { data, error } = await supabase.rpc("verify_ledger_chain" as any);
    if (error) {
      log.error("Ledger chain verification failed", error);
      return { valid: false, total_entries: 0, broken_links: -1 };
    }
    return data as any;
  },

  /**
   * Verify double-entry balance: sum of debits must equal sum of credits.
   */
  async verifyDoubleEntryBalance(): Promise<{ balanced: boolean; debits: number; credits: number }> {
    const entries = await ledgerRepo.getRecentEntries(1000);
    const debits = entries.filter(e => e.entry_type === "debit").reduce((s, e) => s + e.amount, 0);
    const credits = entries.filter(e => e.entry_type === "credit").reduce((s, e) => s + e.amount, 0);
    return {
      balanced: Math.abs(debits - credits) < 0.01,
      debits,
      credits,
    };
  },
};
