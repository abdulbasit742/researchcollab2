/**
 * Admin Service — minimal oversight functions.
 * All functions require admin role verification.
 */

import { supabase } from "@/integrations/supabase/client";
import { assertAuthenticated, assertAdmin, logAudit } from "@/lib/security/guards";

export async function listAllDeals(limit = 100) {
  const user = await assertAuthenticated();
  await assertAdmin(user.id);

  const { data, error } = await supabase
    .from("deal_rooms")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function listAllDisputes(limit = 100) {
  const user = await assertAuthenticated();
  await assertAdmin(user.id);

  const { data, error } = await supabase
    .from("deal_rooms")
    .select("*")
    .eq("status", "disputed")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function listAuditLogs(filters?: {
  action?: string;
  entityType?: string;
  limit?: number;
}) {
  const user = await assertAuthenticated();
  await assertAdmin(user.id);

  let query = supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filters?.limit ?? 200);

  if (filters?.action) query = query.eq("action", filters.action);
  if (filters?.entityType) query = query.eq("entity_type", filters.entityType);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function manualAdjustWallet(
  targetUserId: string,
  amount: number,
  reason: string
) {
  const user = await assertAuthenticated();
  await assertAdmin(user.id);

  // Get target wallet
  const { data: wallet, error: wErr } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", targetUserId)
    .single();

  if (wErr || !wallet) throw new Error("Target wallet not found");

  const newBalance = wallet.available_balance + amount;
  if (newBalance < 0) throw new Error("Adjustment would result in negative balance");

  // Update wallet
  const { error: updateErr } = await supabase
    .from("wallets")
    .update({
      available_balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", wallet.id);

  if (updateErr) throw updateErr;

  // Record transaction
  await supabase.from("wallet_transactions").insert({
    wallet_id: wallet.id,
    user_id: targetUserId,
    type: amount > 0 ? "deposit" : "withdrawal",
    amount,
    balance_after: newBalance,
    description: `Admin adjustment: ${reason}`,
    status: "completed",
  });

  // Audit log
  await logAudit({
    userId: user.id,
    action: "manual_wallet_adjustment",
    entityType: "wallet",
    entityId: wallet.id,
    details: { targetUserId, amount, reason, newBalance },
  });

  return { success: true, newBalance };
}
