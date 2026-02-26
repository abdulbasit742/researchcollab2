/**
 * Audit Integrity — verifies completeness of audit trails for financial entities.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("auditIntegrity");

export interface AuditIntegrityResult {
  entityId: string;
  entityType: string;
  status: "complete" | "incomplete" | "error";
  missingActions: string[];
  message: string;
}

/**
 * Validate that a deal has a complete audit trail.
 * Expected actions for a funded deal: escrow_funded, (milestone_released)*, deal_completed
 */
export async function validateDealAuditTrail(dealId: string): Promise<AuditIntegrityResult> {
  try {
    const { data: deal, error: dealError } = await supabase
      .from("deal_rooms")
      .select("escrow_status, status")
      .eq("id", dealId)
      .single();

    if (dealError || !deal) {
      return {
        entityId: dealId,
        entityType: "deal",
        status: "error",
        missingActions: [],
        message: "Deal not found",
      };
    }

    // Check for wallet transactions referencing this deal
    const { data: txns, error: txnError } = await supabase
      .from("wallet_transactions")
      .select("type, status")
      .eq("reference_id", dealId)
      .eq("reference_type", "deal");

    if (txnError) {
      return {
        entityId: dealId,
        entityType: "deal",
        status: "error",
        missingActions: [],
        message: txnError.message,
      };
    }

    const txnTypes = (txns ?? []).map((t) => t.type);
    const missing: string[] = [];

    // If deal was funded, should have escrow_deposit transaction
    if (["funded", "active", "completed"].includes(deal.escrow_status ?? "")) {
      if (!txnTypes.includes("escrow_deposit")) {
        missing.push("escrow_deposit");
      }
    }

    // If deal was refunded, should have refund transaction
    if (deal.escrow_status === "refunded") {
      if (!txnTypes.includes("refund")) {
        missing.push("refund");
      }
    }

    return {
      entityId: dealId,
      entityType: "deal",
      status: missing.length > 0 ? "incomplete" : "complete",
      missingActions: missing,
      message: missing.length > 0
        ? `Missing audit entries: ${missing.join(", ")}`
        : "Audit trail complete",
    };
  } catch (err) {
    log.error("Audit trail validation failed", err);
    return {
      entityId: dealId,
      entityType: "deal",
      status: "error",
      missingActions: [],
      message: String(err),
    };
  }
}

/**
 * Validate wallet transaction consistency.
 */
export async function validateWalletIntegrity(userId: string): Promise<AuditIntegrityResult> {
  try {
    const { data: wallet, error: wErr } = await supabase
      .from("wallets")
      .select("id, available_balance, escrow_balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (wErr || !wallet) {
      return {
        entityId: userId,
        entityType: "wallet",
        status: "error",
        missingActions: [],
        message: "Wallet not found",
      };
    }

    const missing: string[] = [];

    if (wallet.available_balance < 0) {
      missing.push("negative_available_balance");
    }
    if (wallet.escrow_balance < 0) {
      missing.push("negative_escrow_balance");
    }

    return {
      entityId: userId,
      entityType: "wallet",
      status: missing.length > 0 ? "incomplete" : "complete",
      missingActions: missing,
      message: missing.length > 0
        ? `Integrity issues: ${missing.join(", ")}`
        : "Wallet integrity verified",
    };
  } catch (err) {
    log.error("Wallet integrity check failed", err);
    return {
      entityId: userId,
      entityType: "wallet",
      status: "error",
      missingActions: [],
      message: String(err),
    };
  }
}
