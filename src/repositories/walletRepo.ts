/**
 * Wallet Repository — pure data access layer.
 */

import { supabase } from "@/integrations/supabase/client";

export interface WalletRecord {
  id: string;
  user_id: string;
  available_balance: number;
  escrow_balance: number;
  pending_balance: number;
  currency: string;
  is_frozen: boolean;
}

export const walletRepo = {
  async findByUserId(userId: string): Promise<WalletRecord | null> {
    const { data, error } = await supabase
      .from("wallets")
      .select("id, user_id, available_balance, escrow_balance, pending_balance, currency, is_frozen")
      .eq("user_id", userId)
      .single();
    if (error) return null;
    return data as WalletRecord;
  },

  async updateBalances(
    walletId: string,
    updates: Partial<Pick<WalletRecord, "available_balance" | "escrow_balance" | "pending_balance">>
  ): Promise<WalletRecord> {
    const { data, error } = await supabase
      .from("wallets")
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq("id", walletId)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as WalletRecord;
  },

  async ensureWalletExists(userId: string, currency = "PKR"): Promise<WalletRecord> {
    const existing = await walletRepo.findByUserId(userId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from("wallets")
      .insert({ user_id: userId, currency } as any)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as WalletRecord;
  },
};
