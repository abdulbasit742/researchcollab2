import { supabase } from "@/integrations/supabase/client";

/**
 * Wallet service — standalone functions for wallet operations.
 * The useWallet hook already handles UI-level queries with auto-create.
 * This service is for programmatic use.
 */

export async function getWallet(userId: string) {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getOrCreateWallet(userId: string) {
  let wallet = await getWallet(userId);
  if (wallet) return wallet;

  const { data, error } = await supabase
    .from("wallets")
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTransactions(userId: string, limit = 50) {
  const wallet = await getWallet(userId);
  if (!wallet) return [];

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function depositFunds(userId: string, amount: number, description?: string) {
  if (amount <= 0) throw new Error("Amount must be positive");

  const wallet = await getOrCreateWallet(userId);

  const newBalance = wallet.available_balance + amount;

  // Insert transaction
  const { error: txnError } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      user_id: userId,
      type: "deposit",
      amount,
      balance_after: newBalance,
      description: description || "Deposit",
      status: "completed",
    });

  if (txnError) throw txnError;

  // Update wallet
  const { error: updateError } = await supabase
    .from("wallets")
    .update({
      available_balance: newBalance,
      total_earned: wallet.total_earned + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", wallet.id);

  if (updateError) throw updateError;

  return { success: true, new_balance: newBalance };
}

export async function withdrawFunds(userId: string, amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive");

  const wallet = await getWallet(userId);
  if (!wallet) throw new Error("Wallet not found");
  if (wallet.available_balance < amount) throw new Error("Insufficient funds");

  const newBalance = wallet.available_balance - amount;

  const { error: txnError } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      user_id: userId,
      type: "withdrawal",
      amount: -amount,
      balance_after: newBalance,
      description: "Withdrawal request",
      status: "pending",
    });

  if (txnError) throw txnError;

  const { error: updateError } = await supabase
    .from("wallets")
    .update({
      available_balance: newBalance,
      pending_balance: wallet.pending_balance + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", wallet.id);

  if (updateError) throw updateError;

  return { success: true, new_balance: newBalance };
}
