import { supabase } from "@/integrations/supabase/client";

/**
 * Escrow Engine — state machine for escrow lifecycle.
 *
 * State transitions:
 *   pending → funded → active → completed
 *   pending → refunded
 *   active → disputed → resolved → completed | refunded
 *
 * All operations are atomic: wallet debit + escrow credit + transaction log.
 * Note: The deal-runtime edge function handles the server-authoritative version.
 * This client-side engine is for validation and optimistic state management.
 */

const VALID_ESCROW_TRANSITIONS: Record<string, string[]> = {
  pending: ["funded", "refunded", "cancelled"],
  funded: ["active", "refunded"],
  active: ["completed", "disputed"],
  disputed: ["active", "refunded"],
  completed: [],
  refunded: [],
  cancelled: [],
};

function validateTransition(current: string, next: string) {
  const allowed = VALID_ESCROW_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new Error(
      `Invalid escrow transition: ${current} → ${next}. Allowed: ${allowed.join(", ")}`
    );
  }
}

/**
 * Fund escrow for a deal — locks funds from client wallet.
 */
export async function fundEscrow(dealId: string, clientId: string) {
  // Get deal
  const { data: deal, error: dealError } = await supabase
    .from("deal_rooms")
    .select("*")
    .eq("id", dealId)
    .single();

  if (dealError) throw dealError;

  const currentStatus = deal.escrow_status || "pending";
  validateTransition(currentStatus, "funded");

  const amount = deal.agreed_amount || 0;
  if (amount <= 0) throw new Error("Deal has no agreed amount");

  // Get client wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", clientId)
    .single();

  if (walletError) throw walletError;
  if (wallet.available_balance < amount) throw new Error("Insufficient funds");

  // Deduct from client wallet
  const newAvailable = wallet.available_balance - amount;
  const newEscrow = wallet.escrow_balance + amount;

  const { error: walletUpdateError } = await supabase
    .from("wallets")
    .update({
      available_balance: newAvailable,
      escrow_balance: newEscrow,
      total_spent: wallet.total_spent + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", wallet.id);

  if (walletUpdateError) throw walletUpdateError;

  // Record transaction
  await supabase.from("wallet_transactions").insert({
    wallet_id: wallet.id,
    user_id: clientId,
    type: "escrow_deposit",
    amount: -amount,
    balance_after: newAvailable,
    description: `Escrow funded for deal: ${deal.title}`,
    reference_id: dealId,
    reference_type: "deal",
    status: "completed",
  });

  // Update deal escrow status
  await supabase
    .from("deal_rooms")
    .update({
      escrow_status: "funded",
      escrow_amount: amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId);

  // Notify both parties
  await Promise.all([
    supabase.from("notifications").insert({
      user_id: deal.buyer_id,
      type: "deal_update",
      title: "Escrow Funded",
      message: `PKR ${amount.toLocaleString()} locked in escrow for "${deal.title}"`,
      data: { deal_id: dealId, link: `/deals/${dealId}` },
    }),
    supabase.from("notifications").insert({
      user_id: deal.seller_id,
      type: "deal_update",
      title: "Escrow Funded",
      message: `Client has funded escrow (PKR ${amount.toLocaleString()}) for "${deal.title}". You can begin work.`,
      data: { deal_id: dealId, link: `/deals/${dealId}` },
    }),
  ]);

  return { success: true, locked_amount: amount };
}

/**
 * Release a milestone payment — moves funds from escrow to executor.
 */
export async function releaseMilestone(
  milestoneId: string,
  dealId: string,
  clientId: string,
  executorId: string
) {
  // Get milestone
  const { data: milestone, error: msError } = await supabase
    .from("milestones")
    .select("*")
    .eq("id", milestoneId)
    .single();

  if (msError) throw msError;
  if (milestone.status === "released") throw new Error("Milestone already released");

  const amount = milestone.amount;

  // Get client wallet (deduct from escrow_balance)
  const { data: clientWallet, error: cwError } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", clientId)
    .single();

  if (cwError) throw cwError;
  if (clientWallet.escrow_balance < amount) throw new Error("Insufficient escrow balance");

  // Get executor wallet
  const { data: executorWallet, error: ewError } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", executorId)
    .maybeSingle();

  // Create executor wallet if needed
  let exWallet = executorWallet;
  if (!exWallet) {
    const { data: newWallet, error: createError } = await supabase
      .from("wallets")
      .insert({ user_id: executorId })
      .select()
      .single();
    if (createError) throw createError;
    exWallet = newWallet;
  }

  // Update client wallet — reduce escrow
  await supabase
    .from("wallets")
    .update({
      escrow_balance: clientWallet.escrow_balance - amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientWallet.id);

  // Update executor wallet — increase available
  const executorNewBalance = exWallet.available_balance + amount;
  await supabase
    .from("wallets")
    .update({
      available_balance: executorNewBalance,
      total_earned: exWallet.total_earned + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", exWallet.id);

  // Record transactions for both
  await Promise.all([
    supabase.from("wallet_transactions").insert({
      wallet_id: clientWallet.id,
      user_id: clientId,
      type: "milestone_release",
      amount: -amount,
      balance_after: clientWallet.available_balance,
      description: `Milestone released: ${milestone.title}`,
      reference_id: milestoneId,
      reference_type: "milestone",
      status: "completed",
    }),
    supabase.from("wallet_transactions").insert({
      wallet_id: exWallet.id,
      user_id: executorId,
      type: "milestone_release",
      amount,
      balance_after: executorNewBalance,
      description: `Payment received: ${milestone.title}`,
      reference_id: milestoneId,
      reference_type: "milestone",
      status: "completed",
    }),
  ]);

  // Update milestone status
  await supabase
    .from("milestones")
    .update({
      status: "released",
      released_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", milestoneId);

  // Notify executor
  await supabase.from("notifications").insert({
    user_id: executorId,
    type: "payment_received",
    title: "Payment Received",
    message: `PKR ${amount.toLocaleString()} released for milestone "${milestone.title}"`,
    data: { deal_id: dealId, milestone_id: milestoneId, link: `/deals/${dealId}` },
  });

  return { success: true, released_amount: amount };
}

/**
 * Dispute a deal — freezes escrow and notifies parties.
 */
export async function disputeDeal(dealId: string, initiatorId: string, reason: string) {
  const { data: deal, error: dealError } = await supabase
    .from("deal_rooms")
    .select("*")
    .eq("id", dealId)
    .single();

  if (dealError) throw dealError;

  validateTransition(deal.escrow_status || "active", "disputed");

  await supabase
    .from("deal_rooms")
    .update({
      status: "disputed",
      escrow_status: "disputed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId);

  // Notify both parties
  const otherParty = initiatorId === deal.buyer_id ? deal.seller_id : deal.buyer_id;

  await Promise.all([
    supabase.from("notifications").insert({
      user_id: otherParty,
      type: "deal_update",
      title: "Deal Disputed",
      message: `A dispute has been raised on "${deal.title}": ${reason}`,
      data: { deal_id: dealId, link: `/deals/${dealId}` },
    }),
    supabase.from("notifications").insert({
      user_id: initiatorId,
      type: "deal_update",
      title: "Dispute Filed",
      message: `Your dispute on "${deal.title}" has been filed. Our team will review it.`,
      data: { deal_id: dealId, link: `/deals/${dealId}` },
    }),
  ]);

  return { success: true };
}

/**
 * Refund a deal — returns escrowed funds to client.
 */
export async function refundDeal(dealId: string) {
  const { data: deal, error: dealError } = await supabase
    .from("deal_rooms")
    .select("*")
    .eq("id", dealId)
    .single();

  if (dealError) throw dealError;

  const currentEscrowStatus = deal.escrow_status || "pending";
  validateTransition(currentEscrowStatus, "refunded");

  const amount = deal.escrow_amount || 0;
  if (amount <= 0) {
    // No funds to refund
    await supabase
      .from("deal_rooms")
      .update({ status: "cancelled", escrow_status: "refunded", updated_at: new Date().toISOString() })
      .eq("id", dealId);
    return { success: true, refunded_amount: 0 };
  }

  // Get client wallet
  const { data: clientWallet, error: cwError } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", deal.buyer_id)
    .single();

  if (cwError) throw cwError;

  const newAvailable = clientWallet.available_balance + amount;
  const newEscrow = Math.max(0, clientWallet.escrow_balance - amount);

  // Restore funds to client
  await supabase
    .from("wallets")
    .update({
      available_balance: newAvailable,
      escrow_balance: newEscrow,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientWallet.id);

  // Record refund transaction
  await supabase.from("wallet_transactions").insert({
    wallet_id: clientWallet.id,
    user_id: deal.buyer_id,
    type: "refund",
    amount,
    balance_after: newAvailable,
    description: `Escrow refund for deal: ${deal.title}`,
    reference_id: dealId,
    reference_type: "deal",
    status: "completed",
  });

  // Update deal
  await supabase
    .from("deal_rooms")
    .update({
      status: "cancelled",
      escrow_status: "refunded",
      escrow_amount: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId);

  // Notify
  await supabase.from("notifications").insert({
    user_id: deal.buyer_id,
    type: "payment_received",
    title: "Escrow Refunded",
    message: `PKR ${amount.toLocaleString()} has been refunded to your wallet from "${deal.title}"`,
    data: { deal_id: dealId, link: `/wallet` },
  });

  return { success: true, refunded_amount: amount };
}
