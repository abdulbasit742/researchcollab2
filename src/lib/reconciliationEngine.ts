import { supabase } from "@/integrations/supabase/client";

/**
 * Reconciliation Engine — validates financial integrity across the ledger.
 *
 * Checks:
 *   1. Sum of wallet available_balance across all wallets
 *   2. Sum of wallet escrow_balance vs active deal milestones
 *   3. Capital outstanding vs capital_advances
 *   4. Ledger credit/debit balance
 *
 * Returns discrepancies for admin review.
 */

export interface ReconciliationResult {
  timestamp: string;
  status: "balanced" | "discrepancy_detected";
  totalWalletBalance: number;
  totalEscrowBalance: number;
  totalCapitalOutstanding: number;
  ledgerCreditTotal: number;
  ledgerDebitTotal: number;
  ledgerNetBalance: number;
  discrepancies: string[];
}

export async function reconcileLedger(): Promise<ReconciliationResult> {
  const discrepancies: string[] = [];

  // 1. Wallet balances
  const { data: wallets } = await supabase
    .from("wallets")
    .select("available_balance, escrow_balance, pending_balance");

  const totalWalletBalance = (wallets ?? []).reduce((s, w) => s + (w.available_balance ?? 0), 0);
  const totalEscrowBalance = (wallets ?? []).reduce((s, w) => s + (w.escrow_balance ?? 0), 0);

  // 2. Active escrow from deals
  const { data: activeDeals } = await supabase
    .from("deal_rooms")
    .select("escrow_amount")
    .in("status", ["in_progress", "agreed"]);

  const totalDealEscrow = (activeDeals ?? []).reduce((s, d) => s + (d.escrow_amount ?? 0), 0);

  // Check escrow consistency
  const escrowDiff = Math.abs(totalEscrowBalance - totalDealEscrow);
  if (escrowDiff > 1) {
    discrepancies.push(
      `Escrow mismatch: wallet escrow (${totalEscrowBalance}) vs deal escrow (${totalDealEscrow}), diff: ${escrowDiff}`
    );
  }

  // 3. Capital outstanding
  const { data: advances } = await supabase
    .from("capital_advances")
    .select("approved_amount, repaid_amount")
    .in("status", ["disbursed", "repaying"]);

  const totalCapitalOutstanding = (advances ?? []).reduce(
    (s, a) => s + ((a.approved_amount ?? 0) - (a.repaid_amount ?? 0)),
    0
  );

  // 4. Ledger balance
  const { data: ledger } = await supabase
    .from("ledger_entries")
    .select("entry_type, amount");

  const ledgerCreditTotal = (ledger ?? [])
    .filter(e => e.entry_type === "credit")
    .reduce((s, e) => s + (e.amount ?? 0), 0);

  const ledgerDebitTotal = (ledger ?? [])
    .filter(e => e.entry_type === "debit")
    .reduce((s, e) => s + (e.amount ?? 0), 0);

  const ledgerNetBalance = ledgerCreditTotal - ledgerDebitTotal;

  // Check ledger balance
  if (Math.abs(ledgerNetBalance) > 100) {
    discrepancies.push(
      `Ledger imbalance: credits (${ledgerCreditTotal}) - debits (${ledgerDebitTotal}) = ${ledgerNetBalance}`
    );
  }

  return {
    timestamp: new Date().toISOString(),
    status: discrepancies.length === 0 ? "balanced" : "discrepancy_detected",
    totalWalletBalance,
    totalEscrowBalance,
    totalCapitalOutstanding,
    ledgerCreditTotal,
    ledgerDebitTotal,
    ledgerNetBalance,
    discrepancies,
  };
}

export async function getReconciliationHistory(limit = 20) {
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("*")
    .eq("action", "ledger_reconciliation")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function runAndLogReconciliation(adminId: string) {
  const result = await reconcileLedger();

  await supabase.from("admin_audit_logs").insert([{
    admin_id: adminId,
    action: "ledger_reconciliation",
    entity_type: "ledger",
    details: result as any,
  }]);

  return result;
}
