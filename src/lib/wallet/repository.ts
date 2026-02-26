/**
 * Wallet Repository — pure DB operations, no business logic.
 * Only walletDomainService.ts should import this.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
type WalletTransaction = Database["public"]["Tables"]["wallet_transactions"]["Row"];
type TransactionInsert = Database["public"]["Tables"]["wallet_transactions"]["Insert"];

export async function findByUserId(userId: string): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createWallet(userId: string): Promise<Wallet> {
  const { data, error } = await supabase
    .from("wallets")
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBalances(
  walletId: string,
  updates: {
    available_balance?: number;
    escrow_balance?: number;
    pending_balance?: number;
    total_earned?: number;
    total_spent?: number;
  }
): Promise<void> {
  const { error } = await supabase
    .from("wallets")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", walletId);

  if (error) throw error;
}

export async function insertTransaction(txn: TransactionInsert): Promise<void> {
  const { error } = await supabase
    .from("wallet_transactions")
    .insert(txn);

  if (error) throw error;
}

export async function listTransactions(
  walletId: string,
  limit = 50
): Promise<WalletTransaction[]> {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", walletId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
