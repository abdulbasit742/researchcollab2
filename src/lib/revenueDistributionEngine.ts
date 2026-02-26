import { supabase } from "@/integrations/supabase/client";
import { calculatePlatformFee } from "./revenueEngine";

/**
 * Revenue Distribution Engine — splits escrow releases across stakeholders.
 *
 * On every escrow release:
 *   1. Platform fee (trust-weighted)
 *   2. Capital repayment (if user has active advance)
 *   3. Investor return (if pool-funded)
 *   4. Net payout to executor
 *
 * All operations logged to ledger_entries for reconciliation.
 */

export interface DistributionResult {
  grossAmount: number;
  platformFee: number;
  capitalRepayment: number;
  investorReturn: number;
  netPayout: number;
}

export async function distributeEscrowRelease(params: {
  dealId: string;
  milestoneId?: string;
  payerId: string;
  payeeId: string;
  grossAmount: number;
  trustTier: string;
}): Promise<DistributionResult> {
  const { grossAmount, payeeId, trustTier } = params;

  // 1. Platform fee
  const platformFee = calculatePlatformFee(grossAmount, trustTier);

  // 2. Capital repayment — check for active advances
  let capitalRepayment = 0;
  const { data: advances } = await supabase
    .from("capital_advances")
    .select("id, approved_amount, repaid_amount, auto_repayment_enabled")
    .eq("user_id", payeeId)
    .in("status", ["disbursed", "repaying"])
    .eq("auto_repayment_enabled", true)
    .order("created_at", { ascending: true })
    .limit(1);

  if (advances && advances.length > 0) {
    const advance = advances[0];
    const outstanding = (advance.approved_amount ?? 0) - (advance.repaid_amount ?? 0);
    // Auto-deduct 15% of release toward repayment
    capitalRepayment = Math.min(outstanding, Math.round(grossAmount * 0.15 * 100) / 100);

    if (capitalRepayment > 0) {
      const newRepaid = (advance.repaid_amount ?? 0) + capitalRepayment;
      const fullyRepaid = newRepaid >= (advance.approved_amount ?? 0);

      await supabase
        .from("capital_advances")
        .update({
          repaid_amount: newRepaid,
          status: fullyRepaid ? "repaid" : "repaying",
          repaid_at: fullyRepaid ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", advance.id);
    }
  }

  // 3. Investor return — placeholder for pool-funded deals (2% of gross)
  const investorReturn = 0; // Only activated when pool allocation is linked

  // 4. Net payout
  const netPayout = Math.round((grossAmount - platformFee - capitalRepayment - investorReturn) * 100) / 100;

  // Record platform fee
  await supabase.from("platform_fees").insert({
    deal_id: params.dealId,
    payer_id: params.payerId,
    payee_id: params.payeeId,
    gross_amount: grossAmount,
    net_payout: netPayout,
    platform_fee_amount: platformFee,
    platform_fee_percentage: (platformFee / grossAmount) * 100,
    trust_tier: trustTier,
  });

  // Record ledger entries (double-entry)
  const now = new Date().toISOString();
  const txnId = crypto.randomUUID();
  const entries = [
    { account_id: params.payerId, account_type: "user", entry_type: "debit", amount: grossAmount, currency: "PKR", reference_type: "escrow_release", reference_id: params.dealId, description: "Escrow release", transaction_id: txnId, created_at: now },
    { account_id: params.payeeId, account_type: "user", entry_type: "credit", amount: netPayout, currency: "PKR", reference_type: "escrow_release", reference_id: params.dealId, description: "Net payout after fees", transaction_id: txnId, created_at: now },
    { account_id: "platform", account_type: "platform", entry_type: "credit", amount: platformFee, currency: "PKR", reference_type: "platform_fee", reference_id: params.dealId, description: "Platform fee", transaction_id: txnId, created_at: now },
  ];

  if (capitalRepayment > 0) {
    entries.push({
      account_id: params.payeeId,
      account_type: "user",
      entry_type: "debit",
      amount: capitalRepayment,
      currency: "PKR",
      reference_type: "capital_repayment",
      reference_id: params.dealId,
      description: "Auto capital advance repayment",
      transaction_id: txnId,
      created_at: now,
    });
  }

  await supabase.from("ledger_entries").insert(entries);

  return { grossAmount, platformFee, capitalRepayment, investorReturn, netPayout };
}
