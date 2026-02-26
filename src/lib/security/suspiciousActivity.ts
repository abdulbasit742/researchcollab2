/**
 * Suspicious Activity Detection — flags anomalous user behavior.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("suspiciousActivity");

type FlagSeverity = "low" | "medium" | "high" | "critical";

interface FlagInput {
  userId: string;
  flagType: string;
  severity: FlagSeverity;
  details?: Record<string, unknown>;
}

/**
 * Record a suspicious activity flag.
 */
export async function flagUser(input: FlagInput): Promise<void> {
  const { error } = await supabase.from("user_flags").insert([{
    user_id: input.userId,
    flag_type: input.flagType,
    severity: input.severity,
    details: (input.details ?? {}) as Record<string, unknown>,
  }] as any);

  if (error) {
    log.error("Failed to insert user flag", error);
  } else {
    log.warn("User flagged", {
      userId: input.userId,
      flagType: input.flagType,
      severity: input.severity,
    });
  }
}

/**
 * Check for rapid withdrawal attempts (>5 in 1 hour).
 */
export async function checkRapidWithdrawals(userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("wallet_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "withdrawal")
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= 5) {
    await flagUser({
      userId,
      flagType: "rapid_withdrawals",
      severity: "high",
      details: { count: count ?? 0, windowHours: 1 },
    });
    return true;
  }
  return false;
}

/**
 * Check for rapid escrow funding attempts (>10 in 1 hour).
 */
export async function checkRapidEscrowFunding(userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("wallet_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "escrow_deposit")
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= 10) {
    await flagUser({
      userId,
      flagType: "rapid_escrow_funding",
      severity: "high",
      details: { count: count ?? 0, windowHours: 1 },
    });
    return true;
  }
  return false;
}

/**
 * Check for excessive dispute creation (>3 in 24 hours).
 */
export async function checkExcessiveDisputes(userId: string): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("deal_rooms")
    .select("id", { count: "exact", head: true })
    .eq("status", "disputed")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .gte("updated_at", oneDayAgo);

  if ((count ?? 0) >= 3) {
    await flagUser({
      userId,
      flagType: "excessive_disputes",
      severity: "medium",
      details: { count: count ?? 0, windowHours: 24 },
    });
    return true;
  }
  return false;
}

/**
 * Run all suspicious activity checks for a user.
 */
export async function runSuspiciousActivityChecks(userId: string): Promise<string[]> {
  const flags: string[] = [];

  if (await checkRapidWithdrawals(userId)) flags.push("rapid_withdrawals");
  if (await checkRapidEscrowFunding(userId)) flags.push("rapid_escrow_funding");
  if (await checkExcessiveDisputes(userId)) flags.push("excessive_disputes");

  return flags;
}
