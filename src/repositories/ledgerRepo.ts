/**
 * Ledger Repository — append-only data access.
 * No updates or deletes — enforced by DB trigger.
 */

import { supabase } from "@/integrations/supabase/client";

export interface LedgerEntryRecord {
  id: string;
  transaction_id: string;
  account_type: string;
  account_id: string;
  entry_type: "debit" | "credit";
  amount: number;
  currency: string;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  hash: string | null;
  previous_hash: string | null;
  created_at: string;
}

export const ledgerRepo = {
  async insert(entry: Omit<LedgerEntryRecord, "id" | "hash" | "previous_hash" | "created_at">): Promise<LedgerEntryRecord> {
    const { data, error } = await supabase
      .from("ledger_entries")
      .insert(entry as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as LedgerEntryRecord;
  },

  /**
   * Insert a balanced debit+credit pair for a financial event.
   */
  async insertDoubleEntry(params: {
    transactionId: string;
    debitAccountId: string;
    debitAccountType: string;
    creditAccountId: string;
    creditAccountType: string;
    amount: number;
    currency: string;
    referenceType: string;
    referenceId: string;
    description: string;
  }): Promise<{ debit: LedgerEntryRecord; credit: LedgerEntryRecord }> {
    const debit = await ledgerRepo.insert({
      transaction_id: params.transactionId,
      account_type: params.debitAccountType,
      account_id: params.debitAccountId,
      entry_type: "debit",
      amount: params.amount,
      currency: params.currency,
      reference_type: params.referenceType,
      reference_id: params.referenceId,
      description: `DEBIT: ${params.description}`,
    });

    const credit = await ledgerRepo.insert({
      transaction_id: params.transactionId,
      account_type: params.creditAccountType,
      account_id: params.creditAccountId,
      entry_type: "credit",
      amount: params.amount,
      currency: params.currency,
      reference_type: params.referenceType,
      reference_id: params.referenceId,
      description: `CREDIT: ${params.description}`,
    });

    return { debit, credit };
  },

  async findByReference(referenceType: string, referenceId: string): Promise<LedgerEntryRecord[]> {
    const { data, error } = await supabase
      .from("ledger_entries")
      .select("*")
      .eq("reference_type", referenceType)
      .eq("reference_id", referenceId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as unknown as LedgerEntryRecord[];
  },

  async getRecentEntries(limit = 100): Promise<LedgerEntryRecord[]> {
    const { data, error } = await supabase
      .from("ledger_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as LedgerEntryRecord[];
  },
};
