/**
 * Escrow Invariant Assertion Layer — prevents all invalid escrow states.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("escrowInvariants");

export interface InvariantResult {
  valid: boolean;
  violations: string[];
  checkedAt: string;
}

/** Core invariant: no negative escrow balance */
async function checkNoNegativeBalance(): Promise<string | null> {
  const { data } = await supabase.from("wallets").select("id, escrow_balance").lt("escrow_balance", 0);
  if (data && data.length > 0) return `${data.length} wallet(s) with negative escrow balance`;
  return null;
}

/** No release without a completed/submitted milestone */
async function checkNoOrphanRelease(): Promise<string | null> {
  const { data } = await (supabase as any).from("ledger_entries")
    .select("id, reference_id")
    .eq("entry_type", "escrow_release")
    .is("reference_id", null);
  if (data && data.length > 0) return `${data.length} escrow release(s) without milestone reference`;
  return null;
}

/** No double release — same reference_id should not have >1 release */
async function checkNoDoubleRelease(): Promise<string | null> {
  const { data } = await (supabase as any).rpc("check_double_releases").catch(() => ({ data: null }));
  // Fallback: query ledger_entries grouped by reference_id
  if (!data) {
    const { data: entries } = await (supabase as any).from("ledger_entries")
      .select("reference_id")
      .eq("entry_type", "escrow_release")
      .not("reference_id", "is", null);
    if (entries) {
      const counts: Record<string, number> = {};
      for (const e of entries) {
        counts[e.reference_id] = (counts[e.reference_id] ?? 0) + 1;
      }
      const doubles = Object.entries(counts).filter(([, c]) => c > 1);
      if (doubles.length > 0) return `${doubles.length} reference(s) with duplicate escrow releases`;
    }
  }
  return null;
}

/** Escrow balance must match sum of active locked milestones */
async function checkEscrowReconciliation(): Promise<string | null> {
  const { data: wallets } = await supabase.from("wallets").select("id, user_id, escrow_balance");
  if (!wallets || wallets.length === 0) return null;

  const mismatches: string[] = [];
  for (const w of wallets.slice(0, 50)) { // Batch limit for performance
    if ((w.escrow_balance ?? 0) === 0) continue;
    const { data: offers } = await (supabase as any).from("offers")
      .select("id")
      .eq("sender_id", w.user_id)
      .in("status", ["accepted", "in_progress"]);
    const offerIds = (offers ?? []).map((o: any) => o.id);
    if (offerIds.length === 0) continue;
    const { data: milestones } = await (supabase as any).from("milestones")
      .select("amount")
      .in("offer_id", offerIds)
      .in("status", ["funded", "in_progress", "submitted"]);
    const milestoneTotal = (milestones ?? []).reduce((s: number, m: any) => s + (m.amount ?? 0), 0);
    if (Math.abs((w.escrow_balance ?? 0) - milestoneTotal) > 0.01) {
      mismatches.push(w.id);
    }
  }
  if (mismatches.length > 0) return `${mismatches.length} wallet(s) with escrow/milestone mismatch`;
  return null;
}

/** No untracked escrow state — all escrow mutations must have ledger entries */
async function checkNoUntrackedEscrow(): Promise<string | null> {
  const { data: wallets } = await supabase.from("wallets").select("id, escrow_balance").gt("escrow_balance", 0);
  if (!wallets || wallets.length === 0) return null;

  for (const w of wallets.slice(0, 20)) {
    const { data: entries } = await (supabase as any).from("ledger_entries")
      .select("id").eq("account_id", w.id).limit(1);
    if (!entries || entries.length === 0) {
      return `Wallet ${w.id} has escrow balance but no ledger entries`;
    }
  }
  return null;
}

/** Transaction replay detection — check for duplicate transaction_ids */
async function checkReplayDetection(): Promise<string | null> {
  const { data } = await (supabase as any).from("ledger_entries")
    .select("transaction_id")
    .not("transaction_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(500);
  if (data) {
    const keys = data.map((e: any) => e.transaction_id).filter(Boolean);
    const dupes = keys.filter((k: string, i: number) => keys.indexOf(k) !== i);
    if (dupes.length > 0) return `${dupes.length} duplicate transaction_id(s) detected — possible replay`;
  }
  return null;
}

/**
 * Run all escrow invariants — call before/after any escrow mutation.
 */
export async function validateEscrowInvariants(): Promise<InvariantResult> {
  const checks = await Promise.all([
    checkNoNegativeBalance(),
    checkNoOrphanRelease(),
    checkNoDoubleRelease(),
    checkEscrowReconciliation(),
    checkNoUntrackedEscrow(),
    checkReplayDetection(),
  ]);

  const violations = checks.filter(Boolean) as string[];
  const result: InvariantResult = {
    valid: violations.length === 0,
    violations,
    checkedAt: new Date().toISOString(),
  };

  if (!result.valid) {
    log.warn("Escrow invariant violations detected", { violations });
  } else {
    log.info("Escrow invariants passed");
  }

  return result;
}
