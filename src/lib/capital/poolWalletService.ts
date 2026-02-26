/**
 * Pool Wallet Service — manages capital pool wallet operations with no direct balance mutation.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("poolWallet");

export async function createPoolWallet(poolId: string): Promise<string> {
  const { data, error } = await (supabase as any)
    .from("pool_wallets")
    .insert({ pool_id: poolId, balance: 0, locked_balance: 0 })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create pool wallet: ${error.message}`);
  log.info("Pool wallet created", { poolId, walletId: data.id });
  return data.id;
}

export async function getPoolWallet(poolId: string) {
  const { data, error } = await (supabase as any)
    .from("pool_wallets")
    .select("*")
    .eq("pool_id", poolId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch pool wallet: ${error.message}`);
  return data;
}

export async function depositToPool(poolId: string, amount: number, contributorId: string): Promise<void> {
  if (amount <= 0) throw new Error("Deposit amount must be positive");

  // Record contribution
  const { error: contribErr } = await (supabase as any)
    .from("pool_contributions")
    .insert({ pool_id: poolId, contributor_id: contributorId, amount, status: "committed" });

  if (contribErr) throw new Error(`Failed to record contribution: ${contribErr.message}`);

  // Update pool wallet balance
  const wallet = await getPoolWallet(poolId);
  if (!wallet) throw new Error("Pool wallet not found");

  const { error: walletErr } = await (supabase as any)
    .from("pool_wallets")
    .update({ balance: wallet.balance + amount, updated_at: new Date().toISOString() })
    .eq("pool_id", poolId);

  if (walletErr) throw new Error(`Failed to update pool wallet: ${walletErr.message}`);

  // Update pool total_committed
  const { data: pool } = await (supabase as any)
    .from("capital_pools")
    .select("total_committed")
    .eq("id", poolId)
    .single();

  await (supabase as any)
    .from("capital_pools")
    .update({ total_committed: (pool?.total_committed ?? 0) + amount, updated_at: new Date().toISOString() })
    .eq("id", poolId);

  log.info("Deposit to pool completed", { poolId, amount, contributorId });
}

export async function allocateFromPool(poolId: string, amount: number): Promise<void> {
  const wallet = await getPoolWallet(poolId);
  if (!wallet) throw new Error("Pool wallet not found");

  assertPoolBalance(wallet.balance, amount);

  const { error } = await (supabase as any)
    .from("pool_wallets")
    .update({
      balance: wallet.balance - amount,
      locked_balance: wallet.locked_balance + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("pool_id", poolId);

  if (error) throw new Error(`Failed to allocate from pool: ${error.message}`);
  log.info("Allocated from pool", { poolId, amount });
}

export async function releaseBackToPool(poolId: string, amount: number): Promise<void> {
  const wallet = await getPoolWallet(poolId);
  if (!wallet) throw new Error("Pool wallet not found");

  if (wallet.locked_balance < amount) throw new Error("Insufficient locked balance to release");

  const { error } = await (supabase as any)
    .from("pool_wallets")
    .update({
      balance: wallet.balance + amount,
      locked_balance: wallet.locked_balance - amount,
      updated_at: new Date().toISOString(),
    })
    .eq("pool_id", poolId);

  if (error) throw new Error(`Failed to release back to pool: ${error.message}`);
  log.info("Released back to pool", { poolId, amount });
}

export function assertPoolBalance(currentBalance: number, requestedAmount: number): void {
  if (currentBalance < requestedAmount) {
    throw new Error(`Insufficient pool balance: available ${currentBalance}, requested ${requestedAmount}`);
  }
}
