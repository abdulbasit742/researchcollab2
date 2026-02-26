import { supabase } from "@/integrations/supabase/client";

/**
 * Basic Fraud Pattern Detection Engine.
 *
 * Detects:
 *   - Repeated dispute abuse (3+ unresolved disputes)
 *   - Deal loops between same 2 users (5+ deals)
 *   - Abnormal escrow patterns (rapid fund→refund cycles)
 *   - Existing fraud flags on wallet
 *
 * Does NOT auto-ban. Logs flag only.
 */

export interface FraudAssessment {
  is_flagged: boolean;
  flags: string[];
  severity: "none" | "low" | "medium" | "high";
}

export async function detectFraudPatterns(userId: string): Promise<FraudAssessment> {
  const flags: string[] = [];

  const [disputesRes, dealsRes, walletRes] = await Promise.all([
    // Unresolved disputes initiated by this user
    supabase.from("academic_disputes")
      .select("id", { count: "exact", head: true })
      .eq("raised_by_user_id", userId)
      .eq("status", "open"),

    // All completed/cancelled deals for this user
    supabase.from("deal_rooms")
      .select("buyer_id, seller_id, status, created_at")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(100),

    // Wallet fraud flags
    supabase.from("wallets")
      .select("fraud_flags")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  // 1. Dispute abuse
  const openDisputes = disputesRes.count ?? 0;
  if (openDisputes >= 3) {
    flags.push(`${openDisputes} unresolved disputes (potential abuse)`);
  }

  // 2. Deal loops — same counterparty 5+ times
  const deals = dealsRes.data ?? [];
  const counterpartyCounts = new Map<string, number>();
  for (const d of deals) {
    const other = d.buyer_id === userId ? d.seller_id : d.buyer_id;
    if (other) counterpartyCounts.set(other, (counterpartyCounts.get(other) ?? 0) + 1);
  }
  for (const [partnerId, count] of counterpartyCounts) {
    if (count >= 5) {
      flags.push(`Deal loop detected: ${count} deals with same counterparty`);
      break; // One flag is enough
    }
  }

  // 3. Rapid cancel pattern — 3+ cancelled deals in last 7 days
  const recentCancelled = deals.filter(d => {
    if (d.status !== "cancelled") return false;
    const age = Date.now() - new Date(d.created_at).getTime();
    return age < 7 * 24 * 60 * 60 * 1000;
  });
  if (recentCancelled.length >= 3) {
    flags.push(`${recentCancelled.length} cancelled deals in last 7 days`);
  }

  // 4. Existing wallet fraud flags
  const walletFlags = walletRes.data?.fraud_flags;
  if (walletFlags && typeof walletFlags === "object" && Object.keys(walletFlags).length > 0) {
    flags.push("Pre-existing wallet fraud flags");
  }

  const severity = flags.length >= 3 ? "high" : flags.length >= 2 ? "medium" : flags.length >= 1 ? "low" : "none";

  return {
    is_flagged: flags.length > 0,
    flags,
    severity,
  };
}
